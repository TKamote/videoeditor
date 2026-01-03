import fs from 'fs/promises';
import path from 'path';

/**
 * Wait for file to be stable (not being written to)
 * Checks file size at intervals to ensure it's not changing
 */
export async function waitForFileStable(
  filePath: string,
  waitTimeMs: number = 5000
): Promise<boolean> {
  const checkInterval = 1000; // Check every second
  const checks = Math.ceil(waitTimeMs / checkInterval);
  
  let previousSize = 0;
  let stableCount = 0;
  const requiredStableChecks = 3; // File must be stable for 3 consecutive checks

  for (let i = 0; i < checks; i++) {
    try {
      const stats = await fs.stat(filePath);
      const currentSize = stats.size;

      if (currentSize === previousSize) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          return true; // File is stable
        }
      } else {
        stableCount = 0; // Reset counter if size changed
      }

      previousSize = currentSize;
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    } catch (error) {
      // File might not exist yet or is being moved
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }

  return false; // File did not stabilize within wait time
}

/**
 * Get file size in MB
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size / (1024 * 1024); // Convert bytes to MB
  } catch (error) {
    return 0;
  }
}

/**
 * Check if file is a valid video file based on extension
 */
export function isValidVideoFile(filePath: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFileName(originalFileName: string): string {
  const ext = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, ext);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${baseName}_${timestamp}${ext}`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

