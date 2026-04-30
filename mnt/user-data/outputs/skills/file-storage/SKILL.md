---
name: file-storage
description: >
  Principal guidance for file upload patterns, presigned URLs, client and server-side
  upload flows, file validation, CDN delivery, image processing pipelines, and
  Supabase Storage integration. Load when building any file upload feature, reviewing
  upload security, designing storage architecture, or implementing image processing.
---

# File Storage — Principal Standards

## Philosophy
- **Validate before storing.** Type, size, and content validation before any file touches storage.
- **Never store files in the DB.** Blob data in Postgres = performance disaster.
- **Files are served from CDN, not your server.** Direct download from storage = scalable.
- **Presigned URLs for security.** Never expose storage credentials to clients.

## Upload Architecture Options

### Option A: Client → Supabase Storage Direct (Recommended)
```
Client → [1] Request presigned URL from your API
       ← [2] Receive presigned upload URL
       → [3] PUT file directly to Supabase Storage
       → [4] Notify your API of completion
API    → [5] Validate metadata, save record to DB
```

Benefits: your server never handles file bytes. Scales with zero effort.

### Option B: Client → Server → Storage (For server-side validation)
```
Client → POST file to your API
API    → Validate (type, size, content)
       → Upload to Supabase Storage
       → Save record to DB
       → Return file URL to client
```

Use when: you need server-side virus scanning, content moderation, or image processing before storage.

## Supabase Storage Pattern

### Setup
```sql
-- Storage bucket (in migration)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,  -- private (access via signed URLs)
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS for storage
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]  -- path: {userId}/{filename}
  );

CREATE POLICY "avatars_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Client-Side Upload
```typescript
// src/features/profile/hooks/useAvatarUpload.ts
export function useAvatarUpload() {
  const supabase = createClient();
  const [progress, setProgress] = useState(0);

  async function upload(file: File): Promise<string> {
    // 1. Validate before upload
    validateImageFile(file);

    // 2. Generate path: userId/timestamp.ext
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    // 3. Upload
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,  // replace if exists
        onUploadProgress: (progress) => {
          setProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });

    if (error) throw new ExternalServiceError('Storage', { cause: error });

    // 4. Return signed URL (private bucket)
    const { data: signedUrl } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 3600); // 1 hour

    return signedUrl.signedUrl;
  }

  return { upload, progress };
}
```

## File Validation

### Client-Side (UX — not security)
```typescript
const IMAGE_CONFIG = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  maxDimensions: { width: 4096, height: 4096 },
} as const;

function validateImageFile(file: File): void {
  if (file.size > IMAGE_CONFIG.maxSizeMB * 1024 * 1024) {
    throw new ValidationError(`File must be under ${IMAGE_CONFIG.maxSizeMB}MB`);
  }
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type as any)) {
    throw new ValidationError('Only JPEG, PNG, and WebP images are allowed');
  }
}
```

### Server-Side (Security — mandatory)
```typescript
// Validate by magic bytes — not file extension or Content-Type header (both spoofable)
import { fileTypeFromBuffer } from 'file-type';

async function validateFileContent(buffer: Buffer): Promise<void> {
  const type = await fileTypeFromBuffer(buffer);

  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    throw new ValidationError(`File type ${type?.mime ?? 'unknown'} is not allowed`);
  }
}

// In server route handler
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) throw new ValidationError('No file provided');

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Magic bytes check
  const buffer = Buffer.from(await file.arrayBuffer());
  await validateFileContent(buffer);

  // Now safe to store
  const path = await storageService.upload(buffer, file.name, file.type);
  return Response.json({ path });
}
```

## Image Processing Pipeline

```typescript
// Server-side processing with Sharp before storage
import sharp from 'sharp';

export async function processAvatar(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(256, 256, {
      fit: 'cover',       // crop to fill (not distort)
      position: 'center',
    })
    .webp({ quality: 85 })  // convert to WebP
    .toBuffer();
}

// Multiple sizes for responsive images
export async function processProductImage(input: Buffer): Promise<{
  thumbnail: Buffer;
  medium: Buffer;
  large: Buffer;
}> {
  const [thumbnail, medium, large] = await Promise.all([
    sharp(input).resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
    sharp(input).resize(600, 600, { fit: 'inside' }).webp({ quality: 85 }).toBuffer(),
    sharp(input).resize(1200, 1200, { fit: 'inside' }).webp({ quality: 90 }).toBuffer(),
  ]);
  return { thumbnail, medium, large };
}
```

## CDN Delivery

```typescript
// Construct CDN-optimized URLs
function getAvatarUrl(userId: string, size: 'sm' | 'md' | 'lg'): string {
  const sizes = { sm: 64, md: 128, lg: 256 };
  const px = sizes[size];

  // Supabase Storage transform API (image transformations on-the-fly)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${userId}/avatar.webp?width=${px}&height=${px}&resize=cover`;
}
```

Public files: serve directly via CDN URL. Private files: generate signed URLs server-side, short TTL.

## Storage Paths

```
{bucket}/{userId}/{resource}/{filename}

Examples:
  avatars/{userId}/avatar.webp
  documents/{orgId}/{documentId}/{version}.pdf
  attachments/{messageId}/{filename}
```

Rules:
- Include owner ID as first path segment — enables RLS policies.
- Append timestamp or version for uploads that can be replaced (`avatar-1704067200.webp`).
- Never use user-supplied filenames directly — sanitize or replace entirely.
- Keep paths predictable and enumerable only by authorized parties.

## Cleanup

```typescript
// Delete storage when DB record is deleted
async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const doc = await documentRepo.findById(documentId);
  if (!doc || doc.userId !== userId) throw new AuthorizationError();

  // DB first (if storage fails, we can retry cleanup)
  await documentRepo.delete(documentId);

  // Then storage
  const { error } = await supabase.storage
    .from('documents')
    .remove([doc.storagePath]);

  if (error) {
    // Log but don't fail — orphaned files are manageable, inconsistent DB is not
    logger.error({ action: 'storage_delete_failed', path: doc.storagePath, error: error.message });
  }
}

// Cron job: clean orphaned files
// List storage files, cross-reference DB records, delete orphans older than 24h
```

## Anti-Patterns (Instant Rejection)
- Storing file bytes in Postgres columns
- Trusting file extension or Content-Type header for type validation
- Magic bytes check on client only
- User-supplied filenames stored verbatim (path traversal risk)
- No size limit on upload endpoint
- Serving private files via public storage URLs
- Signed URLs with very long TTL (days/weeks)
- Not deleting storage files when DB records are deleted
- Processing images synchronously in the request cycle for large files
- No progress indicator for large uploads
