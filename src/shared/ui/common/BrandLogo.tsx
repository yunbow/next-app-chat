import { cn } from "@/shared/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textClassName?: string;
  text?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  showText = true,
  textClassName,
  text = "Chat",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/brand/chat-icon.png"
        alt=""
        aria-hidden="true"
        className={cn("h-8 w-8 rounded-lg object-cover", iconClassName)}
      />
      {showText && <span className={textClassName}>{text}</span>}
    </span>
  );
}
