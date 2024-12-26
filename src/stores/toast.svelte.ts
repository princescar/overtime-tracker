import { t } from "./i18n.svelte";

type Toaster = (message: string, title?: string) => void;

class ToastStore {
  #toaster = $state<Toaster>();

  init(toaster: Toaster) {
    this.#toaster = toaster;
  }

  toast(message: string, title?: string) {
    if (!this.#toaster) {
      throw new Error("Toasts store is not initialized");
    }
    this.#toaster(message, title);
  }

  success(message: string) {
    this.toast(message, t("success"));
  }

  error(error: unknown) {
    let message = t("error_unknown");
    if (error instanceof Error) {
      const codedError = error as { code?: string };
      const errorCode = typeof codedError.code === "string" ? codedError.code : undefined;
      const messageFromErrorCode = errorCode
        ? t(`error_${errorCode.toLocaleLowerCase()}`)
        : undefined;
      message = messageFromErrorCode ?? error.message;
    }

    this.toast(message, t("error"));
  }
}

export const toastStore = new ToastStore();
