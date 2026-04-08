import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Directory where uploads will be stored (public/uploads)
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request) {
  try {
    // Ensure the uploads folder exists
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size (<= 3 MB)
    const maxSize = 3 * 1024 * 1024; // 3 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File exceeds 3 MB limit' }, { status: 400 });
    }

    // Validate mime type (jpeg or png)
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG and PNG are allowed' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.type === 'image/png' ? '.png' : '.jpg';
    const fileName = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
