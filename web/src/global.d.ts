import { LunarBirthday } from "./types/birthdays";

declare global {
  interface Window {
    generateIcsContent: (params: string) => string;
  }
}
