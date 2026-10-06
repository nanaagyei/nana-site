import type { ComponentProps } from "react";
import Link from "next/link";
import { isPrinting } from "@/lib/pdf/print-mode";

/**
 * next/link everywhere on the site. While the PDF is being typeset it can't run (it's a client
 * component), and a plain anchor is all the PDF needs.
 */
export function SiteLink(props: ComponentProps<typeof Link>) {
  if (isPrinting()) {
    const { href, children, className } = props;
    return (
      <a href={typeof href === "string" ? href : (href.pathname ?? "")} className={className}>
        {children}
      </a>
    );
  }
  return <Link {...props} />;
}
