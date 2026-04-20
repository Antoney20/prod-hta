interface ChipProps {
  label: string;
  variant?: "default" | "muted" | "green" | "red" | "blue";
}

export function Chip({ label, variant = "default" }: ChipProps) {
  const styles: Record<string, string> = {
    default: "bg-sky-50 text-sky-700 border-sky-200",
    muted:   "bg-gray-100 text-gray-500 border-gray-200",
    green:   "bg-green-50 text-green-700 border-green-200",
    red:     "bg-red-50 text-red-700 border-red-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  );
}