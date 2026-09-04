export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-[#0A1628] p-8 text-white md:flex md:flex-col md:justify-between md:p-12 border-r border-slate-800/40">
      {/* Background gradients */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center gap-3">
        <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-500/10 p-1.5 rounded-xl border border-blue-500/20" />
        <div className="flex flex-col">
          <span className="font-heading text-lg font-black tracking-wide text-white leading-tight">
            GovServe
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quezon City Government
          </span>
        </div>
      </div>

      {/* Center Seal Graphic */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
        {/* Very large watermark logo centered behind the concentric rings */}
        <div
          className="absolute h-[640px] w-[640px] bg-center bg-no-repeat bg-contain opacity-25 pointer-events-none z-0"
          style={{ backgroundImage: 'url(/logo-system.png)' }}
        />

        {/* Concentric rings seal */}
        <div className="relative z-10 flex h-[420px] w-[420px] items-center justify-center rounded-full border border-slate-800/40 p-4">
          
          {/* Text overlays in the center ring */}
          <div className="z-10 flex flex-col items-center max-w-[380px] text-center px-4">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Education and Scholarship Management
            </h2>
            <span className="text-[11px] sm:text-xs font-bold text-blue-400 mt-2 uppercase tracking-wider drop-shadow-sm">
              Republic of the Philippines • Local Government Unit
            </span>
          </div>
        </div>
      </div>


    </div>
  );
}
