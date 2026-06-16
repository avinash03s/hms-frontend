import { IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import { Button, Skeleton } from "@mantine/core";
import { useEffect, useState } from "react";
import axiosInstance from "../../interceptor/AxiosInterceptor";

const HOSPITAL_IMAGES = [
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
  "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&q=80",
];

const LocationsSection = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/api/hospitals")
      .then((res) => {
        setLocations(res.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="locations" className="bg-white py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Skeleton height={176} />
                <div className="p-5">
                  <Skeleton height={16} mb={8} />
                  <Skeleton height={12} width="40%" mb={16} />
                  <Skeleton height={12} mb={6} />
                  <Skeleton height={12} mb={6} />
                  <Skeleton height={12} mb={16} />
                  <Skeleton height={32} radius="md" />
                </div>
              </div>
            ))
          ) : locations.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <p className="font-semibold">No locations found</p>
            </div>
          ) : (
            locations.map((loc, index) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={loc.imageUrl || HOSPITAL_IMAGES[index % HOSPITAL_IMAGES.length]}
                    alt={loc.name}
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full bg-[#1a6fa8]">
                    {loc.city}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-0.5">{loc.name}</h3>
                  <p className="text-[#1a6fa8] text-xs font-semibold mb-3">{loc.city}</p>

                  <div className="space-y-2 mb-4">
                    {loc.address && (
                      <div className="flex items-start gap-2">
                        <IconMapPin size={14} className="text-gray-400 mt-0.5 shrink-0" stroke={1.5} />
                        <p className="text-gray-500 text-xs leading-relaxed">{loc.address}</p>
                      </div>
                    )}
                    {loc.phone && (
                      <div className="flex items-center gap-2">
                        <IconPhone size={14} className="text-gray-400 shrink-0" stroke={1.5} />
                        <p className="text-gray-600 text-xs font-medium">{loc.phone}</p>
                      </div>
                    )}
                    {loc.email && (
                      <div className="flex items-center gap-2">
                        <IconMail size={14} className="text-gray-400 shrink-0" stroke={1.5} />
                        <p className="text-gray-600 text-xs">{loc.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      flex={1} variant="filled" color="#1a6fa8"
                      size="xs" radius="md"
                      component="a"
                      href={`/find-doctor?hospitalId=${loc.id}`}
                    >
                      Book Here
                    </Button>
                    <Button
                      flex={1} variant="outline" color="#1a6fa8"
                      size="xs" radius="md"
                      component="a"
                      href={`https://maps.google.com/?q=${encodeURIComponent(loc.address || loc.name)}`}
                      target="_blank"
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;