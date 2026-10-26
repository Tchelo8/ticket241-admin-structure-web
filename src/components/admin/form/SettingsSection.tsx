import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, Star, Megaphone, Eye, Link, FileText } from "@/components/icons";

interface SettingsSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  isPublished: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  isPublic: boolean;
  isOnline: boolean;
  onToggleChange: (field: keyof EventFormData, value: boolean) => void;
}

export function SettingsSection({
  register,
  errors,
  isPublished,
  isFeatured,
  isPromoted,
  isPublic,
  isOnline,
  onToggleChange,
}: SettingsSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Paramètres de publication
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="isPublished" className="font-medium">
                Publié
              </Label>
              <p className="text-sm text-muted-foreground">
                Rendre visible l'événement
              </p>
            </div>
          </div>
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={(checked) => onToggleChange('isPublished', checked)}
          />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="isFeatured" className="font-medium">
                À la une
              </Label>
              <p className="text-sm text-muted-foreground">
                Mettre en avant
              </p>
            </div>
          </div>
          <Switch
            id="isFeatured"
            checked={isFeatured}
            onCheckedChange={(checked) => onToggleChange('isFeatured', checked)}
          />
        </div>

        {/* Promoted toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="isPromoted" className="font-medium">
                Promu
              </Label>
              <p className="text-sm text-muted-foreground">
                Promotion payante
              </p>
            </div>
          </div>
          <Switch
            id="isPromoted"
            checked={isPromoted}
            onCheckedChange={(checked) => onToggleChange('isPromoted', checked)}
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="isPublic" className="font-medium">
                Public
              </Label>
              <p className="text-sm text-muted-foreground">
                Visible par tous
              </p>
            </div>
          </div>
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={(checked) => onToggleChange('isPublic', checked)}
          />
        </div>

        {/* Online toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="isOnline" className="font-medium">
                En ligne
              </Label>
              <p className="text-sm text-muted-foreground">
                Événement virtuel
              </p>
            </div>
          </div>
          <Switch
            id="isOnline"
            checked={isOnline}
            onCheckedChange={(checked) => onToggleChange('isOnline', checked)}
          />
        </div>
      </div>

      {/* Online link field */}
      {isOnline && (
        <div className="space-y-2 border-t pt-6">
          <Label htmlFor="onlineLink" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Lien de l'événement en ligne *
          </Label>
          <Input
            id="onlineLink"
            placeholder="Ex: https://zoom.us/j/1234567890"
            {...register('onlineLink')}
          />
          {errors.onlineLink && (
            <p className="text-sm text-destructive">{errors.onlineLink.message}</p>
          )}
        </div>
      )}

      {/* Terms and conditions */}
      <div className="space-y-2 border-t pt-6">
        <Label htmlFor="termsAndConditions" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Termes et conditions
        </Label>
        <Textarea
          id="termsAndConditions"
          placeholder="Entrez les termes et conditions de votre événement..."
          rows={4}
          {...register('termsAndConditions')}
        />
        <p className="text-sm text-muted-foreground">
          Ces conditions seront affichées lors de l'achat de billets
        </p>
      </div>
    </div>
  );
}
