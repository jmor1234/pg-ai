import React from "react";
import { Menu } from "lucide-react";
import SideBar from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-secondary pt-10 w-32">
        <SideBar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
