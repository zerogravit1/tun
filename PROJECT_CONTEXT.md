# Tun Project Context

## Why Tun exists

Tun began as an exploration of the responsibilities described in a Netflix Partner Test Technology engineering role: device automation and infrastructure, heterogeneous consumer-electronics fleets, real-time telemetry, developer velocity, test efficiency, and cost-aware quality.

The goal is not to reproduce Netflix infrastructure. The goal is to build a small but credible platform that forces the same categories of engineering decisions.

## Prior experience informing the project

The project is grounded in prior hands-on device testing experience:

- building and installing applications through a pipeline
- creating a Jenkins-based execution environment for device automation
- working with a severely resource-constrained setup where build and execution time made the system economically unattractive

That experience motivates an important Tun principle:

> A device test is not cheap merely because the test body is short.

Provisioning, build installation, reservation, startup, execution, evidence collection, recovery, and queue time all contribute to the real cost.

## Product principles

### 1. Start with the developer's question

The primary API should express the type of change and desired evaluation, rather than expose the mechanics of the device lab.

Examples:

- UI change: validate web and TV behavior
- playback optimization: compare baseline and candidate across representative device cohorts
- game/runtime change: evaluate latency, frame behavior, resource usage, and stability
- targeted defect: explicitly evaluate a known device/model cohort

### 2. Use representative coverage, not everything × everything

Device selection should eventually consider:

- required capabilities
- change risk
- device family/model/firmware
- historical failures
- available capacity
- execution cost
- virtual versus physical suitability

The question is:

> What is the smallest amount of testing that gives enough information to make the next decision?

### 3. Comparison is a first-class feature

A candidate may improve some devices and degrade others.

Tun should make baseline-versus-candidate comparison easy and return deltas by device cohort rather than reducing everything to pass/fail.

Potential playback metrics include:

- startup / time to first frame
- rebuffer events and duration
- bitrate / quality transitions
- dropped frames
- CPU
- memory
- network usage
- crashes and errors

### 4. Separate technical evaluation from production experimentation

Tun can determine:

> Is treatment B technically safe enough to expose?

A production experimentation platform determines:

> Does treatment B improve the member or business outcome?

Tun may evaluate multiple treatments, but it does not own member assignment, experiment statistics, or product decisioning.

### 5. DAB is the device boundary, not the entire platform

Device Automation Bus (DAB) standardizes communication with living-room devices over MQTT.

DAB responsibilities include device discovery and device operations.

Tun responsibilities include:

- inventory enrichment
- scheduling
- reservations / leases
- workload planning
- CI integration
- resource optimization
- historical reliability
- quarantine
- failure classification
- analysis and comparison
- developer-facing results

### 6. Virtual first, physical later

A virtual farm lets the control-plane design mature without requiring expensive hardware.

The virtual devices should ultimately behave like DAB endpoints so that a later physical-device adapter does not force the orchestration layer to change.

## Workloads

Initial workload categories:

- `ui`
- `playback`
- `runtime`
- `game`
- `performance`
- `stress`

Initial evaluation modes:

- `regression`
- `benchmark`
- `experiment-validation`

## Device failure categories

Tun should eventually distinguish:

- `APPLICATION_FAILURE`
- `TEST_FAILURE`
- `DEVICE_FAILURE`
- `INFRASTRUCTURE_FAILURE`
- `NETWORK_FAILURE`
- `UNKNOWN`

A retry is not the same as recovery. Recovery restores a resource to a known usable state; retry repeats work after the platform decides repetition is justified.

## Game considerations

TV-delivered games introduce additional quality dimensions beyond passive playback:

- input-to-screen latency
- frame pacing / jitter
- dropped frames
- controller pairing and reconnection
- multiple controller/player coordination
- network degradation
- session stability
- decode/display compatibility

Do not assume that every TV locally renders a console-class workload. The architecture should remain neutral about where rendering occurs and focus on observable experience and device/platform behavior.

## Scope guardrails

Do not add functionality merely because a complete device lab might eventually need it.

Prefer:

1. a small, explicit domain model
2. a virtual implementation
3. measurable behavior
4. one new responsibility at a time

The first useful system is more valuable than a prematurely complete architecture.
