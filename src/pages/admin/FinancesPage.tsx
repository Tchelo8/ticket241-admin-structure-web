import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  Receipt, 
  Search,
  Download,
  Building2,
  Smartphone,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Star,
  Upload,
  Pencil
} from "@/components/icons";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  mockFinancialSummary, 
  mockEventRevenues, 
  mockTransactions,
  mockPaymentInfo
} from '@/data/mockFinance';
import { 
  transactionTypeConfig, 
  transactionStatusConfig,
  paymentMethodConfig,
  PaymentInfo,
  PaymentMethod
} from '@/types/finance';
import { AddPaymentMethodDialog } from '@/components/admin/finance/AddPaymentMethodDialog';
import { EditPaymentMethodDialog } from '@/components/admin/finance/EditPaymentMethodDialog';
import { UploadInvoiceDialog } from '@/components/admin/finance/UploadInvoiceDialog';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDoc {
  id: string;
  type: string;
  period: string;
  date: string;
  fileName?: string;
}

export default function FinancesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentInfo[]>(mockPaymentInfo);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null);
  
  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceDoc[]>([
    { id: '1', type: 'Relevé mensuel', period: 'Février 2024', date: '2024-03-01' },
    { id: '2', type: 'Facture événement', period: 'Concert Live Libreville', date: '2024-02-20' },
    { id: '3', type: 'Relevé mensuel', period: 'Janvier 2024', date: '2024-02-01' },
    { id: '4', type: 'Facture événement', period: 'Gala de Noël', date: '2024-01-05' },
  ]);
  const [showUploadInvoiceDialog, setShowUploadInvoiceDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = transactionFilter === 'all' || t.type === transactionFilter;
    return matchesSearch && matchesFilter;
  });

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-acc/10 text-acc border-acc/20"><CheckCircle className="h-3 w-3 mr-1" />Versé</Badge>;
      case 'processing':
        return <Badge className="bg-acc/10 text-acc border-acc/20"><Loader2 className="h-3 w-3 mr-1 animate-spin" />En cours</Badge>;
      case 'pending':
        return <Badge className="bg-acc2/10 text-acc2 border-acc2/20"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />;
      case 'mobile_money':
        return <Smartphone className="h-5 w-5" />;
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Payment methods handlers
  const handleAddPaymentMethod = (payment: {
    method: PaymentMethod;
    details: PaymentInfo['details'];
    isPrimary: boolean;
  }) => {
    const newPayment: PaymentInfo = {
      id: `payment-${Date.now()}`,
      method: payment.method,
      details: payment.details,
      isPrimary: payment.isPrimary,
    };
    
    if (payment.isPrimary) {
      setPaymentMethods(prev => prev.map(p => ({ ...p, isPrimary: false })));
    }
    
    setPaymentMethods(prev => [...prev, newPayment]);
  };

  const handleEditPayment = (payment: PaymentInfo) => {
    setSelectedPayment(payment);
    setShowEditPaymentDialog(true);
  };

  const handleSavePayment = (updatedPayment: PaymentInfo) => {
    if (updatedPayment.isPrimary) {
      setPaymentMethods(prev => prev.map(p => 
        p.id === updatedPayment.id ? updatedPayment : { ...p, isPrimary: false }
      ));
    } else {
      setPaymentMethods(prev => prev.map(p => 
        p.id === updatedPayment.id ? updatedPayment : p
      ));
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== paymentId));
  };

  // Invoice handlers
  const handleUploadInvoice = (file: File, description: string) => {
    const newInvoice: InvoiceDoc = {
      id: `invoice-${Date.now()}`,
      type: 'Facture uploadée',
      period: description,
      date: new Date().toISOString(),
      fileName: file.name,
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleDownloadInvoice = (invoice: InvoiceDoc) => {
    toast({
      title: 'Téléchargement',
      description: `Téléchargement de ${invoice.type} - ${invoice.period}`,
    });
    // TODO: Implement actual download
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finances & paiements</h1>
        <p className="text-muted-foreground">Suivez vos revenus, transactions et gérez vos moyens de paiement</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(mockFinancialSummary.currentBalance)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente de versement</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(mockFinancialSummary.pendingPayouts)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-acc2/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-acc2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des gains</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(mockFinancialSummary.totalEarnings)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-acc/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-acc" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions plateforme</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(mockFinancialSummary.totalCommissions)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="revenues" className="text-xs sm:text-sm py-2">Revenus par événement</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods" className="text-xs sm:text-sm py-2">Moyens de paiement</TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs sm:text-sm py-2">Factures & relevés</TabsTrigger>
        </TabsList>

        {/* Revenues by Event Tab */}
        <TabsContent value="revenues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail des revenus par événement</CardTitle>
              <CardDescription>Vue d'ensemble de vos gains pour chaque événement</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead className="text-right">Billets</TableHead>
                      <TableHead className="text-right">Revenus bruts</TableHead>
                      <TableHead className="text-right">Commission (10%)</TableHead>
                      <TableHead className="text-right">Revenus nets</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEventRevenues.map((revenue) => (
                      <TableRow key={revenue.eventId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{revenue.eventTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(revenue.eventDate), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{revenue.ticketsSold}</TableCell>
                        <TableCell className="text-right">{formatCurrency(revenue.grossRevenue)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          -{formatCurrency(revenue.platformCommission)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-acc">
                          {formatCurrency(revenue.netRevenue)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getPayoutStatusBadge(revenue.payoutStatus)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {mockEventRevenues.map((revenue) => (
                  <Card key={revenue.eventId}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{revenue.eventTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(revenue.eventDate), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        {getPayoutStatusBadge(revenue.payoutStatus)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Billets vendus</p>
                          <p className="font-medium">{revenue.ticketsSold}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenus bruts</p>
                          <p className="font-medium">{formatCurrency(revenue.grossRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission (10%)</p>
                          <p className="font-medium text-muted-foreground">-{formatCurrency(revenue.platformCommission)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenus nets</p>
                          <p className="font-bold text-acc">{formatCurrency(revenue.netRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commission Explanation */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Calcul des commissions</p>
                  <p className="text-muted-foreground mt-1">
                    La plateforme prélève une commission de <strong>10%</strong> sur chaque vente de billet. 
                    Le montant net (revenus bruts - commission) vous est versé après l'événement, 
                    généralement sous 5 à 7 jours ouvrés.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Historique des transactions</CardTitle>
                  <CardDescription>Toutes vos transactions financières</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-[200px]"
                    />
                  </div>
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filtrer par type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="sale">Ventes</SelectItem>
                      <SelectItem value="refund">Remboursements</SelectItem>
                      <SelectItem value="payout">Versements</SelectItem>
                      <SelectItem value="commission">Commissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const typeConfig = transactionTypeConfig[transaction.type];
                      const statusConfig = transactionStatusConfig[transaction.status];
                      const isPositive = transaction.amount > 0;
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(typeConfig.color, typeConfig.bgColor, 'border-0')}>
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              {transaction.eventTitle && (
                                <p className="text-xs text-muted-foreground">{transaction.eventTitle}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {transaction.reference}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              'font-medium flex items-center justify-end gap-1',
                              isPositive ? 'text-acc' : 'text-acc2'
                            )}>
                              {isPositive ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn(statusConfig.color, statusConfig.bgColor, 'border-0')}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredTransactions.map((transaction) => {
                  const typeConfig = transactionTypeConfig[transaction.type];
                  const statusConfig = transactionStatusConfig[transaction.status];
                  const isPositive = transaction.amount > 0;
                  
                  return (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(typeConfig.color, typeConfig.bgColor, 'border-0 text-xs')}>
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="outline" className={cn(statusConfig.color, statusConfig.bgColor, 'border-0 text-xs')}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            {transaction.eventTitle && (
                              <p className="text-xs text-muted-foreground">{transaction.eventTitle}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                          <span className={cn(
                            'font-bold flex items-center gap-1 shrink-0',
                            isPositive ? 'text-acc' : 'text-acc2'
                          )}>
                            {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Moyens de paiement</CardTitle>
                  <CardDescription>Gérez vos méthodes de versement</CardDescription>
                </div>
                <Button onClick={() => setShowAddPaymentDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((payment) => (
                <Card key={payment.id} className={cn(payment.isPrimary && 'border-primary')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {getPaymentMethodIcon(payment.method)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{paymentMethodConfig[payment.method].label}</p>
                            {payment.isPrimary && (
                              <Badge className="bg-primary/10 text-primary border-0">
                                <Star className="h-3 w-3 mr-1" />
                                Principal
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {payment.method === 'bank_transfer' && (
                              <>
                                <p>{payment.details.bankName}</p>
                                <p>{payment.details.accountNumber}</p>
                                <p>{payment.details.accountHolder}</p>
                              </>
                            )}
                            {payment.method === 'mobile_money' && (
                              <>
                                <p>{payment.details.mobileProvider}</p>
                                <p>{payment.details.phoneNumber}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {paymentMethods.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-foreground">Aucun moyen de paiement</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajoutez un moyen de paiement pour recevoir vos versements
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowAddPaymentDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un moyen de paiement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Factures & relevés</CardTitle>
                  <CardDescription>Téléchargez vos documents financiers</CardDescription>
                </div>
                <Button onClick={() => setShowUploadInvoiceDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{doc.period}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(doc.date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Télécharger</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {invoices.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-foreground">Aucun document</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vos factures et relevés apparaîtront ici
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddPaymentMethodDialog
        open={showAddPaymentDialog}
        onOpenChange={setShowAddPaymentDialog}
        onAdd={handleAddPaymentMethod}
      />

      <EditPaymentMethodDialog
        payment={selectedPayment}
        open={showEditPaymentDialog}
        onOpenChange={setShowEditPaymentDialog}
        onSave={handleSavePayment}
        onDelete={handleDeletePayment}
      />

      <UploadInvoiceDialog
        open={showUploadInvoiceDialog}
        onOpenChange={setShowUploadInvoiceDialog}
        onUpload={handleUploadInvoice}
      />
    </div>
  );
}
