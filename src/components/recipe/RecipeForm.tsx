import { useState, useCallback, useEffect } from "react";
import { FileText, Eye, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationsList } from "./MedicationsList";
import { PrescriptionPreviewDialog } from "./PrescriptionPreviewDialog";
import { Medication } from "./MedicationItem";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function generateId() {
  return crypto.randomUUID();
}

function createEmptyMedication(): Medication {
  return {
    id: generateId(),
    name: "",
    dosage: "",
    quantity: "",
    administration: "",
  };
}

// Função de validação de CPF
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatProperCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
}

export function RecipeForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [documentType] = useState("Receita");
  const [serviceLocation, setServiceLocation] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientCPF, setPatientCPF] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    createEmptyMedication(),
  ]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  async function loadDefaultLocation() {
    if (user) {
      const profile = await fetchDoctorProfile();
      if (profile?.clinic_address) {
        setServiceLocation(profile.clinic_address);
      }
    }
  }

  loadDefaultLocation();
}, [user]); // Dispara quando o objeto user estiver disponível

  const handleAddMedication = useCallback(() => {
    setMedications((prev) => [...prev, createEmptyMedication()]);
  }, []);

  const handleUpdateMedication = useCallback(
    (id: string, field: keyof Medication, value: string) => {
      setMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
      );
    },
    []
  );

  const handleRemoveMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }, []);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientCPF(formatCPF(e.target.value));
  };

  const validateForm = (): boolean => {
    if (!serviceLocation.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o local de atendimento.",
        variant: "destructive",
      });
      return false;
    }

    if (!patientName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do paciente.",
        variant: "destructive",
      });
      return false;
    }

    if (patientCPF.trim() !== "" &&!isValidCPF(patientCPF)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido.",
        variant: "destructive",
      });
      return false;
    }

    const hasValidMedication = medications.some(
      (med) => med.name.trim() && med.dosage.trim()
    );
    if (!hasValidMedication) {
      toast({
        title: "Medicamento obrigatório",
        description:
          "Por favor, adicione pelo menos um medicamento com nome e dosagem.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const fetchDoctorProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setPreviewOpen(true);
    setPdfUrl(null);

    try {
      const profile = await fetchDoctorProfile();

      const payload = {
        documentType,
        serviceLocation,
        patientName,
        patientCPF: patientCPF.replace(/\D/g, ""),
        medications: medications.filter((med) => med.name.trim()),
        doctor: profile
          ? {
              name: profile.name,
              crm: profile.crm,
              specialty: profile.specialty,
              clinicName: profile.clinic_name,
              clinicAddress: profile.clinic_address,
              phone: profile.phone,
              email: profile.email,
            }
          : null,
      };

      const response = await fetch("/api/generate-prescription-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const err = await response.json();
          throw new Error(err?.error || err?.message || "Erro ao gerar PDF");
        }
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      setPreviewOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndDownload = async () => {
    if (!validateForm() || !user) return;

    setIsSaving(true);

    try {
      // Save to database
      const { error } = await supabase.from("prescriptions").insert([{
        user_id: user.id,
        document_type: documentType,
        service_location: serviceLocation,
        patient_name: patientName,
        patient_cpf: patientCPF.replace(/\D/g, ""),
        medications: medications.filter((med) => med.name.trim()) as unknown as import("@/integrations/supabase/types").Json,
      }]);

      if (error) throw error;

      // Generate and download PDF if not already generated
      if (!pdfUrl) {
        await generatePDF();
      }

      if (pdfUrl) {
        // Create download link
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `receita_${patientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Receita salva com sucesso!",
        description: "A receita foi salva e o PDF foi baixado.",
      });

      // Reset form
      setServiceLocation("");
      setPatientName("");
      setPatientCPF("");
      setMedications([createEmptyMedication()]);
      setPdfUrl(null);
      setPreviewOpen(false);
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast({
        title: "Erro ao salvar receita",
        description: "Ocorreu um erro ao salvar a receita. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `receita_${patientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de Documento</Label>
            <Select value={documentType} disabled>
              <SelectTrigger id="documentType" className="bg-muted">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Receita">Receita</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Outros tipos de documentos serão adicionados em breve.
            </p>
          </div>

          {/* Service Location */}
          <div className="space-y-2">
            <Label htmlFor="serviceLocation">Local de Atendimento</Label>
            <Input
              id="serviceLocation"
              placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
              value={serviceLocation}
              onChange={(e) => setServiceLocation(e.target.value)}
            />
          </div>

          {/* Patient Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <Input
                id="patientName"
                placeholder="Nome completo do paciente"
                value={patientName}
                onChange={(e) => setPatientName(formatProperCase(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientCPF">CPF do Paciente</Label>
              <Input
                id="patientCPF"
                placeholder="000.000.000-00"
                value={patientCPF}
                onChange={handleCPFChange}
                maxLength={14}
              />
            </div>
          </div>

          {/* Medications List */}
          <MedicationsList
            medications={medications}
            onAdd={handleAddMedication}
            onUpdate={handleUpdateMedication}
            onRemove={handleRemoveMedication}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Visualizar Preview
            </Button>

            <Button
              type="button"
              onClick={handleSaveAndDownload}
              disabled={isSaving || isGenerating}
              className="flex-1"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar e Baixar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <PrescriptionPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        pdfUrl={pdfUrl}
        isGenerating={isGenerating}
        onDownload={handleDownload}
      />
    </>
  );
}
