import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Configure worker - using worker from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Extract text items and join them
    const pageText = textContent.items
      .map((item) => (item as TextItem).str)
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText.trim();
};

export const extractTextFromPdfPage = async (
  file: File,
  pageNumber: number
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(
      `Page ${pageNumber} does not exist. PDF has ${pdf.numPages} pages.`
    );
  }

  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();

  return textContent.items
    .map((item) => (item as TextItem).str)
    .join(" ")
    .trim();
};
