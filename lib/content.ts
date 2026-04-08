import fs from 'fs/promises';
import path from 'path';

export async function getContent() {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'content.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading content:', error);
    return null;
  }
}
