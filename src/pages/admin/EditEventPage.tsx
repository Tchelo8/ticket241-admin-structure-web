import { useNavigate, useParams } from 'react-router-dom';
import { EventForm } from '@/components/admin/EventForm';
import { EventFormData } from '@/types/event';
import { mockEvents } from '@/data/mockEvents';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EditEventPage() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find event by UUID
  const event = mockEvents.find(e => e.uuid === uuid);

  if (!event) {
    return (
      <div className="p-6 lg:p-8 page-transition">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Événement non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L'événement que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/admin/events')}>
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Updating event:', { uuid, ...data });
    toast.success('Événement mis à jour avec succès !');
    navigate('/admin/events');
  };

  const defaultValues: Partial<EventFormData> = {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    doorOpeningTime: '',
    doorClosingTime: '',
    city: 'libreville',
    address: event.location,
    locationDetails: '',
    imageUrl: event.imageUrl,
    organizationName: 'Ticket241 Events',
    organizerName: '',
    organizerPhone: '',
    category: 'concert',
    ticketCategories: [],
    isPublished: event.status === 'published',
    isFeatured: false,
    isPromoted: false,
    isPublic: true,
    isOnline: false,
    onlineLink: '',
    minimumAge: 0,
    lowestPrice: event.ticketPrice,
    refundDays: 7,
    termsAndConditions: '',
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
        <h1 className="text-2xl lg:text-3xl font-bold">Modifier l'événement</h1>
        <p className="text-muted-foreground mt-1">
          Mettez à jour les informations de "{event.title}"
        </p>
      </div>

      {/* Form - Full Width */}
      <EventForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Enregistrer les modifications"
        organizationName="Ticket241 Events"
      />
    </div>
  );
}
