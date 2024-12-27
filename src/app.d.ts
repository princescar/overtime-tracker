declare global {
  // See https://svelte.dev/docs/kit/types#app.d.ts
  // for information about these interfaces
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        id: string;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  // This is injected by Vite
  const __SUPPORTED_LANGUAGES__: string[];
}

export {};
