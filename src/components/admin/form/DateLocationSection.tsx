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
import { Calendar, Clock, MapPin, DoorOpen, DoorClosed } from "@/components/icons";
import { useEffect, useState } from 'react';
import { recuperer } from '@/lib/Transmission';


interface City {
  id: number;
  uuid: string;
  name: string;
  country: string;
  countryCode: string;
  eventCount: number;
}

interface DateLocationSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  city: string;
  onCityChange: (value: string) => void;
}

export function DateLocationSection({
  register,
  errors,
  city,
  onCityChange,
}: DateLocationSectionProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      const result = await recuperer<City[]>('/api/events/cities/get/all/active');
      if (result.succes && result.donnees) {
        setCities(result.donnees);
      }
      setLoadingCities(false);
    };
    fetchCities();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold">Date et lieu</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date *
          </Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Heure de début *
          </Label>
          <Input id="time" type="time" {...register('time')} />
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="doorOpeningTime" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4" />
            Ouverture des portes
          </Label>
          <Input
            id="doorOpeningTime"
            type="time"
            {...register('doorOpeningTime')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doorClosingTime" className="flex items-center gap-2">
            <DoorClosed className="h-4 w-4" />
            Fermeture des portes
          </Label>
          <Input
            id="doorClosingTime"
            type="time"
            {...register('doorClosingTime')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ville *
          </Label>
          <Select value={city} onValueChange={onCityChange} disabled={loadingCities}>
            <SelectTrigger>
              <SelectValue placeholder={loadingCities ? "Chargement..." : "Sélectionner une ville"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            placeholder="Ex: Boulevard Triomphal, Quartier Nombakélé"
            {...register('address')}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationDetails">
          Informations complémentaires sur le lieu (optionnel)
        </Label>
        <Textarea
          id="locationDetails"
          placeholder="Ex: Entrée par le portail principal, parking disponible..."
          rows={3}
          {...register('locationDetails')}
        />
      </div>
    </div>
  );
}