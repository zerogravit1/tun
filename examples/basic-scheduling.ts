import { DeviceRegistry } from '../src/registry/device-registry.js';
import { ReservationRegistry } from '../src/registry/reservation-registry.js';
import { LeaseRegistry } from '../src/registry/lease-registry.js';
import { DeviceScheduler } from '../src/scheduler/device-scheduler.js';

import { virtualFleet } from '../src/fleet/virtual-fleet.js';

const deviceRegistry = new DeviceRegistry();
const reservationRegistry = new ReservationRegistry();

const leaseRegistry = new LeaseRegistry(
  reservationRegistry,
  deviceRegistry,
);

const scheduler = new DeviceScheduler(
  reservationRegistry,
  deviceRegistry,
  leaseRegistry,
);

for (const device of virtualFleet) {
  deviceRegistry.upsert(device);
}

console.log('before reservation');
console.table(deviceRegistry.list());

// deviceRegistry.upsert({
//   id: 'device-001',
//   kind: 'set-top-box',
//   platform: 'roku',
//   model: 'test-roku',
//   virtual: true,
//   performanceClass: 'mid',
//   capabilities: {
//     resolutions: ['1080p'],
//     hdrFormats: [],
//     codecs: ['h264'],
//     games: false,
//     memoryMb: 2048,
//   },
//   supportedOperations: [],
//   status: 'available',
//   consecutiveInfrastructureFailures: 0,
// });

// deviceRegistry.upsert({
//   id: 'device-002',
//   kind: 'tv',
//   platform: 'webos',
//   model: 'test-webos',
//   virtual: true,
//   performanceClass: 'high',
//   capabilities: {
//     resolutions: ['2160p'],
//     hdrFormats: ['hdr10+'],
//     codecs: ['h264'],
//     games: false,
//     memoryMb: 2048,
//   },
//   supportedOperations: [],
//   status: 'available',
//   consecutiveInfrastructureFailures: 0,
// });

const now = new Date(Date.now()).toISOString()

const twoHoursFromNow = new Date(
  Date.now() + 2 * 60 * 60 * 1000,
).toISOString();

const reservation = reservationRegistry.create({
  requestedBy: 'developer-a',
  criteria: {
    platform: 'webos',
  },
  quantity: 1,
  minimumQuantity: 1,
  startsAt: now,
  expiresAt: twoHoursFromNow,
  priority: 'normal',
});

reservationRegistry.transitionStatus(
  reservation.id,
  'active',
);

const lease = scheduler.schedule(
  reservation.id,
  'developer-a',
);

console.log(lease);
console.log('after reservation');
console.table(deviceRegistry.list());