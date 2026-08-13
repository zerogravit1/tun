import { Device } from '../domain/device.js';

export const virtualFleet: Device[] =[
  {
    id: 'virtual-tv-001',
    kind: 'virtual',
    platform: 'Roku',
    model:'tun-reference-low',
    virtual: true,
    performanceClass: 'low',
    capabilities: {
      resolutions: ['1080p'],
      hdr: false,
      codecs: ['h264'],
      games: false,
      memoryMb: 2048,
    },
    supportedOperations: [
      'device/info',
      'operations/list',
      'health-check/get',
      'applications/launch',
    ],
    status: 'available',
    consecutiveInfrastructureFailures: 0
  },
  {
    id: 'virtual-tv-002',
    kind: 'virtual',
    platform: 'Roku',
    model:'tun-reference-mid',
    virtual: true,
    performanceClass: 'mid',
    capabilities: {
      resolutions: ['1080p, 4K'],
      hdr: true,
      codecs: ['h264', 'hevc', 'hdr10'],
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
    consecutiveInfrastructureFailures: 0
  },
  {
    id: 'virtual-tv-003',
    kind: 'virtual',
    platform: 'Roku',
    model:'tun-reference-high',
    virtual: true,
    performanceClass: 'high',
    capabilities: {
      resolutions: ['1080p, 4K'],
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
    consecutiveInfrastructureFailures: 0
  },

  {
    id: 'virtual-tv-004',
    kind: 'virtual',
    platform: 'Tizen',
    model:'tun-reference-low',
    virtual: true,
    performanceClass: 'low',
    capabilities: {
      resolutions: ['1080p, 4k'],
      hdr: true,
      codecs: ['h264', 'hevc'],
      games: false,
      memoryMb: 2048,
    },
    supportedOperations: [
      'device/info',
      'operations/list',
      'health-check/get',
      'applications/launch',
    ],
    status: 'available',
    consecutiveInfrastructureFailures: 0
  },
  {
    id: 'virtual-tv-005',
    kind: 'virtual',
    platform: 'Tizen',
    model:'tun-reference-high',
    virtual: true,
    performanceClass: 'high',
    capabilities: {
      resolutions: ['1080p, 4K'],
      hdr: true,
      codecs: ['h264', 'hevc', 'hdr10', 'av1'],
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
    consecutiveInfrastructureFailures: 0
  },
  {
    id: 'virtual-tv-006',
    kind: 'virtual',
    platform: 'webOs',
    model:'tun-reference-mid',
    virtual: true,
    performanceClass: 'mid',
    capabilities: {
      resolutions: ['1080p, 4K'],
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
    consecutiveInfrastructureFailures: 0
  },
];