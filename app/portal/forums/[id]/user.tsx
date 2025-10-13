import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, User, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserType } from '@/types/dashboard/forums';
import { getUsers } from '@/app/api/dashboard/proposals';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string, role: 'member' | 'moderator') => Promise<void>;
  existingMemberIds: Set<number>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingMemberIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'moderator'>('member');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers();

      setAvailableUsers(usersData.results);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAvailableUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers(new Set());
      setSearchTerm('');
      setAvailableUsers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = availableUsers.filter(user => {
    if (existingMemberIds.has(user.id)) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.first_name && user.first_name.toLowerCase().includes(search)) ||
        (user.last_name && user.last_name.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      // Deselect all
      setSelectedUsers(new Set());
    } else {
      // Select all filtered users
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleAddSelectedUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setIsAdding(true);
    try {
      // Add users one by one
      for (const userId of selectedUsers) {
        await onAddMember(userId.toString(), selectedRole);
      }
      // Clear selection and close modal after successful add
      setSelectedUsers(new Set());
      onClose();
    } catch (error) {
      console.error('Failed to add users:', error);
    }
    setIsAdding(false);
  };

  const getUserInitial = (user: UserType) => {
    if (user.first_name && user.first_name.trim()) {
      return user.first_name[0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getUserDisplayName = (user: UserType) => {
    const parts = [];
    if (user.first_name && user.first_name.trim()) {
      parts.push(user.first_name);
    }
    if (user.last_name && user.last_name.trim()) {
      parts.push(user.last_name);
    }
    return parts.length > 0 ? parts.join(' ') : user.username;
  };

  const allFilteredSelected = filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-[#27aae1]" />
              Add Members
            </h2>
            {selectedUsers.size > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Role Selection */}
        <div className="p-6 border-b">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={selectedRole === 'member' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('member')}
              className={selectedRole === 'member' ? 'bg-[#27aae1]' : ''}
            >
              <User className="w-4 h-4 mr-1" />
              Member
            </Button>
            <Button
              size="sm"
              variant={selectedRole === 'moderator' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('moderator')}
              className={selectedRole === 'moderator' ? 'bg-[#27aae1]' : ''}
            >
              <Shield className="w-4 h-4 mr-1" />
              Moderator
            </Button>
          </div>
        </div>

        {/* Search and Select All */}
        <div className="p-6 pb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#27aae1] outline-none"
              disabled={loading}
            />
          </div>
          
          {!loading && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllUsers}
                className="text-sm"
              >
                <Check className="w-4 h-4 mr-1" />
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-gray-500">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available
              </span>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#27aae1] border-t-transparent"></div>
                <p className="text-gray-500 text-sm">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {availableUsers.length === 0 ? (
                <div>
                  <p>No users found.</p>
                  <p className="text-xs mt-2">Total users loaded: {availableUsers.length}</p>
                </div>
              ) : searchTerm ? (
                'No users found matching your search.'
              ) : (
                <div>
                  <p>All users are already members of this forum.</p>
                  <p className="text-xs mt-2">
                    Total users: {availableUsers.length}, Already members: {existingMemberIds.size}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.has(user.id);
                return (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#27aae1]/10 border border-[#27aae1]/20' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-[#27aae1] border-[#27aae1]' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="w-10 h-10 bg-[#27aae1] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getUserInitial(user)}
                      </div>
                      
                      <div>
                        <p className="font-medium">{getUserDisplayName(user)}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Add Button */}
        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSelectedUsers}
              disabled={selectedUsers.size === 0 || isAdding}
              className="bg-[#27aae1] hover:bg-[#1e8bb8]"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  Add {selectedUsers.size > 0 ? `${selectedUsers.size} ` : ''}Member{selectedUsers.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;