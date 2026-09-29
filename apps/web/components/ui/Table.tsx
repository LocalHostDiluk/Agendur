import React, { forwardRef } from "react";

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={`min-w-full divide-y divide-border text-left ${className}`.trim()}
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
    className={`bg-surface-alt border-b border-border sticky top-0 z-10 ${className}`.trim()}
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
    className={`divide-y divide-border/50 bg-surface ${className}`.trim()}
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
      className={`hover:bg-surface-alt transition-colors h-12 ${className}`.trim()}
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
    className={`px-6 py-3 text-start text-xs font-medium text-text-secondary ${className}`.trim()}
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
    className={`px-6 py-3 whitespace-nowrap text-sm text-text-primary border-b border-border/50 ${className}`.trim()}
    {...props}
  >
    {children}
  </td>
));
TableCell.displayName = "TableCell";
