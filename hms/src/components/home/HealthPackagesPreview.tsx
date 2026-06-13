import { useEffect, useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { IconTestPipe, IconUsers, IconArrowRight, IconStar, IconPackage } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../interceptor/AxiosInterceptor";

interface Package {
  id: number;
  name: string;
  price: number;
  category: string;
  idealFor: string;
  parameters: number;
  isPopular: boolean;
  imageUrl?: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Cancer: { bg: "#fdf2f8", text: "#9d174d", border: "#fbcfe8" },
  Cardiac: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  General: { bg: "#e8f5f2", text: "#065f46", border: "#a7f3d0" },
  Diabetes: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  "Women's Health": { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
};

const PackageCard = ({ pkg }: { pkg: Package }) => {
  const color = categoryColors[pkg.category] || { bg: "#f4f7fb", text: "#1a6fa8", border: "#bfdbfe" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative">
      {pkg.isPopular && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#c0392b] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <IconStar size={11} /> Popular
        </div>
      )}

      <div className="h-1.5 w-full" style={{ background: color.text }} />

      <div className="relative h-40 overflow-hidden">
        {pkg.imageUrl && (
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        )}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: color.bg, display: pkg.imageUrl ? "none" : "flex" }}
        >
          <div className="text-center">
            <p className="text-4xl font-extrabold" style={{ color: color.text }}>
              ₹{pkg.price.toLocaleString()}
            </p>
            <p className="text-xs font-medium mt-1" style={{ color: color.text }}>per person</p>
          </div>
        </div>

        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md">
          <p className="text-sm font-extrabold" style={{ color: color.text }}>
            ₹{pkg.price.toLocaleString()}/-
          </p>
        </div>
      </div>

      <div className="p-5">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block border"
          style={{ background: color.bg, color: color.text, borderColor: color.border }}
        >
          {pkg.category}
        </span>

        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-4 min-h-[2.5rem]">
          {pkg.name}
        </h3>

        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500">
            <IconTestPipe size={15} stroke={1.5} />
            <span className="text-xs">{pkg.parameters} parameters</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <IconUsers size={15} stroke={1.5} />
            <span className="text-xs">{pkg.idealFor}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/health-packages" className="block w-full mt-auto">
            <Button
              fullWidth
              variant="filled"
              color="#1a6fa8"
              size="sm"
              radius="md"
              rightSection={<IconArrowRight size={14} />}
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const HealthPackagesPreview = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/packages")
      .then((res) => {
        const data = res.data?.data || res.data;
        const list: Package[] = Array.isArray(data) ? data : [];

        const popular = list.filter((p) => p.isPopular).slice(0, 3);
        setPackages(popular.length > 0 ? popular : list.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="packages" className="bg-[#f4f7fb] py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3">
              Preventive Care
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Health Packages
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Comprehensive health checkups — starting at ₹999/-
            </p>
          </div>
          <Link to="/health-packages">
            <Button
              variant="outline" color="#1a6fa8" radius="md"
              rightSection={<IconArrowRight size={15} />}
            >
              View All Packages
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-5">
                <Skeleton height={160} mb="md" radius="md" />
                <Skeleton height={12} mb="sm" />
                <Skeleton height={12} width="70%" mb="md" />
                <Skeleton height={36} radius="md" />
              </div>
            ))
          ) : packages.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <IconPackage size={28} stroke={1.5} className="text-[#1a6fa8]" />
              </div>
              <p className="text-gray-500 font-semibold mb-1">No packages available</p>
              <p className="text-gray-400 text-sm">Check back later for health packages.</p>
            </div>
          ) : (
            packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)
          )}
        </div>

      </div>
    </section>
  );
};

export default HealthPackagesPreview;