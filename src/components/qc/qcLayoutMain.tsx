import { getDictionary } from "../../../get-dictionary";
import { QcMenuBar } from "./qcMenuBar";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["quality_control_page_dic"];
  children: React.ReactNode;
}

export function QCLayoutMain({ dictionary, children }: Props) {
  return <QcMenuBar dictionary={dictionary}>{children}</QcMenuBar>;
}
