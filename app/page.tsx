import Image from "next/image";
import Navbar from "./components/layouts/navbar";
import HeroSection from "./components/home/hero";
import AboutSection from "./components/home/about";

export default function Home() {
  return (
  <main>
   <div className="font-[family-name:var(--font-geist-sans)]">
    <Navbar/>

    <HeroSection />
    <AboutSection/>
    </div>
    </main>
  );
}
