import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { UserDto } from "@/types";
import { Logo } from "./LogoReact";
import { logger } from "@/lib/services/loggerService";

interface NavigationBarProps {
  user: UserDto | null;
  activeSection: "creator" | "preview" | "learning";
}

export const NavigationBar = ({ user, activeSection }: NavigationBarProps) => {
  const navItems = [
    { id: "creator", label: "Kreator", href: "/creator" },
    { id: "preview", label: "Podgląd", href: "/preview" },
    { id: "learning", label: "Nauka", href: "/learning" },
  ] as const;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wylogowywania");
      }

      window.location.href = "/";
    } catch (error) {
      logger.error("Failed to logout:", { error });
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <Logo size="sm" />
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors",
                  activeSection === item.id && "text-indigo-600 bg-indigo-50"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.email}</span>
            <Button variant="outline" onClick={handleLogout} className="text-sm">
              Wyloguj
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
