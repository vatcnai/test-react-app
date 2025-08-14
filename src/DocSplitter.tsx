import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { splitPdf } from "./util/splitPdf";
import { convertDocxToPdf } from "./util/convertDocxToPdf";

const DocSplitter = () => {
  const [docFile, setDocFile] = useState<File | null>(null);
  const [convertedPdfFile, setConvertedPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfChunks, setPdfChunks] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleSplitDoc = async (file: File) => {
    setProcessing(true);
    setConverting(true);

    try {
      // First convert DOCX to PDF
      const pdfFile = await convertDocxToPdf(file);
      setConvertedPdfFile(pdfFile);
      setConverting(false);

      // Then split the PDF
      const chunks = await splitPdf(pdfFile);
      setPdfChunks(chunks);
    } catch (error) {
      console.error("Error processing document:", error);
      alert(
        `Error processing document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setProcessing(false);
      setConverting(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword" ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc"))
    ) {
      setDocFile(file);
      setConvertedPdfFile(null);
      setPdfChunks([]);
      handleSplitDoc(file);
    } else {
      alert("Please select a valid DOCX or DOC file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusText = () => {
    if (converting) return "Converting to PDF...";
    if (processing) return "Processing...";
    return "Upload DOCX/DOC";
  };

  return (
    <div>
      <h1>Document Splitter</h1>

      <button onClick={handleButtonClick} disabled={processing}>
        {getStatusText()}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc"
        onChange={handleFileChange}
      />

      {docFile && (
        <div>
          <p>File: {docFile.name}</p>
          <p>Size: {docFile.size} bytes</p>
        </div>
      )}

      {convertedPdfFile && (
        <div>
          <p>Converted PDF: {convertedPdfFile.name}</p>
          <p>PDF Size: {convertedPdfFile.size} bytes</p>
        </div>
      )}

      {pdfChunks.length > 0 && (
        <>
          <div>
            <p>Chunks: {pdfChunks.length}</p>
          </div>
          <div>
            {pdfChunks.map((chunk) => (
              <div key={chunk.name}>
                <a
                  href={URL.createObjectURL(chunk)}
                  download={chunk.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunk.name}
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DocSplitter;
