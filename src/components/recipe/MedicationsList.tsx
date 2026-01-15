import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicationItem, Medication } from "./MedicationItem";

interface MedicationsListProps {
  medications: Medication[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Medication, value: string) => void;
  onRemove: (id: string) => void;
}

export function MedicationsList({
  medications,
  onAdd,
  onUpdate,
  onRemove,
}: MedicationsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Medicamentos</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento
        </Button>
      </div>

      <div className="space-y-4">
        {medications.map((medication, index) => (
          <MedicationItem
            key={medication.id}
            medication={medication}
            index={index}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={medications.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
