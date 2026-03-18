"use client";

import { useLoading } from "@/context/loadingContext";
import { useContext, useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { ITax } from "@/types/tax";
import { taxService } from "@/services";
import Swal from "sweetalert2";
import { IMeta } from "@/types/common";
import axios from "axios";
import useDebounce from "@/utils/useDebouncy";
import { Modal } from "@/components/custom/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsTaxMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_tax"];
}) {
  const { isMobile } = useContext(MobileContext);
  const [data, setData] = useState<ITax[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<"create" | "edit">("create");

  const [taxId, setTaxId] = useState("");
  const [taxName, setTaxName] = useState("");
  const [selectedTaxType, setSelectedTaxType] = useState("");
  const [percent, setPercent] = useState("");
  const [description, setDescription] = useState("");
  const { setIsLoading } = useLoading();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<ITax[]> => {
    let filterParams = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    if (search) {
      filterParams = { ...filterParams, search: search };
    }
    const response = await taxService.getTaxs(filterParams);

    setData(response.data);
    setMetadata(response.meta);
    return response.data;
  };

  useEffect(() => {
    getData(page, pageSize);
  }, []);

  const handleEditData = async (taxId: string) => {
    setTitle("Ubah Pajak");
    setModalType("edit");
    const { data } = await taxService.getTax(taxId);
    setTaxId(taxId);
    setTaxName(data.name);
    setSelectedTaxType(data.type);
    setPercent(data.percent);
    setDescription(data.description);

    toggleModal();
  };

  const handleCreateData = () => {
    setTitle("Tambah Pajak");
    setModalType("create");
    toggleModal();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize, debouncedSearch);
  };

  const handleDeleteData = (taxId: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Tax ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await taxService.deleteTax(taxId);
        getData(page, pageSize, debouncedSearch);
        if (response.status_code === 200) {
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setIsLoading(false);
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
        setIsLoading(false);
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

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSubmit = () => {
    if (modalType === "edit") {
      const payload: ITax = {
        name: taxName,
        description: description,
        percent: percent,
        type: selectedTaxType,
      };

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah Tax?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        // toast: true,
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsLoading(true);
            const response = await taxService.updateTax(taxId, payload);
            getData(page, pageSize, debouncedSearch);
            if (response.status_code === 200) {
              setIsLoading(false);
              Swal.fire({
                icon: "success",
                title: `${response.message}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
            }
          } catch (e) {
            setIsLoading(false);
            if (axios.isAxiosError(e)) {
              const errorMessages: string[] = [];
              const message = e.response?.data?.message ?? "";
              if (message) {
                for (const field in message) {
                  if (message.hasOwnProperty(field)) {
                    errorMessages.push(
                      `${field}: ${message[field].join(", ")}`
                    );
                  }
                }
              }
              Swal.fire({
                icon: "error",
                title: `Terjadi Kesalahan ${errorMessages}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
          clearInput();
        } else if (result.isConfirmed === false) {
          clearInput();
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
    } else {
      const payload: ITax = {
        name: taxName,
        description: description,
        percent: percent,
        type: selectedTaxType,
      };

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin menambahkan Tax?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        // toast: true,
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsLoading(true);
            const response = await taxService.createTax(payload);
            getData(page, pageSize, debouncedSearch);
            if (response.status_code === 200) {
              setIsLoading(false);
              Swal.fire({
                icon: "success",
                title: `${response.message}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
            }
          } catch (e) {
            setIsLoading(false);
            if (axios.isAxiosError(e)) {
              const errorMessages: string[] = [];
              const message = e.response?.data?.message ?? "";
              if (message) {
                for (const field in message) {
                  if (message.hasOwnProperty(field)) {
                    errorMessages.push(
                      `${field}: ${message[field].join(", ")}`
                    );
                  }
                }
              }
              Swal.fire({
                icon: "error",
                title: `Terjadi Kesalahan ${errorMessages}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
          clearInput();
        } else if (result.isConfirmed === false) {
          clearInput();
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
    }
    toggleModal();
  };

  const handleCancel = () => {
    clearInput();
    toggleModal();
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch);
  }, [debouncedSearch]);

  const clearInput = () => {
    setTaxId("");
    setSelectedTaxType("");
    setTaxName("");
    setSelectedTaxType("");
    setPercent("");
    setDescription("");
    toggleModal();
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await getData(page, pageSize, debouncedSearch);
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
          width={`${isMobile ? "w-[90vw]" : "w-[60vw]"}`}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="w-full">
            <div className="m-3 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex flex-col w-full gap-2" id="select">
                  <span className="font-poppins text-sm md:text-lg">
                    Tipe Pajak <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Select
                    value={selectedTaxType}
                    onValueChange={setSelectedTaxType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Tipe Pajak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PPN">PPN</SelectItem>
                      <SelectItem value="PPH">PPH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppins text-sm md:text-lg">
                    Presentase <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="number"
                      className="grow text-primary"
                      value={percent}
                      onChange={(e) => setPercent(e.target.value)}
                      placeholder="Presentase"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Baris kedua: nama & deskripsi */}
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex flex-col w-full gap-2" id="input-name">
                  <span className="font-poppins text-sm md:text-lg">
                    Nama Pajak <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={taxName}
                      onChange={(e) => setTaxName(e.target.value)}
                      placeholder="Nama Pajak"
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col w-full gap-2" id="input-desc">
                  <span className="font-poppins text-sm md:text-lg">
                    Deskripsi <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Textarea
                    className="textarea border-slate-400 w-full"
                    placeholder="Deskripsi"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Card className="flex flex-col h-full">
          <CardContent className="flex-1 min-h-0 overflow-auto">
            <DataTable
              columns={columns({
                deleteData: handleDeleteData,
                editData: handleEditData,
                dictionary: dictionary,
              })}
              data={data}
              addData={handleCreateData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              onSearchChange={handleSearchChange}
              dictionary={dictionary}
              isGetData={handleRefreshData}
            ></DataTable>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
