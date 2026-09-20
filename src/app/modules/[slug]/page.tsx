import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/data/modules";
import { ModuleClient } from "./ModuleClient";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export default function ModulePage({ params }: { params: { slug: string } }) {
  const mod = getModule(params.slug);
  if (!mod) notFound();
  return <ModuleClient slug={mod.slug} />;
}
