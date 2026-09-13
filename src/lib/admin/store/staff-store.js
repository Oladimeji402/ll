import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useStaffStore = createEntityStore("staff", () => seedDatabase().staff);
