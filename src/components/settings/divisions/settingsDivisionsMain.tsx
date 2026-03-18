"use client";
import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./column";
import { divisionService } from "@/services";

import Swal from "sweetalert2";

import { IDivision } from "@/types/division";
import { IMeta } from "@/types/common";
import axios from "axios";
import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsDivisionsMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_divisions"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);
  const [data, setData] = useState<IDivision[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [codeDivision, setCodeDivision] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<IDivision[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    filterParams.search = search;
    const response = await divisionService.getDivisions(filterParams);
    setData(response.data);
    setMetadata(response.meta);
    return response.data;
  };

  useEffect(() => {
    getData();
  }, []);

  const handleGetData = async (id: string) => {
    const { data } = await divisionService.getDivision(id);
    setId(id);
    setName(data.name);
    setCodeDivision(data.code_division);
  };

  const handleEditData = async (id: string) => {
    await handleGetData(id);
    setTitle("Ubah Divisi");
    setModalType("edit");
    toggleModal();
  };

  const handleCreateData = () => {
    setTitle("Tambah Divisi");
    setModalType("create");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Divisi ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await divisionService.deleteDivision(id);
        getData();
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
    const payload = {
      name: name,
    };

    if (modalType === "edit") {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah Divisi?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsLoading(true);
            const response = await divisionService.updateDivision(id, payload);
            getData();
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
            title: "Batal Ubah Data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin menambahkan Divisi?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#493628",
        denyButtonText: "Tidak",
        position: "center",
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsLoading(true);
            const response = await divisionService.createDivision(payload);
            getData();
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
            title: "Batal Tambah Data",
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
  };

  const clearInput = () => {
    setModalOpen(false);
    setId("");
    setName("");
    setCodeDivision("");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize);
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await getData(page, pageSize, debouncedSearch);
      getData(page, pageSize, debouncedSearch);
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
          width={`${isMobile ? "w-[90vw]" : "w-[35vw]"}  `}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="flex flex-col w-full gap-2 p-5" id="input">
            <span className="font-poppinlg:text-lg text-sm">
              Nama Divisi
              <span className="text-red-500 ml-1">*</span>
            </span>
            <label className="input border-slate-400 flex items-center gap-2">
              <Input
                type="text"
                className="grow text-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Divisi"
                required
              />
            </label>
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
