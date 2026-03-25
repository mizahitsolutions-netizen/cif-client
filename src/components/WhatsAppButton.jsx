import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const phoneNumber = "918608604700";
  const message = "Hi, I’m interested in your products";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 group">
      {/* Pulse (behind button) */}
      <span className="absolute inset-0 rounded-full bg-green-400 opacity-70 animate-ping"></span>

      {/* Button */}
      <button
        onClick={handleClick}
        className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition duration-300 cursor-pointer"
      >
        <FaWhatsapp size={28} />
      </button>

      {/* Tooltip */}
      <span className="absolute right-16 bottom-3 bg-black text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        Chat with us
      </span>
    </div>
  );
}
