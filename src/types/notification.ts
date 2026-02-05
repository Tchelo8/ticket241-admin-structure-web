 export type NotificationType = 'event' | 'sales' | 'payment' | 'system' | 'info';
 export type NotificationPriority = 'low' | 'medium' | 'high';
 
 export interface Notification {
   id: string;
   type: NotificationType;
   priority: NotificationPriority;
   title: string;
   message: string;
   createdAt: string;
   read: boolean;
   eventId?: string;
   eventName?: string;
   actionUrl?: string;
 }
 
 export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
 export type SupportTicketCategory = 'technical' | 'financial' | 'organizational' | 'other';
 
 export interface SupportMessage {
   id: string;
   senderId: string;
   senderName: string;
   senderType: 'user' | 'support';
   message: string;
   createdAt: string;
   attachments?: string[];
 }
 
 export interface SupportTicket {
   id: string;
   reference: string;
   category: SupportTicketCategory;
   subject: string;
   description: string;
   status: SupportTicketStatus;
   priority: NotificationPriority;
   createdAt: string;
   updatedAt: string;
   messages: SupportMessage[];
 }
 
 export const notificationTypeConfig: Record<NotificationType, { label: string; color: string; bgColor: string }> = {
   event: { label: 'Événement', color: 'text-blue-700', bgColor: 'bg-blue-100' },
   sales: { label: 'Ventes', color: 'text-green-700', bgColor: 'bg-green-100' },
   payment: { label: 'Paiement', color: 'text-amber-700', bgColor: 'bg-amber-100' },
   system: { label: 'Système', color: 'text-red-700', bgColor: 'bg-red-100' },
   info: { label: 'Information', color: 'text-slate-700', bgColor: 'bg-slate-100' },
 };
 
 export const supportStatusConfig: Record<SupportTicketStatus, { label: string; color: string; bgColor: string }> = {
   open: { label: 'Ouvert', color: 'text-blue-700', bgColor: 'bg-blue-100' },
   in_progress: { label: 'En cours', color: 'text-amber-700', bgColor: 'bg-amber-100' },
   resolved: { label: 'Résolu', color: 'text-green-700', bgColor: 'bg-green-100' },
   closed: { label: 'Fermé', color: 'text-slate-700', bgColor: 'bg-slate-100' },
 };
 
 export const supportCategoryConfig: Record<SupportTicketCategory, { label: string }> = {
   technical: { label: 'Technique' },
   financial: { label: 'Financier' },
   organizational: { label: 'Organisationnel' },
   other: { label: 'Autre' },
 };