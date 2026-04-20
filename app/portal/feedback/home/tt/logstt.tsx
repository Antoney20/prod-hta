import type { FeedbackEmailLog, FeedbackEmailStatus } from "@/types/new/feedback";
import { Chip } from "./Chip";


const STATUS_VARIANT: Record<FeedbackEmailStatus, "green" | "red" | "blue" | "muted"> = {
  sent:    "green",
  failed:  "red",
  sending: "blue",
  initial: "muted",
};

interface LogsTableProps {
  logs:      FeedbackEmailLog[];
  onResend:  (log: FeedbackEmailLog) => void;
  onDelete:  (log: FeedbackEmailLog) => void;
}

export function LogsTable({ logs, onResend, onDelete }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No email logs match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {["Intervention", "Ref", "Category", "Recipient", "Status", "Decision", "Sent At", "Retries", ""].map(h => (
              <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "" ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 max-w-[200px]">
                <p className="font-medium text-gray-900 truncate text-sm">{log.intervention_name ?? "—"}</p>
                {log.system_categories.length > 0 && (
                  <p className="text-xs text-gray-400">{log.system_categories[0]}</p>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{log.reference_number ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{log.category_name}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{log.recipient}</td>
              <td className="px-4 py-3">
                <Chip label={log.status} variant={STATUS_VARIANT[log.status]} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {log.decision ?? (log.is_discussed ? "Discussed" : "—")}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                {log.sent_at ? new Date(log.sent_at).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-center">
                {log.retry_count > 0
                  ? <span className="font-semibold text-amber-500">{log.retry_count}</span>
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  {(log.status === "failed" || log.status === "sent") && (
                    <button
                      onClick={() => onResend(log)}
                      className="px-2.5 py-1 text-xs font-medium border border-[#27aae1] text-[#27aae1] rounded-md hover:bg-sky-50 transition-colors"
                    >
                      Resend
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(log)}
                    className="px-2.5 py-1 text-xs font-medium border border-red-300 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}