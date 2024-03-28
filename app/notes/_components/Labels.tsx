"use client";

import { cn } from "@/lib/utils";
import { Label } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

interface LabelsProps {
  data: Label[];
}

const Labels = ({ data }: LabelsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const labelId = searchParams.get("labelId") || "";

  const onClick = (id: string | undefined) => {
    const query = { labelId: id };
    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url);
  };

  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1">
      <button
        onClick={() => onClick(undefined)}
        className={cn(
          `flex items-center text-center text-xs
            md:text-sm px-2 md:px-4 py-2 md:py-3
            rounded-md bg-primary/10 hover:opacity-75 transition
            `,
            !labelId ? "bg-primary/25" : "bg-primary/10"
        )}
      >
        Newest
      </button>
      {data.map((category) => (
        <button
          onClick={() => onClick(category.id)}
          key={category.id}
          className={cn(
            `flex items-center text-center text-xs
            md:text-sm px-2 md:px-4 py-2 md:py-3
            rounded-md bg-primary/10 hover:opacity-75 transition
            `,
            category.id === labelId ? "bg-primary/25" : "bg-primary/10"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default Labels;
