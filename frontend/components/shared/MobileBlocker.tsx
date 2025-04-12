// components/MobileBlocker.tsx
"use client";

import { useEffect, useState } from "react";

export default function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1480);
    };

    handleResize(); // Check once on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">
          This app is not available on smartphones and tablets yet
        </h1>
        <p className="text-gray-600">Please come back later using a desktop, laptop or try using a larger screen.</p>
      </div>
    );
  }

  return <>{children}</>;
}
