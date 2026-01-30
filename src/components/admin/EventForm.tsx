import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventFormData, EventStatus } from '@/types/event';
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
import { Calendar, Clock, MapPin, Image, Users, CreditCard, Save, Send } from 'lucide-react';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, 'L\'heure est requise'),
  location: z.string().min(3, 'Le lieu doit contenir au moins 3 caractères').max(200),
  imageUrl: z.string().url('URL d\'image invalide').or(z.literal('')),
  totalSeats: z.coerce.number().min(1, 'Au moins 1 place requise').max(100000),
  ticketPrice: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
  status: z.enum(['draft', 'published', 'cancelled'] as const),
});

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function EventForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Enregistrer' }: EventFormProps) {
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
      location: '',
      imageUrl: '',
      totalSeats: 100,
      ticketPrice: 5000,
      status: 'draft',
      ...defaultValues,
    },
  });

  const status = watch('status');
  const imageUrl = watch('imageUrl');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Informations générales</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"
            placeholder="Ex: Festival de Musique Libreville 2024"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre événement en détail..."
            rows={5}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Date & Location */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Date et lieu</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Heure *
            </Label>
            <Input
              id="time"
              type="time"
              {...register('time')}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Lieu *
          </Label>
          <Input
            id="location"
            placeholder="Ex: Stade de l'Amitié, Libreville"
            {...register('location')}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image de l'événement
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL de l'image</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            {...register('imageUrl')}
          />
          {errors.imageUrl && (
            <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
          )}
        </div>

        {imageUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
            <img
              src={imageUrl}
              alt="Aperçu"
              className="h-48 w-full object-cover rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
              }}
            />
          </div>
        )}
      </div>

      {/* Tickets */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Billets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="totalSeats" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nombre de places *
            </Label>
            <Input
              id="totalSeats"
              type="number"
              min={1}
              {...register('totalSeats')}
            />
            {errors.totalSeats && (
              <p className="text-sm text-destructive">{errors.totalSeats.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketPrice" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Prix du billet (FCFA) *
            </Label>
            <Input
              id="ticketPrice"
              type="number"
              min={0}
              step={500}
              {...register('ticketPrice')}
            />
            {errors.ticketPrice && (
              <p className="text-sm text-destructive">{errors.ticketPrice.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Publication</h3>
        
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={status}
            onValueChange={(value: EventStatus) => setValue('status', value)}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {status === 'draft' && 'L\'événement ne sera visible que par vous.'}
            {status === 'published' && 'L\'événement sera visible publiquement.'}
            {status === 'cancelled' && 'L\'événement sera marqué comme annulé.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {status === 'published' ? (
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
