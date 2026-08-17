import { ReservationStatus } from './device-reservation.js';

export const allowedReservationTransition: Record<ReservationStatus, ReservationStatus[]> = {
  scheduled: ['active', 'cancelled', 'expired'],
  active: ['completed', 'cancelled', 'expired'],
  expired: [],
  completed: [],
  cancelled: [],
};
