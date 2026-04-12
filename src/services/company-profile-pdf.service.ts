import { BaseHttpService } from "./base.service";

export class CompanyProfilePdfService extends BaseHttpService {
  constructor() {
    super();
  }

  async uploadCompanyProfilePdf(payload: FormData) {
    const response = await this.httpClient.post("/company-profile/pdf", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async checkCompanyProfilePdf() {
    const response = await this.httpClient.head("/company-profile/pdf", {
      validateStatus: (status) => status === 200 || status === 404,
    });
    return response;
  }
}
