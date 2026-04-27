import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ClassNameFn = (props: { isActive: boolean }) => string;

interface NavLinkCompatProps {
  to: string;
  end?: boolean;
  className?: string | ClassNameFn;
  activeClassName?: string;
  children?: React.ReactNode;
}

const NavLink = ({ className, activeClassName, to, end = false, children }: NavLinkCompatProps) => {
  const pathname = usePathname();
  const href = to;
  const currentPath = (pathname ?? "/").split("?")[0].replace(/\/$/, "") || "/";
  const normalizedHref = href.split("?")[0].replace(/\/$/, "") || "/";
  const isActive = end
    ? currentPath === normalizedHref
    : normalizedHref === "/"
      ? currentPath === "/"
      : currentPath === normalizedHref || currentPath.startsWith(`${normalizedHref}/`);
  const resolved =
    typeof className === "function"
      ? className({ isActive })
      : cn(className, isActive && activeClassName);
  return (
    <Link href={href} className={resolved} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
};

NavLink.displayName = "NavLink";

export { NavLink };
