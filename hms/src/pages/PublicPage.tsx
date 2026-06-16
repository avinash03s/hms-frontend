import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import QuickActions from "../components/home/QuickActions";
import SpecialitiesSection from "../components/home/SpecialitiesSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import HealthPackagesPreview from "../components/home/HealthPackagesPreview";
import LocationsSection from "../components/home/LocationsSection";
import ContactSection from "../components/home/ContactSection";
import AIChatBot from "../components/utility/AIChatBot";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <HeroSection />

      <QuickActions />

      <SpecialitiesSection />

      <WhyChooseUs />

      <HealthPackagesPreview />

      <LocationsSection />

      <ContactSection />

      <Footer />

      <AIChatBot />
    </div>
  );
};

export default HomePage;