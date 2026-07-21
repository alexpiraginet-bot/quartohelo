import { getGuiaData } from "@/lib/content";
import { seedGuestProfile } from "@/data/seed";
import GuiaApp from "./GuiaApp";

export const dynamic = "force-dynamic";

export default async function GuiaPage() {
  const { categories, guide, pages, options } = await getGuiaData();
  return (
    <GuiaApp categories={categories} guide={guide} pages={pages} options={options} profile={seedGuestProfile} />
  );
}
