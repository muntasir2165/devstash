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
  className,
  withColor = true,
}: {
  typeId: string;
  className?: string;
  withColor?: boolean;
}) {
  const type = getItemType(typeId);
  const props = {
    className: cn("size-4 shrink-0", className),
    style:
      withColor && type ? ({ color: type.color } as CSSProperties) : undefined,
  };

  switch (type?.icon) {
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

