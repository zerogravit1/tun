import { DeviceRegistry } from '../src/registry/device-registry.js';
import { ReservationRegistry } from '../src/registry/reservation-registry.js';
import { LeaseRegistry } from '../src/registry/lease-registry.js';
import { DeviceScheduler } from '../src/scheduler/device-scheduler.js';

import { virtualFleet } from '../src/fleet/virtual-fleet.js';

const deviceRegistry = new DeviceRegistry();
const reservationRegistry = new ReservationRegistry();

const leaseRegistry = new LeaseRegistry(reservationRegistry, deviceRegistry);

const scheduler = new DeviceScheduler(reservationRegistry, deviceRegistry, leaseRegistry);

for (const device of virtualFleet) {
  deviceRegistry.upsert(device);
}

console.log('before reservation');
console.table(deviceRegistry.list());

const now = new Date().toISOString();

const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

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

reservationRegistry.transitionStatus(reservation.id, 'active');

const lease = scheduler.schedule(reservation.id, 'developer-a');

console.log(lease);
console.log('after reservation');
console.table(deviceRegistry.list());
