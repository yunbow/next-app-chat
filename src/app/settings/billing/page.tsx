import { Suspense } from "react";
import { BillingContent } from "@/widgets/settings/BillingContent";
import { Skeleton } from "@/shared/ui/skeleton";

export default function BillingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
      <BillingContent />
    </Suspense>
  );
}
