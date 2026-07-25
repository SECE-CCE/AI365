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
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs custom-scrollbar">
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-500 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
