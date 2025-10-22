'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Hash,
  Lock,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Channel,
  ChannelMembership,
  Message,
  CreateMessageData,
  AddMemberData,
  UserType,
} from '@/types/dashboard/forums';
import {
  addForumMember,
  getForum,
  getForumMembers,
  getForumMessages,
  getForums,
  getMessageReplies,
  postForumMessage,
  postMessageReply,
} from '@/app/api/dashboard/forums';
import { getUsers } from '@/app/api/dashboard/proposals';
import ChatMessage from './chatmessage';
import MessageInput from './input';
import { useGlobalUser } from '@/app/context/guard';
import AddUserModal from './user';

const ThreadModal = ({ 
  threadView, 
  threadReplies, 
  onClose, 
  onSendReply, 
  loadingThread,
  currentUser,
  forumId 
}: {
  threadView: Message | null;
  threadReplies: Message[];
  onClose: () => void;
  onSendReply: (content: string) => Promise<void>;
  loadingThread: boolean;
  currentUser: UserType | null;
  forumId: string;
}) => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadReplies.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadReplies.length]);

  if (!threadView) return null;

  const isOwnMessage = (message: Message) => {
    const messageUserId = String(message.user.id);
    const currentUserId = String(currentUser?.id || '');
    return messageUserId === currentUserId && currentUserId !== '';
  };

  return (


<Dialog open={!!threadView} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
    <DialogHeader>
      <DialogTitle className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5" />
        <span>Replies ({threadView.reply_count})</span>
      </DialogTitle>
    </DialogHeader>

    {/* Main layout */}
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable message area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Parent Message */}
          <ChatMessage
            message={threadView}
            isOwn={isOwnMessage(threadView)}
            showAvatar={true}
            onReply={() => {}}
            onShowThread={() => {}}
          />

          {/* Replies */}
          {loadingThread ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae1]" />
            </div>
          ) : (
            threadReplies.map((reply) => (
              <ChatMessage
                key={reply.id}
                message={reply}
                isOwn={isOwnMessage(reply)}
                showAvatar={true}
                onReply={(msg) => setReplyingTo(msg)}
                onShowThread={() => {}}
                isReply={true}
              />
            ))
          )}

          <div ref={threadEndRef} />
        </div>
      </ScrollArea>

      {/* Fixed input area */}
      <div className="border-t p-4">
        <MessageInput
          onSendMessage={onSendReply}
          placeholder="Reply to thread..."
          disabled={loadingThread}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  </DialogContent>
</Dialog>

    
  );
};

const ForumDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const forumId = params.id as string;
  const { user: currentUser } = useGlobalUser();

  const [forum, setForum] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChannelMembership[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [forums, setForums] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [threadView, setThreadView] = useState<Message | null>(null);
  const [threadReplies, setThreadReplies] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forumId) {
      fetchForumData();
      fetchForums();
    }
  }, [forumId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const showToast = (type: 'error' | 'warning' | 'success', message: string) => {
    const toast = document.createElement('div');
    const bgColors = {
      error: 'bg-red-50 border-red-200',
      warning: 'bg-orange-50 border-orange-200',
      success: 'bg-green-50 border-green-200',
    };
    const iconColors = {
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
    };
    const textColors = {
      error: 'text-red-800',
      warning: 'text-orange-800',
      success: 'text-green-800',
    };

    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${bgColors[type]} border`;

    toast.innerHTML = `
      <svg class="w-5 h-5" style="color: ${iconColors[type]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <span class="${textColors[type]} font-medium">${message}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };

  const fetchForums = async () => {
    try {
      const forumsData = await getForums();
      setForums(Array.isArray(forumsData) ? forumsData : forumsData.results || []);
    } catch (error) {
      console.error('Failed to fetch forums:', error);
      showToast('error', 'Failed to load forums list');
    }
  };

  const fetchForumData = async () => {
    if (!forumId) return;

    try {
      setLoading(true);

      const forumData = await getForum(forumId);
      setForum(forumData);

      try {
        const [messagesData, membersData, usersData] = await Promise.all([
          getForumMessages(forumId),
          getForumMembers(forumId),
          getUsers(),
        ]);

        const mainMessages = (messagesData.results || messagesData || [])
          .sort((a: Message, b: Message) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

        // Fetch replies for main messages that have replies
        const replyPromises = mainMessages
          .filter((m) => m.reply_count > 0)
          .map(async (parent) => {
            const replies = await getMessageReplies(forumId, parent.id);
            return replies.map((reply: Message) => ({ ...reply, parent_message: parent }));
          });

        const allRepliesArrays = await Promise.all(replyPromises);
        const allReplies = allRepliesArrays.flat();

        // Combine main messages and replies, then sort by created_at
        const allMessages = [...mainMessages, ...allReplies];
        const sortedAllMessages = allMessages.sort((a: Message, b: Message) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setMessages(sortedAllMessages);

        setMembers(membersData);

        const usersList = Array.isArray(usersData) ? usersData : (usersData.results || []);
        setAvailableUsers(usersList);
      } catch (innerError: any) {
        if (innerError?.response?.status === 403 || innerError?.response?.status === 401) {
          setUnauthorized(true);
          showToast('warning', 'You are not authorized to access this forum');

          setTimeout(() => {
            router.push('/portal/forums');
          }, 2000);
          return;
        }
        throw innerError;
      }
    } catch (error: any) {
      console.error('Failed to fetch forum data:', error);

      if (error?.response?.status === 403 || error?.response?.status === 401) {
        setUnauthorized(true);
        showToast('warning', 'You are not authorized to access this forum');

        setTimeout(() => {
          router.push('/portal/forums');
        }, 2000);
      } else if (error?.response?.status === 404) {
        setForum(null);
      } else {
        showToast('error', 'Failed to load forum. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, parentMessageId?: string): Promise<void> => {
    if (!forumId) throw new Error('No forum ID');

    const messageData: CreateMessageData = {
      content,
      parent_message_id: parentMessageId,
    };

    try {
      if (parentMessageId) {
        const newReply = await postMessageReply(forumId, parentMessageId, { content });

        if (threadView?.id === parentMessageId) {
          setThreadReplies((prev) => [...prev, newReply]);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === parentMessageId ? { ...msg, reply_count: msg.reply_count + 1 } : msg
          ).concat(newReply)
        );
      } else {
        const newMessage = await postForumMessage(forumId, messageData);
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        showToast('warning', 'You do not have permission to send messages in this forum');
      } else {
        showToast('error', 'Failed to send message. Please try again.');
      }
    }
  };

  const handleAddMember = async (userId: string, role: string) => {
    try {
      const memberData: AddMemberData = {
        user_id: userId,
        role: role as 'member' | 'moderator',
      };
      const newMember = await addForumMember(forumId, memberData);
      setMembers((prev) => [...prev, newMember]);
      setIsAddMemberOpen(false);
      showToast('success', 'Member added successfully');
    } catch (error) {
      showToast('error', 'Failed to add member');
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleShowThread = async (message: Message) => {
    setThreadView(message);
    setLoadingThread(true);
    try {
      const replies = await getMessageReplies(forumId, message.id);
      // Handle both array and paginated responses
      const threadReplyList = Array.isArray(replies) 
        ? replies 
        : (replies && typeof replies === 'object' && 'results' in replies 
            ? (replies as any).results 
            : []);
      setThreadReplies(threadReplyList);
    } catch (error) {
      console.error('Failed to load thread replies:', error);
      showToast('error', 'Failed to load thread replies');
    } finally {
      setLoadingThread(false);
    }
  };

  const handleCloseThread = () => {
    setThreadView(null);
    setThreadReplies([]);
    setLoadingThread(false);
  };

  const handleSendThreadReply = async (content: string, parentMessageId?: string) => {
    if (!forumId || !threadView) return;

    try {
      const newReply = await postMessageReply(forumId, threadView.id, { content });
      setThreadReplies((prev) => [...prev, newReply]);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === threadView.id ? { ...msg, reply_count: msg.reply_count + 1 } : msg
        )
      );
      if (parentMessageId) {
        setReplyingTo(null);
      }
    } catch (error: any) {
      showToast('error', 'Failed to send reply. Please try again.');
    }
  };

  const getInitials = (user: UserType) => {
    if (!user.first_name && !user.last_name) {
      return user.email?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?';
    }
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserDisplayName = (user: UserType) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || user.username || 'Unknown User';
  };

  // Safe ID comparison that handles both string and number types
  const isOwnMessage = (message: Message) => {
    const messageUserId = String(message.user.id);
    const currentUserId = String(currentUser?.id || '');
    return messageUserId === currentUserId && currentUserId !== '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae1] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (unauthorized || !forum) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this forum.
          </p>
          <Button
            onClick={() => router.push('/portal/forums')}
            className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white"
          >
            Back to Forums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed positioning */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 z-40 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Forums</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search forums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Forums List - Scrollable */}
        <ScrollArea className="flex-1">
          {forums
            .filter((f) =>
              f.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((f) => (
              <div
                key={f.id}
                className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors duration-200 border-l-4 ${
                  f.id === forumId
                    ? 'bg-[#27aae1]/10 border-l-[#27aae1]'
                    : 'border-l-transparent hover:bg-gray-100'
                }`}
                onClick={() => {
                  router.push(`/portal/forums/${f.id}`);
                  setIsSidebarOpen(false);
                }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    f.is_private ? 'bg-orange-100' : 'bg-blue-50'
                  }`}
                >
                  {f.is_private ? (
                    <Lock className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Hash className="w-5 h-5 text-[#27aae1]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {f.description || 'No description'}
                  </p>
                </div>
              </div>
            ))}
        </ScrollArea>

        {/* Top Members Section - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Members</h3>
          <div className="space-y-2">
            {members.slice(0, 4).map((member) => (
              <div
                key={member.user.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#27aae1] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {getInitials(member.user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isSidebarOpen ? 'ml-80 lg:ml-0' : 'ml-0'}`}>
        {/* Header - Sticky */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-4 lg:px-6 w-full">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/portal/forums')}
                  className="p-2 hover:bg-gray-50 rounded-lg -ml-2"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      forum.is_private ? 'bg-orange-100' : 'bg-blue-50'
                    }`}
                  >
                    {forum.is_private ? (
                      <Lock className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Hash className="w-4 h-4 text-[#27aae1]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-base font-semibold text-gray-900 truncate">
                        {forum.name}
                      </h1>
                      <Badge
                        variant={forum.is_private ? 'secondary' : 'outline'}
                        className="text-xs hidden sm:inline-flex"
                      >
                        {forum.is_private ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                    {forum.description && (
                      <p className="text-xs text-gray-500 truncate hidden sm:block">
                        {forum.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2 h-8 px-3 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMembersOpen(true)}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{members.length}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="sm:hidden h-8 w-8 p-0"
                  onClick={() => setIsMembersOpen(true)}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white h-8 px-3 rounded-lg shadow-sm"
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline text-sm">Add Member</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <ScrollArea className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
            <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 w-full">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center min-h-full py-16">
                  <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Hash className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to #{forum.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      This is the beginning of your conversation in this forum. Send your first message to get started!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => {
                    const isOwn = isOwnMessage(message);
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showAvatar =
                      !prevMessage ||
                      prevMessage.user.id !== message.user.id ||
                      isOwn !== isOwnMessage(prevMessage);

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        onReply={handleReply}
                        onShowThread={handleShowThread}
                        isReply={message.is_thread_reply}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input - Fixed at bottom */}
          <div className="bg-white border-t border-gray-100 flex-shrink-0">
            <div className="max-w-3xl mx-auto px-4 lg:px-6 w-full">
              <MessageInput
                onSendMessage={handleSendMessage}
                placeholder={`Message #${forum.name}`}
                disabled={false}
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
              />
            </div>
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        existingMemberIds={new Set(members.map((m) => m.user.id))}
      />

      <ThreadModal
        threadView={threadView}
        threadReplies={threadReplies}
        onClose={handleCloseThread}
        onSendReply={handleSendThreadReply}
        loadingThread={loadingThread}
        currentUser={currentUser as UserType | null}
        forumId={forumId}
      />
    </div>
  );
};

export default ForumDetailPage;