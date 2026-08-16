import { DeviceCriteria } from '../domain/device-cohort.js';
import { allowedTransitions, type DeviceStateChangeSource, type DeviceStateTransition } from '../domain/device-state-transition.js';
import type { Device, DeviceStatus } from '../domain/device.js';

export class DeviceRegistry {
  private readonly devices = new Map<string, Device>();

  upsert(device: Device): void {
    this.devices.set(device.id, structuredClone(device));
  }

  get(deviceId: string): Device | undefined {
    const device = this.devices.get(deviceId);
    return device ? structuredClone(device) : undefined;
  }

  list(): Device[] {
    return [...this.devices.values()].map((device) => structuredClone(device));
  }

  findAvailable(criteria: DeviceCriteria): Device[] {
    return this.find(criteria).filter(
      (device) => device.status === 'available'
    );
  }

  find(criteria: DeviceCriteria): Device[] {
    return this.list().filter((device) => {
      if (
        criteria.platform &&
        device.platform !== criteria.platform
      ) return false;

      if (
        criteria.kind &&
        device.kind !== criteria.kind
      ) return false;

      if (
        criteria.performanceClass &&
        device.performanceClass !== criteria.performanceClass
      ) return false;

      if (
        criteria.resolution &&
        !device.capabilities.resolutions.includes(criteria.resolution)
      ) return false;

      if (
        criteria.hdr &&
        !device.capabilities.hdrFormats.includes(criteria.hdr)
      ) return false;

      if (
        criteria.codec &&
        !device.capabilities.codecs.includes(criteria.codec)
      ) return false;

      if (
        criteria.games !== undefined &&
        device.capabilities.games !== criteria.games
      ) return false;

      if (
        criteria.minimumMemoryMb !== undefined &&
        (device.capabilities.memoryMb ?? 0) < criteria.minimumMemoryMb
      ) return false;

      if (
        criteria.requiredOperations &&
        !criteria.requiredOperations.every((operation) =>
          device.supportedOperations.includes(operation),
        )
      ) return false;

      return true;
    });
  }

  reserve(deviceId: string, reservationId: string): Device {
    const device = this.requireDevice(deviceId);

    if (device.status !== 'available') {
      throw new Error(`Device ${deviceId} is not available`);
    }

    device.status = 'reserved';
    device.reservedBy = reservationId;

    return structuredClone(device);
  }

  release(deviceId: string, reservationId: string): Device {
    const device = this.requireDevice(deviceId);

    if (device.status !== 'reserved' || device.reservedBy !== reservationId) {
      throw new Error(`Reservation ${reservationId} does not own device ${deviceId}`);
    }

    device.status = 'available';
    delete device.reservedBy;

    return structuredClone(device);
  }

  quarantine(deviceId: string): Device {
    const device = this.requireDevice(deviceId);

    device.status = 'quarantined';
    delete device.reservedBy;

    return structuredClone(device);
  }

  transitionStatus(
    deviceId: string,
    to: DeviceStatus,
    reason: string,
    source: DeviceStateChangeSource
  ): DeviceStateTransition {
    const device = this.requireDevice(deviceId);

    const from = device.status;

    if (!allowedTransitions[from].includes(to)) {
      throw new Error(`Cannot transition device ${deviceId} from ${from} to ${to}`);
    }

    device.status = to;

    return {
      deviceId,
      from,
      to,
      changedAt: new Date().toISOString(),
      reason,
      source,
    };
  }

  private requireDevice(deviceId: string): Device {
    const device = this.devices.get(deviceId);

    if (!device) {
      throw new Error(`Unknown device: ${deviceId}`);
    }

    return device;
  }
}
