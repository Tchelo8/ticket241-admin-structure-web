import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PaymentInfo } from '@/types/finance';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EditPaymentMethodDialogProps {
  payment: PaymentInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payment: PaymentInfo) => void;
  onDelete: (paymentId: string) => void;
}

export function EditPaymentMethodDialog({ payment, open, onOpenChange, onSave, onDelete }: EditPaymentMethodDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    mobileProvider: '',
    phoneNumber: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        bankName: payment.details.bankName || '',
        accountNumber: payment.details.accountNumber || '',
        accountHolder: payment.details.accountHolder || '',
        mobileProvider: payment.details.mobileProvider || '',
        phoneNumber: payment.details.phoneNumber || '',
        isPrimary: payment.isPrimary,
      });
    }
  }, [payment]);

  if (!payment) return null;

  const handleSubmit = () => {
    if (payment.method === 'bank_transfer' && (!formData.bankName || !formData.accountNumber || !formData.accountHolder)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs bancaires.',
        variant: 'destructive',
      });
      return;
    }

    if (payment.method === 'mobile_money' && (!formData.mobileProvider || !formData.phoneNumber)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs Mobile Money.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      ...payment,
      isPrimary: formData.isPrimary,
      details: payment.method === 'bank_transfer' 
        ? { bankName: formData.bankName, accountNumber: formData.accountNumber, accountHolder: formData.accountHolder }
        : { mobileProvider: formData.mobileProvider, phoneNumber: formData.phoneNumber },
    });

    toast({
      title: 'Modifications enregistrées',
      description: 'Le moyen de paiement a été mis à jour.',
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(payment.id);
    toast({
      title: 'Moyen de paiement supprimé',
      description: 'Le moyen de paiement a été supprimé.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le moyen de paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {payment.method === 'bank_transfer' && (
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

          {payment.method === 'mobile_money' && (
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

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Moyen de paiement principal</Label>
              <p className="text-sm text-muted-foreground">
                Les versements seront effectués sur ce compte par défaut
              </p>
            </div>
            <Switch
              checked={formData.isPrimary}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrimary: checked }))}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
            Supprimer
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
