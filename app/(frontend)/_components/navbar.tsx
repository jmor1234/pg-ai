import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import MobileSidebar from "./mobile-sidebar";
import { DarkMode } from "@/components/ui/DarkMode";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <div
      className="fixed w-full z-50 flex justify-between items-center py-2 px-4
    border-b border-primary/10 bg-secondary h-16"
    >
      <div className="flex items-center ">
        <MobileSidebar />
        <Link href="/">
          <h1 className="hidden md:block text-lg md:text-xl font-bold text-primary p-2">
            CC
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <DarkMode />
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
