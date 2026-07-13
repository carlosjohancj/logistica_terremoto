import ar from "./locales/ar";
import de from "./locales/de";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import it from "./locales/it";
import pt from "./locales/pt";

export const messages = { ar, de, en, es, fr, it, pt } as const;

export type Locale = keyof typeof messages;

export default messages;
