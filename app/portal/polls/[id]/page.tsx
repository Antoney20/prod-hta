'use client'
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, MessageSquare, Users, Clock, Eye, EyeOff, Send, Download } from 'lucide-react';
import { Poll, PollComment, PollResults, VoteAnalytics } from '@/types/dashboard/polls';
import { addPollComment, getPoll, getPollAnalytics, getPollComments, getPollResults, togglePollComments, votePoll } from '@/app/api/dashboard/polls';

export default function PollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params?.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [comments, setComments] = useState<PollComment[]>([]);
  const [analytics, setAnalytics] = useState<VoteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadPollData();
  }, [pollId]);

  const loadPollData = async () => {
    try {
      setLoading(true);
      const [pollData, resultsData] = await Promise.all([
        getPoll(pollId),
        getPollResults(pollId)
      ]);
      
      setPoll(pollData);
      setResults(resultsData);
      
      // Backend determines ownership via JWT token
      // Check if the poll data indicates current user is owner
      setIsOwner(pollData.is_owner || false);

      if (pollData.allow_comments) {
        const commentsData = await getPollComments(pollId);
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Failed to load poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) return;
    
    try {
      setVoting(true);
      await votePoll(pollId, { option_id: selectedOption });
      await loadPollData();
    } catch (error) {
      alert('Failed to submit vote. You may have already voted.');
    } finally {
      setVoting(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addPollComment(pollId, { content: newComment });
      setNewComment('');
      const commentsData = await getPollComments(pollId);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!showAnalytics) {
      try {
        const data = await getPollAnalytics(pollId);
        setAnalytics(data);
        setShowAnalytics(true);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    } else {
      setShowAnalytics(false);
    }
  };

  const handleToggleComments = async () => {
    try {
      await togglePollComments(pollId);
      await loadPollData();
    } catch (error) {
      console.error('Failed to toggle comments:', error);
    }
  };

  const exportToCSV = () => {
    if (!analytics || !poll) return;

    const rows = [];
    
    rows.push(['Poll Analytics Report']);
    rows.push(['Poll Question', poll.question]);
    rows.push(['Created By', poll.created_by_username]);
    rows.push(['Created At', new Date(poll.created_at).toLocaleString()]);
    rows.push(['Total Votes', analytics.total_votes]);
    rows.push(['Unique Voters', analytics.unique_voters]);
    rows.push([]);
    
    rows.push(['Timestamp', 'Username', 'Vote', 'Comment']);
    
    Object.entries(analytics.votes_by_option).forEach(([option, voters]) => {
      voters.forEach((voter) => {
        const comment = comments.find(c => c.user.username === voter.username);
        rows.push([
          new Date(voter.voted_at).toLocaleString(),
          voter.username,
          option,
          comment ? comment.content.replace(/^\[POLL:[^\]]+\]\s*/, '') : ''
        ]);
      });
    });

    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `poll_analytics_${pollId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#27aae1] border-t-transparent" />
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Poll not found</p>
          <button onClick={() => router.push('/dashboard/polls')} className="text-[#27aae1] hover:opacity-80">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const getPercentage = (voteCount: number) => {
    if (results.total_votes === 0) return 0;
    return Math.round((voteCount / results.total_votes) * 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/portal/polls')}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to polls
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <span className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full ${
                  poll.is_active 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  <Clock className="w-4 h-4" />
                  {poll.is_active ? 'Active' : 'Expired'}
                </span>
                
              </div>

              <h1 className="text-2xl font-semibold text-black mb-4">{poll.question}</h1>
              {poll.description && (
                <p className="text-gray-600 mb-6">{poll.description}</p>
              )}

              <div className="space-y-3 mb-6">
                {results.options.map((option) => {
                  const percentage = getPercentage(option.vote_count);
                  const isSelected = selectedOption === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => !results.user_has_voted && setSelectedOption(option.id)}
                      disabled={results.user_has_voted || !poll.is_active}
                      className={`w-full text-left rounded-lg border-2 transition-all p-4 ${
                        isSelected
                          ? 'border-[#27aae1] bg-gray-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      } ${results.user_has_voted || !poll.is_active ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-black">{option.text}</span>
                        <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#27aae1] h-full transition-all duration-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{option.vote_count} votes</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!results.user_has_voted && poll.is_active && (
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className="w-full bg-[#27aae1] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voting ? 'Submitting...' : 'Submit Vote'}
                </button>
              )}
              {results.user_has_voted && (
                <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">✓ You've already voted</p>
                </div>
              )}
            </div>

            {showAnalytics && analytics && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-[#27aae1]" />
                    Detailed Analytics
                  </h2>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-[#27aae1] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Votes</p>
                    <p className="text-3xl font-semibold text-black">{analytics.total_votes}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Unique Voters</p>
                    <p className="text-3xl font-semibold text-black">{analytics.unique_voters}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Timestamp</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Vote</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(analytics.votes_by_option).flatMap(([option, voters]) =>
                          voters.map((voter, idx) => {
                            const comment = comments.find(c => c.user.username === voter.username);
                            return (
                              <tr key={`${option}-${idx}`} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                  {new Date(voter.voted_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-black font-medium">
                                  {voter.username}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {option}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                  {comment ? comment.content.replace(/^\[POLL:[^\]]+\]\s*/, '') : '-'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-black">Vote Distribution</h3>
                  {Object.entries(analytics.votes_by_option).map(([option, voters]) => (
                    <div key={option} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-black">{option}</h4>
                        <span className="text-sm text-gray-600">{voters.length} votes</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#27aae1] h-2 rounded-full transition-all"
                          style={{ width: `${(voters.length / analytics.total_votes) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {poll.allow_comments && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#27aae1]" />
                    Comments ({comments.length})
                  </h2>
                  {isOwner && (
                    <button
                      onClick={handleToggleComments}
                      className="text-sm text-gray-600 hover:text-black flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      Disable
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                      placeholder="Share your thoughts..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                    />
                    <button
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="bg-[#27aae1] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#27aae1] flex items-center justify-center text-white font-semibold text-sm">
                            {comment.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-black">{comment.user.username}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {comment.content.replace(/^\[POLL:[^\]]+\]\s*/, '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-black mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Votes</span>
                  <span className="font-semibold text-black">{results.total_votes}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Options</span>
                  <span className="font-semibold text-black">{poll.options.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${poll.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                    {poll.is_active ? 'Active' : 'Expired'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-black mb-4">Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Anonymous</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    poll.is_anonymous ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {poll.is_anonymous ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Multiple Choice</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    poll.allow_multiple_choices ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {poll.allow_multiple_choices ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    poll.allow_comments ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {poll.allow_comments ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-black mb-3">Created By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#27aae1] flex items-center justify-center text-white font-semibold text-lg">
                  {poll.created_by_username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-black">{poll.created_by_username}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}