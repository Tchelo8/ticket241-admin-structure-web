import { Link, useNavigate } from 'react-router-dom';
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
    <div>
      <Link to="/admin/events" className="flex w-fit items-center gap-[7px] text-sm text-ink2 no-underline hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Mes événements
      </Link>
      <h1 className="t-page-title mt-4">Créer un événement</h1>
      <p className="mt-1.5 text-[15px] text-ink2">Six étapes, un aperçu en direct : votre événement prend forme à droite.</p>

      <div className="mt-6">
      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Créer l'événement"
        organizationName="Ticket241 Events"
      />
      </div>
    </div>
  );
}
