import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Save,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  BadgeCheck,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrganizationFormData } from '@/types/organization';
import { recuperer, mettreAJour, obtenirUtilisateur } from '@/lib/Transmission';

const organizationSchema = z.object({
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  lieu: z.string().optional(),
  location: z.string().optional(),
  logoUrl: z.string().optional(),
  nom: z.string().optional(),
  email: z.string().optional(),
  contact: z.string().optional(),
  contactGerant: z.string().optional(),
  gerant: z.string().optional(),
  type: z.string().optional(),
  typeContrat: z.string().optional(),
});

interface SessionUtilisateur {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  structureId: number;
  roles: string[];
}

interface StructureData {
  id: number;
  uuid: string;
  nom: string;
  email: string;
  contact: string;
  contactGerant: string;
  description: string;
  gerant: string;
  location: string;
  lieu: string;
  logoUrl: string;
  type: string;
  typeContrat: string;
  status: boolean;
  isVerified: boolean;
  validatedEventCount: number;
}

export default function OrganizationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [structureData, setStructureData] = useState<StructureData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    const chargerStructure = async () => {
      const session = obtenirUtilisateur<SessionUtilisateur>();
      if (!session?.structureId) {
        setIsLoading(false);
        return;
      }
      const { succes, donnees } = await recuperer<StructureData>(
        `/api/events/structures/${session.structureId}`
      );
      if (succes && donnees) {
        setStructureData(donnees);
        setLogoPreview(donnees.logoUrl ?? '');
        reset({
          nom: donnees.nom,
          description: donnees.description,
          location: donnees.location,
          lieu: donnees.lieu,
          gerant: donnees.gerant,
          contact: donnees.contact,
          contactGerant: donnees.contactGerant,
          email: donnees.email,
          type: donnees.type,
          logoUrl: donnees.logoUrl,
          typeContrat: donnees.typeContrat,
        });
      }
      setIsLoading(false);
    };
    chargerStructure();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setValue('logoUrl', url);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setValue('logoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: OrganizationFormData) => {
    if (!structureData) return;
    setIsSubmitting(true);
    await mettreAJour(`/api/events/structures/${structureData.id}`, data, {
      messageSucces: 'Les informations de votre structure ont été mises à jour.',
      messageErreur: 'Impossible de sauvegarder les modifications.',
    });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    // Conteneur principal — max-width + centré + padding horizontal confortable
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ma structure</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les informations de votre organisation
        </p>
      </div>

      {/* Statut de vérification */}
      <Card
        className={
          structureData?.isVerified
            ? 'border-primary/40 bg-primary/5'
            : 'border-destructive/40 bg-destructive/5'
        }
      >
        <CardContent className="flex items-center gap-4 px-6 py-4">
          {structureData?.isVerified ? (
            <>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary text-sm">Structure vérifiée</h3>
                  <Badge variant="outline" className="border-primary text-primary text-xs">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Votre structure a été vérifiée et validée par notre équipe.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-primary">{structureData?.validatedEventCount}</p>
                <p className="text-xs text-muted-foreground">événements validés</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-destructive text-sm">Structure non vérifiée</h3>
                  <Badge variant="outline" className="border-destructive text-destructive text-xs">
                    En attente
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  En attente de vérification. Complétez toutes les informations pour accélérer le processus.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/10 shrink-0"
              >
                Demander la vérification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Logo + Infos générales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Logo */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Logo
              </CardTitle>
              <CardDescription className="text-xs">Le logo de votre structure</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 px-6 pb-6">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-28 w-28 rounded-xl object-cover border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-28 w-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-2" />
                Changer le logo
              </Button>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations générales
              </CardTitle>
              <CardDescription className="text-xs">
                Les informations principales de votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Nom — non modifiable */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                    Nom de la structure
                    <Lock className="h-3 w-3" />
                  </Label>
                  <Input
                    value={structureData?.nom ?? ''}
                    readOnly
                    className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                  />
                </div>

                {/* Type — non modifiable */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                    Type de structure
                    <Lock className="h-3 w-3" />
                  </Label>
                  <Input
                    value={structureData?.type ?? ''}
                    readOnly
                    className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                  />
                </div>
              </div>

              {/* Description — modifiable */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Décrivez votre structure..."
                  rows={3}
                  className="text-sm resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Type de contrat — non modifiable */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  Type de contrat
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  value={structureData?.typeContrat ?? ''}
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Localisation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Contacts — non modifiables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contacts
              </CardTitle>
              <CardDescription className="text-xs">Les coordonnées de votre structure</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  value={structureData?.email ?? ''}
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Téléphone principal
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  value={structureData?.contact ?? ''}
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Nom du gérant
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  value={structureData?.gerant ?? ''}
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Téléphone du gérant
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  value={structureData?.contactGerant ?? ''}
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Localisation — modifiable */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </CardTitle>
              <CardDescription className="text-xs">L'adresse de votre structure</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">

              <div className="space-y-1.5">
                <Label htmlFor="lieu" className="text-xs">Ville</Label>
                <Input
                  id="lieu"
                  {...register('lieu')}
                  placeholder="Ville"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs">Adresse complète</Label>
                <Textarea
                  id="location"
                  {...register('location')}
                  placeholder="Quartier, rue, numéro..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" disabled={isSubmitting} className="px-6">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>

        {/* Message d'avertissement + UUID */}
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-xs text-destructive italic leading-relaxed">
            ⚠ Les informations dans les cases non modifiables ne peuvent être changées qu'en
            contactant l'administration de Ticket241 et en communiquant les informations à modifier
            ainsi que votre numéro d'identification.
          </p>
          <p className="text-xs text-muted-foreground">
            Mon numéro d'identification est :{' '}
            <span className="font-mono font-medium text-foreground">
              {structureData?.uuid ?? '—'}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}