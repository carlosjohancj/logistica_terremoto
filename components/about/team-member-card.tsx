"use client"

import { useTranslations } from "next-intl"
import { BadgeCheck } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/shared/brand-icons"
import { cn } from "@/lib/utils"

export interface TeamMember {
  name: string
  role: string
  bio: string
  avatarUrl: string
  linkedinUrl: string
  githubUrl: string
}

const TONE_CLASSES = {
  primary: { badge: "text-primary", pill: "bg-primary", ring: "from-primary/15 to-transparent" },
  accent: { badge: "text-accent", pill: "bg-accent", ring: "from-accent/15 to-transparent" },
}

export function TeamMemberCard({ member, tone = "primary" }: { member: TeamMember; tone?: "primary" | "accent" }) {
  const t = useTranslations("about")
  const toneClasses = TONE_CLASSES[tone]

  return (
    <div className="group flex h-full flex-col rounded-3xl bg-card p-3 shadow-sm ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className={cn("relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br", toneClasses.ring)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.avatarUrl}
          alt={member.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4 pb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-lg font-semibold leading-snug">{member.name}</h3>
          <BadgeCheck className={cn("h-4 w-4 shrink-0", toneClasses.badge)} />
        </div>
        <p className={cn("text-xs font-semibold uppercase tracking-wide", toneClasses.badge)}>{member.role}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{member.bio}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <a
            href={member.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("viewOnGithub")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90",
              toneClasses.pill
            )}
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
            {t("connect")}
          </a>
        </div>
      </div>
    </div>
  )
}
