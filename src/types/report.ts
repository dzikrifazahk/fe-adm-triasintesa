export type ReportType = 'financial' | 'production' | 'inventory';
export type ReportFormat = 'pdf' | 'xlsx' | 'csv';
export type ReportDepartment = 'all' | 'finance' | 'operations' | 'warehouse';

export interface IReportFilterPayload {
  reportType: ReportType;
  reportFormat: ReportFormat;
  dateFrom: string;
  dateTo: string;
  department: ReportDepartment;
  keyword?: string;
  notes?: string;
}

export interface IReportStats {
  template_count: number;
  exports_month_count: number;
  active_schedule_count: number;
}

export interface IReportPreview {
  summaryTitle: string;
  status: 'ready_to_export';
  period: {
    from: string;
    to: string;
  };
  format: 'PDF' | 'XLSX' | 'CSV';
  departmentLabel: string;
  countedItems: number;
  totalAmount: number;
  metrics?: {
    invoiced: number;
    paid: number;
    cash_in: number;
    cash_out: number;
    expense_approved: number;
    net: number;
  };
}
