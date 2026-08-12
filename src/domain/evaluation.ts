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
  hdr?: boolean;
  codec?: string;
  games?: boolean;
  minimumMemoryMb?: number;
  requiredOperations?: string[];
}
