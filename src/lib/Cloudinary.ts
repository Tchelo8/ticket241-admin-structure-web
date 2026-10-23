// CLOUDINARY — Upload d'images pour Ticket241 depuis le site cloudinary.com
// j'utilise un upload preset non signé pour éviter d'exposer des clés secrètes côté front.


const CLOUDINARY_CLOUD_NAME = 'duqftzwvu';
const CLOUDINARY_UPLOAD_PRESET = 'ticket241';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryResponse {
  secure_url: string;   // URL HTTPS publique — à envoyer au backend
  public_id: string;    // ID pour supprimer/modifier l'image plus tard
  width: number;
  height: number;
  format: string;
}

/**
 * Upload une image vers Cloudinary et retourne l'URL publique.
 * Utilise un upload preset non signé — aucune clé secrète côté front.
 *
 * @param fichier - Le fichier image à uploader
 * @param dossier - Dossier Cloudinary (ex: "events", "covers")
 * @returns L'URL HTTPS de l'image uploadée
 */
export async function uploaderImage(
  fichier: File,
  dossier: string = 'events'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', fichier);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', dossier);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const erreur = await response.json();
    throw new Error(erreur.error?.message ?? 'Échec de l\'upload vers Cloudinary');
  }

  const data: CloudinaryResponse = await response.json();
  return data.secure_url;
}

/**
 * Upload avec suivi de progression (pour afficher une barre de chargement).
 *
 * @param fichier - Le fichier image
 * @param onProgression - Callback appelé avec le pourcentage (0-100)
 * @param dossier - Dossier Cloudinary
 * @returns L'URL HTTPS de l'image uploadée
 */
export async function uploaderImageAvecProgression(
  fichier: File,
  onProgression: (pourcentage: number) => void,
  dossier: string = 'events'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', fichier);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', dossier);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const pourcentage = Math.round((event.loaded / event.total) * 100);
        onProgression(pourcentage);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data: CloudinaryResponse = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        const erreur = JSON.parse(xhr.responseText);
        reject(new Error(erreur.error?.message ?? 'Échec de l\'upload'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Erreur réseau lors de l\'upload'));
    });

    xhr.open('POST', CLOUDINARY_URL);
    xhr.send(formData);
  });
}