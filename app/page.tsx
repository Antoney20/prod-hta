import Image from "next/image";
import Navbar from "./components/layouts/navbar";
import HeroSection from "./components/home/hero";
import AboutSection from "./components/home/about";
import HTAImpactSection from "./components/home/impact";
import FAQsSection from "./components/home/faqs";
import ContactSection from "./components/home/contact";
import Footer from "./components/layouts/footer";
import NewsSection from "./components/home/news";

export default function Home() {
  return (
  <main>
   <div className="font-[family-name:var(--font-geist-sans)]">
    <Navbar/>

    <HeroSection />
    <AboutSection/>
    <HTAImpactSection/>
    <NewsSection/>
    <FAQsSection/>
    <ContactSection/>
    <Footer/>
    </div>
    </main>
  );
}
