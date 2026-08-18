import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function assertUploadIsAllowed(mimeType: string, size: number) {
  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error("Bestandstype niet toegestaan. Gebruik PDF, JPG of PNG.");
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Bestand is te groot. Maximaal 10 MB.");
  }
}

export async function storePrivateFile(file: File) {
  assertUploadIsAllowed(file.type, file.size);

  const storageDirectory = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    env.STORAGE_DIR,
  );
  await mkdir(storageDirectory, { recursive: true });

  const extension = path.extname(file.name || "").toLowerCase();
  const uniqueName = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}${extension}`;
  const storageKey = uniqueName;
  const targetPath = path.join(/* turbopackIgnore: true */ storageDirectory, storageKey);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);

  return {
    storageKey,
    originalFilename: sanitizeFilename(file.name || "document"),
    mimeType: file.type,
    fileSize: file.size,
  };
}

export async function loadPrivateFile(storageKey: string) {
  const storageDirectory = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    env.STORAGE_DIR,
  );
  const targetPath = path.join(/* turbopackIgnore: true */ storageDirectory, storageKey);
  return readFile(targetPath);
}

export async function deletePrivateFile(storageKey: string) {
  const storageDirectory = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    env.STORAGE_DIR,
  );
  const targetPath = path.join(/* turbopackIgnore: true */ storageDirectory, storageKey);
  await unlink(targetPath).catch(() => undefined);
}
