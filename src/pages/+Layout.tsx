import { Config } from "vike-react/Config";
import { ToastProvider } from "#/hooks/useToaster";
import { useTranslation } from "#/hooks/useTranslation";
import { Button } from "#/components/Button";

import "./index.css";

const SwitchLanguageButton = () => {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <Button
      variant="subtle"
      onClick={() => changeLanguage(language === "en" ? "zh" : "en")}
    >
      {t("language")}
    </Button>
  );
};

export const Layout = ({ children }: { children: JSX.Element }) => {
  const { t } = useTranslation();

  return (
    <>
      <Config title={t("overtime_tracker")} />
      <ToastProvider>
        <>
          <div className="flex justify-end p-2">
            <SwitchLanguageButton />
          </div>
          {children}
        </>
      </ToastProvider>
    </>
  );
};
