import { useMemo, useState } from "react";
import { GitBranch, Code, Download } from "lucide-react";

const defaultNodeStyle = {
  background: "#245955",
  color: "#fff",
  border: "1.5px solid #1d4643",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "Inter, sans-serif",
  padding: "8px 14px",
};

function parseFlowData(code) {
  try {
    const cleaned = code.trim().replace(/^```(json|reactflow)?\n?/, "").replace(/```$/, "");
    const data = JSON.parse(cleaned);
    const nodes = (data.nodes || []).map((node) => ({ ...node, style: node.style || defaultNodeStyle }));
    const edges = data.edges || [];
    return { nodes, edges };
  } catch {
    return { nodes: [], edges: [] };
  }
}

export default function ReactFlowBlock({ code }) {
  const { nodes, edges } = useMemo(() => parseFlowData(code), [code]);
  const [showSource, setShowSource] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([code || ""], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowchart.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D3136] shadow-md bg-white dark:bg-[#16191B]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#F5F7F7] dark:bg-[#1A1D21] border-b border-[#E5E5E5] dark:border-[#2D3136]">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-[#245955] dark:text-[#347d78]" />
          <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] font-mono">interactive flowchart</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
            title="Download JSON"
          >
            <Download size={11} />
            <span>JSON</span>
          </button>
          <button
            onClick={() => setShowSource((s) => !s)}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 ${showSource ? "text-[#245955] dark:text-[#347d78] bg-[#E7F3F1] dark:bg-[#183331]" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
          >
            <Code size={11} />
            <span>{showSource ? "Chart" : "Source"}</span>
          </button>
        </div>
      </div>

      {showSource ? (
        <div className="p-4 overflow-auto max-h-[400px]">
          <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap">{code}</pre>
        </div>
      ) : (
        <div className="p-4 min-h-[220px] text-xs text-[#737373] dark:text-[#94A3B8]">
          <div className="mb-2 font-semibold text-[#171717] dark:text-[#eceff1]">Flow preview unavailable in this build.</div>
          <div className="mb-3">This view still accepts JSON with nodes and edges, and you can switch to Source to inspect or copy it.</div>
          <div className="space-y-2">
            <div><span className="font-semibold">Nodes:</span> {nodes.length}</div>
            <div><span className="font-semibold">Edges:</span> {edges.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}