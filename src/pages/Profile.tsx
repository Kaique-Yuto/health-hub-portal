import { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, Building, Edit, Loader2, Save, Camera, Briefcase } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Professional info dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  // Personal info dialog state
  const [isPersonalDialogOpen, setIsPersonalDialogOpen] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editCrm, setEditCrm] = useState("");

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleOpenEditDialog = () => {
    setClinicName(profile?.clinic_name || "");
    setClinicAddress(profile?.clinic_address || "");
    setIsEditDialogOpen(true);
  };

  const handleOpenPersonalDialog = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setEditSpecialty(profile?.specialty || "");
    setEditCrm(profile?.crm || "");
    setIsPersonalDialogOpen(true);
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

  const handleSavePersonal = async () => {
    if (!profile?.user_id) return;

    if (!editName.trim() || !editCrm.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e CRM são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPersonal(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          specialty: editSpecialty.trim() || "Clínico Geral",
          crm: editCrm.trim(),
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      await refreshProfile();
      setIsPersonalDialogOpen(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram salvas.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.user_id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.user_id}/avatar.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", profile.user_id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao enviar foto",
        description: "Não foi possível atualizar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            {/* Avatar with upload */}
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary-foreground" />
                )}
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-foreground">{profile?.name || 'Carregando...'}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenPersonalDialog}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Edit Professional Info Dialog */}
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

      {/* Edit Personal Info Dialog */}
      <Dialog open={isPersonalDialogOpen} onOpenChange={setIsPersonalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Informações Pessoais</DialogTitle>
            <DialogDescription>
              Atualize seus dados de cadastro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Nome Completo *</Label>
              <Input
                id="edit_name"
                placeholder="Dr. João Silva"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Telefone</Label>
              <Input
                id="edit_phone"
                placeholder="(11) 99999-9999"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_specialty">Especialidade</Label>
              <Input
                id="edit_specialty"
                placeholder="Ex: Cardiologista"
                value={editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_crm">CRM *</Label>
              <Input
                id="edit_crm"
                placeholder="12345-SP"
                value={editCrm}
                onChange={(e) => setEditCrm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPersonalDialogOpen(false)} disabled={isSavingPersonal}>
              Cancelar
            </Button>
            <Button onClick={handleSavePersonal} disabled={isSavingPersonal} className="gap-2">
              {isSavingPersonal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
