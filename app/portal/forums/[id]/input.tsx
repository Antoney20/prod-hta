// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Send, Smile, Paperclip, X, Mic } from 'lucide-react';
// import { Message, UserType } from '@/types/dashboard/forums';

// interface MessageInputProps {
//   onSendMessage: (content: string, parentMessageId?: string) => Promise<void>;
//   placeholder?: string;
//   disabled?: boolean;
//   replyingTo?: Message | null;
//   onCancelReply?: () => void;
// }

// const getUserDisplayName = (user: UserType): string => {
//   if (user?.first_name && user?.last_name) {
//     return `${user.first_name} ${user.last_name}`;
//   }
//   return user?.username || 'Unknown User';
// };

// const MessageInput: React.FC<MessageInputProps> = ({
//   onSendMessage,
//   placeholder = "Type a message...",
//   disabled = false,
//   replyingTo = null,
//   onCancelReply
// }) => {
//   const [message, setMessage] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
//     }
//   }, [message]);

//   useEffect(() => {
//     if (replyingTo && textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   }, [replyingTo]);

//   const handleSend = async () => {
//     if (!message.trim() || isSending || disabled) return;

//     setIsSending(true);
//     try {
//       await onSendMessage(message.trim(), replyingTo?.id);
//       setMessage('');
//       if (textareaRef.current) {
//         textareaRef.current.style.height = 'auto';
//       }
//       // Auto-cancel reply after sending
//       if (replyingTo && onCancelReply) {
//         onCancelReply();
//       }
//     } catch (error) {
//       console.error('Failed to send message:', error);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     } else if (e.key === 'Escape' && replyingTo && onCancelReply) {
//       onCancelReply();
//     }
//   };

//   const canSend = message.trim().length > 0 && !isSending && !disabled;

//   return (
//     <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Reply banner */}
//         {replyingTo && (
//           <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-start justify-between">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center space-x-2 mb-1">
//                   <span className="text-xs font-medium text-blue-600">
//                     Replying to {getUserDisplayName(replyingTo.user)}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 truncate">
//                   {replyingTo.content}
//                 </p>
//               </div>
//               {onCancelReply && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-6 w-6 p-0 ml-2 text-gray-400 hover:text-gray-600"
//                   onClick={onCancelReply}
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="flex items-end space-x-3">
//           {/* Attachment button */}
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 mb-1"
//             disabled={disabled}
//           >
//             <Paperclip className="w-5 h-5" />
//           </Button>

//           {/* Message input container */}
//           <div className="flex-1 relative">
//             <div className="relative flex items-end bg-gray-50 rounded-full border border-gray-200 focus-within:border-[#27aae1] transition-colors hover:shadow-sm focus-within:shadow-md">
//               <Textarea
//                 ref={textareaRef}
//                 placeholder={replyingTo ? `Reply to ${getUserDisplayName(replyingTo.user)}...` : placeholder}
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="resize-none border-0 bg-transparent px-4 py-3 pr-16 rounded-full focus:ring-0 focus:outline-none max-h-32 min-h-[44px]"
//                 rows={1}
//                 disabled={disabled || isSending}
//               />
              
//               {/* Emoji button */}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-14 bottom-2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
//                 disabled={disabled}
//               >
//                 <Smile className="w-5 h-5" />
//               </Button>

//               {/* Send button */}
//               <Button
//                 onClick={handleSend}
//                 disabled={!canSend}
//                 className={`absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full transition-all duration-200 ${
//                   canSend 
//                     ? 'bg-gradient-to-r from-[#27aae1] to-[#1e8bb8] hover:from-[#1e8bb8] hover:to-[#166a91] text-white shadow-sm hover:shadow-md scale-100' 
//                     : 'bg-gray-200 text-gray-400 scale-95'
//                 }`}
//               >
//                 {isSending ? (
//                   <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
//                 ) : (
//                   <Send className="w-4 h-4" />
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* Voice message button */}
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 mb-1"
//             disabled={disabled}
//           >
//             <Mic className="w-5 h-5" />
//           </Button>
//         </div>

//         {/* Helper text */}
//         <div className="text-center mt-2">
//           <p className="text-xs text-gray-500">
//             Press <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">Enter</span> to send • 
//             <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium ml-1">Shift + Enter</span> for new line
//             {replyingTo && (
//               <span> • <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium ml-1">Esc</span> to cancel reply</span>
//             )}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageInput;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Paperclip, X, Plus } from 'lucide-react';
import { Message, UserType } from '@/types/dashboard/forums';

interface MessageInputProps {
  onSendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

const getUserDisplayName = (user: UserType): string => {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user?.username || 'Unknown User';
};

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  replyingTo = null,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim(), replyingTo?.id);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (replyingTo && onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && replyingTo && onCancelReply) {
      onCancelReply();
    }
  };

  const canSend = message.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="py-4">
      {/* Reply banner */}
      {replyingTo && (
        <div className="mb-3 px-4 py-2 bg-blue-50 border-l-2 border-[#27aae1] rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="text-xs font-medium text-[#27aae1]">
                  Replying to {getUserDisplayName(replyingTo.user)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {replyingTo.content}
              </p>
            </div>
            {onCancelReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                onClick={onCancelReply}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-end space-x-3">
        {/* Message input container */}
        <div className="flex-1 relative">
          <div 
            className={`relative flex items-end bg-gray-50 rounded-2xl border transition-all duration-200 ${
              isFocused 
                ? 'border-[#27aae1] bg-white shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Textarea
              ref={textareaRef}
              placeholder={replyingTo ? `Reply to ${getUserDisplayName(replyingTo.user)}...` : placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="resize-none border-0 bg-transparent px-4 py-3 pr-24 rounded-2xl focus:ring-0 focus:outline-none max-h-32 min-h-[48px] text-sm"
              rows={1}
              disabled={disabled || isSending}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {/* Attachment button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={disabled}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* Emoji button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={disabled}
              >
                <Smile className="w-4 h-4" />
              </Button>

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={!canSend}
                className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                  canSend 
                    ? 'bg-[#27aae1] hover:bg-[#1e8bb8] text-white shadow-sm hover:shadow scale-100' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'
                }`}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px] font-medium">Enter</kbd> to send
          {replyingTo && (
            <> • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px] font-medium ml-1">Esc</kbd> to cancel</>
          )}
        </p>
      </div>
    </div>
  );
};

export default MessageInput;