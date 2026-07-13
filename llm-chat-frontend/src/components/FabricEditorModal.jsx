import { useEffect, useRef, useState } from "react";
import { X, Pencil, Square, Circle, Type, Eraser, Download, Undo2, Redo2, Minus, Trash2 } from "lucide-react";

export default function FabricEditorModal({ imageUrl, onClose }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#245955");
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [fabricError, setFabricError] = useState("");

  const colors = ["#245955", "#ef4444", "#3b82f6", "#f97316", "#8b5cf6", "#eab308", "#000000", "#ffffff"];

  useEffect(() => {
    const fabric = window.fabric;

    if (!fabric) {
      setFabricError("Fabric.js is not available in this build.");
      return undefined;
    }

    if (!canvasRef.current) return undefined;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#ffffff",
      selection: true,
    });

    fabricRef.current = { canvas, fabric };

    if (imageUrl) {
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          const scale = Math.min(800 / img.width, 500 / img.height, 1);
          img.scale(scale);
          img.set({ left: (800 - img.width * scale) / 2, top: (500 - img.height * scale) / 2, selectable: true });
          canvas.add(img);
          canvas.renderAll();
          saveHistory(canvas);
        },
        { crossOrigin: "anonymous" }
      );
    } else {
      saveHistory(canvas);
    }

    setFabricLoaded(true);

    return () => canvas.dispose();
  }, [imageUrl]);

  const saveHistory = (canvas) => {
    const json = canvas.toJSON();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const setTool = (tool) => {
    setActiveTool(tool);
    if (!fabricRef.current) return;
    const { canvas, fabric } = fabricRef.current;

    canvas.isDrawingMode = false;
    canvas.selection = true;

    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else if (tool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = brushSize * 3;
    }
  };

  const addShape = (type) => {
    if (!fabricRef.current) return;
    const { canvas, fabric } = fabricRef.current;
    let shape;

    if (type === "rect") {
      shape = new fabric.Rect({ left: 200, top: 150, width: 120, height: 80, fill: "transparent", stroke: activeColor, strokeWidth: 2 });
    } else if (type === "circle") {
      shape = new fabric.Circle({ left: 250, top: 150, radius: 50, fill: "transparent", stroke: activeColor, strokeWidth: 2 });
    } else if (type === "line") {
      shape = new fabric.Line([100, 250, 400, 250], { stroke: activeColor, strokeWidth: brushSize });
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      saveHistory(canvas);
    }
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const { canvas, fabric } = fabricRef.current;
    const text = new fabric.IText("Edit this text", {
      left: 200,
      top: 200,
      fontFamily: "Inter, sans-serif",
      fill: activeColor,
      fontSize: 20,
      fontWeight: "600",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
  };

  const undo = () => {
    if (!fabricRef.current || historyIndex <= 0) return;
    const { canvas } = fabricRef.current;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    canvas.loadFromJSON(history[newIndex], () => canvas.renderAll());
  };

  const redo = () => {
    if (!fabricRef.current || historyIndex >= history.length - 1) return;
    const { canvas } = fabricRef.current;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    canvas.loadFromJSON(history[newIndex], () => canvas.renderAll());
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const { canvas } = fabricRef.current;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    saveHistory(canvas);
  };

  const downloadImage = () => {
    if (!fabricRef.current) return;
    const { canvas } = fabricRef.current;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "edited_image.png";
    a.click();
  };

  const downloadSvg = () => {
    if (!fabricRef.current) return;
    const { canvas } = fabricRef.current;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited_image.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateColor = (color) => {
    setActiveColor(color);
    if (!fabricRef.current) return;
    const { canvas } = fabricRef.current;
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      if (obj.type === "i-text" || obj.type === "text") obj.set("fill", color);
      else obj.set("stroke", color);
    });
    canvas.renderAll();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#16191B] rounded-2xl shadow-2xl border border-[#E5E5E5] dark:border-[#2D3136] overflow-hidden flex flex-col" style={{ width: "min(950px, 95vw)", maxHeight: "95vh" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#2D3136] bg-[#F5F7F7] dark:bg-[#1A1D21]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#245955] flex items-center justify-center">
              <Pencil size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat">Image Editor</span>
            <span className="text-[10px] bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] px-2 py-0.5 rounded-full font-semibold">Fabric.js Canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadSvg} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] hover:bg-[#d0ece9] transition-colors">
              <Download size={11} /> SVG
            </button>
            <button onClick={downloadImage} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#245955] text-white hover:bg-[#1d4643] transition-colors">
              <Download size={11} /> PNG
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#E5E5E5] dark:border-[#2D3136] bg-white dark:bg-[#16191B] flex-wrap">
          <div className="flex items-center gap-1 bg-[#F5F7F7] dark:bg-[#1A1D21] rounded-lg p-1">
            {[
              { id: "select", icon: null, label: "SW", title: "Select" },
              { id: "pen", icon: <Pencil size={13} />, title: "Draw" },
              { id: "eraser", icon: <Eraser size={13} />, title: "Eraser" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.title}
                className={`p-1.5 rounded-md transition-colors text-[11px] font-bold flex items-center justify-center min-w-[28px] ${activeTool === t.id ? "bg-[#245955] text-white" : "text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7F3F1] dark:hover:bg-[#23272A]"}`}
              >
                {t.icon || t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#F5F7F7] dark:bg-[#1A1D21] rounded-lg p-1">
            <button onClick={() => addShape("rect")} title="Rectangle" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"><Square size={13} /></button>
            <button onClick={() => addShape("circle")} title="Circle" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"><Circle size={13} /></button>
            <button onClick={() => addShape("line")} title="Line" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"><Minus size={13} /></button>
            <button onClick={addText} title="Add text" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] transition-colors"><Type size={13} /></button>
          </div>

          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(c)}
                style={{ background: c, border: activeColor === c ? "2px solid #245955" : "2px solid transparent" }}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                title={c}
              />
            ))}
            <input
              type="color"
              value={activeColor}
              onChange={(e) => updateColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0"
              title="Custom color"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#94A3B8]">Size:</span>
            <input
              type="range"
              min={1}
              max={30}
              value={brushSize}
              onChange={(e) => {
                setBrushSize(Number(e.target.value));
                if (fabricRef.current?.canvas?.freeDrawingBrush) fabricRef.current.canvas.freeDrawingBrush.width = Number(e.target.value);
              }}
              className="w-20 accent-[#245955]"
            />
            <span className="text-[10px] text-[#94A3B8] w-4">{brushSize}</span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button onClick={undo} disabled={historyIndex <= 0} title="Undo" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] disabled:opacity-30 transition-colors"><Undo2 size={13} /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo" className="p-1.5 rounded-md hover:bg-[#E7F3F1] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] disabled:opacity-30 transition-colors"><Redo2 size={13} /></button>
            <button onClick={deleteSelected} title="Delete selected" className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-400 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#F0F0F0] dark:bg-[#0f1214] p-4">
          {fabricError ? (
            <div className="text-sm text-[#737373] dark:text-[#94A3B8]">{fabricError}</div>
          ) : !fabricLoaded ? (
            <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
              <div className="w-5 h-5 border-2 border-[#245955] border-t-transparent rounded-full animate-spin" />
              <span>Loading editor...</span>
            </div>
          ) : (
            <canvas ref={canvasRef} className="rounded-lg shadow-lg" style={{ display: "block", maxWidth: "100%", background: "#fff" }} />
          )}
        </div>
      </div>
    </div>
  );
}