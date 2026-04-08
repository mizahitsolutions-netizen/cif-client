import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const About = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = "About Us | Crumbella Innovative Foods";

    const fetchData = async () => {
      const snap = await getDoc(doc(db, "about_page", "main"));
      if (snap.exists()) {
        setData(snap.data());
      }
    };

    fetchData();
  }, []);

  if (!data) return <p className="text-center py-20">Loading...</p>;

  return (
    <div className="pt-18">
      {/* HERO */}
      <section className="w-full bg-[#f8f4ef]">
        <div className="relative w-full">
          <img src={data.heroImage} alt="Hero" className="w-full h-auto" />

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <Link
              to="/products"
              className="border border-black hover:bg-black hover:text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <img
          src={data.storyImage}
          alt="Story"
          className="rounded-xl shadow-lg"
        />

        <div>
          <h2 className="text-3xl font-bold mb-6">{data.storyTitle}</h2>

          <div className="space-y-6 text-gray-700 leading-8 text-[17px]">
            {data.storyParagraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-8">
        {/* Vision */}
        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Our Vision
          </h3>

          <p className="text-gray-700 text-center mb-6">{data.visionText}</p>

          <div className="flex justify-around text-center">
            {data.visionPoints.map((item, i) => (
              <div key={i}>
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Our Mission
          </h3>

          <ul className="space-y-3 text-gray-700">
            {data.missionPoints.map((item, i) => (
              <li key={i}>✔ {item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* OFFER */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-semibold mb-6">What We Offer</h3>

          <ul className="space-y-3 text-gray-700 text-lg">
            {data.offerList.map((item, i) => (
              <li key={i}>✔ {item}</li>
            ))}
          </ul>
        </div>

        <img
          src={data.offerImage}
          alt="Offer"
          className="rounded-xl shadow-lg"
        />
      </section>

      {/* FOOTER */}
      <section className="bg-[#efe5da] py-12 text-center">
        <h2 className="text-3xl font-semibold mb-2">{data.footerTitle}</h2>

        <p className="text-gray-700">{data.footerText}</p>
      </section>
    </div>
  );
};

export default About;
