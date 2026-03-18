import { BaseHttpService } from "./base.service";
import { IAddOrUpdateContact, IContact } from "@/types/contact";

export class ContactService extends BaseHttpService {
  constructor() {
    super();
  }

  async getAllContacts(queryParams ={}) {
    const response = await this.httpClient.get("/contactall", {
      params: queryParams
    });
    return response.data;
  }

  async getContacts(queryParams ={}) {
    const response = await this.httpClient.get("/contact", {
      params: queryParams
    });
    return response.data;
  }

  async deleteContact(contactId: string) {
    const response = await this.httpClient.delete(
      `/contact-destroy/${contactId}`
    );
    return response.data;
  }

  async getContact(contactId: string) {
    const response = await this.httpClient.get(`/contact/${contactId}`);
    return response.data;
  }

  async createContact(payload: FormData) {
    const response = await this.httpClient.post("/contact-store", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async updateContact(contactId: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/contact-update/${contactId}`,
      payload
    );
    return response.data;
  }
}
