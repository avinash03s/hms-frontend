import { useEffect, useRef, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mantine/core";
import {
  IconHeart,
  IconBrain,
  IconBone,
  IconEye,
  IconMicroscope,
  IconStethoscope,
  IconLungs,
  IconActivityHeartbeat,
  IconMan,
  IconWoman,
  IconShieldPlus,
  IconEar,
  IconRadioactive,
  IconPill,
  IconScissors,
  IconMoodSmile,

  IconSunglasses,
  IconArrowRight,
  IconSearch,
  IconUsers,
  IconBabyBottle,
} from "@tabler/icons-react";
import { getAllDoctors } from "../../../service/DoctorProfileService";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";


interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: string;
  totalExperience: number;
  active: boolean;
}

interface SpecialityGroup {
  name: string;
  icon: JSX.Element;
  doctorCount: number;
  doctors: Doctor[];
}

const iconMap: Record<string, JSX.Element> = {
  Cardiology: <IconHeart size={32} stroke={1.5} />,
  Neurology: <IconBrain size={32} stroke={1.5} />,
  Orthopedics: <IconBone size={32} stroke={1.5} />,
  Orthopaedics: <IconBone size={32} stroke={1.5} />,
  Pediatrics: <IconBabyBottle size={32} stroke={1.5} />,
  Dermatology: <IconSunglasses size={32} stroke={1.5} />,
  "General Surgery": <IconScissors size={32} stroke={1.5} />,
  Surgery: <IconScissors size={32} stroke={1.5} />,
  Psychiatry: <IconMoodSmile size={32} stroke={1.5} />,
  Radiology: <IconRadioactive size={32} stroke={1.5} />,
  Gynecology: <IconWoman size={32} stroke={1.5} />,
  Gynaecology: <IconWoman size={32} stroke={1.5} />,
  Ophthalmology: <IconEye size={32} stroke={1.5} />,
  Urology: <IconMan size={32} stroke={1.5} />,
  Pulmonology: <IconLungs size={32} stroke={1.5} />,
  Oncology: <IconMicroscope size={32} stroke={1.5} />,
  Endocrinology: <IconActivityHeartbeat size={32} stroke={1.5} />,
  "General Medicine": <IconStethoscope size={32} stroke={1.5} />,
  "Critical Care": <IconShieldPlus size={32} stroke={1.5} />,
  ENT: <IconEar size={32} stroke={1.5} />,
  Anesthesiology: <IconPill size={32} stroke={1.5} />,
  Pathology: <IconMicroscope size={32} stroke={1.5} />,
  "Emergency Medicine": <IconShieldPlus size={32} stroke={1.5} />,
};

const defaultIcon = <IconStethoscope size={32} stroke={1.5} />;


const SpecialityCard = ({
  spec,
  onClick,
}: {
  spec: SpecialityGroup;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1a6fa8]/40 hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a6fa8] mb-4 group-hover:bg-[#1a6fa8] group-hover:text-white transition-all duration-200">
      {iconMap[spec.name] || defaultIcon}
    </div>
    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#1a6fa8] transition-colors">
      {spec.name}
    </h3>
    <p className="text-xs text-gray-400 mb-3">
      {spec.doctorCount} Doctor{spec.doctorCount !== 1 ? "s" : ""}
    </p>
    <span className="text-xs font-semibold text-[#1a6fa8] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      View Doctors <IconArrowRight size={12} />
    </span>
  </div>
);


const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  const navigate = useNavigate();
  const initials = doctor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#1a6fa8] font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">Dr. {doctor.name}</p>
        <p className="text-xs text-gray-400">{doctor.department} · {doctor.totalExperience} yrs exp</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doctor.active && (
          <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Available
          </span>
        )}
        <button
          onClick={() => navigate("/find-doctor")}
          className="text-xs font-semibold text-[#1a6fa8] border border-[#1a6fa8] px-3 py-1.5 rounded-lg hover:bg-[#1a6fa8] hover:text-white transition-colors"
        >
          Book
        </button>
      </div>
    </div>
  );
};


const Specialities = () => {
  const [specialities, setSpecialities] = useState<SpecialityGroup[]>([]);
  const [filtered, setFiltered] = useState<SpecialityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const allRef = useRef<SpecialityGroup[]>([]);

  // Fetch all doctors ONCE → group by specialization
  useEffect(() => {
    setLoading(true);

    getAllDoctors()
      .then((res) => {
        const doctors: Doctor[] = Array.isArray(res)
          ? res
          : res?.data || [];

        const groupMap: Record<string, Doctor[]> = {};

        doctors.forEach((doc) => {
          const key = doc.specialization || "General Medicine";
          if (!groupMap[key]) groupMap[key] = [];
          groupMap[key].push(doc);
        });

        const groups: SpecialityGroup[] = Object.entries(groupMap)
          .map(([name, docs]) => ({
            name,
            icon: iconMap[name] || defaultIcon,
            doctorCount: docs.length,
            doctors: docs.sort((a, b) => b.totalExperience - a.totalExperience),
          }))
          .sort((a, b) => b.doctorCount - a.doctorCount);

        allRef.current = groups;
        setSpecialities(groups);
        setFiltered(groups);
      })
      .catch((err) => {
        console.log("Doctor API error:", err);
        setSpecialities([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter — only depends on search, NOT specialities state
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(allRef.current);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      allRef.current.filter((s) => s.name.toLowerCase().includes(q))
    );
  }, [search]);

  const totalDoctors = allRef.current.reduce((sum, s) => sum + s.doctorCount, 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
        <img
          src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80"
          alt="Specialities"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(10,30,80,0.88) 0%, rgba(10,30,80,0.55) 60%, rgba(10,30,80,0.2) 100%)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Clinical Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Centres of Clinical<br />
            <span className="text-yellow-300">Excellence</span>
          </h1>
          <p className="text-blue-100 text-sm max-w-lg mb-8 leading-relaxed">
            Specialised care delivered by expert doctors across all major medical disciplines at PulseCare.
          </p>

          <div className="flex flex-wrap gap-8">
            {[
              { value: specialities.length, label: "Specialities" },
              { value: totalDoctors, label: "Expert Doctors" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white text-3xl font-extrabold leading-none">{stat.value}+</p>
                <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <TextInputInline
            value={search}
            onChange={setSearch}
            placeholder="Search speciality..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-red-500 font-semibold flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <IconSearch size={12} /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {loading ? "Loading..." : `${filtered.length} specialit${filtered.length !== 1 ? "ies" : "y"} · ${totalDoctors} doctors`}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 w-full flex-1">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3">
                <Skeleton height={64} width={64} radius="lg" />
                <Skeleton height={12} width="70%" />
                <Skeleton height={10} width="40%" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <IconStethoscope size={32} stroke={1.5} className="text-[#1a6fa8]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Specialities Found</h3>
            <p className="text-gray-400 text-sm">Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {filtered.map((spec) => (
                <SpecialityCard
                  key={spec.name}
                  spec={spec}
                  onClick={() =>
                    setSelectedSpec(selectedSpec === spec.name ? null : spec.name)
                  }
                />
              ))}
            </div>

            {selectedSpec && (
              <div className="bg-white rounded-2xl border border-[#1a6fa8]/20 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a6fa8]">
                      {iconMap[selectedSpec] || defaultIcon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedSpec}</h2>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <IconUsers size={12} />
                        {allRef.current.find((s) => s.name === selectedSpec)?.doctorCount} Doctors Available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSpec(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allRef.current
                    .find((s) => s.name === selectedSpec)
                    ?.doctors.map((doc) => (
                      <DoctorCard key={doc.id} doctor={doc} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

const TextInputInline = ({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2" style={{ minWidth: 260 }}>
    <IconSearch size={15} className="text-gray-400 shrink-0" stroke={1.5} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 flex-1"
    />
  </div>
);

export default Specialities;