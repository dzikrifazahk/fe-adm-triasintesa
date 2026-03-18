"use client";

import React from "react";
import Image from "next/image";
import IDefault from "@/assets/img/default-purchase.svg";
import { getDictionary } from "../../../../get-dictionary";
interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}
export default function WorkspacePurchaseDefault({ dictionary }: Props) {
  const dict = dictionary.purchase;
  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in rounded-xl">
        <Image
          src={IDefault}
          className="w-36"
          alt="Default Illustration"
          priority={true}
        />
        <span className="text-xl font-bold text-primary-light mt-2">
          {dict.default_page_title}
        </span>
        <span className="text-gray-400 text-base">{dict.default_page_description}</span>
      </div>
    </>
  );
}
