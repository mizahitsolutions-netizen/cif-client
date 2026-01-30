import { useEffect } from "react";

const PrivacyPolicy = () => {

  /* ---------------- SET PAGE TITLE ---------------- */
  useEffect(() => {
    document.title = "Privacy Policy | Crumbella Innovative Foods";
  }, []);

  return (
    <section className="min-h-screen  px-6 md:px-10 py-15">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-400">
          Last updated:{" "}
          {new Date().toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <p>
          At <strong>Crumbella Innovative Foods</strong>, your privacy is
          important to us. This Privacy Policy explains how we collect, use, and
          protect your personal information when you interact with our website
          and services.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Email address when you subscribe to our newsletter</li>
            <li>Basic usage data such as pages visited</li>
            <li>Information you provide through contact forms</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            How We Use Your Information
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>To send updates, offers, and product launches</li>
            <li>To improve our website and user experience</li>
            <li>To communicate with you when necessary</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your data.
            Your information is never sold or shared with third parties for
            marketing purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Third-Party Services</h2>
          <p>
            We may use trusted third-party tools (such as analytics or email
            services) strictly to operate and improve our services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal
            data at any time by contacting us.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <span className="underline">
              support@crumbellainnovativefoods.in
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
