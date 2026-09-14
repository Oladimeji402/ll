import statesToLgas from "@/data/ng-states-lgas.json";

const DISPLAY_LABELS = {
  AkwaIbom: "Akwa Ibom",
  FCT: "FCT (Abuja)",
};

export const NG_STATES = Object.keys(statesToLgas)
  .map((value) => ({ value, label: DISPLAY_LABELS[value] ?? value }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function getLgasForState(stateValue) {
  return statesToLgas[stateValue] ?? [];
}
