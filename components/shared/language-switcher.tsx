"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "es";

  function switchLocale(locale: string | null) {
    if (!locale) return;
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  }

  return (
    <Select value={currentLocale} onValueChange={switchLocale}>
      <SelectTrigger className="w-20 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label} - {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
