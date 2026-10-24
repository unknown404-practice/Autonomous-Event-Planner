import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function KitchenCateringSpecsPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const dietaryMap: Record<string, Array<{ name: string; household?: string }>> = {};
  for (const g of event.guests) {
    if (g.dietaryRequirements && g.dietaryRequirements.trim() !== "") {
      const diet = g.dietaryRequirements.trim();
      if (!dietaryMap[diet]) dietaryMap[diet] = [];
      dietaryMap[diet].push({
        name: `${g.firstName} ${g.lastName}`,
        household: g.householdGroup || undefined,
      });
    }
  }

  const confirmedAttendees = event.guests.filter((g: any) => g.rsvpStatus === "ATTENDING").length;
  const attendingPlusOnes = event.guests.filter(
    (g: any) => g.rsvpStatus === "ATTENDING" && g.plusOneAllowed && g.isAttendingPlusOne
  ).length;
  const totalCateringHeadcount = confirmedAttendees + attendingPlusOnes;

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
          <PrintButton label="Print / Save Catering Specs as PDF" />
        </div>
      </div>

      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Back-of-House Kitchen Specification Sheet
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase mt-1">
              Kitchen Catering & Banquet Production Order
            </h1>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {event.eventName}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold">BANQUET DATE</div>
            <div className="text-base font-black text-emerald-700">{event.eventDate}</div>
            <div className="text-slate-500 mt-1">Production Version: 1.0 (Final Confirmed)</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase">Total Headcount:</span>
            <div className="text-base font-black text-slate-900">
              {totalCateringHeadcount > 0 ? totalCateringHeadcount : event.guestCount} Covers
            </div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Service Style:</span>
            <div className="font-semibold">{event.formality} Plated & Passed Hors D'oeuvres</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Prep Kitchen Site:</span>
            <div className="font-semibold">{event.location}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">Vendor Crew Meals:</span>
            <div className="font-semibold">8 Staff Meals (Hot)</div>
          </div>
        </div>
      </div>

      {/* Banquet Run of Service */}
      <div className="mb-8 avoid-break">
        <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 mb-3">
          1. Service Progression & Kitchen Timing Schedule
        </h2>

        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="p-2 border border-slate-300 w-28">Service Window</th>
              <th className="p-2 border border-slate-300 w-40">Course / Phase</th>
              <th className="p-2 border border-slate-300">Kitchen Execution Details</th>
              <th className="p-2 border border-slate-300 w-32">Service Station</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">04:00 PM - 05:00 PM</td>
              <td className="p-2 border border-slate-200 font-semibold">Welcome Bar & Canapés</td>
              <td className="p-2 border border-slate-200">
                Continuous passed hors d'oeuvres (4 varieties); sparkling wine and craft mocktails on arrival.
              </td>
              <td className="p-2 border border-slate-200">Cocktail Terrace</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">06:15 PM - 06:45 PM</td>
              <td className="p-2 border border-slate-200 font-semibold">Salad / First Course</td>
              <td className="p-2 border border-slate-200">
                Artisanal seasonal baby greens, compressed pears, shaved pecorino, toasted hazelnuts. Allergen plates tagged.
              </td>
              <td className="p-2 border border-slate-200">Main Pavilion Tables</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">06:45 PM - 07:45 PM</td>
              <td className="p-2 border border-slate-200 font-semibold">Main Entrée Service</td>
              <td className="p-2 border border-slate-200">
                Simultaneous table drop. Dual entrée: Pan-seared sea bass / braised beef short rib. Strict separation for special diets.
              </td>
              <td className="p-2 border border-slate-200">Main Pavilion Tables</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">08:00 PM - 08:30 PM</td>
              <td className="p-2 border border-slate-200 font-semibold">Cake Cutting & Coffee</td>
              <td className="p-2 border border-slate-200">
                Cake portioning and plated service with organic espresso and loose-leaf herbal teas.
              </td>
              <td className="p-2 border border-slate-200">Dessert Station</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 font-bold">09:30 PM</td>
              <td className="p-2 border border-slate-200 font-semibold">Late Night Bites</td>
              <td className="p-2 border border-slate-200">
                Slider station and warm churro bites for remaining guests.
              </td>
              <td className="p-2 border border-slate-200">Lounge Area</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Allergen & Dietary Requirements Matrix */}
      <div className="mb-8 avoid-break">
        <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 mb-3">
          2. Certified Dietary & Allergen Specifications
        </h2>

        {Object.keys(dietaryMap).length === 0 ? (
          <div className="p-4 border border-slate-200 text-xs italic text-slate-500">
            No specific severe food allergies reported in current RSVP records. Standard vegetarian entrée alternative prepared.
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300">
                <th className="p-2 border border-slate-300 w-44">Allergen / Diet Profile</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Verified Count</th>
                <th className="p-2 border border-slate-300">Guest Name(s) & Seating Group</th>
                <th className="p-2 border border-slate-300 w-40">Kitchen Protocol</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dietaryMap).map(([diet, guests]) => (
                <tr key={diet} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 font-bold text-slate-900">{diet}</td>
                  <td className="p-2 border border-slate-200 text-center font-bold text-emerald-700">
                    {guests.length} cover(s)
                  </td>
                  <td className="p-2 border border-slate-200">
                    {guests.map((g, i) => (
                      <span key={i} className="inline-block mr-2">
                        • {g.name} {g.household ? `(${g.household})` : ""}
                      </span>
                    ))}
                  </td>
                  <td className="p-2 border border-slate-200 italic text-[11px]">
                    Prepare on sanitized prep station; plate with distinct cloche marker.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Staffing & Service Logistics */}
      <div className="mb-8 avoid-break">
        <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 mb-3">
          3. Staffing & Front-of-House Ratios
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border border-slate-200 p-4">
          <div>
            <div className="font-bold text-slate-700">Server to Table Ratio:</div>
            <div className="text-slate-600 mt-1">1 Dedicated Server per 12 Guests (Plated)</div>
          </div>
          <div>
            <div className="font-bold text-slate-700">Bartender Stations:</div>
            <div className="text-slate-600 mt-1">2 Certified Mixologists (Zero Queue Buffer)</div>
          </div>
          <div>
            <div className="font-bold text-slate-700">Bussing & Clearing Staff:</div>
            <div className="text-slate-600 mt-1">3 Support Staff for Table Turnover</div>
          </div>
        </div>
      </div>

      {/* Kitchen Sign-off */}
      <div className="pt-6 border-t border-slate-300 avoid-break">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">Executive Chef Acknowledgment:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Signature / Printed Name / Date</div>
          </div>
          <div>
            <div className="font-bold text-slate-700 uppercase mb-4">Head Banquet Captain Acknowledgment:</div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <div className="text-[10px] text-slate-500">Signature / Printed Name / Date</div>
          </div>
        </div>
      </div>
    </div>
  );
}
