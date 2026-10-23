import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventFormData, TicketCategory } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

import { GeneralInfoSection } from './form/GeneralInfoSection';
import { DateLocationSection } from './form/DateLocationSection';
import { ImageUploadSection } from './form/ImageUploadSection';
import { TicketCategoriesSection } from './form/TicketCategoriesSection';
import { OrganizerSection } from './form/OrganizerSection';
import { SettingsSection } from './form/SettingsSection';
import { evenements, obtenirUtilisateur, CategorieEvenement } from '@/lib/Transmission';
import { CreateEventDto } from '@/lib/Transmission';
import { uploaderImageAvecProgression } from '@/lib/Cloudinary';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.coerce.number().min(1, 'La catégorie est requise'),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  doorOpeningTime: z.string().optional(),
  doorClosingTime: z.string().optional(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
  venueName: z.string().min(1, 'Le nom du lieu est obligatoire').max(200),
  city: z.string().min(1, 'La ville est requise'),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères").max(200),
  locationDetails: z.string().optional(),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  organizationName: z.string(),
  organizerName: z.string().min(2, 'Le nom est requis'),
  organizerPhone: z.string().min(8, 'Le numéro de téléphone est requis'),
  ticketCategories: z.array(z.any()),
  totalSeats: z.coerce.number().min(1, 'Au moins 1 place est requise'),
  maxTicketsPerUser: z.coerce.number().min(1).max(100),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isPromoted: z.boolean(),
  isPublic: z.boolean(),
  isOnline: z.boolean(),
  onlineLink: z.string().optional(),
  minimumAge: z.coerce.number().min(0).max(99).optional(),
  lowestPrice: z.coerce.number().min(0).optional(),
  refundDays: z.coerce.number().min(0).optional(),
  termsAndConditions: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  validationMode: z.enum(['AUTO', 'MANUAL']),
}).refine((data) => {
  if (data.isOnline && !data.onlineLink) return false;
  return true;
}, {
  message: 'Le lien est requis pour les événements en ligne',
  path: ['onlineLink'],
});

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit?: (data: EventFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  organizationName?: string;
}

const formaterTelephone = (tel: string): string => {
  const propre = tel.replace(/\s/g, '');
  if (propre.startsWith('+')) return propre;
  if (propre.startsWith('241')) return `+${propre}`;
  return `+241${propre}`;
};

export function EventForm({
  defaultValues,
  onSubmit,
  isSubmitting: externalIsSubmitting,
  submitLabel = 'Enregistrer',
  organizationName = 'Ticket241 Events',
}: EventFormProps) {
  const [categoriesAPI, setCategoriesAPI] = useState<CategorieEvenement[]>([]);
  const [categoriesChargement, setCategoriesChargement] = useState(true);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>(
    defaultValues?.ticketCategories || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les catégories depuis l'API au montage
  useEffect(() => {
    let annule = false;
    (async () => {
      setCategoriesChargement(true);
      const { succes, donnees } = await evenements.categories();
      if (!annule) {
        if (succes && donnees) {
          setCategoriesAPI(donnees);
        }
        setCategoriesChargement(false);
      }
    })();
    return () => { annule = true; };
  }, []);

  // Progression de l'upload image (0-100), null = pas d'upload en cours
  const [uploadProgression, setUploadProgression] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 0,
      date: '',
      time: '',
      endDate: '',
      endTime: '',
      doorOpeningTime: '',
      doorClosingTime: '',
      saleStartDate: '',
      saleEndDate: '',
      venueName: '',
      city: '',
      address: '',
      locationDetails: '',
      imageUrl: '',
      imageFile: null,
      organizationName,
      organizerName: '',
      organizerPhone: '',
      ticketCategories: [],
      totalSeats: 0,
      maxTicketsPerUser: 10,
      isPublished: true,
      isFeatured: false,
      isPromoted: false,
      isPublic: true,
      isOnline: false,
      onlineLink: '',
      minimumAge: 0,
      lowestPrice: 0,
      refundDays: 7,
      termsAndConditions: '',
      cancellationPolicy: '',
      validationMode: 'AUTO',
      ...defaultValues,
    },
  });

  const category    = watch('category');
  const categoryStr = String(category || '');
  const city        = watch('city');
  const imageUrl    = watch('imageUrl');
  const imageFile   = watch('imageFile');
  const isPublished = watch('isPublished');
  const isFeatured  = watch('isFeatured');
  const isPromoted  = watch('isPromoted');
  const isPublic    = watch('isPublic');
  const isOnline    = watch('isOnline');

  // Capacité totale = somme des places des catégories activées (seules celles-ci sont envoyées)
  const capaciteTotale = ticketCategories
    .filter((cat) => cat.isEnabled)
    .reduce((acc, cat) => acc + cat.availableSeats, 0);

  useEffect(() => {
    setValue('totalSeats', capaciteTotale, { shouldValidate: capaciteTotale > 0 });
  }, [capaciteTotale, setValue]);

  // "2026-06-01" + "20:00" → "2026-06-01T20:00:00"
  const combinerDateHeure = (date: string, heure: string): string | undefined => {
    if (!date || !heure) return undefined;
    return `${date}T${heure}:00`;
  };

  const combinerAvecDateEvenement = (date: string, heure: string): string | undefined => {
    if (!date || !heure) return undefined;
    return `${date}T${heure}:00`;
  };

  const handleFormSubmit = async (data: EventFormData) => {
    if (ticketCategories.length === 0) return;

    setIsSubmitting(true);

    const utilisateur = obtenirUtilisateur<{ structureId: number }>();
    const structureId = utilisateur?.structureId;

    if (!structureId) {
      setIsSubmitting(false);
      return;
    }

    // ── Étape 1 : Upload image vers Cloudinary si un fichier est sélectionné ──
    let coverImageUrl: string | undefined = undefined;

    if (imageFile instanceof File) {
      try {
        setUploadProgression(0);
        coverImageUrl = await uploaderImageAvecProgression(
          imageFile,
          (pourcentage) => setUploadProgression(pourcentage),
          'events'  // dossier Cloudinary
        );
        setUploadProgression(null);
      } catch (erreur) {
        console.error('Erreur upload image:', erreur);
        setUploadProgression(null);
        setIsSubmitting(false);
        return;
      }
    }

    // ── Étape 2 : Construire le payload JSON avec l'URL Cloudinary ────────────
    const payload: CreateEventDto = {
      // Obligatoires
      name:               data.title,
      fullDescription:    data.description,
      categoryId:         data.category,
      startDate:          combinerDateHeure(data.date, data.time) ?? '',
      venueName:          data.venueName,
      venueAddress:       data.address,
      cityId:             Number(data.city),
      totalSeats:         capaciteTotale,
      maxTicketsPerUser:  data.maxTicketsPerUser,
      structureId,
      organizerName:      data.organizerName,
      organizerPhone:     formaterTelephone(data.organizerPhone),
      isPublic:           data.isPublic,
      isOnline:           data.isOnline,
      allowRefund:        true,
      refundDeadlineDays: data.refundDays ?? 7,
      validationMode:     data.validationMode,

      // Optionnels — inclus seulement si renseignés
      ...(coverImageUrl
        ? { coverImageUrl }
        : {}),
      ...(data.endDate && data.endTime
        ? { endDate: combinerDateHeure(data.endDate, data.endTime) }
        : {}),
      ...(data.doorOpeningTime
        ? { doorsOpenTime: combinerAvecDateEvenement(data.date, data.doorOpeningTime) }
        : {}),
      ...(data.locationDetails
        ? { venueAccessInfo: data.locationDetails }
        : {}),
      ...(data.isOnline && data.onlineLink
        ? { onlineMeetingUrl: data.onlineLink }
        : {}),
      ...(data.minimumAge && data.minimumAge > 0
        ? { minAge: data.minimumAge }
        : {}),
      ...(data.termsAndConditions
        ? { termsAndConditions: data.termsAndConditions }
        : {}),
      ...(data.cancellationPolicy
        ? { cancellationPolicy: data.cancellationPolicy }
        : {}),

      // Catégories de tickets
      ticketCategories: ticketCategories
        .filter((cat) => cat.isEnabled)
        .map((cat, index) => ({
          name:               cat.name,
          price:              cat.price,
          totalSeats:         cat.availableSeats,
          maxTicketsPerOrder: cat.maxPerPerson,
          displayOrder:       cat.displayOrder ?? index,
          ...(cat.description ? { description: cat.description } : {}),
          ...(cat.benefits    ? { benefits: cat.benefits }       : {}),
          ...(cat.colorCode   ? { colorCode: cat.colorCode }     : {}),
        })),
    };

    // ── Étape 3 : Envoi en JSON au backend ───────────────────────────────────
    await evenements.creer(payload);

    setIsSubmitting(false);
    onSubmit?.({ ...data, ticketCategories });
  };

  const handleToggleChange = (field: keyof EventFormData, value: boolean) => {
    setValue(field, value as any);
  };

  const handleImageChange = (file: File | null, url: string) => {
    setValue('imageFile', file);
    setValue('imageUrl', url);
  };

  const submitting = externalIsSubmitting ?? isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <GeneralInfoSection
        register={register}
        errors={errors}
        category={categoryStr}
        onCategoryChange={(value) => setValue('category', Number(value))}
        organizationName={organizationName}
        categoriesAPI={categoriesAPI}
        categoriesChargement={categoriesChargement}
      />

      <DateLocationSection
        register={register}
        errors={errors}
        city={city}
        onCityChange={(value) => setValue('city', value)}
      />

      <ImageUploadSection
        register={register}
        errors={errors}
        imageUrl={imageUrl}
        onImageChange={handleImageChange}
      />

      <TicketCategoriesSection
        ticketCategories={ticketCategories}
        onCategoriesChange={setTicketCategories}
      />

      <OrganizerSection register={register} errors={errors} totalSeats={capaciteTotale} />

      <SettingsSection
        register={register}
        errors={errors}
        isPublished={isPublished}
        isFeatured={isFeatured}
        isPromoted={isPromoted}
        isPublic={isPublic}
        isOnline={isOnline}
        onToggleChange={handleToggleChange}
      />

      <div className="bg-card rounded-xl border border-border p-6">
        {ticketCategories.length === 0 && (
          <p className="text-sm text-destructive mb-4">
            Vous devez ajouter au moins une catégorie de ticket.
          </p>
        )}

        {/* Barre de progression upload image */}
        {uploadProgression !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Upload de l'image en cours...</span>
              <span className="font-medium">{uploadProgression}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgression}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={submitting || ticketCategories.length === 0}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPublished ? (
              <Send className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {submitting
              ? uploadProgression !== null
                ? `Upload image... ${uploadProgression}%`
                : 'Enregistrement...'
              : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}