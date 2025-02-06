import { marked } from "marked";
import TurndownService from "turndown";

export function markdownToHtml(markdown) {
  return marked(markdown);
}

export function htmlToMarkdown(html) {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
  });
  return turndownService.turndown(html);
}
