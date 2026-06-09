import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "light" | "dark";
}

const SIZE_MAP = {
  sm: { px: 30, text: "text-sm", small: "text-[10px]" },
  md: { px: 38, text: "text-base", small: "text-[10px]" },
  lg: { px: 52, text: "text-xl", small: "text-[11px]" },
  xl: { px: 88, text: "text-3xl", small: "text-xs" },
} as const;

/** 3:11 Security brand mark. Defaults render well on a white background. */
export function Logo({
  className = "",
  showText = true,
  size = "md",
  variant = "light",
}: LogoProps) {
  const sizes = SIZE_MAP[size];
  const primaryText = variant === "light" ? "text-slate-900" : "text-white";
  const accentText = "text-blue-600";
  const subText = variant === "light" ? "text-slate-500" : "text-blue-200";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0"
        style={{ height: sizes.px, width: sizes.px }}
      >
        <Image
          alt="3:11 Security"
          className="object-contain"
          fill
          priority
          sizes={`${sizes.px}px`}
          src="/311logo.png"
        />
      </div>
      {showText ? (
        <div className="flex flex-col leading-none">
          <span className={`font-semibold tracking-tight ${sizes.text} ${primaryText}`}>
            3:11<span className={`ml-1 ${accentText}`}>Security</span>
          </span>
          <span
            className={`mt-1 font-medium uppercase tracking-[0.16em] ${sizes.small} ${subText}`}
          >
            Command Center
          </span>
        </div>
      ) : null}
    </div>
  );
}
