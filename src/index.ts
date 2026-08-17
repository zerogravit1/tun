import { virtualFleet } from './fleet/virtual-fleet.js';
import { DeviceRegistry } from './registry/device-registry.js';

const registry = new DeviceRegistry();

for (const device of virtualFleet) {
  registry.upsert(device);
}

console.info('Tun virtual fleet');
console.table(registry.list());
