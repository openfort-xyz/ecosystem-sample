import { Flame } from "lucide-react";

interface RapidFireLogoProps {
  className?: string;
}

export function RapidFireLogo({ className }: RapidFireLogoProps) {
  return <Flame className={className} />;
}