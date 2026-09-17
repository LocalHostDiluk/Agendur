"use client";

import { useState, useSyncExternalStore } from "react";
import type {
  ConfirmActionType,
  ConfirmDialogOptions,
  ConfirmDialogProps,
} from "@/components/ui/ConfirmDialog";

export type { ConfirmActionType, ConfirmDialogOptions, ConfirmDialogProps };

class ConfirmStore {
  isOpen = false;
  options: ConfirmDialogOptions;
  private resolver: ((value: boolean) => void) | null = null;
  private listeners = new Set<() => void>();
  private defaultOptions?: Partial<ConfirmDialogOptions>;

  constructor(defaultOptions?: Partial<ConfirmDialogOptions>) {
    this.defaultOptions = defaultOptions;
    this.options = { type: "logout", ...defaultOptions };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.isOpen ? 1 : 0;
  };

  confirm = (
    opts?: ConfirmDialogOptions | ConfirmActionType,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (this.resolver) {
        this.resolver(false);
      }
      this.resolver = resolve;

      let nextOptions: ConfirmDialogOptions;
      if (typeof opts === "string") {
        nextOptions = { ...this.defaultOptions, type: opts };
      } else if (opts) {
        nextOptions = { ...this.defaultOptions, ...opts };
      } else {
        nextOptions = { type: "logout", ...this.defaultOptions };
      }

      this.options = nextOptions;
      this.isOpen = true;
      this.listeners.forEach((listener) => listener());
    });
  };

  handleConfirm = () => {
    this.isOpen = false;
    this.listeners.forEach((listener) => listener());
    this.resolver?.(true);
    this.resolver = null;
  };

  handleCancel = () => {
    this.isOpen = false;
    this.listeners.forEach((listener) => listener());
    this.resolver?.(false);
    this.resolver = null;
  };
}

export function useConfirmDialog(
  defaultOptions?: Partial<ConfirmDialogOptions>,
) {
  const [store] = useState(() => new ConfirmStore(defaultOptions));
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return {
    confirm: store.confirm,
    get isOpen() {
      return store.isOpen;
    },
    get dialogProps(): ConfirmDialogProps {
      return {
        ...store.options,
        isOpen: store.isOpen,
        onConfirm: store.handleConfirm,
        onCancel: store.handleCancel,
      };
    },
    close: store.handleCancel,
    cancel: store.handleCancel,
  };
}
