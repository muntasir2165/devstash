import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  const displayName = name?.trim() || "User";

  return (
    <Avatar className={className}>
      {image ? <AvatarImage src={image} alt={displayName} /> : null}
      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  );
}
