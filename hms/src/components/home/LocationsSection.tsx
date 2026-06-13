import { IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import { Button } from "@mantine/core";

const locations = [
  {
    name: "PulseCare — Beed",
    city: "Beed",
    address: "Plot no. 6 & 7, chhatrapati Sambhaji Nagar - Solapur Hwy, near Phoenix Hospital, Beed",
    phone: "+91 020-2566 5566",
    email: "beed@pulsecare.in",
    tag: "Main Campus",
    tagColor: "#1a6fa8",
    img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
  },
  {
    name: "PulseCare — Nagar Road",
    city: "Pune",
    address: "Near Hermes Heritage, Nagar Road, Shastrinagar, Yerawada, Pune - 411006",
    phone: "+91 020-2665 4455",
    email: "nagarroad@pulsecare.in",
    tag: "24×7 Open",
    tagColor: "#16a34a",
    img: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&q=80",
  },
  {
    name: "PulseCare — Hadapsar",
    city: "Pune",
    address: "S. No. 163, Bhosale Garden Road, Bhosale Nagar, Hadapsar, Pune - 411028",
    phone: "+91 020-2764 3322",
    email: "hadapsar@pulsecare.in",
    tag: "New Branch",
    tagColor: "#c0392b",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  },
];

const LocationsSection = () => {
  return (
    <section id="locations" className="bg-white py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3">
            Find Us Near You
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Our Locations
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            PulseCare hospitals across Maharashtra — bringing world-class care closer to you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={loc.img}
                  alt={loc.name}
                  className="w-full h-44 object-cover"
                />
                <span
                  className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: loc.tagColor }}
                >
                  {loc.tag}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base mb-0.5">{loc.name}</h3>
                <p className="text-[#1a6fa8] text-xs font-semibold mb-3">{loc.city}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <IconMapPin size={14} className="text-gray-400 mt-0.5 shrink-0" stroke={1.5} />
                    <p className="text-gray-500 text-xs leading-relaxed">{loc.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone size={14} className="text-gray-400 shrink-0" stroke={1.5} />
                    <p className="text-gray-600 text-xs font-medium">{loc.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMail size={14} className="text-gray-400 shrink-0" stroke={1.5} />
                    <p className="text-gray-600 text-xs">{loc.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    flex={1} variant="filled" color="#1a6fa8"
                    size="xs" radius="md"
                    component="a"
                    href="/find-doctor"
                  >
                    Book Here
                  </Button>
                  <Button
                    flex={1} variant="outline" color="#1a6fa8"
                    size="xs" radius="md"
                    component="a"
                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                    target="_blank"
                  >
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;