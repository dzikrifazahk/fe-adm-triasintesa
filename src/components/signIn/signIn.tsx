"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import LocaleSwitcher from "@/components/localeSwitcher";
import Head from "next/head";
import { usePathname } from "next/navigation";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import LeftLayout from "./leftLayout";
import { SwitchDarkMode } from "../ui/themeSwitcher";
import { useTheme } from "next-themes";

export default function SignIn({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["signin"];
}) {
  const { theme, setTheme } = useTheme();
  const { setIsLoading } = useLoading();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const pathname = usePathname();
  const splitPath = pathname.split("/")[1];
  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/signin", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xuser: username, xpass: password }),
    });

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: data.message,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
      });
    } else {
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Login Success",
        text: "Sucessfully login, redirecting to dashboard",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 1500,
      });
      if (splitPath === "id") {
        setTimeout(() => {
          window.location.replace("/id");
        }, 1500);
      } else {
        setTimeout(() => {
          window.location.replace("/");
        }, 1500);
      }
    }
  };

  const handleSwitchChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };
  return (
    <div className="flex h-screen w-full flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/bg-pattern.svg"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <Head>
        <title>Login Page</title>
      </Head>

      {/* LEFT SIDE */}
      <div className="hidden lg:block w-full lg:w-1/2">
        <LeftLayout dictionary={dictionary} />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-200 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Decorative background */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-purple-300 opacity-20 rounded-full blur-3xl"></div>

        {/* Top bar */}
        <div className="bg-transparent flex justify-end p-2 gap-2 items-center z-10">
          <SwitchDarkMode
            id="dark-mode"
            checked={theme === "dark"}
            onCheckedChange={handleSwitchChange}
          />
          <LocaleSwitcher />
        </div>

        {/* Content */}
        <div className="w-full h-full flex justify-center items-center z-10">
          <div className="w-[90%] lg:w-[70%] flex flex-col gap-3 px-4 md:px-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/20">
            <div className="w-full flex flex-col justify-center items-center">
              <span className="font-yaro lg:text-3xl text-2xl font-bold text-iprimary-blue-secondary mb-5">
                {dictionary?.greetings ?? "-"}
              </span>

              <Tabs defaultValue="signin" className="w-full lg:w-[400px]">
                <TabsList className="grid w-full grid-cols-2 dark:text-white">
                  <TabsTrigger value="signin" className="font-yaro font-bold">
                    {dictionary?.signin ?? "-"}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="font-yaro font-bold">
                    {dictionary?.forgot_password ?? "-"}
                  </TabsTrigger>
                </TabsList>

                {/* SIGN IN */}
                <TabsContent value="signin" className="mb-5">
                  <div className="w-full flex flex-col justify-center items-center gap-5">
                    <span className="text-xs text-center dark:text-white">
                      {dictionary?.description ?? "-"}
                      <br />
                      <span className="text-iprimary-red">*</span>{" "}
                      {dictionary?.indicator ?? "-"}
                    </span>

                    <form
                      onSubmit={handleSubmit}
                      className="w-full flex flex-col justify-center gap-3"
                    >
                      {/* EMAIL */}
                      <div className="w-full flex flex-col gap-2">
                        <span className="flex font-sans text-xs dark:text-white">
                          Email&nbsp;<p className="text-iprimary-red">*</p>
                        </span>
                        <Input
                          type="text"
                          placeholder="Email"
                          className="bg-white/80 dark:bg-white/10 font-sans placeholder:text-xs dark:text-white"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>

                      {/* PASSWORD */}
                      <div className="w-full flex flex-col gap-2">
                        <span className="flex font-sans text-xs dark:text-white">
                          Password&nbsp;<p className="text-iprimary-red">*</p>
                        </span>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-white/80 dark:bg-white/10 font-sans pr-10 placeholder:text-xs dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* BUTTON */}
                      <Button
                        className="w-full bg-iprimary-blue-secondary font-yaro font-bold"
                        type="submit"
                      >
                        {dictionary?.button_signin ?? "-"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                {/* FORGOT PASSWORD */}
                <TabsContent value="signup" className="mb-5">
                  <div className="w-full flex flex-col justify-center items-center gap-5">
                    <span className="text-xs text-center dark:text-white">
                      {dictionary?.description_forgot_pass ?? "-"}
                    </span>

                    <div className="w-full flex flex-col justify-center gap-3">
                      <div className="w-full flex flex-col gap-2">
                        <span className="flex font-sans text-xs dark:text-white">
                          Email&nbsp;<p className="text-iprimary-red">*</p>
                        </span>
                        <Input
                          type="text"
                          placeholder="Email"
                          className="bg-white/80 dark:bg-white/10 font-sans dark:text-white text-xs"
                        />
                      </div>

                      <Button className="w-full bg-iprimary-blue-secondary font-yaro font-bold">
                        {dictionary?.button_forgot_pass ?? "-"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
