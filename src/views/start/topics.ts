import {
  Fish,
  Waves,
  Heart,
  Crosshair,
  Scale,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TopicDef {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  selectedBg: string;
}

export const TOPICS: TopicDef[] = [
  {
    id: "Biologie",
    label: "Biologie",
    icon: Fish,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    selectedBg: "bg-emerald-500",
  },
  {
    id: "Fanggeräte und -methoden",
    label: "Fanggeräte & Methoden",
    icon: Crosshair,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    selectedBg: "bg-amber-500",
  },
  {
    id: "Gewässerkunde",
    label: "Gewässerkunde",
    icon: Waves,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    selectedBg: "bg-blue-500",
  },
  {
    id: "Gewässerpflege",
    label: "Gewässerpflege",
    icon: Heart,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    selectedBg: "bg-cyan-500",
  },
  {
    id: "Recht",
    label: "Recht",
    icon: Scale,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    selectedBg: "bg-red-500",
  },
  {
    id: "Bilderkennung",
    label: "Bilderkennung",
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    selectedBg: "bg-purple-500",
  },
];
