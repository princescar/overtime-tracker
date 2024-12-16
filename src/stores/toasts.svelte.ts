import type { AddToastProps } from "@melt-ui/svelte";
import { t } from "./messages.svelte";

export interface ToastData {
  message: string;
  title?: string;
}

let addToastFunc = $state<(toast: AddToastProps<ToastData>) => void>();

export const initToastStore = (addToast: (toast: AddToastProps<ToastData>) => void) => {
  addToastFunc = addToast;
};

export const toastError = (error: unknown) => {
  if (!addToastFunc) {
    throw new Error("Toasts store is not initialized");
  }
  let message = t("error_unknown") ?? "Unknown error";
  if (error instanceof Error) {
    const codedError = error as { code?: string };
    const errorCode = typeof codedError.code === "string" ? codedError.code : undefined;
    const messageFromErrorCode = errorCode
      ? t(`error_${errorCode.toLocaleLowerCase()}`)
      : undefined;
    message = messageFromErrorCode ?? error.message;
  }

  addToastFunc({
    data: {
      message,
      title: t("error"),
    },
  });
};
