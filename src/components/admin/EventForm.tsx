import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventFormData, TicketCategory } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Save, Send, CheckCircle, Circle, Image as ImageIcon } from "@/components/icons";
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { dateCourte, fcfa } from '@/lib/format';
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
  const [villes, setVilles] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

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

  // ── Aperçu en direct et vérifications avant publication ───────────────────

  const title = watch('title');
  const date = watch('date');
  const time = watch('time');
  const venueName = watch('venueName');
  const organizerName = watch('organizerName');
  const organizerPhone = watch('organizerPhone');
  const categoriesActives = ticketCategories.filter((cat) => cat.isEnabled);
  const nomCategorie = categoriesAPI.find((c) => String(c.id) === categoryStr)?.displayName;
  const nomVille = villes.find((v) => String(v.id) === String(city))?.name;
  const prixMin = categoriesActives.length ? Math.min(...categoriesActives.map((c) => Number(c.price) || 0)) : null;

  const verifications = [
    { label: 'Titre', ok: (title ?? '').trim().length >= 3 },
    { label: 'Catégorie', ok: !!nomCategorie },
    { label: 'Date et heure', ok: !!date && !!time },
    { label: 'Lieu et ville', ok: !!venueName?.trim() && !!city },
    { label: 'Image de couverture', ok: !!imageUrl },
    { label: 'Billets', ok: categoriesActives.length > 0 },
    { label: 'Contact organisateur', ok: (organizerName ?? '').trim().length >= 2 && (organizerPhone ?? '').trim().length >= 8 },
  ];
  const faites = verifications.filter((v) => v.ok).length;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-wrap items-start gap-6">
      <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-[18px]">
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
          onCitiesLoaded={setVilles}
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
      </div>

      <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 lg:sticky lg:top-[90px]">
        {/* Aperçu de la carte publique */}
        <div className="overflow-hidden rounded-md border border-line bg-card shadow-shm">
          <div className="border-b border-line px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink3">
            Aperçu sur Ticket241
          </div>
          <div className="p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[5px] bg-surf">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="t-img h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink3">
                  <ImageIcon className="h-9 w-9" />
                </div>
              )}
              <span className="absolute left-2.5 top-2.5 rounded-pill bg-[rgba(253,253,252,.94)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#201e1d]">
                {nomCategorie ?? 'Catégorie'}
              </span>
            </div>
            <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-acc">
              {date ? dateCourte(`${date}T${time || '00:00'}`) : 'Date à définir'}
            </div>
            <div className="mt-1.5 text-[19px] font-semibold leading-tight tracking-[-0.018em]">
              {title?.trim() || 'Titre de l’événement'}
            </div>
            <div className="mt-1.5 text-[13px] text-ink3">
              {[venueName?.trim(), nomVille].filter(Boolean).join(', ') || 'Lieu à définir'}
            </div>
            <div className="my-3 h-px bg-line" />
            <div className="t-num text-[15px] font-semibold">
              {prixMin === null ? 'Aucun billet' : prixMin === 0 ? 'Gratuit' : `À partir de ${fcfa(prixMin)}`}
            </div>
          </div>
        </div>

        {/* Vérifications et envoi */}
        <div className="t-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink3">Avant publication</span>
            <span className="t-num text-[12.5px] text-ink3">
              {faites}/{verifications.length}
            </span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {verifications.map((v) => (
              <li key={v.label} className={cn('flex items-center gap-[9px] text-sm', v.ok ? 'text-ink' : 'text-ink3')}>
                {v.ok ? (
                  <CheckCircle className="h-[17px] w-[17px] text-acc" weight="fill" />
                ) : (
                  <Circle className="h-[17px] w-[17px] text-ink3" />
                )}
                {v.label}
              </li>
            ))}
          </ul>

          {/* Barre de progression upload image */}
          {uploadProgression !== null && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-ink2">Envoi de l’image…</span>
                <span className="t-num font-semibold">{uploadProgression}%</span>
              </div>
              <div className="t-meter">
                <span style={{ width: `${uploadProgression}%` }} />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || ticketCategories.length === 0}
            className="mt-4 h-[50px] w-full text-[15.5px]"
          >
            {submitting ? (
              <>
                <span className="h-[17px] w-[17px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
                {uploadProgression !== null ? `Envoi de l’image… ${uploadProgression}%` : 'Enregistrement…'}
              </>
            ) : (
              <>
                {isPublished ? <Send className="h-[17px] w-[17px]" /> : <Save className="h-[17px] w-[17px]" />}
                {submitLabel}
              </>
            )}
          </Button>
          <p className="mt-2.5 text-[12.5px] leading-[1.45] text-ink3">
            {ticketCategories.length === 0
              ? 'Ajoutez au moins une catégorie de billets pour enregistrer.'
              : faites < verifications.length
              ? 'Les champs obligatoires sont vérifiés à l’enregistrement.'
              : 'Tout est prêt.'}
          </p>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/events')} className="mt-2.5 h-[42px] w-full font-normal">
            Annuler
          </Button>
        </div>
      </aside>
    </form>
  );
}
