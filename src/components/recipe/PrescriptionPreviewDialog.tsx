import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from "react";

interface PrescriptionPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  isGenerating: boolean;
  onDownload: () => void;
}

export function PrescriptionPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  isGenerating,
  onDownload,
}: PrescriptionPreviewDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  // pdfUrl is already a data URL from the parent component
  const getDataUrl = () => {
    return pdfUrl || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle>Preview da Receita</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={!pdfUrl || isGenerating}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted p-4">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Gerando receita...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={getDataUrl()}
              className="w-full h-full rounded-lg border border-border bg-card"
              title="Preview da Receita"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Nenhuma receita disponível para visualização
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card">
          <p className="text-sm text-muted-foreground text-center">
            💡 Dica: Clique em "Imprimir / Salvar PDF" e selecione "Salvar como PDF" no destino da impressora
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
