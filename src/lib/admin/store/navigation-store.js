import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useNavigationStore = createEntityStore("navigation", () => seedDatabase().navigation);
