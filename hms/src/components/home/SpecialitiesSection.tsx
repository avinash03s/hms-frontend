import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../interceptor/AxiosInterceptor";
import {
  IconHeart, IconBrain, IconBone, IconMan,
  IconTestPipe, IconStethoscope, IconMicroscope,
  IconEye, IconWoman,
} from "@tabler/icons-react";

const SPECIALIZATIONS = [
  { name: "Cardiology",       icon: <IconHeart size={28} stroke={1.5} /> },
  { name: "Neurology",        icon: <IconBrain size={28} stroke={1.5} /> },
  { name: "Orthopedics",      icon: <IconBone size={28} stroke={1.5} /> },
  { name: "Pediatrics",       icon: <IconMan size={28} stroke={1.5} /> },
  { name: "Dermatology",      icon: <IconTestPipe size={28} stroke={1.5} /> },
  { name: "General Surgery",  icon: <IconStethoscope size={28} stroke={1.5} /> },
  { name: "Psychiatry",       icon: <IconBrain size={28} stroke={1.5} /> },
  { name: "Radiology",        icon: <IconMicroscope size={28} stroke={1.5} /> },
  { name: "Gynecology",       icon: <IconWoman size={28} stroke={1.5} /> },
  { name: "Ophthalmology",    icon: <IconEye size={28} stroke={1.5} /> },
];

const SpecialitiesSection = () => {
  const navigate = useNavigate();
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axiosInstance
    .get("/profile/doctor/all")
    .then((res) => {
      console.log("API RESPONSE:", res.data);

      const list =
        Array.isArray(res.data)
          ? res.data
          : res.data?.data
          ? res.data.data
          : res.data?.result
          ? res.data.result
          : [];

      const map: Record<string, number> = {};

      list.forEach((d: any) => {
        const spec = d?.specialization?.trim();
        if (spec) {
          map[spec] = (map[spec] || 0) + 1;
        }
      });

      setCountMap(map);
    })
    .catch((err) => {
      console.error("API ERROR:", err);
      setCountMap({});
    })
    .finally(() => setLoading(false));
}, []);

  return (
    <section id="specialities" className="bg-[#f4f7fb] py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3">
              Our Specialities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Explore our Centres of<br className="hidden sm:block" /> Clinical Excellence
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg">
              Specialised care delivered by expert doctors across all major medical disciplines.
            </p>
          </div>
          <button
            onClick={() => navigate("/find-doctor")}
            className="text-sm font-semibold text-[#1a6fa8] border border-[#1a6fa8] px-5 py-2.5 rounded-md hover:bg-[#1a6fa8] hover:text-white transition-colors"
          >
            View All Departments →
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array(11).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">

            {/* 10 fixed specializations with backend count */}
            {SPECIALIZATIONS.map((spec) => {
              const count = countMap[spec.name] ?? 0;
              return (
                <button
                  key={spec.name}
                  onClick={() => navigate(`/find-doctor?spec=${encodeURIComponent(spec.name)}`)}
                  className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#1a6fa8]/40 hover:shadow-lg transition-all duration-200 group text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a6fa8] group-hover:bg-[#1a6fa8] group-hover:text-white transition-all duration-200">
                    {spec.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-[#1a6fa8] transition-colors">
                      {spec.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {count} Doctor{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* View All card */}
            {/* <button
              onClick={() => navigate("/find-doctor")}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#1a6fa8]/40 hover:shadow-lg transition-all duration-200 group text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a6fa8] group-hover:bg-[#1a6fa8] group-hover:text-white transition-all duration-200">
                <IconPlus size={28} stroke={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-[#1a6fa8] transition-colors">
                  View All
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {SPECIALIZATIONS.length}+ Depts
                </p>
              </div>
            </button> */}

          </div>
        )}
      </div>
    </section>
  );
};

export default SpecialitiesSection;