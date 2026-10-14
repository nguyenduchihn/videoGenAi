import { useMe } from "@/hooks/useMe";
import { HomeHeader } from "./sections/HomeHeader";
import { HeroSection } from "./sections/HeroSection";
import { ProductPreview } from "./sections/ProductPreview";
import { HowItWorks } from "./sections/HowItWorks";
import { UseCases } from "./sections/UseCases";
import { PricingTeaser } from "./sections/PricingTeaser";
import { FooterSection } from "./sections/FooterSection";

function SessionProbe() {
    useMe();
    return null;
}

export default function Home() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-app-bg text-app-text">
            <SessionProbe />
            <HomeHeader />
            <main>
                <HeroSection />
                <ProductPreview />
                <HowItWorks />
                <UseCases />
                <PricingTeaser />
            </main>
            <FooterSection />
        </div>
    );
}