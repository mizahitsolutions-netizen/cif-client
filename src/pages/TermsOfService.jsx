import { useEffect } from "react";

const TermsOfService = () => {

  /* ---------------- SET PAGE TITLE ---------------- */
  useEffect(() => {
    document.title = "Terms of Service | Crumbella Innovative Foods";
  }, []);

  return (
    <section className="min-h-screen  px-6 md:px-10 py-15">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-sm text-gray-400">
          Last updated:{" "}
          {new Date().toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <p>
          Welcome to <strong>Crumbella Innovative Foods</strong>. By accessing
          or using our website, you agree to comply with and be bound by the
          following terms and conditions.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Use of Our Website</h2>
          <p>
            You agree to use our website only for lawful purposes and in a way
            that does not infringe the rights of others or restrict their use of
            the site.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Intellectual Property</h2>
          <p>
            All content, including text, images, logos, and designs, is the
            property of Crumbella Innovative Foods and may not be copied or
            reused without permission.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">User Submissions</h2>
          <p>
            Any information you submit (such as email subscriptions) must be
            accurate and lawful. We reserve the right to remove content that
            violates these terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Limitation of Liability
          </h2>
          <p>
            Crumbella Innovative Foods is not liable for any damages arising
            from the use or inability to use our website.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Changes to These Terms
          </h2>
          <p>
            We may update these Terms of Service at any time. Continued use of
            the website implies acceptance of the updated terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
          <p>
            For questions regarding these terms, contact us at{" "}
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

export default TermsOfService;
