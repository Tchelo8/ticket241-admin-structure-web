import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScanAgent } from '@/types/accessControl';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface ScanAgentDialogProps {
  agent: ScanAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: Omit<ScanAgent, 'id' | 'createdAt' | 'lastActivity'> & { id?: string }) => void;
  availableEvents: { id: string; name: string }[];
}

export function ScanAgentDialog({ agent, open, onOpenChange, onSave, availableEvents }: ScanAgentDialogProps) {
  const { toast } = useToast();
  const isEditing = !!agent;
  const [showPin, setShowPin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    assignedEvents: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        phone: agent.phone,
        pin: agent.pin,
        assignedEvents: agent.assignedEvents,
        isActive: agent.isActive,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        pin: '',
        assignedEvents: [],
        isActive: true,
      });
    }
    setShowPin(false);
  }, [agent, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.pin) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      toast({
        title: 'Erreur',
        description: 'Le code PIN doit être composé de 4 chiffres.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      ...formData,
      id: agent?.id,
    });

    toast({
      title: isEditing ? 'Agent modifié' : 'Agent ajouté',
      description: isEditing 
        ? `${formData.name} a été mis à jour.`
        : `${formData.name} a été ajouté.`,
    });

    onOpenChange(false);
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedEvents: prev.assignedEvents.includes(eventId)
        ? prev.assignedEvents.filter(id => id !== eventId)
        : [...prev.assignedEvents, eventId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'agent de scan' : 'Ajouter un agent de scan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone *</Label>
            <Input
              id="phone"
              placeholder="+241 XX XX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Code PIN (4 chiffres) *</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? 'text' : 'password'}
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, pin: value }));
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              L'agent utilisera ce code pour se connecter à l'application de scan
            </p>
          </div>

          <div className="space-y-2">
            <Label>Événements assignés</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-[150px] overflow-y-auto">
              {availableEvents.length > 0 ? (
                availableEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-2">
                    <Checkbox
                      id={event.id}
                      checked={formData.assignedEvents.includes(event.id)}
                      onCheckedChange={() => toggleEvent(event.id)}
                    />
                    <label htmlFor={event.id} className="text-sm cursor-pointer flex-1">
                      {event.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun événement disponible</p>
              )}
            </div>
            {formData.assignedEvents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.assignedEvents.map(eventId => {
                  const event = availableEvents.find(e => e.id === eventId);
                  return event ? (
                    <Badge key={eventId} variant="secondary" className="text-xs">
                      {event.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
