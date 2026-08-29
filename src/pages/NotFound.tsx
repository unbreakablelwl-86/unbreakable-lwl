import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center bg-card border-2 border-primary/30 rounded-lg p-12 max-w-md mx-4">
        <h1 className="mb-4 font-display text-8xl text-primary">404</h1>
        <h2 className="mb-4 font-display text-2xl text-foreground tracking-wide">PAGE NOT FOUND</h2>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display tracking-wide rounded-lg hover:bg-primary/90 transition-colors"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
