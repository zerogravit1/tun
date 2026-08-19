# Tun

Tun is an experimental **device-quality platform** for evaluating software changes across heterogeneous living-room devices.

The project is developer-first: a developer describes **what changed** and **what they need to learn**, and Tun determines an appropriate workload, device cohort, execution strategy, and comparison.

## Core idea

A developer should not need to think:

> Which 37 televisions should I run these tests on?

They should be able to ask:

> I changed the playback algorithm. Is the candidate better than the baseline, and did any device cohort regress?

Tun translates that intent into device selection, execution, telemetry, comparison, and actionable feedback.

## Initial evaluation modes

- **Regression** — Did this change break anything?
- **Benchmark** — Is the candidate technically better or worse than a baseline?
- **Experiment validation** — Are candidate treatments technically safe enough to expose to a production experiment?

Product A/B experimentation is deliberately outside Tun's scope. Tun establishes technical safety and comparative performance; a production experimentation platform determines member/business impact.

## Architectural boundary

**DAB controls the device. Tun controls the fleet and the evaluation.**

```text
Developer / CI
      |
      v
Evaluation Request
      |
      v
+------------------+
| Tun Orchestrator |
+------------------+
      |
      +--> Workload planning
      +--> Device selection
      +--> Scheduling / leases
      +--> Comparison
      +--> Metrics / analysis
      |
      v
+------------------+
|    DAB Client    |
+------------------+
      |
      v
   MQTT / DAB
      |
+-----+-------------------+
|                         |
Virtual DAB Device    Physical / bridged device
```

Tun owns scheduling, reservations, test selection, historical reliability, quarantine, failure classification, developer feedback, and execution cost.

DAB owns standardized interaction with the device: discovery, device information, application lifecycle, input, health, telemetry, screenshots, logs, and related operations.

## First milestone

Build a small virtual device farm that can:

1. discover virtual DAB devices
2. maintain a fleet registry
3. select a compatible device for a workload
4. reserve and release devices
5. identify unhealthy devices and quarantine them
6. collect basic telemetry
7. execute baseline-versus-candidate evaluations by device cohort

A real Android TV emulator or physical-device bridge comes later, after the virtual control plane is useful.

## Development

```bash
npm install
npm run typecheck
npm test
npm run dev
```

## Example

This shows a list of devices, then a reservation is made and the updated table.

```bash
npm run example
```

See:

- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/roadmap.md`](docs/roadmap.md)
