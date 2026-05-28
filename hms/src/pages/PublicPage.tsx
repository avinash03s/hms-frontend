import { Button, } from "@mantine/core";import {
  IconActivityHeartbeat,
  IconCalendarTime,

  IconFile,

  IconHeartbeat,
  IconShieldCheck,
  IconStethoscope,
  IconMessageChatbot,
  IconFolderHeart,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import AIChatBot from "../components/utility/AIChatBot";

const features = [
  {
    title: "Appointment Scheduling",
    description:
      "Manage patient appointments efficiently with smart scheduling and reminders.",
    icon: <IconCalendarTime size={28} />,
  },
  {
    title: "Prescriptions Records",
    description:
      "Securely maintain patient history, reports, prescriptions, and treatment data.",
    icon: <IconFile size={28} />,
  },
  {
    title: "Doctor Management",
    description:
      "Track doctor availability, departments, specializations, and workflows.",
    icon: <IconStethoscope size={28} />,
  },
  {
    title: "Patient Monitoring",
    description:
      "Monitor patient status and healthcare analytics in real-time.",
    icon: <IconActivityHeartbeat size={28} />,
  },
  {
    title: "Secure Healthcare System",
    description:
      "Protect sensitive medical data with enterprise-level security standards.",
    icon: <IconShieldCheck size={28} />,
  },
  {
    title: "AI Medicine Assistant",
    description:
      "Enable patients to instantly get medicine information, dosage guidance, usage instructions, and healthcare support through an intelligent AI-powered chatbot.",
    icon: <IconMessageChatbot size={28} />,
  },
  {
    title: "Digital Prescription",
    description:
      "Generate and manage secure digital prescriptions with easy access for patients and doctors.",
    icon: <IconFile size={28} />,
  },

  {
    title: "Patient Records",
    description:
      "Maintain centralized patient history, reports, diagnosis, and treatment records securely.",
    icon: <IconFolderHeart size={28} />,
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 overflow-hidden">

      {/* HEADER */}
      {/* HEADER */}
      <header
        className="
    fixed
    top-0
    left-0
    w-full
    z-50
    flex
    items-center
    justify-between
    px-4
    sm:px-6
    lg:px-10
    py-4
    border-b
    border-white/10
    bg-[#050816]/90
    backdrop-blur-xl
  "
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <IconHeartbeat
            size={28}
            stroke={2.5}
            className="text-primary-500"
          />

          <span
            className="
        text-lg
        sm:text-xl
        font-extrabold
        text-white
        tracking-tight
      "
          >
            PulseCare
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* Nav */}
          <div className="hidden md:flex items-center gap-5">
            {["Home", "Feature", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="
            text-sm
            text-slate-300
            hover:text-primary-500
            transition-colors
            font-medium
          "
              >
                {item}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                radius="xl"
                size="xs"
                className="sm:!text-sm"
                styles={{
                  root: {
                    color: "#e2e8f0",
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "transparent",
                  },
                }}
              >
                Log in
              </Button>
            </Link>

            <Link to="/register">
              <Button
                radius="xl"
                size="xs"
                className="sm:!text-sm"
                color="#24AE9E"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main id="home" className="flex-1 relative pt-24">

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=85"
          alt="Healthcare professional"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-center
          "
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(5,10,20,0.82) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0.25) 100%)",
          }}
        />

        {/* Content Wrapper */}
        <div
          className="
          relative
          z-10
          w-full
          min-h-screen
          flex
          items-center
          px-4
          sm:px-8
          lg:px-12
          py-10
        "
        >
          {/* Hero Card */}
          <div
            className="
              w-full
              max-w-xl
              rounded-3xl
              p-6
              sm:p-8
              lg:p-10
              border
              backdrop-blur-xl
            "
            style={{
              background: "rgba(10,15,30,0.72)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <p
              className="
              text-slate-400
              text-[10px]
              sm:text-xs
              font-bold
              tracking-[0.25em]
              uppercase
              mb-3
            "
            >
              Healthcare
            </p>

            <h1
              className="
              text-3xl
              sm:text-5xl
              font-extrabold
              text-white
              leading-tight
              mb-4
            "
            >
              Your health,
              <br />
              <span className="text-primary-500">
                our priority
              </span>
            </h1>

            <div
              className="
              w-14
              h-1
              bg-primary-500
              rounded-full
              mb-5
            "
            />

            <p
              className="
              text-slate-200
              text-sm
              sm:text-base
              font-semibold
              mb-3
            "
            >
              Make Your Care Connected, Visible, and Intelligent
            </p>

            <p
              className="
              text-slate-400
              text-sm
              sm:text-base
              leading-relaxed
              mb-8
            "
            >
              Empower your organisation with a clear view of what matters most.
              Create a more connected and supportive environment for your care
              teams, and unlock the full potential of your resources.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/register"
                className="w-full sm:w-auto"
              >
                <Button
                  fullWidth
                  radius="xl"
                  size="md"
                  color="#24AE9E"
                >
                  Get Started — Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES */}
      {/* FEATURES */}
      <section
        id="feature"
        className="
    relative
    z-10
    px-4
    sm:px-8
    lg:px-12
    py-20
    overflow-hidden
  "
      >

        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#050816]/90 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-primary-500 uppercase tracking-[0.25em] text-xs font-bold mb-3">
              Features
            </p>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Healthcare Management
              <span className="text-primary-500"> Features</span>
            </h2>

            <p className="text-slate-300 max-w-2xl mx-auto">
              Powerful HMS modules designed to simplify hospital workflows,
              improve patient care, and optimize healthcare operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="
            rounded-3xl
            border
            border-white/10
            bg-black/40
            backdrop-blur-xl
            p-6
            hover:border-primary-500/40
            transition-all
            duration-300
            hover:-translate-y-1
          "
              >
                <div className="text-primary-500 mb-5">
                  {feature.icon}
                </div>

                <h3 className="text-white text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        className="
    relative
    px-4
    sm:px-8
    lg:px-12
    py-20
    overflow-hidden
  "
      >

        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#08101f]/90 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-14">
            <p className="text-primary-500 uppercase tracking-[0.25em] text-xs font-bold mb-3">
              Why PulseCare
            </p>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Smart Healthcare
              <span className="text-primary-500"> Experience</span>
            </h2>

            <p className="text-slate-300 max-w-2xl mx-auto">
              Modern hospital management powered by intelligent automation,
              secure patient data, and AI-driven healthcare solutions.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
              <h3 className="text-4xl font-extrabold text-primary-500 mb-3">
                10K+
              </h3>

              <p className="text-white font-semibold mb-2">
                Patients Managed
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                Efficiently manage thousands of patient records securely.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
              <h3 className="text-4xl font-extrabold text-primary-500 mb-3">
                250+
              </h3>

              <p className="text-white font-semibold mb-2">
                Doctors Connected
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                Seamlessly coordinate doctors and healthcare departments.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
              <h3 className="text-4xl font-extrabold text-primary-500 mb-3">
                AI Powered
              </h3>

              <p className="text-white font-semibold mb-2">
                Medicine Assistant
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                Intelligent chatbot support for medicine and healthcare queries.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
              <h3 className="text-4xl font-extrabold text-primary-500 mb-3">
                99.9%
              </h3>

              <p className="text-white font-semibold mb-2">
                Secure Platform
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                Enterprise-grade security for healthcare data protection.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="
    relative
    px-4
    sm:px-8
    lg:px-12
    py-24
    overflow-hidden
  "
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#07101d]/90" />

        <div className="relative z-10 max-w-6xl mx-auto">

          <div
            className="
        grid
        lg:grid-cols-2
        gap-10
        items-center
      "
          >

            {/* LEFT SIDE */}
            <div>

              <p className="text-primary-500 uppercase tracking-[0.25em] text-xs font-bold mb-4">
                Contact Us
              </p>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
                Let's Build
                <span className="text-primary-500"> Smarter Healthcare</span>
              </h2>

              <p className="text-slate-300 leading-relaxed mb-8 max-w-lg">
                PulseCare helps hospitals and clinics streamline appointments,
                patient records, prescriptions, and healthcare operations with a
                modern intelligent platform.
              </p>

              <div className="flex flex-col gap-5">

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                    <IconHeartbeat size={22} className="text-primary-500" />
                  </div>

                  <div>
                    <p className="text-white font-semibold">
                      Healthcare Support
                    </p>

                    <p className="text-slate-400 text-sm">
                      Available for hospitals, clinics & medical staff.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                    <IconMessageChatbot size={22} className="text-primary-500" />
                  </div>

                  <div>
                    <p className="text-white font-semibold">
                      AI Medicine Assistant
                    </p>

                    <p className="text-slate-400 text-sm">
                      Smart medicine guidance and patient support system.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE */}
            <div
              className="
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          p-8
          lg:p-10 ">

              <div className="space-y-6">

                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">
                    Company
                  </p>

                  <h3 className="text-white text-xl font-bold">
                    AS-DEVELOPER
                  </h3>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">
                    Email
                  </p>

                  <h3 className="text-white text-lg font-semibold break-all">
                    surwaseavinash85@gmail.com
                  </h3>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">
                    Phone
                  </p>

                  <h3 className="text-white text-lg font-semibold">
                    +91 XXXXX XXXXX
                  </h3>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">
                    Location
                  </p>

                  <h3 className="text-white text-lg font-semibold">
                    Pune, Maharashtra
                  </h3>
                </div>

                <div className="pt-4">
                  <a
                    href="mailto:surwaseavinash85@gmail.com?subject=PulseCare%20Inquiry&body=Hello%20PulseCare%20Team,"
                  >
                    <Button
                      fullWidth
                      radius="xl"
                      size="md"
                      color="#24AE9E"
                    >
                      Contact Our Team
                    </Button>
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="
        flex
        flex-col
        sm:flex-row
        items-center
        justify-between
        gap-3
        px-4
        sm:px-6
        lg:px-10
        py-4
        border-t
        border-white/5
        bg-[#050816]
      "
      >
        <span
          className="
          text-slate-600
          text-xs
          text-center
        "
        >
          © 2026 PulseCare. All rights reserved.
        </span>

        <div
          className="
          flex
          items-center
          gap-4
          sm:gap-5
          flex-wrap
          justify-center
        "
        >
          {["Privacy", "Terms", "Security"].map((item) => (
            <span
              key={item}
              className="
                text-slate-600
                text-xs
                cursor-pointer
                hover:text-slate-400
                transition-colors
              "
            >
              {item}
            </span>
          ))}
        </div>
      </footer>
      <AIChatBot/>
    </div>
  );
};

export default HomePage;