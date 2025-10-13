// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Eye,
//   MessageSquare,
//   MoreHorizontal,
//   FileText,
//   MapPin,
//   User,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   AlertTriangle,
//   Star,
//   PlayCircle
// } from "lucide-react";
// import { format } from "date-fns";
// import type { ProposalTracker } from "@/types/dashboard/intervention";
// import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// interface MyInterventionsTableProps {
//   trackers: ProposalTracker[];
//   onRefresh: () => Promise<void>;
//   onReview: (tracker: ProposalTracker) => void;
//   getMyStatus: (tracker: ProposalTracker) => { label: string; color: string };
//   router: AppRouterInstance;
//   currentPage: number;
//   totalPages: number;
//   pageSize: number;
//   totalItems: number;
//   onPageChange: (page: number) => void;
//   onPageSizeChange: (size: number) => void;
// }

// export default function MyInterventionsTable({
//   trackers,
//   onRefresh,
//   onReview,
//   getMyStatus,
//   router,
//   currentPage,
//   totalPages,
//   pageSize,
//   totalItems,
//   onPageChange,
//   onPageSizeChange,
// }: MyInterventionsTableProps) {

//   const getReviewStageColor = (stage: string) => {
//     const colors = {
//       initial: "bg-gray-100 text-gray-700",
//       under_review: "bg-blue-100 text-blue-700",
//       needs_revision: "bg-yellow-100 text-yellow-700",
//       approved: "bg-green-100 text-green-700",
//       rejected: "bg-red-100 text-red-700",
//       withdrawn: "bg-gray-100 text-gray-700",
//     };
//     return colors[stage as keyof typeof colors] || colors.initial;
//   };

//   const getPriorityColor = (priority: string) => {
//     const colors = {
//       low: "bg-green-100 text-green-700",
//       medium: "bg-yellow-100 text-yellow-700",
//       high: "bg-orange-100 text-orange-700",
//       urgent: "bg-red-100 text-red-700",
//     };
//     return colors[priority as keyof typeof colors] || colors.medium;
//   };

//   const getPriorityIcon = (priority: string) => {
//     switch (priority) {
//       case 'urgent': return <AlertTriangle className="h-3 w-3" />;
//       case 'high': return <Star className="h-3 w-3" />;
//       default: return null;
//     }
//   };

//   if (trackers.length === 0) {
//     return (
//       <Card>
//         <CardContent className="p-12 text-center">
//           <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             No interventions assigned
//           </h3>
//           <p className="text-gray-600 mb-4">
//             You don't have any interventions assigned for review yet.
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardContent className="p-0">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="min-w-[300px]">Intervention</TableHead>
//                 <TableHead className="min-w-[120px]">Priority</TableHead>
//                 <TableHead className="min-w-[160px]">Thematic Area</TableHead>
//                 <TableHead className="min-w-[140px]">Review Stage</TableHead>
//                 <TableHead className="min-w-[120px]">My Status</TableHead>
//                 <TableHead className="min-w-[120px]">Due Date</TableHead>
//                 <TableHead className="min-w-[100px]">Comments</TableHead>
//                 <TableHead className="w-[120px]">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {trackers.map((tracker) => {
//                 const myStatus = getMyStatus(tracker);
//                 const isOverdue = tracker.completion_date && new Date(tracker.completion_date) < new Date();
//                 const hasComments = tracker.comments && tracker.comments.length > 0;
                
//                 return (
//                   <TableRow key={tracker.id} className="hover:bg-gray-50">
//                     <TableCell>
//                       <div className="space-y-1">
//                         <p className="font-medium text-gray-900 line-clamp-1">
//                           {tracker.proposal.intervention_name || `Intervention #${tracker.proposal.id}`}
//                         </p>
//                         <p className="text-sm text-gray-600 line-clamp-2">
//                           {tracker.proposal.justification}
//                         </p>
//                         <div className="flex items-center text-xs text-gray-500 space-x-4">
//                           <span className="flex items-center">
//                             <User className="h-3 w-3 mr-1" />
//                             {tracker.proposal.name}
//                           </span>
//                           <span className="flex items-center">
//                             <MapPin className="h-3 w-3 mr-1" />
//                             {tracker.proposal.county}
//                           </span>
//                         </div>
//                       </div>
//                     </TableCell>
                    
//                     <TableCell>
//                       {tracker.priority_level ? (
//                         <div className="flex items-center gap-1">
//                           {getPriorityIcon(tracker.priority_level)}
//                           <Badge 
//                             variant="outline" 
//                             className={`${getPriorityColor(tracker.priority_level)} font-medium capitalize`}
//                           >
//                             {tracker.priority_level}
//                           </Badge>
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-sm">Not set</span>
//                       )}
//                     </TableCell>
                    
//                     <TableCell>
//                       {tracker.thematic_area ? (
//                         <Badge 
//                           variant="outline"
//                           className="max-w-[140px] truncate"
//                           style={{ 
//                             borderColor: tracker.thematic_area.color_code,
//                             color: tracker.thematic_area.color_code 
//                           }}
//                         >
//                           {tracker.thematic_area.name}
//                         </Badge>
//                       ) : (
//                         <span className="text-gray-400 text-sm">Not assigned</span>
//                       )}
//                     </TableCell>
                    
//                     <TableCell>
//                       <Badge 
//                         variant="outline" 
//                         className={`${getReviewStageColor(tracker.review_stage)} font-medium capitalize`}
//                       >
//                         {tracker.review_stage.replace('_', ' ')}
//                       </Badge>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Badge 
//                         variant="outline" 
//                         className={`${myStatus.color} font-medium`}
//                       >
//                         {myStatus.label}
//                       </Badge>
//                     </TableCell>
                    
//                     <TableCell>
//                       {tracker.completion_date ? (
//                         <div className={`flex items-center text-sm ${
//                           isOverdue ? 'text-red-600' : 'text-gray-700'
//                         }`}>
//                           <Calendar className="h-3 w-3 mr-1" />
//                           <span className="truncate">
//                             {format(new Date(tracker.completion_date), 'MMM dd')}
//                           </span>
//                           {isOverdue && (
//                             <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-sm">No due date</span>
//                       )}
//                     </TableCell>
                    
//                     <TableCell>
//                       <div className="flex items-center gap-1">
//                         <MessageSquare className="h-4 w-4 text-gray-400" />
//                         <span className="text-sm text-gray-600">
//                           {tracker.comments?.length || 0}
//                         </span>
//                       </div>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Button
//                         size="sm"
//                         onClick={() => onReview(tracker)}
//                         variant={hasComments ? "outline" : "default"}
//                         className="w-full justify-center"
//                       >
//                         <PlayCircle className="h-4 w-4 mr-1" />
//                         {hasComments ? 'View Review' : 'Add Review'}
//                       </Button>
//                     </TableCell>

//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
//           <div className="text-sm text-gray-700">
//             Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
//           </div>
          
//           <div className="flex flex-col sm:flex-row items-center gap-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
//               <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
//                 <SelectTrigger className="w-20">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="30">30</SelectItem>
//                   <SelectItem value="40">40</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                   <SelectItem value="100">100</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="flex items-center gap-1">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => onPageChange(currentPage - 1)}
//                 disabled={currentPage <= 1}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 Previous
//               </Button>
              
//               <span className="text-sm text-gray-700 px-2 whitespace-nowrap">
//                 Page {currentPage} of {totalPages}
//               </span>
              
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => onPageChange(currentPage + 1)}
//                 disabled={currentPage >= totalPages}
//               >
//                 Next
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }