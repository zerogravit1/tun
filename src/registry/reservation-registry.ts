import { CreateReservationRequest, DeviceReservation } from '../domain/device-reservation.js';
import { DeviceRegistry } from './device-registry.js';

export class ReservationRegistry {
  private readonly reservations = new Map<string, DeviceReservation>()

  create(request: CreateReservationRequest): DeviceReservation {
    const registry = new DeviceRegistry();

    if (request.minimumQuantity > request.quantity) {
      throw new Error(`Invalid minimum requested, quantity: ${request.quantity} must be greater than minimum: ${request.minimumQuantity}`);
    }

    if (registry.findAvailable(request.criteria).length === 0 || registry.findAvailable(request.criteria) === undefined) {
      throw new Error(`no devices available match request criteria: ${request.criteria}`);
    }
  }

  get(reservationId: string): DeviceReservation | undefined {
    const reservation = this.reservations.get(reservationId);
    return reservation ? structuredClone(reservation) : undefined;
  }

  list(): DeviceReservation[] {
    return [...this.reservations.values()].map((reservation) => structuredClone(reservation));
  }
}