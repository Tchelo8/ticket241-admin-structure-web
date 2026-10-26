 export type TransactionType = 'sale' | 'refund' | 'payout' | 'commission';
 export type TransactionStatus = 'completed' | 'pending' | 'failed';
 export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'card';
 
 export interface Transaction {
   id: string;
   type: TransactionType;
   status: TransactionStatus;
   amount: number;
   eventId?: string;
   eventTitle?: string;
   description: string;
   date: string;
   reference: string;
 }
 
 export interface EventRevenue {
   eventId: string;
   eventTitle: string;
   eventDate: string;
   ticketsSold: number;
   grossRevenue: number;
   platformCommission: number;
   commissionRate: number;
   netRevenue: number;
   payoutStatus: 'pending' | 'processing' | 'completed';
   payoutDate?: string;
 }
 
 export interface FinancialSummary {
   currentBalance: number;
   pendingPayouts: number;
   totalEarnings: number;
   totalCommissions: number;
   lastPayoutDate?: string;
   lastPayoutAmount?: number;
 }
 
 export interface PaymentInfo {
   id: string;
   method: PaymentMethod;
   isPrimary: boolean;
   details: {
     bankName?: string;
     accountNumber?: string;
     accountHolder?: string;
     mobileProvider?: string;
     phoneNumber?: string;
   };
 }
 
 export const transactionTypeConfig: Record<TransactionType, { label: string; color: string; bgColor: string }> = {
   sale: { label: 'Vente', color: 'text-acc', bgColor: 'bg-acc/10' },
   refund: { label: 'Remboursement', color: 'text-acc2', bgColor: 'bg-acc2/10' },
   payout: { label: 'Versement', color: 'text-acc', bgColor: 'bg-acc/10' },
   commission: { label: 'Commission', color: 'text-acc2', bgColor: 'bg-acc2/10' },
 };
 
 export const transactionStatusConfig: Record<TransactionStatus, { label: string; color: string; bgColor: string }> = {
   completed: { label: 'Complété', color: 'text-acc', bgColor: 'bg-acc/10' },
   pending: { label: 'En attente', color: 'text-acc2', bgColor: 'bg-acc2/10' },
   failed: { label: 'Échoué', color: 'text-acc2', bgColor: 'bg-acc2/10' },
 };
 
 export const paymentMethodConfig: Record<PaymentMethod, { label: string; icon: string }> = {
   bank_transfer: { label: 'Virement bancaire', icon: 'Building2' },
   mobile_money: { label: 'Mobile Money', icon: 'Smartphone' },
   card: { label: 'Carte bancaire', icon: 'CreditCard' },
 };