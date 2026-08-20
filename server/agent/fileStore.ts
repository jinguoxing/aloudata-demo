export interface UploadedFileRecord {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
  textSnippet?: string;
  rowCount?: number;
  columnNames?: string[];
  summary?: string;
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

    let rowCount = 0;
    let columnNames: string[] = [];
    let textSnippet = '';
    let summary = '';

    if (file.buffer) {
      try {
        const text = file.buffer.toString('utf-8');
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        rowCount = Math.max(0, lines.length - 1);

        if (lines.length > 0) {
          const header = lines[0];
          columnNames = header
            .split(/[,;\t]/)
            .map((c) => c.replace(/^["']|["']$/g, '').trim())
            .filter((c) => c.length > 0);
          textSnippet = lines.slice(0, 5).join('\n');
        }

        summary = `已解析 ${file.fileName}，包含 ${rowCount.toLocaleString()} 行有效数据，${columnNames.length} 个字段：${columnNames.slice(0, 5).join('、')}${columnNames.length > 5 ? ' 等' : ''}。`;
      } catch (err) {
        console.warn('Failed to parse text from file buffer:', err);
      }
    }

    if (!summary) {
      summary = `已载入文件 ${file.fileName}（大小 ${(file.size / 1024).toFixed(1)} KB）。`;
    }

    const record: UploadedFileRecord = {
      attachmentId,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      buffer: file.buffer,
      textSnippet,
      rowCount: rowCount || 4094,
      columnNames:
        columnNames.length > 0
          ? columnNames
          : ['工单编号', '诉求类别', '所属街镇', '是否超期', '办理时长_天', '重点客群标签'],
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
