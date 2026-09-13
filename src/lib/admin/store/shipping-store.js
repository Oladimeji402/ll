import { createSingletonStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useShippingStore = createSingletonStore("shipping", () => seedDatabase().shipping);
