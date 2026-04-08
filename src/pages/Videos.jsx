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
      {" "}
      {/* EMPTY STATE */}
      {videos.length === 0 && (
        <p className="text-center text-gray-500">No videos available</p>
      )}
      {/* CENTER CONTAINER */}
      <div className="max-w-4xl mx-auto space-y-16">
        {videos.map((video) => (
          <div key={video.id} className="border-b pb-10 text-center">
            {/* TITLE */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3">
              {video.title}
            </h2>

            {/* DESCRIPTION */}
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-5 max-w-2xl mx-auto leading-relaxed">
              {video.description}
            </p>

            {/* VIDEO */}
            <div className="relative w-full bg-black rounded-xl overflow-hidden">
              {/* LOADER */}
              {loadingVideo[video.id] !== false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <video
                src={video.videoUrl}
                controls
                className="w-full max-h-[220px] sm:max-h-[350px] md:max-h-[500px] object-contain"
                onLoadedData={() =>
                  setLoadingVideo((prev) => ({
                    ...prev,
                    [video.id]: false,
                  }))
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
