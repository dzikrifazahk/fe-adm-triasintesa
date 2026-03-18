"use client";

import { useContext, useEffect, useState } from "react";
import { columns } from "./column";
import { operationService } from "@/services";
import Swal from "sweetalert2";
import axios from "axios";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { Label } from "@/components/ui/label";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { DataTable } from "./data-table";
import { TimePicker } from "@/components/custom/timePicker";
import { IAddOperation, IOperation, IUpdateOperation } from "@/types/operation";
import { convertToDate, toTimeString } from "@/utils/convertHHMMSS";
import { Card, CardContent } from "@/components/ui/card";
import { IMeta } from "@/types/common";

export default function SettingsOperationMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_operation"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<IOperation[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [metadata, setMetadata] = useState<IMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");

  const ZERO_TIME = "00:00:00";

  const [onTimeStart, setOnTimeStart] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [onTimeEnd, setOnTimeEnd] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [lateTime, setLateTime] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [offTime, setOffTime] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );

  const getData = async (page: number, pageSize: number) => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    try {
      const { data, meta } = await operationService.getOperations();
      setData(data);
      setMetadata(meta);
      return data;
    } catch {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const getDetailData = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await operationService.getOperation(id);
      setId(data.id);
      setIsLoading(false);
      return data;
    } catch {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleEditData = async (id: string) => {
    const data = await getDetailData(id ?? "");
    setOnTimeStart(convertToDate(data.ontime_start ?? ZERO_TIME));
    setOnTimeEnd(convertToDate(data.ontime_end ?? ZERO_TIME));
    setLateTime(convertToDate(data.late_time ?? ZERO_TIME));
    setOffTime(convertToDate(data.offtime ?? ZERO_TIME));
    setTitle(dictionary.button_change_operational);
    setModalType("edit");
    toggleModal();
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const handleSubmit = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    if (modalType === "edit") {
      const payload: IUpdateOperation = {
        id: id,
        ontime_start: toTimeString(onTimeStart),
        ontime_end: toTimeString(onTimeEnd),
        late_time: toTimeString(lateTime),
        offtime: toTimeString(offTime),
        timezone: tz,
      };

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah Operasional?",
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
            const response = await operationService.updateOperation(payload);
            await getData(page, pageSize);
            if (response.status_code === 200) {
              Swal.fire({
                icon: "success",
                title: `Berhasil Mengubah Operasional`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
              setIsLoading(false);
            }
          } catch (e) {
            setIsLoading(false);
            if (axios.isAxiosError(e)) {
              const errorMessages: string[] = [];
              const message = e.response?.data?.message ?? "";
              if (message) {
                for (const field in message) {
                  if (Object.prototype.hasOwnProperty.call(message, field)) {
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
      const payload: IAddOperation = {
        ontime_start: toTimeString(onTimeStart),
        ontime_end: toTimeString(onTimeEnd),
        late_time: toTimeString(lateTime),
        offtime: toTimeString(offTime),
        timezone: tz,
      };

      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin menambahkan Waktu Operasional?",
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
            const response = await operationService.createOperation(payload);
            getData(page, pageSize);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
            setIsLoading(false);
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
    setModalType(null);
    setOnTimeStart(convertToDate(ZERO_TIME));
    setOnTimeEnd(convertToDate(ZERO_TIME));
    setLateTime(convertToDate(ZERO_TIME));
    setOffTime(convertToDate(ZERO_TIME));
    setTitle("");
  };

  useEffect(() => {
    getData(page, pageSize);
    setIsLoading(false);
  }, []);

  const handleCreateData = () => {
    setTitle("Tambah Waktu Operasional");
    setModalType("create");
    setOnTimeStart(convertToDate(ZERO_TIME));
    setOnTimeEnd(convertToDate(ZERO_TIME));
    setLateTime(convertToDate(ZERO_TIME));
    setOffTime(convertToDate(ZERO_TIME));
    toggleModal();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize);
  };

  const handleDeleteData = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Waktu Operasional ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await operationService.deleteOperation(id);
        getData(page, pageSize);
        Swal.fire({
          icon: "success",
          title: `${response.message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        setIsLoading(false);
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

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await getData(page, pageSize);
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
          width={`${isMobile ? "w-[90vw]" : "w-[35vw]"}`}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="flex flex-col gap-4 p-5 w-full">
            {/* TIME PICKERS */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label>{dictionary.column.ontime_start}</Label>
                <TimePicker date={onTimeStart} setDate={setOnTimeStart} />
              </div>

              <div className="flex flex-col gap-1">
                <Label>{dictionary.column.ontime_end}</Label>
                <TimePicker date={onTimeEnd} setDate={setOnTimeEnd} />
              </div>

              <div className="flex flex-col gap-1">
                <Label>{dictionary.column.late_time}</Label>
                <TimePicker date={lateTime} setDate={setLateTime} />
              </div>

              <div className="flex flex-col gap-1">
                <Label>{dictionary.column.offtime}</Label>
                <TimePicker date={offTime} setDate={setOffTime} />
              </div>
            </div>
          </div>
        </Modal>

        <Card className="flex flex-col h-full">
          <CardContent className="flex-1 min-h-0 overflow-auto">
            <DataTable
              columns={columns({
                editData: handleEditData,
                dictionary: dictionary,
                deleteData: handleDeleteData,
              })}
              data={data}
              addData={handleCreateData}
              metadata={metadata}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              dictionary={dictionary}
              isGetData={handleRefreshData}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
