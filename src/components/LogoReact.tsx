/**
 * UWAGA: Ten komponent ma swoją wersję Astro w Logo.astro
 * Wszelkie zmiany w stylach, strukturze lub właściwościach powinny być zsynchronizowane między oboma plikami.
 *
 * Wersja React jest używana w:
 * - NavigationBar.tsx
 */

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withContainer?: boolean;
}

export const Logo = ({ size = "md", withContainer = false }: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: "text-xl",
      icon: "w-7 h-7",
      iconInner: "w-4 h-4",
    },
    md: {
      container: "text-2xl",
      icon: "w-8 h-8",
      iconInner: "w-5 h-5",
    },
    lg: {
      container: "text-4xl",
      icon: "w-10 h-10",
      iconInner: "w-6 h-6",
    },
  };

  const LogoContent = () => (
    <div className="relative flex items-center">
      <div
        className={`${sizeClasses[size].icon} flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-inner`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClasses[size].iconInner}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a9 9 0 1 0 9 9" />
          <path d="M12 8v4l3 3" />
          <path d="m17 2 4 4" />
          <path d="m21 2-4 4" />
        </svg>
      </div>
      <div
        className={`${sizeClasses[size].container} font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 ml-2 pr-1`}
      >
        10x Cards
      </div>
    </div>
  );

  if (withContainer) {
    return (
      <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-blue-100/20 shadow-sm">
        <LogoContent />
      </div>
    );
  }

  return <LogoContent />;
};
