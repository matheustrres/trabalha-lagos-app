import Image from "next/image";

interface BrandLogoProps {
  priority?: boolean;
  variant?: "compact" | "full";
}

export const BrandLogo = ({
  priority = false,
  variant = "compact",
}: BrandLogoProps) => {
  if (variant === "full") {
    return (
      <Image
        src="/brand/trabalhalagos-logo-full.svg"
        alt="TrabalhaLagos"
        width={240}
        height={60}
        priority={priority}
        className="h-auto w-60 max-w-full"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/brand/trabalhalagos-icon.svg"
        alt=""
        width={36}
        height={36}
        priority={priority}
        aria-hidden
        className="size-9 shrink-0"
      />
      <span className="text-base font-extrabold tracking-[-0.025em] text-slate-900">
        Trabalha<span className="text-[#14532d]">Lagos</span>
      </span>
    </span>
  );
};
