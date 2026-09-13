import { useCustomersStore } from "../store/customers-store";
import { useOrdersStore } from "../store/orders-store";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

const SEARCH_FIELDS = ["name", "email", "phone"];

export function filterCustomers(customers, { search, segment = "all" } = {}) {
  return customers.filter((customer) => {
    if (segment !== "all" && customer.segment !== segment) return false;
    return matchesSearch(customer, search, SEARCH_FIELDS);
  });
}

export async function listCustomers({
  search = "",
  segment = "all",
  sort = { field: "totalSpent", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = useCustomersStore.getState().items;
  const filtered = filterCustomers(all, { search, segment });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getCustomer(id) {
  await simulateLatency(250);
  return useCustomersStore.getState().items.find((c) => c.id === id) ?? null;
}

export function getCustomerOrders(id) {
  return useOrdersStore
    .getState()
    .items.filter((order) => order.customerId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addCustomerNote(id, note) {
  await simulateLatency(300);
  const customer = useCustomersStore.getState().items.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");
  const updated = { ...customer, notes: note };
  useCustomersStore.getState()._upsert(updated);
  logActivity({ action: "added a note to", resourceType: "customer", resourceId: id, resourceLabel: customer.name });
  return updated;
}
