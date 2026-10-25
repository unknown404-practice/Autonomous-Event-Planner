import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getEventById } from "@/lib/actions";
import { ArrowLeft, CheckCircle2, Phone, Printer, Users } from "lucide-react";
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
