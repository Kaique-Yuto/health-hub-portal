import { useAuth } from "@/hooks/useAuth";
import Index from "./Index";
import Home from "./Home";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return user ? <Home /> : <Index />;
}
