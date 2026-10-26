"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type TrackedLinkProps = {
  href: string;
  eventName: string;
  source: string;
  className: string;
  children: ReactNode;
};

export default function TrackedLink({
  href,
  eventName,
  source,
  className,
  children,
}: TrackedLinkProps) {
  const trackClick = () => {
    if (typeof window !== "undefined") {
      window.gtag?.("event", eventName, {
        event_category: "engagement",
        event_label: source,
        source,
        page_path: window.location.pathname,
      });
    }
  };

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} onClick={trackClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={trackClick} className={className}>
      {children}
    </Link>
  );
}
