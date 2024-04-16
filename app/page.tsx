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
        <h1 className="text-2xl font-bold text-center">Context-PG</h1>
        <Button className="border border-gray-300" variant="outline" asChild>
          {userId ? <SignOutButton /> : <SignInButton />}
        </Button>
        <Button className="" variant="destructive" asChild>
          <Link href="/chats/pg-notes">Chat With Assistant</Link>
        </Button>
        <Button
          className=""
          variant="secondary"
          asChild
        >
          <Link href="/notes">See Your Notes</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
