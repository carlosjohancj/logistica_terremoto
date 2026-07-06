"use client"

import { useTranslations } from "next-intl"
import { TeamMemberCard, type TeamMember } from "./team-member-card"

export function TeamSection() {
  const t = useTranslations("about")

  const members: TeamMember[] = [
    {
      name: "Carlos Johan Montilva Moreno",
      role: t("roleFullStack"),
      bio: t("carlosBio"),
      avatarUrl: "https://github.com/carlosjohancj.png",
      linkedinUrl: "https://www.linkedin.com/in/carlos-johan-montilva-moreno-b30436236",
      githubUrl: "https://github.com/carlosjohancj",
    },
    {
      name: "Daniel Urbina",
      role: t("roleFullStack"),
      bio: t("danielBio"),
      avatarUrl: "https://github.com/DansPlaying.png",
      linkedinUrl: "https://www.linkedin.com/in/danielurbina007/",
      githubUrl: "https://github.com/DansPlaying",
    },
  ]

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">{t("teamTitle")}</h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">{t("teamSubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        {members.map((member, index) => (
          <TeamMemberCard key={member.name} member={member} tone={index % 2 === 0 ? "primary" : "accent"} />
        ))}
      </div>
    </section>
  )
}
