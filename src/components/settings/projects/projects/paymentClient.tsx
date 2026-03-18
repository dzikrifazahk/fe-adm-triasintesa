"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { normalizeRupiah, useCurrencyInput } from "@/utils/useCurrency";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid } from "date-fns";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { projectService } from "@/services";
import { IProject } from "@/types/project";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaXmark } from "react-icons/fa6";
import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PaymentClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  detailData?: IProject | null;
  isGetData: (id: string) => void;
}

export const PaymentClientModal = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  onCancel,
  detailData,
  isGetData,
}: PaymentClientModalProps) => {
  const { setIsLoading } = useLoading();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [id, setId] = useState("");
  const [paidOff, setPaidOff] = useState<string | null>("");
  const [typeTerminProject, setTypeTerminProject] = useState<string | null>("");
  const [descriptionTermin, setDescriptionTermin] = useState<string>("");
  const [typeTerminSPB, setTypeTerminSPB] = useState<number>();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTermin, setSelectedTermin] = useState<any>(null);

  let {
    value: terminAmount,
    formattedValueWithRp: terminAmountRp,
    handleChange: handleTerminAmountChange,
    formattedValueNumeric: terminAmountNumeric,
    setValue: setTerminAmount,
  } = useCurrencyInput();

  let {
    value: actualTerminAmount,
    formattedValueWithRp: actualTerminAmountRp,
    handleChange: handleActualTerminAmountChange,
    formattedValueNumeric: actualTerminAmountNumeric,
    setValue: setActualTerminAmount,
  } = useCurrencyInput();

  // let {
  //   value: pphAmount,
  //   formattedValueWithRp: pphAmountRp,
  //   handleChange: handlePphAmountChange,
  //   formattedValueNumeric: pphAmountNumeric,
  //   setValue: setPphAmount,
  // } = useCurrencyInput();

  useEffect(() => {
    if (!isEditMode) {
      let totalTermin = detailData?.harga_total_termin_proyek;
      let totalTerminNow = normalizeRupiah(terminAmount) + Number(totalTermin);

      if (totalTerminNow === Number(detailData?.billing)) {
        setPaidOff("(Lunas)");
        setTypeTerminSPB(2);
      } else if (totalTerminNow < Number(detailData?.billing)) {
        setPaidOff("(Belum Lunas)");
        setTypeTerminSPB(1);
      } else if (totalTerminNow > Number(detailData?.billing)) {
        setPaidOff("(Melebihi Nilai Proyek)");
        setTypeTerminSPB(1);
      }
    } else {
      let totalTermin = detailData?.harga_total_termin_proyek;
      let totalTerminEdited =
        Number(totalTermin) - Number(selectedTermin?.harga_termin);
      let totalTerminNow = normalizeRupiah(terminAmount) + totalTerminEdited;
      // let totalTerminNow = Number(selectedTermin?.harga_termin) - normalizeRupiah(terminAmount);
      if (totalTerminNow === Number(detailData?.billing)) {
        setPaidOff("(Lunas)");
        setTypeTerminSPB(2);
      } else if (totalTerminNow < Number(detailData?.billing)) {
        setPaidOff("(Belum Lunas)");
        setTypeTerminSPB(1);
      } else if (totalTerminNow > Number(detailData?.billing)) {
        setPaidOff("(Melebihi Nilai Proyek)");
        setTypeTerminSPB(1);
      }
    }
  }, [terminAmount]);

  useEffect(() => {
    if (detailData?.type_termin_proyek?.name === "Lunas") {
      setTypeTerminProject("(Lunas)");
    } else if (detailData?.type_termin_proyek?.name === "Belum Lunas") {
      setTypeTerminProject("(Belum Lunas)");
      setPaidOff("(Belum Lunas)");
    }
  }, [isOpen, detailData]);

  useEffect(() => {
    if (isEditMode) {
      setTerminAmount(selectedTermin?.harga_termin);
      setDescriptionTermin(selectedTermin?.deskripsi_termin);
    }
  }, [isEditMode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleEditTermin = (termin: any) => {
    setIsEditMode(true);
    setSelectedTermin(termin);
    setId(termin.id);
    setDate(new Date(termin.tanggal).toISOString().split("T")[0]);
    setTerminAmount(termin.harga_termin);
    setDescriptionTermin(termin.deskripsi_termin);
  };

  const handleUpdatePayment = async () => {
    Swal.fire({
      icon: "warning",
      text: "Apakah Anda ingin memperbarui pembayaran?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        const price = normalizeRupiah(terminAmount ?? "0");
        formData.append("riwayat_termin[0][id]", id);
        formData.append(
          "riwayat_termin[0][harga_termin_proyek]",
          String(price)
        );
        formData.append(
          "riwayat_termin[0][deskripsi_termin_proyek]",
          descriptionTermin
        );
        formData.append("riwayat_termin[0][payment_date_termin_proyek]", date);
        formData.append(
          "riwayat_termin[0][type_termin_proyek]",
          String(typeTerminSPB)
        );
        selectedFiles.forEach((file, index) => {
          formData.append(
            `riwayat_termin[0][attachment_file_termin_proyek]`,
            file
          );
        });

        try {
          setIsLoading(true);
          const response = await projectService.updateTermin(
            detailData?.id ?? "",
            formData
          );
          isGetData(detailData?.id ?? "");
          clearInput();
          setIsEditMode(false);
          setIsLoading(true);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error) {
          setIsLoading(false);
          console.error("An error occurred:", error);
          Swal.fire({
            icon: "error",
            title: "Terjadi Kesalahan saat memproses pembaruan",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const handlePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdatePayment();
      return;
    }
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin melakukan Pembayaran?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        const price = normalizeRupiah(terminAmount ?? "0");
        const actualTerminAmountNorm = normalizeRupiah(
          actualTerminAmount ?? "0"
        );
        formData.append("payment_date_termin_proyek", date);
        formData.append("harga_termin_proyek", String(price));
        formData.append("deskripsi_termin_proyek", descriptionTermin);
        formData.append("type_termin_proyek", String(typeTerminSPB));
        formData.append("actual_payment", String(actualTerminAmountNorm));
        selectedFiles.forEach((file, index) => {
          formData.append(`attachment_file_termin_proyek`, file);
        });

        try {
          setIsLoading(true);
          const response = await projectService.paymentClient(
            detailData?.id ?? "",
            formData
          );
          isGetData(detailData?.id ?? "");
          clearInput();
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error) {
          setIsLoading(false);
          console.error("An error occurred:", error);
          Swal.fire({
            icon: "error",
            title: "Terjadi Kesalahan saat memproses pembayaran",
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
          title: "Batal Melakukan Pembayaran",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const deleteTerminSPB = async (selectedIdSPB: string, id: string) => {
    try {
      setIsLoading(true);
      const payload = {
        riwayat_termin: [Number(id)],
      };
      const response = await projectService.deleteTermin(
        selectedIdSPB,
        payload
      );
      isGetData(detailData?.id ?? "");
      clearInput();
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: `Berhasil Menghapus Termin`,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (e) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: `Terjadi Kesalahan ${e}`,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleDeleteTermin = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Termin?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteTerminSPB(detailData?.id ?? "", id);
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Menghapus Termin",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleCancelEditTermin = () => {
    clearInput();
    setIsEditMode(false);
  };

  const clearInput = () => {
    setDescriptionTermin("");
    setTypeTerminSPB(0);
    setTerminAmount("");
    setDate("");
    setSelectedFiles([]);
    setIsEditMode(false);
    setSelectedTermin(null);
    setActualTerminAmount("");
    // setPphAmount("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // useEffect(() => {
  //   const dpp = normalizeRupiah(terminAmount ?? "0");
  //   const actual = normalizeRupiah(actualTerminAmount ?? "0");

  //   const pph = Math.max(0, dpp - actual);

  //   setPphAmount(String(pph));
  // }, [terminAmount, actualTerminAmount, setPphAmount]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          clearInput();
        }}
        onSubmit={handlePaymentRequest}
        title={title}
        width={width}
      >
        <div className="w-full">
          <div className={`flex w-full`}>
            <div className="m-3 flex flex-col w-1/3 gap-2">
              <div
                className={`text-lg font-semibold w-full bg-gray-100 rounded-md p-2 flex`}
              >
                {isEditMode ? "Edit Pembayaran" : "Pembayaran"}&nbsp;
                <div
                  className={`text-xs flex h-full justify-center items-center ${
                    paidOff === "(Lunas)" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {`${paidOff}`}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppinlg:text-lg text-sm">
                    Tanggal Pembayaran
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="date"
                      className="grow text-primary"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Tanggal"
                      required
                      disabled={typeTerminProject === "(Lunas)" && !isEditMode}
                    />
                  </label>
                </div>
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppinlg:text-lg text-sm">
                    DPP
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={terminAmountRp}
                      onChange={(e) => setTerminAmount(e.target.value)}
                      placeholder="DPP"
                      required
                      disabled={typeTerminProject === "(Lunas)" && !isEditMode}
                    />
                  </label>
                </div>
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppinlg:text-lg text-sm">
                    Pembayaran Aktual
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={actualTerminAmountRp}
                      onChange={(e) => setActualTerminAmount(e.target.value)}
                      placeholder="Pembayaran Aktual"
                      required
                      disabled={typeTerminProject === "(Lunas)" && !isEditMode}
                    />
                  </label>
                </div>
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppinlg:text-lg text-sm">
                    Catatan Termin Pembayaran
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Textarea
                    className="textarea textarea-bordered"
                    placeholder="Catatan Termin Pembayaran"
                    value={descriptionTermin}
                    onChange={(e) => setDescriptionTermin(e.target.value)}
                    required
                    disabled={typeTerminProject === "(Lunas)" && !isEditMode}
                  />
                </div>
              </div>
              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Bukti Pembayaran
                {isEditMode && (
                  <>
                    <p className="text-xs font-normal">
                      "Silahkan upload kembali jika file sebelumnya ingin
                      diganti"
                    </p>
                  </>
                )}
              </div>
              <div className="flex p-2">
                <div className="flex flex-col w-full gap-2" id="input">
                  <span className="font-poppinlg:text-lg text-sm flex gap-1">
                    {isEditMode ? "Ubah" : "Masukkan"} Bukti Pembayaran
                    <p className="text-xs text-red-500">(Hanya 1 File)</p>
                  </span>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf, .jpeg, .jpg, .png, .heic"
                    className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                    onChange={handleFileChange}
                    disabled={typeTerminProject === "(Lunas)" && !isEditMode}
                  />
                </div>
              </div>
              {isEditMode && selectedTermin?.file_attachment?.link && (
                <div className="pl-5 pb-5 pr-5">
                  <p className="font-semibold mb-2">
                    Bukti Pembayaran Saat Ini:
                  </p>
                  <Image
                    src={selectedTermin.file_attachment.link}
                    alt="Bukti Pembayaran"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="w-full m-3">
              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Catatan Pembayaran
              </div>
              <div className="flex flex-col w-full gap-2 ">
                <div className="w-full p-2">
                  <div className="text-md flex border border-gray-200 p-3 rounded-lg flex-col ">
                    <span className="font-semibold">Total Harga Proyek</span>
                    <span>
                      {formatCurrencyIDR(Number(detailData?.billing))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {detailData?.riwayat_termin &&
                  detailData?.riwayat_termin.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Aksi</TableHead>
                          <TableHead className="w-[100px]">Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Actual Payment</TableHead>
                          <TableHead>PPH</TableHead>
                          <TableHead className="text-right">Nominal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailData?.riwayat_termin &&
                          detailData?.riwayat_termin.map((e, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className="border border-red-500 p-2 rounded-lg flex items-center justify-center cursor-pointer"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteTermin(String(e.id));
                                          }}
                                        >
                                          <FaTrash className="text-red-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Hapus Termin</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`border p-2 rounded-lg flex items-center justify-center cursor-pointer ${
                                            isEditMode
                                              ? "border-red-500"
                                              : "border-yellow-500"
                                          }`}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            isEditMode
                                              ? handleCancelEditTermin()
                                              : handleEditTermin(e);
                                          }}
                                        >
                                          {isEditMode ? (
                                            <FaXmark className="text-red-500" />
                                          ) : (
                                            <FaEdit className="text-yellow-500" />
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {isEditMode
                                            ? "Batalkan Edit"
                                            : "Edit"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {e.file_attachment?.link && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <a
                                            className="border border-primary p-2 rounded-lg flex items-center justify-center cursor-pointer"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                            }}
                                            href={e.file_attachment.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <FaEye className="text-primary" />
                                          </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Lihat Bukti Pembayaran</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {isValid(new Date(e?.tanggal))
                                  ? format(new Date(e?.tanggal), "dd MMM yyyy")
                                  : ""}{" "}
                              </TableCell>
                              <TableCell>
                                {e?.riwayat_type_termin_proyek?.name ?? ""}
                              </TableCell>
                              <TableCell>{e?.deskripsi_termin ?? ""}</TableCell>
                              <TableCell>
                                {formatCurrencyIDR(Number(e?.actual_payment)) ??
                                  ""}
                              </TableCell>
                              <TableCell>
                                {formatCurrencyIDR(Number(e?.pph?.nominal)) ??
                                  ""}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrencyIDR(
                                  Number(e?.harga_termin) ?? ""
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={6}>Total</TableCell>
                          <TableCell className="text-right">
                            {formatCurrencyIDR(
                              Number(detailData?.harga_total_termin_proyek)
                            ) ?? ""}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={6}>Sisa Pembayaran</TableCell>
                          <TableCell className="text-right">
                            {formatCurrencyIDR(
                              Number(detailData?.sisa_pembayaran_termin)
                            ) ?? ""}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
