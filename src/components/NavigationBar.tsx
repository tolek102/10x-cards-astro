import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { UserDto } from "@/types";

interface NavigationBarProps {
  user: UserDto | null;
  onLogout: () => void;
}

export const NavigationBar = ({ user, onLogout }: NavigationBarProps) => {
  const [activeTab, setActiveTab] = useState<"creator" | "preview" | "learning">("creator");

  const navItems = [
    { id: "creator", label: "Creator" },
    { id: "preview", label: "Preview" },
    { id: "learning", label: "Learning" },
  ] as const;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-indigo-600">10x Cards</span>
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50",
                  activeTab === item.id && "text-indigo-600 bg-indigo-50"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.email}</span>
            <Button variant="outline" onClick={onLogout} className="text-sm">
              Wyloguj
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
