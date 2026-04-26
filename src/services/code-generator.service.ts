import { BaseHttpService } from "./base.service";

export type CodeGeneratorType =
  | "sales_order"
  | "production_batch"
  | "qc_inspection"
  | "customer"
  | "tank"
  | "inventory_location";

type PreviewGeneratedCodeResponse = {
  type: CodeGeneratorType;
  value: string;
};

export class CodeGeneratorService extends BaseHttpService {
  constructor() {
    super();
  }

  async preview(type: CodeGeneratorType): Promise<PreviewGeneratedCodeResponse> {
    const response = await this.httpClient.get(
      `/system-code-generator/preview/${type}`,
    );
    return response.data?.data ?? response.data;
  }
}
