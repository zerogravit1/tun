import { describe, expect, it } from 'vitest';
import type { Device } from '../src/domain/device.js';
import { DeviceRegistry } from '../src/registry/device-registry.js';

import { virtualFleet } from '../src/fleet/virtual-fleet.js';

const device = (overrides: Partial<Device> = {}): Device => ({
  id: 'tv-001',
  kind: 'tv',
  platform: 'test-platform',
  model: 'reference',
  virtual: true,
  performanceClass: 'mid',
  capabilities: {
    resolutions: ['1080p', '2160p'],
    hdrFormats: ['hdr10'],
    codecs: ['h264', 'av1'],
    games: false,
    memoryMb: 1536,
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
        hdr: 'hdr10',
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

  it('finds a device from the virtual fleet', () => {
    const registry = new DeviceRegistry()

    for (const device of virtualFleet) {
      registry.upsert(device);
    }

    expect(registry.findAvailable({ codec: 'av1' }).length).toBeGreaterThan(0);
    expect(registry.findAvailable({ hdr: 'dolby-vision'}).length).toBeGreaterThan(0);
    expect(registry.findAvailable({
      platform: 'roku',
      hdr: 'dolby-vision',
      codec: 'av1'
    })).toHaveLength(1);
  });

  it('finds a device matching gaming requirementts', () => {
    const registry = new DeviceRegistry();

    registry.upsert(
      device({
        capabilities: {
          resolutions: ['1080p', '2160p'],
          hdrFormats: ['hdr10'],
          codecs: ['h264', 'av1'],
          games: true,
          memoryMb: 1536
        },
      }),
    );

    expect(
      registry.findAvailable({
        games: true,
      }),
    ).toHaveLength(1);
  });

  it('finds a device matching non-gaming requirements', () => {
    const registry = new DeviceRegistry();

    registry.upsert(device({
      id: 'non-gaming-tv',
      capabilities: {
        resolutions: ['1080p'],
        hdrFormats: [],
        codecs: ['h264'],
        games: false,
        memoryMb: 1024
      }
    }));

    registry.upsert(device({
      id: 'gaming-tv',
      capabilities: {
        resolutions: ['1080p'],
        hdrFormats: [],
        codecs: ['h264'],
        games: true,
        memoryMb: 1024
      }
    }));

    const results = registry.findAvailable({
      games: false,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('non-gaming-tv');
  });

  it('transitions an unhealthy device to maintenance', () => {
    const registry = new DeviceRegistry();

    const testDevice = device({status: 'unhealthy'})

    registry.upsert(testDevice);

    const result = registry.transitionStatus(
      testDevice.id,
      'maintenance',
      'test-pass',
      'health-check'
    );

    expect(result.from).toBe('unhealthy');
    expect(result.to).toBe('maintenance');
    expect(result.reason).toBe('test-pass');
    expect(result.source).toBe('health-check');

    expect(registry.get(testDevice.id)?.status).toBe('maintenance');
  });

  it('rejects an invalid quarantined to reserved transition', () => {
    const registry = new DeviceRegistry();
    const testDevice = device({status: 'quarantined'})

    registry.upsert(testDevice);

    expect(() =>
      registry.transitionStatus(
        testDevice.id,
        'reserved',
        'test-fail',
        'health-check',
      ),
    ).toThrow(
      `Cannot transition device ${testDevice.id} from quarantined to reserved`
    );
    expect(registry.get(testDevice.id)?.status).toBe('quarantined');
  });

  it('requires reserve() to be used when reserving a device', () => {
    const registry = new DeviceRegistry();

    const testDevice = device({status: 'available'});

    registry.upsert(testDevice);

    expect(() =>
      registry.transitionStatus(
        testDevice.id,
        'reserved',
        'test',
        'scheduler',
      ),
    ).toThrow();

    expect(registry.get(testDevice.id)?.status).toBe('available');
    expect(registry.get(testDevice.id)?.reservedBy).toBeUndefined();
  });
});
