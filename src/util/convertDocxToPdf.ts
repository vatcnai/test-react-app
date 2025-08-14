import mammoth from "mammoth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const convertDocxToPdf = async (docxFile: File): Promise<File> => {
  try {
    // Extract HTML with images and formatting from DOCX file
    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    if (!html.trim()) {
      throw new Error("No content found in the DOCX file");
    }

    // Create a temporary div element to render HTML
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "794px"; // A4 width at 96 DPI
    tempDiv.style.padding = "40px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.lineHeight = "1.6";
    tempDiv.style.color = "#333";

    // Add CSS for tables and images
    const style = document.createElement("style");
    style.textContent = `
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      }
      table, th, td {
        border: 1px solid #ddd;
      }
      th, td {
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px 0;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 30px;
        margin-bottom: 15px;
      }
      p {
        margin: 10px 0;
      }
      ul, ol {
        margin: 15px 0;
        padding-left: 30px;
      }
    `;

    tempDiv.innerHTML = html;
    document.head.appendChild(style);
    document.body.appendChild(tempDiv);

    try {
      // Wait for images to load
      const images = tempDiv.querySelectorAll("img");
      if (images.length > 0) {
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve(); // Continue even if image fails to load
                  // Timeout after 10 seconds
                  setTimeout(() => resolve(), 10000);
                }
              })
          )
        );
      }

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        useCORS: true,
        allowTaint: true,
        background: "#ffffff",
        width: tempDiv.offsetWidth,
        height: tempDiv.offsetHeight,
      });

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add image to PDF (split into pages if necessary)
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Get PDF as blob
      const pdfBlob = pdf.output("blob");
      const originalName = docxFile.name.replace(/\.docx?$/i, "");
      const pdfFile = new File([pdfBlob], `${originalName}.pdf`, {
        type: "application/pdf",
      });

      return pdfFile;
    } finally {
      // Clean up
      document.body.removeChild(tempDiv);
      document.head.removeChild(style);
    }
  } catch (error) {
    console.error("Error converting DOCX to PDF:", error);
    throw new Error(
      `Failed to convert DOCX to PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
