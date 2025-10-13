import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Message, UserType } from '@/types/dashboard/forums';

interface ExpandableThreadProps {
  parentMessage: Message;
  isOwn: boolean;
  onLoadReplies: (messageId: string) => Promise<Message[]>;
  onSendReply: (content: string, parentMessageId: string) => Promise<void>;
  currentUser: UserType;
}

const getInitials = (user: UserType): string => {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user?.username) {
    return user.username[0].toUpperCase();
  }
  return '?';
};

const getUserDisplayName = (user: UserType): string => {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user?.username || 'Unknown User';
};

const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const ReplyMessage: React.FC<{ 
  reply: Message; 
  currentUser: UserType;
}> = ({ reply, currentUser }) => {
  const isOwn = reply.user.id === currentUser.id;
  
  return (
    <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} mb-3`}>
      {/* Avatar for non-own messages */}
      {!isOwn && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs font-medium">
              {getInitials(reply.user)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Message content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        {/* User info */}
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold text-gray-700">
              {getUserDisplayName(reply.user)}
            </span>
            <span className="text-xs text-gray-400">
              {formatMessageTime(reply.created_at)}
            </span>
          </div>
        )}
        
        {/* Reply bubble */}
        <div 
          className={`
            inline-block max-w-full px-3 py-2 rounded-xl shadow-sm
            ${isOwn 
              ? 'bg-gradient-to-r from-[#27aae1] to-[#1e8bb8] text-white ml-auto rounded-br-sm' 
              : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-sm'
            }
          `}
        >
          <div className="break-words">
            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {reply.content}
            </p>
            
            {/* Own message timestamp */}
            {isOwn && (
              <div className="text-xs text-blue-100 mt-1 opacity-80">
                {formatMessageTime(reply.created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpandableThread: React.FC<ExpandableThreadProps> = ({
  parentMessage,
  isOwn,
  onLoadReplies,
  onSendReply,
  currentUser
}) => {
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  // Load replies when component mounts
  useEffect(() => {
    const loadReplies = async () => {
      try {
        setLoading(true);
        const fetchedReplies = await onLoadReplies(parentMessage.id);
        setReplies(fetchedReplies);
      } catch (error) {
        console.error('Failed to load replies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReplies();
  }, [parentMessage.id, onLoadReplies]);

  const handleSendReply = async () => {
    if (!replyContent.trim() || sending) return;

    try {
      setSending(true);
      await onSendReply(replyContent.trim(), parentMessage.id);
      
      // Clear the input
      setReplyContent('');
      
      // Reload replies to show the new one
      const updatedReplies = await onLoadReplies(parentMessage.id);
      setReplies(updatedReplies);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className={`mt-4 ${isOwn ? 'mr-4' : 'ml-4'}`}>
      {/* Thread container */}
      <div className={`border-l-2 border-gray-200 ${isOwn ? 'border-r-2 border-l-0 pr-4' : 'pl-4'} space-y-3`}>
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-xs text-gray-500">Loading replies...</span>
          </div>
        )}

        {/* Replies list */}
        {!loading && replies.length > 0 && (
          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyMessage 
                key={reply.id} 
                reply={reply} 
                currentUser={currentUser}
              />
            ))}
          </div>
        )}

        {/* No replies message */}
        {!loading && replies.length === 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-gray-400">No replies yet</span>
          </div>
        )}

        {/* Reply input */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-end space-x-2">
            {/* Current user avatar */}
            <div className="flex-shrink-0 mb-2">
              <Avatar className="w-6 h-6 ring-1 ring-gray-200">
                <AvatarFallback className="bg-gradient-to-br from-[#27aae1] to-[#1e8bb8] text-white text-xs font-medium">
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Input field */}
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
                disabled={sending}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Send button */}
            <Button 
              onClick={handleSendReply}
              size="sm"
              disabled={!replyContent.trim() || sending}
              className="mb-2 bg-[#27aae1] hover:bg-[#1e8bb8] text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-1">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpandableThread;