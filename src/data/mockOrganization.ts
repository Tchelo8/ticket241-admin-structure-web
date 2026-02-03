import { Organization } from '@/types/organization';

export const mockOrganization: Organization = {
  id: '1',
  nom: 'EventPro Gabon',
  description: 'Nous sommes une entreprise spécialisée dans l\'organisation d\'événements culturels et professionnels au Gabon. Notre mission est de créer des expériences mémorables pour nos clients.',
  location: 'Libreville',
  lieu: 'Quartier Louis, Rue des Cocotiers',
  gerant: 'Jean-Pierre Moussavou',
  contact: '+241 77 00 00 00',
  contactGerant: '+241 66 00 00 00',
  email: 'contact@eventpro-gabon.com',
  type: 'entreprise',
  logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
  isVerified: false,
  validatedEventCount: 12,
  typeContrat: 'standard',
};
