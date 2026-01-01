import { createServerClient } from "./server";

/**
 * Upload slip image to Supabase Storage
 * @param file - File object or Buffer
 * @param customerId - Customer ID
 * @returns Public URL of uploaded image
 */
export async function uploadSlipImage(
  file: File | Buffer,
  customerId: string
): Promise<{ url: string; path: string }> {
  const supabase = createServerClient();

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = file instanceof File ? file.name.split(".").pop() : "jpg";
  const fileName = `${customerId}/${timestamp}-${randomStr}.${extension}`;
  const filePath = `slip-images/${fileName}`;

  // Convert File to Buffer if needed
  let fileBuffer: Buffer;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  } else {
    fileBuffer = file;
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("slip-images")
    .upload(filePath, fileBuffer, {
      contentType: file instanceof File ? file.type : "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("slip-images").getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Delete slip image from Supabase Storage
 * @param filePath - Path to file in storage
 */
export async function deleteSlipImage(filePath: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.storage
    .from("slip-images")
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get public URL for slip image
 * @param filePath - Path to file in storage
 * @returns Public URL
 */
export function getSlipImageUrl(filePath: string): string {
  const supabase = createServerClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("slip-images").getPublicUrl(filePath);
  return publicUrl;
}

