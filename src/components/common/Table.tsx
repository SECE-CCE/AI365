import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor: (row: T, index: number) => string | number;
}

export function Table<T>({ columns, data, emptyMessage = 'No records found.', keyExtractor }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-slate-500 text-xs font-medium border border-slate-200 rounded-2xl bg-white">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              {columns.map((col, i) => (
                <th key={i} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800 bg-white">
            {data.map((row, rowIdx) => {
              const rawKey = keyExtractor ? keyExtractor(row, rowIdx) : rowIdx;
              return (
                <tr key={`${rawKey}-${rowIdx}`} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3.5 px-4 ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : (row[col.accessorKey!] as any)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {data.map((row, rowIdx) => (
          <div
            key={`mobile-${keyExtractor(row, rowIdx)}-${rowIdx}`}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5"
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex items-start justify-between gap-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0 pt-0.5 w-24">
                  {col.header}
                </span>
                <span className="text-slate-800 text-right flex-1 min-w-0">
                  {col.cell ? col.cell(row) : (row[col.accessorKey!] as any)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
