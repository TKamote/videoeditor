import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import { uploadVideoToGCS } from './uploader';
import { createVideoDocument } from './firestore';
import { waitForFileStable, getFileSize, isValidVideoFile } from './utils';

interface WatcherConfig {
  recordingFolder: string;
  extensions: string[];
  minFileSizeMB: number;
  archiveFolder?: string;
  stabilityWaitMs: number;
}

class OBSWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private config: WatcherConfig;
  private processingFiles: Set<string> = new Set();

  constructor(config: WatcherConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log(`🚀 Starting OBS Watcher...`);
    console.log(`📁 Watching folder: ${this.config.recordingFolder}`);
    console.log(`📝 File extensions: ${this.config.extensions.join(', ')}`);
    console.log(`📊 Min file size: ${this.config.minFileSizeMB}MB`);

    // Verify folder exists
    try {
      await fs.access(this.config.recordingFolder);
    } catch (error) {
      console.error(`❌ Error: Recording folder does not exist: ${this.config.recordingFolder}`);
      process.exit(1);
    }

    // Create archive folder if specified
    if (this.config.archiveFolder) {
      try {
        await fs.mkdir(this.config.archiveFolder, { recursive: true });
        console.log(`📦 Archive folder: ${this.config.archiveFolder}`);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not create archive folder: ${error}`);
      }
    }

    // Initialize watcher
    this.watcher = chokidar.watch(this.config.recordingFolder, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // Don't process existing files on startup
      awaitWriteFinish: {
        stabilityThreshold: this.config.stabilityWaitMs,
        pollInterval: 1000
      }
    });

    // Watch for new files
    this.watcher.on('add', async (filePath: string) => {
      await this.handleNewFile(filePath);
    });

    // Watch for file changes (OBS might update the file)
    this.watcher.on('change', async (filePath: string) => {
      if (!this.processingFiles.has(filePath)) {
        await this.handleNewFile(filePath);
      }
    });

    // Handle errors
    this.watcher.on('error', (error: Error) => {
      console.error(`❌ Watcher error: ${error.message}`);
    });

    console.log(`✅ Watcher started successfully. Waiting for new recordings...`);
  }

  private async handleNewFile(filePath: string): Promise<void> {
    // Skip if already processing
    if (this.processingFiles.has(filePath)) {
      return;
    }

    // Validate file
    if (!isValidVideoFile(filePath, this.config.extensions)) {
      return;
    }

    const fileName = path.basename(filePath);
    console.log(`\n📹 New file detected: ${fileName}`);

    // Check file size
    const fileSizeMB = await getFileSize(filePath);
    if (fileSizeMB < this.config.minFileSizeMB) {
      console.log(`⏭️  Skipping ${fileName}: File too small (${fileSizeMB.toFixed(2)}MB < ${this.config.minFileSizeMB}MB)`);
      return;
    }

    // Wait for file to be stable (OBS finished writing)
    console.log(`⏳ Waiting for file to stabilize...`);
    const isStable = await waitForFileStable(filePath, this.config.stabilityWaitMs);
    
    if (!isStable) {
      console.log(`⚠️  File ${fileName} did not stabilize, skipping...`);
      return;
    }

    // Mark as processing
    this.processingFiles.add(filePath);

    try {
      // Upload to GCS
      console.log(`☁️  Uploading ${fileName} to Google Cloud Storage...`);
      const gcsPath = await uploadVideoToGCS(filePath, fileName);
      console.log(`✅ Upload complete: ${gcsPath}`);

      // Create Firestore document
      console.log(`📝 Creating Firestore document...`);
      const videoId = await createVideoDocument({
        fileName,
        gcsPath,
        fileSize: await getFileSize(filePath) * 1024 * 1024, // Convert to bytes
        localPath: filePath
      });
      console.log(`✅ Firestore document created: ${videoId}`);

      // Archive file if configured
      if (this.config.archiveFolder) {
        const archivePath = path.join(this.config.archiveFolder, fileName);
        await fs.rename(filePath, archivePath);
        console.log(`📦 File archived to: ${archivePath}`);
      }

      console.log(`🎉 Successfully processed: ${fileName}\n`);

    } catch (error: any) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      // Log full error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    } finally {
      // Remove from processing set
      this.processingFiles.delete(filePath);
    }
  }

  async stop(): Promise<void> {
    console.log(`\n🛑 Stopping watcher...`);
    if (this.watcher) {
      await this.watcher.close();
      console.log(`✅ Watcher stopped`);
    }
  }
}

// Main execution
async function main() {
  // Load environment variables
  require('dotenv').config();

  const recordingFolder = process.env.OBS_RECORDING_FOLDER;
  if (!recordingFolder) {
    console.error('❌ Error: OBS_RECORDING_FOLDER environment variable is required');
    process.exit(1);
  }

  const extensions = (process.env.WATCH_EXTENSIONS || '.mp4,.mkv')
    .split(',')
    .map(ext => ext.trim());

  const minFileSizeMB = parseInt(process.env.MIN_FILE_SIZE_MB || '10', 10);
  const stabilityWaitMs = parseInt(process.env.STABILITY_WAIT_MS || '5000', 10);

  const config: WatcherConfig = {
    recordingFolder,
    extensions,
    minFileSizeMB,
    archiveFolder: process.env.ARCHIVE_FOLDER,
    stabilityWaitMs
  };

  const watcher = new OBSWatcher(config);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await watcher.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await watcher.stop();
    process.exit(0);
  });

  // Start watching
  await watcher.start();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { OBSWatcher };

