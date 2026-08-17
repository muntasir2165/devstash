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

import { cn } from "@/lib/utils";

export function TypeIcon({
  icon,
  color,
  className,
  withColor = true,
}: {
  /** Lucide icon name from the item type. */
  icon?: string;
  /** Hex color from the item type. */
  color?: string;
  className?: string;
  withColor?: boolean;
}) {
  const props = {
    className: cn("size-4 shrink-0", className),
    style:
      withColor && color ? ({ color } as CSSProperties) : undefined,
  };

  switch (icon) {
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

