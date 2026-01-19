import type { LucideIcon } from "lucide-react";

export type NodeCategory = "triggers" | "actions" | "logic";

export interface NodeType {
  id: string;
  name: string;
  description: string;
  category: NodeCategory;
  icon: string;
}

export interface NodeCategoryInfo {
  id: NodeCategory;
  name: string;
  description: string;
  color: string;
}

export const NODE_CATEGORIES: NodeCategoryInfo[] = [
  {
    id: "triggers",
    name: "Triggers",
    description: "Events that start your workflow",
    color: "text-green-600",
  },
  {
    id: "actions",
    name: "Actions",
    description: "Tasks your workflow performs",
    color: "text-blue-600",
  },
  {
    id: "logic",
    name: "Logic",
    description: "Control the flow of your workflow",
    color: "text-purple-600",
  },
];

export const NODE_TYPES: NodeType[] = [
  // Triggers
  {
    id: "webhook",
    name: "Webhook",
    description: "Trigger when a webhook is received",
    category: "triggers",
    icon: "Webhook",
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Trigger on a schedule (cron)",
    category: "triggers",
    icon: "Clock",
  },
  {
    id: "email-received",
    name: "Email Received",
    description: "Trigger when an email is received",
    category: "triggers",
    icon: "Mail",
  },
  {
    id: "form-submit",
    name: "Form Submit",
    description: "Trigger when a form is submitted",
    category: "triggers",
    icon: "FileInput",
  },
  {
    id: "manual",
    name: "Manual Trigger",
    description: "Trigger manually from the dashboard",
    category: "triggers",
    icon: "Play",
  },

  // Actions
  {
    id: "http-request",
    name: "HTTP Request",
    description: "Make an HTTP request to any URL",
    category: "actions",
    icon: "Globe",
  },
  {
    id: "send-email",
    name: "Send Email",
    description: "Send an email to recipients",
    category: "actions",
    icon: "Send",
  },
  {
    id: "database",
    name: "Database",
    description: "Read or write to a database",
    category: "actions",
    icon: "Database",
  },
  {
    id: "slack",
    name: "Send to Slack",
    description: "Post a message to Slack",
    category: "actions",
    icon: "MessageSquare",
  },
  {
    id: "transform",
    name: "Transform Data",
    description: "Transform and map data",
    category: "actions",
    icon: "Wand2",
  },
  {
    id: "code",
    name: "Run Code",
    description: "Execute custom JavaScript code",
    category: "actions",
    icon: "Code",
  },

  // Logic
  {
    id: "condition",
    name: "Condition",
    description: "Branch based on a condition",
    category: "logic",
    icon: "GitBranch",
  },
  {
    id: "loop",
    name: "Loop",
    description: "Iterate over a list of items",
    category: "logic",
    icon: "Repeat",
  },
  {
    id: "delay",
    name: "Delay",
    description: "Wait for a specified duration",
    category: "logic",
    icon: "Timer",
  },
  {
    id: "switch",
    name: "Switch",
    description: "Route to different paths based on value",
    category: "logic",
    icon: "Route",
  },
  {
    id: "merge",
    name: "Merge",
    description: "Combine multiple branches into one",
    category: "logic",
    icon: "Merge",
  },
];
