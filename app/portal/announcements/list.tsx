import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Image,
  ExternalLink,
  MoreVertical,
  Pin,
  PinOff,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Announcement } from '@/types/dashboard/announcements';

interface AnnouncementsListProps {
  announcements: Announcement[];
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  isStaff?: boolean;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  announcements,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  isStaff = false
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string | null): string => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800', 
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderTags = (tags: string | null) => {
    if (!tags) return <span className="text-xs text-gray-400">No tags</span>;
    
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!tagList.length) return <span className="text-xs text-gray-400">No tags</span>;
    
    return (
      <div className="flex gap-1">
        {tagList.slice(0, 2).map((tag, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
        {tagList.length > 2 && (
          <Badge variant="outline" className="text-xs">+{tagList.length - 2}</Badge>
        )}
      </div>
    );
  };

  const renderAttachments = (announcement: Announcement) => (
    <div className="flex gap-1">
      {announcement.documents && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-blue-600"
          onClick={() => window.open(announcement.documents || '', '_blank')}
        >
          <FileText className="h-3 w-3" />
        </Button>
      )}
      {announcement.images && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-purple-600"
          onClick={() => window.open(announcement.images || '', '_blank')}
        >
          <Image className="h-3 w-3" />
        </Button>
      )}
      {announcement.link && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-green-600"
          onClick={() => window.open(announcement.link || '', '_blank')}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  if (!announcements.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No announcements found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Tags</TableHead>
            
            <TableHead>Attachments</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow 
              key={announcement.id} 
              className={`hover:bg-gray-50 ${announcement.is_pinned ? 'bg-blue-50' : ''}`}
            >
            <TableCell>
                <code className="text-xs text-gray-600">{announcement.reference_number}</code>
              </TableCell>
              
              <TableCell>
                <div className="flex items-start gap-2">
                 
                  <div>
                    <p className="font-medium truncate max-w-[250px]">{announcement.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[250px]">
                      {announcement.content.substring(0, 60)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                     
                      {announcement.is_expired && (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {announcement.type && (
                  <Badge variant="outline" className="text-xs">
                    {announcement.type}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                {announcement.priority && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {announcement.priority}
                  </span>
                )}
              </TableCell>
              
              <TableCell>{renderTags(announcement.tags)}</TableCell>
              
          
              <TableCell>{renderAttachments(announcement)}</TableCell>
              
              <TableCell className="text-sm text-gray-600">
                <div>{announcement.created_by_name}</div>
                <div className="text-xs text-gray-400">{formatDate(announcement.created_at)}</div>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(announcement)}>
                      <Eye className="h-4 w-4 mr-2" />View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(announcement)}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </DropdownMenuItem>
                    
                    {isStaff && onTogglePin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onTogglePin(announcement.id)}>
                          {announcement.is_pinned ? (
                            <><PinOff className="h-4 w-4 mr-2" />Unpin</>
                          ) : (
                            <><Pin className="h-4 w-4 mr-2" />Pin</>
                          )}
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.confirm('Delete this announcement?') && onDelete(announcement.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AnnouncementsList;