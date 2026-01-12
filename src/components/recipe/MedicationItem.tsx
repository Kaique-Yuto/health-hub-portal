import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  administration: string;
}

interface MedicationItemProps {
  medication: Medication;
  index: number;
  onUpdate: (id: string, field: keyof Medication, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function MedicationItem({
  medication,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: MedicationItemProps) {
  return (
    <Card className="border-border bg-card/50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Medicamento {index + 1}
          </span>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(medication.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`name-${medication.id}`}>Nome do Medicamento</Label>
            <Input
              id={`name-${medication.id}`}
              placeholder="Ex: Paracetamol"
              value={medication.name}
              onChange={(e) => onUpdate(medication.id, "name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`dosage-${medication.id}`}>Dosagem</Label>
            <Input
              id={`dosage-${medication.id}`}
              placeholder="Ex: 500mg"
              value={medication.dosage}
              onChange={(e) => onUpdate(medication.id, "dosage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`quantity-${medication.id}`}>Quantidade</Label>
            <Input
              id={`quantity-${medication.id}`}
              placeholder="Ex: 20 comprimidos"
              value={medication.quantity}
              onChange={(e) => onUpdate(medication.id, "quantity", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor={`administration-${medication.id}`}>Administração</Label>
          <Textarea
            id={`administration-${medication.id}`}
            placeholder="Ex: Tomar 1 comprimido a cada 6 horas, se necessário, por 5 dias."
            value={medication.administration}
            onChange={(e) => onUpdate(medication.id, "administration", e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
