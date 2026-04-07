"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { getUser } from "@/services/base.service";
import NavHeader from "./navHeader";
import { NavItems } from "./navItems";
import { NavUser } from "./navUser";
import { ChangePasswordAuthenticated } from "../changePasswordAuthenticated";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["primary_sidebar"];
};

export function AppSidebar({ dictionary, ...props }: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const [isOpenSearchModalMobile, setIsOpenSearchModalMobile] = useState(false);
  const [isOpenModalDetailProfileMobile, setIsOpenModalDetailProfileMobile] =
    useState(false);
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState(false);
  // const { setIsLoading } = useLoading();
  const cookies = getUser();

  useEffect(() => {
    // getChatHistory();
    // setIsLoading(true);
  }, []);

  const userData = {
    user: {
      name: cookies?.username as string,
      email: cookies?.email as string,
      avatar: "/avatars.webp",
    },
  };

  const handleIsSearchMobile = (val: boolean) => {
    setIsOpenSearchModalMobile(val);
  };

  const handleIsOpenDetailProfile = (val: boolean) => {
    setIsOpenModalDetailProfileMobile(val);
  };

  const handleActions = (act: string) => {
    if (act === "change_password") {
      setIsOpenChangePasswordModal(true);
    }
  };
  return (
    <>
      <Sidebar collapsible="icon" {...props} className="">
        <SidebarHeader>
          <NavHeader
            isOpenSearchModalMobile={handleIsSearchMobile}
            // dictionary={dictionary}
          />
        </SidebarHeader>
        <SidebarContent
          className={`dark:bg-black ${isMobile ? "" : "min-h-0"}`}
        >
          <NavItems dictionary={dictionary} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={userData.user}
            openDetailProfile={handleIsOpenDetailProfile}
            dictionary={dictionary}
            actions={handleActions}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <ChangePasswordAuthenticated
        isOpen={isOpenChangePasswordModal}
        onClose={() => setIsOpenChangePasswordModal(false)}
        dictionary={dictionary}
        title="Change Password"
        isGetData={() => {
          setIsOpenChangePasswordModal(false);
        }}
      />
    </>
  );
}
