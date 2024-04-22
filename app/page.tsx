import { Button } from "@/components/ui/button";
import { auth, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  const { userId } = auth();
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex flex-col items-center">
          <UserButton />
        </div>
        <h1 className="text-2xl font-bold text-center">PG-Insights</h1>
        <Button className="border border-gray-300" variant="ghost" asChild>
          {userId ? <SignOutButton /> : <SignInButton />}
        </Button>
      </div>
      <div className="flex flex-col my-2 gap-4">
        <div className="flex flex-col items-center justify-center my-1 gap-2">
          <p className="max-w-prose text-center">
            See the why and how of this application.
          </p>
          <Button className="max-w-fit bg-secondary text-primary border border-primary/90"  asChild>
            <Link href="/about">Why & How</Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center my-1 gap-2">
          <p className="max-w-prose text-center">
            Insightful, curious and contextually relevant conversation <br></br>{" "}
            based on Paul Graham&apos;s essays.
          </p>
          <Button className="max-w-fit" variant="destructive" asChild>
            <Link href="/chats/pg-notes">Chat With Assistant</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col my-2 gap-4">
        <div className="flex flex-col items-center justify-center my-1 gap-2">
          <p className="max-w-prose text-center">
            Create notes to enhance the contextual relevance of your interaction{" "}
            <br></br>
            and insights when conversing with the AI Assistant.
          </p>
          <Button className="max-w-fit border border-primary/50" asChild>
            <Link href="/notes">See Your Notes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
