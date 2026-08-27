// Papua Barat Monitoring System - File Upload Handler (#31, #51, #115)
// POST /api/upload

import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { addDocumentationPhoto, addDocument } from '@/lib/db/queries';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const moduleType = (formData.get('module') as string) || 'documentation'; // 'documentation' or 'document'
    const trainingId = (formData.get('training_id') as string) || '';
    const regencyId = (formData.get('regency_id') as string) || 'reg-mkw';
    const districtId = (formData.get('district_id') as string) || 'dis-mkw-01';
    const category = (formData.get('category') as string) || 'Pelatihan';
    const caption = (formData.get('caption') as string) || '';
    const title = (formData.get('title') as string) || '';
    const uploadedBy = (formData.get('uploaded_by') as string) || 'Admin';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // MIME Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.' },
        { status: 400 }
      );
    }

    // Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas maksimum 15MB.' },
        { status: 400 }
      );
    }

    // Sanitized Filename
    const originalName = file.name;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${Date.now()}_${baseName}${ext}`;

    // Target Directory: /uploads/2026/regency/district/training/ (#51)
    const year = '2026';
    const relFolder = path.join('uploads', year, regencyId, districtId, trainingId || 'general');
    const absoluteFolder = path.join(process.cwd(), 'public', relFolder);

    if (!fs.existsSync(absoluteFolder)) {
      fs.mkdirSync(absoluteFolder, { recursive: true });
    }

    const targetFilePath = path.join(absoluteFolder, safeFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetFilePath, fileBuffer);

    // Public URL for client viewing
    const fileUrl = `/${relFolder.replace(/\\/g, '/')}/${safeFileName}`;

    if (moduleType === 'documentation') {
      const doc = addDocumentationPhoto({
        training_id: trainingId,
        category,
        file_name: safeFileName,
        file_url: fileUrl,
        caption: caption || originalName,
        documentation_date: new Date().toISOString().split('T')[0],
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: uploadedBy,
      });
      return NextResponse.json({ success: true, record: doc });
    } else {
      const doc = addDocument({
        training_id: trainingId || undefined,
        regency_id: regencyId,
        district_id: districtId,
        document_type: category,
        title: title || originalName,
        file_url: fileUrl,
        file_name: safeFileName,
        file_size: file.size,
        mime_type: file.type,
        document_date: new Date().toISOString().split('T')[0],
        uploaded_by: uploadedBy,
      });
      return NextResponse.json({ success: true, record: doc });
    }
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: 'Terjadi kendala saat mengunggah file. Silakan coba kembali.' },
      { status: 500 }
    );
  }
}
