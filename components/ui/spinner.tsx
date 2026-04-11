import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary-700 border-t-white",
        sizeMap[size],
        className,
      )}
    />
  );
}

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <Spinner size="lg" />
    </div>
  );
}

export { Spinner, PageSpinner };
