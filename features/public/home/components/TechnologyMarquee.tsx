import { PROJECT_TECHNOLOGIES } from "@/features/public/home/technologies";

function TechnologyRow({ copy = false }: { copy?: boolean }) {
  return (
    <ul
      data-marquee-copy={copy ? "" : undefined}
      aria-hidden={copy || undefined}
      className="flex shrink-0 items-center"
    >
      {PROJECT_TECHNOLOGIES.map((tech) => (
        <li key={tech.name} className="px-8">
          <span className="text-foreground/75 flex items-center gap-3">
            <tech.Icon className="h-7 w-7 shrink-0" aria-hidden />
            <span className="text-lg font-medium tracking-tight whitespace-nowrap">
              {tech.name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TechnologyMarquee() {
  return (
    <section
      aria-label="Technologies used"
      className="tech-marquee relative mx-auto w-full max-w-[100rem] overflow-hidden"
    >
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l to-transparent" />
      <div className="tech-marquee-track flex w-max items-center py-6">
        <TechnologyRow />
        <TechnologyRow copy />
      </div>
    </section>
  );
}
