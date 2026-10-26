import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getEventById } from "@/lib/actions";
import { ArrowLeft, CheckCircle2, Phone, Printer, Users, Sparkles } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function GuestInvitationsPrintPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const totalGuests = event.guests.length;
  const attending = event.guests.filter((g: any) => g.rsvpStatus === "ATTENDING").length;
  const declined = event.guests.filter((g: any) => g.rsvpStatus === "DECLINED").length;
  const pending = event.guests.filter((g: any) => g.rsvpStatus === "INVITED").length;
  const tentative = event.guests.filter((g: any) => g.rsvpStatus === "TENTATIVE").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-900 bg-white min-h-screen">
      {/* Interactive Toolbar (Hidden during Print / PDF generation) */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Event Workspace
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton label="Print / Save Guest Invitation List as PDF" />
        </div>
      </div>

      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              <Image src="/app-icon.png" alt="EventPilot" width={18} height={18} className="object-contain" />
              <span>EventPilot • Guest Registry & Check-In Roster</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase mt-1">
              Master Guest Invitation & Attendance Register
            </h1>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {event.eventName}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold">EVENT DATE</div>
            <div className="text-base font-black text-indigo-700">{event.eventDate}</div>
            <div className="text-slate-500 mt-1">Roster Printed: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase">Total Listed:</span>
            <div className="text-base font-black">{totalGuests} Guests</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Confirmed Attending:</span>
            <div className="text-base font-black text-emerald-700">{attending}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Pending Awaiting RSVP:</span>
            <div className="text-base font-black text-amber-700">{pending}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Declined:</span>
            <div className="text-base font-black text-slate-500">{declined}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Venue / Location:</span>
            <div className="font-semibold truncate">{event.location}</div>
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="mb-8 avoid-break">
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-2 border border-slate-300 w-12 text-center">Door Check</th>
              <th className="p-2 border border-slate-300">Guest Full Name</th>
              <th className="p-2 border border-slate-300 w-36">Contact Phone Number</th>
              <th className="p-2 border border-slate-300">Contact Email</th>
              <th className="p-2 border border-slate-300">Household / Seating Group</th>
              <th className="p-2 border border-slate-300 w-28">Plus-One Details</th>
              <th className="p-2 border border-slate-300 w-24">RSVP Status</th>
              <th className="p-2 border border-slate-300">Dietary & Needs</th>
            </tr>
          </thead>
          <tbody>
            {event.guests.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center italic text-slate-500">
                  No guest invitations recorded yet. Add guests in the event workspace.
                </td>
              </tr>
            ) : (
              event.guests.map((g: any) => (
                <tr key={g.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 text-center font-mono text-sm">
                    [  ]
                  </td>
                  <td className="p-2 border border-slate-200 font-bold text-slate-900">
                    {g.firstName} {g.lastName}
                  </td>
                  <td className="p-2 border border-slate-200 font-mono font-semibold text-slate-800">
                    {g.phone || "—"}
                  </td>
                  <td className="p-2 border border-slate-200 text-slate-600">
                    {g.email || "—"}
                  </td>
                  <td className="p-2 border border-slate-200">
                    {g.householdGroup || "General"}
                  </td>
                  <td className="p-2 border border-slate-200 text-[11px]">
                    {g.plusOneAllowed ? (
                      g.plusOneName ? `+1: ${g.plusOneName}` : "Allowed (Unnamed)"
                    ) : (
                      "No Plus-One"
                    )}
                  </td>
                  <td className="p-2 border border-slate-200 font-bold">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                        g.rsvpStatus === "ATTENDING"
                          ? "bg-emerald-100 text-emerald-800"
                          : g.rsvpStatus === "DECLINED"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {g.rsvpStatus}
                    </span>
                  </td>
                  <td className="p-2 border border-slate-200 text-[11px]">
                    {g.dietaryRequirements && (
                      <span className="font-semibold text-amber-800 mr-1">
                        Diet: {g.dietaryRequirements}
                      </span>
                    )}
                    {g.accessibilityNeeds && (
                      <span className="text-blue-800">
                        Access: {g.accessibilityNeeds}
                      </span>
                    )}
                    {!g.dietaryRequirements && !g.accessibilityNeeds && "None"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Official Invitation Announcement & Card Generator (BUG-10) */}
      <div className="mt-12 pt-8 border-t-2 border-slate-900 break-before-page">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Personalized Invitation Stationery</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Official Invitation Announcement & Card Generator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Individual formal invitation cards tailored for each invited guest. Ready for physical printout or electronic dispatch.
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
              {event.guests.length} Cards Generated
            </span>
          </div>
        </div>

        {event.guests.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs italic">
            No guests added yet. Add guests in the event workspace to generate personalized invitations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {event.guests.map((g: any) => (
              <div
                key={`card-${g.id}`}
                className="border-2 border-slate-800 rounded-2xl p-6 bg-slate-50/60 shadow-xs flex flex-col justify-between avoid-break relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-10">
                  <div className="w-full h-full bg-slate-900 rotate-45 transform origin-bottom-left" />
                </div>

                <div>
                  <div className="text-center pb-4 border-b border-slate-200">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-700">
                      You Are Cordially Invited
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">
                      {event.eventName}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600">
                      {event.eventType.replace(/_/g, " ")} Celebration
                    </div>
                  </div>

                  <div className="py-5 text-center">
                    <div className="text-xs text-slate-500 font-medium">Warmly Requested Presence Of</div>
                    <div className="text-base font-black text-slate-900 mt-1">
                      {g.firstName} {g.lastName}
                      {g.plusOneAllowed && (
                        <span className="text-xs font-normal text-slate-600 block mt-0.5">
                          {g.plusOneName ? `& ${g.plusOneName}` : "& Honored Guest (+1)"}
                        </span>
                      )}
                    </div>
                    {event.concept?.headline && (
                      <p className="text-xs italic text-slate-600 mt-3 max-w-sm mx-auto leading-relaxed">
                        &ldquo;{event.concept.headline}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 my-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Date & Time:</span>
                      <span className="font-bold text-slate-900">{event.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Location:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={event.location}>
                        {event.location}
                      </span>
                    </div>
                    {g.householdGroup && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Seating Group:</span>
                        <span className="font-medium text-slate-800">{g.householdGroup}</span>
                      </div>
                    )}
                    {g.dietaryRequirements && (
                      <div className="flex justify-between">
                        <span className="text-amber-700 font-medium">Dietary Note:</span>
                        <span className="font-semibold text-amber-900">{g.dietaryRequirements}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <div>
                    <span>Current RSVP: </span>
                    <span className="font-bold uppercase text-slate-800">{g.rsvpStatus}</span>
                  </div>
                  <div className="font-mono text-slate-400">
                    ID: {g.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roster Verification Sign-off */}
      <div className="pt-6 border-t border-slate-300 avoid-break">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">Guest Check-In Lead Sign-off:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Signature / Printed Name / Date</div>
          </div>
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">Total Door Attendance Reconciled:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Final Headcount Verified / Notes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
