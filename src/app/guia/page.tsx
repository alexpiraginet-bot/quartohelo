import { getCategories, getGuide } from "@/lib/content";
import GuiaApp from "./GuiaApp";

export const dynamic = "force-dynamic";

export default async function GuiaPage() {
  const [categories, guide] = await Promise.all([getCategories(), getGuide()]);
  return <GuiaApp categories={categories} guide={guide} />;
}
