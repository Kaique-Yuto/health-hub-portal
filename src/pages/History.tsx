import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon, Search, Filter, FileText, Calendar, User, Loader2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Prescription {
  id: string;
  patient_name: string;
  patient_cpf: string;
  document_type: string;
  service_location: string;
  medications: any[];
  created_at: string;
}

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ["prescriptions-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Prescription[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Receita excluída com sucesso!");
      refetch();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Erro ao excluir receita");
    }
  };

  const filteredPrescriptions = prescriptions?.filter((prescription) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      prescription.patient_name.toLowerCase().includes(searchLower) ||
      prescription.patient_cpf.includes(searchTerm) ||
      prescription.document_type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
          <p className="text-muted-foreground mt-1">Consulte todas as receitas emitidas</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, CPF, tipo de documento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando receitas...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!filteredPrescriptions || filteredPrescriptions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <HistoryIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhuma receita encontrada" : "Histórico vazio"}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm
                ? "Tente buscar com outros termos."
                : "Você ainda não emitiu nenhuma receita. Quando emitir, elas aparecerão aqui."}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/gerar-receita">Gerar primeira receita</Link>
              </Button>
            )}
          </div>
        )}

        {/* Prescriptions Table */}
        {!isLoading && filteredPrescriptions && filteredPrescriptions.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {prescription.patient_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prescription.patient_cpf}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {prescription.document_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prescription.service_location}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(prescription.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A receita de {prescription.patient_name} será permanentemente excluída.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(prescription.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {!isLoading && filteredPrescriptions && filteredPrescriptions.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {filteredPrescriptions.length} receita{filteredPrescriptions.length !== 1 ? "s" : ""} encontrada{filteredPrescriptions.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
