import { useNavigate, useParams, Link } from 'react-router-dom';
import { mockEvents } from '@/data/mockEvents';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Eye,
  CreditCard,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Événement supprimé avec succès');
    navigate('/admin/events');
  };

  const ticketProgress = (event.ticketsSold / event.totalSeats) * 100;
  const revenue = event.ticketsSold * event.ticketPrice;

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
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold">{event.title}</h1>
                <EventStatusBadge status={event.status} />
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Link to={`/admin/events/${event.uuid}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 lg:h-80 object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Date et heure</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{event.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Billetterie</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{event.ticketsSold.toLocaleString('fr-FR')}</span>
                <span className="text-muted-foreground">/ {event.totalSeats.toLocaleString('fr-FR')}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${ticketProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {ticketProgress.toFixed(1)}% des places vendues
              </p>
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Prix unitaire
                  </div>
                  <span className="font-medium">{event.ticketPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Revenus
                  </div>
                  <span className="font-bold text-success">{revenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Views */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Statistiques</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.views.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteEventDialog
        event={event}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
