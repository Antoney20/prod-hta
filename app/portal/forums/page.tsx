'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Lock, Globe, MessageCircle, Calendar, Search, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Channel, CreateChannelData } from '@/types/dashboard/forums';
import { createForum, getForums } from '@/app/api/dashboard/forums';

const ForumsPage = () => {
  const router = useRouter();
  const [forums, setForums] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateChannelData>({
    name: '',
    description: '',
    is_private: false
  });

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const response = await getForums();
      setForums(response.results);
    } catch (error) {
      console.error('Failed to fetch forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newForum = await createForum(formData);
      setForums(prev => [newForum, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', is_private: false });
    } catch (error) {
      console.error('Failed to create forum:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForumClick = (forumId: string) => {
    router.push(`/portal/forums/${forumId}`);
  };

  const filteredForums = forums.filter(forum =>
    forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
            <p className="text-gray-600 mt-1">Connect and collaborate with your community</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Forum
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Forum</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Forum Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter forum name..."
                    className="mt-1 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this forum is about..."
                    className="mt-1 bg-white"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={formData.is_private}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_private: checked }))}
                  />
                  <Label htmlFor="private" className="text-sm font-medium">
                    Private Forum
                  </Label>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateForum}
                    className="bg-[#fe7105] hover:bg-[#e55a04] text-white"
                    disabled={isSubmitting || !formData.name.trim()}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Forum'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search forums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Forums Grid */}
        {filteredForums.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No forums found' : 'No forums yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Get started by creating your first discussion forum.'
              }
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Forum
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredForums.map((forum) => (
              <Card 
                key={forum.id} 
                className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleForumClick(forum.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 group">
                      {forum.is_private ? (
                        <Lock className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500 group-hover:text-blue-600 transition-colors" />
                      )}
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors">
                        {forum.name}
                      </CardTitle>
                    </div>
                    <Badge variant={forum.is_private ? "secondary" : "outline"}>
                      {forum.is_private ? 'Private' : 'Public'}
                    </Badge>
                  </div>

                  {forum.description && (
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {forum.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{forum.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{forum.messages?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-[#27aae1] text-white text-xs">
                          {getInitials(forum.created_by)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {forum.created_by?.username || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(forum.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumsPage;