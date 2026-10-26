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
   event: { label: 'Événement', color: 'text-acc', bgColor: 'bg-acc' },
   sales: { label: 'Ventes', color: 'text-acc', bgColor: 'bg-acc' },
   payment: { label: 'Paiement', color: 'text-acc2', bgColor: 'bg-acc2' },
   system: { label: 'Système', color: 'text-acc2', bgColor: 'bg-acc2' },
   info: { label: 'Information', color: 'text-ink2', bgColor: 'bg-ink2' },
 };
 
 export const supportStatusConfig: Record<SupportTicketStatus, { label: string; color: string; bgColor: string }> = {
   open: { label: 'Ouvert', color: 'text-acc', bgColor: 'bg-acc' },
   in_progress: { label: 'En cours', color: 'text-acc2', bgColor: 'bg-acc2' },
   resolved: { label: 'Résolu', color: 'text-acc', bgColor: 'bg-acc' },
   closed: { label: 'Fermé', color: 'text-ink2', bgColor: 'bg-ink2' },
 };
 
 export const supportCategoryConfig: Record<SupportTicketCategory, { label: string }> = {
   technical: { label: 'Technique' },
   financial: { label: 'Financier' },
   organizational: { label: 'Organisationnel' },
   other: { label: 'Autre' },
 };