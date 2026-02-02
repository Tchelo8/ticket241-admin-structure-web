import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, CreditCard, Calendar } from 'lucide-react';

interface OrganizerSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
}

export function OrganizerSection({ register, errors }: OrganizerSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        Informations de l'organisateur
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organizerName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nom de l'organisateur *
          </Label>
          <Input
            id="organizerName"
            placeholder="Ex: Jean Dupont"
            {...register('organizerName')}
          />
          {errors.organizerName && (
            <p className="text-sm text-destructive">
              {errors.organizerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizerPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone de l'organisateur *
          </Label>
          <Input
            id="organizerPhone"
            placeholder="Ex: +241 XX XX XX XX"
            {...register('organizerPhone')}
          />
          {errors.organizerPhone && (
            <p className="text-sm text-destructive">
              {errors.organizerPhone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lowestPrice" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Prix le plus bas (FCFA)
          </Label>
          <Input
            id="lowestPrice"
            type="number"
            min={0}
            step={500}
            {...register('lowestPrice')}
          />
          <p className="text-sm text-muted-foreground">
            Le prix affiché sur les aperçus de l'événement
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumAge" className="flex items-center gap-2">
            Âge minimum
          </Label>
          <Input
            id="minimumAge"
            type="number"
            min={0}
            max={99}
            {...register('minimumAge')}
          />
          <p className="text-sm text-muted-foreground">
            Laisser vide ou 0 si pas de restriction
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundDays" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Jours pour remboursement
          </Label>
          <Input
            id="refundDays"
            type="number"
            min={0}
            {...register('refundDays')}
          />
          <p className="text-sm text-muted-foreground">
            Nombre de jours avant l'événement pour un remboursement
          </p>
        </div>
      </div>
    </div>
  );
}
