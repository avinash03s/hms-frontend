import { Button } from "@mantine/core";
import { IconHeartbeat, IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from '../components/layout/Navbar';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">

        {/* Big 404 */}
        <div className="relative mb-6">
          <span className="text-[9rem] sm:text-[12rem] font-extrabold text-gray-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#e8f1fb] flex items-center justify-center">
              <IconHeartbeat size={40} stroke={1.5} className="text-[#1a6fa8]" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-400 max-w-sm text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            color="#1a6fa8"
            radius="md"
            size="md"
            leftSection={<IconArrowLeft size={16} />}
          >
            Go Back
          </Button>
          <Link to="/">
            <Button color="#1a6fa8" radius="md" size="md">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-300 mt-12">© 2026 PulseCare. Your health, our priority.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;