import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen fade-in">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="MenuAI Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-amber-500 font-bold text-xl flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              MenuAI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/generate" 
              className="px-5 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500 hover:text-zinc-950 transition-all duration-300 font-medium text-sm shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Create Menu
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 flex flex-col items-center justify-center min-h-screen text-center relative overflow-hidden">
        {/* Glowing Orbs background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#09090b] to-[#09090b] -z-20"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Restaurant Scanner Ready
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-zinc-100">
            Digitize Your Restaurant Menu in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">60 Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload a photo of your paper menu. Our AI instantly extracts it into a premium, mobile-optimized online menu with a smart QR code.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Link 
              href="/generate" 
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-zinc-950 rounded-xl transition-all duration-300 font-bold text-lg hover:bg-amber-400 hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]"
            >
              Scan Menu Instantly
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <p className="text-sm font-medium text-zinc-500 flex items-center gap-2 bg-white/5 backdrop-blur-sm py-2 px-5 rounded-full border border-white/10">
              No credit card required <span className="mx-2 text-zinc-700">•</span> Completely free to try
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 px-4 relative border-t border-white/5 bg-[#09090b]/50" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">How It Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Three simple steps to transform your dining experience.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 -translate-y-1/2 z-0"></div>

            <StepCard number="1" title="Scan or Upload" desc="Take a photo of your menu right from your phone." />
            <StepCard number="2" title="AI Extraction" desc="Discover dishes effortlessly as AI detects every item." />
            <StepCard number="3" title="Go Live" desc="Download your custom QR code and place it on tables." />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-white/5 text-center bg-[#09090b]">
        <div className="container mx-auto">
          <p className="text-zinc-500 mb-2 font-medium">Built with precision for modern dining</p>
          <p className="text-zinc-600 text-sm">© 2025 MenuAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex-1 relative z-10 w-full max-w-sm">
      <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:bg-white/10 hover:border-amber-500/30 hover:-translate-y-1">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          {number}
        </div>
        <h3 className="text-xl font-bold mb-3 text-zinc-100">{title}</h3>
        <p className="text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
