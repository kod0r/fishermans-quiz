/**
 * Escapes a single CSV field per RFC 4180.
 * Quotes the field only if it contains ", newline, or comma.
 */
export function escapeCsvField(value: unknown): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Builds a CSV string from rows of string values.
 * Uses CRLF line endings for Excel compatibility.
 */
export function buildCsv(rows: string[][]): string {
  return rows.map(r => r.map(escapeCsvField).join(',')).join('\r\n');
}
