import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventFormData, TicketCategory } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';
import { useState } from 'react';

import { GeneralInfoSection } from './form/GeneralInfoSection';
import { DateLocationSection } from './form/DateLocationSection';
import { ImageUploadSection } from './form/ImageUploadSection';
import { TicketCategoriesSection } from './form/TicketCategoriesSection';
import { OrganizerSection } from './form/OrganizerSection';
import { SettingsSection } from './form/SettingsSection';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  doorOpeningTime: z.string().optional(),
  doorClosingTime: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères"),
  locationDetails: z.string().optional(),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  organizationName: z.string(),
  organizerName: z.string().min(2, 'Le nom est requis'),
  organizerPhone: z.string().min(8, 'Le numéro de téléphone est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  ticketCategories: z.array(z.any()),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isPromoted: z.boolean(),
  isPublic: z.boolean(),
  isOnline: z.boolean(),
  onlineLink: z.string().optional(),
  minimumAge: z.coerce.number().min(0).optional(),
  lowestPrice: z.coerce.number().min(0).optional(),
  refundDays: z.coerce.number().min(0).optional(),
  termsAndConditions: z.string().optional(),
}).refine((data) => {
  if (data.isOnline && !data.onlineLink) {
    return false;
  }
  return true;
}, {
  message: 'Le lien est requis pour les événements en ligne',
  path: ['onlineLink'],
});

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  organizationName?: string;
}

export function EventForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Enregistrer',
  organizationName = 'Ticket241 Events',
}: EventFormProps) {
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>(
    defaultValues?.ticketCategories || []
  );

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
      date: '',
      time: '',
      doorOpeningTime: '',
      doorClosingTime: '',
      city: '',
      address: '',
      locationDetails: '',
      imageUrl: '',
      imageFile: null,
      organizationName: organizationName,
      organizerName: '',
      organizerPhone: '',
      category: '',
      ticketCategories: [],
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
      ...defaultValues,
    },
  });

  const category = watch('category');
  const city = watch('city');
  const imageUrl = watch('imageUrl');
  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');
  const isPromoted = watch('isPromoted');
  const isPublic = watch('isPublic');
  const isOnline = watch('isOnline');

  const handleFormSubmit = (data: EventFormData) => {
    onSubmit({
      ...data,
      ticketCategories,
    });
  };

  const handleToggleChange = (field: keyof EventFormData, value: boolean) => {
    setValue(field, value as any);
  };

  const handleImageChange = (file: File | null, url: string) => {
    setValue('imageFile', file);
    setValue('imageUrl', url);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* General Info */}
      <GeneralInfoSection
        register={register}
        errors={errors}
        category={category}
        onCategoryChange={(value) => setValue('category', value)}
        organizationName={organizationName}
      />

      {/* Date & Location */}
      <DateLocationSection
        register={register}
        errors={errors}
        city={city}
        onCityChange={(value) => setValue('city', value)}
      />

      {/* Image */}
      <ImageUploadSection
        register={register}
        errors={errors}
        imageUrl={imageUrl}
        onImageChange={handleImageChange}
      />

      {/* Ticket Categories */}
      <TicketCategoriesSection
        ticketCategories={ticketCategories}
        onCategoriesChange={setTicketCategories}
      />

      {/* Organizer Info */}
      <OrganizerSection register={register} errors={errors} />

      {/* Settings & Publication */}
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

      {/* Submit Button */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPublished ? (
              <Send className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Enregistrement...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
