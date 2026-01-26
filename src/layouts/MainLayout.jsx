import NavBar from "../components/NavBar";
import FooterSection from "../sections/FooterSection";
import { Outlet } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const MainLayout = () => {
  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
  }, []);

  return (
    <main className="pt-[72px] md:pt-[96px]">
      <NavBar />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Outlet />
          <FooterSection />
        </div>
      </div>
    </main>
  );
};

export default MainLayout;
