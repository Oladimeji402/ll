import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useCollectionsStore = createEntityStore("collections", () => seedDatabase().collections);
