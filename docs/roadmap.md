# Roadmap

The roadmap is deliberately incremental. Each phase should produce something observable before moving on.

## Phase 0 — Project foundation

- TypeScript project
- core domain types
- in-memory device registry
- unit tests for device reservation and quarantine
- architecture and project context

## Phase 1 — Virtual fleet

- represent 10–20 virtual devices
- device cohorts and capabilities
- health state changes
- reservations / leases
- scheduler selects compatible available device
- deterministic simulated failures

Success condition:

> A workload can request capabilities and receive an appropriate healthy virtual device without knowing a specific device ID.

## Phase 2 — DAB + MQTT

- local MQTT broker for development
- DAB discovery
- `device/info`
- `operations/list`
- `health-check/get`
- virtual devices expose a DAB-compatible surface
- registry populated from DAB discovery rather than hard-coded data

Success condition:

> Tun can discover multiple virtual DAB devices and maintain the same registry used by Phase 1.

## Phase 3 — Device lifecycle

- application launch/state/exit
- input/key operations
- screenshot/evidence capture
- recovery behavior
- automatic quarantine after repeated infrastructure/device failures

Success condition:

> Tun can differentiate workload failure from unusable-device failure and keep bad devices out of the scheduling pool.

## Phase 4 — Telemetry

- CPU and memory telemetry
- workload timing
- queue time
- reservation time
- device utilization
- recovery frequency
- failure classification
- basic alerts or thresholds

Success condition:

> A run produces operational evidence, not just pass/fail.

## Phase 5 — Comparative evaluation

- baseline and candidate execution
- cohort-aware comparison
- deltas and regression thresholds
- UI/playback/runtime workload profiles
- developer-oriented summary

Success condition:

> A developer can ask whether a candidate improved or degraded behavior and see which device cohorts changed.

## Phase 6 — Developer interface

Start with an API/CLI before building a web UI.

Potential request:

```text
tun evaluate \
  --type playback \
  --candidate pr-12894 \
  --baseline main \
  --mode benchmark \
  --coverage recommended
```

The output should emphasize decisions and deltas rather than raw test counts.

## Phase 7 — Real device adapter

- Android TV emulator or physical Android TV device
- DAB-native endpoint or DAB-to-ADB bridge
- demonstrate that Tun orchestration does not need device-specific changes

## Deferred

Do not build these until the earlier phases justify them:

- complex web dashboard
- persistent database
- distributed scheduler
- Kubernetes
- AI agent
- production A/B experimentation system
- broad vendor-specific device integrations
- exhaustive DAB implementation
