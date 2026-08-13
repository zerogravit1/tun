import { DeviceRegistry } from './registry/device-registry.js';

const registry = new DeviceRegistry();

registry.upsert({
  id: 'virtual-tv-001',
  kind: 'virtual',
  platform: 'virtual-tv',
  model: 'tun-reference',
  virtual: true,
  performanceClass: 'mid',
  capabilities: {
    resolutions: ['1080p', '2160p'],
    hdr: true,
    codecs: ['h264', 'hevc', 'av1'],
    games: true,
    memoryMb: 2048,
  },
  supportedOperations: [
    'device/info',
    'operations/list',
    'health-check/get',
    'applications/launch',
  ],
  status: 'available',
  consecutiveInfrastructureFailures: 0,
});

console.log('Tun virtual fleet');
console.table(registry.list());
