"use client";

import { Bell, ChevronsUpDown, Key, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Swal from "sweetalert2";
import { deleteCookie, getCookies } from "cookies-next";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { ChangePasswordAuthenticated } from "../changePasswordAuthenticated";

export function NavUser({
  user,
  openDetailProfile,
  dictionary,
  actions
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  openDetailProfile: (val: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["primary_sidebar"];
  actions: (act: string) => void;
}) {
  const { isMobile } = useSidebar();
  const [cookies, setCookies] = useState<any>(null);
  const [isOpenDetailProfile, setIsOpenDetailProfile] = useState(false);
  
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    const cookiesData = getCookies();
    setCookies(cookiesData);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      icon: "warning",
      title: "Logout",
      text: "Are you sure you want to logout?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#32bcad",
      denyButtonText: "No",
      position: "top-right",
      toast: true,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          for (let key in cookies) {
            deleteCookie(key);
          }
          Swal.fire({
            icon: "success",
            title: "Logout Success",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 500,
          }).then(() => {
            window.location.replace("/");
          });
        } catch (e) {
          Swal.fire({
            icon: "error",
            title: "Logout Failed",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Logout Cancelled",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleOpenDetailProfile = (val: boolean) => {
    setOpenMobile(false);
    openDetailProfile(true);
  };

  if (!cookies) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div
                  className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer"
                  onClick={() => handleOpenDetailProfile(true)}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Bell />
                  {dictionary.notification}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup onClick={() => actions("change_password")}>
                <DropdownMenuItem>
                  <Key />
                  {dictionary.forgot_password}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                {dictionary.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      
    </>
  );
}
