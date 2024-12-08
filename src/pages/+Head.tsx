import React from "react";
import i18n from "#/i18n";

export function Head() {
  return (
    <>
      <title>{i18n.t("overtime_tracker")}</title>
    </>
  );
}
