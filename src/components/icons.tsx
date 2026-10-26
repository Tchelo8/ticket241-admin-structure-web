/**
 * Icônes de l'espace organisateur : Phosphor, style « duotone » par défaut
 * (`weight="fill"` pour un état actif). Les noms historiques (ceux de lucide-react)
 * sont conservés pour que chaque écran n'ait qu'une ligne d'import à changer.
 */
import { forwardRef, type ComponentType } from "react";
import {
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  Bell as PhBell,
  Buildings,
  CalendarBlank,
  CalendarDots,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChatText,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  Checks,
  Circle as PhCircle,
  Clock as PhClock,
  CreditCard as PhCreditCard,
  DeviceMobile,
  Door,
  DoorOpen as PhDoorOpen,
  DotOutline,
  DotsSixVertical,
  DotsThree,
  DotsThreeVertical,
  Envelope,
  Eye as PhEye,
  EyeSlash,
  FileText as PhFileText,
  FloppyDisk,
  Funnel,
  Gear,
  Globe as PhGlobe,
  Headphones as PhHeadphones,
  Image as PhImage,
  Info as PhInfo,
  Link as PhLink,
  Lock as PhLock,
  MagnifyingGlass,
  MapPin as PhMapPin,
  Megaphone as PhMegaphone,
  PaperPlaneTilt,
  PencilSimple,
  Phone as PhPhone,
  Plus as PhPlus,
  QrCode as PhQrCode,
  Sidebar,
  Star as PhStar,
  Ticket as PhTicket,
  Trash,
  TrendUp,
  UploadSimple,
  User as PhUser,
  Users as PhUsers,
  Warning,
  WarningCircle,
  X as PhX,
  XCircle as PhXCircle,
  Pulse,
  SealCheck,
  ChartBar,
  CurrencyCircleDollar,
  DownloadSimple,
  ClockCounterClockwise,
  Key,
  Bank,
  SquaresFour,
  CircleNotch,
  SignOut,
  List,
  Percent as PhPercent,
  ChartPie,
  PlusCircle as PhPlusCircle,
  Receipt as PhReceipt,
  ShareNetwork,
  ShieldCheck,
  Wallet as PhWallet,
  ArrowUpRight as PhArrowUpRight,
  ArrowDownRight as PhArrowDownRight,
  Sun as PhSun,
  Moon as PhMoon,
  CircleHalf as PhCircleHalf,
  SealWarning as PhSealWarning,
  Hourglass as PhHourglass,
  ChartLineUp as PhChartLineUp,
  Coins as PhCoins,
  Broadcast as PhBroadcast,
  Armchair as PhArmchair,
  Copy as PhCopy,
  ArrowSquareOut as PhArrowSquareOut,
  ChatsCircle as PhChatsCircle,
  ListChecks as PhListChecks,
  type Icon as PhosphorIcon,
  type IconProps,
} from "@phosphor-icons/react";

/** Props acceptées : celles de Phosphor ; `strokeWidth` (ancien lucide) est ignoré. */
export type AppIconProps = IconProps & { strokeWidth?: number | string };

/** Type d'une icône de l'application (remplace `LucideIcon`). */
export type LucideIcon = ComponentType<AppIconProps>;

const icon = (Ph: PhosphorIcon, name: string) => {
  const Component = forwardRef<SVGSVGElement, AppIconProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ weight = "duotone", strokeWidth, ...props }, ref) => <Ph ref={ref} weight={weight} aria-hidden {...props} />,
  );
  Component.displayName = name;
  return Component;
};

export const AlertCircle = icon(WarningCircle, "AlertCircle");
export const AlertTriangle = icon(Warning, "AlertTriangle");
export const ArrowLeft = icon(PhArrowLeft, "ArrowLeft");
export const ArrowRight = icon(PhArrowRight, "ArrowRight");
export const Bell = icon(PhBell, "Bell");
export const Building2 = icon(Buildings, "Building2");
export const Calendar = icon(CalendarBlank, "Calendar");
export const CalendarDays = icon(CalendarDots, "CalendarDays");
export const Check = icon(PhCheck, "Check");
export const CheckCheck = icon(Checks, "CheckCheck");
export const CheckCircle = icon(PhCheckCircle, "CheckCircle");
export const ChevronDown = icon(CaretDown, "ChevronDown");
export const ChevronLeft = icon(CaretLeft, "ChevronLeft");
export const ChevronRight = icon(CaretRight, "ChevronRight");
export const ChevronUp = icon(CaretUp, "ChevronUp");
export const Circle = icon(PhCircle, "Circle");
export const Clock = icon(PhClock, "Clock");
export const CreditCard = icon(PhCreditCard, "CreditCard");
export const DoorClosed = icon(Door, "DoorClosed");
export const DoorOpen = icon(PhDoorOpen, "DoorOpen");
export const Dot = icon(DotOutline, "Dot");
export const Eye = icon(PhEye, "Eye");
export const EyeOff = icon(EyeSlash, "EyeOff");
export const FileText = icon(PhFileText, "FileText");
export const Filter = icon(Funnel, "Filter");
export const Globe = icon(PhGlobe, "Globe");
export const GripVertical = icon(DotsSixVertical, "GripVertical");
export const Headphones = icon(PhHeadphones, "Headphones");
export const Image = icon(PhImage, "Image");
export const Info = icon(PhInfo, "Info");
export const Link = icon(PhLink, "Link");
export const Lock = icon(PhLock, "Lock");
export const Mail = icon(Envelope, "Mail");
export const MapPin = icon(PhMapPin, "MapPin");
export const Megaphone = icon(PhMegaphone, "Megaphone");
export const MessageSquare = icon(ChatText, "MessageSquare");
export const MoreHorizontal = icon(DotsThree, "MoreHorizontal");
export const MoreVertical = icon(DotsThreeVertical, "MoreVertical");
export const PanelLeft = icon(Sidebar, "PanelLeft");
export const Pencil = icon(PencilSimple, "Pencil");
export const Phone = icon(PhPhone, "Phone");
export const Plus = icon(PhPlus, "Plus");
export const QrCode = icon(PhQrCode, "QrCode");
export const Save = icon(FloppyDisk, "Save");
export const Search = icon(MagnifyingGlass, "Search");
export const Send = icon(PaperPlaneTilt, "Send");
export const Settings = icon(Gear, "Settings");
export const Smartphone = icon(DeviceMobile, "Smartphone");
export const Star = icon(PhStar, "Star");
export const Ticket = icon(PhTicket, "Ticket");
export const Trash2 = icon(Trash, "Trash2");
export const TrendingUp = icon(TrendUp, "TrendingUp");
export const Upload = icon(UploadSimple, "Upload");
export const User = icon(PhUser, "User");
export const Users = icon(PhUsers, "Users");
export const X = icon(PhX, "X");
export const XCircle = icon(PhXCircle, "XCircle");
export const Activity = icon(Pulse, "Activity");
export const BadgeCheck = icon(SealCheck, "BadgeCheck");
export const BarChart3 = icon(ChartBar, "BarChart3");
export const DollarSign = icon(CurrencyCircleDollar, "DollarSign");
export const Download = icon(DownloadSimple, "Download");
export const History = icon(ClockCounterClockwise, "History");
export const KeyRound = icon(Key, "KeyRound");
export const Landmark = icon(Bank, "Landmark");
export const LayoutDashboard = icon(SquaresFour, "LayoutDashboard");
export const Loader2 = icon(CircleNotch, "Loader2");
export const LogOut = icon(SignOut, "LogOut");
export const Menu = icon(List, "Menu");
export const Percent = icon(PhPercent, "Percent");
export const PieChart = icon(ChartPie, "PieChart");
export const PlusCircle = icon(PhPlusCircle, "PlusCircle");
export const Receipt = icon(PhReceipt, "Receipt");
export const Share2 = icon(ShareNetwork, "Share2");
export const Shield = icon(ShieldCheck, "Shield");
export const Wallet = icon(PhWallet, "Wallet");
export const ArrowUpRight = icon(PhArrowUpRight, "ArrowUpRight");
export const ArrowDownRight = icon(PhArrowDownRight, "ArrowDownRight");
export const CheckCircle2 = icon(PhCheckCircle, "CheckCircle2");
export const Sun = icon(PhSun, "Sun");
export const Moon = icon(PhMoon, "Moon");
export const CircleHalf = icon(PhCircleHalf, "CircleHalf");
export const SealWarning = icon(PhSealWarning, "SealWarning");
export const Hourglass = icon(PhHourglass, "Hourglass");
export const ChartLineUp = icon(PhChartLineUp, "ChartLineUp");
export const Coins = icon(PhCoins, "Coins");
export const Broadcast = icon(PhBroadcast, "Broadcast");
export const Armchair = icon(PhArmchair, "Armchair");
export const Copy = icon(PhCopy, "Copy");
export const ExternalLink = icon(PhArrowSquareOut, "ExternalLink");
export const ChatsCircle = icon(PhChatsCircle, "ChatsCircle");
export const ListChecks = icon(PhListChecks, "ListChecks");
