import { createHash } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";
import { env } from "@/server/env";

export type StoredObject = {
  storageKey: string;
  fileName: string;
  absolutePath: string;
  checksum: string;
};

function sanitizeFileName(fileName: string) {
  const extension = path.extname(fileName);
  const name = path.basename(fileName, extension);
  const safeName = slugify(name) || "file";
  return `${safeName}${extension.toLowerCase()}`;
}

export async function storeBuffer(
  folder: string,
  fileName: string,
  buffer: Buffer,
): Promise<StoredObject> {
  const safeName = sanitizeFileName(fileName);
  const targetFolder = path.join(env.storageDir, folder);
  await mkdir(targetFolder, { recursive: true });

  const storageKey = path.join(folder, `${Date.now()}-${safeName}`);
  const absolutePath = path.join(env.storageDir, storageKey);
  const checksum = createHash("sha256").update(buffer).digest("hex");

  await writeFile(absolutePath, buffer);

  return { storageKey, fileName: safeName, absolutePath, checksum };
}

export async function readStoredBuffer(storageKey: string) {
  return readFile(path.join(env.storageDir, storageKey));
}

export async function deleteStoredBuffer(storageKey: string) {
  try {
    await unlink(path.join(env.storageDir, storageKey));
  } catch {
    return;
  }
}
