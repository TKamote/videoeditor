import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const gcsBucket = storage.bucket(process.env.GCS_BUCKET_NAME || "");

export async function uploadToGCS(filePath: string, destination: string) {
  await gcsBucket.upload(filePath, {
    destination,
  });
  return `gs://${gcsBucket.name}/${destination}`;
}

export async function getSignedUrl(gcsPath: string) {
  const fileName = gcsPath.replace(`gs://${gcsBucket.name}/`, "");
  const [url] = await gcsBucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  return url;
}

