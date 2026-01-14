import { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Edit, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { profile, isLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  const handleOpenEditDialog = () => {
    setClinicName(profile?.clinic_name || "");
    setClinicAddress(profile?.clinic_address || "");
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.user_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          clinic_name: clinicName.trim() || null,
          clinic_address: clinicAddress.trim() || null,
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      await refreshProfile();
      setIsEditDialogOpen(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações profissionais foram salvas.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Informações Profissionais
              </h3>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleOpenEditDialog}>
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Informações Profissionais</DialogTitle>
            <DialogDescription>
              Atualize os dados do seu consultório.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Nome do Consultório</Label>
              <Input
                id="clinic_name"
                placeholder="Ex: Clínica Saúde & Vida"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_address">Endereço</Label>
              <Input
                id="clinic_address"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
