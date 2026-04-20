export type ActiveTab = "send" | "logs";

interface TabsProps {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "send", label: "Send Emails" },
  { id: "logs", label: "Email Logs"  },
];

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-5">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            active === tab.id
              ? "border-[#27aae1] text-[#27aae1]"
              : "border-transparent text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}