import { useState, useEffect } from "react";
import { FileText, Eye, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationsList } from "./MedicationsList";
import { PrescriptionPreviewDialog } from "./PrescriptionPreviewDialog";
import { Medication } from "./MedicationItem";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.substring(10, 11));
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatProperCase(name: string): string {
  return name.toLowerCase().replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
}

export function RecipeForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [serviceLocation, setServiceLocation] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientCPF, setPatientCPF] = useState("");
  const [medications, setMedications] = useState<Medication[]>([{ id: crypto.randomUUID(), name: "", dosage: "", quantity: "", administration: "" }]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.clinic_address) {
      setServiceLocation(profile.clinic_address);
    }
  }, [profile]);

  const handleSaveAndDownload = async () => {
    if (!user || !patientName || !patientCPF) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e CPF do paciente.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidCPF(patientCPF)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido.",
        variant: "destructive",
      });
      return;
    }

    const validMedications = medications.filter(m => m.name.trim());
    if (validMedications.length === 0) {
      toast({
        title: "Medicamentos obrigatórios",
        description: "Adicione pelo menos um medicamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Salvar na tabela prescriptions
      const { error: insertError } = await supabase.from("prescriptions").insert([{
        user_id: user.id,
        patient_name: patientName,
        patient_cpf: patientCPF.replace(/\D/g, ""),
        service_location: serviceLocation,
        medications: validMedications as unknown as any,
        document_type: "Receita Simples"
      }]);

      if (insertError) throw insertError;

      // Gerar PDF se ainda não foi gerado
      if (!pdfUrl) {
        await generatePDF();
      }

      if (pdfUrl) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `receita_${patientName.replace(/\s+/g, "_")}.pdf`;
        link.click();
      }

      toast({ title: "Sucesso", description: "Receita salva com sucesso!" });
      
      // Limpar formulário
      setPatientName("");
      setPatientCPF("");
      setMedications([{ id: crypto.randomUUID(), name: "", dosage: "", quantity: "", administration: "" }]);
      setPdfUrl(null);
    } catch (error: any) {
      console.error("Error saving prescription:", error);
      toast({ title: "Erro", description: error.message || "Erro ao salvar receita.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setPreviewOpen(true);
    try {
      const payload = {
        patientName,
        patientCPF: patientCPF.replace(/\D/g, ""),
        medications: medications.filter(m => m.name.trim()),
        doctor: profile ? {
          name: profile.name,
          crm: profile.crm,
          specialty: profile.specialty,
          clinicName: profile.clinic_name,
          clinicAddress: profile.clinic_address,
          phone: profile.phone,
          email: profile.email
        } : null
      };

      const response = await fetch("/api/generate-prescription-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. A funcionalidade de preview ainda está em desenvolvimento.",
        variant: "destructive",
      });
      setPreviewOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Nova Receita Médica
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serviceLocation">Local de Atendimento</Label>
            <Input 
              id="serviceLocation" 
              placeholder="Ex: Clínica Saúde - Rua das Flores, 123"
              value={serviceLocation} 
              onChange={(e) => setServiceLocation(e.target.value)} 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente *</Label>
              <Input 
                id="patientName" 
                placeholder="Nome completo do paciente"
                value={patientName} 
                onChange={(e) => setPatientName(formatProperCase(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientCPF">CPF do Paciente *</Label>
              <Input 
                id="patientCPF" 
                placeholder="000.000.000-00"
                value={patientCPF} 
                onChange={(e) => setPatientCPF(formatCPF(e.target.value))} 
                maxLength={14} 
              />
            </div>
          </div>

          <MedicationsList
            medications={medications}
            onAdd={() => setMedications([...medications, { id: crypto.randomUUID(), name: "", dosage: "", quantity: "", administration: "" }])}
            onUpdate={(id, field, value) => setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m))}
            onRemove={(id) => setMedications(medications.filter(m => m.id !== id))}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={generatePDF} disabled={isGenerating || !patientName} className="flex-1">
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              Visualizar Preview
            </Button>

            <Button onClick={handleSaveAndDownload} disabled={isSaving || isGenerating} className="flex-1">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Receita
            </Button>
          </div>
        </CardContent>
      </Card>

      <PrescriptionPreviewDialog 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        pdfUrl={pdfUrl} 
        isGenerating={isGenerating} 
        onDownload={() => {}} 
      />
    </>
  );
}
