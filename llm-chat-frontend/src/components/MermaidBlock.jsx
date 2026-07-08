import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Code, BarChart3, RotateCcw, ZoomIn, ZoomOut, Download } from "lucide-react";

let mermaidInitialized = false;
let mermaidIdCounter = 0;

/**
 * Quotes an unquoted Mermaid node label inside its bracket.
 * Handles: id[label], id{label}, id(label)
 * Only triggers when bracket IMMEDIATELY follows the identifier (no space),
 * so it doesn't corrupt edge-label text like `-- No -->`.
 * Uses depth-tracking to correctly handle nested brackets
 * (e.g. H{arr[mid] == Target?} or G[Calculate (low+high)/2]).
 */
const quoteNodeLabels = (line) => {
  let result = "";
  let i = 0;
  const OPEN_BRACKETS = new Set(["[", "{", "("]);

  while (i < line.length) {
    const ch = line[i];

    // Try to match a potential node identifier: starts with letter or _
    if (/[A-Za-z_]/.test(ch)) {
      const idStart = i;
      // Read the full identifier
      while (i < line.length && /[A-Za-z0-9_]/.test(line[i])) i++;
      const id = line.slice(idStart, i);

      // A node definition has the bracket IMMEDIATELY after the id (no space).
      // Edge-label words like "No" in "-- No -->" are followed by a space/dash, not a bracket.
      if (i < line.length && OPEN_BRACKETS.has(line[i])) {
        const open = line[i];
        const close = open === "[" ? "]" : open === "{" ? "}" : ")";
        i++; // consume opening bracket

        // Read the label content, tracking depth for the SAME bracket type.
        let label = "";
        let depth = 1;
        while (i < line.length && depth > 0) {
          if (line[i] === open) {
            depth++;
            label += line[i];
          } else if (line[i] === close) {
            depth--;
            if (depth > 0) label += line[i]; // inner close bracket → part of label
          } else {
            label += line[i];
          }
          i++;
        }
        // i now points past the final close bracket

        // Only re-wrap if NOT already fully quoted
        if (label.startsWith('"') && label.endsWith('"')) {
          result += id + open + label + close;
        } else {
          // Escape any stray quotes inside the label then wrap
          const escaped = label.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
          result += id + open + '"' + escaped + '"' + close;
        }
      } else {
        // Plain word (keyword, arrow segment, etc.) — copy verbatim
        result += id;
      }
    } else {
      result += ch;
      i++;
    }
  }

  return result;
};

const sanitizeMermaidCode = (code) => {
  if (!code) return "";
  let sanitized = code.trim();

  // 1. Remove markdown wrapper syntax if present inside the code block itself
  if (sanitized.startsWith("```")) {
    sanitized = sanitized.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/\n```$/, "");
  }

  // 2. Remove "mermaid" label from the start
  sanitized = sanitized.replace(/^mermaid\s*[\n\r]/i, "");

  // 3. Normalize direction declarations (e.g. td → TD, lr → LR)
  sanitized = sanitized.replace(/^(flowchart|graph)\s+([a-zA-Z2-9]+)/i, (m, type, dir) => {
    return `${type.toLowerCase()} ${dir.toUpperCase()}`;
  });

  // 4. Fix invalid arrow formats
  if (/^(flowchart|graph)\s+/i.test(sanitized)) {
    sanitized = sanitized.replace(/\s+---\|>\s+/g, " --> ");
    sanitized = sanitized.replace(/\s+---\|\s+/g, " --> ");
    // Replace bare -> but not already --> (negative lookbehind/ahead)
    sanitized = sanitized.replace(/([^-])->([^>])/g, "$1-->$2");
  }

  // 5. Quote unquoted node labels — line-by-line, character-level parser
  //    Only applies to flowchart/graph diagrams.
  if (/^(flowchart|graph)\s+/i.test(sanitized)) {
    const lines = sanitized.split("\n");
    sanitized = lines
      .map((line, idx) => (idx === 0 ? line : quoteNodeLabels(line)))
      .join("\n");
  }

  // 6. xychart-beta: strip invalid --> "label" suffixes after bar/line data.
  //    LLMs sometimes generate: bar [1, 2, 3] --> "Series Name"
  //    The correct xychart-beta syntax has NO labels after data arrays.
  if (/^xychart-beta/i.test(sanitized)) {
    sanitized = sanitized
      // Remove: --> "anything" or -> "anything" after the closing ]
      .replace(/((?:bar|line)\s*\[[^\]]*\])\s*-+>?\s*"[^"]*"/gi, "$1")
      // Remove bare --> or -> leftovers on bar/line lines
      .replace(/((?:bar|line)\s*\[[^\]]*\])\s*-+>?\s*/gi, "$1");
  }

  return sanitized.trim();
};


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
          fontSize: "16px",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }
      : {
          primaryColor: "#245955",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#1d4643",
          lineColor: "#555",
          secondaryColor: "#E7F3F1",
          tertiaryColor: "#f5f5f5",
          fontSize: "16px",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        },
    flowchart: { htmlLabels: true, curve: "basis" },
    sequence: { actorMargin: 50, messageMargin: 40 },
    securityLevel: "loose",
    suppressErrorRendering: true,
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

    const cleanup = () => {
      const el = document.getElementById(idRef.current) || document.getElementById(`d${idRef.current}`);
      if (el) el.remove();
      document.querySelectorAll(".mermaidTooltip, [id^='d-mermaid-']").forEach(e => e.remove());
    };

    const render = async () => {
      try {
        initMermaid(isDark);
        const sanitizedCode = sanitizeMermaidCode(code);
        console.debug("[Mermaid] rendering:\n", sanitizedCode);
        const { svg } = await mermaid.render(idRef.current, sanitizedCode);
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (firstErr) {
        console.warn("[Mermaid] first render failed, trying aggressive fallback:", firstErr.message);
        cleanup();
        // Aggressive fallback: strip ALL node labels down to safe plain-text only
        try {
          const raw = sanitizeMermaidCode(code);
          // Strip any remaining unquoted labels by removing special chars inside brackets
          const fallback = raw
            .replace(/\["([^"\n]*)"\]/g, (_, l) => `["${l.replace(/[<>=!?]/g, "")}"]`)
            .replace(/\{"([^"\n]*)"\}/g, (_, l) => `{"${l.replace(/[<>=!?\[\]]/g, "")}"}`)
            .replace(/;/g, "") // remove trailing semicolons
            .trim();
          idRef.current = `mermaid-${++mermaidIdCounter}-${Date.now()}`;
          const { svg } = await mermaid.render(idRef.current, fallback);
          if (!cancelled) {
            setSvgContent(svg);
            setError(null);
          }
        } catch (secondErr) {
          if (!cancelled) {
            console.error("[Mermaid] both render attempts failed:", secondErr);
            setError(sanitizeMermaidCode(code));
            cleanup();
          }
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
          <div className="flex flex-col gap-2 py-2">
            <p className="text-[11px] text-amber-500 font-semibold">⚠️ Diagram syntax error — showing sanitized source:</p>
            <pre className="text-[11px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap bg-[#F5F7F7] dark:bg-[#1A1D21] rounded-lg p-3 overflow-auto">{error}</pre>
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
