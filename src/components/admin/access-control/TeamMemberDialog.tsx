import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMember, TeamRole, TEAM_ROLES } from '@/types/accessControl';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: Omit<TeamMember, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }) => void;
}

export function TeamMemberDialog({ member, open, onOpenChange, onSave }: TeamMemberDialogProps) {
  const { toast } = useToast();
  const isEditing = !!member;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'event_manager' as TeamRole,
    isActive: true,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        isActive: member.isActive,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'event_manager',
        isActive: true,
      });
    }
  }, [member, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une adresse email valide.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      ...formData,
      id: member?.id,
    });

    toast({
      title: isEditing ? 'Membre modifié' : 'Membre ajouté',
      description: isEditing 
        ? `${formData.name} a été mis à jour.`
        : `${formData.name} a été ajouté à l'équipe.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le membre' : 'Ajouter un membre'}
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              placeholder="+241 XX XX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: TeamRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEAM_ROLES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
