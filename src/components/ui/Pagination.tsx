'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.max(1, Math.min(currentPage, safeTotalPages));

  const startItem = totalItems === 0 ? 0 : Math.min((safePage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <div className="flex items-center gap-3">
        <div>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> entries
        </div>

        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {(() => {
          const pages: (number | string)[] = [];
          if (safeTotalPages <= 7) {
            for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (safePage > 3) pages.push('...');
            const start = Math.max(2, safePage - 1);
            const end = Math.min(safeTotalPages - 1, safePage + 1);
            for (let i = start; i <= end; i++) {
              if (!pages.includes(i)) pages.push(i);
            }
            if (safePage < safeTotalPages - 2) pages.push('...');
            if (!pages.includes(safeTotalPages)) pages.push(safeTotalPages);
          }

          return pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="w-6 text-center text-slate-400 select-none">
                  …
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === safePage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs cursor-pointer font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            );
          });
        })()}

        <button
          type="button"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
