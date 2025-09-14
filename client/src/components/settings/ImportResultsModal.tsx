import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertTriangle, Download, Copy } from "lucide-react";
import type { ImportResult, ImportError, DuplicateInfo } from "../../lib/excel-import";

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

  const { success, totalRows, validLeads, errors, duplicates = [] } = result;

  const getStatusIcon = () => {
    if (validLeads.length > 0 && errors.length === 0 && duplicates.length === 0) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (validLeads.length > 0 && (errors.length > 0 || duplicates.length > 0)) {
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    } else {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    const parts: string[] = [];
    
    if (validLeads.length > 0) {
      parts.push(`${validLeads.length} leads ready to import`);
    }
    if (errors.length > 0) {
      parts.push(`${errors.length} errors found`);
    }
    if (duplicates.length > 0) {
      parts.push(`${duplicates.length} duplicates detected`);
    }
    
    if (parts.length === 0) {
      return "No valid leads found to import.";
    } else if (validLeads.length > 0 && errors.length === 0 && duplicates.length === 0) {
      return "All leads processed successfully!";
    } else {
      return parts.join(', ') + '.';
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
                  <span className="text-orange-600">Duplicates: {duplicates.length}</span>
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

          {/* Duplicates */}
          {duplicates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicates ({duplicates.length})
                </h4>
                <Badge variant="outline" className="border-orange-200">{duplicates.length} duplicates</Badge>
              </div>
              <ScrollArea className="h-40 border rounded-md">
                <div className="p-3 space-y-2">
                  {duplicates.map((duplicate, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <Badge variant="outline" className="text-xs">Row {duplicate.row}</Badge>
                      <div className="flex-1">
                        <div className="font-medium">{duplicate.lead.name}</div>
                        {duplicate.lead.company && (
                          <div className="text-muted-foreground text-xs">Company: {duplicate.lead.company}</div>
                        )}
                        <div className="text-muted-foreground text-xs mt-1">
                          <span className="font-medium">Duplicate type:</span> {duplicate.duplicateType}
                          {duplicate.matchedFields.length > 0 && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="font-medium">Matched:</span> {duplicate.matchedFields.join(', ')}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {duplicate.lead.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                        {duplicate.lead.phone && <Badge variant="outline" className="text-xs">Phone</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                <strong>Note:</strong> Duplicates were detected based on matching email, phone number, or name+company combination. These leads were excluded from import to prevent data duplication.
              </div>
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