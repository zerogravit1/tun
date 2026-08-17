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

## Phase 4 — Telemetry and reporting

- CPU and memory telemetry
- workload timing
- queue time
- reservation time
- device utilization
- recovery frequency
- failure classification
- basic alerts or thresholds
- expose operational and evaluation metrics to Grafana
- use Grafana dashboards for fleet health, utilization, queue behavior, reservation activity, failures, and performance trends

Grafana is the planned reporting and observability surface for Tun. Tun should own the domain data and metrics; Grafana should visualize and alert on them rather than duplicating scheduling or reservation business logic.

Success condition:

> A run produces operational evidence, not just pass/fail, and Tun metrics can be explored through Grafana.

## Phase 5 — Comparative evaluation

- baseline and candidate execution
- cohort-aware comparison
- deltas and regression thresholds
- UI/playback/runtime workload profiles
- developer-oriented summary

Success condition:

> A developer can ask whether a candidate improved or degraded behavior and see which device cohorts changed.

## Phase 6 — Developer interface

Start with an API/CLI so reservation, scheduling, and evaluation behavior is available to automation before building a web UI.

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

A developer-facing Tun web interface is a planned product surface for managing intent and inventory interaction. It should eventually support:

- fleet and device health visibility
- cohort and reusable device-selection profiles
- reservation creation, cancellation, priority, quantity, and time windows
- active leases and queue visibility
- reservation conflicts, partial fulfillment, and future substitution decisions
- links or embedded navigation to Grafana reporting where appropriate

CI should consume Tun through the same API rather than duplicating reservation or scheduling logic. A pipeline may reference a reusable reservation/profile or create an ad hoc reservation for a specific run.

Conceptually:

```text
Developer / Tun Web UI
        ↓
Tun API
        ↓
reservation / scheduling / lease logic
        ↓
CI workload execution
        ↓
metrics and evaluation results
        ↓
Grafana reporting
```

The web UI should express developer intent; authorization, quota, priority, reservation, scheduling, and lease rules should remain backend/domain responsibilities.

## Phase 7 — Real device adapter

- Android TV emulator or physical Android TV device
- DAB-native endpoint or DAB-to-ADB bridge
- demonstrate that Tun orchestration does not need device-specific changes

## Deferred design directions

These ideas are intentionally captured now without expanding Phase 1 scope.

### Hardware and performance profiles

Avoid treating `slow` as a device status. Operational status should answer whether Tun can use a device now; performance describes how the device behaves.

A future device model should separate durable hardware characteristics from measured performance. Potential hardware dimensions include:

- manufacturer, model, and model year
- chipset, CPU, GPU, and memory
- hardware and board revision
- manufacture date or batch
- firmware / platform version

A future `DevicePerformanceProfile` may include:

- coarse performance class such as `low | mid | high`
- CPU / GPU benchmark scores
- launch baseline
- playback startup baseline
- timestamp of the most recent benchmark

This separation should allow Tun to identify regressions associated with a particular chipset, hardware revision, manufacturing cohort, or other low-level characteristic even when consumer-facing model names are identical.

### Derived device cohorts

Cohorts should eventually be derived from device attributes rather than maintained only as static device lists.

Examples include:

- manufacturer + model + model year
- chipset + hardware revision
- manufacture month / batch
- firmware version
- memory tier
- performance class

The scheduler and comparison engine should be able to use these cohorts both for representative device selection and for identifying regressions hidden by fleet-wide averages.

### Software and configuration provenance

The hardware device alone may not explain the experience under test. Tun should eventually capture where the running behavior came from, including dimensions such as:

- installed application build / version
- client runtime or SDK version
- firmware / OS version
- server-driven UI schema, bundle, or configuration revision when observable
- feature flags
- experiment / treatment assignment
- device-specific renderer or implementation version when observable

The goal is to distinguish failures caused by hardware from those caused by a particular client implementation, software build, server-provided configuration, or combination of these factors.

### Immutable execution context

Each evaluation result should eventually retain a snapshot of the environment that produced it instead of relying only on the device's current state.

This execution context should make historical results explainable and reproducible after firmware, app versions, UI configuration, feature flags, or experiment assignments have changed.

Conceptually, Tun should be able to answer:

> What combination of hardware, software, configuration, and measured performance produced this result?

These directions are expected to become more concrete during the telemetry and comparative-evaluation phases rather than being fully implemented in the initial virtual-fleet work.

## Deferred

Do not build these until the earlier phases justify them:

- complex custom analytics dashboard beyond the planned Tun management UI and Grafana reporting
- persistent database
- distributed scheduler
- Kubernetes
- AI agent
- production A/B experimentation system
- broad vendor-specific device integrations
- exhaustive DAB implementation
