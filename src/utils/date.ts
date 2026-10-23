import { siteConfig } from "@/config/site";

const dateFormat = new Intl.DateTimeFormat(siteConfig.language, { day: "numeric", month: "short", year: "numeric" });
const monthFormat = new Intl.DateTimeFormat(siteConfig.language, { month: "long", year: "numeric" });

/** "23 Oct 2026" */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** "October 2026" */
export const formatMonth = (iso: string) => monthFormat.format(new Date(iso));
