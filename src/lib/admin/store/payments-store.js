import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const usePaymentsStore = createEntityStore("payments", () => seedDatabase().payments);
