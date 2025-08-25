import React from 'react';
import bgEvent from "../../assets/event-background.jpg";

// --- Helper Component: Ikon Google ---
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.3H272v95.3h147.2c-6.4 34.9-25.6 64.4-54.6 84.2v69h88.3c51.6-47.5 81.6-117.5 81.6-198.2z" />
    <path fill="#34A853" d="M272 544.3c73.8 0 135.8-24.4 181-66.1l-88.3-69c-24.6 16.6-56.1 26.4-92.7 26.4-71 0-131.3-47.9-152.8-112.3h-90.5v70.5C78.8 483.6 167.9 544.3 272 544.3z" />
    <path fill="#FBBC05" d="M119.2 324.3c-11.2-33.2-11.2-68.8 0-102l-90.5-70.5C4.1 196.6 0 232.7 0 272s4.1 75.4 28.7 120.2l90.5-68z" />
    <path fill="#EA4335" d="M272 108.3c39.9 0 75.8 13.7 104.2 40.6l78.2-78.2C403.2 22.2 345.9 0 272 0 167.9 0 78.8 60.7 28.7 152l90.5 70.5C140.7 156.2 201 108.3 272 108.3z" />
  </svg>
);

// --- Helper Component: Logo Brand ---
const BrandLogo = ({ size = 'w-9 h-9' }) => (
  <div className={`rounded-lg bg-gradient-to-tr from-accent1 to-accent2 ${size}`} />
);

// --- Helper Component: Ikon untuk Input Form ---
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);


// --- Komponen Utama: Halaman Sign In ---
const SignInPage = () => {

  return (
    <div className="min-h-screen bg-bg text-[#eaf2ff] font-sans">
      
      {/* Bagian Navbar */}
      <nav className="fixed inset-x-4 md:inset-x-6 top-4 z-50 mx-auto flex items-center justify-between gap-3 rounded-xl p-2.5 md:p-4 bg-black/50 border border-white/10 shadow-nav backdrop-blur-lg">
        <a href="#" className="flex items-center gap-3">
          <BrandLogo />
          <strong className="text-white">HeaVenTly</strong>
        </a>
        <div className="hidden md:flex items-center gap-1">
          <a href="#" className="px-3 py-2 rounded-lg text-muted font-semibold hover:text-white hover:bg-white/5 transition-all duration-300">Features</a>
          <a href="#" className="px-3 py-2 rounded-lg text-muted font-semibold hover:text-white hover:bg-white/5 transition-all duration-300">Pricing</a>
          <a href="#" className="px-3 py-2 rounded-lg text-muted font-semibold hover:text-white hover:bg-white/5 transition-all duration-300">Docs</a>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded-lg font-bold text-muted border border-white/10 hover:bg-white/10 transition-all duration-300">Create account</button>
          <button type="button" className="relative px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-accent1 to-accent2 text-[#04121a] overflow-hidden group">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-accent1 to-accent2 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
            <span className="relative text-blue-500">Sign In</span>
          </button>
        </div>
      </nav>

      {/* Bagian Utama (Hero) */}
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        {/* Latar Belakang Gambar & Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center brightness-20" 
            style={{ backgroundImage: `url(${bgEvent})` }}
            >
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/80 to-bg"></div>
        </div>

        {/* Konten Hero */}
        <div className="relative z-10 container mx-auto grid grid-cols-2 lg:grid-cols-hero gap-9 items-center p-4 md:p-9">
          {/* Sisi Kiri: Teks & Tombol */}
          <div className="text-center lg:text-left">
            <span className="inline-block px-3 py-1.5 bg-white/10 rounded-full font-semibold text-muted mb-4 text-sm">
              Next-gen Event Platform
            </span>
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-tight text-white mb-4">
              Craft Unforgettable Events, Seamlessly
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto lg:mx-0 mb-8">
              Discover packages, check real-time availability, and book venues & vendors with ease. Designed for clients who desire perfection.
            </p>
            <div className="flex justify-center lg:justify-start gap-3 flex-wrap">
              {/* Tombol Aktif */}
              <button className="relative px-5 py-3 rounded-full font-bold bg-gradient-to-r from-accent1 to-accent2 text-[#04121a] overflow-hidden group">
                <span className="absolute -inset-1 bg-gradient-to-r from-accent1 to-accent2 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
                <span className="relative text-white">Explore Client</span>
              </button>
              {/* Tombol Inaktif */}
              <button className="px-5 py-3 rounded-full font-bold bg-white/5 text-muted border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                Vendor
              </button>
              <button className="px-5 py-3 rounded-full font-bold bg-white/5 text-muted border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                Event Organizer
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Kartu Sign-In */}
          <aside className="bg-black/30 border border-white/10 rounded-2xl p-6 shadow-card w-full max-w-md mx-auto backdrop-blur-lg">
            <div className="flex justify-between items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-xl text-white">Secure Session</h3>
                <div className="text-muted text-sm mt-1">Sign in to your HeaVenTly account</div>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-b from-accent1 to-accent2 flex-shrink-0"></div>
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5 font-bold text-muted hover:bg-white/10 transition-all duration-300 mb-4">
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-2 text-muted text-sm my-4">
              <div className="flex-grow h-px bg-white/10"></div>
              or sign in with email
              <div className="flex-grow h-px bg-white/10"></div>
            </div>

            <form>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon />
                    </div>
                    <input id="email" type="email" defaultValue="client@hv.com" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-muted focus:outline-none focus:ring-2 focus:ring-accent1 transition-all duration-300" />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">Password</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon />
                    </div>
                    <input id="password" type="password" defaultValue="123" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-muted focus:outline-none focus:ring-2 focus:ring-accent1 transition-all duration-300" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-sm text-muted">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="bg-transparent border-muted rounded focus:ring-accent1 text-accent1" />
                  Remember me
                </label>
                <a href="#" className="font-bold hover:text-white transition-all duration-300">Forgot?</a>
              </div>

              <button type="submit" className="w-full mt-5 p-3 rounded-lg bg-gradient-to-r from-accent1 to-accent2 text-[#04121a] font-extrabold text-base hover:opacity-90 transition-all duration-300 relative group overflow-hidden">
                 <span className="absolute -inset-1 bg-gradient-to-r from-accent1 to-accent2 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
                 <span className="relative text-blue-500">Sign In</span>
              </button>
            </form>

            <div className="text-center text-muted text-sm mt-5">
              Don't have an account? <a href="#" className="font-bold text-accent1 hover:underline">Create one</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;