"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const languages = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "it", label: "IT", name: "Italiano" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "ar", label: "AR", name: "العربية" },
];

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const pathname = usePathname();

  function switchLocale(locale: string | null) {
    if (!locale) return;
    const segments = pathname.split("/");
    segments[1] = locale;
    window.location.href = segments.join("/");
  }

  return (
    <Select defaultValue="es" onValueChange={switchLocale}>
      <SelectTrigger
        aria-label={t("languageToggle")}
        className="rounded-full border border-border px-2.5 py-1 h-auto text-xs font-medium hover:bg-muted transition-colors shadow-none bg-transparent w-auto gap-1"
      >
        <Globe className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label} — {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
