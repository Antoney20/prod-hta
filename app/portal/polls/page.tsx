'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, MessageSquare, Users, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Poll } from '@/types/dashboard/polls';
import { getPolls } from '@/app/api/dashboard/polls';

export default function PollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    loadPolls();
  }, [filter]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const response = await getPolls({
        is_active: filter === 'active' ? true : filter === 'expired' ? false : undefined
      });
      setPolls(response.results);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 'No expiration';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="container mx-auto px-2 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" style={{ color: '#27aae1' }} />
              <div>
                <h1 className="text-2xl font-semibold text-black">Polls</h1>
                <p className="text-sm text-gray-600">Community feedback and decisions</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/portal/polls/create')}
              className="px-5 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#27aae1' }}
            >
              <Plus className="w-5 h-5" />
              Create Poll
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'expired'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filter === tab ? { backgroundColor: '#27aae1' } : {}}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No polls found</h3>
            <p className="text-gray-600 mb-6">Create your first poll to get started</p>
            <button
              onClick={() => router.push('/portal/polls/create')}
              className="px-6 py-3 rounded-lg font-medium text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#27aae1' }}
            >
              <Plus className="w-5 h-5" />
              Create Poll
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {polls.map((poll) => (
              <div
                key={poll.id}
                onClick={() => router.push(`/portal/polls/${poll.id}`)}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  {poll.is_active ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <XCircle className="w-3.5 h-3.5" />
                      Expired
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {getTimeRemaining(poll.expires_at)}
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                  {poll.question}
                </h3>

                {/* Description */}
                {poll.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {poll.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" style={{ color: '#27aae1' }} />
                    <span>{poll.options?.length || 0} options</span>
                  </div>
                  {poll.allow_comments && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" style={{ color: '#27aae1' }} />
                      <span>Comments on</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {poll.is_anonymous && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 font-medium">
                      Anonymous
                    </span>
                  )}
                  {poll.allow_multiple_choices && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 font-medium">
                      Multiple Choice
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{poll.created_by_username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}