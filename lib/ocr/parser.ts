/**
 * Parse OCR text to extract structured data from transfer slips
 */

export interface ParsedSlipData {
  amount: number | null;
  date: string | null;
  referenceNumber: string | null;
  confidence: number;
}

/**
 * Extract amount from OCR text
 * Looks for patterns like "1,000.00", "1000", "1,000 บาท", etc.
 */
function extractAmount(text: string): number | null {
  // Remove common words and clean text
  const cleaned = text
    .replace(/บาท/g, "")
    .replace(/THB/g, "")
    .replace(/฿/g, "")
    .replace(/\s+/g, " ");

  // Pattern 1: "1,000.00" or "1,000" or "1000"
  const amountPatterns = [
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // 1,000.00 or 1,000
    /(\d+\.\d{2})/g, // 1000.00
    /(\d{4,})/g, // Large numbers (likely amounts)
  ];

  const amounts: number[] = [];

  for (const pattern of amountPatterns) {
    const matches = cleaned.match(pattern);
    if (matches) {
      for (const match of matches) {
        const num = parseFloat(match.replace(/,/g, ""));
        // Filter reasonable amounts (100 - 1,000,000)
        if (num >= 100 && num <= 1000000) {
          amounts.push(num);
        }
      }
    }
  }

  // Return the largest amount found (most likely the transfer amount)
  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  return null;
}

/**
 * Extract date from OCR text
 * Looks for Thai date patterns: "31/12/2024", "31 ธ.ค. 2024", etc.
 */
function extractDate(text: string): string | null {
  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
  const datePattern1 = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const match1 = text.match(datePattern1);
  if (match1) {
    return match1[1];
  }

  // Pattern 2: DD MM YYYY
  const datePattern2 = /(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})/;
  const match2 = text.match(datePattern2);
  if (match2) {
    return `${match2[1]}/${match2[2]}/${match2[3]}`;
  }

  // Pattern 3: Thai date format "31 ธ.ค. 2024"
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  for (let i = 0; i < thaiMonths.length; i++) {
    const pattern = new RegExp(
      `(\\d{1,2})\\s+${thaiMonths[i]}\\s+(\\d{2,4})`
    );
    const match = text.match(pattern);
    if (match) {
      const month = String(i + 1).padStart(2, "0");
      return `${match[1]}/${month}/${match[2]}`;
    }
  }

  return null;
}

/**
 * Extract reference number from OCR text
 * Looks for patterns like "Ref: ABC123", "เลขที่: 123456", etc.
 */
function extractReferenceNumber(text: string): string | null {
  // Common patterns for reference numbers
  const patterns = [
    /(?:เลขที่|Ref|Reference|Ref\.?)\s*:?\s*([A-Z0-9]{6,20})/i,
    /([A-Z]{2,4}\d{6,12})/,
    /(?:เลขที่อ้างอิง|Reference Number)\s*:?\s*([A-Z0-9]{6,20})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Parse OCR text to extract slip data
 * @param ocrText - Raw text from OCR
 * @param confidence - OCR confidence score
 * @returns Parsed slip data
 */
export function parseSlipData(
  ocrText: string,
  confidence: number = 0
): ParsedSlipData {
  const normalizedText = ocrText.replace(/\n/g, " ").replace(/\s+/g, " ");

  return {
    amount: extractAmount(normalizedText),
    date: extractDate(normalizedText),
    referenceNumber: extractReferenceNumber(normalizedText),
    confidence,
  };
}

