 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { SupportTicketCategory, supportCategoryConfig } from '@/types/notification';
 import { useState } from 'react';
 import { useToast } from '@/hooks/use-toast';
 
 interface CreateTicketDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function CreateTicketDialog({ open, onOpenChange }: CreateTicketDialogProps) {
   const { toast } = useToast();
   const [formData, setFormData] = useState({
     category: '' as SupportTicketCategory | '',
     subject: '',
     description: '',
   });
 
   const handleSubmit = () => {
     if (!formData.category || !formData.subject || !formData.description) {
       toast({
         title: 'Erreur',
         description: 'Veuillez remplir tous les champs.',
         variant: 'destructive',
       });
       return;
     }
 
     // TODO: Implement create ticket
     console.log('Creating ticket:', formData);
     
     toast({
       title: 'Ticket créé',
       description: 'Votre demande de support a été envoyée avec succès.',
     });
     
     setFormData({ category: '', subject: '', description: '' });
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-lg">
         <DialogHeader>
           <DialogTitle>Nouvelle demande de support</DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="category">Catégorie *</Label>
             <Select
               value={formData.category}
               onValueChange={(value: SupportTicketCategory) => 
                 setFormData(prev => ({ ...prev, category: value }))
               }
             >
               <SelectTrigger>
                 <SelectValue placeholder="Sélectionner une catégorie" />
               </SelectTrigger>
               <SelectContent>
                 {Object.entries(supportCategoryConfig).map(([key, config]) => (
                   <SelectItem key={key} value={key}>
                     {config.label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="subject">Sujet *</Label>
             <Input
               id="subject"
               placeholder="Résumez votre demande"
               value={formData.subject}
               onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="description">Description *</Label>
             <Textarea
               id="description"
               placeholder="Décrivez votre problème en détail..."
               value={formData.description}
               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
               className="min-h-[120px]"
             />
           </div>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             Annuler
           </Button>
           <Button onClick={handleSubmit}>
             Envoyer la demande
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }