"use client";
import { getDictionary } from "../../../get-dictionary";
import React from "react";
import { AppSidebar } from "./appSideBar";

export default function SideBar({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["primary_sidebar"];
}) {
  return <AppSidebar dictionary={dictionary} />;
}
