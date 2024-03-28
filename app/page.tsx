import { Button } from "@/components/ui/button";
import { auth, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  const { userId } = auth();
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col items-center">
          <UserButton />
        </div>
        <h1 className="text-2xl font-bold text-center">CoreContext</h1>
        <Button className="border border-gray-300" variant="outline" asChild>
          {userId ? <SignOutButton /> : <SignInButton />}
        </Button>
        <Button
          className="border border-gray-300 bg-primary/10 text-primary"
          variant="outline"
          asChild
        >
          <Link href="/notes">Get to Notes</Link>
        </Button>
        <Button className="" asChild>
          <Link href="/chats/notes">Chat With Notes</Link>
        </Button>
        <Button className="bg-secondary text-primary border" asChild>
          <Link href="/chats/pg">Chat with Paul Graham</Link>
        </Button>
        <Button className="" variant="destructive" asChild>
          <Link href="/chats/pg-notes">Chat with Paul Graham + your notes</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
