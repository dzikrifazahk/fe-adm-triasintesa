import { getDictionary } from "../../../get-dictionary";
import { ModalFilter } from "../custom/modalFilter";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isClearPayload: (payload: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_contact"];
}

export const ModalFilterContact = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  onCancel,
  isClearPayload,
  dictionary,
}: ModalProps) => {
  return (
    <>
      <ModalFilter
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width={width}
        onCancel={onCancel}
      >
        <div className="w-full flex flex-col gap-4 p-3">Teest</div>
      </ModalFilter>
    </>
  );
};
