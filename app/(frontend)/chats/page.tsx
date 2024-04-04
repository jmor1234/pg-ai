import { Button } from "@/components/ui/button";
import { BotIcon, NotebookIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Chats = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl tracking-tighter font-bold text-center p-3">
          AI Chats
          <BotIcon className="h-6 w-6 inline-block ml-2 mb-1" />
        </h1>
      </div>
      <div className="flex items-center justify-center">
        <NotebookIcon className="h-6 w-6 inline-block ml-2 mb-1" />
        <BotIcon className="h-6 w-6 inline-block ml-1 mb-1" />
      </div>
      <div className="flex flex-col gap-4 p-4 max-w-[400px] mx-auto">
        <Button className="" asChild>
          <Link href="/chats/notes">Chat With Notes</Link>
        </Button>
        <div className="flex items-center justify-center">
          <span className="text-xl font-semibold tracking-tighter text-primary">
            PG
          </span>
          <BotIcon className="h-6 w-6 inline-block ml-1 mb-1" />
        </div>
        <Button className="bg-secondary text-primary border" asChild>
          <Link href="/chats/pg">Chat with Paul Graham</Link>
        </Button>
        <div className="flex items-center justify-center">
          <BotIcon className="h-6 w-6 inline-block mr-1 mb-1" />
          <span className="text-xl font-semibold tracking-tighter text-primary">
            PG +
          </span>
          <NotebookIcon className="h-6 w-6 inline-block ml-2 mb-1" />
        </div>
        <Button className="" variant="destructive" asChild>
          <Link href="/chats/pg-notes">Chat with Paul Graham + your notes</Link>
        </Button>
        {/* <div className="flex items-center justify-center">
          <BotIcon className="h-6 w-6 inline-block mr-1 mb-1" />
          <span className="text-xl font-semibold tracking-tighter text-primary">
            Deep Writing
          </span>
          <NotebookIcon className="h-6 w-6 inline-block ml-2 mb-1" />
        </div>
        <Button className="bg-secondary text-primary border border-primary" asChild>
          <Link href="/chats/deep-writing">Deep Writing Companion</Link>
        </Button> */}
      </div>
    </div>
  );
};

export default Chats;
