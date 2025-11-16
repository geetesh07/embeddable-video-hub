import { Film, Settings, Folder, Code2 } from "lucide-react";
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
            <NavLink to="/" icon={Film}>
              Library
            </NavLink>
            <NavLink to="/embed-codes" icon={Code2}>
              Embed Codes
            </NavLink>
            <NavLink to="/folders" icon={Folder}>
              Folders
            </NavLink>
            <NavLink to="/settings" icon={Settings}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
