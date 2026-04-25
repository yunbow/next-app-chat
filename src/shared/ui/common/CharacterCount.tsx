"use client";

type CharacterCountProps = {
  current: number;
  max: number;
  className?: string;
};

export function CharacterCount({ current, max, className }: CharacterCountProps) {
  const remaining = max - current;
  const isNearLimit = remaining <= Math.floor(max * 0.1);
  const isOverLimit = remaining < 0;

  return (
    <span
      className={`text-xs ${
        isOverLimit
          ? "text-destructive font-semibold"
          : isNearLimit
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-muted-foreground"
      } ${className || ""}`}
    >
      {current}/{max}
    </span>
  );
}
