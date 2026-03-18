"use client";
import { useTheme } from "next-themes";
import LocaleSwitcher from "@/components/localeSwitcher";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "../../../../get-dictionary";
import { SwitchDarkMode } from "@/components/ui/themeSwitcher";
import { useEffect } from "react";
import { useLoading } from "@/context/loadingContext";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsUsersMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_theme"];
}) {
  const { theme, setTheme } = useTheme();
  const { setIsLoading } = useLoading();
  const handleSwitchChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 min-h-0 overflow-auto">
          <div className="font-bold font-sans text-xl">{dictionary.title}</div>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="font-bold font-sans text-lg mt-5">
                {dictionary.title2}
              </div>
              <div className="font-sans text-sm text-gray-500 dark:text-gray-200">
                {dictionary.description}
              </div>
            </div>
          </div>
          <Separator className="mt-3" />
          <div className="flex gap-8 h-24">
            <div className="flex flex-col">
              <div className="font-bold font-sans text-lg mt-5">
                {dictionary.theme_title}
              </div>
              <div className="font-sans text-sm text-gray-500 dark:text-gray-200">
                {dictionary.theme_description}
              </div>
            </div>
            <div className="flex items-center justify-center  h-full">
              <div className="flex items-center space-x-2 h-full">
                <SwitchDarkMode
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>
          <Separator className="mt-3" />
          <div className="flex gap-8 h-24">
            <div className="flex flex-col">
              <div className="font-bold font-sans text-lg mt-5">
                {dictionary.language_title}
              </div>
              <div className="font-sans text-sm text-gray-500 dark:text-gray-200">
                {dictionary.language_description}
              </div>
            </div>
            <div className="flex items-center justify-center  h-full">
              <div className="flex items-center space-x-2 h-full">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
          <Separator className="mt-3" />
        </CardContent>
      </Card>
    </>
  );
}
