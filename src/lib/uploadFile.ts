import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper function to handle file upload
export async function uploadFile(file: File | null): Promise<string | undefined> {
  if (!file || typeof file === "string") return undefined;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  
  // Checking ENV variable or setting to determine upload strategy
  const uploadProvider = process.env.UPLOAD_PROVIDER || "local";
  
  if (uploadProvider === "cloud") {
    // Implement cloud upload logic here (e.g., Cloudinary, S3)
    // return cloudUrl;
    console.warn("Cloud upload is enabled but not implemented. Falling back to local upload.");
    // Fallback to local or throw error
  }
  
  // Default to Local storage
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}
