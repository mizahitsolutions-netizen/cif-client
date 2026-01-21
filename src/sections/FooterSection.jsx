import { useMediaQuery } from "react-responsive";

const FooterSection = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  return (
    <section className="footer-section">
      <div className="2xl:h-[110dvh] relative md:pt-[20vh] pt-[10vh]">
        {/* Headline */}
        <div className="overflow-hidden z-10">
          <h1 className="general-title text-center text-milk py-5">
            #BAKEDWITHLOVE
          </h1>
        </div>

        {/* Social links (text only) */}
        <div className="flex-center gap-8 relative z-10 md:mt-20 mt-10 text-milk">
          <button className="social-btn">YouTube</button>
          <button className="social-btn">Instagram</button>
        </div>

        {/* Footer content */}
        <div className="mt-32 md:px-10 px-5 flex gap-10 md:flex-row flex-col justify-between text-milk font-paragraph md:text-lg font-medium">
          {/* Links */}
          <div className="flex items-start md:gap-16 gap-10">
            <div>
              <p className="mb-3 font-bold">Cookie Flavors</p>
              <p>Chocolate Crunch</p>
              <p>Berry Delight</p>
              <p>Classic Milk</p>
            </div>

            <div>
              <p className="mb-3 font-bold">Explore</p>
              <p>Our Story</p>
              <p>Baking Process</p>
              <p>Cookie Club</p>
            </div>

            <div>
              <p className="mb-3 font-bold">Company</p>
              <p>Contact Us</p>
              <p>Cookie Journal</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:max-w-lg">
            <p>
              Join our cookie circle for fresh launches, special offers, and
              sweet updates straight from the oven.
            </p>

            <div className="flex justify-between items-center border-b border-[#D9D9D9] py-5 md:mt-10">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent placeholder:font-sans placeholder:text-[#999999] outline-none"
              />
              <span className="ml-4 font-bold cursor-pointer">
                Subscribe →
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright-box">
          <p>© 2026 Crumbella Cookies. All Rights Reserved.</p>
          <div className="flex items-center gap-7">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
