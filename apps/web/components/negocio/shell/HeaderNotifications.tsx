"use client";

import { Bell } from "lucide-react";

export interface HeaderNotificationsProps {
  notificationsOpen: boolean;
  hasUnreadNotifications: boolean;
  onToggle: () => void;
}

export function HeaderNotifications({
  notificationsOpen,
  hasUnreadNotifications,
  onToggle,
}: HeaderNotificationsProps) {
  return (
    <div data-header-notifs className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden"
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {hasUnreadNotifications && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame ring-2 ring-surface"
            aria-label="Notificaciones sin leer"
          />
        )}
      </button>

      {notificationsOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 p-3 bg-surface border border-border rounded-lg shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-border font-semibold text-text-primary">
            <span>Notificaciones</span>
            <span className="text-[10px] text-text-muted">
              Centro de avisos
            </span>
          </div>
          <div className="py-3 text-center text-text-secondary">
            <p className="font-medium text-text-primary">Todo al día</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              No tienes avisos urgentes en este momento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
