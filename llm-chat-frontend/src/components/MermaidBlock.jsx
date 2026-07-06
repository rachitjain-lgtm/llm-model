import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Code, BarChart3, RotateCcw, ZoomIn, ZoomOut, Download } from "lucide-react";

let mermaidInitialized = false;
let mermaidIdCounter = 0;

function initMermaid(isDark) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    darkMode: isDark,
    themeVariables: isDark
      ? {
          primaryColor: "#245955",
          primaryTextColor: "#eceff1",
          primaryBorderColor: "#347d78",
          lineColor: "#94A3B8",
          secondaryColor: "#1d4643",
          tertiaryColor: "#16191B",
          background: "#16191B",
          mainBkg: "#1A1D21",
          nodeBorder: "#347d78",
          clusterBkg: "#1A1D21",
          titleColor: "#eceff1",
          edgeLabelBackground: "#1A1D21",
          fontSize: "14px",
        }
      : {
          primaryColor: "#245955",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#1d4643",
          lineColor: "#555",
          secondaryColor: "#E7F3F1",
          tertiaryColor: "#f5f5f5",
          fontSize: "14px",
        },
    flowchart: { htmlLabels: true, curve: "basis" },
    sequence: { actorMargin: 50, messageMargin: 40 },
    securityLevel: "loose",
  });
  mermaidInitialized = true;
}

export default function MermaidBlock({ code }) {
  const containerRef = useRef(null);
  const [showSource, setShowSource] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [svgContent, setSvgContent] = useState(null);
  const idRef = useRef(`mermaid-${++mermaidIdCounter}-${Date.now()}`);

  const isDark = document.documentElement.classList.contains("dark");

  useEffect(() => {
    if (showSource || !code) return;

    let cancelled = false;

    const render = async () => {
      try {
        initMermaid(isDark);
        const { svg } = await mermaid.render(idRef.current, code.trim());
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not render diagram. Check diagram syntax.");
          console.error("Mermaid error:", err);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [code, showSource, isDark]);

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!svgContent) return;
    const img = new Image();
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.fillStyle = isDark ? "#16191B" : "#ffffff";
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(pngBlob => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "diagram.png";
        a.click();
        URL.revokeObjectURL(pngUrl);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D3136] shadow-md bg-white dark:bg-[#16191B]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F5F7F7] dark:bg-[#1A1D21] border-b border-[#E5E5E5] dark:border-[#2D3136]">
        <div className="flex items-center gap-2">
          <BarChart3 size={13} className="text-[#245955] dark:text-[#347d78]" />
          <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] font-mono">mermaid diagram</span>
        </div>
        <div className="flex items-center gap-1">
          {!showSource && svgContent && (
            <>
              <button
                onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
                className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"
                title="Zoom out"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] text-[#737373] dark:text-[#94A3B8] w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"
                title="Zoom in"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"
                title="Reset zoom"
              >
                <RotateCcw size={11} />
              </button>
              <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
              <button
                onClick={handleDownloadSvg}
                className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
                title="Download SVG"
              >
                <Download size={11} />
                <span>SVG</span>
              </button>
              <button
                onClick={handleDownloadPng}
                className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
                title="Download PNG"
              >
                <Download size={11} />
                <span>PNG</span>
              </button>
            </>
          )}
          <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
          <button
            onClick={() => setShowSource(s => !s)}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 ${showSource ? "text-[#245955] dark:text-[#347d78] bg-[#E7F3F1] dark:bg-[#183331]" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
            title={showSource ? "Show diagram" : "Show source"}
          >
            <Code size={11} />
            <span>{showSource ? "Diagram" : "Source"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto min-h-[80px]" style={{ maxHeight: "500px" }}>
        {showSource ? (
          <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap">{code}</pre>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-500 text-xs py-4">
            <span>⚠️ {error}</span>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="flex justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease" }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center gap-2 text-[#94A3B8] text-xs py-4 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#245955] border-t-transparent rounded-full animate-spin" />
            <span>Rendering diagram…</span>
          </div>
        )}
      </div>
    </div>
  );
}
