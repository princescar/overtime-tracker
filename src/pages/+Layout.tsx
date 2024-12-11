import { Config } from "vike-react/Config";
import { ToastProvider, useTranslation } from "#/hooks";

import "./index.css";

export const Layout = ({ children }: { children: JSX.Element }) => {
  const { t } = useTranslation();

  return (
    <>
      <Config title={t("overtime_tracker")} />
      <ToastProvider>{children}</ToastProvider>
    </>
  );
};
