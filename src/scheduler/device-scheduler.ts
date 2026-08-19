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

  schedule(
    reservationId: string,
    acquiredBy: string,
  ): DeviceLease {
    const reservation = this.reservationRegistry.get(reservationId);

    if (!reservation) {
      throw new Error(`Unknown reservation: ${reservationId}`);
    }

    const devices = this.deviceRegistry.findAvailable(reservation.criteria);

    const device = devices[0];

    if (!device) {
      throw new Error(`No devices available for reservation ${reservationId}`);
    }

    return this.leaseRegistry.acquire(
      reservation.id,
      device.id,
      acquiredBy,
    );
  }
}