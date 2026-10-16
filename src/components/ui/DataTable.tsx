'use client';

import React, { useState } from 'react';
import Pagination from './Pagination';
import TableLoader from './TableLoader';
import { Search, FolderSearch } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: React.ReactNode;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFilterKeys?: (keyof T)[];
  headerActions?: React.ReactNode;
  rowClassName?: (row: T) => string;
  /** When provided, DataTable skips client-side slicing and delegates pagination to the caller */
  serverPagination?: ServerPaginationProps;
  /** Callback triggered when search input changes */
  onSearchChange?: (term: string) => void;
  /** Controlled search value from parent */
  searchValue?: string;
  /** Minimum duration in milliseconds the loader remains visible (defaults to 1500ms) */
  minLoadingDurationMs?: number;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 5,
  pageSizeOptions,
  emptyMessage = 'No records found',
  isLoading: externalLoading = false,
  searchPlaceholder,
  searchFilterKeys,
  headerActions,
  rowClassName,
  serverPagination,
  onSearchChange,
  searchValue,
  minLoadingDurationMs = 1500,
}: DataTableProps<T>) {
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const effectivePageSize = internalPageSize || pageSize || 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  // Sync pageSize prop when changed externally
  React.useEffect(() => {
    setInternalPageSize(pageSize);
  }, [pageSize]);

  // Guarantee loader displays for at least minLoadingDurationMs on actual external async loads
  const [minLoaderActive, setMinLoaderActive] = useState(false);
  const loadingStartTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (externalLoading) {
      loadingStartTimeRef.current = Date.now();
      setMinLoaderActive(true);
    } else if (loadingStartTimeRef.current !== null) {
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, minLoadingDurationMs - elapsed);

      const timer = setTimeout(() => {
        setMinLoaderActive(false);
        loadingStartTimeRef.current = null;
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [externalLoading, minLoadingDurationMs]);

  const searchTerm = searchValue !== undefined ? searchValue : internalSearchTerm;

  // Filter data by search query if keys are provided or search term exists
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchFilterKeys && searchFilterKeys.length > 0) {
        return searchFilterKeys.some((k) => {
          const val = item[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      }
      // Fallback: search across all object values
      return Object.values(item as Record<string, unknown>).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchFilterKeys]);

  // Auto-reset current page to 1 whenever data or search filter updates
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm]);

  // Handle Search Input Change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchValue === undefined) {
      setInternalSearchTerm(val);
    }
    onSearchChange?.(val);
    setCurrentPage(1);
  };

  // Server-side vs client-side calculations
  const isServerPaginated = !!serverPagination;
  const isSearching = !!searchTerm.trim();

  const totalItems = isServerPaginated
    ? (isSearching ? filteredData.length : serverPagination!.totalItems)
    : filteredData.length;

  const totalPages = isServerPaginated
    ? (isSearching ? Math.ceil(totalItems / effectivePageSize) || 1 : serverPagination!.totalPages)
    : Math.ceil(totalItems / effectivePageSize) || 1;

  // Always clamp effectivePage within valid range [1, totalPages]
  const effectivePage = isServerPaginated
    ? (isSearching ? 1 : serverPagination!.currentPage)
    : Math.max(1, Math.min(currentPage, totalPages));

  // Instant in-memory slicing
  const currentData = React.useMemo(() => {
    if (isServerPaginated && !isSearching) {
      return data;
    }
    const startIndex = (effectivePage - 1) * effectivePageSize;
    return filteredData.slice(startIndex, startIndex + effectivePageSize);
  }, [isServerPaginated, isSearching, data, filteredData, effectivePage, effectivePageSize]);

  // Clean, instant page change handler
  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const handleEffectivePageChange = (page: number) => {
    if (isServerPaginated) {
      serverPagination!.onPageChange(page);
    } else {
      handlePageChange(page);
    }
  };

  const showLoader = externalLoading || minLoaderActive;

  return (
    <div className="card-white overflow-hidden isolate">
      {/* Table Header Bar with Search & Actions */}
      {(searchPlaceholder !== undefined || headerActions) && (
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 w-full bg-white">
          {searchPlaceholder !== undefined && (
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9.5 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 transition-all shadow-2xs"
              />
            </div>
          )}

          {headerActions && <div className="flex-1 w-full flex items-center justify-end">{headerActions}</div>}
        </div>
      )}

      {/* Table Container - Scoped relative container for table rows only */}
      <div className="relative overflow-x-auto w-full min-h-[160px]">
        {/* Scoped Table Loader Overlay: ONLY covers rows below the header */}
        {showLoader && (
          <TableLoader message="Updating records..." className="top-[38px] z-[1]" />
        )}

        <table className="w-full text-left text-xs">
          <thead className="bg-[#023526] text-white uppercase text-[10.5px] font-bold tracking-wider border-b border-[#012319] relative z-[2]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${col.className || ''} ${col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                    }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  {!showLoader && (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4 max-w-md mx-auto select-none">
                      <div className="w-14 h-14 rounded-full bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-center text-primary shadow-xs">
                        <FolderSearch className="w-7 h-7 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                          No Matching Data Records Found
                        </h4>
                        <div className="text-xs text-slate-500 font-medium leading-relaxed">
                          {emptyMessage}
                        </div>
                      </div>
                      {searchTerm.trim() && (
                        <button
                          onClick={() => {
                            if (searchValue === undefined) setInternalSearchTerm('');
                            onSearchChange?.('');
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 mt-1 shadow-2xs"
                        >
                          Clear Search Query
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              currentData.map((row) => {
                const customRowClass = rowClassName ? rowClassName(row) : '';
                return (
                  <tr
                    key={keyExtractor(row)}
                    className={`${customRowClass || 'hover:bg-slate-50'} transition-colors`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 ${col.className || ''} ${col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                          }`}
                      >
                        {col.render
                          ? col.render(row)
                          : (row as Record<string, unknown>)[col.key] !== undefined
                            ? String((row as Record<string, unknown>)[col.key])
                            : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={effectivePageSize}
            onPageChange={handleEffectivePageChange}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={(newSize) => {
              setInternalPageSize(newSize);
              setCurrentPage(1);
              if (serverPagination?.onPageSizeChange) {
                serverPagination.onPageSizeChange(newSize);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
