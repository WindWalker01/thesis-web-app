"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusCircle,
  FileText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Add Category",
    icon: PlusCircle,
    href: "/admin/categories",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  {
    label: "View Reports",
    icon: FileText,
    href: "/admin/reports",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  {
    label: "Manage Users",
    icon: Users,
    href: "/admin/users",
    color: "bg-green-500 hover:bg-green-600 text-white",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "#",
    color: "bg-purple-500 hover:bg-purple-600 text-white",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    color: "bg-gray-500 hover:bg-gray-600 text-white",
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={action.href}>
              <Button className={`gap-2 ${action.color}`} size="sm">
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}