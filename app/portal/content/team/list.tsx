import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, XCircle, User, Users } from 'lucide-react';
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
import type { Governance } from '@/types/dashboard/content';

interface GovernanceListProps {
  members: Governance[];
  onView: (member: Governance) => void;
  onEdit: (member: Governance) => void;
  onDelete: (id: number) => void;
}

const GovernanceList: React.FC<GovernanceListProps> = ({
  members,
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

  if (!members.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No governance members found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow 
              key={member.id} 
              className={`hover:bg-gray-50 ${member.deactivate_user ? 'bg-red-50' : ''}`}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  {member.image ? (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {member.title && `${member.title} `}
                      {member.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {member.role ? (
                  <span className="text-sm font-medium">{member.role}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                {member.from_organization ? (
                  <span className="text-sm">{member.from_organization}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {member.is_secretariat && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      <Users className="h-3 w-3 mr-1" />
                      Secretariat
                    </Badge>
                  )}
                  {member.is_panel_member && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      Panel
                    </Badge>
                  )}
                  {!member.is_secretariat && !member.is_panel_member && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  {member.deactivate_user ? (
                    <Badge variant="destructive" className="w-fit">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  ) : member.hide_profile ? (
                    <Badge variant="secondary" className="w-fit">
                      Hidden
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-sm text-gray-600">
                {formatDate(member.updated_at)}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(member)}>
                      <Eye className="h-4 w-4 mr-2" />View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.confirm('Delete this member?') && onDelete(member.id)}
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

export default GovernanceList;