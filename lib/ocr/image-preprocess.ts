/**
 * Image preprocessing utilities for OCR
 * Helps improve OCR accuracy by enhancing image quality
 */

/**
 * Preprocess image data URL for better OCR results
 * @param dataUrl - Base64 data URL of the image
 * @returns Processed image data URL
 */
export async function preprocessImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Set canvas size (resize if too large for better performance)
      const maxWidth = 2000;
      const maxHeight = 2000;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Enhance contrast and convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Enhance contrast (increase difference between light and dark)
        const contrast = 1.5; // Adjust contrast level
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const enhanced = factor * (gray - 128) + 128;

        // Clamp values
        const final = Math.max(0, Math.min(255, enhanced));

        data[i] = final; // R
        data[i + 1] = final; // G
        data[i + 2] = final; // B
        // Alpha stays the same
      }

      // Put processed image data back
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL
      const processedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      resolve(processedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = dataUrl;
  });
}

/**
 * Convert File to data URL
 * @param file - File object
 * @returns Data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

