"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

async function fetchUserRole(
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data as { role: string } | null)?.role ?? null;
}

export function useNavbar(locale: string) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        fetchUserRole(supabase, data.session!.user.id).then(setUserRole);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session);
        setUserName((session?.user.user_metadata?.name as string) || "");
        if (session) {
          fetchUserRole(supabase, session.user.id).then(setUserRole);
        } else {
          setUserRole(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    startTransition(() => setMenuOpen(false));
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const ofrecerPaths = [
    `/${locale}/ofrecer-transporte`,
    `/${locale}/ofrecer-hospedaje`,
    `/${locale}/donaciones-fisicas`,
    `/${locale}/ofrecer-insumos`,
  ];
  const masPaths = [
    `/${locale}/explorar`,
    `/${locale}/empleos`,
    `/${locale}/recursos`,
    `/${locale}/sobre-nosotros`,
    ...(isLoggedIn ? [`/${locale}/perfil`] : []),
  ];

  return {
    locale,
    isActive,
    menuOpen,
    setMenuOpen,
    isLoggedIn,
    userName,
    userRole,
    ofrecerPaths,
    masPaths,
  };
}
