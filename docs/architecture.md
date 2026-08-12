# Architecture

## System view

```text
                         +----------------+
                         | Developer / CI |
                         +--------+-------+
                                  |
                                  v
                         +----------------+
                         | Evaluation API |
                         +--------+-------+
                                  |
                                  v
                         +----------------+
                         |  Orchestrator  |
                         +--------+-------+
                                  |
                     +------------+------------+
                     |                         |
                     v                         v
              +-------------+          +-------------+
              |  Workload   |          |  Comparison |
              |   Planner   |          |   Engine    |
              +------+------+          +-------------+
                     |
                     v
              +-------------+
              |  Scheduler  |
              +------+------+
                     |
                     v
              +-------------+
              |   Device    |
              |  Registry   |
              +------+------+
                     |
                     v
              +-------------+
              | DAB Client  |
              +------+------+
                     |
                     v
                   MQTT
                     |
          +----------+-----------+
          |                      |
          v                      v
   Virtual DAB device     Physical / bridge
```

## Domain boundaries

### Evaluation

Represents the developer's intent.

An evaluation includes:

- candidate build/reference
- optional baseline
- change type
- evaluation mode
- desired coverage
- optional explicit constraints

### Workload planner

Converts evaluation intent into executable workload requirements.

Example:

```text
playback + benchmark
        |
        v
baseline + candidate
representative playback cohorts
telemetry required
controlled network profile
```

The planner should eventually decide when to escalate from virtual to physical coverage.

### Device registry

The registry describes what devices exist and Tun-specific operational state.

DAB may supply device identity, information, supported operations, and health. Tun enriches this with:

- availability
- reservation owner
- quarantine state
- cohort
- historical reliability
- last successful run
- utilization

### Scheduler

Chooses a compatible available device for a workload.

The initial scheduler can be deterministic and simple. Later strategies may consider:

- queue age
- capabilities
- device cohort
- health
- reliability
- utilization
- cost
- developer feedback latency

Maximum utilization is not necessarily the goal. Running the fleet at saturation can increase queue time and reduce developer velocity.

### DAB client

The DAB client is the standardized southbound device-control interface.

Tun should avoid leaking platform-specific control such as ADB or vendor-specific APIs above this boundary.

A physical platform lacking native DAB support can eventually be represented through a DAB bridge.

### Telemetry and analysis

Tun should retain enough evidence to answer:

- did the application fail?
- did the test/workload fail?
- did the device fail?
- did infrastructure fail?
- did candidate performance improve or regress relative to baseline?

## Baseline versus candidate

Comparison should be treated as a workload pattern rather than a report feature added afterward.

```text
                 Controlled workload
                        |
             +----------+----------+
             |                     |
             v                     v
        Baseline A             Candidate B
             |                     |
             +----------+----------+
                        |
                        v
                Cohort comparison
```

A comparison should preserve the device/cohort and environment dimensions so an overall improvement cannot hide a device-specific regression.

## Escalation model

A future execution strategy may use staged coverage:

```text
Virtual representative cohort
            |
            v
Targeted physical cohort
            |
            v
Expand affected device families
```

This is preferable to automatically running every workload against every device.
