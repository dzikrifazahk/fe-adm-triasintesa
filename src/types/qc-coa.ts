import { IProductionBatch } from "./production";

export type QcTestResult = "PASS" | "FAIL" | "CONDITIONAL";
export type QcFinalStatus = "pending" | "approved" | "rejected";
export type CoaConclusion = "pass" | "fail" | "conditional";

export interface IQcTemplate {
  id: number;
  templateName: string;
  parameters: any;
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
  qcStage: number;
  interpretationNotes?: string;
  testResult: QcTestResult;
  qcBarcode: string;
  digitalSignaturePjtQc?: string;
  pjtQcApproved?: boolean;
  pjtQcApprovedBy?: number;
  pjtQcApprovedAt?: string;
  staffProduksiApproved?: boolean;
  staffProduksiApprovedBy?: number;
  staffProduksiApprovedAt?: string;
  direkturApproved?: boolean;
  direkturApprovedBy?: number;
  direkturApprovedAt?: string;
  direkturStampFile?: string;
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
    stage1_pjtQc: {
      approved: boolean;
      approvedBy?: number;
      approvedAt?: string;
    };
    stage2_staffProduksi: {
      approved: boolean;
      approvedBy?: number;
      approvedAt?: string;
    };
    stage3_direktur: {
      approved: boolean;
      approvedBy?: number;
      approvedAt?: string;
      stampFile?: string;
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
  testResults?: any;
  specificationLimits?: any;
  testMethod?: string;
  testStandard?: string;
  conclusion: CoaConclusion;
  remarks?: string;
  approvedBy?: number;
  approvedAt?: string;
  digitalSignature?: string;
  pdfFilePath?: string;
  batch?: IProductionBatch;
  qcInspection?: IQcInspection;
  items?: ICoaItem[];
}
