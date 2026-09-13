import { useShippingStore } from "../store/shipping-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { logActivity } from "./activity-service";

export async function getShippingConfig() {
  await simulateLatency(250);
  return useShippingStore.getState().value;
}

export async function updateFreeShippingThreshold(amount) {
  await simulateLatency(350);
  useShippingStore.getState()._patch({ freeShippingThreshold: amount });
  logActivity({ action: "updated free shipping threshold", resourceType: "shipping", resourceId: "config", resourceLabel: "Shipping" });
  return useShippingStore.getState().value;
}

export async function addShippingMethod(zoneId, method) {
  await simulateLatency(400);
  const config = useShippingStore.getState().value;
  const zones = config.zones.map((zone) =>
    zone.id === zoneId
      ? { ...zone, methods: [...zone.methods, { id: generateId("method"), ...method }] }
      : zone,
  );
  useShippingStore.getState()._patch({ zones });
  logActivity({ action: "added shipping method to", resourceType: "shipping", resourceId: zoneId, resourceLabel: method.name });
  return zones;
}

export async function updateShippingMethod(zoneId, methodId, patch) {
  await simulateLatency(350);
  const config = useShippingStore.getState().value;
  const zones = config.zones.map((zone) =>
    zone.id === zoneId
      ? { ...zone, methods: zone.methods.map((m) => (m.id === methodId ? { ...m, ...patch } : m)) }
      : zone,
  );
  useShippingStore.getState()._patch({ zones });
  return zones;
}

export async function removeShippingMethod(zoneId, methodId) {
  await simulateLatency(350);
  const config = useShippingStore.getState().value;
  const zones = config.zones.map((zone) =>
    zone.id === zoneId ? { ...zone, methods: zone.methods.filter((m) => m.id !== methodId) } : zone,
  );
  useShippingStore.getState()._patch({ zones });
  return zones;
}
