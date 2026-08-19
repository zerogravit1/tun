import { describe, expect, it } from 'vitest';
import { ReservationRegistry } from '../src/registry/reservation-registry.js';
import { LeaseRegistry } from '../src/registry/lease-registry.js';
import { DeviceRegistry } from '../src/registry/device-registry.js';
import { DeviceScheduler } from '../src/scheduler/device-scheduler.js';

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

describe('DeviceScheduler', () => {
  it('schedules a device', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry);

    const reservation = createReservation(reservationRegistry);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const lease = leaseRegistry.acquire(reservation.id, 'device-001', 'developer-a');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    expect(scheduler.schedule(reservation.id, lease.acquiredBy)).toBe('dasda');
  });
});