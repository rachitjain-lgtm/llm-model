import { useState } from "react";
import { Code, BarChart3, Download } from "lucide-react";

export default function MermaidBlock({ code }) {
  const [showSource, setShowSource] = useState(false);

  const handleDownloadSvg = () => {
    const blob = new Blob([code || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    handleDownloadSvg();
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D3136] shadow-md bg-white dark:bg-[#16191B]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#F5F7F7] dark:bg-[#1A1D21] border-b border-[#E5E5E5] dark:border-[#2D3136]">
        <div className="flex items-center gap-2">
          <BarChart3 size={13} className="text-[#245955] dark:text-[#347d78]" />
          <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] font-mono">mermaid diagram</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadSvg}
            className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
            title="Download source"
          >
            <Download size={11} />
            <span>TXT</span>
          </button>
          <button
            onClick={handleDownloadPng}
            className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
            title="Download source"
          >
            <Download size={11} />
            <span>TXT</span>
          </button>
          <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
          <button
            onClick={() => setShowSource((s) => !s)}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 ${showSource ? "text-[#245955] dark:text-[#347d78] bg-[#E7F3F1] dark:bg-[#183331]" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
            title={showSource ? "Show diagram" : "Show source"}
          >
            <Code size={11} />
            <span>{showSource ? "Diagram" : "Source"}</span>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-auto min-h-[80px]" style={{ maxHeight: "500px" }}>
        {showSource ? (
          <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap">{code}</pre>
        ) : (
          <div className="flex items-center gap-2 text-[#94A3B8] text-xs py-4">
            <div className="w-4 h-4 border-2 border-[#245955] border-t-transparent rounded-full animate-spin" />
            <span>Diagram rendering is unavailable in this build. Use Source to view the text.</span>
          </div>
        )}
      </div>
    </div>
  );
}