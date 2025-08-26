

        
        // --- Helper Component: Logo Brand ---
const BrandLogo = ({ size = 'w-9 h-9' }) => (
  <div className={`rounded-lg bg-gradient-to-tr from-accent1 to-accent2 ${size}`} />
);



{/* Bagian Navbar */}
const navbar = () => {
  return (
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
    );
}

export default navbar;
