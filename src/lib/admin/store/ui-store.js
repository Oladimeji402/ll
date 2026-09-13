import { createSingletonStore } from "./create-entity-store";

export const useUiStore = createSingletonStore("ui", () => ({ sidebarCollapsed: false }));
