"use client";

import {
  Webhook,
  Clock,
  Mail,
  FileInput,
  Play,
  Globe,
  Send,
  Database,
  MessageSquare,
  Wand2,
  Code,
  GitBranch,
  Repeat,
  Timer,
  Route,
  Merge,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Webhook,
  Clock,
  Mail,
  FileInput,
  Play,
  Globe,
  Send,
  Database,
  MessageSquare,
  Wand2,
  Code,
  GitBranch,
  Repeat,
  Timer,
  Route,
  Merge,
};

interface NodeIconProps {
  name: string;
  className?: string;
}

export function NodeIcon({ name, className }: NodeIconProps) {
  const Icon = iconMap[name];
  if (!Icon) {
    return null;
  }
  return <Icon className={className} />;
}
