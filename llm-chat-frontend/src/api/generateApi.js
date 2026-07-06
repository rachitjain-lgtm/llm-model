import axiosClient from "./axiosClient";

/**
 * Generate and download a PDF from content
 */
export const downloadPDF = async (content, title) => {
  const response = await axiosClient.post("/generate/pdf", { content, title }, {
    responseType: "blob"
  });
  triggerDownload(response.data, `${sanitize(title)}.pdf`, "application/pdf");
};

/**
 * Generate and download a Word document from content
 */
export const downloadDOCX = async (content, title) => {
  const response = await axiosClient.post("/generate/docx", { content, title }, {
    responseType: "blob"
  });
  triggerDownload(response.data, `${sanitize(title)}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
};

/**
 * Generate and download a PowerPoint from content
 */
export const downloadPPTX = async (content, title) => {
  const response = await axiosClient.post("/generate/pptx", { content, title }, {
    responseType: "blob"
  });
  triggerDownload(response.data, `${sanitize(title)}.pptx`, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
};

/**
 * Generate and download an Excel spreadsheet from content
 */
export const downloadXLSX = async (content, title) => {
  const response = await axiosClient.post("/generate/xlsx", { content, title }, {
    responseType: "blob"
  });
  triggerDownload(response.data, `${sanitize(title)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
};

/**
 * Generate an AI image using Google Gemini
 * Returns an object: { imageUrl, isSvg, svgContent }
 * - imageUrl: a data: URL (PNG) or blob URL (SVG) for direct use in <img src>
 * - isSvg: true if the result is vector SVG (renders in SvgBlock)
 * - svgContent: raw SVG string (only when isSvg=true)
 */
export const generateImage = async (prompt) => {
  const response = await axiosClient.post("/generate/image", { prompt });
  const { imageBase64, svgContent, mimeType } = response.data;

  if (imageBase64) {
    // Raster image from Gemini image model — return as data URL
    return {
      imageUrl: `data:${mimeType || "image/png"};base64,${imageBase64}`,
      isSvg: false,
    };
  }

  if (svgContent) {
    // SVG illustration from Gemini text — return as blob URL + raw SVG
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    return {
      imageUrl: URL.createObjectURL(blob),
      isSvg: true,
      svgContent,
    };
  }

  throw new Error("No image or SVG returned from server");
};

/**
 * Sanitize filename
 */
const sanitize = (name) => (name || "AI_Studio_Export").replace(/[^a-zA-Z0-9_\- ]/g, "").substring(0, 60);

/**
 * Trigger a file download in the browser
 */
const triggerDownload = (blob, filename, mimeType) => {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateApi = {
  downloadPDF,
  downloadDOCX,
  downloadPPTX,
  downloadXLSX,
  generateImage
};
