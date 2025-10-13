import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
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
import type { FAQ } from '@/types/dashboard/content';

interface FAQsListProps {
  faqs: FAQ[];
  onView: (faq: FAQ) => void;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: number) => void;
}

const FAQsList: React.FC<FAQsListProps> = ({
  faqs,
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

  if (!faqs.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No FAQs found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead className="w-[400px]">Question</TableHead>
            <TableHead className="w-[300px]">Answer Preview</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faqs.map((faq) => (
            <TableRow key={faq.id} className="hover:bg-gray-50">
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {faq.order}
                </Badge>
              </TableCell>
              
              <TableCell>
                <p className="font-medium line-clamp-2">{faq.question}</p>
              </TableCell>
              
              <TableCell>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {faq.answer.substring(0, 100)}...
                </p>
              </TableCell>
              
              <TableCell>
                {faq.published ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </TableCell>
              
              <TableCell className="text-sm text-gray-600">
                {formatDate(faq.updated_at)}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(faq)}>
                      <Eye className="h-4 w-4 mr-2" />View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(faq)}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.confirm('Delete this FAQ?') && onDelete(faq.id)}
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

export default FAQsList;