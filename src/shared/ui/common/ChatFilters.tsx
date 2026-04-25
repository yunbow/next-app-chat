"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";

type Props = {
  basePath: string;
  showTypeFilter?: boolean;
};

export function ChatFilters({ basePath, showTypeFilter = true }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("q", search);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="チャットを検索..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {showTypeFilter && (
        <Select
          value={searchParams.get("type") || "all"}
          onValueChange={(value: string) => updateFilters("type", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="タイプ" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="direct">ダイレクト</SelectItem>
            <SelectItem value="group">グループ</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select
        value={searchParams.get("sort") || "latest"}
        onValueChange={(value: string) => updateFilters("sort", value)}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <SelectValue placeholder="並び替え" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">新着順</SelectItem>
          <SelectItem value="oldest">古い順</SelectItem>
          <SelectItem value="unread">未読優先</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
