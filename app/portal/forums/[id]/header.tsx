import React from 'react';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Hash, 
  Lock, 
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Channel, ChannelMembership } from '@/types/dashboard/forums';

interface ForumHeaderProps {
  forum: Channel;
  members: ChannelMembership[];
  onBack: () => void;
  onViewMembers: () => void;
  onAddMember: () => void;
  onSettings?: () => void;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
  forum,
  members,
  onBack,
  onViewMembers,
  onAddMember,
  onSettings,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          {forum.is_private ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <Hash className="w-5 h-5 text-gray-500" />
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{forum.name}</h1>
            {forum.description && (
              <p className="text-sm text-gray-500 max-w-md truncate">{forum.description}</p>
            )}
          </div>
        </div>
        
        <Badge variant={forum.is_private ? "secondary" : "outline"}>
          {forum.is_private ? 'Private' : 'Public'}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-1 hover:bg-gray-50"
          onClick={onViewMembers}
        >
          <Users className="w-4 h-4" />
          <span>{members.length}</span>
        </Button>

        <Button 
          size="sm" 
          className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white"
          onClick={onAddMember}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Add
        </Button>

        {onSettings && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onSettings}
            className="hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ForumHeader;