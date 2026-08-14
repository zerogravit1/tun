import type { Device } from '../domain/device.js';
import type { WorkloadRequirements } from '../domain/evaluation.js';

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

  findAvailable(requirements: WorkloadRequirements): Device[] {
    return this.list().filter((device) => {
      if (device.status !== 'available') return false;
      
      if (
        requirements.platform &&
        device.platform !== requirements.platform
      ) return false;

      if (
        requirements.hdr &&
        !device.capabilities.hdrFormats.includes(requirements.hdr)
      ) return false;

      if (
        requirements.codec &&
        !device.capabilities.codecs.includes(requirements.codec)
      ) return false;

      if (
        requirements.games !== undefined &&
        device.capabilities.games !== requirements.games
      ) return false;

      if (
        requirements.minimumMemoryMb !== undefined &&
        (device.capabilities.memoryMb ?? 0) < requirements.minimumMemoryMb
      ) {
        return false;
      }

      if (
        requirements.requiredOperations &&
        !requirements.requiredOperations.every((operation) =>
          device.supportedOperations.includes(operation),
        )
      ) {
        return false;
      }

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

  private requireDevice(deviceId: string): Device {
    const device = this.devices.get(deviceId);

    if (!device) {
      throw new Error(`Unknown device: ${deviceId}`);
    }

    return device;
  }
}
