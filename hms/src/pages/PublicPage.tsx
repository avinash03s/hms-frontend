import { Button } from "@mantine/core";
import { IconHeartbeat } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 overflow-hidden">

      {/* HEADER */}
      <header className="
        flex
        items-center
        justify-between
        px-4
        sm:px-6
        lg:px-10
        py-4
        border-b
        border-white/10
        z-10
      ">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <IconHeartbeat
            size={28}
            stroke={2.5}
            className="text-primary-500"
          />

          <span className="
            text-lg
            sm:text-xl
            font-extrabold
            text-white
            tracking-tight
          ">
            PulseCare
          </span>
        </div>

        {/* Buttons */}
        <div className="
          flex
          items-center
          gap-2
          sm:gap-3
        ">
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
      </header>

      {/* HERO */}
      <main className="flex-1 relative">

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
        <div className="
          relative
          z-10
          w-full
          h-full
          flex
          items-center
          px-4
          sm:px-8
          lg:px-12
          py-10
        ">

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
            <p className="
              text-slate-400
              text-[10px]
              sm:text-xs
              font-bold
              tracking-[0.25em]
              uppercase
              mb-3
            ">
              Healthcare
            </p>

            <h1 className="
              text-3xl
              sm:text-5xl
              font-extrabold
              text-white
              leading-tight
              mb-4
            ">
              Your health,
              <br />
              <span className="text-primary-500">
                our priority
              </span>
            </h1>

            <div className="
              w-14
              h-1
              bg-primary-500
              rounded-full
              mb-5
            " />

            <p className="
              text-slate-200
              text-sm
              sm:text-base
              font-semibold
              mb-3
            ">
              Make Your Care Connected, Visible, and Intelligent
            </p>

            <p className="
              text-slate-400
              text-sm
              sm:text-base
              leading-relaxed
              mb-8
            ">
              Empower your organisation with a clear view of what matters most.
              Create a more connected and supportive environment for your care
              teams, and unlock the full potential of your resources.
            </p>

            {/* CTA */}
            <div className="
              flex
              flex-col
              sm:flex-row
              gap-3
              w-full
            ">
              <Link
                to="/register"
                className="w-full sm:w-auto"
              >
                <Button
                  fullWidth
                  radius="xl"
                  size="md"
                  color="#24AE9E"
                  rightSection={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  }
                >
                  Get Started — Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="
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
        bg-[#0a0f1e]
      ">
        <span className="
          text-slate-600
          text-xs
          text-center
        ">
          © 2026 PulseCare. All rights reserved.
        </span>

        <div className="
          flex
          items-center
          gap-4
          sm:gap-5
          flex-wrap
          justify-center
        ">
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
    </div>
  );
};

export default HomePage;