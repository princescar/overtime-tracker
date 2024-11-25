declare global {
  namespace Vike {
    interface PageContext {
      user?: {
        id: string;
      };
    }
  }
}

export {};
