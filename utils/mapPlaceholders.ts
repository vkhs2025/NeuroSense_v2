import { ADHD_PLACEHOLDERS, AUTISM_PLACEHOLDERS } from "../types/placeholders";

/**
 * Maps extracted text from the input document to placeholders
 * based on section headings. One placeholder per section.
 */
export function mapPlaceholders(
  text: string,
  templateType: "ADHD" | "Autism"
) {
  const lines = text.split(/\n+/).filter(Boolean);
  const placeholders =
    templateType === "ADHD" ? ADHD_PLACEHOLDERS : AUTISM_PLACEHOLDERS;

  const mapped: Record<string, string> = {};
  let currentPlaceholder = "";

  for (const line of lines) {
    // Match line to section heading (case-insensitive)
    const placeholder = placeholders.find((p) =>
      line.toLowerCase().includes(p.replace(/_/g, " ").toLowerCase())
    );

    if (placeholder) {
      currentPlaceholder = placeholder;
      mapped[currentPlaceholder] = "";
    } else if (currentPlaceholder) {
      // Append text under the current section
      mapped[currentPlaceholder] +=
        (mapped[currentPlaceholder] ? " " : "") + line.trim();
    }
  }

  return mapped;
}
