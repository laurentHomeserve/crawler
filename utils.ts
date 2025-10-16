import axios from 'axios';
import * as fs from 'node:fs/promises';
import * as path from 'path';

export async function fetchUrl(url: string): Promise<string> {
  url = url.replace(/([^:]\/)\/+/g, "$1");
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(url);
    throw new Error(`Impossible de récupérer la page ${url}`);
  }
}

export async function saveFile(obj: any, filePath: string, mainDir: string): Promise<void> {
  const result: string = JSON.stringify(obj, null, 2);
  const fullPath = path.join(mainDir, filePath);
  
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  
  try {
    await fs.writeFile(fullPath, result);
    console.log(`Fichier enregistré avec succès à : ${fullPath}`);
  } catch (error) {
    console.log('Erreur lors de l\'écriture du fichier :', fullPath, result);
  }
}

export function getLink(url: string, mainUrl: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${mainUrl}${url}`;
}

export function getPath(string: string, mainUrl: string): string {
  string = string.replace(mainUrl, '');
  if (string.startsWith('/')) {
    return string.slice(1);
  }
  return string;
} 