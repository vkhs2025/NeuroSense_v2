import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { extractFromBuffer } from "../../utils/extractDocx";
import { mapPlaceholders } from "../../utils/mapPlaceholders";
import { fillTemplate } from "../../utils/fillTemplate";

// Disable Next.js body parser so we can handle form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the incoming form data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const uploadedFile = files.file?.[0];
    const templateType = fields.templateType?.[0] as "ADHD" | "Autism";

    if (!uploadedFile || !templateType) {
      return res.status(400).json({ error: "Missing file or templateType" });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    // Handle possible null filenames
    const filename = uploadedFile.originalFilename ?? "input.docx";

    // Extract text from uploaded document
    const extracted = await extractFromBuffer(fileBuffer, filename);

    // Some extractors return objects — normalize it to string
    const extractedText =
      typeof extracted === "string"
        ? extracted
        : (extracted.text ??"");

    // Map extracted text into section-based placeholders
    const mappedData = mapPlaceholders(extractedText, templateType);

    // Locate the correct template
    const templateFileName =
      templateType === "ADHD" ? "ADHD.docx" : "Autism.docx";
    const templatePath = path.join(process.cwd(), "templates", templateFileName);

    // Generate the final .docx file
    const outputBuffer = await fillTemplate(templatePath, mappedData);

    // Send the file as a download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${templateFileName.replace(".docx", "_Generated.docx")}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(outputBuffer);
  } catch (error: any) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report", details: error.message });
  }
}
