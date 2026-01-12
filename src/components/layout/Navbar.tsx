import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, History, User, Menu, X, Stethoscope, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const publicLinks = [
  { to: "/", label: "Início", icon: Home },
];

const protectedLinks = [
  { to: "/gerar-receita", label: "Gerar Receita", icon: FileText },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [...publicLinks, ...protectedLinks] : publicLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-soft group-hover:shadow-card transition-shadow">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Med<span className="text-primary">Portal</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant={isActive(to) ? "secondary" : "ghost"}
                  className={cn(
                    "gap-2",
                    isActive(to) && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Olá, <span className="font-medium text-foreground">{profile?.name?.split(' ')[0] || 'Usuário'}</span>
                </span>
                <Button variant="ghost" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="default">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive(to) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive(to) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Entrar</Button>
                    </Link>
                    <Link to="/cadastro" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Cadastrar</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
