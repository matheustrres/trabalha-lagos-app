"use client";

import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

type Role = "CANDIDATE" | "EMPLOYER";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const ROLES = [
  {
    value: "CANDIDATE" as const,
    icon: User,
    label: "Busco trabalho",
    subtitle: "Encontre vagas perto de você",
  },
  {
    value: "EMPLOYER" as const,
    icon: Building2,
    label: "Quero contratar",
    subtitle: "Publique vagas na região",
  },
];

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => (
  <div className="mb-6 grid grid-cols-2 gap-3">
    {ROLES.map(({ value: role, icon: Icon, label, subtitle }) => (
      <button
        key={role}
        type="button"
        onClick={() => onChange(role)}
        className={cn(
          "cursor-pointer rounded-xl p-4 text-center transition-all",
          value === role
            ? "border-2 border-primary bg-primary/5"
            : "border border-border bg-white",
        )}
      >
        <Icon
          size={24}
          className={cn(
            "mx-auto mb-2",
            value === role ? "text-primary" : "text-gray-400",
          )}
          aria-hidden
        />
        <p
          className={cn(
            "text-sm font-semibold",
            value === role ? "text-primary" : "text-gray-700",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
      </button>
    ))}
  </div>
);
