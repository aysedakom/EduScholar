export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-[#0A1628] p-8 text-white md:flex md:flex-col md:justify-between md:p-12 border-r border-slate-800/40">
      {/* Background gradients */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />



      {/* Center Seal Graphic */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
        {/* Very large watermark logo centered behind the concentric rings */}
        <div
          className="absolute h-[640px] w-[640px] bg-center bg-no-repeat bg-contain opacity-25 pointer-events-none z-0"
          style={{ backgroundImage: 'url(/logo-system.png)' }}
        />

        {/* Concentric rings seal */}
        <div className="relative z-10 flex h-[500px] w-[500px] items-center justify-center rounded-full border border-slate-800/40 p-4">
          
          {/* Text overlays in the center ring */}
          <div className="z-10 flex flex-col items-center max-w-[480px] text-center px-4">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
              Education and Scholarship Management
            </h2>
            <span className="text-sm sm:text-base md:text-lg font-extrabold text-blue-400 mt-4 uppercase tracking-widest drop-shadow-md">
              Republic of the Philippines • Local Government Unit
            </span>
          </div>
        </div>
      </div>


    </div>
  );
}
