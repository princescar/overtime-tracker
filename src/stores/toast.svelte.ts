import { t } from "./i18n.svelte";

interface Toast {
  type: "success" | "error";
  message: string;
}

const TOAST_DURATION = 3000;

class ToastStore {
  #toasts: [string, Toast][] = $state([]);

  get toasts() {
    return this.#toasts;
  }

  toast(message: string, type: Toast["type"]) {
    const id = Date.now().toString();
    this.#toasts.push([id, { type, message }]);
    setTimeout(() => {
      this.removeToast(id);
    }, TOAST_DURATION);
    return id;
  }

  removeToast(toastId: string) {
    const index = this.#toasts.findIndex(([id]) => id === toastId);
    if (index > -1) {
      this.#toasts.splice(index, 1);
    }
  }

  success(message: string) {
    return this.toast(message, "success");
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

    return this.toast(message, "error");
  }
}

export const toastStore = new ToastStore();
