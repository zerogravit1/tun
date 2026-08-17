import { describe, expect, it } from 'vitest'
import { ReservationRegistry } from '../src/registry/reservation-registry.js';

describe('DeviceReservation', () => {
  it('creates a scheduled reservation', () => {
    const registry = new ReservationRegistry();

    const reservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 3,
      minimumQuantity: 2,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2-26-08-17T20:00:00Z',
      priority: 'normal',
    });

    expect(reservation.status).toBe('scheduled');
    expect(reservation.id).toBeDefined();

    expect(registry.get(reservation.id)).toEqual(reservation)
  });
});