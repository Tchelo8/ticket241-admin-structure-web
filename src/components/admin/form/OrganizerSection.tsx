import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Calendar, Users, Ticket } from "@/components/icons";

interface OrganizerSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  totalSeats: number;
}

export function OrganizerSection({ register, errors, totalSeats }: OrganizerSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        Informations de l'organisateur & capacité
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* organizerName → organizerName backend */}
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
            <p className="text-sm text-destructive">{errors.organizerName.message}</p>
          )}
        </div>

        {/* organizerPhone → organizerPhone backend (format +XXXXXXXXXXX) */}
        <div className="space-y-2">
          <Label htmlFor="organizerPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone de l'organisateur *
          </Label>
          <Input
            id="organizerPhone"
            placeholder="+24107000000"
            {...register('organizerPhone')}
          />
          <p className="text-sm text-muted-foreground">
            Format sans espaces : +24107000000
          </p>
          {errors.organizerPhone && (
            <p className="text-sm text-destructive">{errors.organizerPhone.message}</p>
          )}
        </div>

        {/* totalSeats → totalSeats backend, calculé à partir des catégories de billets */}
        <div className="space-y-2">
          <Label htmlFor="totalSeats" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Capacité totale *
          </Label>
          <Input
            id="totalSeats"
            type="number"
            value={totalSeats}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-sm text-muted-foreground">
            Calculée automatiquement : somme des places des catégories de billets activées
          </p>
          {errors.totalSeats && (
            <p className="text-sm text-destructive">{errors.totalSeats.message}</p>
          )}
        </div>

        {/* maxTicketsPerUser → maxTicketsPerUser backend */}
        <div className="space-y-2">
          <Label htmlFor="maxTicketsPerUser" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Max tickets par utilisateur
          </Label>
          <Input
            id="maxTicketsPerUser"
            type="number"
            min={1}
            max={100}
            {...register('maxTicketsPerUser')}
          />
          <p className="text-sm text-muted-foreground">
            Entre 1 et 100 tickets par utilisateur
          </p>
        </div>

        {/* minimumAge → minAge backend */}
        <div className="space-y-2">
          <Label htmlFor="minimumAge">Âge minimum</Label>
          <Input
            id="minimumAge"
            type="number"
            min={0}
            max={99}
            {...register('minimumAge')}
          />
          <p className="text-sm text-muted-foreground">
            Laisser à 0 si pas de restriction d'âge
          </p>
        </div>

        {/* refundDays → refundDeadlineDays backend */}
        <div className="space-y-2">
          <Label htmlFor="refundDays" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Délai de remboursement (jours)
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