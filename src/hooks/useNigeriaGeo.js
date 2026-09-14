"use client";

import { useEffect, useState } from "react";

export function useNigeriaStates() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo/states")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStates(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return states;
}

export function useNigeriaCities(stateValue) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (!stateValue) {
      setCities([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/geo/lgas?state=${encodeURIComponent(stateValue)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCities(data.map((lga) => ({ value: lga, label: lga })));
      });
    return () => {
      cancelled = true;
    };
  }, [stateValue]);

  return cities;
}
