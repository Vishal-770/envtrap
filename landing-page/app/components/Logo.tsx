import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="envtrap logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}

export function LogoBrand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={32} />
      <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
        envtrap
      </span>
    </div>
  );
}
