"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

type ThemeOption = keyof typeof THEME_ICONS;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = (mounted ? (theme as ThemeOption) : "system") ?? "system";
  const Icon = THEME_ICONS[current] ?? Monitor;

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
    >
      <SelectTrigger
        aria-label={t("themeToggle")}
        className="rounded-full border border-border px-2.5 py-1 h-auto text-xs font-medium hover:bg-muted transition-colors shadow-none bg-transparent w-auto gap-1"
      >
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <Sun className="size-4" /> {t("themeLight")}
        </SelectItem>
        <SelectItem value="dark">
          <Moon className="size-4" /> {t("themeDark")}
        </SelectItem>
        <SelectItem value="system">
          <Monitor className="size-4" /> {t("themeSystem")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
