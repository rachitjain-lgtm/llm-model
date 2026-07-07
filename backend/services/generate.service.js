const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun } = require('docx');
const PptxGenJS = require('pptxgenjs');
const ExcelJS = require('exceljs');
const { GoogleGenAI } = require('@google/genai');

const sanitizeMermaidCode = (code) => {
  if (!code) return "";
  let sanitized = code.trim();

  // 1. Remove markdown wrapper syntax if present inside the code block itself
  if (sanitized.startsWith("```")) {
    sanitized = sanitized.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/\n```$/, "");
  }
  
  // 2. Remove "mermaid" label from the start
  if (sanitized.startsWith("mermaid")) {
    sanitized = sanitized.replace(/^mermaid\s*[\n\r]/i, "");
  }

  // 3. Normalize direction declarations (e.g. td, lr, etc.)
  if (sanitized.startsWith("flowchart") || sanitized.startsWith("graph")) {
    sanitized = sanitized.replace(/^(flowchart|graph)\s+([a-z2-9]+)/i, (m, type, dir) => {
      return `${type.toLowerCase()} ${dir.toUpperCase()}`;
    });
  }

  // 4. Wrap unquoted node labels containing special characters in quotes
  sanitized = sanitized.replace(/(\b[a-zA-Z_][a-zA-Z0-9_-]*)\s*\[([^"\]\n]+)\]/g, (match, id, label) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"')) {
      return match;
    }
    return `${id}["${trimmedLabel.replace(/"/g, '\\"')}"]`;
  });

  sanitized = sanitized.replace(/(\b[a-zA-Z_][a-zA-Z0-9_-]*)\s*\(([^"\)\n]+)\)/g, (match, id, label) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"')) {
      return match;
    }
    return `${id}("${trimmedLabel.replace(/"/g, '\\"').replace(/\)/g, '')}")`;
  });

  sanitized = sanitized.replace(/(\b[a-zA-Z_][a-zA-Z0-9_-]*)\s*\{([^"\}\n]+)\}/g, (match, id, label) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"')) {
      return match;
    }
    return `${id}{"${trimmedLabel.replace(/"/g, '\\"').replace(/\}/g, '')}"}`;
  });

  // 5. Replace common invalid arrow formats in flowcharts
  if (sanitized.startsWith("flowchart") || sanitized.startsWith("graph")) {
    sanitized = sanitized.replace(/\s+->\s+/g, " --> ");
    sanitized = sanitized.replace(/\s+---\|>\s+/g, " --> ");
    sanitized = sanitized.replace(/\s+---\|\s+/g, " --> ");
  }

  return sanitized.trim();
};

/**
 * Parse markdown text into structured sections
 */
const parseMarkdownSections = (text) => {
  const lines = text.split('\n');
  const sections = [];
  let currentSection = { heading: '', content: [] };
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeBlockType = '';

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock) {
        const codeContent = codeBlockLines.join('\n');
        currentSection.content.push({
          type: codeBlockType || 'code',
          code: codeBlockType === 'mermaid' ? sanitizeMermaidCode(codeContent) : codeContent
        });
        codeBlockLines = [];
        codeBlockType = '';
      } else {
        codeBlockType = line.substring(3).trim().toLowerCase();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentSection.heading || currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: headingMatch[1].replace(/\*\*/g, ''), content: [] };
    } else if (line.trim()) {
      currentSection.content.push({
        type: 'text',
        text: line
      });
    }
  }

  if (currentSection.heading || currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  return sections;
};

/**
 * Extract tables from markdown text
 */
const extractMarkdownTables = (text) => {
  const tables = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    if (lines[i] && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i] && lines[i].includes('|')) {
        const cells = lines[i].split('|').filter(c => c.trim() && !c.trim().match(/^[-:]+$/));
        if (cells.length > 0) {
          tableLines.push(cells.map(c => c.trim()));
        }
        i++;
      }
      if (tableLines.length > 1) {
        tables.push({
          headers: tableLines[0],
          rows: tableLines.slice(1)
        });
      }
    }
    i++;
  }
  return tables;
};

/**
 * Generate PDF from markdown content
 */
const generatePDF = async (content, title = 'AI Studio Export') => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks = [];

  return new Promise(async (resolve, reject) => {
    try {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#245955').text(title, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#888888')
        .text(`Generated by AI Studio • ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E0E0E0').stroke();
      doc.moveDown(1);

      const lines = content.split('\n');
      let inCodeBlock = false;
      let codeBlockLines = [];
      let codeBlockType = '';

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];

        if (line.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (!inCodeBlock) {
            const codeContent = codeBlockLines.join('\n');
            if (codeBlockType === 'mermaid') {
              try {
                const base64 = Buffer.from(sanitizeMermaidCode(codeContent).trim()).toString('base64');
                const url = `https://mermaid.ink/img/${base64}`;
                const res = await fetch(url);
                if (res.ok) {
                  const buffer = await res.arrayBuffer();
                  doc.moveDown(0.5);
                  doc.image(Buffer.from(buffer), { fit: [450, 300], align: 'center' });
                  doc.moveDown(0.5);
                } else {
                  doc.fontSize(9).font('Courier').fillColor('#555555').text(`[Mermaid Diagram: ${codeContent.trim()}]`);
                }
              } catch (err) {
                console.error("Failed to render Mermaid in PDF:", err);
                doc.fontSize(9).font('Courier').fillColor('#555555').text(`[Mermaid Diagram: ${codeContent.trim()}]`);
              }
            } else {
              doc.fontSize(9).font('Courier').fillColor('#1e1e1e').text(codeContent);
            }
            codeBlockLines = [];
            codeBlockType = '';
          } else {
            codeBlockType = line.substring(3).trim().toLowerCase();
            codeBlockLines = [];
            doc.moveDown(0.3);
          }
          continue;
        }

        if (inCodeBlock) {
          codeBlockLines.push(line);
          continue;
        }

        // Headings
        if (line.startsWith('### ')) {
          doc.moveDown(0.5);
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#333333')
            .text(line.replace('### ', '').replace(/\*\*/g, ''));
          doc.moveDown(0.3);
        } else if (line.startsWith('## ')) {
          doc.moveDown(0.5);
          doc.fontSize(15).font('Helvetica-Bold').fillColor('#245955')
            .text(line.replace('## ', '').replace(/\*\*/g, ''));
          doc.moveDown(0.3);
        } else if (line.startsWith('# ')) {
          doc.moveDown(0.5);
          doc.fontSize(18).font('Helvetica-Bold').fillColor('#245955')
            .text(line.replace('# ', '').replace(/\*\*/g, ''));
          doc.moveDown(0.3);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(`  •  ${line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '')}`, { indent: 15 });
        } else if (line.match(/^\d+\.\s/)) {
          doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(line.replace(/\*\*/g, ''), { indent: 15 });
        } else if (line.trim() === '') {
          doc.moveDown(0.3);
        } else {
          doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, ''));
        }
      }

      // Footer
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E0E0E0').stroke();
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA')
        .text('Exported from AI Studio — AI can make mistakes. Check important info.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate Word document from markdown content
 */
const generateDOCX = async (content, title = 'AI Studio Export') => {
  const children = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 36, color: '245955', font: 'Calibri' })],
    heading: HeadingLevel.TITLE,
    spacing: { after: 200 }
  }));

  children.push(new Paragraph({
    children: [new TextRun({
      text: `Generated by AI Studio • ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      size: 18, color: '888888', font: 'Calibri'
    })],
    spacing: { after: 400 }
  }));

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeBlockType = '';

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock) {
        const codeContent = codeBlockLines.join('\n');
        if (codeBlockType === 'mermaid') {
          try {
            const base64 = Buffer.from(sanitizeMermaidCode(codeContent).trim()).toString('base64');
            const url = `https://mermaid.ink/img/${base64}`;
            const res = await fetch(url);
            if (res.ok) {
              const buffer = await res.arrayBuffer();
              children.push(new Paragraph({
                children: [
                  new ImageRun({
                    data: Buffer.from(buffer),
                    transformation: {
                      width: 450,
                      height: 300,
                    },
                  }),
                ],
                spacing: { before: 200, after: 200 },
                alignment: AlignmentType.CENTER
              }));
            } else {
              children.push(new Paragraph({
                children: [new TextRun({ text: `[Mermaid Diagram: ${codeContent.trim()}]`, font: 'Consolas', size: 18, color: '555555' })],
                spacing: { before: 100, after: 100 }
              }));
            }
          } catch (err) {
            console.error("Failed to render Mermaid in Word:", err);
            children.push(new Paragraph({
              children: [new TextRun({ text: `[Mermaid Diagram: ${codeContent.trim()}]`, font: 'Consolas', size: 18, color: '555555' })],
              spacing: { before: 100, after: 100 }
            }));
          }
        } else {
          codeBlockLines.forEach(codeLine => {
            children.push(new Paragraph({
              children: [new TextRun({ text: codeLine, font: 'Consolas', size: 18, color: '1E1E1E' })],
              shading: { fill: 'F5F5F5' },
              spacing: { before: 40, after: 40 }
            }));
          });
        }
        codeBlockLines = [];
        codeBlockType = '';
      } else {
        codeBlockType = line.substring(3).trim().toLowerCase();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace('### ', '').replace(/\*\*/g, ''), bold: true, size: 24, color: '333333', font: 'Calibri' })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace('## ', '').replace(/\*\*/g, ''), bold: true, size: 28, color: '245955', font: 'Calibri' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 }
      }));
    } else if (line.startsWith('# ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace('# ', '').replace(/\*\*/g, ''), bold: true, size: 32, color: '245955', font: 'Calibri' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 }
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''), size: 20, font: 'Calibri' })],
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 }
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ spacing: { before: 100 } }));
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, ''), size: 20, font: 'Calibri' })],
        spacing: { before: 40, after: 40 }
      }));
    }
  }

  // Footer
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Exported from AI Studio — AI can make mistakes. Check important info.', size: 16, color: 'AAAAAA', font: 'Calibri', italics: true })],
    alignment: AlignmentType.CENTER
  }));

  const doc = new Document({
    sections: [{ children }]
  });

  return await Packer.toBuffer(doc);
};

/**
 * Generate PowerPoint from markdown content
 */
const generatePPTX = async (content, title = 'AI Studio Presentation') => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'AI Studio';

  const sections = parseMarkdownSections(content);

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { fill: '245955' };
  titleSlide.addText(title, {
    x: 0.5, y: 1.5, w: '90%', h: 1.5,
    fontSize: 36, bold: true, color: 'FFFFFF', fontFace: 'Calibri',
    align: 'center', valign: 'middle'
  });
  titleSlide.addText(`Generated by AI Studio • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, {
    x: 0.5, y: 3.5, w: '90%', h: 0.5,
    fontSize: 14, color: 'A0D0CC', fontFace: 'Calibri', align: 'center'
  });

  // Content Slides
  for (const section of sections) {
    if (!section.heading && section.content.length === 0) continue;

    const textItems = section.content.filter(item => item.type === 'text');
    const mermaidItems = section.content.filter(item => item.type === 'mermaid');

    const slide = pptx.addSlide();
    slide.background = { fill: 'FFFFFF' };

    // Accent bar
    slide.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', {
      x: 0, y: 0, w: 0.15, h: '100%', fill: { color: '245955' }
    });

    if (section.heading) {
      slide.addText(section.heading, {
        x: 0.6, y: 0.3, w: '85%', h: 0.8,
        fontSize: 26, bold: true, color: '245955', fontFace: 'Calibri'
      });
    }

    if (mermaidItems.length > 0) {
      const mermaidCode = mermaidItems[0].code;
      try {
        const base64 = Buffer.from(mermaidCode.trim()).toString('base64');
        const url = `https://mermaid.ink/img/${base64}`;
        const imageRes = await fetch(url);
        if (imageRes.ok) {
          const buffer = await imageRes.arrayBuffer();
          const imgBase64 = Buffer.from(buffer).toString('base64');
          
          slide.addImage({
            data: `image/png;base64,${imgBase64}`,
            x: 1.6, y: 1.3, w: 10.0, h: 5.0,
            sizing: { type: 'contain', w: 10.0, h: 5.0 }
          });
        }
      } catch (err) {
        console.error("Failed to render Mermaid on PPTX slide:", err);
      }

      if (textItems.length > 0) {
        const textSlide = pptx.addSlide();
        textSlide.background = { fill: 'FFFFFF' };

        textSlide.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', {
          x: 0, y: 0, w: 0.15, h: '100%', fill: { color: '245955' }
        });

        if (section.heading) {
          textSlide.addText(section.heading + " (Details)", {
            x: 0.6, y: 0.3, w: '85%', h: 0.8,
            fontSize: 26, bold: true, color: '245955', fontFace: 'Calibri'
          });
        }

        const bulletItems = textItems.map(item => {
          const cleanLine = item.text.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
          return { text: cleanLine, options: { fontSize: 16, color: '333333', fontFace: 'Calibri', bullet: true, breakLine: true } };
        });

        textSlide.addText(bulletItems, {
          x: 0.6, y: 1.3, w: '85%', h: 4.5,
          valign: 'top', paraSpaceAfter: 8
        });
      }
    } else {
      if (textItems.length > 0) {
        const bulletItems = textItems.map(item => {
          const cleanLine = item.text.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
          return { text: cleanLine, options: { fontSize: 16, color: '333333', fontFace: 'Calibri', bullet: true, breakLine: true } };
        });

        slide.addText(bulletItems, {
          x: 0.6, y: 1.3, w: '85%', h: 4.5,
          valign: 'top', paraSpaceAfter: 8
        });
      }
    }
  }

  // Thank You Slide
  const endSlide = pptx.addSlide();
  endSlide.background = { fill: '245955' };
  endSlide.addText('Thank You', {
    x: 0.5, y: 2, w: '90%', h: 1.5,
    fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });
  endSlide.addText('Generated by AI Studio', {
    x: 0.5, y: 4, w: '90%', h: 0.5,
    fontSize: 14, color: 'A0D0CC', fontFace: 'Calibri', align: 'center'
  });

  return await pptx.write({ outputType: 'nodebuffer' });
};

/**
 * Generate Excel spreadsheet from content
 */
const generateXLSX = async (content, title = 'AI Studio Export') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI Studio';
  workbook.created = new Date();

  const tables = extractMarkdownTables(content);

  if (tables.length > 0) {
    // Create a sheet for each table found
    tables.forEach((table, idx) => {
      const sheet = workbook.addWorksheet(idx === 0 ? 'Data' : `Sheet ${idx + 1}`);

      // Header row
      const headerRow = sheet.addRow(table.headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF245955' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Data rows
      table.rows.forEach((row, rowIdx) => {
        const dataRow = sheet.addRow(row);
        dataRow.eachCell((cell) => {
          cell.font = { size: 10, name: 'Calibri' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFF5F5F5' : 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
        });
      });

      // Auto-fit columns
      sheet.columns.forEach((col) => {
        col.width = 20;
      });
    });
  } else {
    // No tables found — export content as text rows
    const sheet = workbook.addWorksheet('Content');
    sheet.addRow(['AI Studio Export']).font = { bold: true, size: 14, color: { argb: 'FF245955' } };
    sheet.addRow([`Generated: ${new Date().toLocaleDateString()}`]).font = { size: 9, color: { argb: 'FF888888' } };
    sheet.addRow([]);

    const lines = content.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      sheet.addRow([line.replace(/\*\*/g, '').replace(/[#*`]/g, '').trim()]);
    });

    sheet.getColumn(1).width = 100;
  }

  return await workbook.xlsx.writeBuffer();
};

/**
 * Generate AI image using Google Gemini
 * Strategy 1: Gemini native image generation (requires paid plan / image-capable model)
 * Strategy 2: Gemini generates detailed SVG art as a reliable fallback
 * Returns { imageBase64, mimeType } OR { svgContent } for frontend use
 */
const generateImage = async (prompt) => {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GOOGLE_AI_KEY is not configured. Get a free key at https://aistudio.google.com/app/apikey and add it to backend/.env');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Strategy 1: Try Gemini native image generation models
  const imageModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
  ];

  for (const modelName of imageModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return {
            imageBase64: part.inlineData.data, // base64 string
            mimeType: part.inlineData.mimeType || 'image/png',
          };
        }
      }
    } catch (err) {
      // Log but try next model
      console.warn(`[ImageGen] ${modelName} failed: ${err.message?.substring(0, 120)}`);
    }
  }

  // Strategy 2: Generate a real image using Pollinations AI
  try {
    console.log('[ImageGen] Falling back to Pollinations AI image generation...');
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&private=true&enhance=true`;
    
    const imageResponse = await fetch(imageUrl);
    if (imageResponse.ok) {
      const buffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        imageBase64: base64,
        mimeType: 'image/png'
      };
    }
  } catch (err) {
    console.warn(`[ImageGen] Pollinations AI failed: ${err.message}`);
  }

  // Strategy 3: Generate a detailed SVG illustration using Gemini text
  console.log('[ImageGen] Falling back to SVG generation via Gemini text...');

  const svgPromptText = `You are an expert SVG artist. Generate a COMPLETE, visually rich, colorful SVG image representing: "${prompt}"

Requirements:
- Output ONLY valid SVG code, starting with <svg and ending with </svg>
- Use width="600" height="600" viewBox="0 0 600 600"
- Include rich details: gradients, multiple shapes, colors, artistic elements
- Make it visually impressive and beautiful
- NO explanations, NO markdown, NO code fences — just the raw SVG code`;

  const svgResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: svgPromptText,
  });

  const svgText = svgResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Extract SVG content
  const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    return {
      svgContent: svgMatch[0],
      mimeType: 'image/svg+xml',
    };
  }

  throw new Error('Image generation failed: All Google Imagen models, Pollinations fallback, and SVG generation failed.');
};

module.exports = {
  generatePDF,
  generateDOCX,
  generatePPTX,
  generateXLSX,
  generateImage
};
