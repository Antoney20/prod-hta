import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Image,
  ExternalLink,
  MoreVertical
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
import type { Record } from '@/types/dashboard/records';

interface RecordsListProps {
  records: Record[];
  onView: (record: Record) => void;
  onEdit: (record: Record) => void;
  onDelete: (recordId: string) => void;
  loading?: boolean;
}

const recordTypeLabels: { [key: string]: string } = {
  'minutes': 'Minutes',
  'official_communications': 'Official Communications',
  'resolutions_decisions': 'Resolutions and Decisions',
  'attendance_registers': 'Attendance Registers'
};

const RecordsList: React.FC<RecordsListProps> = ({
  records,
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

  const handleDelete = (recordId: string): void => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      onDelete(recordId);
    }
  };

  const renderAttachments = (record: Record) => {
    return (
      <div className="flex gap-1">
        {record.documents && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-blue-600 hover:text-blue-800"
            onClick={() => window.open(record.documents || '', '_blank')}
            title="Open document"
          >
            <FileText className="h-3 w-3" />
          </Button>
        )}
        {record.images && (
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-purple-600 hover:text-purple-800"
              onClick={() => window.open(record.images || '', '_blank')}
              title="View image"
            >
              <Image className="h-3 w-3" />
            </Button>
          </div>
        )}
        {record.link && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-green-600 hover:text-green-800"
            onClick={() => window.open(record.link || '', '_blank')}
            title="Open external link"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
        {!record.documents && !record.images && !record.link && (
          <span className="text-xs text-gray-400">No attachments</span>
        )}
      </div>
    );
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No records found</p>
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
           
            <TableHead>Attachments</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record: Record) => (
            <TableRow key={record.id} className="hover:bg-gray-50">
              <TableCell>
                <span className="font-mono text-xs text-gray-600">
                  {record.reference_number}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold text-gray-900 truncate max-w-[250px]">
                    {record.title}
                  </p>
                  {record.description && (
                    <p className="text-sm text-gray-500 truncate max-w-[250px] mt-1">
                      {record.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {record.type && (
                  <Badge variant="outline" className="text-xs">
                    {recordTypeLabels[record.type] || record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                {renderAttachments(record)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {record.created_by_name || record.created_by}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(record.created_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(record)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(record)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(record.id)}
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

export default RecordsList;