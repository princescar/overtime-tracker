import { Config } from "vike-react/Config";
import { ToastProvider } from "#/hooks/useToaster";
import { useTranslation } from "#/hooks/useTranslation";

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
