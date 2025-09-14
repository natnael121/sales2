import * as XLSX from 'xlsx';
import { z } from 'zod';
import type { InsertLead, LeadStatus } from '../types';

// Excel lead import schema
const excelLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  estimatedValue: z.union([z.number(), z.string().transform(val => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  })]).optional(),
  status: z.enum(["new", "contacted", "interested", "meeting", "converted", "closed"]).optional().default("new"),
  source: z.string().optional(),
  notes: z.string().optional()
});

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validLeads: InsertLead[];
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

// Expected column mappings (case insensitive)
const COLUMN_MAPPINGS: Record<string, string> = {
  'name': 'name',
  'full name': 'name',
  'lead name': 'name',
  'customer name': 'name',
  'email': 'email',
  'email address': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'mobile': 'phone',
  'company': 'company',
  'company name': 'company',
  'organization': 'company',
  'estimated value': 'estimatedValue',
  'value': 'estimatedValue',
  'deal value': 'estimatedValue',
  'revenue': 'estimatedValue',
  'status': 'status',
  'lead status': 'status',
  'source': 'source',
  'lead source': 'source',
  'notes': 'notes',
  'comments': 'notes',
  'description': 'notes'
};

const normalizeColumnName = (columnName: string): string => {
  const normalized = columnName.toLowerCase().trim();
  return COLUMN_MAPPINGS[normalized] || columnName;
};

const validateLeadStatus = (status: string): LeadStatus => {
  const normalizedStatus = status.toLowerCase().trim();
  const statusMappings: Record<string, LeadStatus> = {
    'new': 'new',
    'contacted': 'contacted',
    'interested': 'interested',
    'meeting': 'meeting',
    'scheduled': 'meeting',
    'converted': 'converted',
    'closed': 'closed',
    'won': 'converted',
    'lost': 'closed'
  };
  
  return statusMappings[normalizedStatus] || 'new';
};

export const parseExcelFile = async (file: File, organizationId: string): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({
            success: false,
            totalRows: 0,
            validLeads: [],
            errors: [{ row: 0, message: 'No worksheets found in the file' }]
          });
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            totalRows: 0,
            validLeads: [],
            errors: [{ row: 0, message: 'The worksheet is empty' }]
          });
          return;
        }
        
        // Get headers from first row
        const headers = jsonData[0].map((header: any) => 
          typeof header === 'string' ? normalizeColumnName(header) : ''
        );
        
        // Check if we have required columns
        if (!headers.includes('name')) {
          resolve({
            success: false,
            totalRows: 0,
            validLeads: [],
            errors: [{ 
              row: 1, 
              message: 'Required column "name" not found. Please ensure your Excel file has a "Name" column.' 
            }]
          });
          return;
        }
        
        const validLeads: InsertLead[] = [];
        const errors: ImportError[] = [];
        
        // Process data rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.every(cell => !cell)) continue; // Skip empty rows
          
          try {
            // Map row data to object using headers
            const rowData: any = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined && row[index] !== null) {
                rowData[header] = row[index];
              }
            });
            
            // Skip rows without name
            if (!rowData.name) {
              errors.push({
                row: i + 1,
                field: 'name',
                message: 'Name is required'
              });
              continue;
            }
            
            // Clean and validate the data
            const cleanedData = {
              name: String(rowData.name).trim(),
              email: rowData.email ? String(rowData.email).trim() : undefined,
              phone: rowData.phone ? String(rowData.phone).trim() : undefined,
              company: rowData.company ? String(rowData.company).trim() : undefined,
              estimatedValue: rowData.estimatedValue ? Number(rowData.estimatedValue) || 0 : undefined,
              status: rowData.status ? validateLeadStatus(String(rowData.status)) : 'new' as LeadStatus,
              source: rowData.source ? String(rowData.source).trim() : 'Excel Import',
              notes: rowData.notes ? String(rowData.notes).trim() : undefined
            };
            
            // Validate using schema
            const validationResult = excelLeadSchema.safeParse(cleanedData);
            
            if (validationResult.success) {
              const lead: InsertLead = {
                ...validationResult.data,
                organizationId,
                // Set email to undefined if empty string to match schema
                email: cleanedData.email && cleanedData.email.length > 0 ? cleanedData.email : undefined,
                // Ensure estimatedValue is a number or undefined
                estimatedValue: typeof cleanedData.estimatedValue === 'number' ? cleanedData.estimatedValue : undefined
              };
              
              validLeads.push(lead);
            } else {
              // Collect validation errors
              validationResult.error.errors.forEach(error => {
                errors.push({
                  row: i + 1,
                  field: error.path.join('.'),
                  message: error.message
                });
              });
            }
          } catch (error) {
            errors.push({
              row: i + 1,
              message: `Error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }
        
        resolve({
          success: validLeads.length > 0,
          totalRows: jsonData.length - 1, // Excluding header
          validLeads,
          errors
        });
        
      } catch (error) {
        resolve({
          success: false,
          totalRows: 0,
          validLeads: [],
          errors: [{ 
            row: 0, 
            message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        totalRows: 0,
        validLeads: [],
        errors: [{ row: 0, message: 'Error reading file' }]
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const createSampleExcelFile = () => {
  const sampleData = [
    ['Name', 'Email', 'Phone', 'Company', 'Estimated Value', 'Status', 'Source', 'Notes'],
    ['John Doe', 'john@example.com', '+1-555-0123', 'Acme Corp', 15000, 'New', 'Website', 'Interested in premium package'],
    ['Jane Smith', 'jane@techco.com', '+1-555-0124', 'Tech Co', 25000, 'Contacted', 'Referral', 'Needs demo next week'],
    ['Bob Johnson', 'bob@startup.io', '+1-555-0125', 'Startup Inc', 5000, 'Interested', 'Cold Call', 'Budget approved'],
    ['Alice Brown', 'alice@corp.com', '', 'Corp Ltd', 30000, 'Meeting', 'LinkedIn', 'Decision maker identified']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  
  // Generate file and download
  const fileName = 'sample-leads-template.xlsx';
  XLSX.writeFile(wb, fileName);
};