"use client";
import { IContact } from "@/types/contact";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ModalDetail } from "@/components/custom/modalDetail";
import { FaFolderOpen } from "react-icons/fa6";

interface DetailModalContactProps {
  data?: IContact | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onCancel: () => void;
}

export const DetailModalContact = ({
  data,
  isOpen,
  title,
  onClose,
  onCancel,
}: DetailModalContactProps) => {
  return (
    <>
      <ModalDetail
        isOpen={isOpen}
        title={title + " " + data?.uuid}
        width="w-[85vw]"
        onClose={onClose}
        onCancel={onCancel}
      >
        <div className="w-full">
          <div className="m-3 flex flex-col gap-3">
            {/* CONTACT INFORMATION */}
            <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
              Informasi Kontak
            </div>
            <div className="flex gap-5  ml-3 mr-3">
              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Nama Kontak
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>{data?.name ?? "-"}</span>
              </div>

              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  No. Telp
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>{data?.phone ?? "-"}</span>
              </div>

              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Email
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>{data?.email ?? "-"}</span>
              </div>
            </div>

            <div className="flex gap-5  ml-3 mr-3">
              <div className="flex flex-col w-full gap-2" id="select">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Tipe Kontak
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>
                  {data?.contact_type?.name ?? "-"}
                  {data?.contact_type?.id == 1 ? " - (" + data.vendor_category + ")": ""}
                </span>
              </div>

              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Nama PIC
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>{data?.pic_name ?? "-"}</span>
              </div>

              <div className="flex flex-col w-full gap-2" id="select">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Alamat
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <span>{data?.address ?? "-"}</span>
              </div>
            </div>

            {/* END CONTACT INFORMATION */}

            {/* BANK INFORMATION */}
            <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
              Informasi Bank
            </div>
            <div className="flex gap-5  ml-3 mr-3">
              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Nama Akun Rekening
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.account_name ?? "-"}</span>
              </div>
              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Nama Bank
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.bank_name ?? "-"}</span>
              </div>

              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Cabang
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.branch ?? "-"}</span>
              </div>
            </div>

            <div className="flex gap-5  ml-3 mr-3">
              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Nomor Rekening
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.account_number ?? "-"}</span>
              </div>
              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Mata Uang
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.currency ?? "-"}</span>
              </div>

              <div className="flex flex-col w-full gap-2" id="input">
                <span className="font-poppin lg:text-lg text-sm font-bold">
                  Swift Code
                  {/* <span className="text-red-500 ml-1">*</span> */}
                </span>
                <span>{data?.swift_code ?? "-"}</span>
              </div>
            </div>

            {/* END BANK INFORMATION */}

            {/* OTHER INFORMATION */}
            <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
              Informasi Lainya
            </div>
            <div className="flex w-full gap-5 ml-3 mr-3">
              <div className="flex w-1/2 flex-col gap-2" id="file-input">
                <span className="font-poppin">NPWP</span>
                <div className="flex justify-center">
                  {data?.attachment_npwp ? (
                    <a
                      className="border border-gray-300 rounded-md p-2 h-auto"
                      href={data?.attachment_npwp ?? ""}
                      target="_blank"
                    >
                      <FaFolderOpen />
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div className="flex w-1/2 flex-col gap-2">
                <div className="flex flex-col w-full gap-2" id="file-input">
                  <span className="font-poppin">File Lainya</span>
                  <div className="flex justify-center ">
                    {data?.attachment_file ? (
                      <a
                        className="border border-gray-300 rounded-md p-2 h-auto "
                        href={data?.attachment_file ?? ""}
                        target="_blank"
                      >
                        <FaFolderOpen />
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
              {/* END OTHER INFORMATION */}
            </div>
          </div>
        </div>
      </ModalDetail>
    </>
  );
};
