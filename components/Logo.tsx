import Image from "next/image";
import Link from "next/link";

/** Robot mascot (favicon crop of the brand logo) */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  // Fixed width AND height so a flex row (e.g. a long chat answer) can never stretch it vertically.
  return (
    <Image
      src="/images/logo-mark.png"
      alt="UnishohayAI"
      width={size}
      height={size}
      priority
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

/** Full brand logo with mascot, wordmark and tagline */
export function LogoFull({ width = 260, className = "", priority = false }: { width?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/images/logo.png"
      alt="UnishohayAI - Your University Assistant"
      width={width}
      height={Math.round((width * 756) / 900)}
      sizes={`${width}px`}
      priority={priority}
      className={className}
    />
  );
}

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <LogoMark size={42} />
      <span className="hidden text-lg min-[420px]:inline">
        Unishohay<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
