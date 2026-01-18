import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, History, User, Plus, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prescription {
  id: string;
  patient_name: string;
  created_at: string;
  document_type: string;
}

export default function Home() {
  const { profile, user } = useAuth();

  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["recent-prescriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("id, patient_name, created_at, document_type")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Prescription[];
    },
    enabled: !!user?.id,
  });

  const { data: totalPrescriptions } = useQuery({
    queryKey: ["total-prescriptions", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const displayName = profile?.name ? `Dr(a). ${profile.name.split(" ")[0]}` : "Doutor(a)";

  return (
    <div className="animate-fade-in container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {greeting()}, <span className="text-primary">{displayName}!</span>
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) ao seu painel de gestão médica.
        </p>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/gerar-receita" className="group">
          <Card className="h-full border-border hover:shadow-card hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Gerar Nova Receita</h3>
                <p className="text-sm text-muted-foreground">Criar prescrição médica</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/historico" className="group">
          <Card className="h-full border-border hover:shadow-card hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <History className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ver Histórico</h3>
                <p className="text-sm text-muted-foreground">Consultar prescrições anteriores</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/perfil" className="group">
          <Card className="h-full border-border hover:shadow-card hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Meu Perfil</h3>
                <p className="text-sm text-muted-foreground">Editar informações pessoais</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats and Recent Prescriptions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card className="lg:col-span-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalPrescriptions ?? 0}</p>
                <p className="text-sm text-muted-foreground">Receitas geradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Últimas Receitas</CardTitle>
            <Link to="/historico">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingPrescriptions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{prescription.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{prescription.document_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(prescription.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma receita gerada ainda.</p>
                <Link to="/gerar-receita">
                  <Button variant="link" className="text-primary mt-2">
                    Gerar primeira receita
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
