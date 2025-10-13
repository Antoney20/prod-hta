import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  FileText,
  ExternalLink,
  MoreVertical,
  Tag
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Resource } from '@/types/dashboard/resources';

interface ResourcesListProps {
  resources: Resource[];
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
  loading?: boolean;
}

const ResourcesList: React.FC<ResourcesListProps> = ({
  resources,
  onView,
  onEdit,
  onDelete,
  loading = false
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (resourceId: string): void => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      onDelete(resourceId);
    }
  };

  const renderTags = (tags: string | null | undefined) => {
    if (!tags || tags.trim() === '') {
      return <span className="text-xs text-gray-400">No tags</span>;
    }
    
    const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    if (tagList.length === 0) {
      return <span className="text-xs text-gray-400">No tags</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {tagList.slice(0, 2).map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
        {tagList.length > 2 && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            +{tagList.length - 2} more
          </Badge>
        )}
      </div>
    );
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No resources found</p>
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
            <TableHead>Tags</TableHead>
            
            <TableHead>Visibility</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource: Resource) => (
            <TableRow key={resource.id} className="hover:bg-gray-50">

              <TableCell>
                <span className="font-mono text-xs text-gray-600">
                  {resource.reference_number}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold text-gray-900 truncate max-w-[250px]">
                    {resource.title}
                  </p>
                  {resource.description && (
                    <p className="text-sm text-gray-500 truncate max-w-[250px] mt-1">
                      {resource.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {resource.type && (
                  <Badge variant="outline" className="text-xs">
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {renderTags(resource.tags)}
              </TableCell>

              <TableCell>
                <Badge variant={resource.is_public ? "outline" : "secondary"} className="text-xs">
                  {resource.is_public ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {resource.documents && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-blue-600 hover:text-blue-800"
                      onClick={() => window.open(resource.documents || '', '_blank')}
                      title="Open document"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  )}
                  {resource.link && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-green-600 hover:text-green-800"
                      onClick={() => window.open(resource.link || '', '_blank')}
                      title="Open external link"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  {!resource.documents && !resource.link && (
                    <span className="text-xs text-gray-400">No documents</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {resource.created_by_name}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(resource.created_at)}
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
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(resource)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(resource.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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

export default ResourcesList;