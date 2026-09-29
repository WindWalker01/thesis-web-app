import Image from "next/image";
import { TEAM_MEMBERS, type TeamMember } from "@/features/public/home/content";
import { cn } from "@/lib/client-utils";

const memberClass =
  "group relative text-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none";

function MemberFigure({ member }: { member: TeamMember }) {
  return (
    <>
      <div className="relative mx-auto mb-6 size-40 transition-transform duration-500 group-hover:scale-105 md:size-48">
        <div className="absolute inset-1 rounded-full bg-blue-500/25 blur-md transition duration-500 group-hover:bg-blue-500/50" />
        <div className="relative size-full rounded-full border-2 border-blue-500 p-1 shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-shadow duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
          <div className="relative size-full overflow-hidden rounded-full">
            <Image
              src={member.img}
              alt={`${member.name} profile`}
              fill
              sizes="192px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute top-0 left-1/2 w-max max-w-44 -translate-x-1/2 rounded-xl bg-blue-600 px-4 py-1 text-center text-sm font-semibold text-white opacity-0 shadow-xl transition-all duration-500 ease-out group-hover:-translate-y-12 group-hover:opacity-100 md:group-hover:-translate-y-16">
          {member.role}
        </div>
      </div>
      <h3 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
        {member.name}
      </h3>
    </>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  if (!member.portfolio) {
    return (
      <article className={memberClass}>
        <MemberFigure member={member} />
      </article>
    );
  }

  return (
    <a
      href={member.portfolio}
      target="_blank"
      rel="noreferrer"
      aria-label={`${member.name}, ${member.role}`}
      className={cn(memberClass, "cursor-pointer")}
    >
      <MemberFigure member={member} />
    </a>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-3xl leading-tight font-normal tracking-tight text-balance sm:text-4xl md:text-5xl">
            The researchers behind the project
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
            Meet the team behind this undergraduate thesis research.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
