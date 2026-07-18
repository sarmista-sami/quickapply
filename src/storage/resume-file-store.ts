/** Serializable résumé file kept in local storage (never synced — too large). */
export interface StoredResume {
  name: string;
  type: string;
  dataBase64: string;
}

const KEY = 'resumeFile';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Edge store for the original résumé file. Local only; kept out of `ApplicantData`. */
export class ResumeFileStore {
  async save(file: File): Promise<void> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const stored: StoredResume = { name: file.name, type: file.type, dataBase64: toBase64(bytes) };
    await chrome.storage.local.set({ [KEY]: stored });
  }

  async loadStored(): Promise<StoredResume | null> {
    const res = await chrome.storage.local.get(KEY);
    return (res[KEY] as StoredResume | undefined) ?? null;
  }

  async load(): Promise<File | null> {
    const stored = await this.loadStored();
    return stored ? storedToFile(stored) : null;
  }

  async clear(): Promise<void> {
    await chrome.storage.local.remove(KEY);
  }
}

export function storedToFile(stored: StoredResume): File {
  const bytes = fromBase64(stored.dataBase64);
  return new File([bytes as BlobPart], stored.name, { type: stored.type });
}
