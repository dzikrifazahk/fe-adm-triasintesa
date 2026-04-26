import { BaseHttpService } from "./base.service";

type QueryParams = Record<string, unknown>;

export class QcCoaService extends BaseHttpService {
  constructor() {
    super();
  }

  async getQcInspections(queryParams?: QueryParams) {
    const response = await this.httpClient.get("/qc-coa/qc-inspections", {
      params: queryParams,
    });
    return response.data;
  }

  async getQcInspection(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-inspections/${id}`,
    );
    return response.data;
  }

  async createQcInspection(payload: unknown) {
    const response = await this.httpClient.post(
      "/qc-coa/qc-inspections",
      payload,
    );
    return response.data;
  }

  async updateQcInspection(id: string, payload: unknown) {
    const response = await this.httpClient.patch(
      `/qc-coa/qc-inspections/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteQcInspection(id: string) {
    const response = await this.httpClient.delete(
      `/qc-coa/qc-inspections/${id}`,
    );
    return response.data;
  }

  async replaceQcResults(id: string, payload: unknown) {
    const response = await this.httpClient.put(
      `/qc-coa/qc-inspections/${id}/results`,
      payload,
    );
    return response.data;
  }

  async getQcInspectionApprovalStatus(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-inspections/${id}/approval-status`,
    );
    return response.data;
  }

  async approvePjtQc(id: string, payload?: { digitalSignature?: string }) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/approve-pjt-qc`,
      payload ?? {},
    );
    return response.data;
  }

  async rejectQcInspection(
    id: string,
    payload: { reason: string; notes?: string },
  ) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/reject`,
      payload,
    );
    return response.data;
  }

  async resubmitQcInspection(id: string) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/resubmit`,
    );
    return response.data;
  }

  async getQcTemplates(queryParams?: QueryParams) {
    const response = await this.httpClient.get("/qc-coa/qc-templates", {
      params: queryParams,
    });
    return response.data;
  }

  async getQcTemplate(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-templates/${id}`,
    );
    return response.data;
  }

  async createQcTemplate(payload: unknown) {
    const response = await this.httpClient.post(
      "/qc-coa/qc-templates",
      payload,
    );
    return response.data;
  }

  async updateQcTemplate(id: string, payload: unknown) {
    const response = await this.httpClient.patch(
      `/qc-coa/qc-templates/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteQcTemplate(id: string) {
    const response = await this.httpClient.delete(
      `/qc-coa/qc-templates/${id}`,
    );
    return response.data;
  }

  async getCoaCertificates(queryParams?: QueryParams) {
    const response = await this.httpClient.get(
      "/qc-coa/coa-certificates",
      { params: queryParams },
    );
    return response.data;
  }

  async getCoaCertificate(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/coa-certificates/${id}`,
    );
    return response.data;
  }

  async getCoaPrintBlob(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/coa-certificates/${id}/print`,
      { responseType: "blob" },
    );
    return response.data as Blob;
  }

}
