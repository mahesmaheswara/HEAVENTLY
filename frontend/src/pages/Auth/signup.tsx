import Navbar from "../../components/navbar";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Create unforgettable events — fast
            </h1>
            <p className="text-gray-300 mb-6">
              Bergabung sebagai <strong>Client</strong>, <strong>Vendor</strong>, atau <strong>Event Organizer</strong>. Upload portofolio, verifikasi, lalu terima booking.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a href="#signup" className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600">
                Create Account — Get Verified
              </a>
              <a href="#faq" className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800">
                FAQ
              </a>
            </div>
          </div>

          <div className="relative">
            <img
              src="event-background.jpg"
              alt="Join HeaVenTly - hero event"
              className="rounded-xl shadow-lg"
            />
            <span className="absolute bottom-4 left-4 px-4 py-1 rounded-full text-xs font-bold text-black bg-gradient-to-r from-pink-400 to-indigo-400">
              Next-gen Event Platform
            </span>
          </div>
        </div>
      </section>

      {/* SIGNUP */}
      <main id="signup" className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Create Account — Vendor / EO / Client</h2>
          <p className="text-gray-400 mb-6">
            Join HeaVenTly as a Vendor, Event Organizer (EO), or Client. Lengkapi informasi dasar dulu, lalu upload dokumen untuk verifikasi.
          </p>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-lg py-2 hover:bg-gray-800 mb-4">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-gray-500 mb-6">
            <hr className="flex-1 border-gray-700" />
            atau daftar dengan email
            <hr className="flex-1 border-gray-700" />
          </div>

          {/* Example core form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full name *</label>
              <input type="text" className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700" placeholder="Agus Pratama" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <input type="email" className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700" placeholder="you@domain.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password *</label>
              <input type="password" className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700" placeholder="min. 8 characters" />
            </div>
            <div>
              <label className="block text-sm mb-1">Register as *</label>
              <select className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700">
                <option value="">-- Select Role --</option>
                <option value="vendor">Vendor</option>
                <option value="eo">Event Organizer (EO)</option>
                <option value="client">Client</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold">
              Sign Up
            </button>
          </form>
        </div>

        {/* Side tips */}
        <aside className="space-y-6">
          <div className="bg-gray-900/60 p-4 rounded-lg shadow-lg">
            <strong>Required Documents</strong>
            <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
              <li>KTP (owner)</li>
              <li>NPWP (jika ada)</li>
              <li>Portofolio (image/pdf)</li>
              <li>Proposal / CV</li>
              <li>Rekening bank</li>
            </ul>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-lg shadow-lg">
            <strong>Tips</strong>
            <p className="text-gray-400 mt-2">
              Gunakan foto portofolio berkualitas. Sertakan harga & scope kerja di proposal.
            </p>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"></span>
            <span className="font-bold">HeaVenTly</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <small>© 2025 HeaVenTly</small>
        </div>
      </footer>
    </div>
  );
}
