import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import MobileSidebar from "./mobile-sidebar";

const Navbar = () => {
  return (
    <div
      className="fixed w-full z-50 flex justify-between items-center py-2 px-4
    border-b border-primary/10 bg-secondary h-16"
    >
      <div className="flex items-center ">
        <MobileSidebar />
        <Link href="">
          <h1 className="hidden md:block text-xl md:text-3xl font-bold text-primary">
            companion.ai
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
