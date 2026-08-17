import { describe, expect, it } from 'vitest';
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
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    expect(reservation.status).toBe('scheduled');
    expect(reservation.id).toBeDefined();

    expect(registry.get(reservation.id)).toEqual(reservation);
  });

  it('rejects a reservation quantity of zero', () => {
    const registry = new ReservationRegistry();

    expect(() =>
      registry.create({
        requestedBy: 'developer-a',
        criteria: {
          platform: 'roku',
        },
        quantity: 0,
        minimumQuantity: 2,
        startsAt: '2026-08-17T18:00:00Z',
        expiresAt: '2026-08-17T20:00:00Z',
        priority: 'normal',
      }),
    ).toThrow('requested device quantity must be at least 1');
  });

  it('rejects a reservation minimum quantity of zero', () => {
    const registry = new ReservationRegistry();

    expect(() =>
      registry.create({
        requestedBy: 'developer-a',
        criteria: {
          platform: 'roku',
        },
        quantity: 2,
        minimumQuantity: 0,
        startsAt: '2026-08-17T18:00:00Z',
        expiresAt: '2026-08-17T20:00:00Z',
        priority: 'normal',
      }),
    ).toThrow('requested minimum device quantity must be at least 1');
  });

  it('rejects a reservation minimum quantity greater than quantity', () => {
    const registry = new ReservationRegistry();

    expect(() =>
      registry.create({
        requestedBy: 'developer-a',
        criteria: {
          platform: 'roku',
        },
        quantity: 2,
        minimumQuantity: 3,
        startsAt: '2026-08-17T18:00:00Z',
        expiresAt: '2026-08-17T20:00:00Z',
        priority: 'normal',
      }),
    ).toThrow('request minimum quantity cannot be greater than request quantity');
  });

  it('rejects a reservation expiresAt is before startsAt', () => {
    const registry = new ReservationRegistry();

    const startsAt = '2026-08-17T20:00:00Z';
    const expiresAt = '2026-08-17T18:00:00Z';

    expect(() =>
      registry.create({
        requestedBy: 'developer-a',
        criteria: {
          platform: 'roku',
        },
        quantity: 2,
        minimumQuantity: 1,
        startsAt,
        expiresAt,
        priority: 'normal',
      }),
    ).toThrow(`reservation expiresAt: ${expiresAt} cannot be before startsAt: ${startsAt}`);
  });

  it('transitions a scheduled reservation to active', () => {
    const registry = new ReservationRegistry();

    const testReservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    const result = registry.transitionStatus(testReservation.id, 'active');

    expect(result.status).toBe('active');
    expect(registry.get(testReservation.id)?.status).toBe('active');
  });

  it('rejects a transition from scheduled to completed', () => {
    const registry = new ReservationRegistry();

    const testReservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    expect(() => registry.transitionStatus(testReservation.id, 'completed')).toThrow(
      `Cannot transition reservation ${testReservation.id} from: scheduled to: completed`,
    );
    expect(registry.get(testReservation.id)?.status).toBe('scheduled');
  });

  it('activates a scheduled reservation after its start time', () => {
    const registry = new ReservationRegistry();

    const reservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    const result = registry.refreshStatus(reservation.id, new Date('2026-08-17T19:00:00Z'));

    expect(result.status).toBe('active');
  });

  it('expires a scheduled reservation after its expiration time', () => {
    const registry = new ReservationRegistry();

    const reservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    const result = registry.refreshStatus(reservation.id, new Date('2026-08-17T21:00:00Z'));

    expect(result.status).toBe('expired');
  });

  it('keeps a reservation scheduled before start time', () => {
    const registry = new ReservationRegistry();

    const reservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    const result = registry.refreshStatus(reservation.id, new Date('2026-08-17T17:00:00Z'));

    expect(result.status).toBe('scheduled');
  });

  it('keeps an active reservation active before it expiration time', () => {
    const registry = new ReservationRegistry();

    const reservation = registry.create({
      requestedBy: 'developer-a',
      criteria: {
        platform: 'roku',
      },
      quantity: 4,
      minimumQuantity: 3,
      startsAt: '2026-08-17T18:00:00Z',
      expiresAt: '2026-08-17T20:00:00Z',
      priority: 'normal',
    });

    registry.transitionStatus(reservation.id, 'active');

    const result = registry.refreshStatus(reservation.id, new Date('2026-08-17T19:30:00Z'));

    expect(result.status).toBe('active');
  });
});
