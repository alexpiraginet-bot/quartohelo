import { getSiteContent } from "@/lib/content";
import { LandingView } from "./_components/LandingView";

export const dynamic = "force-dynamic"; // reflete o CMS assim que o Supabase entra

export default async function Home() {
  const s = await getSiteContent();
  return <LandingView s={s} />;
}
