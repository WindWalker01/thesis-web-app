import Image from "next/image";
import { Users } from "lucide-react";
import { TEAM_MEMBERS } from "@/features/public/home/content";

export function TeamSection() {
  return (
    <section id="team" className="bg-slate-50 py-16 md:py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
            <Users className="h-3 w-3 text-blue-400" />
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              The Team
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl dark:text-white">
            The Researchers Behind the Project
          </h2>
          <p className="text-base text-slate-600 md:text-base dark:text-slate-300">
            Meet the team behind this undergraduate thesis research.
          </p>
        </div>
        <div className="grid cursor-pointer grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {TEAM_MEMBERS.map((member) => (
            <a
              href={member.portfolio_link}
              target="_blank"
              key={member.name}
              className="group relative text-center"
            >
              <div className="relative mx-auto mb-6 h-40 w-40 rounded-full border-4 border-dotted border-orange-500 p-1 shadow-[0_0_15px_rgba(255,165,0,0.4)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(255,165,0,0.8)] md:h-48 md:w-48">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200">
                  <Image
                    src={member.img}
                    alt={`${member.name} Profile`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 transform rounded-xl bg-linear-to-r from-orange-400 via-amber-400 to-yellow-300 px-4 py-1 text-base font-semibold whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-500 ease-out group-hover:-translate-y-12 group-hover:opacity-100 md:group-hover:-translate-y-16">
                  {member.role}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-white">
                {member.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
