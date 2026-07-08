import { useState } from "react";
import { ImageIcon, Code, Download, ZoomIn, ZoomOut, RotateCcw, Pencil } from "lucide-react";

export default function SvgBlock({ code, onEditInCanvas }) {
  const [showSource, setShowSource] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Clean up the SVG — strip code fences if present
  let svgCode = (code || "").trim()
    .replace(/^```svg\n?/, "")
    .replace(/^```xml\n?/, "")
    .replace(/```$/, "")
    .trim();

  // Ensure xmlns is present on the root <svg> tag for correct browser parsing and rendering
  if (svgCode.toLowerCase().includes("<svg") && !/xmlns\s*=\s*/i.test(svgCode)) {
    svgCode = svgCode.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const img = new Image();
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Use SVG width/height or default to standard size
      canvas.width = img.naturalWidth * 2 || 1200;
      canvas.height = img.naturalHeight * 2 || 1200;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = "generated.png";
          a.click();
          URL.revokeObjectURL(pngUrl);
        }
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    img.onerror = (err) => {
      console.error("Failed to render PNG from SVG blob:", err);
      alert("PNG generation failed. Try opening the SVG file and saving it manually.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleEditInCanvas = () => {
    if (!onEditInCanvas) return;
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    onEditInCanvas(url);
  };

  const isValidSvg = svgCode.toLowerCase().includes("<svg");

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D3136] shadow-md bg-white dark:bg-[#16191B]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F5F7F7] dark:bg-[#1A1D21] border-b border-[#E5E5E5] dark:border-[#2D3136]">
        <div className="flex items-center gap-2">
          <ImageIcon size={13} className="text-[#245955] dark:text-[#347d78]" />
          <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] font-mono">svg graphic</span>
        </div>
        <div className="flex items-center gap-1">
          {!showSource && isValidSvg && (
            <>
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors" title="Zoom out"><ZoomOut size={12} /></button>
              <span className="text-[10px] text-[#737373] dark:text-[#94A3B8] w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(4, z + 0.2))} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors" title="Zoom in"><ZoomIn size={12} /></button>
              <button onClick={() => setZoom(1)} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors" title="Reset zoom"><RotateCcw size={11} /></button>
              <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
              <button onClick={handleDownload} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1" title="Download SVG"><Download size={11} /><span>SVG</span></button>
              <button onClick={handleDownloadPng} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1" title="Download PNG"><Download size={11} /><span>PNG</span></button>
              {onEditInCanvas && (
                <>
                  <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
                  <button onClick={handleEditInCanvas} className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#245955] dark:text-[#347d78] transition-colors text-[10px] flex items-center gap-1 font-semibold" title="Edit in Canvas"><Pencil size={11} /><span>Edit</span></button>
                </>
              )}
              <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
            </>
          )}
          <button
            onClick={() => setShowSource((s) => !s)}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 ${showSource ? "text-[#245955] dark:text-[#347d78] bg-[#E7F3F1] dark:bg-[#183331]" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
          >
            <Code size={11} />
            <span>{showSource ? "Render" : "Source"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto" style={{ maxHeight: "480px" }}>
        {showSource ? (
          <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap">{svgCode}</pre>
        ) : !isValidSvg ? (
          <div className="text-rose-500 text-xs py-4">⚠️ Invalid SVG content</div>
        ) : (
          <div
            className="flex justify-center items-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease" }}
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        )}
      </div>
    </div>
  );
}
