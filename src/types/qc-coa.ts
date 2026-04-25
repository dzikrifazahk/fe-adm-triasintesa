import { IProductionBatch } from "./production";

export type QcFinalStatus = "pending" | "approved" | "rejected";
export type CoaConclusion = "pass" | "fail";

export interface IQcTemplate {
  id: number;
  templateName: string;
  parameters: unknown;
}

export interface IQcInspectionResult {
  id?: number;
  parameter: string;
  result: string;
  notes?: string;
}

export interface IQcInspection {
  id: number;
  batchId: number;
  qcNumber: string;
  inspectionDate: string;
  inspectionTime: string;
  templateId: number;
  interpretationNotes?: string;
  digitalSignaturePjtQc?: string;
  pjtQcApproved?: boolean;
  pjtQcApprovedBy?: number;
  pjtQcApprovedAt?: string;
  finalStatus: QcFinalStatus;
  rejectionReason?: string;
  batch?: IProductionBatch;
  template?: IQcTemplate;
  results?: IQcInspectionResult[];
}

export interface IQcRejectLog {
  id: number;
  batchId: number;
  qcInspectionId: number;
  rejectDate: string;
  rejectStage: "bahan_baku" | "proses_1" | "proses_2" | "hasil_akhir";
  reason: string;
  quantityRejected: number;
  rejectedBy: number;
  notes?: string;
  batch?: IProductionBatch;
  qcInspection?: IQcInspection;
}

export interface IQcApprovalStatus {
  inspectionId: number;
  qcNumber: string;
  finalStatus: QcFinalStatus;
  approvalStages: {
    pjtQc: {
      approved: boolean;
      approvedBy?: number;
      approvedAt?: string;
    };
  };
  nextAction?: string;
}

export interface ICoaItem {
  id?: number;
  parameter: string;
  testMethod?: string;
  specification?: string;
  orderNo?: number;
}

export interface ICoaCertificate {
  id: number;
  coaNumber: string;
  batchId: number;
  qcInspectionId: number;
  issueDate: string;
  expiryDate: string;
  productName: string;
  batchNumber: string;
  productionDate?: string;
  testResults?: unknown;
  specificationLimits?: unknown;
  testMethod?: string;
  testStandard?: string;
  conclusion: CoaConclusion;
  remarks?: string;
  pdfFilePath?: string;
  batch?: IProductionBatch;
  qcInspection?: IQcInspection;
  items?: ICoaItem[];
}
