import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-extrabold gradient-text">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/80 text-sm font-medium">
          Return to Kiosk
        </a>
      </div>
    </div>
  );
};

export default NotFound;
