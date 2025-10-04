import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * Fill a Word (.docx) template with mapped placeholder values.
 * @param templatePath - Absolute path to the .docx file (e.g., /templates/ADHD.docx)
 * @param data - Key/value map of placeholders and replacement text
 * @returns Buffer (the filled .docx file ready to send/download)
 */
export async function fillTemplate(
  templatePath: string,
  data: Record<string, string>
): Promise<Buffer> {
  try {
    // Load the .docx template as binary
    const content = fs.readFileSync(templatePath, "binary");

    // Create a zip container
    const zip = new PizZip(content);

    // Initialize the document
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Replace placeholders with mapped values
    doc.setData(data);

    try {
      doc.render();
    } catch (error: any) {
      console.error("[fillTemplate] Render Error:", error);
      throw new Error(`Template rendering failed: ${error.message}`);
    }

    // Generate a new .docx file in memory
    const output = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return output;
  } catch (error: any) {
    console.error("[fillTemplate] Error:", error);
    throw new Error(`Failed to fill template: ${error.message}`);
  }
}
