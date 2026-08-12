import { describe, expect, it } from 'vitest';
import type { Device } from '../src/domain/device.js';
import { DeviceRegistry } from '../src/registry/device-registry.js';

const device = (overrides: Partial<Device> = {}): Device => ({
  id: 'tv-001',
  kind: 'tv',
  platform: 'test-platform',
  model: 'reference',
  virtual: true,
  capabilities: {
    resolutions: ['1080p', '2160p'],
    hdr: true,
    codecs: ['h264', 'av1'],
    games: false,
    memoryMb: 1024,
  },
  supportedOperations: ['device/info', 'health-check/get'],
  status: 'available',
  consecutiveInfrastructureFailures: 0,
  ...overrides,
});

describe('DeviceRegistry', () => {
  it('finds an available device matching workload requirements', () => {
    const registry = new DeviceRegistry();
    registry.upsert(device());

    expect(
      registry.findAvailable({
        hdr: true,
        codec: 'av1',
        requiredOperations: ['health-check/get'],
      }),
    ).toHaveLength(1);
  });

  it('does not schedule a reserved device', () => {
    const registry = new DeviceRegistry();
    registry.upsert(device());

    registry.reserve('tv-001', 'run-123');

    expect(registry.findAvailable({ codec: 'av1' })).toHaveLength(0);
  });

  it('requires the reservation owner to release the device', () => {
    const registry = new DeviceRegistry();
    registry.upsert(device());
    registry.reserve('tv-001', 'run-123');

    expect(() => registry.release('tv-001', 'run-999')).toThrow(
      'Reservation run-999 does not own device tv-001',
    );

    expect(registry.release('tv-001', 'run-123').status).toBe('available');
  });

  it('removes quarantined devices from the available pool', () => {
    const registry = new DeviceRegistry();
    registry.upsert(device());

    registry.quarantine('tv-001');

    expect(registry.findAvailable({})).toHaveLength(0);
    expect(registry.get('tv-001')?.status).toBe('quarantined');
  });
});
