import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { splitPdf } from "./util/splitPdf";

const PdfSplitter = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfChunks, setPdfChunks] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleSplitPdf = async (file: File) => {
    setProcessing(true);
    const chunks = await splitPdf(file);
    setPdfChunks(chunks);
    setProcessing(false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      handleSplitPdf(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h1>PDF Splitter</h1>

      <button onClick={handleButtonClick} disabled={processing}>
        {processing ? "Processing..." : "Upload PDF"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      {pdfFile && (
        <div>
          <p>File: {pdfFile.name}</p>
          <p>Size: {pdfFile.size} bytes</p>
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

export default PdfSplitter;
