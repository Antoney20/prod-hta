'use client'

import React from 'react'
import { Mail, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { FeedbackStats } from '@/types/dashboard/home'
import { Section } from './section'


interface Props {
  feedback: FeedbackStats
}

export const FeedbackSection: React.FC<Props> = ({ feedback }) => (
  <Section title="Feedback Emails" description="Email delivery overview" icon={Mail} iconColor="text-pink-500">
    {/* Summary */}
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span className="text-xs text-emerald-600 font-medium">Sent</span>
        </div>
        <p className="text-2xl font-bold text-emerald-700">{feedback.total_sent.toLocaleString()}</p>
      </div>
      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
        <div className="flex items-center gap-1.5 mb-1">
          <AlertTriangle size={13} className="text-red-500" />
          <span className="text-xs text-red-500 font-medium">Failed</span>
        </div>
        <p className="text-2xl font-bold text-red-600">{feedback.total_failed.toLocaleString()}</p>
      </div>
    </div>

    {/* By category */}
    {feedback.by_category.length > 0 && (
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">By Template</p>
        {feedback.by_category.map((c) => (
          <div key={c.category_name} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700 font-medium truncate flex-1 mr-2">{c.category_name}</span>
            <div className="flex items-center gap-3 text-xs flex-shrink-0">
              <span className="text-emerald-600 font-semibold">{c.sent_count} sent</span>
              {c.failed_count > 0 && (
                <span className="text-red-500 font-semibold">{c.failed_count} failed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Recent failures */}
    {feedback.recent_failed.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Failures</p>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {feedback.recent_failed.map((f) => (
            <div key={f.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{f.recipient}</p>
                  <p className="text-xs text-gray-500">{f.category_name}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                  ×{f.retry_count}
                </span>
              </div>
              {f.error_message && (
                <p className="text-xs text-red-500 mt-1.5 truncate">{f.error_message}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </Section>
)