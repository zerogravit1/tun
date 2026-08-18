import { describe, expect, it } from 'vitest';
import { ReservationRegistry } from '../src/registry/reservation-registry.js';
import { LeaseRegistry } from '../src/registry/lease=registry.js';
import { DeviceRegistry } from '../src/registry/device-registry.js';

describe('DeviceLease', () => {
  it('creates a device lease', () => {
    const deviceRegistry = new DeviceRegistry()
    const reservationRegistry = new ReservationRegistry();
    const leaseRegistry = new LeaseRegistry(reservationRegistry, deviceRegistry);

    const reservation = reservationRegistry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 3,
      minimumQuantity: 2,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    deviceRegistry.upsert({
      id: 'device-001',
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
        memoryMb: 2048
      },
      supportedOperations: [],
      status: 'available',
      consecutiveInfrastructureFailures: 0,
    })

    reservationRegistry.transitionStatus(
      reservation.id,
      'active',
    );

    const lease = leaseRegistry.acquire(
      reservation.id,
      'device-001',
      'developer-a',
    );

    expect(lease.id).toBeDefined();
    expect(lease.reservationId).toBe(reservation.id);
    expect(lease.deviceId).toBe('device-001');
    expect(lease.acquiredBy).toBe('developer-a');
    expect(lease.acquiredAt).toBeDefined()
    expect(lease.releasedAt).toBeUndefined();
  });
});