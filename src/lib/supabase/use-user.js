"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

// undefined = still resolving the initial session, null = signed out
export function useSupabaseUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return user;
}
