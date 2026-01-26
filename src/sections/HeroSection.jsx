import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";


const HeroSection = () => {

    const navigate = useNavigate();


  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const isTablet = useMediaQuery({
    query: "(max-width: 1024px)",
  });

  useGSAP(() => {
    const titleSplit = SplitText.create(".hero-title", {
      type: "chars",
    });

    const tl = gsap.timeline({ delay: 1 });

    tl.to(".hero-content", {
      opacity: 1,
      y: 0,
      ease: "power1.inOut",
    })
      .to(
        ".hero-text-scroll",
        {
          duration: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "circ.out",
        },
        "-=0.5",
      )
      .from(
        titleSplit.chars,
        {
          yPercent: 200,
          stagger: 0.02,
          ease: "power2.out",
        },
        "-=0.5",
      );

    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-container",
        start: "1% top",
        end: "bottom top",
        scrub: true,
      },
    });

    heroTl.to(".hero-container", {
      rotate: 7,
      scale: 0.9,
      yPercent: 30,
      ease: "power1.inOut",
    });
  });

  return (
    <section className="bg-main-bg">
      <div className="hero-container">
        {/* Tablet + Mobile (same image) */}
        {isTablet ? (
          <img
            src="/images/hero-img2.png"
            alt="Hero product"
            className="
      absolute bottom-0 left-1/2 -translate-x-1/2
      z-10
      max-w-[90%]
      md:max-w-[70%]
    "
          />
        ) : (
          /* Desktop only */
          <video
            src="/videos/cookie-bg.mp4"
            autoPlay
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        <div className="hero-content opacity-0">
          {/* <div className="overflow-hidden">
            <h1 className="hero-title">Baked to Perfection</h1>
          </div> */}

          <div
            style={{
              clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
            }}
            className="hero-text-scroll"
          >
            <div className="hero-subtitle">
              <h1>Crispy • Crunchy • Irresistible</h1>
            </div>
          </div>

          <h2 className="hero-text-card">
            Experience the joy of every bite. Our cookies are crafted with
            premium ingredients, rich flavors, and the perfect crunch that
            brings back sweet memories.
          </h2>

          <button className="hero-button cursor-pointer" onClick={() => navigate("/products")}>
            Grab a Cookie
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
