import {
  Navbar,
  HeroBadge,
  HeroContent,
  BankOrbit,
  HowItWorks,
  CoreFeatures,
  SupportedBanks,
  Integration,
  Pricing,
  CallToAction,
  Footer,
} from "./components";
import Business from "./components/Business";
import StructuredData from "./components/StructuredData";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <StructuredData />
      {/* Navbar with Logo */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative min-h-screen overflow-hidden flex items-center">
        {/* Background decorative ellipse */}
        <div
          className="absolute w-[202px] h-[234px] bg-[#fffdf8] rounded-full blur-xl opacity-80 hidden lg:block"
          style={{ top: "140px", left: "100px" }}
        />

        {/* Main content container */}
        <div
          className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-[116px] w-full py-12 sm:py-16 md:py-20"
          style={{
            maxWidth: "1728px",
          }}
        >
          {/* Left Content - centered on mobile, left on desktop */}
          <div
            className="flex flex-col gap-[24px] relative z-10 mx-auto lg:mx-0 text-center lg:text-left"
            style={{ maxWidth: "720px" }}
          >
            {/* Badge */}
            <HeroBadge />

            {/* Main Content */}
            <div className="mt-[24px]">
              <HeroContent />
            </div>
          </div>
        </div>

        {/* Bank Orbit - center at bottom-right, showing only 2nd quadrant - Hidden on mobile */}
        <div className="hidden lg:block">
          <BankOrbit />
        </div>
      </main>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Core Features Section */}
      <div id="features">
        <CoreFeatures />
      </div>

      {/* Business Section */}
      <Business />

      {/* Supported Banks Section */}
      <SupportedBanks />

      {/* Integration Section */}
      <div id="integration">
        <Integration />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <Pricing />
      </div>

      {/* Call to Action Section */}
      <div id="get-started" className="px-4 py-16">
        <CallToAction />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
