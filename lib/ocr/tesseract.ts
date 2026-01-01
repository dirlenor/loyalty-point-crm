import { createWorker } from "tesseract.js";

/**
 * Initialize Tesseract worker for OCR
 */
let worker: any = null;

export async function initTesseract() {
  if (!worker) {
    worker = await createWorker("tha+eng", 1, {
      logger: (m) => {
        // Optional: log progress
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
  }
  return worker;
}

/**
 * Perform OCR on image
 * @param imageDataUrl - Base64 data URL or image path
 * @returns OCR result with text and confidence
 */
export async function performOCR(
  imageDataUrl: string
): Promise<{ text: string; confidence: number; data: any }> {
  const worker = await initTesseract();

  try {
    const {
      data: { text, confidence, words },
    } = await worker.recognize(imageDataUrl);

    return {
      text: text.trim(),
      confidence: confidence || 0,
      data: {
        words,
        text,
      },
    };
  } catch (error: any) {
    throw new Error(`OCR failed: ${error.message}`);
  }
}

/**
 * Terminate Tesseract worker (cleanup)
 */
export async function terminateTesseract() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

