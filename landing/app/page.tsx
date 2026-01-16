import {
  Navbar,
  HeroBadge,
  HeroContent,
  BankOrbit,
  HowItWorks,
  CoreFeatures,
  SupportedBanks,
  Integration,
  CallToAction,
  Footer,
} from "./components";
import Business from "./components/Business";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Navbar with Logo */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative min-h-screen overflow-hidden">
        {/* Background decorative ellipse */}
        <div
          className="absolute w-[202px] h-[234px] bg-[#fffdf8] rounded-full blur-xl opacity-80"
          style={{ top: "140px", left: "100px" }}
        />

        {/* Main content container */}
        <div
          className="relative mx-auto"
          style={{
            maxWidth: "1728px",
            paddingLeft: "116px",
            paddingTop: "200px",
          }}
        >
          {/* Left Content */}
          <div
            className="flex flex-col gap-[24px] relative z-10"
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

        {/* Bank Orbit - center at bottom-right, showing only 2nd quadrant */}
        <BankOrbit />
      </main>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Core Features Section */}
      <CoreFeatures />

      {/* Business Section */}
      <Business />

      {/* Supported Banks Section */}
      <SupportedBanks />

      {/* Integration Section */}
      <Integration />

      {/* Call to Action Section */}
      <div className="px-4 py-16">
        <CallToAction />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
