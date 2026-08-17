import type { CreateReservationRequest, DeviceReservation } from '../domain/device-reservation.js';

export class ReservationRegistry {
  private readonly reservations = new Map<string, DeviceReservation>()

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

    const startsAt = new Date(request.startsAt)
    const expiresAt = new Date(request.expiresAt);

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
        reason: request.reason
      }),
      status: 'scheduled'
    }

    this.reservations.set(
      reservation.id,
      structuredClone(reservation),
    );

    return structuredClone(reservation);
  }

  get(reservationId: string): DeviceReservation | undefined {
    const reservation = this.reservations.get(reservationId);
    return reservation ? structuredClone(reservation) : undefined;
  }

  list(): DeviceReservation[] {
    return [...this.reservations.values()].map((reservation) => structuredClone(reservation));
  }
}