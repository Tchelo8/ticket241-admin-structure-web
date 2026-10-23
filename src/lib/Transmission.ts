import { toast } from "@/hooks/use-toast";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ton-domaine-production.com"      // à remplacer en prod
    : "http://localhost:8080";                   // API Gateway Ticket241

// Déconnexion automatique après 30 min d'inactivité
const DUREE_INACTIVITE_MS = 30 * 60 * 1000;

// ============================================================
// TYPES
// ============================================================

/**
 * Format unifié retourné par toutes les fonctions de ce fichier.
 * Spring Boot peut renvoyer l'entité directement ou un wrapper —
 * tout est normalisé ici pour que le front n'ait jamais à deviner.
 */
export interface ReponseAPI<T = any> {
  succes: boolean;
  donnees: T | null;
  message?: string;
  erreur?: string;
  codeStatut?: number;
  /** Erreurs de validation Spring (400) : { champ: message } */
  erreursChamps?: Record<string, string>;
}

export interface OptionsRequete {
  afficherSucces?: boolean;
  afficherErreur?: boolean;
  messageSucces?: string;
  messageErreur?: string;
}

// ============================================================
// GESTION DU TOKEN JWT
// ============================================================

const CLE_TOKEN       = "access_token";
const CLE_UTILISATEUR = "user_data";

/** Lit le JWT depuis le localStorage */
export const obtenirToken = (): string | null =>
  localStorage.getItem(CLE_TOKEN);

/**
 * Vérifie l'expiration du JWT côté client (décodage Base64, sans réseau).
 * Le Gateway Spring Boot fera sa propre vérification côté serveur.
 */
export const estTokenExpire = (): boolean => {
  const token = obtenirToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Décode le payload du JWT sans appel réseau.
 * Retourne phoneNumber et roles que le Gateway propage ensuite
 * en headers X-User-Id / X-User-Roles aux microservices.
 */
export const decoderToken = (): {
  phoneNumber: string;
  roles: string[];
  expiration: Date;
} | null => {
  const token = obtenirToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      phoneNumber: payload.sub ?? "",
      roles: payload.roles ?? [],
      expiration: new Date(payload.exp * 1000),
    };
  } catch {
    return null;
  }
};

/**
 * Construit les headers pour chaque requête.
 * Le Gateway lit "Authorization: Bearer <token>" et injecte
 * X-User-Id + X-User-Roles pour les microservices en aval.
 */
const construireHeaders = (): HeadersInit => {
  const token = obtenirToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================================
// TIMER D'INACTIVITÉ
// ============================================================

let timerInactivite: ReturnType<typeof setTimeout> | null = null;

const reinitialiserTimer = () => {
  if (timerInactivite) clearTimeout(timerInactivite);
  timerInactivite = setTimeout(() => {
    afficherToast.avertissement("Déconnecté pour inactivité.", "Session expirée");
    deconnecter();
  }, DUREE_INACTIVITE_MS);
};

if (typeof window !== "undefined") {
  ["click", "keypress", "scroll", "mousemove", "touchstart"].forEach((evt) =>
    window.addEventListener(evt, reinitialiserTimer, { passive: true })
  );
}

// ============================================================
// NORMALISATION DES RÉPONSES SPRING BOOT
// ============================================================

/**
 * Spring Boot renvoie plusieurs formats selon le contrôleur :
 *  1. { success, data, message }  → wrapper explicite
 *  2. L'entité directement        → ResponseEntity<MonObjet>
 *  3. { message, error }          → erreur métier (400, 404…)
 *  4. Corps vide                  → 204 No Content (DELETE)
 * Cette fonction unifie tout en ReponseAPI<T>.
 */
const normaliser = <T>(json: any, statut: number): ReponseAPI<T> => {
  if (statut >= 400) {
    return {
      succes: false,
      donnees: null,
      erreur: json?.message ?? json?.error ?? `Erreur ${statut}`,
      codeStatut: statut,
      erreursChamps: json?.errors,
    };
  }
  // Wrapper explicite { success, data, message }
  if (typeof json?.success === "boolean") {
    return {
      succes: json.success,
      donnees: json.success ? (json.data ?? null) : null,
      message: json.message,
      erreur: json.success ? undefined : (json.error ?? json.message),
      codeStatut: statut,
    };
  }
  // Entité renvoyée directement
  return { succes: true, donnees: json as T, codeStatut: statut };
};

// ============================================================
// FONCTION CENTRALE
// ============================================================

const appelerAPI = async <T = any>(
  endpoint: string,
  methode: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  corps?: any,
  options: OptionsRequete = {}
): Promise<ReponseAPI<T>> => {
  const {
    afficherSucces = false,
    afficherErreur = true,
    messageSucces,
    messageErreur,
  } = options;

  // Vérification préventive : token expiré avant même l'appel réseau
  if (obtenirToken() && estTokenExpire()) {
    afficherToast.erreur("Votre session a expiré. Veuillez vous reconnecter.");
    deconnecter();
    return { succes: false, donnees: null, erreur: "Token expiré", codeStatut: 401 };
  }

  reinitialiserTimer();

  try {
    const config: RequestInit = {
      method: methode,
      headers: construireHeaders(),
      ...(corps && methode !== "GET" ? { body: JSON.stringify(corps) } : {}),
    };

    const reponse = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 204 No Content — typique des DELETE Spring Boot
    if (reponse.status === 204) {
      if (afficherSucces) afficherToast.succes(messageSucces ?? "Opération réussie");
      return { succes: true, donnees: null, codeStatut: 204 };
    }

    // 401 renvoyé par le Gateway
    if (reponse.status === 401) {
      let json: any;
      try { json = await reponse.json(); } catch { json = {}; }

      const msgErreur = json?.message ?? "Non autorisé";

      if (obtenirToken()) {
        // Token présent mais rejeté → session expirée → on déconnecte
        afficherToast.erreur("Session expirée. Veuillez vous reconnecter.");
        deconnecter();
      } else {
        // Pas de token → simple échec de login → on affiche l'erreur sans déconnecter
        if (afficherErreur) afficherToast.erreur(messageErreur ?? msgErreur);
      }

      return { succes: false, donnees: null, erreur: msgErreur, codeStatut: 401 };
    }

    let json: any;
    try {
      json = await reponse.json();
    } catch {
      return { succes: false, donnees: null, erreur: "Réponse illisible du serveur", codeStatut: reponse.status };
    }

    const resultat = normaliser<T>(json, reponse.status);

    if (resultat.succes && afficherSucces) {
      afficherToast.succes(messageSucces ?? resultat.message ?? "Opération réussie");
    }
    if (!resultat.succes && afficherErreur) {
      afficherToast.erreur(messageErreur ?? resultat.erreur ?? "Une erreur est survenue");
    }

    return resultat;

  } catch (erreur) {
    const msg =
      erreur instanceof TypeError && erreur.message.includes("fetch")
        ? "Impossible de joindre le serveur. Vérifiez votre connexion."
        : erreur instanceof Error
        ? erreur.message
        : "Erreur inattendue";

    if (afficherErreur) afficherToast.erreur(messageErreur ?? msg);
    return { succes: false, donnees: null, erreur: msg };
  }
};

// ============================================================
// FONCTIONS CRUD PUBLIQUES
// ============================================================

/** GET — Récupère des données (pas de toast succès par défaut) */
export const recuperer = <T = any>(
  endpoint: string,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> =>
  appelerAPI<T>(endpoint, "GET", undefined, { afficherSucces: false, ...options });

/** POST — Crée une ressource */
export const envoyer = <T = any>(
  endpoint: string,
  donnees: any,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> =>
  appelerAPI<T>(endpoint, "POST", donnees, {
    afficherSucces: true,
    messageSucces: "Créé avec succès",
    ...options,
  });

/**
 * POST avec fichiers — Upload d'images, PDFs ou tout autre fichier.
 * Utilise FormData au lieu de JSON, le header Content-Type est géré
 * automatiquement par le navigateur (multipart/form-data + boundary).
 *
 * @param endpoint  - Route API ex: "/api/events/create"
 * @param fichiers  - Objet { nomChamp: File | File[] } ex: { image: monFichier, documents: [pdf1, pdf2] }
 * @param donnees   - Données texte à envoyer en même temps (optionnel)
 *
 * @example
 * await envoyerAvecFichiers("/api/events", { image: fichierImage }, { title: "Concert" });
 */
export const envoyerAvecFichiers = async <T = any>(
  endpoint: string,
  fichiers: Record<string, File | File[]>,
  donnees?: Record<string, any>,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> => {
  // Vérification préventive du token
  if (obtenirToken() && estTokenExpire()) {
    afficherToast.erreur("Votre session a expiré. Veuillez vous reconnecter.");
    deconnecter();
    return { succes: false, donnees: null, erreur: "Token expiré", codeStatut: 401 };
  }

  reinitialiserTimer();

  const {
    afficherSucces = true,
    afficherErreur = true,
    messageSucces = "Envoyé avec succès",
    messageErreur,
  } = options ?? {};

  try {
    const formData = new FormData();

    // Ajout des fichiers
    Object.entries(fichiers).forEach(([nomChamp, valeur]) => {
      if (Array.isArray(valeur)) {
        valeur.forEach((fichier) => formData.append(nomChamp, fichier));
      } else {
        formData.append(nomChamp, valeur);
      }
    });

    // Ajout des données texte (chaque valeur convertie en string)
    if (donnees) {
      Object.entries(donnees).forEach(([cle, valeur]) => {
        formData.append(
          cle,
          typeof valeur === "object" ? JSON.stringify(valeur) : String(valeur)
        );
      });
    }

    const token = obtenirToken();

    // NB : on ne met PAS "Content-Type" — le browser le définit automatiquement
    // avec le bon boundary multipart/form-data
    const reponse = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    // 204 No Content
    if (reponse.status === 204) {
      if (afficherSucces) afficherToast.succes(messageSucces);
      return { succes: true, donnees: null, codeStatut: 204 };
    }

    // 401
    if (reponse.status === 401) {
      let json: any;
      try { json = await reponse.json(); } catch { json = {}; }
      const msgErreur = json?.message ?? "Non autorisé";
      if (obtenirToken()) {
        afficherToast.erreur("Session expirée. Veuillez vous reconnecter.");
        deconnecter();
      } else {
        if (afficherErreur) afficherToast.erreur(messageErreur ?? msgErreur);
      }
      return { succes: false, donnees: null, erreur: msgErreur, codeStatut: 401 };
    }

    let json: any;
    try {
      json = await reponse.json();
    } catch {
      return { succes: false, donnees: null, erreur: "Réponse illisible du serveur", codeStatut: reponse.status };
    }

    const resultat = normaliser<T>(json, reponse.status);

    if (resultat.succes && afficherSucces) {
      afficherToast.succes(messageSucces ?? resultat.message ?? "Opération réussie");
    }
    if (!resultat.succes && afficherErreur) {
      afficherToast.erreur(messageErreur ?? resultat.erreur ?? "Une erreur est survenue");
    }

    return resultat;

  } catch (erreur) {
    const msg =
      erreur instanceof TypeError && erreur.message.includes("fetch")
        ? "Impossible de joindre le serveur. Vérifiez votre connexion."
        : erreur instanceof Error
        ? erreur.message
        : "Erreur inattendue";

    if (afficherErreur) afficherToast.erreur(messageErreur ?? msg);
    return { succes: false, donnees: null, erreur: msg };
  }
};

/** PUT — Remplace complètement une ressource */
export const mettreAJour = <T = any>(
  endpoint: string,
  donnees: any,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> =>
  appelerAPI<T>(endpoint, "PUT", donnees, {
    afficherSucces: true,
    messageSucces: "Mis à jour avec succès",
    ...options,
  });

/** PATCH — Mise à jour partielle */
export const modifierPartiellement = <T = any>(
  endpoint: string,
  donnees: any,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> =>
  appelerAPI<T>(endpoint, "PATCH", donnees, {
    afficherSucces: true,
    messageSucces: "Modifié avec succès",
    ...options,
  });

/** DELETE — Supprime une ressource */
export const supprimer = <T = any>(
  endpoint: string,
  options?: OptionsRequete
): Promise<ReponseAPI<T>> =>
  appelerAPI<T>(endpoint, "DELETE", undefined, {
    afficherSucces: true,
    messageSucces: "Supprimé avec succès",
    ...options,
  });

// ============================================================
// GESTION DE SESSION
// ============================================================

/** Sauvegarde le JWT et les données utilisateur après connexion */
export const sauvegarderSession = (token: string, utilisateur: any): void => {
  localStorage.setItem(CLE_TOKEN, token);
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
  reinitialiserTimer();
};

/** Vérifie si une session valide existe */
export const estConnecte = (): boolean =>
  !!obtenirToken() && !estTokenExpire();

/** Retourne les données utilisateur stockées localement */
export const obtenirUtilisateur = <T = any>(): T | null => {
  const data = localStorage.getItem(CLE_UTILISATEUR);
  try {
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
};

/** Déconnecte l'utilisateur, vide le storage et redirige vers / */
export const deconnecter = (): void => {
  localStorage.removeItem(CLE_TOKEN);
  localStorage.removeItem(CLE_UTILISATEUR);
  sessionStorage.clear();
  if (timerInactivite) clearTimeout(timerInactivite);
  afficherToast.info("Vous avez été déconnecté.");
  window.location.replace('/');
};

// ============================================================
// SERVICES MÉTIER — Ticket241
// ============================================================

/** Auth Service (port 8083 via Gateway) */
export const auth = {
  connexion: (donnees: { phoneNumber: string; password: string }) =>
    envoyer("/api/auth/structure/login", donnees, {
      afficherSucces: false, // géré manuellement dans la page login
      afficherErreur: true,
      messageErreur: "Identifiants incorrects",
    }),
  inscription: (donnees: any) =>
    envoyer("/api/auth/register", donnees, { messageSucces: "Compte créé avec succès" }),
  profil: () =>
    recuperer("/api/auth/me"),
};




// ============================================================
// TYPES MÉTIER — Event Service
// ============================================================

export type EventCategory =
  | "CONCERT"
  | "FESTIVAL"
  | "SPORT"
  | "CONFERENCE"
  | "THEATRE"
  | "CINEMA"
  | "EXPOSITION"
  | "GASTRONOMIE"
  | "MODE"
  | "RELIGION"
  | "POLITIQUE"
  | "AUTRE";

export type ValidationMode = "AUTO" | "MANUAL";

export interface CreateTicketCategoryDto {
  /** Obligatoire — entre 2 et 100 caractères */
  name: string;
  /** Optionnel — max 500 caractères */
  description?: string;
  /** Obligatoire — supérieur à 0, max 8 chiffres avant virgule et 2 après */
  price: number;
  /** Obligatoire — au moins 1 place */
  totalSeats: number;
  /** Optionnel — défaut 0 */
  displayOrder?: number;
  /** Optionnel — défaut 10 */
  maxTicketsPerOrder?: number;
  /** Optionnel — max 500 caractères */
  benefits?: string;
  /** Optionnel — format hexadécimal #RRGGBB */
  colorCode?: string;
}

export interface CreateEventDto {
  /** Obligatoire — entre 3 et 200 caractères */
  name: string;
  /** Obligatoire — au moins 10 caractères */
  fullDescription: string;
  /** Obligatoire — ID de la catégorie */
  categoryId: number;
  /** Optionnel — max 100 caractères */
  subCategory?: string;
  /** Obligatoire — doit être dans le futur (ISO 8601) */
  startDate: string;
  /** Optionnel */
  endDate?: string;
  /** Optionnel */
  doorsOpenTime?: string;
  /** Optionnel */
  saleStartDate?: string;
  /** Optionnel */
  saleEndDate?: string;
  /** Obligatoire — max 200 caractères */
  venueName: string;
  /** Optionnel — max 200 caractères */
  venueAddress?: string;
  /** Obligatoire — ID de la ville */
  cityId: number;
  /** Optionnel — max 1000 caractères */
  venueAccessInfo?: string;
  /** Obligatoire — au moins 1 place */
  totalSeats: number;
  /** Obligatoire — ID de la structure organisatrice */
  structureId: number;
  /** Optionnel — max 100 caractères */
  organizerName?: string;
  /** Optionnel — format +XXXXXXXXXXX (10 à 15 chiffres, sans espaces) */
  organizerPhone?: string;
  /** Optionnel — URL de l'image de couverture, max 500 caractères */
  coverImageUrl?: string;
  /** Optionnel — défaut true */
  isPublic?: boolean;
  /** Optionnel — défaut false */
  isOnline?: boolean;
  /** Optionnel — max 500 caractères */
  onlineMeetingUrl?: string;
  /** Optionnel — entre 0 et 99 */
  minAge?: number;
  /** Optionnel — max 2000 caractères */
  termsAndConditions?: string;
  /** Optionnel — max 1000 caractères */
  cancellationPolicy?: string;
  /** Optionnel — défaut true */
  allowRefund?: boolean;
  /** Optionnel — défaut 7 jours */
  refundDeadlineDays?: number;
  /** Optionnel — entre 1 et 100, défaut 10 */
  maxTicketsPerUser?: number;
  /** Optionnel — défaut AUTO */
  validationMode?: ValidationMode;
  /** Obligatoire — au moins une catégorie de ticket */
  ticketCategories: CreateTicketCategoryDto[];
}

/**
 * Interface d'une catégorie d'événement retournée par /api/events/categories/get/all
 */
export interface CategorieEvenement {
  id: number;
  uuid: string;
  name: string;
  displayName: string;
  iconUrl: string | null;
}

/** Résultat d'un événement dans POST /api/events/publish-batch */
export interface ResultatPublicationLot {
  uuid: string;
  /** null si l'événement est introuvable */
  name: string | null;
  published: boolean;
  /** "Publié" ou la raison du refus, affichable telle quelle */
  message: string;
}

export interface ReponsePublicationLot {
  published: number;
  refused: number;
  results: ResultatPublicationLot[];
}

/** Nombre maximum d'uuid accepté par POST /api/events/publish-batch */
export const MAX_PUBLICATION_LOT = 100;

/** Event Service */
export const evenements = {
  liste: () =>
    recuperer("/api/events"),

  /**
   * Récupère toutes les catégories d'événements depuis le backend.
   * Retourne un tableau d'objets { id, uuid, name, displayName, iconUrl }.
   */
  categories: () =>
    recuperer<CategorieEvenement[]>("/api/events/categories/get/all"),

  detail: (id: string) =>
    recuperer(`/api/events/${id}`),

  /**
   * Crée un événement complet avec ses catégories de tickets.
   * Le Gateway injecte automatiquement X-User-Id et X-User-Roles
   * depuis le JWT — pas besoin de les passer manuellement.
   *
   * @example
   * const { succes, donnees } = await evenements.creer({
   *   name: "Concert Jazz",
   *   fullDescription: "Un concert de jazz au cœur de Libreville",
   *   category: "CONCERT",
   *   startDate: "2026-06-01T20:00:00",
   *   venueName: "Palais des Sports",
   *   cityId: 1,
   *   totalSeats: 500,
   *   structureId: 1,
   *   ticketCategories: [
   *     { name: "VIP", price: 50000, totalSeats: 100, colorCode: "#FFD700" },
   *     { name: "Standard", price: 15000, totalSeats: 400 }
   *   ]
   * });
   */
  creer: (donnees: CreateEventDto) =>
    envoyer("/api/events", donnees, {
      afficherSucces: true,
      messageSucces: "Événement créé avec succès !",
      messageErreur: "Erreur lors de la création de l'événement",
    }),

  modifier: (id: string, donnees: Partial<CreateEventDto>) =>
    mettreAJour(`/api/events/${id}`, donnees),

  supprimer: (id: string) =>
    supprimer(`/api/events/${id}`, { messageSucces: "Événement supprimé" }),

  /**
   * Publie plusieurs brouillons (DRAFT / PENDING_APPROVAL) en un appel, 100 au maximum.
   * Le back répond 200 même si certains sont refusés : voir results[].published.
   * Les toasts sont laissés à l'appelant, qui affiche la synthèse.
   */
  publierLot: (eventUuids: string[]) =>
    envoyer<ReponsePublicationLot>("/api/events/publish-batch", { eventUuids }, {
      afficherSucces: false,
      afficherErreur: false,
    }),
};

/** Ticket Service */
export const tickets = {
  reserver: (donnees: { eventId: string; quantity: number }) =>
    envoyer("/api/tickets/reserve", donnees, { messageSucces: "Réservation confirmée" }),
  confirmerAchat: (ticketId: string) =>
    envoyer(`/api/tickets/${ticketId}/purchase`, {}, { messageSucces: "Achat confirmé !" }),
  annuler: (ticketId: string) =>
    mettreAJour(`/api/tickets/${ticketId}/cancel`, {}, { messageSucces: "Ticket annulé" }),
  transferer: (ticketId: string, donnees: { recipientPhone: string }) =>
    envoyer(`/api/tickets/${ticketId}/transfer`, donnees, { messageSucces: "Ticket transféré" }),
  mesTickets: () =>
    recuperer("/api/tickets/my"),
  qrCode: (ticketId: string) =>
    recuperer(`/api/tickets/${ticketId}/qr`),
};

/** Notification Service (port 8084 via Gateway) */
export const notifications = {
  preferences: () =>
    recuperer("/api/notifications/preferences"),
  mettreAJourPreferences: (donnees: any) =>
    mettreAJour("/api/notifications/preferences", donnees, {
      messageSucces: "Préférences sauvegardées",
    }),
};

// ============================================================
// TOASTS UTILITAIRES
// ============================================================

export const afficherToast = {
  succes: (message: string, titre = "Succès") =>
    toast({ title: titre, description: message, className: "bg-green-600 text-white" }),
  erreur: (message: string, titre = "Erreur") =>
    toast({ variant: "destructive", title: titre, description: message }),
  info: (message: string, titre = "Information") =>
    toast({ title: titre, description: message }),
  avertissement: (message: string, titre = "Attention") =>
    toast({ title: titre, description: message, className: "bg-yellow-500 text-white" }),
};

// ============================================================
// EXPORT PAR DÉFAUT
// ============================================================

export default {
  // CRUD
  recuperer,
  envoyer,
  envoyerAvecFichiers,
  mettreAJour,
  modifierPartiellement,
  supprimer,
  // Session
  sauvegarderSession,
  estConnecte,
  obtenirUtilisateur,
  obtenirToken,
  decoderToken,
  estTokenExpire,
  deconnecter,
  // Services Ticket241
  auth,
  evenements,
  tickets,
  notifications,
  // Utils
  afficherToast,
};