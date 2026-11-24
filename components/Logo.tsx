import Image from "next/image";
import Link from "next/link";

/** Robot mascot (favicon crop of the brand logo) */
export function LogoMark({ size = 40 }: { size?: number }) {
  return <Image src="/images/logo-mark.png" alt="UnishohayAI" width={size} height={size} priority className="shrink-0" />;
}

/** Full brand logo with mascot, wordmark and tagline */
export function LogoFull({ width = 260, className = "" }: { width?: number; className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt="UnishohayAI - Your University Assistant"
      width={width}
      height={Math.round((width * 756) / 900)}
      priority
      className={className}
    />
  );
}

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <LogoMark size={42} />
      <span className="text-lg">
        Unishohay<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
