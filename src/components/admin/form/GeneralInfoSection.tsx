import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/event';
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
import { CategorieEvenement } from '@/lib/Transmission';

interface GeneralInfoSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  category: string;
  onCategoryChange: (value: string) => void;
  organizationName: string;
  categoriesAPI: CategorieEvenement[];
  categoriesChargement: boolean;
}

export function GeneralInfoSection({
  register,
  errors,
  category,
  onCategoryChange,
  categoriesAPI,
  categoriesChargement,
}: GeneralInfoSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold">Informations générales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* title → name */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"
            placeholder="Ex: Festival de Musique Libreville 2026"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* category → catégories dynamiques depuis l'API */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder={categoriesChargement ? 'Chargement...' : 'Sélectionner une catégorie'} />
            </SelectTrigger>
            <SelectContent>
              {categoriesAPI.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* venueName — obligatoire backend, absent avant */}
      <div className="space-y-2">
        <Label htmlFor="venueName">Nom du lieu *</Label>
        <Input
          id="venueName"
          placeholder="Ex: Palais des Sports de Libreville, Stade de l'Amitié..."
          {...register('venueName')}
        />
        {errors.venueName && (
          <p className="text-sm text-destructive">{errors.venueName.message}</p>
        )}
      </div>

      {/* description → fullDescription */}
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
  );
}