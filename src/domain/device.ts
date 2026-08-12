export type DeviceStatus =
  | 'available'
  | 'reserved'
  | 'offline'
  | 'unhealthy'
  | 'quarantined'
  | 'maintenance';

export type DeviceKind =
  | 'tv'
  | 'set-top-box'
  | 'streaming-stick'
  | 'game-console'
  | 'virtual';

export type PerformanceClass =
  | 'low'
  | 'mid'
  | 'high';

export interface DeviceCapabilities {
  resolutions: string[];
  hdr: boolean;
  codecs: string[];
  games: boolean;
  memoryMb?: number;
}

export interface Device {
  id: string;
  kind: DeviceKind;
  platform: string;
  model: string;
  firmware?: string;
  virtual: boolean;
  performanceClass: PerformanceClass;
  capabilities: DeviceCapabilities;
  supportedOperations: string[];
  status: DeviceStatus;
  reservedBy?: string;
  consecutiveInfrastructureFailures: number;
}
