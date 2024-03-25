import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="flex flex-col space-y-4">
        <SignInButton  />
        <Button asChild>
          <Link href="/chats/pg">Chat with Paul Graham</Link>
        </Button>
        <Button className="border border-gray-400" variant="secondary" asChild>
          <Link href="/notes">Get to Notes</Link>
        </Button>
        <Button className="border border-gray-400" variant="destructive" asChild>
          <Link href="/chats/notes">Chat With Notes</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
