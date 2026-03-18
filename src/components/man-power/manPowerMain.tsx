"use client";
import { getDictionary } from "../../../get-dictionary";
import Image from "next/image";
import ManPowerDefaultIC from "@/assets/img/man-power.svg";

export default function ManPowerMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center px-4 py-8">
      <Image
        src={ManPowerDefaultIC}
        alt="Man Power"
        width={200}
        height={200}
        className="w-1/2 h-1/2"
      />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-2 dark:text-white">
        {dictionary.page_greetings}
      </h2>

      <p className="text-gray-600 max-w-md text-sm">
        {dictionary.page_description}
      </p>
    </div>
  );
}
