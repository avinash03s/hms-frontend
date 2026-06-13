import { Link } from "react-router-dom";
import {
  IconHeartbeat,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">


          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#1a6fa8] flex items-center justify-center">
                <IconHeartbeat size={20} stroke={2.5} className="text-white" />
              </div>
              <div>
                <p className="font-extrabold text-white">PulseCare</p>
                <p className="text-[10px] text-gray-400">Hospitals & Healthcare</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-5">
              Delivering world-class healthcare across Maharashtra with compassion, expertise and cutting-edge technology. Trusted by 50,000+ patients.
            </p>

            <div className="bg-red-900/30 border border-red-800/40 rounded-xl p-4 mb-5">
              <p className="text-red-300 text-xs font-bold mb-1">Emergency Helpline</p>
              <p className="text-white text-lg font-bold">1800-PULSE-CARE</p>
              <p className="text-gray-400 text-xs">Available 24×7</p>
            </div>


            <div className="flex gap-2">
              {[
                { icon: <IconBrandFacebook size={16} />, href: "#" },
                { icon: <IconBrandInstagram size={16} />, href: "#" },
                { icon: <IconBrandLinkedin size={16} />, href: "#" },
                { icon: <IconBrandYoutube size={16} />, href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#1a6fa8] hover:text-white transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5">
              {["Book Appointment", "Health Packages", "AI Medicine Chat", "Pharmacy", "Find A Doctor", "Lab Reports"].map((item) => (
                <li key={item}>
                  <Link to="/login" className="text-gray-400 text-xs hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Specialities</h4>
            <ul className="space-y-2.5">
              {["Cardiology", "Neurology", "Orthopaedics", "Oncology", "Gynaecology", "Urology"].map((item) => (
                <li key={item}>
                  <a href="#specialities" className="text-gray-400 text-xs hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3 mb-6">
              {[
                { icon: <IconPhone size={14} stroke={1.5} />, text: "+91 88888 22222" },
                { icon: <IconMail size={14} stroke={1.5} />, text: "care@pulsecare.in" },
                { icon: <IconMapPin size={14} stroke={1.5} />, text: "Near Phoenix Hospital, Beed - 431122" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-gray-500 mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-gray-400 text-xs leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Accreditations</h4>
            <div className="flex flex-wrap gap-2">
              {["NABH", "ISO 9001", "JCI", "NABL"].map((badge) => (
                <span key={badge} className="text-xs font-bold bg-white/10 text-gray-300 px-3 py-1 rounded-full border border-white/10">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>


        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 PulseCare Hospitals Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Use", "Disclaimer"].map((item) => (
              <a key={item} href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;