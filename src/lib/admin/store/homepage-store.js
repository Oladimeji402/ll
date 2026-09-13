import { createSingletonStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useHomepageStore = createSingletonStore("homepage", () => seedDatabase().content);
