import { useState, useRef } from 'react';
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
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockOrganization } from '@/data/mockOrganization';
import { OrganizationFormData, ORGANIZATION_TYPES, CONTRACT_TYPES } from '@/types/organization';
import { CITIES } from '@/types/event';

const organizationSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  location: z.string().min(1, 'Veuillez sélectionner une ville'),
  lieu: z.string().optional(),
  gerant: z.string().min(2, 'Le nom du gérant est requis'),
  contact: z.string().min(8, 'Numéro de téléphone invalide'),
  contactGerant: z.string().optional(),
  email: z.string().email('Email invalide'),
  type: z.string().min(1, 'Veuillez sélectionner un type'),
  logoUrl: z.string().optional(),
  typeContrat: z.string().min(1, 'Veuillez sélectionner un type de contrat'),
});

export default function OrganizationPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(mockOrganization.logoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      nom: mockOrganization.nom,
      description: mockOrganization.description,
      location: mockOrganization.location.toLowerCase(),
      lieu: mockOrganization.lieu,
      gerant: mockOrganization.gerant,
      contact: mockOrganization.contact,
      contactGerant: mockOrganization.contactGerant,
      email: mockOrganization.email,
      type: mockOrganization.type,
      logoUrl: mockOrganization.logoUrl,
      typeContrat: mockOrganization.typeContrat,
    },
  });

  const watchedType = watch('type');
  const watchedLocation = watch('location');
  const watchedTypeContrat = watch('typeContrat');

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Organization data:', data);
    toast({
      title: 'Modifications enregistrées',
      description: 'Les informations de votre structure ont été mises à jour.',
    });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ma structure</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations de votre organisation
          </p>
        </div>
      </div>

      {/* Verification Status Card */}
      <Card className={mockOrganization.isVerified ? 'border-primary/50 bg-primary/5' : 'border-destructive/50 bg-destructive/5'}>
        <CardContent className="flex items-center gap-4 py-4">
          {mockOrganization.isVerified ? (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary">Structure vérifiée</h3>
                  <Badge variant="outline" className="border-primary text-primary">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Votre structure a été vérifiée et validée par notre équipe.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{mockOrganization.validatedEventCount}</p>
                <p className="text-xs text-muted-foreground">événements validés</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-destructive">Structure non vérifiée</h3>
                  <Badge variant="outline" className="border-destructive text-destructive">
                    En attente
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Votre structure est en attente de vérification. Complétez toutes les informations pour accélérer le processus.
                </p>
              </div>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                Demander la vérification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Logo
              </CardTitle>
              <CardDescription>
                Le logo de votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-32 w-32 rounded-xl object-cover border-2 border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
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
                  <div className="h-32 w-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
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
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Changer le logo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General Info Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Les informations principales de votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la structure *</Label>
                  <Input
                    id="nom"
                    {...register('nom')}
                    placeholder="Nom de votre structure"
                  />
                  {errors.nom && (
                    <p className="text-sm text-destructive">{errors.nom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de structure *</Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Décrivez votre structure..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeContrat">Type de contrat *</Label>
                  <Select
                    value={watchedTypeContrat}
                    onValueChange={(value) => setValue('typeContrat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.typeContrat && (
                    <p className="text-sm text-destructive">{errors.typeContrat.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Location Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacts
              </CardTitle>
              <CardDescription>
                Les coordonnées de votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Téléphone principal *
                </Label>
                <Input
                  id="contact"
                  {...register('contact')}
                  placeholder="+241 00 00 00 00"
                />
                {errors.contact && (
                  <p className="text-sm text-destructive">{errors.contact.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gerant">
                  <User className="h-4 w-4 inline mr-2" />
                  Nom du gérant *
                </Label>
                <Input
                  id="gerant"
                  {...register('gerant')}
                  placeholder="Nom complet du gérant"
                />
                {errors.gerant && (
                  <p className="text-sm text-destructive">{errors.gerant.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactGerant">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Téléphone du gérant
                </Label>
                <Input
                  id="contactGerant"
                  {...register('contactGerant')}
                  placeholder="+241 00 00 00 00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisation
              </CardTitle>
              <CardDescription>
                L'adresse de votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ville *</Label>
                <Select
                  value={watchedLocation}
                  onValueChange={(value) => setValue('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu">Adresse complète</Label>
                <Textarea
                  id="lieu"
                  {...register('lieu')}
                  placeholder="Quartier, rue, numéro..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}
