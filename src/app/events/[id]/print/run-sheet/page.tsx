import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/actions";
import { ArrowLeft, Clock, FileText, Phone, Printer } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function VendorRunSheetPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

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
          <PrintButton label="Print / Save Run Sheet as PDF" />
        </div>
      </div>

      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              EventPilot AI • Operational Document
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase mt-1">
              Physical Vendor Master Run Sheet
            </h1>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {event.eventName}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold">EVENT DATE</div>
            <div className="text-base font-black text-indigo-700">{event.eventDate}</div>
            <div className="text-slate-500 mt-1">Document Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase">Primary Location / Venue:</span>
            <div className="font-semibold">{event.location}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Lead Event Coordinator:</span>
            <div className="font-semibold">{event.user?.name || "Alex Rivera"} (On-Site Lead)</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Setting & Formality:</span>
            <div className="font-semibold">{event.indoorOutdoor} • {event.formality}</div>
          </div>
        </div>
      </div>

      {/* Day-of Chronological Milestone Run Sheet */}
      <div className="mb-8 avoid-break">
        <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 mb-3">
          1. Day-Of Execution Milestones & Load-In Schedule
        </h2>

        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="p-2 border border-slate-300 w-24">Target Time</th>
              <th className="p-2 border border-slate-300 w-32">Department</th>
              <th className="p-2 border border-slate-300">Milestone / Action Item</th>
              <th className="p-2 border border-slate-300 w-28">Responsible Party</th>
              <th className="p-2 border border-slate-300 w-20 text-center">Check-In</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">08:00 AM</td>
              <td className="p-2 border border-slate-200">VENUE / ACCESS</td>
              <td className="p-2 border border-slate-200">Venue doors unlock; power check in banquet hall and exterior lawn.</td>
              <td className="p-2 border border-slate-200">Venue Manager</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">09:00 AM</td>
              <td className="p-2 border border-slate-200">DECOR & AV</td>
              <td className="p-2 border border-slate-200">Lighting rig setup, audio PA system soundcheck, table cross-back chairs positioned.</td>
              <td className="p-2 border border-slate-200">AV Crew / Decorator</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">11:00 AM</td>
              <td className="p-2 border border-slate-200">FLORAL</td>
              <td className="p-2 border border-slate-200">Floral arbor construction and delivery of 15 table centerpieces and personal bouquets.</td>
              <td className="p-2 border border-slate-200">Lead Florist</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">01:00 PM</td>
              <td className="p-2 border border-slate-200">CATERING</td>
              <td className="p-2 border border-slate-200">Catering brigade on-site; prep kitchen verification, ice delivery, bar setup.</td>
              <td className="p-2 border border-slate-200">Banquet Captain</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">02:30 PM</td>
              <td className="p-2 border border-slate-200">PHOTOGRAPHY</td>
              <td className="p-2 border border-slate-200">Photographers arrive for pre-ceremony coverage and environmental venue shots.</td>
              <td className="p-2 border border-slate-200">Lead Photographer</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">04:00 PM</td>
              <td className="p-2 border border-slate-200">GUEST ARRIVAL</td>
              <td className="p-2 border border-slate-200">Doors open to guests; welcome drinks and acoustic background music begin.</td>
              <td className="p-2 border border-slate-200">Front of House</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">05:00 PM</td>
              <td className="p-2 border border-slate-200">MAIN PROGRAM</td>
              <td className="p-2 border border-slate-200">Ceremony / Keynote program starts promptly; sound levels locked.</td>
              <td className="p-2 border border-slate-200">Coordinator / Sound Tech</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">06:30 PM</td>
              <td className="p-2 border border-slate-200">DINNER SERVICE</td>
              <td className="p-2 border border-slate-200">Plated dinner & bar service begins strictly aligned with catering spec sheet.</td>
              <td className="p-2 border border-slate-200">Executive Chef</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">10:00 PM</td>
              <td className="p-2 border border-slate-200">WRAP & LOAD-OUT</td>
              <td className="p-2 border border-slate-200">Outdoor music curfews in effect; rental breakdown and venue walkthrough.</td>
              <td className="p-2 border border-slate-200">All Vendors</td>
              <td className="p-2 border border-slate-200 text-center">[  ]</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Master Vendor Directory & Deliverables */}
      <div className="mb-8 avoid-break">
        <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 mb-3">
          2. Contracted Vendor Contacts & Load-In Deliverables
        </h2>

        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="p-2 border border-slate-300">Service Category</th>
              <th className="p-2 border border-slate-300">Vendor / Company</th>
              <th className="p-2 border border-slate-300">Contact Person</th>
              <th className="p-2 border border-slate-300">Phone Number</th>
              <th className="p-2 border border-slate-300">Booking Status</th>
              <th className="p-2 border border-slate-300 w-16 text-center">Verified</th>
            </tr>
          </thead>
          <tbody>
            {event.vendors.map((v: any) => (
              <tr key={v.id} className="border-b border-slate-200">
                <td className="p-2 border border-slate-200 font-bold">{v.category}</td>
                <td className="p-2 border border-slate-200">{v.vendorName}</td>
                <td className="p-2 border border-slate-200">{v.contactPerson || "Lead Manager"}</td>
                <td className="p-2 border border-slate-200 font-mono">{v.contactPhone || "—"}</td>
                <td className="p-2 border border-slate-200 font-semibold">{v.status}</td>
                <td className="p-2 border border-slate-200 text-center">[ ✓ ]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Physical Sign-off Acknowledgment */}
      <div className="pt-6 border-t border-slate-300 avoid-break">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">On-Site Coordinator Sign-off:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Signature / Printed Name / Date</div>
          </div>
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">Venue Operations Manager Sign-off:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Signature / Printed Name / Date</div>
          </div>
        </div>
      </div>
    </div>
  );
}
