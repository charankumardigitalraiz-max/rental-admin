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

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  emptyMessage?: React.ReactNode;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFilterKeys?: (keyof T)[];
  headerActions?: React.ReactNode;
  rowClassName?: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 5,
  emptyMessage = 'No records found',
  isLoading: externalLoading = false,
  searchPlaceholder,
  searchFilterKeys,
  headerActions,
  rowClassName,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

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

  // Handle Search Input Change cleanly with temporary loader
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  };

  // Trigger brief local loader when page changes
  const handlePageChange = (page: number) => {
    setLocalLoading(true);
    setCurrentPage(page);
    setTimeout(() => {
      setLocalLoading(false);
    }, 250);
  };

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showLoader = externalLoading || localLoading;

  return (
    <div className="card-white relative overflow-hidden">
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

      {/* Scoped Table Loader Overlay */}
      {showLoader && <TableLoader message="Updating records..." />}

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#023526] text-white uppercase text-[10.5px] font-bold tracking-wider border-b border-[#012319]">
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
                        onClick={() => setSearchTerm('')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 mt-1 shadow-2xs"
                      >
                        Clear Search Query
                      </button>
                    )}
                  </div>
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
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
