"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  searchParams?: Record<string, string>;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  basePath,
  searchParams = {},
}: Props) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  const pages: number[] = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);
  if (endPage - startPage < showPages - 1) startPage = Math.max(1, endPage - showPages + 1);
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  const renderPage = (
    page: number,
    children: React.ReactNode,
    opts: { disabled?: boolean; active?: boolean; label?: string } = {}
  ) => {
    const { disabled, active, label } = opts;
    const btn = (
      <Button
        variant={active ? "default" : "outline"}
        size="sm"
        disabled={disabled}
        aria-label={label}
        onClick={onPageChange && !disabled ? () => onPageChange(page) : undefined}
      >
        {children}
      </Button>
    );
    if (!onPageChange && basePath && !disabled) {
      return <Link href={buildUrl(page)}>{btn}</Link>;
    }
    return btn;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {renderPage(Math.max(1, currentPage - 1), <ChevronLeft className="h-4 w-4" />, {
        disabled: currentPage === 1,
        label: "前のページ",
      })}

      {startPage > 1 && (
        <>
          {renderPage(1, "1")}
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Fragment key={page}>
          {renderPage(page, page, { active: page === currentPage })}
        </Fragment>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          {renderPage(totalPages, totalPages)}
        </>
      )}

      {renderPage(Math.min(totalPages, currentPage + 1), <ChevronRight className="h-4 w-4" />, {
        disabled: currentPage === totalPages,
        label: "次のページ",
      })}
    </div>
  );
}
