import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useDiscountsStore = createEntityStore("discounts", () => seedDatabase().discounts);
