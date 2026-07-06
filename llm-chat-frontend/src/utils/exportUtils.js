export function exportChatAsMarkdown(chat) {
  if (!chat || !chat.messages) return;

  let mdContent = `# ${chat.title || "Conversation"}\n\n`;
  mdContent += `**Model**: ${chat.model || "Default"}\n`;
  mdContent += `**Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

  chat.messages.forEach((msg) => {
    const role = msg.sender === "user" ? "User" : "Assistant";
    mdContent += `### ${role} (${msg.time || ""})\n\n${msg.text}\n\n`;
  });

  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${(chat.title || "chat").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportChatAsJSON(chat) {
  if (!chat) return;

  const dataStr = JSON.stringify(chat, null, 2);
  const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${(chat.title || "chat").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
