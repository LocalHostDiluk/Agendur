interface HSStaticMethods {
  autoInit(collection?: string | string[]): void;
}

declare global {
  interface Window {
    HSStaticMethods: HSStaticMethods;
  }
}

export {};
