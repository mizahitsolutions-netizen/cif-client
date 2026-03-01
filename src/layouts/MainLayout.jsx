import NavBar from "../components/NavBar";
import FooterSection from "../sections/FooterSection";
import { Outlet } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const MainLayout = () => {
  useGSAP(() => {
    // Prevent mobile resize scroll glitch
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    ScrollTrigger.defaults({
      anticipatePin: 1,
    });

    // ✅ Only enable smooth scroll on desktop
    if (window.innerWidth > 768) {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
      });

      return () => {
        smoother.kill(); // cleanup on unmount
      };
    }
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
