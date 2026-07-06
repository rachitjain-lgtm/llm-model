import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { GitBranch, Code, Download } from "lucide-react";

/* ─── Default node/edge styles matching the app theme ─── */
const defaultNodeStyle = {
  background: "#245955",
  color: "#fff",
  border: "1.5px solid #1d4643",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "Inter, sans-serif",
  padding: "8px 14px",
};

const defaultEdgeStyle = {
  stroke: "#245955",
  strokeWidth: 2,
};

/* ─── Parse AI-generated JSON or fallback to example ─── */
function parseFlowData(code) {
  try {
    const cleaned = code.trim().replace(/^```(json|reactflow)?\n?/, "").replace(/```$/, "");
    const data = JSON.parse(cleaned);

    // Inject styles if missing
    const nodes = (data.nodes || []).map((n) => ({
      ...n,
      style: n.style || defaultNodeStyle,
    }));

    const edges = (data.edges || []).map((e) => ({
      ...e,
      style: e.style || defaultEdgeStyle,
      markerEnd: e.markerEnd || { type: MarkerType.ArrowClosed, color: "#245955" },
      animated: e.animated ?? false,
    }));

    return { nodes, edges };
  } catch {
    // Fallback example chart when JSON is invalid
    return {
      nodes: [
        { id: "1", position: { x: 100, y: 50 }, data: { label: "Start" }, style: defaultNodeStyle },
        { id: "2", position: { x: 100, y: 160 }, data: { label: "Process" }, style: defaultNodeStyle },
        { id: "3", position: { x: 100, y: 270 }, data: { label: "End" }, style: { ...defaultNodeStyle, background: "#1d4643" } },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", style: defaultEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: "#245955" } },
        { id: "e2-3", source: "2", target: "3", style: defaultEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: "#245955" } },
      ],
    };
  }
}

export default function ReactFlowBlock({ code }) {
  const { nodes: initNodes, edges: initEdges } = useMemo(() => parseFlowData(code), [code]);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [showSource, setShowSource] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, style: defaultEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: "#245955" } }, eds)),
    [setEdges]
  );

  const handleDownload = () => {
    const element = document.querySelector(".react-flow__renderer svg");
    if (!element) return;
    const svgData = new XMLSerializer().serializeToString(element);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowchart.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D3136] shadow-md bg-white dark:bg-[#16191B]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F5F7F7] dark:bg-[#1A1D21] border-b border-[#E5E5E5] dark:border-[#2D3136]">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-[#245955] dark:text-[#347d78]" />
          <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] font-mono">interactive flowchart</span>
          <span className="text-[9px] bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] px-2 py-0.5 rounded-full font-semibold">drag · zoom · pan</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors text-[10px] flex items-center gap-1"
            title="Download SVG"
          >
            <Download size={11} />
            <span>SVG</span>
          </button>
          <div className="w-px h-4 bg-[#E5E5E5] dark:bg-[#2D3136] mx-1" />
          <button
            onClick={() => setShowSource((s) => !s)}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 ${showSource ? "text-[#245955] dark:text-[#347d78] bg-[#E7F3F1] dark:bg-[#183331]" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
          >
            <Code size={11} />
            <span>{showSource ? "Chart" : "JSON"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {showSource ? (
        <div className="p-4 overflow-auto max-h-[400px]">
          <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] leading-relaxed whitespace-pre-wrap">{code}</pre>
        </div>
      ) : (
        <div style={{ height: 380 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={4}
          >
            <Background color="#E5E5E5" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={() => "#245955"}
              maskColor="rgba(0,0,0,0.08)"
              style={{ background: "#F5F7F7", border: "1px solid #E5E5E5", borderRadius: "8px" }}
            />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
