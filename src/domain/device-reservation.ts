import { DeviceCriteria } from "./device-cohort.js";

export type ReservationStatus =
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'completed'
  | 'cancelled';

export type ReservationPriority =
  | 'critical'
  | 'high'
  | 'normal'
  | 'background';

export interface DeviceReservation {
  id: string;
  requestedBy: string;

  criteria: DeviceCriteria;

  quantity: number;
  minimumQuantity: number;
  
  startsAt: string;
  expiresAt: string;
  
  priority: ReservationPriority;
  reasom?: string;

  status: ReservationStatus;
}

export interface DeviceLease {
  id: string;

  reservationId?: string;
  deviceId: string;

  acquiredBy: string;
  acquiredAt: string;

  releasedAt?: string;
}