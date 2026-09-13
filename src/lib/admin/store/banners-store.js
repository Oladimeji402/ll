import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useBannersStore = createEntityStore("banners", () => seedDatabase().banners);
