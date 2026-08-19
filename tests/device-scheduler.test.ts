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
  it('schedules an available matching device', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addRokuDevice(deviceRegistry);

    const reservation = createReservation(reservationRegistry);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    const lease = scheduler.schedule(reservation.id, 'developer-a');

    expect(lease.deviceId).toBe('device-001');
    expect(lease.reservationId).toBe(reservation.id);
    expect(lease.acquiredBy).toBe('developer-a');

    const device = deviceRegistry.get('device-001');

    expect(device?.status).toBe('reserved');
    expect(device?.reservedBy).toBe(lease.id);
  });

  it('schedules an available matching platform', () => {
    const { deviceRegistry, reservationRegistry, leaseRegistry } = createLeaseTestContext();

    addWebosDevice(deviceRegistry, 'device-001');
    addRokuDevice(deviceRegistry, 'device-002');

    const reservation = createReservation(reservationRegistry);

    reservationRegistry.transitionStatus(reservation.id, 'active');

    const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

    const lease = scheduler.schedule(reservation.id, 'developer-a');

    expect(lease.deviceId).toBe('device-002');
    expect(lease.reservationId).toBe(reservation.id);
    expect(lease.acquiredBy).toBe('developer-a');

    const webosDevice = deviceRegistry.get('device-001');
    const rokuDevice = deviceRegistry.get('device-002');

    expect(webosDevice?.status).toBe('available');

    expect(rokuDevice?.status).toBe('reserved');
    expect(rokuDevice?.reservedBy).toBe(lease.id);
  });
});
