import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData, EVENT_CATEGORIES } from '@/types/event';
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

interface GeneralInfoSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  category: string;
  onCategoryChange: (value: string) => void;
  organizationName: string;
}

export function GeneralInfoSection({
  register,
  errors,
  category,
  onCategoryChange,
  organizationName,
}: GeneralInfoSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold">Informations générales</h3>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Structure organisatrice</Label>
        <Input
          id="organizationName"
          value={organizationName}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Ce champ est automatiquement rempli avec le nom de votre structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
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
  );
}
