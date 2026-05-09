import { Button } from "@mantine/core";
import { IconHeartbeat } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: '#0f172a' }}>

      {/* Header — same dark logo */}
      <header className="flex items-center justify-between px-10 py-4 border-b z-10"
        style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <IconHeartbeat size={28} stroke={2.5} className="text-primary-500" />
          <span className="text-xl font-extrabold text-white tracking-tight">PulseCare</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" radius="xl" size="sm"
              styles={{ root: { color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.25)', background: 'transparent' } }}>
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button radius="xl" size="sm" color="#24AE9E">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Full-width Hero Image with Overlay Card */}
      <div className="flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=85"
          alt="Healthcare professional with patient"
          className="w-full h-full object-cover object-center"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(5,10,20,0.72) 0%, rgba(5,10,20,0.35) 60%, rgba(5,10,20,0.1) 100%)' }} />

        {/* Content Card — Image 2 style */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2 max-w-sm rounded-2xl p-10 border"
          style={{ background: 'rgba(10,15,30,0.78)', backdropFilter: 'blur(14px)', borderColor: 'rgba(255,255,255,0.1)' }}>

          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Healthcare</p>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Your health,<br />
            <span className="text-primary-500">our priority</span>
          </h1>

          <div className="w-12 h-0.5 bg-primary-500 rounded mb-4" />

          <p className="text-slate-300 text-sm font-semibold mb-2">
            Make Your Care Connected, Visible, and Intelligent
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-7">
            Empower your organisation with a clear view of what matters most.
            Create a more connected and supportive environment for your care teams,
            and unlock the full potential of your resources.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link to="/register">
              <Button radius="xl" color="#24AE9E" size="md" rightSection={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }>
                Get Started — Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-3 border-t"
        style={{ background: '#0a0f1e', borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-slate-700 text-xs">© 2026 PulseCare. All rights reserved.</span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Security"].map(item => (
            <span key={item} className="text-slate-700 text-xs cursor-pointer hover:text-slate-400 transition-colors">{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;