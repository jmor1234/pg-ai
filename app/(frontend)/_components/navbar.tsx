"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import MobileSidebar from "./mobile-sidebar";
import { DarkMode } from "@/components/ui/DarkMode";
import { Button } from "@/components/ui/button";
import { NotebookIcon } from "lucide-react";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import logo from "@/app/favicon.ico";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming you have a similar utility for classNames

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div
      className="fixed w-full z-50 flex justify-between items-center py-2 px-4
    border-b border-primary/10 bg-secondary h-16"
    >
      <div className="flex items-center ">
        <MobileSidebar />
        <Link
          href="/"
          className={cn(
            "hidden md:block rounded-xl p-2",
            pathname === "/" && "text-primary bg-primary/10"
          )}
        >
          <Image src={logo} alt="logo" width={40} height={40} />
        </Link>
      </div>
      <Link
        href="/notes"
        className={cn(
          "flex flex-col items-center rounded-xl p-2",
          pathname === "/notes" && "text-primary bg-primary/10"
        )}
      >
        <NotebookIcon className="h-5 w-5 inline-block mb-1" />
        <span className="hidden md:block">Notes</span>
      </Link>
      <Link href="/">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tighter text-primary rounded-xl">
          Context-PG
        </h1>
      </Link>
      <Link
        href="/chats/pg-notes"
        className={cn(
          "flex flex-col items-center rounded-xl p-2",
          pathname === "/chats" && "text-primary bg-primary/10"
        )}
      >
        <ChatBubbleIcon className="h-5 w-5 inline-block mb-1" />
        <span className="hidden md:block">Chat</span>
      </Link>
      <div className="flex items-center gap-x-3">
        <DarkMode />
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
