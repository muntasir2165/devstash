import type { ComponentType, CSSProperties } from "react";
import {
  Code,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

/** Maps an item type's stored Lucide icon name to its component. */
export const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File: FileIcon,
  Image: ImageIcon,
  Link: LinkIcon,
};
