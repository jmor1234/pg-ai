"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import {
  BotIcon,
  Home,
  NotebookIcon,
  Plus,
  PlusIcon,
  Settings,
  StickyNoteIcon,
  TagIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    {
      icon: Home,
      href: "/",
      label: "Home",
      mobileOnly: true, // Add a flag to indicate mobile-only visibility
    },
    {
      icon: ChatBubbleIcon,
      href: "/chats/pg-notes",
      label: "Start Chat",
    },
    {
      icon: NotebookIcon,
      href: "/notes",
      label: "Chat History",
    },
  ];

  const onNavigate = (url: string) => {
    return router.push(url);
  };

  return (
    <div className="space-y-4 flex flex-col h-full text-primary bg-secondary">
      <div className="p-3 flex flex-1 justify-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <UserButton />
          </div>
          {routes.map((route) => (
            <div
              onClick={() => onNavigate(route.href)}
              key={route.href}
              className={cn(
                `text-muted-foreground text-xs group flex p-3 w-full justify-start 
                font-medium cursor-pointer hover:text-primary hover:bg-primary/10 
                rounded-lg transition`,
                pathname === route.href && "text-primary bg-primary/10",
                route.mobileOnly ? "sm:hidden" : "" // Apply conditional class for mobile-only visibility
              )}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1 text-center">
                <route.icon className="h-5 w-5" />
                <p className="text-xs">{route.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
