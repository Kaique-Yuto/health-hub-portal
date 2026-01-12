import { History as HistoryIcon, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function History() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
          <p className="text-muted-foreground mt-1">Consulte todas as receitas emitidas</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, medicamento..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <HistoryIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Histórico vazio
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Você ainda não emitiu nenhuma receita. Quando emitir, elas aparecerão aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
