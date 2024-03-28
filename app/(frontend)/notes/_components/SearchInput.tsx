"use client";

import { SearchIcon } from "lucide-react";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouce } from "@/hooks/use-debounce";
import qs from "query-string";
import { Input } from "@/components/ui/input";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const labelId = searchParams.get("labelId");
  const title = searchParams.get("title");

  const [value, setValue] = useState(title || "");
  const debouncedValue = useDebouce<string>(value, 1000);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const query = {
      title: debouncedValue,
      labelId: labelId,
    };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url)

  }, [debouncedValue, router, labelId]);

  return (
    <div className="relative">
      <SearchIcon className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search for Note"
        className="pl-10 bg-primary/10"
      />
    </div>
  );
};

export default SearchInput;
