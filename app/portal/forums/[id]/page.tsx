// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   Users, 
//   UserPlus, 
//   Settings, 
//   Hash, 
//   Lock, 
//   ArrowLeft,
//   MessageSquare,
//   ShieldAlert
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { 
//   Channel, 
//   ChannelMembership, 
//   Message, 
//   CreateMessageData, 
//   AddMemberData,
//   UserType 
// } from '@/types/dashboard/forums';
// import { 
//   addForumMember, 
//   getForum, 
//   getForumMembers, 
//   getForumMessages, 
//   getMessageReplies, 
//   postForumMessage,
//   postMessageReply,
// } from '@/app/api/dashboard/forums';
// import { getUsers } from '@/app/api/dashboard/proposals';

// import ChatMessage from './chatmessage';
// import MessageInput from './input';
// import { useGlobalUser } from '@/app/context/guard';
// import AddUserModal from './user';

// const ForumDetailPage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const forumId = params.id as string;
//   const { user: currentUser } = useGlobalUser();
  
//   const [forum, setForum] = useState<Channel | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [members, setMembers] = useState<ChannelMembership[]>([]);
//   const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [unauthorized, setUnauthorized] = useState(false);
//   const [isMembersOpen, setIsMembersOpen] = useState(false);
//   const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
//   const [threadView, setThreadView] = useState<Message | null>(null);
//   const [threadReplies, setThreadReplies] = useState<Message[]>([]);
//   const [loadingThread, setLoadingThread] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (forumId) {
//       fetchForumData();
//     }
//   }, [forumId]);

//   useEffect(() => {
//     if (messages.length > 0) {
//       scrollToBottom();
//     }
//   }, [messages.length]);

//   const showToast = (type: 'error' | 'warning', message: string) => {
//     const toast = document.createElement('div');
//     toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
//       type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
//     }`;
    
//     const iconColor = type === 'error' ? '#dc2626' : '#ea580c';
//     const textColor = type === 'error' ? 'text-red-800' : 'text-orange-800';
    
//     toast.innerHTML = `
//       <svg class="w-5 h-5" style="color: ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
//       </svg>
//       <span class="${textColor} font-medium">${message}</span>
//     `;
    
//     document.body.appendChild(toast);
//     setTimeout(() => toast.remove(), 5000);
//   };

//   const fetchForumData = async () => {
//     if (!forumId) return;

//     try {
//       setLoading(true);
      
//       // Fetch forum data first to check basic access
//       const forumData = await getForum(forumId);
//       setForum(forumData);
      
//       // Then try to fetch messages, members, and users
//       try {
//         const [messagesData, membersData, usersData] = await Promise.all([
//           getForumMessages(forumId),
//           getForumMembers(forumId),
//           getUsers()
//         ]);
        
//         const sortedMessages = (messagesData.results || messagesData || [])
//           .filter((msg: Message) => !msg.is_thread_reply)
//           .sort((a: Message, b: Message) => 
//             new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//           );
//         setMessages(sortedMessages);
        
//         setMembers(membersData);
        
//         const usersList = Array.isArray(usersData) ? usersData : (usersData.results || []);
//         setAvailableUsers(usersList);
        
//       } catch (innerError: any) {
//         // Handle permission errors for messages/members
//         if (innerError?.response?.status === 403 || innerError?.response?.status === 401) {
//           setUnauthorized(true);
//           showToast('warning', 'You are not authorized to access this forum');
          
//           setTimeout(() => {
//             router.push('/portal/forums');
//           }, 2000);
//           return;
//         }
//         throw innerError;
//       }
      
//     } catch (error: any) {
//       console.error('Failed to fetch forum data:', error);
      
//       if (error?.response?.status === 403 || error?.response?.status === 401) {
//         setUnauthorized(true);
//         showToast('warning', 'You are not authorized to access this forum');
        
//         setTimeout(() => {
//           router.push('/portal/forums');
//         }, 2000);
//       } else if (error?.response?.status === 404) {
//         setForum(null);
//       } else {
//         showToast('error', 'Failed to load forum. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = async (content: string, parentMessageId?: string): Promise<void> => {
//     if (!forumId) throw new Error('No forum ID');

//     const messageData: CreateMessageData = { 
//       content,
//       parent_message_id: parentMessageId
//     };
    
//     try {
//       if (parentMessageId) {
//         const newReply = await postMessageReply(forumId, parentMessageId, { content });
        
//         if (threadView?.id === parentMessageId) {
//           setThreadReplies(prev => [...prev, newReply]);
//         }
        
//         setMessages(prev => prev.map(msg => 
//           msg.id === parentMessageId 
//             ? { ...msg, reply_count: msg.reply_count + 1 }
//             : msg
//         ));
//       } else {
//         const newMessage = await postForumMessage(forumId, messageData);
//         setMessages(prev => [...prev, newMessage]);
//       }
//     } catch (error: any) {
//       if (error?.response?.status === 403 || error?.response?.status === 401) {
//         showToast('warning', 'You do not have permission to send messages in this forum');
//       } else {
//         showToast('error', 'Failed to send message. Please try again.');
//       }
//     }
//   };

//   const handleAddMember = async (userId: string, role: 'member' | 'moderator'): Promise<void> => {
//     if (!forumId) throw new Error('No forum ID');

//     const memberData: AddMemberData = {
//       user_id: userId,
//       role
//     };
    
//     try {
//       const newMembership = await addForumMember(forumId, memberData);
//       setMembers(prev => [...prev, newMembership]);
//       setIsAddMemberOpen(false);
//       showToast('warning', 'Member added successfully');
//     } catch (error: any) {
//       if (error?.response?.status === 403 || error?.response?.status === 401) {
//         showToast('warning', 'You do not have permission to add members');
//       } else {
//         showToast('error', 'Failed to add member. Please try again.');
//       }
//     }
//   };

//   const isOwnMessage = (message: Message): boolean => {
//     if (!currentUser) return false;
//     return message.user.id.toString() === currentUser.id.toString();
//   };

//   const handleReply = (message: Message) => {
//     setReplyingTo(message);
//     setThreadView(null);
//   };

//   const handleCancelReply = () => {
//     setReplyingTo(null);
//   };

//   const handleShowThread = async (message: Message) => {
//     if (!message.reply_count) return;
    
//     setLoadingThread(true);
//     setThreadView(message);
//     setReplyingTo(null);
    
//     try {
//       const replies = await getMessageReplies(forumId, message.id);
//       setThreadReplies(replies);
//     } catch (error: any) {
//       if (error?.response?.status === 403 || error?.response?.status === 401) {
//         showToast('warning', 'You do not have permission to view thread replies');
//       } else {
//         showToast('error', 'Failed to load thread replies');
//       }
//     } finally {
//       setLoadingThread(false);
//     }
//   };

//   const handleCloseThread = () => {
//     setThreadView(null);
//     setThreadReplies([]);
//   };

//   if (loading) {
//     return (
//       <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#27aae1] border-t-transparent"></div>
//           <p className="text-gray-600 text-sm font-medium">Loading forum...</p>
//         </div>
//       </div>
//     );
//   }

//   if (unauthorized) {
//     return (
//       <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <ShieldAlert className="w-8 h-8 text-orange-600" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
//           <p className="text-gray-500 mb-6">You are not authorized to access this forum. Redirecting...</p>
//           <Button
//             variant="outline"
//             onClick={() => router.push('/dashboard/forums')}
//             className="inline-flex items-center"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Forums
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!forum) {
//     return (
//       <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <MessageSquare className="w-8 h-8 text-gray-400" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Forum not found</h2>
//           <p className="text-gray-500 mb-6">The forum you're looking for doesn't exist.</p>
//           <Button
//             variant="outline"
//             onClick={() => router.push('/dashboard/forums')}
//             className="inline-flex items-center"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Forums
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
//       <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-20 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => router.push('/dashboard/forums')}
//                 className="p-2 hover:bg-gray-100 rounded-full"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </Button>
              
//               <div className="flex items-center space-x-3">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                   forum.is_private 
//                     ? 'bg-gradient-to-br from-orange-400 to-orange-500' 
//                     : 'bg-gradient-to-br from-[#27aae1] to-[#1e8bb8]'
//                 }`}>
//                   {forum.is_private ? (
//                     <Lock className="w-5 h-5 text-white" />
//                   ) : (
//                     <Hash className="w-5 h-5 text-white" />
//                   )}
//                 </div>
                
//                 <div>
//                   <h1 className="text-lg font-semibold text-gray-900">{forum.name}</h1>
//                   {forum.description && (
//                     <p className="text-sm text-gray-500 max-w-md truncate hidden sm:block">
//                       {forum.description}
//                     </p>
//                   )}
//                 </div>
                
//                 <Badge 
//                   variant={forum.is_private ? "secondary" : "outline"}
//                   className="hidden sm:inline-flex"
//                 >
//                   {forum.is_private ? 'Private' : 'Public'}
//                 </Badge>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 className="hidden sm:flex items-center space-x-2 bg-white/70 border-gray-200/70"
//                 onClick={() => setIsMembersOpen(true)}
//               >
//                 <Users className="w-4 h-4" />
//                 <span>{members.length}</span>
//               </Button>

//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 className="sm:hidden p-2"
//                 onClick={() => setIsMembersOpen(true)}
//               >
//                 <Users className="w-4 h-4" />
//               </Button>

//               <Button 
//                 size="sm" 
//                 className="bg-gradient-to-r from-[#27aae1] to-[#1e8bb8] hover:from-[#1e8bb8] hover:to-[#166a91] text-white shadow-sm"
//                 onClick={() => setIsAddMemberOpen(true)}
//               >
//                 <UserPlus className="w-4 h-4 sm:mr-2" />
//                 <span className="hidden sm:inline">Add</span>
//               </Button>

//               <Button 
//                 variant="ghost" 
//                 size="sm"
//                 className="p-2 hover:bg-gray-100 rounded-full"
//               >
//                 <Settings className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 flex flex-col min-h-0">
//         <ScrollArea className="flex-1" ref={scrollAreaRef}>
//           <div className="min-h-full">
//             {messages.length === 0 ? (
//               <div className="flex items-center justify-center min-h-full px-4 py-16">
//                 <div className="text-center max-w-md">
//                   <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
//                     <Hash className="w-10 h-10 text-[#27aae1]" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-3">
//                     Welcome to #{forum.name}
//                   </h3>
//                   <p className="text-gray-500 leading-relaxed">
//                     This is the beginning of your conversation in this forum. Send your first message to get started!
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="py-4">
//                 {messages.map((message, index) => {
//                   const isOwn = isOwnMessage(message);
//                   const prevMessage = index > 0 ? messages[index - 1] : null;
//                   const showAvatar = !prevMessage || 
//                     prevMessage.user.id !== message.user.id ||
//                     isOwn !== isOwnMessage(prevMessage);
                  
//                   return (
//                     <ChatMessage
//                       key={message.id}
//                       message={message}
//                       isOwn={isOwn}
//                       showAvatar={showAvatar}
//                       onReply={handleReply}
//                       onShowThread={handleShowThread}
//                     />
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </div>
//             )}
//           </div>
//         </ScrollArea>

//         <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60">
//           <div className="max-w-7xl mx-auto">
//             <MessageInput
//               onSendMessage={handleSendMessage}
//               placeholder={`Message #${forum.name}`}
//               disabled={false}
//               replyingTo={replyingTo}
//               onCancelReply={handleCancelReply}
//             />
//           </div>
//         </div>
//       </div>

//       <AddUserModal
//         isOpen={isAddMemberOpen}
//         onClose={() => setIsAddMemberOpen(false)}
//         onAddMember={handleAddMember}
//         existingMemberIds={new Set(members.map(m => m.user.id))}
//       />
//     </div>
//   );
// };

// export default ForumDetailPage;

'use client'
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
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Channel, 
  ChannelMembership, 
  Message, 
  CreateMessageData, 
  AddMemberData,
  UserType 
} from '@/types/dashboard/forums';
import { 
  addForumMember, 
  getForum, 
  getForumMembers, 
  getForumMessages, 
  getMessageReplies, 
  postForumMessage,
  postMessageReply,
} from '@/app/api/dashboard/forums';
import { getUsers } from '@/app/api/dashboard/proposals';

import ChatMessage from './chatmessage';
import MessageInput from './input';
import { useGlobalUser } from '@/app/context/guard';
import AddUserModal from './user';

const ForumDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const forumId = params.id as string;
  const { user: currentUser } = useGlobalUser();
  
  const [forum, setForum] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChannelMembership[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [threadView, setThreadView] = useState<Message | null>(null);
  const [threadReplies, setThreadReplies] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forumId) {
      fetchForumData();
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
      success: 'bg-green-50 border-green-200'
    };
    const iconColors = {
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a'
    };
    const textColors = {
      error: 'text-red-800',
      warning: 'text-orange-800',
      success: 'text-green-800'
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
          getUsers()
        ]);
        
        const sortedMessages = (messagesData.results || messagesData || [])
          .filter((msg: Message) => !msg.is_thread_reply)
          .sort((a: Message, b: Message) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        setMessages(sortedMessages);
        
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
      parent_message_id: parentMessageId
    };
    
    try {
      if (parentMessageId) {
        const newReply = await postMessageReply(forumId, parentMessageId, { content });
        
        if (threadView?.id === parentMessageId) {
          setThreadReplies(prev => [...prev, newReply]);
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === parentMessageId 
            ? { ...msg, reply_count: msg.reply_count + 1 }
            : msg
        ));
      } else {
        const newMessage = await postForumMessage(forumId, messageData);
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        showToast('warning', 'You do not have permission to send messages in this forum');
      } else {
        showToast('error', 'Failed to send message. Please try again.');
      }
    }
  };

  const handleAddMember = async (userId: string, role: 'member' | 'moderator'): Promise<void> => {
    if (!forumId) throw new Error('No forum ID');

    const memberData: AddMemberData = {
      user_id: userId,
      role
    };
    
    try {
      const newMembership = await addForumMember(forumId, memberData);
      setMembers(prev => [...prev, newMembership]);
      setIsAddMemberOpen(false);
      showToast('success', 'Member added successfully');
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        showToast('warning', 'You do not have permission to add members');
      } else {
        showToast('error', 'Failed to add member. Please try again.');
      }
    }
  };

  const isOwnMessage = (message: Message): boolean => {
    if (!currentUser) return false;
    return message.user.id.toString() === currentUser.id.toString();
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setThreadView(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleShowThread = async (message: Message) => {
    if (!message.reply_count) return;
    
    setLoadingThread(true);
    setThreadView(message);
    setReplyingTo(null);
    
    try {
      const replies = await getMessageReplies(forumId, message.id);
      setThreadReplies(replies);
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        showToast('warning', 'You do not have permission to view thread replies');
      } else {
        showToast('error', 'Failed to load thread replies');
      }
    } finally {
      setLoadingThread(false);
    }
  };

  const handleCloseThread = () => {
    setThreadView(null);
    setThreadReplies([]);
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#27aae1] border-t-transparent"></div>
          <p className="text-gray-600 text-sm font-medium">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You are not authorized to access this forum. Redirecting...</p>
          <Button
            variant="outline"
            onClick={() => router.push('/portal/forums')}
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Forum not found</h2>
          <p className="text-gray-500 mb-6">The forum you're looking for doesn't exist.</p>
          <Button
            variant="outline"
            onClick={() => router.push('/portal/forums')}
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/portal/forums')}
                className="p-2 hover:bg-gray-50 rounded-lg -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  forum.is_private 
                    ? 'bg-orange-100' 
                    : 'bg-blue-50'
                }`}>
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
                      variant={forum.is_private ? "secondary" : "outline"}
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

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-5xl mx-auto px-6 min-h-full">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-full py-16">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16  rounded-2xl flex items-center justify-center mx-auto mb-4">
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
              <div className="py-6">
                {messages.map((message, index) => {
                  const isOwn = isOwnMessage(message);
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showAvatar = !prevMessage || 
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
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
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

      <AddUserModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        existingMemberIds={new Set(members.map(m => m.user.id))}
      />
    </div>
  );
};

export default ForumDetailPage;