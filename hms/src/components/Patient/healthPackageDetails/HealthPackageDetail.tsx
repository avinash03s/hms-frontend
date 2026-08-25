import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Skeleton, Badge, LoadingOverlay, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft, IconCheck, IconTestPipe,
  IconUsers, IconStar, IconArrowRight, IconPackage,
} from "@tabler/icons-react";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";
import { getPackageById, bookPackage } from "../../../service/HealthPackageService";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { useSelector } from "react-redux";
import AIChatBot from "../../utility/AIChatBot";

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

const HealthPackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({
    fullName: "", email: "", mobile: "", appointmentDate: "", city: "", area: "",
  });

  useEffect(() => {
    getPackageById(Number(id))
      .then((res) => setPkg(res?.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    if (!user?.profileId) {
      navigate("/login", { state: { from: `/health-packages/${id}` } });
      return;
    }
    open();
  };

  const handleClose = () => {
    close();
    setForm({ fullName: "", email: "", mobile: "", appointmentDate: "", city: "", area: "" });
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.mobile || !form.appointmentDate) {
      errorNotification("Please fill all required fields");
      return;
    }
    setBooking(true);
    try {
      await bookPackage({ packageId: pkg.id, patientId: user.profileId, ...form });
      successNotification("Package booked successfully!");
      handleClose();
    } catch (err: any) {
      errorNotification(err?.response?.data?.errorMessage || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        <Skeleton height={20} width={120} mb="lg" radius="md" />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Skeleton height={8} radius={0} />
          <div className="p-8">
            <Skeleton height={28} width="60%" mb="sm" />
            <Skeleton height={14} width="40%" mb="xl" />
            <div className="grid grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} height={60} radius="md" />)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!pkg) return null;

  const color = getColor(pkg.category);

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

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
              value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email *</label>
            <input type="email" className={inputClass} placeholder="Enter your email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Mobile *</label>
            <input className={inputClass} placeholder="Enter mobile number"
              value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Appointment Date *</label>
            <input type="date" className={inputClass}
              value={form.appointmentDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">City</label>
            <input className={inputClass} placeholder="Enter city"
              value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Area</label>
            <input className={inputClass} placeholder="Enter area"
              value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </div>
        </div>

  
        <div className="mt-5 bg-[#f4f7fb] rounded-xl px-4 py-3 flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Selected Package</p>
            <p className="font-bold text-gray-900 text-sm">{pkg.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{pkg.parameters} parameters • {pkg.idealFor}</p>
          </div>
          <p className="text-xl font-extrabold text-[#1a6fa8]">₹{pkg.price?.toLocaleString()}</p>
        </div>

        <Button fullWidth color="#1a6fa8" radius="md" size="md" mt="md"
          loading={booking} onClick={handleSubmit}>
          Confirm Booking
        </Button>
      </Modal>

      <div className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a6fa8] mb-6 font-medium transition-colors">
          <IconArrowLeft size={16} /> Back to Packages
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      
          <div className="h-2 w-full" style={{ background: color.text }} />

          <div className="p-8 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                {pkg.isPopular && (
                  <div className="flex items-center gap-1 bg-[#c0392b] text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3">
                    <IconStar size={11} /> Popular
                  </div>
                )}
                <Badge variant="light" size="sm" mb="xs"
                  style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                  {pkg.category}
                </Badge>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{pkg.name}</h1>
                <p className="text-gray-500 text-sm mt-2 max-w-xl leading-relaxed">{pkg.description}</p>
              </div>

              <div className="text-right shrink-0 bg-[#f4f7fb] rounded-2xl px-6 py-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Package Price</p>
                <p className="text-3xl font-extrabold text-[#1a6fa8]">₹{pkg.price?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">per person</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500">
                <IconTestPipe size={16} stroke={1.5} />
                <span className="text-sm font-medium">{pkg.parameters} parameters</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 text-gray-500">
                <IconUsers size={16} stroke={1.5} />
                <span className="text-sm font-medium">{pkg.idealFor}</span>
              </div>
              {pkg.ageGroup && (
                <>
                  <div className="w-px h-4 bg-gray-200" />
                  <span className="text-sm text-gray-500 font-medium">{pkg.ageGroup}</span>
                </>
              )}
            </div>
          </div>

   
          {pkg.tests?.length > 0 && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Tests Included
                <span className="text-sm font-normal text-gray-400 ml-2">({pkg.tests.length} tests)</span>
              </h2>
              <p className="text-xs text-gray-400 mb-4">All tests performed by certified pathologists</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.tests.map((test: string) => (
                  <div key={test} className="flex items-center gap-3 bg-[#f4f7fb] rounded-xl px-4 py-3 border border-gray-100">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: color.bg }}>
                      <IconCheck size={13} style={{ color: color.text }} />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{test}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pkg.benefits?.length > 0 && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.benefits.map((benefit: string) => (
                  <div key={benefit} className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                      <IconCheck size={13} className="text-[#1a6fa8]" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!pkg.tests?.length && !pkg.benefits?.length && (
            <div className="p-8 border-b border-gray-100 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <IconPackage size={24} stroke={1.5} className="text-[#1a6fa8]" />
              </div>
              <p className="text-gray-400 text-sm">Detailed test information coming soon.</p>
            </div>
          )}

          <div className="p-8 bg-[#f4f7fb]">
            <Button
              fullWidth size="lg" radius="md" color="#1a6fa8"
              rightSection={<IconArrowRight size={18} />}
              onClick={handleBookNow}
            >
              Book This Package — ₹{pkg.price?.toLocaleString()}
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">
              ✓ Free cancellation &nbsp;•&nbsp; ✓ Home sample collection available
            </p>
          </div>

        </div>
      </div>

      <Footer />
      <AIChatBot />
    </div>
  );
};

export default HealthPackageDetail;