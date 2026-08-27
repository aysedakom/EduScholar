export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-[#0A1628] p-8 text-white md:flex md:flex-col md:justify-between md:p-12 border-r border-slate-800/40">
      {/* Background gradients */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 flex flex-col">
        <span className="font-heading text-lg font-black tracking-wide text-white leading-tight">
          Education and Scholarship Management
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Republic of the Philippines • Local Government Unit
        </span>
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
          <div className="z-10 flex flex-col items-center max-w-[340px] text-center">
            <h2 className="font-heading text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-none drop-shadow-md">
              GovServe
            </h2>
          </div>
        </div>
      </div>


    </div>
  );
}
