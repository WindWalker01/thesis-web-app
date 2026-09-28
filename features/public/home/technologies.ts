import type { IconType } from "react-icons";
import {
  SiCloudflare,
  SiCloudinary,
  SiEthereum,
  SiFramer,
  SiNextdotjs,
  SiPolygon,
  SiPostgresql,
  SiRadixui,
  SiReact,
  SiReactquery,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiZod,
} from "react-icons/si";

export type ProjectTechnology = {
  name: string;
  Icon: IconType;
};

/** Stack the product actually runs on, in marquee order. */
export const PROJECT_TECHNOLOGIES: ProjectTechnology[] = [
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "React", Icon: SiReact },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Supabase", Icon: SiSupabase },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "Cloudinary", Icon: SiCloudinary },
  { name: "Polygon", Icon: SiPolygon },
  { name: "Ethers.js", Icon: SiEthereum },
  { name: "TanStack Query", Icon: SiReactquery },
  { name: "Zod", Icon: SiZod },
  { name: "Framer Motion", Icon: SiFramer },
  { name: "Radix UI", Icon: SiRadixui },
  { name: "Cloudflare", Icon: SiCloudflare },
];
