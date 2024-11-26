declare global {
  namespace Vike {
    interface PageContext {
      user?: {
        id: string;
      };
      language: string;
    }
  }
}

export {};
