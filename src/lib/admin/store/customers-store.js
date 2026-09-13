import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useCustomersStore = createEntityStore("customers", () => seedDatabase().customers);
