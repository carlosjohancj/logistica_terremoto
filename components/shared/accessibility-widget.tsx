"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import { useTranslations } from "next-intl"
import {
  Contrast,
  Link2,
  Minus,
  Plus,
  RotateCcw,
  ScanEye,
  SpellCheck,
  SunDim,
  Type,
  Waves,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

function AccessibilityPersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2.25" />
      <path d="M4 9.5h16" />
      <path d="M12 9.5v4.5" />
      <path d="M12 14 7.5 21" />
      <path d="M12 14 16.5 21" />
    </svg>
  )
}

type ToggleKey =
  | "highContrast"
  | "grayscale"
  | "reduceMotion"
  | "dyslexiaFriendly"
  | "highlightLinks"
  | "readingGuide"

type Settings = {
  fontStep: number
} & Record<ToggleKey, boolean>

const DEFAULT_SETTINGS: Settings = {
  fontStep: 0,
  highContrast: false,
  grayscale: false,
  reduceMotion: false,
  dyslexiaFriendly: false,
  highlightLinks: false,
  readingGuide: false,
}

const FONT_SCALES = [1, 1.1, 1.2, 1.3, 1.4]
const STORAGE_KEY = "a11y-settings"

const TOGGLE_CLASS: Record<ToggleKey, string> = {
  highContrast: "a11y-high-contrast",
  grayscale: "a11y-grayscale",
  reduceMotion: "a11y-reduce-motion",
  dyslexiaFriendly: "a11y-dyslexia",
  highlightLinks: "a11y-highlight-links",
  readingGuide: "",
}

function applySettings(settings: Settings) {
  const root = document.documentElement
  root.style.setProperty("--a11y-font-scale", String(FONT_SCALES[settings.fontStep]))
  for (const key of Object.keys(TOGGLE_CLASS) as ToggleKey[]) {
    const className = TOGGLE_CLASS[key]
    if (className) root.classList.toggle(className, settings[key])
  }
}

function readStoredSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function AccessibilityWidget() {
  const t = useTranslations("accessibility")
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(readStoredSettings)
  const [guideY, setGuideY] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applySettings(settings)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore unavailable storage
    }
  }, [settings])

  useEffect(() => {
    if (!settings.readingGuide) return
    function handleMove(e: MouseEvent) {
      setGuideY(e.clientY)
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [settings.readingGuide])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  function toggle(key: ToggleKey) {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }

  function changeFontStep(delta: number) {
    setSettings((s) => ({
      ...s,
      fontStep: Math.min(FONT_SCALES.length - 1, Math.max(0, s.fontStep + delta)),
    }))
  }

  const toggles: Array<{ key: ToggleKey; label: string; desc: string; icon: ComponentType<{ className?: string }> }> = [
    { key: "highContrast", label: t("highContrast"), desc: t("highContrastDesc"), icon: Contrast },
    { key: "grayscale", label: t("grayscale"), desc: t("grayscaleDesc"), icon: SunDim },
    { key: "reduceMotion", label: t("reduceMotion"), desc: t("reduceMotionDesc"), icon: Waves },
    { key: "dyslexiaFriendly", label: t("dyslexiaFriendly"), desc: t("dyslexiaFriendlyDesc"), icon: SpellCheck },
    { key: "highlightLinks", label: t("highlightLinks"), desc: t("highlightLinksDesc"), icon: Link2 },
    { key: "readingGuide", label: t("readingGuide"), desc: t("readingGuideDesc"), icon: ScanEye },
  ]

  return (
    <>
      {settings.readingGuide && guideY !== null && (
        <div
          className="pointer-events-none fixed inset-x-0 z-[60] h-10 border-y-2 border-primary/70 bg-primary/10"
          style={{ top: guideY - 20 }}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="accessibility-panel"
        aria-label={open ? t("toggleClose") : t("toggleOpen")}
        className="fixed right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
      >
        {open ? <X className="h-6 w-6" /> : <AccessibilityPersonIcon className="h-6 w-6" />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          role="dialog"
          aria-label={t("title")}
          className="fixed right-20 top-1/2 z-50 max-h-[85vh] w-[min(20rem,calc(100vw-5.5rem))] -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">{t("title")}</h2>
            <button
              type="button"
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("reset")}
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4 text-primary" />
              {t("fontSize")}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => changeFontStep(-1)}
                disabled={settings.fontStep === 0}
                aria-label={t("decreaseFont")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {Math.round(FONT_SCALES[settings.fontStep] * 100)}%
              </span>
              <button
                type="button"
                onClick={() => changeFontStep(1)}
                disabled={settings.fontStep === FONT_SCALES.length - 1}
                aria-label={t("increaseFont")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {toggles.map((item) => {
              const Icon = item.icon
              const active = settings[item.key]
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    active ? "border-primary/40 bg-primary/10 text-primary" : "border-transparent hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
