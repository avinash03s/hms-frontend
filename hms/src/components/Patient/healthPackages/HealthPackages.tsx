import { useEffect, useRef, useState } from "react";
import { Button, TextInput, Select, Skeleton, Badge, Modal, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch, IconTestPipe, IconUsers, IconArrowRight,
  IconStar, IconFilter, IconX, IconPackage,
} from "@tabler/icons-react";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";
import axiosInstance from "../../../interceptor/AxiosInterceptor";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { bookPackage } from "../../../service/HealthPackageService";
import { errorNotification, successNotification } from "../../../utility/Notification";
import AIChatBot from "../../utility/AIChatBot";


interface HealthPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  idealFor: string;
  ageGroup: string;
  parameters: number;
  tests: string[];
  imageUrl?: string;
  isPopular: boolean;
  isActive: boolean;
}


const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  Cancer: { bg: "#fdf2f8", text: "#9d174d", border: "#fbcfe8" },
  Cardiac: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Diabetes: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  "Women's Health": { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  General: { bg: "#e8f5f2", text: "#065f46", border: "#a7f3d0" },
  Senior: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
};

const getColor = (cat: string) =>
  categoryColor[cat] || { bg: "#f0f7ff", text: "#1a6fa8", border: "#bfdbfe" };

const inputClass =
  "w-full border-[1.5px] border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a6fa8] transition-colors";


const PackageCard = ({ pkg }: { pkg: HealthPackage }) => {
  const [expanded, setExpanded] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    patientName: "", email: "", phone: "", preferredDate: "", timeSlot: "", notes: "",
  });
  const color = getColor(pkg.category);
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);

  const handleBookNow = () => {
    if (!user?.profileId) {
      navigate("/login", { state: { from: "/health-packages" } });
      return;
    }
    open();
  };

  const handleClose = () => {
    close();
    setForm({ patientName: "", email: "", phone: "", preferredDate: "", timeSlot: "", notes: "" });
  };

  const handleSubmit = async () => {
    if (!form.patientName || !form.email || !form.phone || !form.preferredDate) {
      errorNotification("Please fill all required fields");
      return;
    }
    setBooking(true);
    try {
      await bookPackage({ packageId: pkg.id, patientId: user.profileId, ...form });
      successNotification("Package booked successfully!");
      handleClose();
      navigate("/patient/packages");
    } catch (err: any) {
      errorNotification(err?.response?.data?.errorMessage || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      {/* ── Booking Modal ── */}
      <Modal
        opened={opened}
        onClose={handleClose}
        centered
        radius="xl"
        size="lg"
        title={
          <div>
            <p className="font-bold text-lg text-[#1a6fa8]">Book Health Package</p>
            <p className="text-xs text-gray-400 mt-0.5">{pkg.name}</p>
          </div>
        }
      >
        <LoadingOverlay visible={booking} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
            <input className={inputClass} placeholder="Enter your full name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email *</label>
            <input type="email" className={inputClass} placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Mobile *</label>
            <input className={inputClass} placeholder="Enter 10-digit mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Preferred Date *</label>
            <input type="date" className={inputClass}
              value={form.preferredDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Time Slot *</label>
            <select className={inputClass}
              value={form.timeSlot}
              onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
              <option value="">Select time slot</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Notes</label>
            <input className={inputClass} placeholder="Any special notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* Package summary */}
        <div className="mt-5 bg-[#f4f7fb] rounded-xl px-4 py-3 flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Selected Package</p>
            <p className="font-bold text-gray-900 text-sm">{pkg.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{pkg.parameters} parameters • {pkg.idealFor}</p>
          </div>
          <p className="text-xl font-extrabold text-[#1a6fa8]">₹{pkg.price.toLocaleString()}</p>
        </div>

        <Button
          fullWidth color="#1a6fa8" radius="md" size="md" mt="md"
          loading={booking}
          onClick={handleSubmit}
        >
          Confirm Booking
        </Button>
      </Modal>

  
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">

        <div className="h-1.5 w-full" style={{ background: color.text }} />

        <div className="relative h-44 overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color.bg}, white)`,
              display: pkg.imageUrl ? "none" : "flex",
            }}
          >
            <IconPackage size={48} stroke={1} style={{ color: color.text, opacity: 0.4 }} />
            <p className="text-xs font-semibold mt-2" style={{ color: color.text }}>
              {pkg.category}
            </p>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md">
            <p className="text-base font-extrabold" style={{ color: color.text }}>
              ₹{pkg.price.toLocaleString()}/-
            </p>
          </div>

          {pkg.isPopular && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#c0392b] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <IconStar size={11} /> Popular
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block border w-fit"
            style={{ background: color.bg, color: color.text, borderColor: color.border }}
          >
            {pkg.category}
          </span>

          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">{pkg.name}</h3>

          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{pkg.description}</p>

          <div className="flex items-center gap-4 py-3 border-y border-gray-100 mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <IconTestPipe size={14} stroke={1.5} />
              <span className="text-xs">{pkg.parameters} parameters</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-gray-500">
              <IconUsers size={14} stroke={1.5} />
              <span className="text-xs">{pkg.idealFor}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-xs text-gray-500">{pkg.ageGroup}</span>
          </div>

          {pkg.tests && pkg.tests.length > 0 && (
            <div className="mb-4">
              <ul className="space-y-1">
                {(expanded ? pkg.tests : pkg.tests.slice(0, 3)).map((test) => (
                  <li key={test} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color.text }} />
                    {test}
                  </li>
                ))}
              </ul>
              {pkg.tests.length > 3 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-semibold mt-2 hover:underline"
                  style={{ color: color.text }}
                >
                  {expanded ? "Show less" : `+${pkg.tests.length - 3} more tests`}
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button
              flex={1} variant="filled" color="#1a6fa8" size="xs" radius="md"
              rightSection={<IconArrowRight size={13} />}
              onClick={handleBookNow}
            >
              Book Now
            </Button>
            <Button
              flex={1} variant="outline" color="#1a6fa8" size="xs" radius="md"
              onClick={() => navigate(`/health-packages/${pkg.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <div className="h-1.5 bg-gray-200" />
    <Skeleton height={176} radius={0} />
    <div className="p-5">
      <Skeleton height={10} width="30%" mb={10} radius="xl" />
      <Skeleton height={14} mb={8} />
      <Skeleton height={10} width="80%" mb={16} />
      <Skeleton height={1} mb={12} />
      <Skeleton height={32} radius="md" />
    </div>
  </div>
);


const HealthPackagesPage = () => {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const packagesRef = useRef<HealthPackage[]>([]);
  const [filtered, setFiltered] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    axiosInstance.get("/api/packages")
      .then((res) => {
        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setPackages(list);
        packagesRef.current = list;
        const cats = [...new Set(list.map((p: HealthPackage) => p.category))] as string[];
        setCategories(cats);
        setFiltered(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...packagesRef.current];
    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedGender) result = result.filter((p) => p.idealFor === selectedGender || p.idealFor === "Both");
    setFiltered(result);
  }, [search, selectedCategory, selectedGender]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedGender(null);
  };

  const hasFilters = search || selectedCategory || selectedGender;

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <img
          src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1600&q=80"
          alt="Health Packages"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(10,30,80,0.85) 0%, rgba(10,30,80,0.55) 60%, rgba(10,30,80,0.2) 100%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Preventive Healthcare
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3 max-w-2xl">
            Preventive Health<br />
            <span className="text-yellow-300">Checkup Packages</span>
          </h1>
          <p className="text-blue-100 text-sm max-w-lg mb-8 leading-relaxed">
            Comprehensive health screenings designed by specialists — safeguard your health with preventive care solutions for lifelong wellness.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <TextInput
              flex={1}
              placeholder="Search packages by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} stroke={1.5} />}
              radius="md" size="md"
              styles={{ input: { background: "white", border: "none" } }}
            />
            <Button radius="md" size="md" color="white" c="#1a6fa8"
              leftSection={<IconSearch size={16} />}>
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <IconFilter size={16} className="text-gray-400 shrink-0" />
          <span className="text-sm font-semibold text-gray-600 shrink-0">Filter by:</span>
          <Select
            placeholder="All Categories"
            data={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable size="sm" radius="md"
            style={{ minWidth: 160 }}
          />
          <Select
            placeholder="All Gender"
            data={["Male", "Female", "Both"]}
            value={selectedGender}
            onChange={setSelectedGender}
            clearable size="sm" radius="md"
            style={{ minWidth: 130 }}
          />
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-red-500 font-semibold border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors">
              <IconX size={12} /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 font-medium">
            {loading ? "Loading..." : `${filtered.length} package${filtered.length !== 1 ? "s" : ""} found`}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 w-full flex-1">
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && <Badge color="blue" variant="light" size="sm">Search: "{search}"</Badge>}
            {selectedCategory && <Badge color="teal" variant="light" size="sm">{selectedCategory}</Badge>}
            {selectedGender && <Badge color="violet" variant="light" size="sm">{selectedGender}</Badge>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <IconPackage size={32} stroke={1.5} className="text-[#1a6fa8]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Packages Found</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-4">
              {hasFilters
                ? "No packages match your filters. Try clearing them."
                : "No health packages added yet. Admin can add packages from the dashboard."}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-[#1a6fa8] font-semibold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <AIChatBot />
    </div>
  );
};

export default HealthPackagesPage;