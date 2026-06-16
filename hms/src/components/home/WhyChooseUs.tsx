import {
  IconAward,
  IconUsers,
  IconStethoscope,
  IconBuildingHospital,
  IconFlask,
  IconCircleCheck,
  IconMicroscope,
  IconClock24,
  IconShieldCheck,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";

const stats = [
  { value: "15+", label: "Years of Excellence", icon: <IconAward size={24} stroke={1.5} /> },
  { value: "50K+", label: "Patients Treated", icon: <IconUsers size={24} stroke={1.5} /> },
  { value: "200+", label: "Expert Doctors", icon: <IconStethoscope size={24} stroke={1.5} /> },
  { value: "4", label: "City Locations", icon: <IconBuildingHospital size={24} stroke={1.5} /> },
  { value: "33K+", label: "Tests Conducted", icon: <IconFlask size={24} stroke={1.5} /> },
  { value: "98%", label: "Patient Satisfaction", icon: <IconCircleCheck size={24} stroke={1.5} /> },
];

const whyCards = [
  {
    icon: <IconMicroscope size={26} stroke={1.5} />,
    title: "Advanced Technology",
    desc: "Latest diagnostic equipment and cutting-edge surgical facilities for accurate treatment.",
  },
  {
    icon: <IconStethoscope size={26} stroke={1.5} />,
    title: "Expert Specialists",
    desc: "200+ experienced doctors across 30+ medical specialties at your service.",
  },
  {
    icon: <IconClock24 size={26} stroke={1.5} />,
    title: "24×7 Emergency",
    desc: "Round-the-clock emergency care with rapid response teams always ready.",
  },
  {
    icon: <IconHeartHandshake size={26} stroke={1.5} />,
    title: "Patient-First Care",
    desc: "Compassionate, personalised treatment plans designed around every patient.",
  },
];

const WhyChooseUs = () => {
  return (
    <>
      <section className="bg-[#1a6fa8] py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <div className="text-white/70">{stat.icon}</div>
              <p className="text-white text-2xl sm:text-3xl font-extrabold leading-none">{stat.value}</p>
              <p className="text-blue-200 text-xs leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-white py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80"
                alt="PulseCare Hospital"
                className="rounded-2xl w-full object-cover"
                style={{ height: 420 }}
              />
              <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-3 shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <IconAward size={22} className="text-yellow-500" stroke={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Best Hospital 2024</p>
                  <p className="text-xs text-gray-400">Maharashtra Healthcare Awards</p>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-[#1a6fa8] rounded-xl px-4 py-3 shadow-xl flex items-center gap-2">
                <IconShieldCheck size={18} className="text-white" stroke={1.5} />
                <span className="text-white text-sm font-bold">NABH Accredited</span>
              </div>
            </div>

            <div>
              <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4">
                Why PulseCare
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                Healthcare You Can<br /> Trust & Rely On
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-lg">
                We combine medical expertise with compassionate care to deliver the best outcomes for you and your family. From advanced diagnostics to expert specialists — your health is our mission.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {whyCards.map((card) => (
                  <div
                    key={card.title}
                    className="bg-[#f4f7fb] rounded-xl p-4 border border-gray-100 hover:border-[#1a6fa8]/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-[#1a6fa8] mb-2">{card.icon}</div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{card.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>

              <Link to="/register">
                <Button radius="md" size="md" color="#1a6fa8">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUs;