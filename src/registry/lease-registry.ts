import { DeviceLease } from '../domain/device-reservation.js';
import { DeviceRegistry } from './device-registry.js';
import { ReservationRegistry } from './reservation-registry.js';

export class LeaseRegistry {
  constructor(
    private readonly reservationRegistry: ReservationRegistry,
    private readonly deviceRegistry: DeviceRegistry,
  ) {}
  private readonly leases = new Map<string, DeviceLease>();

  get(leaseId: string): DeviceLease | undefined {
    const lease = this.leases.get(leaseId);

    return lease ? structuredClone(lease) : undefined;
  }

  acquire(reservationId: string, deviceId: string, acquiredBy: string): DeviceLease {
    const reservation = this.reservationRegistry.get(reservationId);

    if (!reservation) {
      throw new Error(`Unknown reservation: ${reservationId}`);
    }

    if (reservation.status !== 'active') {
      throw new Error(`Reservation ${reservationId} must be active to acquire a lease`);
    }

    const device = this.deviceRegistry.get(deviceId);

    if (!device) {
      throw new Error(`Unknown device: ${deviceId}`);
    }

    const availableMatchingDevices = this.deviceRegistry.findAvailable(reservation.criteria);

    const deviceCanBeLeased = availableMatchingDevices.some((candidate) => candidate.id === deviceId);

    if (!deviceCanBeLeased) {
      throw new Error(`Device ${deviceId} is not available for reservation ${reservationId}`);
    }

    const activeLeases = [...this.leases.values()].filter(
      (lease) => lease.reservationId === reservationId && lease.releasedAt === undefined,
    );

    if (activeLeases.length >= reservation.quantity) {
      throw new Error(`Reservation ${reservationId} has reached its device quantity of ${reservation.quantity}`);
    }

    const lease: DeviceLease = {
      id: crypto.randomUUID(),
      reservationId,
      deviceId,
      acquiredBy,
      acquiredAt: new Date().toISOString(),
    };

    this.deviceRegistry.reserve(deviceId, lease.id);

    this.leases.set(lease.id, structuredClone(lease));

    return structuredClone(lease);
  }
}
