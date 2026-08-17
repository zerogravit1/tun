import type { CreateReservationRequest, DeviceReservation, ReservationStatus } from '../domain/device-reservation.js';
import { allowedReservationTransition } from '../domain/reservation-state-transition.js';

export class ReservationRegistry {
  private readonly reservations = new Map<string, DeviceReservation>();

  create(request: CreateReservationRequest): DeviceReservation {
    if (request.requestedBy === '' || request.requestedBy === undefined) {
      throw new Error(`a requestor must be provided`);
    }

    if (request.criteria === undefined) {
      throw new Error(`reservation criteria must be provided`);
    }

    if (request.quantity <= 0) {
      throw new Error(`requested device quantity must be at least 1`);
    }

    if (request.minimumQuantity <= 0) {
      throw new Error(`requested minimum device quantity must be at least 1`);
    }

    if (request.minimumQuantity > request.quantity) {
      throw new Error(`request minimum quantity cannot be greater than request quantity`);
    }

    const startsAt = new Date(request.startsAt);
    const expiresAt = new Date(request.expiresAt);

    if (Number.isNaN(startsAt.getTime())) {
      throw new Error(`invalid reservation startsAt: ${request.startsAt}`);
    }

    if (Number.isNaN(expiresAt.getTime())) {
      throw new Error(`invalid reservation expiresAt: ${request.expiresAt}`);
    }

    if (expiresAt <= startsAt) {
      throw new Error(`reservation expiresAt: ${request.expiresAt} cannot be before startsAt: ${request.startsAt}`);
    }

    if (request.priority === undefined) {
      throw new Error(`a priority must be assigned to a reservation.`);
    }

    const reservation: DeviceReservation = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      requestedBy: request.requestedBy,
      criteria: request.criteria,
      quantity: request.quantity,
      minimumQuantity: request.minimumQuantity,
      startsAt: request.startsAt,
      expiresAt: request.expiresAt,
      priority: request.priority,
      ...(request.reason !== undefined && {
        reason: request.reason,
      }),
      status: 'scheduled',
    };

    this.reservations.set(reservation.id, structuredClone(reservation));

    return structuredClone(reservation);
  }

  get(reservationId: string): DeviceReservation | undefined {
    const reservation = this.reservations.get(reservationId);
    return reservation ? structuredClone(reservation) : undefined;
  }

  list(): DeviceReservation[] {
    return [...this.reservations.values()].map((reservation) => structuredClone(reservation));
  }

  transitionStatus(reservationId: string, to: ReservationStatus): DeviceReservation {
    const reservation = this.requireReservation(reservationId);

    const from = reservation.status;

    if (!allowedReservationTransition[from].includes(to)) {
      throw new Error(`Cannot transition reservation ${reservationId} from: ${from} to: ${to}`);
    }

    reservation.status = to;

    return structuredClone(reservation);
  }

  refreshStatus(reservationId: string, now: Date): DeviceReservation {
    const reservation = this.requireReservation(reservationId);

    const startsAt = new Date(reservation.startsAt);
    const expiresAt = new Date(reservation.expiresAt);

    if (reservation.status === 'completed' || reservation.status === 'cancelled' || reservation.status === 'expired') {
      return structuredClone(reservation);
    }

    if (now >= expiresAt) {
      return this.transitionStatus(reservationId, 'expired');
    }

    if (reservation.status === 'scheduled' && now >= startsAt) {
      return this.transitionStatus(reservationId, 'active');
    }

    if (now >= expiresAt) {
      return this.transitionStatus(reservationId, 'expired');
    }

    if (reservation.status === 'scheduled' && now >= startsAt) {
      return this.transitionStatus(reservationId, 'active');
    }

    return structuredClone(reservation);
  }

  private requireReservation(reservationId: string): DeviceReservation {
    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw new Error(`Unknown reservation: ${reservationId}`);
    }

    return reservation;
  }
}
