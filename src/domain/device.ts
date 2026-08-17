export type DeviceStatus = 'available' | 'reserved' | 'offline' | 'unhealthy' | 'quarantined' | 'maintenance';

export type DeviceKind = 'tv' | 'set-top-box' | 'streaming-stick' | 'game-console' | 'browser';

export type PerformanceClass = 'low' | 'mid' | 'high';

export type Resolution = '720p' | '1080p' | '2160p' | '4320p';

export type Codec = 'h264' | 'hevc' | 'av1' | 'vp9';

export type HdrFormat = 'hdr10' | 'hdr10+' | 'dolby-vision';

export interface DeviceCapabilities {
  resolutions: Resolution[];
  hdrFormats: HdrFormat[];
  codecs: Codec[];
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
