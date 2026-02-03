export interface Organization {
  id: string;
  nom: string;
  description: string;
  location: string;
  lieu: string;
  gerant: string;
  contact: string;
  contactGerant: string;
  email: string;
  type: string;
  logoUrl: string;
  isVerified: boolean;
  validatedEventCount: number;
  typeContrat: string;
}

export interface OrganizationFormData {
  nom: string;
  description: string;
  location: string;
  lieu: string;
  gerant: string;
  contact: string;
  contactGerant: string;
  email: string;
  type: string;
  logoUrl: string;
  typeContrat: string;
}

export const ORGANIZATION_TYPES = [
  { value: 'association', label: 'Association' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'ong', label: 'ONG' },
  { value: 'institution', label: 'Institution publique' },
  { value: 'particulier', label: 'Particulier' },
  { value: 'autre', label: 'Autre' },
];

export const CONTRACT_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'partenaire', label: 'Partenaire' },
];
