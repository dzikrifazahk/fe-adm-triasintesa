"use client";
import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./column";
import { contactService } from "@/services";
import Swal from "sweetalert2";
import { IAddOrUpdateContact, IContact } from "@/types/contact";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { DetailModalContact } from "./detailModalContact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoading } from "@/context/loadingContext";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function SettingsContactMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_contact"];
}) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IContact[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");
  const [contactType, setContactType] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [attachmentNpwp, setAttachmentNpwp] = useState<File | null>(null);
  const [attachmentNpwpUrl, setAttachmentNpwpUrl] = useState("");
  const [pic, setPic] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState<string | null>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [currency, setCurrency] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedData, setSelectedData] = useState<IContact | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IContact[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }
    const response = await contactService.getContacts(filterParams);
    setData(response.data);
    setMetadata(response.meta);
    return response.data;
  };

  const handleNpwpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
    ];

    if (!allowedTypes.includes(event.target.files?.[0]?.type || "")) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file PDF, JPG, JPEG, PNG, atau HEIC yang diperbolehkan.",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setAttachmentNpwp(file);
    } else {
      setAttachmentNpwp(null);
    }
  };

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
    ];

    if (!allowedTypes.includes(event.target.files?.[0]?.type || "")) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file PDF, JPG, JPEG, PNG, atau HEIC yang diperbolehkan.",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
    } else {
      setAttachment(null);
    }
  };
  useEffect(() => {
    getData(page, pageSize);
    setIsLoading(false);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize, debouncedSearch, filterPayload);
  };

  const handleGetData = async (id: string) => {
    const { data } = await contactService.getContact(id);
    setId(id);
    setContactType(String(data.contact_type.id) ?? "");
    setContactName(data.name ?? "");
    setContactAddress(data.address ?? "");
    setAttachmentNpwpUrl(data.attachment_npwp ?? "");
    setPic(data.pic_name ?? "");
    setContactPhone(data.phone ?? "");
    setContactEmail(data.email ?? "");
    setAttachmentUrl(data.attachment_file ?? "");
    setBankName(data?.bank_name ?? "");
    setBranchName(data?.branch ?? "");
    setBankAccountName(data?.account_name ?? "");
    setCurrency(data?.currency ?? "");
    setBankAccountNumber(data?.account_number ?? "");
    setSwiftCode(data?.swift_code ?? "");
    setVendorCategory(data?.vendor_category ?? "");
    setSelectedData(data);
  };

  const handleEditData = async (id: string) => {
    await handleGetData(id);
    setTitle("Ubah Kontak");
    setModalType("edit");
    toggleModal();
  };

  const handleCreateData = () => {
    setTitle("Tambah Kontak");
    setModalType("create");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Kontak ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await contactService.deleteContact(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Hapus Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleViewData = async (id: string) => {
    await handleGetData(id);
    setModalType("detail");
    setTitle("Detail Kontak");
    toggleDetailModal();
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const toggleDetailModal = () => {
    setDetailModalOpen(!isDetailModalOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "edit") {
      const formData = new FormData();
      const payload: IAddOrUpdateContact = {
        name: contactName,
        contact_type: contactType,
        address: contactAddress,
        pic_name: pic,
        phone: contactPhone,
        bank_name: bankName,
        branch: branchName,
        account_name: bankAccountName,
        currency: currency,
        account_number: bankAccountNumber,
        swift_code: swiftCode,
      };

      if (contactEmail) {
        payload.email = contactEmail;
      }

      if (vendorCategory) {
        payload.vendor_category = vendorCategory;
      }

      if (attachmentNpwp) {
        formData.append("attachment_npwp", attachmentNpwp);
      }
      if (attachment) {
        formData.append("attachment_file", attachment);
      }
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah Kontak?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const response = await contactService.updateContact(id, formData);
          getData(page, pageSize, debouncedSearch, filterPayload);
          if (response.status_code === 200) {
            setLoading(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          } else {
            setLoading(false);
            Swal.fire({
              icon: "error",
              title: `Terjadi Kesalahan ${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
          clearInput();
        } else if (result.isConfirmed === false) {
          clearInput();
          Swal.fire({
            icon: "warning",
            title: "Batal Ubah Data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    } else {
      const formData = new FormData();
      const payload: IAddOrUpdateContact = {
        name: contactName,
        contact_type: contactType,
        address: contactAddress,
        pic_name: pic,
        phone: contactPhone,
        bank_name: bankName,
        branch: branchName,
        account_name: bankAccountName,
        currency: currency,
        account_number: bankAccountNumber,
        swift_code: swiftCode,
      };
      if (contactEmail) {
        payload.email = contactEmail;
      }
      if (vendorCategory) {
        payload.vendor_category = vendorCategory;
      }

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (attachmentNpwp) {
        formData.append("attachment_npwp", attachmentNpwp);
      }
      if (attachment) {
        formData.append("attachment_file", attachment);
      }

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin menambahkan Kontak?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const response = await contactService.createContact(formData);
          getData(page, pageSize, debouncedSearch, filterPayload);
          if (response.status_code === 200) {
            setLoading(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: `Terjadi Kesalahan ${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
          clearInput();
        } else if (result.isConfirmed === false) {
          clearInput();
          Swal.fire({
            icon: "warning",
            title: "Batal Tambah Data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    }
  };

  const handleCancel = () => {
    clearInput();
  };

  const clearInput = () => {
    setSelectedData(null);
    setDetailModalOpen(false);
    setModalOpen(false);
    setId("");
    setContactType("");
    setContactName("");
    setContactAddress("");
    setAttachmentNpwpUrl("");
    setPic("");
    setContactPhone("");
    setContactEmail("");
    setAttachmentUrl("");
    setBankName("");
    setBranchName("");
    setBankAccountName("");
    setCurrency("");
    setBankAccountNumber("");
    setSwiftCode("");
    setAttachmentNpwp(null);
    setAttachment(null);
    setVendorCategory("");
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch, filterPayload);
  }, [debouncedSearch]);

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getData(page, pageSize, debouncedSearch, payload);
  };

  const handleClearPayload = () => {
    setFilterPayload("");
    getData(page, pageSize);
    Swal.fire({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await getData(page, pageSize, debouncedSearch, filterPayload);
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Data berhasil di refresh",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      clearInput();
    } catch (e) {
      setIsLoading(false);
      clearInput();
      if (axios.isAxiosError(e)) {
        const message = e.response?.data?.message ?? "";
        Swal.fire({
          icon: "error",
          title: `Terjadi Kesalahan ${message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  };

  return (
    <>
      <div className="w-full h-full">
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={title}
          width="w-[85vw]"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="w-full">
            <div className="m-3 flex flex-col gap-3">
              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Kontak
              </div>
              <div className="flex flex-col md:flex-row gap-5 px-3">
                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Nama Kontak <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nama Kontak"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    No. Telp <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="number"
                      className="grow text-primary"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="No. Telp"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">Email</span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="email"
                      className="grow text-primary"
                      value={contactEmail ?? ""}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5 px-3">
                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Tipe Kontak <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Select value={contactType} onValueChange={setContactType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Tipe Kontak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tipe Kontak</SelectLabel>
                        <SelectItem value="1">Vendor</SelectItem>
                        <SelectItem value="2">Client</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {contactType === "1" && (
                    <div>
                      <div className="flex flex-col w-full gap-2">
                        <span className="text-sm md:text-lg font-poppins">
                          Kategori Vendor{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                        <label className="input border-slate-400 flex items-center gap-2">
                          <Input
                            type="text"
                            className="grow text-primary"
                            value={vendorCategory}
                            onChange={(e) => setVendorCategory(e.target.value)}
                            placeholder="Kategori Vendor"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Nama PIC <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={pic}
                      onChange={(e) => setPic(e.target.value)}
                      placeholder="PIC"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Alamat <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Textarea
                    className="textarea border-slate-400 w-full"
                    placeholder="Alamat"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Bank
              </div>
              <div className="flex flex-col md:flex-row gap-5 px-3">
                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Nama Akun Rekening
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={bankAccountName ?? ""}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Nama Akun Rekening"
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Nama Bank
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={bankName ?? ""}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Nama Bank"
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Cabang
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={branchName ?? ""}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="Cabang"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5 px-3">
                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Nomor Rekening
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="number"
                      className="grow text-primary"
                      value={bankAccountNumber ?? ""}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Nomor Rekening"
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Mata Uang
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={currency ?? ""}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="Mata Uang"
                    />
                  </label>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    Swift Code
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={swiftCode ?? ""}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="Swift Code"
                    />
                  </label>
                </div>
              </div>

              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Lainya
              </div>
              <div className="flex flex-col md:flex-row gap-5 px-3">
                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">NPWP</span>
                  <Input
                    type="file"
                    accept=".pdf, .jpeg, .jpg, .png, .heic"
                    className="file-input file-input-bordered file-input-primary w-full"
                    onChange={handleNpwpChange}
                  />
                  {modalType === "edit" && attachmentNpwpUrl && (
                    <>
                      <div className="text-sm md:text-lg font-semibold bg-gray-100 rounded-md p-2 mt-2">
                        NPWP Sebelumnya
                      </div>
                      <a
                        href={attachmentNpwpUrl}
                        className="text-blue-500 font-bold flex justify-center border border-gray-300 rounded-md p-2"
                        target="_blank"
                      >
                        Klik Disini
                      </a>
                    </>
                  )}
                </div>

                <div className="flex flex-col w-full gap-2">
                  <span className="text-sm md:text-lg font-poppins">
                    File Lainya
                  </span>
                  <Input
                    type="file"
                    accept=".pdf, .jpeg, .jpg, .png, .xlsx, .heic"
                    className="file-input file-input-bordered file-input-primary w-full"
                    onChange={handleAttachmentChange}
                  />
                  {modalType === "edit" && attachmentUrl && (
                    <>
                      <div className="text-sm md:text-lg font-semibold bg-gray-100 rounded-md p-2 mt-2">
                        File Sebelumnya
                      </div>
                      <a
                        href={attachmentUrl}
                        className="text-blue-500 font-bold flex justify-center border border-gray-300 rounded-md p-2"
                        target="_blank"
                      >
                        Klik Disini
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <DetailModalContact
          data={selectedData}
          isOpen={isDetailModalOpen}
          title={title}
          onClose={handleCancel}
          onCancel={handleCancel}
        />

        <Card className="flex flex-col h-full">
          <CardContent className="flex-1 min-h-0 overflow-auto">
            <DataTable
              columns={columns({
                deleteData: handleDeleteData,
                editData: handleEditData,
                viewDetailData: handleViewData,
                dictionary: dictionary,
              })}
              data={data}
              addData={handleCreateData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              isClearPayload={handleClearPayload}
              dictionary={dictionary}
              isGetData={handleRefreshData}
            ></DataTable>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
