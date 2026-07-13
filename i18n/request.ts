import { getRequestConfig } from "next-intl/server";
import { messages, type Locale } from "./index";

const locales = Object.keys(messages) as Locale[];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "es";
  }

  return {
    locale,
    messages: messages[locale as Locale],
  };
});
