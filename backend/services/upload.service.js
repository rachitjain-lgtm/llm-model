const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const ExcelJS = require('exceljs');

const parsePDF = async (buffer) => {
  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};

const parseDocx = async (buffer) => {
  try {
    const data = await mammoth.extractRawText({ buffer });
    return data.value || '';
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse Word file');
  }
};

const parseXlsx = async (buffer) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    let text = '';
    workbook.eachSheet((sheet) => {
      text += `Sheet: ${sheet.name}\n`;
      sheet.eachRow((row) => {
        const rowValues = [];
        row.eachCell((cell) => {
          rowValues.push(cell.text || cell.value);
        });
        text += rowValues.join(', ') + '\n';
      });
      text += '\n';
    });
    return text.trim();
  } catch (error) {
    console.error('Error parsing XLSX:', error);
    throw new Error('Failed to parse Excel file');
  }
};

const parseFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const { originalname, buffer, mimetype } = file;
  const extension = originalname.split('.').pop().toLowerCase();

  if (mimetype === 'application/pdf' || extension === 'pdf') {
    return parsePDF(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    return parseDocx(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    extension === 'xlsx'
  ) {
    return parseXlsx(buffer);
  } else if (
    mimetype.startsWith('text/') ||
    ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 'csv', 'html', 'css', 'sql', 'xml', 'yaml', 'yml'].includes(extension)
  ) {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: ${extension}`);
  }
};

module.exports = {
  parseFile,
};
