export type ParseStatus = 'SUCCESS' | 'EMPTY' | 'FAILED' | 'UNSUPPORTED';

export interface UploadedFileRecord {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
  textSnippet?: string;
  rowCount: number;
  columnNames: string[];
  status: ParseStatus;
  errorMessage?: string;
  summary: string;
  uploadedAt: string;
}

class FileStore {
  private files = new Map<string, UploadedFileRecord>();

  saveFile(file: {
    fileName: string;
    mimeType: string;
    size: number;
    buffer?: Buffer;
  }): UploadedFileRecord {
    const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lowerName = file.fileName.toLowerCase();

    // 1. Check for unsupported file formats (e.g. XLSX / XLS)
    if (
      lowerName.endsWith('.xlsx') ||
      lowerName.endsWith('.xls') ||
      file.mimeType.includes('spreadsheet') ||
      file.mimeType.includes('excel')
    ) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames: [],
        status: 'UNSUPPORTED',
        errorMessage: '当前系统仅支持 CSV / TXT 纯文本格式文件，暂不支持 .xlsx / .xls 格式。请将表格另存为 .csv 文件后重新上传。',
        summary: `格式不支持：${file.fileName} 为 Excel 文件，请转换为 CSV 格式。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    // 2. Check for empty buffer / 0 size
    if (!file.buffer || file.buffer.length === 0 || file.size === 0) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames: [],
        status: 'EMPTY',
        errorMessage: '上传的文件内容为空（0 字节），无法提取有效工单数据。',
        summary: `解析失败：文件 ${file.fileName} 为空。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    // 3. Parse CSV / TXT text
    let text = '';
    try {
      text = file.buffer.toString('utf-8');
    } catch {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames: [],
        status: 'FAILED',
        errorMessage: '文件编码格式异常，无法以 UTF-8 文本解析。',
        summary: `解析失败：无法解码文件 ${file.fileName}。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // If no non-empty lines found
    if (lines.length === 0) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames: [],
        status: 'EMPTY',
        errorMessage: '上传的文件无有效文本行（全部为空白行），无法进行数据融合分析。',
        summary: `解析失败：文件 ${file.fileName} 为空内容。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    // Header line
    const headerLine = lines[0];
    const columnNames = headerLine
      .split(/[,;\t]/)
      .map((c) => c.replace(/^["']|["']$/g, '').trim())
      .filter((c) => c.length > 0);

    if (columnNames.length === 0) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames: [],
        status: 'EMPTY',
        errorMessage: '文件表头解析失败，未识别到有效的列名。',
        summary: `解析失败：文件 ${file.fileName} 表头无效。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    // Exact data rows count
    const rowCount = lines.length - 1;
    if (rowCount <= 0) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount: 0,
        columnNames,
        status: 'EMPTY',
        errorMessage: '文件仅包含表头，有效数据行数为 0，无法进行数据融合分析。',
        summary: `解析失败：文件 ${file.fileName} 缺少数据行（0 行）。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    // 4. Validate presence of Case ID / Record ID column
    const caseIdPattern = /(?:case_?id|工单|工单编号|工单标识|工单号|诉求编号|record_?id|ticket_?id|service_?id|^id$)/i;
    const hasCaseIdColumn = columnNames.some((col) => caseIdPattern.test(col));

    if (!hasCaseIdColumn) {
      const record: UploadedFileRecord = {
        attachmentId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
        rowCount,
        columnNames,
        status: 'FAILED',
        errorMessage: `文件表头 [${columnNames.join(', ')}] 中未识别到工单唯一标识列（如 case_id / 工单编号 / 诉求编号）。系统无法与企业正式服务工单建立主键级比对，已停止分析。请补充工单标识列后重新上传。`,
        summary: `解析失败：无法在 ${file.fileName} 中识别工单标识列。`,
        uploadedAt: new Date().toISOString(),
      };
      this.files.set(attachmentId, record);
      return record;
    }

    const textSnippet = lines.slice(0, 5).join('\n');
    const summary = `已解析 ${file.fileName}，包含 ${rowCount.toLocaleString()} 行有效数据，${columnNames.length} 个字段：${columnNames.slice(0, 5).join('、')}${columnNames.length > 5 ? ' 等' : ''}。`;

    const record: UploadedFileRecord = {
      attachmentId,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      buffer: file.buffer,
      textSnippet,
      rowCount,
      columnNames,
      status: 'SUCCESS',
      summary,
      uploadedAt: new Date().toISOString(),
    };

    this.files.set(attachmentId, record);
    return record;
  }

  getFile(attachmentId: string): UploadedFileRecord | undefined {
    return this.files.get(attachmentId);
  }
}

export const fileStore = new FileStore();
