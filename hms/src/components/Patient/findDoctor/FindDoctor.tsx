import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextInput, Select, Button, Skeleton } from "@mantine/core";
import {
  IconSearch, IconStethoscope, IconCalendarTime,
  IconStar, IconMapPin, IconPhone,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useSelector } from "react-redux";
import axiosInstance from "../../../interceptor/AxiosInterceptor";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";
import BookAppointmentModal from "../../utility/BookAppointmentModal";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  specialization: string;
  department: string;
  totalExperience: number;
  address: string;
  active: boolean;
  profilePictureId?: number;
}

const specializations = [
  "All Specializations","Cardiology","Neurology","Orthopaedics",
  "Oncology","Gynaecology","Urology","Pulmonology","Endocrinology",
  "General Medicine","Paediatrics","Ophthalmology","Dermatology",
];


const DoctorCard = ({
  doctor,
  onBook,
}: {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}) => {
  const navigate = useNavigate();

  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="h-1.5 bg-[#1a6fa8]" />
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0 text-[#1a6fa8] font-extrabold text-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5">
              Dr. {doctor.name}
            </h3>
            <p className="text-[#1a6fa8] text-xs font-semibold mb-1">{doctor.specialization}</p>
            <p className="text-gray-400 text-xs">{doctor.department}</p>
          </div>
          {doctor.active && (
            <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full border border-green-100 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Available
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-gray-100 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <IconStar size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-gray-700">4.8</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-gray-500">
            <IconStethoscope size={14} />
            <span className="text-xs">{doctor.totalExperience} yrs exp</span>
          </div>
          {doctor.phoneNo && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-gray-500">
                <IconPhone size={14} />
                <span className="text-xs">{doctor.phoneNo}</span>
              </div>
            </>
          )}
        </div>

        {doctor.address && (
          <div className="flex items-start gap-2 mb-4">
            <IconMapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 line-clamp-1">{doctor.address}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            flex={1}
            variant="filled"
            color="#1a6fa8"
            size="xs"
            radius="md"
            leftSection={<IconCalendarTime size={14} />}
            onClick={() => onBook(doctor)}
          >
            Book Appointment
          </Button>
           <Button
            flex={1}
            variant="outline"
            color="#1a6fa8"
            size="xs"
            radius="md"
            onClick={() =>
              navigate(`/doctors/${doctor.name
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, "-")}`
              )
            }
          >
            View Profile
          </Button> 
        </div>
      </div>
    </div>
  );
};


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="h-1.5 bg-gray-100 rounded mb-5 -mx-5 -mt-5" />
    <div className="flex gap-4 mb-4">
      <Skeleton height={64} width={64} radius="lg" />
      <div className="flex-1">
        <Skeleton height={16} mb={8} />
        <Skeleton height={12} width="60%" mb={6} />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
    <Skeleton height={32} radius="md" />
  </div>
);


const FindDoctor = () => {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.jwt);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const [bookOpen, { open: openBook, close: closeBook }] = useDisclosure(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/profile/doctor/all")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data?.data || [];
        setDoctors(list);
        setFiltered(list);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const specFromUrl = searchParams.get("spec");
    if (specFromUrl) setSelectedSpec(specFromUrl);
  }, [searchParams]);

  useEffect(() => {
    let result = [...doctors];
    if (search.trim()) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
          d.department?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedSpec && selectedSpec !== "All Specializations") {
      result = result.filter(
        (d) => d.specialization?.toLowerCase() === selectedSpec.toLowerCase()
      );
    }
    setFiltered(result);
  }, [search, selectedSpec, doctors]);

  const handleBook = (doctor: Doctor) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setSelectedDoctor({ id: String(doctor.id), name: doctor.name });
    openBook();
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="relative py-12 px-4 sm:px-6 lg:px-12 text-white overflow-hidden min-h-[300px]">
        <img
          src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80"
          alt="doctor background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <p className="text-blue-200 text-xs font-bold tracking-[0.2em] uppercase mb-2">
            Our Specialists
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">
            Find & Book a Doctor
          </h1>
          <p className="text-blue-100 text-sm mb-8 max-w-lg">
            Search from our network of expert doctors across all specializations.
          </p>
          <div className="flex flex-col gap-3 max-w-xl">
            <TextInput
              placeholder="Search by preferred doctor's name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} stroke={1.5} />}
              radius="md"
              size="md"
              styles={{ input: { background: "white", border: "none", fontSize: 14 } }}
            />
            <Select
              placeholder="All Specializations"
              data={specializations}
              value={selectedSpec}
              onChange={(v) => setSelectedSpec(v ?? null)}
              clearable
              radius="md"
              size="md"
              styles={{ input: { background: "white", border: "none" } }}
            />
            <div>
              <Button
                radius="md"
                size="md"
                style={{ background: "#c0152a", color: "white", fontWeight: 700 }}
                leftSection={<IconSearch size={16} />}
              >
                Find A Doctor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 w-full flex-1">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          {loading
            ? "Loading doctors..."
            : `${filtered.length} Doctor${filtered.length !== 1 ? "s" : ""} Found`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <p className="font-semibold text-lg">No doctors found</p>
            <p className="text-sm mt-1">Try different keywords or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      <Footer />

  
      <BookAppointmentModal
        opened={bookOpen}
        onClose={closeBook}
        doctorId={selectedDoctor?.id}
        doctorName={selectedDoctor?.name}
      />
    </div>
  );
};

export default FindDoctor;