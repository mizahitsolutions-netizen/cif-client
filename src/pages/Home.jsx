import Hero from "../components/home/Hero";
import BestSellers from "../components/home/BestSellers";
import WhyChoose from "../components/home/WhyChoose";
import OurProducts from "../components/home/OurProducts";
import Reviews from "../components/home/Reviews";

const Home = () => {
  return (
    <div className="pt-0 md:pt-18">
      <Hero />

      <BestSellers />

      <WhyChoose />

      <OurProducts />

      <Reviews />
    </div>
  );
};

export default Home;
