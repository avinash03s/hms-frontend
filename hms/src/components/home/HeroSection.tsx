import { Button } from "@mantine/core";
import { IconArrowRight, IconSearch, IconCalendarTime } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=85"
        alt="Healthcare"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10,30,60,0.88) 0%, rgba(10,30,60,0.65) 55%, rgba(10,30,60,0.25) 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 flex flex-col justify-center" style={{ minHeight: 520 }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-xs font-bold tracking-[0.2em] uppercase">
            NABH Accredited · Advanced Healthcare
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 max-w-2xl">
          Advanced Healthcare<br />
          for <span className="text-[#f5c842]">Every Family</span>
        </h1>

        <p className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          World-class medical expertise with compassionate doctors, cutting-edge technology, and a patient-first approach — right in your city.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link to="/login">
            <Button
              radius="md" size="md" color="#c0392b"
              leftSection={<IconCalendarTime size={18} />}
              rightSection={<IconArrowRight size={16} />}
            >
              Book Appointment
            </Button>
          </Link>
          <a href="/find-doctor">
            <Button
              radius="md" size="md" variant="outline"
              leftSection={<IconSearch size={16} />}
              styles={{ root: { color: "white", borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.08)" } }}
            >
              Find A Doctor
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 sm:gap-10">
          {[
            { value: "15+", label: "Years of Excellence" },
            { value: "200+", label: "Specialist Doctors" },
            { value: "50K+", label: "Patients Treated" },
            { value: "4", label: "City Locations" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20" />}
              <div>
                <p className="text-white text-2xl font-extrabold leading-none">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;