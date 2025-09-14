import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import type { ImportResult, ImportError } from "../../lib/excel-import";

interface ImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
  onConfirmImport?: () => void;
  loading?: boolean;
}

export const ImportResultsModal: React.FC<ImportResultsModalProps> = ({
  isOpen,
  onClose,
  result,
  onConfirmImport,
  loading = false
}) => {
  if (!result) return null;

  const { success, totalRows, validLeads, errors } = result;

  const getStatusIcon = () => {
    if (validLeads.length > 0 && errors.length === 0) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (validLeads.length > 0 && errors.length > 0) {
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    } else {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (validLeads.length > 0 && errors.length === 0) {
      return "All leads processed successfully!";
    } else if (validLeads.length > 0 && errors.length > 0) {
      return `${validLeads.length} leads ready to import, ${errors.length} errors found.`;
    } else {
      return "No valid leads found to import.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon()}
            Excel Import Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">{getStatusMessage()}</p>
                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                  <span>Total Rows: {totalRows}</span>
                  <span className="text-green-600">Valid: {validLeads.length}</span>
                  <span className="text-red-600">Errors: {errors.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valid Leads Preview */}
          {validLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Valid Leads ({validLeads.length})
                </h4>
                <Badge variant="secondary">{validLeads.length} leads ready</Badge>
              </div>
              <ScrollArea className="h-40 border rounded-md">
                <div className="p-3 space-y-2">
                  {validLeads.slice(0, 10).map((lead, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded">
                      <div className="flex-1">
                        <span className="font-medium">{lead.name}</span>
                        {lead.company && <span className="text-muted-foreground ml-2">({lead.company})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                        {lead.phone && <Badge variant="outline" className="text-xs">Phone</Badge>}
                        <Badge variant="secondary" className="text-xs">{lead.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {validLeads.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... and {validLeads.length - 10} more leads
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Errors ({errors.length})
                </h4>
                <Badge variant="destructive">{errors.length} issues</Badge>
              </div>
              <ScrollArea className="h-40 border rounded-md">
                <div className="p-3 space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <Badge variant="outline" className="text-xs">Row {error.row}</Badge>
                      <div className="flex-1">
                        {error.field && (
                          <span className="font-medium text-red-600">{error.field}: </span>
                        )}
                        <span className="text-muted-foreground">{error.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {validLeads.length > 0 && (
                <Button
                  onClick={onConfirmImport}
                  disabled={loading}
                  data-testid="button-confirm-import"
                >
                  {loading ? "Importing..." : `Import ${validLeads.length} Leads`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};