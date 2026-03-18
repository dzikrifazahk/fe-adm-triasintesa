"use client";
import { getDictionary } from "../../../../get-dictionary";
import React from "react";
import { EmployeeSidebar } from "./empSidebar";

export default function EmployeeSideBarSSR({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["emp_sidebar"];
}) {
  return <EmployeeSidebar dictionary={dictionary} />;
}
