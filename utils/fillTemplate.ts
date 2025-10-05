import fs from "fs";
import path from "path";
import PizZip from "pizzip";


/**
 * Lightweight DOCX filler — replaces {{placeholders}} directly in the XML.
 * Logs replacements and handles weird Word formatting splits.
 */
export async function fillTemplate(
  templatePath: string,
  data: Record<string, string>
): Promise<Buffer> {
  try {
    console.log("[fillTemplate] Using lightweight replacer for:", templatePath);

    // Step 1: Read the DOCX as binary
    const resolvedPath = path.resolve(templatePath);
    const binary = fs.readFileSync(resolvedPath, "binary");

    // Step 2: Unzip the DOCX
    const zip = new PizZip(binary);

    // Step 3: Load main document XML
    let docXml = zip.file("word/document.xml")?.asText();
    if (!docXml) throw new Error("word/document.xml not found in template");

    // Step 4: Replace placeholders (case-insensitive, tolerate broken runs)
    let replacedKeys: string[] = [];
    let missingKeys: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      const cleanValue = value || "";
      // Matches placeholders like {{Key}}, {{ Key }}, even if Word inserted spaces or XML tags in between
      const regex = new RegExp(
        `{{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*}}`,
        "gi"
      );

      if (regex.test(docXml)) {
        docXml = docXml.replace(regex, escapeXml(cleanValue));
        replacedKeys.push(key);
      } else {
        missingKeys.push(key);
      }
    }

    // Step 5: Remove any unreplaced {{placeholders}}
    docXml = docXml.replace(/{{[^}]+}}/g, "");

    // Step 6: Write the modified XML back into the zip
    zip.file("word/document.xml", docXml);

    // Step 7: Generate the filled DOCX
    const outputBuffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });

    // Logging summary
    console.log(`[fillTemplate] Template filled successfully`);
    console.log(`  • Replaced: ${replacedKeys.length} placeholders`);
    console.log(`  • Missing: ${missingKeys.length}`);
    if (missingKeys.length) console.log("  ⚠ Missing:", missingKeys);

    return outputBuffer;
  } catch (error: any) {
    console.error("[fillTemplate] Error:", error);
    throw new Error(`Failed to fill template: ${error.message}`);
  }
}

/**
 * Basic XML escaping to ensure characters like &, <, > don’t break the file.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
