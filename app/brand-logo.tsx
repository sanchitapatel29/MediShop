import Image from "next/image";

type BrandLogoProps = {
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-11 w-11",
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  return (
    <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-xl bg-white`} aria-hidden="true">
      <Image
        src="/logo.png"
        alt="VitalOps logo"
        fill
        className="object-contain"
        sizes="44px"
        priority
      />
    </div>
  );
}
