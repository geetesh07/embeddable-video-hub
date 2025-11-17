import { Film, Settings, Folder } from "lucide-react";
import { NavLink } from "./NavLink";

export const Navigation = () => {
  return (
    <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">VideoHub</span>
          </div>
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors" activeClassName="text-primary font-medium">
              <Film className="w-4 h-4" />
              Library
            </NavLink>
            <NavLink to="/folders" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors" activeClassName="text-primary font-medium">
              <Folder className="w-4 h-4" />
              Folders
            </NavLink>
            <NavLink to="/settings" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors" activeClassName="text-primary font-medium">
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
