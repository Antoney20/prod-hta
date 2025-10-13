import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, Star, ExternalLink, FileText, Video, Image as ImageIcon, Music, File } from 'lucide-react';
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
import type { MediaResource } from '@/types/dashboard/content';

interface MediaResourcesListProps {
  resources: MediaResource[];
  onView: (resource: MediaResource) => void;
  onEdit: (resource: MediaResource) => void;
  onDelete: (id: number) => void;
}

const MediaResourcesList: React.FC<MediaResourcesListProps> = ({
  resources,
  onView,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      education: 'bg-blue-100 text-blue-800',
      training: 'bg-purple-100 text-purple-800',
      research: 'bg-green-100 text-green-800',
      policy: 'bg-orange-100 text-orange-800',
      reports: 'bg-red-100 text-red-800',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!resources.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No media resources found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow 
              key={resource.id} 
              className={`hover:bg-gray-50 ${resource.featured ? 'bg-amber-50' : ''} ${resource.hide_resource ? 'opacity-60' : ''}`}
            >
              <TableCell>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {resource.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium line-clamp-1">{resource.title}</p>
                      {resource.featured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {resource.description}
                      </p>
                    )}
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Resource
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge className={getCategoryColor(resource.category)}>
                  {resource.category}
                </Badge>
              </TableCell>
              
              <TableCell>
                {resource.type ? (
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell className="text-sm text-gray-600">
                {resource.date || 'N/A'}
              </TableCell>
              
              <TableCell>
                <div className="flex gap-1">
                  {resource.hide_resource ? (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Visible
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(resource)}>
                      <Eye className="h-4 w-4 mr-2" />View
                    </DropdownMenuItem>
                    {resource.url && (
                      <DropdownMenuItem onClick={() => window.open(resource.url, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />Open Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(resource)}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.confirm('Delete this resource?') && onDelete(resource.id)}
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

export default MediaResourcesList;