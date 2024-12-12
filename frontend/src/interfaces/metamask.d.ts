interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<string[]>;
    on: (event: string, handler: (...args: never[]) => void) => void;
    removeListener: (
      event: string,
      handler: (...args: never[]) => void
    ) => void;
  };
}
