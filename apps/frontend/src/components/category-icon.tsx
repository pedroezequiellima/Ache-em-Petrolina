import {
  Car,
  Footprints,
  Gift,
  Hammer,
  PawPrint,
  Pill,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
  type LucideIcon,
} from "lucide-react";

const STYLES: Record<string, { icon: LucideIcon; tile: string }> = {
  moda: { icon: Shirt, tile: "bg-purple-100 text-purple-700" },
  calcados: { icon: Footprints, tile: "bg-orange-100 text-orange-700" },
  eletronicos: { icon: Smartphone, tile: "bg-indigo-100 text-indigo-700" },
  casa: { icon: Sofa, tile: "bg-sky-100 text-sky-700" },
  construcao: { icon: Hammer, tile: "bg-yellow-100 text-yellow-700" },
  pet: { icon: PawPrint, tile: "bg-lime-100 text-lime-700" },
  farmacia: { icon: Pill, tile: "bg-teal-100 text-teal-700" },
  presentes: { icon: Gift, tile: "bg-rose-100 text-rose-700" },
  automotivo: { icon: Car, tile: "bg-zinc-200 text-zinc-700" },
};

const FALLBACK = { icon: Tag, tile: "bg-stone-100 text-stone-700" };

export function categoryStyle(slug: string) {
  return STYLES[slug] ?? FALLBACK;
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const { icon: Icon } = categoryStyle(slug);
  return <Icon className={className} aria-hidden />;
}
