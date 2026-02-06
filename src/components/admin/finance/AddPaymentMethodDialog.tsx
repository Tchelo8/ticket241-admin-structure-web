import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod } from '@/types/finance';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Building2, Smartphone } from 'lucide-react';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (payment: {
    method: PaymentMethod;
    details: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      mobileProvider?: string;
      phoneNumber?: string;
    };
    isPrimary: boolean;
  }) => void;
}

export function AddPaymentMethodDialog({ open, onOpenChange, onAdd }: AddPaymentMethodDialogProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    mobileProvider: '',
    phoneNumber: '',
    isPrimary: false,
  });

  const handleSubmit = () => {
    if (!method) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un type de paiement.',
        variant: 'destructive',
      });
      return;
    }

    if (method === 'bank_transfer' && (!formData.bankName || !formData.accountNumber || !formData.accountHolder)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs bancaires.',
        variant: 'destructive',
      });
      return;
    }

    if (method === 'mobile_money' && (!formData.mobileProvider || !formData.phoneNumber)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs Mobile Money.',
        variant: 'destructive',
      });
      return;
    }

    onAdd({
      method,
      details: method === 'bank_transfer' 
        ? { bankName: formData.bankName, accountNumber: formData.accountNumber, accountHolder: formData.accountHolder }
        : { mobileProvider: formData.mobileProvider, phoneNumber: formData.phoneNumber },
      isPrimary: formData.isPrimary,
    });

    toast({
      title: 'Moyen de paiement ajouté',
      description: 'Votre nouveau moyen de paiement a été enregistré.',
    });

    // Reset form
    setMethod('');
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      mobileProvider: '',
      phoneNumber: '',
      isPrimary: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un moyen de paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type de paiement *</Label>
            <Select value={method} onValueChange={(value: PaymentMethod) => setMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Virement bancaire
                  </div>
                </SelectItem>
                <SelectItem value="mobile_money">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Money
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'bank_transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bankName">Nom de la banque *</Label>
                <Input
                  id="bankName"
                  placeholder="Ex: BGFI Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Numéro de compte *</Label>
                <Input
                  id="accountNumber"
                  placeholder="Ex: GA00 1234 5678 9012"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Titulaire du compte *</Label>
                <Input
                  id="accountHolder"
                  placeholder="Nom du titulaire"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                />
              </div>
            </>
          )}

          {method === 'mobile_money' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobileProvider">Opérateur *</Label>
                <Select 
                  value={formData.mobileProvider} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mobileProvider: value }))}
                >
                  <SelectTrigger id="mobileProvider">
                    <SelectValue placeholder="Sélectionner l'opérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                    <SelectItem value="Moov Money">Moov Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Ex: +241 XX XX XX XX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!method}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
