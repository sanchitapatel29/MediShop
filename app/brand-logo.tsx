type BrandLogoProps = {
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-11 w-11",
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  return (
    <div
      className={`relative ${sizeClasses[size]} overflow-hidden rounded-2xl border border-cyan-300/30 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.95),rgba(191,219,254,0.92)_32%,rgba(14,165,233,0.82)_100%)] shadow-[0_14px_30px_rgba(8,145,178,0.2)]`}
      aria-hidden="true"
    >
      <div className="absolute inset-[5px] rounded-[14px] border border-white/35 bg-slate-950/12" />
      <div className="absolute left-[9px] top-[9px] h-[11px] w-[11px] rounded-full border border-slate-900/20 bg-white/70" />
      <div className="absolute bottom-[8px] right-[8px] h-[15px] w-[15px] rounded-full border border-cyan-100/40 bg-cyan-950/35" />
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/70" />
      <div className="absolute left-1/2 top-1/2 h-[18px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/70" />
    </div>
  );
}
