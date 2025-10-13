import React, { useState } from 'react';
import { MoreVertical, Reply, Edit, Trash2, Copy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Message, UserType } from '@/types/dashboard/forums';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  currentUser?: UserType;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  currentUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (user: any) => {
    if (!user) return '?';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const username = user.username || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username[0]?.toUpperCase() || '?';
  };

  const getUserName = (user: any) => {
    if (!user) return 'Unknown';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || 'Unknown';
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  return (
    <div 
      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for others */}
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 mr-3 mt-1">
          <AvatarFallback className="bg-gray-500 text-white text-sm">
            {getInitials(message.user)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
        {/* User name for others */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-600 mb-1 px-1">
            {getUserName(message.user)}
          </div>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div className={`
            px-4 py-2 rounded-2xl break-words
            ${isOwnMessage 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
            }
          `}>
            <p className="text-sm">{message.content}</p>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>

          {/* Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwnMessage ? '-left-8' : '-right-8'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white border shadow-sm">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onReply?.(message)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyMessage}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isOwnMessage && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit?.(message)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete?.(message)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwnMessage && (
        <Avatar className="w-8 h-8 ml-3 mt-1">
          <AvatarFallback className="bg-blue-500 text-white text-sm">
            {getInitials(currentUser)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;