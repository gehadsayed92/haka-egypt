import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-medium text-gray-600"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? '\u2014')}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
