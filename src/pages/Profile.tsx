import { User, Mail, Phone, MapPin, Building, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-card">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
            <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-foreground">{profile?.name || 'Carregando...'}</h2>
              <p className="text-muted-foreground">{profile?.specialty || 'Clínico Geral'}</p>
              <p className="text-sm text-primary font-medium mt-1">CRM: {profile?.crm || '-'}</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>

          {/* Contact Info */}
          <div className="py-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações de Contato
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="text-foreground">{profile?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-foreground">{profile?.phone || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações Profissionais
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consultório</p>
                  <p className="text-foreground">{profile?.clinic_name || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="text-foreground">{profile?.clinic_address || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
