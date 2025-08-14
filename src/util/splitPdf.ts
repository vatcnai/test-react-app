import { PDFDocument } from "pdf-lib";
import { extractTextFromPdf } from "./extractPdfText";

const PDF_CHUNK_SIZE = 200;

export const splitPdf = async (file: File) => {
  const pdfChunks: File[] = [];
  const arrayBuffer = await file.arrayBuffer();
  const originalPdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });
  const totalPages = originalPdf.getPageCount();
  console.log({ totalPages });
  let startPage = 0;
  while (startPage < totalPages) {
    const newPdf = await PDFDocument.create();
    const endPage = Math.min(startPage + PDF_CHUNK_SIZE - 1, totalPages - 1);
    console.log("Processing page range", { startPage, endPage });
    const pageIndices = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    const chunk = await newPdf.copyPages(originalPdf, pageIndices);
    chunk.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();

    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const pdfFile = new File(
      [pdfBlob],
      `${file.name}-${startPage}-${endPage}.pdf`,
      {
        type: "application/pdf",
      }
    );

    const text = await extractTextFromPdf(pdfFile);
    console.log("Text", text);

    pdfChunks.push(pdfFile);
    startPage += PDF_CHUNK_SIZE;
  }
  return pdfChunks;
};
