import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState({});

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideos(data);
    });

    return () => unsub();
  }, []);

  return (
    <div className="pt-5 sm:pt-20 px-4 sm:px-6">
      {/* PAGE HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Our Videos
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Explore our latest videos, updates, and highlights all in one place.
        </p>
      </div>

      {/* EMPTY STATE */}
      {videos.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No videos available</p>
      )}

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid gap-8 sm:gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3 pb-10">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {/* VIDEO */}
            <div className="relative bg-black">
              {loadingVideo[video.id] !== false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <video
                controls
                playsInline
                preload="metadata"
                webkit-playsinline="true"
                className="w-full h-[200px] object-contain bg-black"
                onLoadedData={() =>
                  setLoadingVideo((prev) => ({
                    ...prev,
                    [video.id]: false,
                  }))
                }
                onError={() =>
                  setLoadingVideo((prev) => ({
                    ...prev,
                    [video.id]: false,
                  }))
                }
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* CONTENT */}
            <div className="p-4 sm:p-5">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-1">
                {video.title}
              </h2>

              <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
