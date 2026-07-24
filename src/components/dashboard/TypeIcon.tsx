import type { CSSProperties } from "react";
import {
  Code,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

import { getItemType } from "@/lib/item-types";
import { cn } from "@/lib/utils";

export function TypeIcon({
  typeId,
  icon,
  color,
  className,
  withColor = true,
}: {
  /** Look up icon/color from the mock item types by id. */
  typeId?: string;
  /** Explicit Lucide icon name (takes precedence over `typeId`). */
  icon?: string;
  /** Explicit hex color (takes precedence over `typeId`). */
  color?: string;
  className?: string;
  withColor?: boolean;
}) {
  const type = typeId ? getItemType(typeId) : undefined;
  const iconName = icon ?? type?.icon;
  const resolvedColor = color ?? type?.color;
  const props = {
    className: cn("size-4 shrink-0", className),
    style:
      withColor && resolvedColor
        ? ({ color: resolvedColor } as CSSProperties)
        : undefined,
  };

  switch (iconName) {
    case "Code":
      return <Code {...props} />;
    case "Sparkles":
      return <Sparkles {...props} />;
    case "Terminal":
      return <Terminal {...props} />;
    case "StickyNote":
      return <StickyNote {...props} />;
    case "Image":
      return <ImageIcon {...props} />;
    case "Link":
      return <LinkIcon {...props} />;
    default:
      return <FileIcon {...props} />;
  }
}

