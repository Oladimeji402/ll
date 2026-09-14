"use client";

import { createContext, useContext } from "react";
import { CURRENT_STAFF } from "@/lib/admin/utils/current-user";

const CurrentStaffContext = createContext(null);

export function CurrentStaffProvider({ staff, children }) {
  return <CurrentStaffContext.Provider value={staff}>{children}</CurrentStaffContext.Provider>;
}

export function useCurrentStaff() {
  return useContext(CurrentStaffContext) ?? CURRENT_STAFF;
}
