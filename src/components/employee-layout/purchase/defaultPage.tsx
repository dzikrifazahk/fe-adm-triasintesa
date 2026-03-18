"use client";
import Image from "next/image";
import DefaultPurchase from "@/assets/img/default-purchase.svg";
import { getDictionary } from "../../../../get-dictionary";

export default function DefaultPurchasePage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center px-4 py-8">
      <Image
        src={DefaultPurchase}
        alt="Man Power"
        width={400}
        height={400}
        // className="w-1/2 h-1/2"
      />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-2">
        Selamat Datang Di Halaman Pembelian
      </h2>

      <p className="text-gray-600 max-w-md text-sm">
        Silahkan Pilih Menu Di Atas Untuk Mulai Mengelola Pembelian
      </p>
    </div>
  );
}
