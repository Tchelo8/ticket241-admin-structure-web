import { useNavigate } from 'react-router-dom';
import { EventForm } from '@/components/admin/EventForm';
import { EventFormData } from '@/types/event';
import { ArrowLeft } from "@/components/icons";
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Creating event:', data);
    toast.success('Événement créé avec succès !');
    navigate('/admin/events');
  };

  return (
    <div className="p-6 lg:p-8 page-transition">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/events')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux événements
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold">Créer un événement</h1>
        <p className="text-muted-foreground mt-1">
          Remplissez les informations pour créer un nouvel événement
        </p>
      </div>

      {/* Form - Full Width */}
      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Créer l'événement"
        organizationName="Ticket241 Events"
      />
    </div>
  );
}
