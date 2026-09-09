import React, { forwardRef } from "react";

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={`min-w-full divide-y divide-gray-200 dark:divide-neutral-700 ${className}`.trim()}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-gray-50 dark:bg-neutral-800 ${className}`.trim()}
    {...props}
  >
    {children}
  </thead>
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-gray-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900 ${className}`.trim()}
    {...props}
  >
    {children}
  </tbody>
));
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </tr>
  )
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", children, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400 ${className}`.trim()}
    {...props}
  >
    {children}
  </th>
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", children, ...props }, ref) => (
  <td
    ref={ref}
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 ${className}`.trim()}
    {...props}
  >
    {children}
  </td>
));
TableCell.displayName = "TableCell";
