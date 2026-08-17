import type { DeviceStatus } from './device.js';

export type DeviceStateChangeSource = 'health-check' | 'scheduler' | 'system' | 'operator';

export interface DeviceStateTransition {
  deviceId: string;
  from: DeviceStatus;
  to: DeviceStatus;
  changedAt: string;
  reason: string;
  source: DeviceStateChangeSource;
  reservationId?: string;
}

export const allowedTransitions: Record<DeviceStatus, DeviceStatus[]> = {
  available: ['unhealthy', 'offline', 'maintenance'],
  reserved: ['available', 'unhealthy', 'offline', 'quarantined'],
  unhealthy: ['available', 'offline', 'maintenance', 'quarantined'],
  offline: ['available', 'maintenance'],
  quarantined: ['maintenance'],
  maintenance: ['available', 'unhealthy'],
};
