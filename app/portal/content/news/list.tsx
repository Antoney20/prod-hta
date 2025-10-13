import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, XCircle, Star, Image as ImageIcon, Tag } from 'lucide-react';
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
import type { News } from '@/types/dashboard/content';

interface NewsListProps {
  news: News[];
  onView: (news: News) => void;
  onEdit: (news: News) => void;
  onDelete: (id: number) => void;
}

const NewsList: React.FC<NewsListProps> = ({
  news,
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

  if (!news.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No news articles found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Title</TableHead>
            <TableHead className="w-[200px]">Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news.map((article) => (
            <TableRow 
              key={article.id} 
              className={`hover:bg-gray-50 ${article.featured ? 'bg-amber-50' : ''}`}
            >
              <TableCell>
                <div className="flex items-start gap-3">
                  {article.image && (
                    <div className="flex-shrink-0">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      {article.featured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    {article.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{article.author || 'N/A'}</p>
                  {article.author_role && (
                    <p className="text-gray-500 text-xs">{article.author_role}</p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {article.category ? (
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell>{renderTags(article.tags)}</TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  {article.published ? (
                    <Badge className="bg-green-100 text-green-800 w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-fit">
                      <XCircle className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-sm text-gray-600">
                {article.date ? formatDate(article.date) : 'No date'}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(article)}>
                      <Eye className="h-4 w-4 mr-2" />View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(article)}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.confirm('Delete this article?') && onDelete(article.id)}
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

export default NewsList;