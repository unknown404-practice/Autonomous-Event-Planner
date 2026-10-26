import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

  // Dynamic Catering Service Progression based on eventType and dietary requirements
  const dietaryNoteString =
    event.dietaryNotes && event.dietaryNotes.trim() !== ""
      ? `Dietary compliance notice: ${event.dietaryNotes.trim()}.`
      : "Standard allergen-safe preparation protocols in effect.";

  const themeNote = event.concept?.theme ? `Theme inspiration: ${event.concept.theme}. ` : "";
  const atmosphereNote = event.concept?.atmosphere ? `Atmosphere: ${event.concept.atmosphere}. ` : "";

  let serviceProgression: Array<{ window: string; course: string; details: string; station: string }> = [];

  if (event.eventType === "CONFERENCE") {
    serviceProgression = [
      {
        window: "08:00 AM - 09:00 AM",
        course: "Executive Continental Breakfast",
        details: `Freshly brewed single-origin coffee, cold brew, organic herbal teas, warm artisanal pastries, and seasonal fruit display. ${dietaryNoteString}`,
        station: "Foyer Coffee Bar",
      },
      {
        window: "10:30 AM - 11:00 AM",
        course: "Mid-Morning Focus Break",
        details: "Cold-pressed vitality juices, raw energy bites, and gourmet roasted nut varieties. Hypoallergenic options clearly designated.",
        station: "Breakout Stations",
      },
      {
        window: "12:30 PM - 01:45 PM",
        course: "Working Chef's Luncheon",
        details: `Curated grain & salad bowls with free-range roasted proteins. ${themeNote}${dietaryNoteString}`,
        station: "Main Dining Hall",
      },
      {
        window: "03:15 PM - 03:45 PM",
        course: "Afternoon Brain Fuel",
        details: "Handcrafted dark chocolate treats, nitro cold brew, and sparkling water infusions.",
        station: "Breakout Stations",
      },
      {
        window: "05:00 PM - 06:30 PM",
        course: "Networking Reception & Canapés",
        details: "Passed warm hors d'oeuvres (3 savory varieties), craft beers, and sommelier-selected local wines.",
        station: "Lounge Terrace",
      },
    ];
  } else if (event.eventType === "BIRTHDAY") {
    serviceProgression = [
      {
        window: "04:30 PM - 05:30 PM",
        course: "Arrival Mocktails & Savory Bites",
        details: `Signature celebratory punch, sparkling spritzers, and passed crowd-pleasing finger foods. ${atmosphereNote}`,
        station: "Welcome Lounge",
      },
      {
        window: "06:00 PM - 07:15 PM",
        course: "Celebration Feast Service",
        details: `Gourmet dinner spread adapted for festive gathering. ${themeNote}${dietaryNoteString}`,
        station: "Main Dining Area",
      },
      {
        window: "07:30 PM - 08:15 PM",
        course: "Birthday Cake Ceremony & Sweets",
        details: "Custom celebratory cake presentation, cutting, and plated dessert service with organic coffee & tea.",
        station: "Celebration Station",
      },
      {
        window: "09:00 PM",
        course: "Late-Night Snack Board",
        details: "Warm slider bites, crispy sweet treats, and artisanal late-night refreshments.",
        station: "Party Floor",
      },
    ];
  } else if (event.eventType === "WEDDING") {
    serviceProgression = [
      {
        window: "04:00 PM - 05:00 PM",
        course: "Welcome Bar & Canapés",
        details: `Continuous passed hors d'oeuvres (4 varieties); vintage sparkling wine and craft botanic mocktails. ${atmosphereNote}`,
        station: "Cocktail Terrace",
      },
      {
        window: "06:15 PM - 06:45 PM",
        course: "First Course / Plated Salad",
        details: `Artisanal seasonal baby greens, heirloom citrus, compressed pears, shaved pecorino. Distinct tagged plates for special diets. ${dietaryNoteString}`,
        station: "Main Pavilion Tables",
      },
      {
        window: "06:45 PM - 07:45 PM",
        course: "Main Entrée Service",
        details: `Simultaneous synchronised table drop. Chef's signature dual entrée tailored for wedding banquet. ${themeNote}Strict cross-contamination isolation.`,
        station: "Main Pavilion Tables",
      },
      {
        window: "08:00 PM - 08:30 PM",
        course: "Wedding Cake & Cordials",
        details: "Tiered cake portioning and plated service with organic espresso and loose-leaf herbal teas.",
        station: "Dessert Station",
      },
      {
        window: "09:30 PM",
        course: "Midnight Celebration Bites",
        details: "Warm gourmet sliders, churro bites, and comfort bites for remaining guests.",
        station: "Lounge Area",
      },
    ];
  } else {
    serviceProgression = [
      {
        window: "05:00 PM - 06:00 PM",
        course: "Cocktail Hour & Reception",
        details: `Passed artisanal appetizers and welcoming beverage bar. ${atmosphereNote}`,
        station: "Reception Lounge",
      },
      {
        window: "06:30 PM - 07:15 PM",
        course: "Plated First Course",
        details: `Seasonal starter paired with artisan breads. ${dietaryNoteString}`,
        station: "Main Banquet Hall",
      },
      {
        window: "07:15 PM - 08:30 PM",
        course: `${event.formality === "FORMAL" ? "Formal Plated" : "Gourmet Buffet"} Main Course`,
        details: `Curated main entrée selection. ${themeNote}Strict allergen segregation.`,
        station: "Main Banquet Hall",
      },
      {
        window: "08:30 PM - 09:15 PM",
        course: "Dessert & Coffee Service",
        details: "Plated dessert collection with freshly roasted coffee and herbal tea infusions.",
        station: "Dessert Buffet",
      },
    ];
  }

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
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              <Image src="/app-icon.png" alt="EventPilot" width={18} height={18} className="object-contain" />
              <span>EventPilot • Back-of-House Kitchen Specification Sheet</span>
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
            <div className="font-semibold">{Math.max(2, Math.round(event.guestCount * 0.05))} Staff Meals (Hot)</div>
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
              <th className="p-2 border border-slate-300 w-44">Course / Phase</th>
              <th className="p-2 border border-slate-300">Kitchen Execution Details</th>
              <th className="p-2 border border-slate-300 w-32">Service Station</th>
            </tr>
          </thead>
          <tbody>
            {serviceProgression.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="p-2 border border-slate-200 font-bold">{item.window}</td>
                <td className="p-2 border border-slate-200 font-semibold">{item.course}</td>
                <td className="p-2 border border-slate-200">{item.details}</td>
                <td className="p-2 border border-slate-200">{item.station}</td>
              </tr>
            ))}
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
            <div className="text-slate-600 mt-1">1 Dedicated Server per {event.formality === "FORMAL" ? 10 : 20} Guests ({event.formality === "FORMAL" ? "Formal Plated" : "Buffet / Casual"})</div>
          </div>
          <div>
            <div className="font-bold text-slate-700">Bartender Stations:</div>
            <div className="text-slate-600 mt-1">{Math.max(1, Math.ceil(event.guestCount / 50))} Certified Mixologist(s) ({Math.max(1, Math.ceil(event.guestCount / 50))} Bar Station{Math.max(1, Math.ceil(event.guestCount / 50)) > 1 ? "s" : ""})</div>
          </div>
          <div>
            <div className="font-bold text-slate-700">Bussing & Clearing Staff:</div>
            <div className="text-slate-600 mt-1">{Math.max(1, Math.ceil(event.guestCount / 40))} Support Staff for Table Turnover</div>
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
