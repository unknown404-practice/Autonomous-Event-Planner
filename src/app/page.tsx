import { getEvents } from "@/lib/actions";
import { DashboardView } from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();

  return <DashboardView events={events} />;
}
