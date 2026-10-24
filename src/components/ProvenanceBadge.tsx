"use client";

import React from "react";
import { getProvenanceInfo } from "../lib/provenance";
import { Provenance } from "../lib/types";
import {
  Calculator,
  CheckCircle2,
  Cpu,
  Sparkles,
  TestTube,
  User,
} from "lucide-react";

interface Props {
  provenance?: Provenance;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function ProvenanceBadge({ provenance = "USER_ENTERED", showIcon = true, size = "sm" }: Props) {
  const info = getProvenanceInfo(provenance);

  const renderIcon = () => {
    const iconProps = { className: size === "sm" ? "w-3 h-3 mr-1" : "w-3.5 h-3.5 mr-1.5" };
    switch (info.iconName) {
      case "User":
        return <User {...iconProps} />;
      case "CheckCircle2":
        return <CheckCircle2 {...iconProps} />;
      case "Calculator":
        return <Calculator {...iconProps} />;
      case "Sparkles":
        return <Sparkles {...iconProps} />;
      case "Cpu":
        return <Cpu {...iconProps} />;
      case "TestTube":
        return <TestTube {...iconProps} />;
      default:
        return null;
    }
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      title={info.description}
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${info.badgeClass}`}
    >
      {showIcon && renderIcon()}
      {info.label}
    </span>
  );
}
