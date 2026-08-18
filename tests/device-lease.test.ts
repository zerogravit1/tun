import { describe, expect, it } from 'vitest';
import { ReservationRegistry } from '../src/registry/reservation-registry.js';
import { LeaseRegistry } from '../src/registry/lease-registry.js';
import { DeviceRegistry } from '../src/registry/device-registry.js';

function createLeaseTestContext() {
  const deviceRegistry = new DeviceRegistry();
  const reservationRegistry = new ReservationRegistry();
  const leaseRegistry = new LeaseRegistry(reservationRegistry, deviceRegistry);

  return {
    deviceRegistry,
    reservationRegistry,
    leaseRegistry,
  };
}

function addRokuDevice(deviceRegistry: DeviceRegistry, id = 'device-001') {
  deviceRegistry.upsert({
    id,
    kind: 'set-top-box',
    platform: 'roku',
    model: 'test-roku',
    virtual: true,
    performanceClass: 'mid',
    capabilities: {
      resolutions: ['1080p'],
      hdrFormats: [],
      codecs: ['h264'],
      games: false,
      memoryMb: 2048,
    },
    supportedOperations: [],
    status: 'available',
    consecutiveInfrastructureFailures: 0,
  });
}

function createReservation(reservationRegistry: ReservationRegistry, quantity = 3) {
  return reservationRegistry.create({
    requestedBy: 'developer-a',
    criteria: {
      platform: 'roku',
    },
    quantity,
    minimumQuantity: 1,
    startsAt: '2026-08-17T18:00:00Z',
    expiresAt: '2026-08-17T20:00:00Z',
    priority: 'normal',
  });
}

describe('DeviceLease', () => {
  it('creates a device lease', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry);

    const reservation = createReservation(reservationRegistry);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const lease = leaseRegistry.acquire(reservation.id, 'device-001', 'developer-a');

    expect(lease.id).toBeDefined();
    expect(lease.reservationId).toBe(reservation.id);
    expect(lease.deviceId).toBe('device-001');
    expect(leaseRegistry.get(lease.id)).toEqual(lease);

    const device = deviceRegistry.get('device-001');

    expect(device?.status).toBe('reserved');
    expect(device?.reservedBy).toBe(lease.id);
  });

  it('rejects lease acquisition for an inactive reservation', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry);

    const reservation = createReservation(reservationRegistry);

    expect(() => leaseRegistry.acquire(reservation.id, 'device-001', 'developer-a')).toThrow(
      `Reservation ${reservation.id} must be active to acquire a lease`,
    );
  });

  it('rejects a lease when reservation quantity is reached', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry, 'device-001');
    addRokuDevice(deviceRegistry, 'device-002');

    const reservation = createReservation(reservationRegistry, 1);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    leaseRegistry.acquire(reservation.id, 'device-001', 'developer-a');

    expect(() => leaseRegistry.acquire(reservation.id, 'device-002', 'developer-a')).toThrow(
      `Reservation ${reservation.id} has reached its device quantity of 1`,
    );
  });
});
