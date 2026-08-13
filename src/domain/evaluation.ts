import { Codec, HdrFormats } from "./device.js";

export type ChangeType =
  | 'ui'
  | 'playback'
  | 'runtime'
  | 'game'
  | 'performance'
  | 'other';

export type EvaluationMode =
  | 'regression'
  | 'benchmark'
  | 'experiment-validation';

export type CoverageLevel =
  | 'recommended'
  | 'extended'
  | 'custom';

export interface EvaluationRequest {
  id: string;
  changeType: ChangeType;
  mode: EvaluationMode;
  candidate: string;
  baseline?: string;
  coverage: CoverageLevel;
}

export interface WorkloadRequirements {
  platform?: string;
  hdr?: HdrFormats;
  codec?: Codec;
  games?: boolean;
  minimumMemoryMb?: number;
  requiredOperations?: string[];
}
