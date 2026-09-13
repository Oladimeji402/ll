import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useReturnsStore = createEntityStore("returns", () => seedDatabase().returns);
