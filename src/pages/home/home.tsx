import "./landing.css";
import { useMe } from "@/hooks/useMe";
import { HomeHeader } from "./sections/HomeHeader";
import { HeroSection } from "./sections/HeroSection";
import { TrustStrip } from "./sections/TrustStrip";
import { CapabilityBento } from "./sections/CapabilityBento";
import { HowItWorks } from "./sections/HowItWorks";
import { UseCases } from "./sections/UseCases";
import { PricingSection } from "./sections/PricingSection";
import { ApiSection } from "./sections/ApiSection";
import { FaqSection } from "./sections/FaqSection";
import { FinalCta } from "./sections/FinalCta";
import { FooterSection } from "./sections/FooterSection";

/** Khách chưa đăng nhập nhận 401 (bình thường) ⇒ CTA giữ trạng thái "chưa đăng nhập"; có phiên ⇒ nút đổi sang Dashboard. */
function SessionProbe() {
    useMe();
    return null;
}

export default function Home() {
    return (
        <div className="landing min-h-screen overflow-x-hidden bg-app-bg text-app-text">
            <SessionProbe />
            <HomeHeader />
            <main>
                <HeroSection />
                <TrustStrip />
                <CapabilityBento />
                <HowItWorks />
                <UseCases />
                <PricingSection />
                <ApiSection />
                <FaqSection />
                <FinalCta />
            </main>
            <FooterSection />
        </div>
    );
}
