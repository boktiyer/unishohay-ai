import Link from "next/link";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="ug" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6D28D9" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ug)" />
      <path d="M32 14 9 25l23 11 18-8.6V40h5V25L32 14Z" fill="#fff" />
      <path d="M18 34v8c0 4 6.5 8 14 8s14-4 14-8v-8l-14 6.7L18 34Z" fill="#fff" opacity=".85" />
      <circle cx="50" cy="44" r="4" fill="#C4B5FD" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight">
      <LogoMark />
      <span className="text-lg">
        Unishohay<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
