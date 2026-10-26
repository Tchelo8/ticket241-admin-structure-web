import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SectionTitle } from "./SectionTitle";
import { EventFormData } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from "@/components/icons";
import { useRef, useState } from 'react';

interface ImageUploadSectionProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  imageUrl: string;
  onImageChange: (file: File | null, url: string) => void;
}

export function ImageUploadSection({
  errors,
  imageUrl,
  onImageChange,
}: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange(file, url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="t-card space-y-6 p-[22px]">
      <SectionTitle n="03">Image de l'événement</SectionTitle>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image">Téléverser une image</Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Parcourir
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Formats acceptés : JPG, PNG, GIF. Taille maximale : 5 Mo.
          </p>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Aperçu"
                className="h-48 w-full object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
