const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const generateService = require('../services/generate.service');

/**
 * POST /api/generate/pdf
 * Generate a PDF from content
 */
router.post('/pdf', protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const pdfBuffer = await generateService.generatePDF(content, title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'AI_Studio_Export').replace(/[^a-zA-Z0-9_\- ]/g, '')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * POST /api/generate/docx
 * Generate a Word document from content
 */
router.post('/docx', protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const docxBuffer = await generateService.generateDOCX(content, title);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'AI_Studio_Export').replace(/[^a-zA-Z0-9_\- ]/g, '')}.docx"`);
    res.send(Buffer.from(docxBuffer));
  } catch (err) {
    console.error('DOCX generation error:', err);
    res.status(500).json({ error: 'Failed to generate Word document' });
  }
});

/**
 * POST /api/generate/pptx
 * Generate a PowerPoint presentation from content
 */
router.post('/pptx', protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const pptxBuffer = await generateService.generatePPTX(content, title);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'AI_Studio_Presentation').replace(/[^a-zA-Z0-9_\- ]/g, '')}.pptx"`);
    res.send(Buffer.from(pptxBuffer));
  } catch (err) {
    console.error('PPTX generation error:', err);
    res.status(500).json({ error: 'Failed to generate PowerPoint' });
  }
});

/**
 * POST /api/generate/xlsx
 * Generate an Excel spreadsheet from content
 */
router.post('/xlsx', protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const xlsxBuffer = await generateService.generateXLSX(content, title);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'AI_Studio_Data').replace(/[^a-zA-Z0-9_\- ]/g, '')}.xlsx"`);
    res.send(Buffer.from(xlsxBuffer));
  } catch (err) {
    console.error('XLSX generation error:', err);
    res.status(500).json({ error: 'Failed to generate Excel spreadsheet' });
  }
});

/**
 * POST /api/generate/image
 * Generate an AI image from a text prompt
 */
router.post('/image', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateService.generateImage(prompt);

    // Return base64 image OR SVG content as JSON for frontend rendering
    res.json({
      imageBase64: result.imageBase64 || null,
      svgContent: result.svgContent || null,
      mimeType: result.mimeType,
      prompt: prompt,
    });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
});

module.exports = router;
