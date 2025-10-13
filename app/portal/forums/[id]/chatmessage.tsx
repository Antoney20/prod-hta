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

// interface EnhancedChatMessageProps extends ChatMessageProps {
//   currentUser?: UserType | null;
//   isReply?: boolean;
// }

// const ChatMessage: React.FC<EnhancedChatMessageProps> = ({ 
//   message, 
//   isOwn, 
//   showAvatar = true,
//   onReply,
//   currentUser,
//   isReply = false
// }) => {

//   return (
//     <div className={`group relative px-4 py-2 hover:bg-black/5 transition-all duration-200 ${isReply ? 'ml-12 pl-4 border-l-2 border-gray-200' : ''}`}>
//       <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} max-w-4xl mx-auto`}>
//         {/* Avatar */}
//         {showAvatar && !isOwn && (
//           <div className="flex-shrink-0">
//             <Avatar className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} ring-2 ring-white shadow-sm`}>
//               <AvatarFallback className={`${isReply ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-[#27aae1] to-[#1e8bb8]'} text-white ${isReply ? 'text-xs' : 'text-sm'} font-medium`}>
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
//               <span className={`${isReply ? 'text-xs' : 'text-sm'} font-semibold ${isReply ? 'text-gray-700' : 'text-gray-900'}`}>
//                 {getUserDisplayName(message.user)}
//               </span>
//               <span className={`text-xs ${isReply ? 'text-gray-400' : 'text-gray-500'}`}>
//                 {formatMessageTime(message.created_at)}
//               </span>
//             </div>
//           )}
          
//           {/* Parent message reference for replies */}
//           {message.parent_message && !isReply && (
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
//               inline-block max-w-full ${isReply ? 'px-3 py-2' : 'px-4 py-3'} ${isReply ? 'rounded-xl' : 'rounded-2xl'} shadow-sm
//               transition-all duration-200 hover:shadow-md
//               ${isOwn 
//                 ? 'bg-gradient-to-r from-[#27aae1] to-[#1e8bb8] text-white ml-auto' 
//                 : isReply 
//                   ? 'bg-gray-50 border border-gray-200 text-gray-800'
//                   : 'bg-white border border-gray-200 text-gray-900'
//               }
//               ${isOwn 
//                 ? isReply ? 'rounded-br-sm' : 'rounded-br-md'
//                 : isReply ? 'rounded-bl-sm' : 'rounded-bl-md'
//               }
//             `}
//           >
//             <div className="break-words">
//               <p className={`${isReply ? 'text-xs' : 'text-sm'} leading-relaxed whitespace-pre-wrap`}>
//                 {message.content}
//               </p>
              
//               {/* Own message timestamp */}
//               {isOwn && (
//                 <div className={`text-xs ${isReply ? 'text-blue-100' : 'text-blue-100'} mt-1 opacity-80`}>
//                   {formatMessageTime(message.created_at)}
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Reply count indicator (only for parent messages) */}
//           {!isReply && message.reply_count > 0 && (
//             <div className={`mt-2 ${isOwn ? 'text-right' : ''}`}>
//               <div className={`inline-flex items-center space-x-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
//                 <span className="inline-flex items-center space-x-1 text-xs text-gray-500">
//                   <MessageSquare className="w-3 h-3" />
//                   <span>{message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}</span>
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {/* Message actions */}
//         <div className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwn ? 'order-first mr-2' : 'ml-2'}`}>
//           <div className="flex items-center space-x-1">
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} p-0 hover:bg-gray-100 rounded-full`}
//               onClick={() => onReply?.(message)}
//               title="Reply to this message"
//             >
//               <Reply className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
//             </Button>
            
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} p-0 hover:bg-gray-100 rounded-full`}
//               title="Add reaction"
//             >
//               <Smile className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
//             </Button>
            
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} p-0 hover:bg-gray-100 rounded-full`}
//               title="More options"
//             >
//               <MoreVertical className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Reply, MessageSquare } from 'lucide-react';
import { ChatMessageProps, UserType, Message } from '@/types/dashboard/forums';

const getInitials = (user: UserType): string => {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user?.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return 'U';
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
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday ' + date.toLocaleTimeString('en-US', { 
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

interface EnhancedChatMessageProps extends ChatMessageProps {
  currentUser?: UserType | null;
  isReply?: boolean;
}

const ChatMessage: React.FC<EnhancedChatMessageProps> = ({ 
  message, 
  isOwn, 
  showAvatar = true,
  onReply,
  onShowThread,
  currentUser,
  isReply = false
}) => {

  return (
    <div className={`group relative py-3 hover:bg-gray-50/50 transition-colors duration-150 ${isReply ? 'ml-12 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0">
            <Avatar className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} ring-1 ring-gray-100`}>
              <AvatarFallback className={`${isReply ? 'bg-gray-400' : 'bg-[#27aae1]'} text-white ${isReply ? 'text-xs' : 'text-sm'} font-semibold`}>
                {getInitials(message.user)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {/* Message content */}
        <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
          {/* User info */}
          {!isOwn && showAvatar && (
            <div className="flex items-center space-x-2 mb-1">
              <span className={`${isReply ? 'text-xs' : 'text-sm'} font-semibold ${isReply ? 'text-gray-700' : 'text-gray-900'}`}>
                {getUserDisplayName(message.user)}
              </span>
              <span className={`text-xs ${isReply ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          )}
          
          {/* Parent message reference for replies */}
          {message.parent_message && !isReply && (
            <div className={`mb-2 ${isOwn ? 'text-right' : ''}`}>
              <div className="inline-flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <Reply className="w-3 h-3" />
                <span>Replying to {getUserDisplayName(message.parent_message.user)}</span>
              </div>
            </div>
          )}
          
          <div 
            className={`
              inline-block max-w-full ${isReply ? 'px-3 py-2' : 'px-4 py-2.5'} ${isReply ? 'rounded-xl' : 'rounded-2xl'}
              transition-all duration-200
              ${isOwn 
                ? 'bg-[#27aae1] text-white ml-auto' 
                : isReply 
                  ? 'bg-gray-50 border border-gray-200 text-gray-800'
                  : 'bg-white border border-gray-200 text-gray-900'
              }
              ${isOwn 
                ? isReply ? 'rounded-br-md' : 'rounded-br-lg'
                : isReply ? 'rounded-bl-md' : 'rounded-bl-lg'
              }
            `}
          >
            <div className="break-words">
              <p className={`${isReply ? 'text-xs' : 'text-sm'} leading-relaxed whitespace-pre-wrap`}>
                {message.content}
              </p>
              
              {isOwn && (
                <div className={`text-xs ${isReply ? 'text-blue-100' : 'text-blue-100'} mt-1 opacity-90`}>
                  {formatMessageTime(message.created_at)}
                </div>
              )}
            </div>
          </div>
          
          {/* Reply count indicator */}
          {!isReply && message.reply_count > 0 && (
            <button
              onClick={() => onShowThread?.(message)}
              className={`mt-1.5 ${isOwn ? 'text-right' : ''} group/thread`}
            >
              <div className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <MessageSquare className="w-3.5 h-3.5 text-[#27aae1]" />
                <span className="text-xs font-medium text-gray-600 group-hover/thread:text-gray-900">
                  {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            </button>
          )}
        </div>
        
        <div className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwn ? 'order-first mr-2' : 'ml-2'}`}>
          <div className="flex items-center space-x-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} p-0 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm`}
              onClick={() => onReply?.(message)}
              title="Reply to this message"
            >
              <Reply className={`${isReply ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-500`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} p-0 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm`}
              title="More options"
            >
              <MoreVertical className={`${isReply ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-500`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;