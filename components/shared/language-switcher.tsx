"use client";

import { usePathname, useRouter } from "next/navigation";
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
      <SelectTrigger className="rounded-full border border-border px-2.5 py-1 h-auto text-xs font-medium hover:bg-muted transition-colors shadow-none bg-transparent w-auto gap-1">
        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
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
