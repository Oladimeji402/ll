import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useInventoryStore = createEntityStore("inventory", () => seedDatabase().inventory);
