// import React from 'react';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { MoreVertical, Reply, Smile, MessageSquare } from 'lucide-react';
// import { ChatMessageProps, UserType, Message } from '@/types/dashboard/forums';

// const getInitials = (user: UserType): string => {
//   if (user?.first_name && user?.last_name) {
//     return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
//   }
//   if (user?.username) {
//     return user.username[0].toUpperCase();
//   }
//   return '?';
// };

// const getUserDisplayName = (user: UserType): string => {
//   if (user?.first_name && user?.last_name) {
//     return `${user.first_name} ${user.last_name}`;
//   }
//   return user?.username || 'Unknown User';
// };

// const formatMessageTime = (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diff = now.getTime() - date.getTime();
  
//   if (diff < 60000) return 'Just now';
//   if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
//   if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
//   if (date.toDateString() === now.toDateString()) {
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit', 
//       hour12: true 
//     });
//   }
  
//   return date.toLocaleDateString('en-US', { 
//     month: 'short', 
//     day: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit'
//   });
// };

// const ChatMessage: React.FC<ChatMessageProps> = ({ 
//   message, 
//   isOwn, 
//   showAvatar = true,
//   onReply,
//   onShowThread
// }) => {
//   return (
//     <div className={`group relative px-4 py-2 hover:bg-black/5 transition-all duration-200 ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
//       <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} max-w-4xl mx-auto`}>
//         {/* Avatar */}
//         {showAvatar && !isOwn && (
//           <div className="flex-shrink-0">
//             <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
//               <AvatarFallback className="bg-gradient-to-br from-[#27aae1] to-[#1e8bb8] text-white text-sm font-medium">
//                 {getInitials(message.user)}
//               </AvatarFallback>
//             </Avatar>
//           </div>
//         )}
        
//         {/* Message content */}
//         <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
//           {/* User info */}
//           {!isOwn && showAvatar && (
//             <div className="flex items-center space-x-2 mb-1">
//               <span className="text-sm font-semibold text-gray-900">
//                 {getUserDisplayName(message.user)}
//               </span>
//               <span className="text-xs text-gray-500">
//                 {formatMessageTime(message.created_at)}
//               </span>
//             </div>
//           )}
          
//           {/* Parent message reference for replies */}
//           {message.parent_message && (
//             <div className={`mb-2 ${isOwn ? 'text-right' : ''}`}>
//               <div className="inline-flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                 <Reply className="w-3 h-3" />
//                 <span>Replying to {getUserDisplayName(message.parent_message.user)}</span>
//               </div>
//             </div>
//           )}
          
//           {/* Message bubble */}
//           <div 
//             className={`
//               inline-block max-w-full px-4 py-3 rounded-2xl shadow-sm
//               transition-all duration-200 hover:shadow-md
//               ${isOwn 
//                 ? 'bg-gradient-to-r from-[#27aae1] to-[#1e8bb8] text-white ml-auto' 
//                 : 'bg-white border border-gray-200 text-gray-900'
//               }
//               ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}
//             `}
//           >
//             <div className="break-words">
//               <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                 {message.content}
//               </p>
              
//               {/* Own message timestamp */}
//               {isOwn && (
//                 <div className="text-xs text-blue-100 mt-1 opacity-80">
//                   {formatMessageTime(message.created_at)}
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Thread info */}
//           {message.reply_count > 0 && (
//             <div className={`mt-2 ${isOwn ? 'text-right' : ''}`}>
//               <button 
//                 className="inline-flex items-center space-x-1 text-xs text-[#27aae1] hover:text-[#1e8bb8] font-medium transition-colors hover:bg-blue-50 px-2 py-1 rounded"
//                 onClick={() => onShowThread?.(message)}
//               >
//                 <MessageSquare className="w-3 h-3" />
//                 <span>{message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}</span>
//               </button>
//             </div>
//           )}
//         </div>
        
//         {/* Message actions */}
//         <div className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwn ? 'order-first mr-2' : 'ml-2'}`}>
//           <div className="flex items-center space-x-1">
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
//               onClick={() => onReply?.(message)}
//               title="Reply to this message"
//             >
//               <Reply className="w-4 h-4 text-gray-500" />
//             </Button>
            
//             {message.reply_count > 0 && (
//               <Button 
//                 variant="ghost" 
//                 size="sm" 
//                 className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
//                 onClick={() => onShowThread?.(message)}
//                 title="View thread"
//               >
//                 <MessageSquare className="w-4 h-4 text-gray-500" />
//               </Button>
//             )}
            
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
//               title="Add reaction"
//             >
//               <Smile className="w-4 h-4 text-gray-500" />
//             </Button>
            
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
//               title="More options"
//             >
//               <MoreVertical className="w-4 h-4 text-gray-500" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;