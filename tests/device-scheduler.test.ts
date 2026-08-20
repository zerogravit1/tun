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

function addWebosDevice(deviceRegistry: DeviceRegistry, id = 'device-002') {
  deviceRegistry.upsert({
    id,
    kind: 'tv',
    platform: 'webos',
    model: 'test-webos',
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

function createReservation(reservationRegistry: ReservationRegistry, quantity = 3, minimumQuantity = 1) {
  return reservationRegistry.create({
    requestedBy: 'developer-a',
    criteria: {
      platform: 'roku',
    },
    quantity,
    minimumQuantity,
    startsAt: '2026-08-17T18:00:00Z',
    expiresAt: '2026-08-17T20:00:00Z',
    priority: 'normal',
  });
}

describe('DeviceScheduler', () => {
  it('schedules the requested quantity when enough devices are available', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry, 'roku-001');
    addRokuDevice(deviceRegistry, 'roku-002');
    addRokuDevice(deviceRegistry, 'roku-003');

    const reservation = createReservation(reservationRegistry, 3, 2);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    const leases = scheduler.schedule(reservation.id, 'developer-a');

    expect(leases).toHaveLength(3);
    expect(leases.map((lease) => lease.deviceId)).toEqual(['roku-001', 'roku-002', 'roku-003']);
  });

  it('schedules available devices when minimum quantity can be satisfied', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry, 'roku-001');
    addRokuDevice(deviceRegistry, 'roku-002');

    const reservation = createReservation(reservationRegistry, 3, 2);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    const leases = scheduler.schedule(reservation.id, 'developer-a');

    expect(leases).toHaveLength(2);
    expect(leases.map((lease) => lease.deviceId)).toEqual(['roku-001', 'roku-002']);
  });

  it('rejects scheduling when minimum quantity cannot be satisfied', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry, 'roku-001');

    const reservation = createReservation(reservationRegistry, 3, 2);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    expect(() => scheduler.schedule(reservation.id, 'developer-a')).toThrow(
      `Reservation ${reservation.id} requires at least 2 devices, but only 1 are available`,
    );

    expect(deviceRegistry.get('roku-001')?.status).toBe('available');
  });

  it('does not schedule more than the requested quantity', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry, 'roku-001');
    addRokuDevice(deviceRegistry, 'roku-002');
    addRokuDevice(deviceRegistry, 'roku-003');
    addRokuDevice(deviceRegistry, 'roku-004');

    const reservation = createReservation(reservationRegistry, 2, 1);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    const leases = scheduler.schedule(reservation.id, 'developer-a');

    expect(leases).toHaveLength(2);
    expect(leases.map((lease) => lease.deviceId)).toEqual(['roku-001', 'roku-002']);

    expect(deviceRegistry.get('roku-003')?.status).toBe('available');
    expect(deviceRegistry.get('roku-004')?.status).toBe('available');
  });
});
