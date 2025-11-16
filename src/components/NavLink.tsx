import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, icon: Icon, children, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            isActive ? "text-primary" : "text-muted-foreground",
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
