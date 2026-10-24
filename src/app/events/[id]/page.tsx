import { notFound } from "next/navigation";
import { getEventById } from "@/lib/actions";
import { EventWorkspace } from "@/components/EventWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventWorkspace event={event} />;
}
