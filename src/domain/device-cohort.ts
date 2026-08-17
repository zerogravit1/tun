import type { Codec, DeviceKind, HdrFormat, PerformanceClass, Resolution } from './device.js';

export interface DeviceCohort {
  id: string;
  criteria: DeviceCriteria;
}

export interface DeviceCriteria {
  platform?: string;
  kind?: DeviceKind;
  performanceClass?: PerformanceClass;
  resolution?: Resolution;
  hdr?: HdrFormat;
  codec?: Codec;
  games?: boolean;
  minimumMemoryMb?: number;
  requiredOperations?: string[];
}
