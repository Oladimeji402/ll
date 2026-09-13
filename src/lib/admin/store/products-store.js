import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useProductsStore = createEntityStore("products", () => seedDatabase().products);
