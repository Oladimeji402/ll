import { createEntityStore } from "./create-entity-store";
import { seedDatabase } from "../mock-data/generate";

export const useNotificationsStore = createEntityStore("notifications", () => seedDatabase().notifications);
