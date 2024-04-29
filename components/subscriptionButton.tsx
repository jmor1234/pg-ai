"use client";

import React from "react";
import { Button } from "./ui/button";
import { Sparkle } from "lucide-react";
import { useToast } from "./ui/use-toast";
import axios from "axios";

interface SubscriptionButtonProps {
  isPro: boolean;
}

export default function SubscriptionButton({
  isPro = false,
}: SubscriptionButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/stripe");

      window.location.href = response.data.url;


    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button disabled={loading} onClick={onClick} size="sm" variant={isPro ? "default" : "secondary"}>
      {loading ? (
        <>
          Loading...
          <Sparkle className="animate-spin h-4 w-4 ml-2" />
        </>
      ) : isPro ? (
        "Manage Subscription"
      ) : (
        <>
          Upgrade to Pro
          <Sparkle className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  );
}
