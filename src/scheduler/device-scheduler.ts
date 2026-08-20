import type { DeviceLease } from '../domain/device-reservation.js';
import { DeviceRegistry } from '../registry/device-registry.js';
import { LeaseRegistry } from '../registry/lease-registry.js';
import { ReservationRegistry } from '../registry/reservation-registry.js';

export class DeviceScheduler {
  constructor(
    private readonly reservationRegistry: ReservationRegistry,
    private readonly deviceRegistry: DeviceRegistry,
    private readonly leaseRegistry: LeaseRegistry,
  ) {}

  schedule(reservationId: string, acquiredBy: string): DeviceLease[] {
    const reservation = this.reservationRegistry.get(reservationId);

    if (!reservation) {
      throw new Error(`Unknown reservation: ${reservationId}`);
    }

    const devices = this.deviceRegistry.findAvailable(reservation.criteria);

    const devicesToLease = devices.slice(0, reservation.quantity);

    if (devicesToLease.length < reservation.minimumQuantity) {
      throw new Error(
        `Reservation ${reservationId} requires at least ` +
        `${reservation.minimumQuantity} devices, but only ` +
        `${devicesToLease.length} are available`,
      );
    }

    return devicesToLease.map((device) =>
      this.leaseRegistry.acquire(
        reservation.id,
        device.id,
        acquiredBy,
      )
    );
  }
}
