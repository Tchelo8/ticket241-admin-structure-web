import { useQuery } from "@tanstack/react-query";
import { obtenirUtilisateur, recuperer } from "@/lib/Transmission";

/** Session enregistrée à la connexion (voir LoginPage). */
export interface SessionUtilisateur {
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  structureId?: number;
  roles?: string[];
}

/** Champs de la structure utilisés par la coquille (barre latérale, en-tête). */
export interface StructureResume {
  id: number;
  nom: string;
  logoUrl?: string;
  isVerified?: boolean;
}

export const useSession = () => obtenirUtilisateur<SessionUtilisateur>();

/** Structure de l'organisateur connecté, mise en cache pour toute la coquille. */
export const useStructure = () => {
  const structureId = useSession()?.structureId;
  return useQuery({
    queryKey: ["structure", structureId],
    enabled: !!structureId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { succes, donnees } = await recuperer<StructureResume>(`/api/events/structures/${structureId}`, {
        afficherErreur: false,
      });
      return succes ? donnees : null;
    },
  });
};

/** Initiales d'un nom (« Entre Nous Bar » → « EN »). */
export const initiales = (texte?: string, repli = "T") =>
  (texte ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]!.toUpperCase())
    .join("") || repli;

const LIBELLES_ROLES: Record<string, string> = {
  ADMIN: "Administrateur",
  STRUCTURE_ADMIN: "Administrateur",
  EVENT_MANAGER: "Gestionnaire d’événements",
  TICKET_CONTROLLER: "Contrôleur de billets",
  ORGANIZER: "Organisateur",
};

/** Libellé lisible du premier rôle connu de la session. */
export const libelleRole = (roles?: string[]) => {
  for (const role of roles ?? []) {
    const cle = role.replace(/^ROLE_/, "").toUpperCase();
    if (LIBELLES_ROLES[cle]) return LIBELLES_ROLES[cle];
  }
  return "Organisateur";
};
