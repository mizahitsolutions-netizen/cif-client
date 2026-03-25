import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

export default function ReviewsMarquee() {
  const [reviews, setReviews] = useState([]);

  // 🔥 Fetch reviews
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(data);
    });

    return () => unsub();
  }, []);

  // 📅 Format date
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "";

    const date = new Date(timestamp.seconds * 1000);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🧱 Card UI (same as your design)
  const CreateCard = ({ review }) => (
    <div className="p-4 rounded-lg mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 shrink-0 bg-white">
      {/* 👤 Header */}
      <div className="flex gap-2">
        <img
          className="size-11 rounded-full object-cover"
          src={
            review.imageUrl || `https://ui-avatars.com/api/?name=${review.name}`
          }
          alt="User"
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <p>{review.name || "Anonymous"}</p>

            {/* ✅ Verified icon */}
            <svg className="mt-0.5" width="12" height="12" viewBox="0 0 12 12">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.555.72a4 4 0 0 1-.297.24..."
                fill="#2196F3"
              />
            </svg>
          </div>

          {/* <span className="text-xs text-slate-500">
            {review.email || "@user"}
          </span> */}
        </div>
      </div>

      {/* 💬 Review Text */}
      <p className="text-sm py-4 text-gray-800">
        {review.description || "No review provided"}
      </p>

      {/* ⭐ Rating */}
      <div className="flex mb-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <span key={i} className="text-yellow-400 text-sm">
              {i < (review.rating || 5) ? "★" : "☆"}
            </span>
          ))}
      </div>

      {/* 📅 Footer */}
      <div className="flex items-center justify-between text-slate-500 text-xs">
        <span>Posted on</span>
        <p>{formatDate(review.createdAt)}</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
      @keyframes marqueeScroll {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }

      .marquee-inner {
        animation: marqueeScroll 25s linear infinite;
      }

      .marquee-reverse {
        animation-direction: reverse;
      }
    `}</style>

      {/* 🔥 FULL SECTION */}
      <section className="w-full bg-[#f8efe8] pb-16 pt-4 overflow-hidden">
        {/* 🧠 HEADING */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
            Real feedback from people who love Crumbella products ❤️
          </p>
        </div>

        {/* 🔥 ROW 1 */}
        <div className="w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-[#f8efe8] to-transparent" />

          <div className="marquee-inner flex min-w-[200%] py-6">
            {[...reviews, ...reviews].map((review, index) => (
              <CreateCard key={index} review={review} />
            ))}
          </div>

          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#f8efe8] to-transparent" />
        </div>

        {/* 🔥 ROW 2 */}
        <div className="w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-[#f8efe8] to-transparent" />

          <div className="marquee-inner marquee-reverse flex min-w-[200%] py-6">
            {[...reviews, ...reviews].map((review, index) => (
              <CreateCard key={index} review={review} />
            ))}
          </div>

          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#f8efe8] to-transparent" />
        </div>
      </section>
    </>
  );
}
