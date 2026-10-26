import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="t-page-title">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page non trouvé</p>
        <a href="/" className="text-acc underline hover:text-acc/90">
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
