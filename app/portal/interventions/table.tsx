

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
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Eye,
//   Edit,
//   Users,
//   MessageSquare,
//   MoreHorizontal,
//   FileText,
//   MapPin,
//   User,
//   Building,
//   Mail,
//   Plus,
//   Target,
//   UserPlus,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   ArrowRight,
// } from "lucide-react";
// import { format } from "date-fns";
// import type { InterventionProposal, ProposalTracker } from "@/types/interventions";
// import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// interface InterventionWithTracker extends InterventionProposal {
//   tracker?: ProposalTracker;
// }

// type TabType = 'overview' | 'thematic' | 'assignment' | 'review';

// interface InterventionsTableProps {
//   interventions: InterventionWithTracker[];
//   onCreateTracker: (intervention: InterventionWithTracker) => void;
//   onRefresh: () => Promise<void>;
//   router: AppRouterInstance;
//   getWorkflowStage: (intervention: InterventionWithTracker) => string;
//   activeTab: TabType;
//   selectedInterventions: Set<number>;
//   onSelectionChange: (selected: Set<number>) => void;
// }

// export default function InterventionsTable({
//   interventions,
//   onCreateTracker,
//   onRefresh,
//   router,
//   getWorkflowStage,
//   activeTab,
//   selectedInterventions,
//   onSelectionChange,
// }: InterventionsTableProps) {
  
//   const showSelection = activeTab === 'thematic' || activeTab === 'assignment';
  
//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const allIds = new Set(interventions.map(i => i.id));
//       onSelectionChange(allIds);
//     } else {
//       onSelectionChange(new Set());
//     }
//   };

//   const handleSelectIntervention = (id: number, checked: boolean) => {
//     const newSelected = new Set(selectedInterventions);
//     if (checked) {
//       newSelected.add(id);
//     } else {
//       newSelected.delete(id);
//     }
//     onSelectionChange(newSelected);
//   };

//   const allSelected = interventions.length > 0 && interventions.every(i => selectedInterventions.has(i.id));
//   const someSelected = interventions.some(i => selectedInterventions.has(i.id)) && !allSelected;

//   const getWorkflowStageInfo = (stage: string) => {
//     const stages = {
//       unassigned: {
//         label: "Unassigned",
//         icon: <FileText className="h-4 w-4" />,
//         color: "bg-gray-100 text-gray-700 border-gray-300",
//       },
//       needs_categorization: {
//         label: "Needs Category",
//         icon: <Target className="h-4 w-4" />,
//         color: "bg-blue-100 text-blue-700 border-blue-300",
//       },
//       needs_assignment: {
//         label: "Needs Assignment", 
//         icon: <UserPlus className="h-4 w-4" />,
//         color: "bg-orange-100 text-orange-700 border-orange-300",
//       },
//       in_progress: {
//         label: "In Progress",
//         icon: <CheckCircle className="h-4 w-4" />,
//         color: "bg-green-100 text-green-700 border-green-300",
//       }
//     };
//     return stages[stage as keyof typeof stages] || stages.unassigned;
//   };

//   const getNextAction = (intervention: InterventionWithTracker) => {
//     const stage = getWorkflowStage(intervention);
    
//     switch (stage) {
//       case 'unassigned':
//         return {
//           label: "Create Tracker",
//           action: () => onCreateTracker(intervention),
//           icon: <Plus className="h-4 w-4" />,
//           variant: "default" as const
//         };
//       case 'needs_categorization':
//         return {
//           label: "Assign Category",
//           action: () => router.push(`/portal/interventions/tracker/${intervention.tracker?.id}`),
//           icon: <Target className="h-4 w-4" />,
//           variant: "default" as const
//         };
//       case 'needs_assignment':
//         return {
//           label: "Assign Reviewers",
//           action: () => router.push(`/portal/interventions/reviewers/${intervention.tracker?.id}`),
//           icon: <Users className="h-4 w-4" />,
//           variant: "default" as const
//         };
//       case 'in_progress':
//         return {
//           label: "View Progress",
//           action: () => router.push(`/portal/interventions/tracker/${intervention.tracker?.id}`),
//           icon: <ArrowRight className="h-4 w-4" />,
//           variant: "outline" as const
//         };
//       default:
//         return null;
//     }
//   };

//   if (interventions.length === 0) {
//     const emptyMessages = {
//       overview: "No interventions found",
//       thematic: "All interventions have been categorized",
//       assignment: "No interventions need reviewer assignment",
//       review: "No interventions are ready for review"
//     };

//     const emptyDescriptions = {
//       overview: "Try adjusting your filters to see more results.",
//       thematic: "Great! All interventions have thematic areas assigned.",
//       assignment: "All categorized interventions have reviewers assigned.",
//       review: "Complete the categorization and assignment steps first."
//     };

//     return (
//       <Card>
//         <CardContent className="p-12 text-center">
//           <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             {emptyMessages[activeTab]}
//           </h3>
//           <p className="text-gray-600 mb-4">
//             {emptyDescriptions[activeTab]}
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardContent className="p-2">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {showSelection && (
//                   <TableHead className="w-[50px]">
//                     <Checkbox
//                       checked={allSelected}
//                       // ref={(el) => {
//                       //   if (el) el.indeterminate = someSelected;
//                       // }}
//                       onCheckedChange={handleSelectAll}
//                       aria-label="Select all interventions"
//                     />
//                   </TableHead>
//                 )}
//                 <TableHead className="min-w-[300px]">Proposal Details</TableHead>
//                 <TableHead className="min-w-[250px]">Submitter Info</TableHead>
//                 <TableHead className="min-w-[150px]">Beneficiary</TableHead>
//                 <TableHead className="min-w-[120px]">County</TableHead>
//                 {activeTab === 'overview' && (
//                   <TableHead className="min-w-[180px]">Workflow Stage</TableHead>
//                 )}
//                 <TableHead className="min-w-[160px]">Thematic Area</TableHead>
//                 {(activeTab === 'overview' || activeTab === 'review') && (
//                   <TableHead className="min-w-[140px]">Review Status</TableHead>
//                 )}
//                 {activeTab === 'review' && (
//                   <TableHead className="min-w-[100px]">Comments</TableHead>
//                 )}
//                 <TableHead className="min-w-[120px]">Submitted</TableHead>
//                 {activeTab === 'overview' && (
//                   <TableHead className="w-[150px]">Next Action</TableHead>
//                 )}
//                 <TableHead className="w-[50px]">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {interventions.map((intervention) => {
//                 const workflowStage = getWorkflowStage(intervention);
//                 const stageInfo = getWorkflowStageInfo(workflowStage);
//                 const nextAction = getNextAction(intervention);
//                 const isSelected = selectedInterventions.has(intervention.id);
                
//                 return (
//                   <TableRow key={intervention.id} className="hover:bg-gray-50">
//                     {showSelection && (
//                       <TableCell>
//                         <Checkbox
//                           checked={isSelected}
//                           onCheckedChange={(checked) => 
//                             handleSelectIntervention(intervention.id, checked as boolean)
//                           }
//                           aria-label={`Select intervention ${intervention.id}`}
//                         />
//                       </TableCell>
//                     )}
                    
//                     <TableCell>
//                       <div className="space-y-1">
//                         <p className="font-medium text-gray-900 line-clamp-1">
//                           {intervention.intervention_name || `Intervention #${intervention.id}`}
//                         </p>
//                         <p className="text-sm text-gray-600 line-clamp-2">
//                           {intervention.justification}
//                         </p>
//                         {intervention.documents.length > 0 && (
//                           <div className="flex items-center text-xs text-gray-500">
//                             <FileText className="h-3 w-3 mr-1" />
//                             {intervention.documents.length} document(s)
//                           </div>
//                         )}
//                       </div>
//                     </TableCell>
                    
//                     <TableCell>
//                       <div className="space-y-1">
//                         <div className="flex items-center text-sm">
//                           <User className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
//                           <span className="truncate">{intervention.name}</span>
//                         </div>
//                         <div className="flex items-center text-sm text-gray-600">
//                           <Building className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
//                           <span className="truncate">{intervention.organization}</span>
//                         </div>
//                         <div className="flex items-center text-xs text-gray-500">
//                           <Mail className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
//                           <span className="truncate">{intervention.email}</span>
//                         </div>
//                       </div>
//                     </TableCell>
                    
//                     <TableCell>
//                       <p className="text-sm font-medium truncate">{intervention.beneficiary}</p>
//                     </TableCell>
                    
//                     <TableCell>
//                       <div className="flex items-center text-sm">
//                         <MapPin className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
//                         <span className="truncate">{intervention.county}</span>
//                       </div>
//                     </TableCell>
                    
//                     {activeTab === 'overview' && (
//                       <TableCell>
//                         <Badge 
//                           variant="outline" 
//                           className={`${stageInfo.color} border font-medium`}
//                         >
//                           <div className="flex items-center gap-1">
//                             {stageInfo.icon}
//                             {stageInfo.label}
//                           </div>
//                         </Badge>
//                       </TableCell>
//                     )}
                    
//                     <TableCell>
//                       {intervention.tracker?.thematic_area ? (
//                         <Badge 
//                           variant="outline"
//                           className="max-w-full truncate"
//                           style={{ 
//                             borderColor: intervention.tracker.thematic_area.color_code,
//                             color: intervention.tracker.thematic_area.color_code 
//                           }}
//                         >
//                           {intervention.tracker.thematic_area.name}
//                         </Badge>
//                       ) : (
//                         <span className="text-gray-400 text-sm">Not assigned</span>
//                       )}
//                     </TableCell>
                    
//                     {(activeTab === 'overview' || activeTab === 'review') && (
//                       <TableCell>
//                         {intervention.tracker?.review_stage ? (
//                           <div className="flex items-center gap-2">
//                             {intervention.tracker.review_stage === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
//                             {intervention.tracker.review_stage === 'under_review' && <Clock className="h-4 w-4 text-blue-500" />}
//                             {intervention.tracker.review_stage === 'needs_revision' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
//                             <span className="text-sm capitalize">
//                               {intervention.tracker.review_stage.replace('_', ' ')}
//                             </span>
//                           </div>
//                         ) : (
//                           <span className="text-gray-400 text-sm">No status</span>
//                         )}
//                       </TableCell>
//                     )}
                    
//                     {activeTab === 'review' && (
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <MessageSquare className="h-4 w-4 text-gray-400" />
//                           <span className="text-sm text-gray-600">
//                             {intervention.tracker?.comments?.length || 0}
//                           </span>
//                         </div>
//                       </TableCell>
//                     )}
                    
//                     <TableCell>
//                       <div className="text-sm text-gray-600">
//                         {format(new Date(intervention.submitted_at), 'MMM dd, yyyy')}
//                       </div>
//                     </TableCell>
                    
//                     {activeTab === 'overview' && (
//                       <TableCell>
//                         {nextAction && (
//                           <Button
//                             size="sm"
//                             variant={nextAction.variant}
//                             onClick={nextAction.action}
//                             className="w-full justify-center"
//                           >
//                             {nextAction.icon}
//                             <span className="ml-1 text-xs">{nextAction.label}</span>
//                           </Button>
//                         )}
//                       </TableCell>
//                     )}
                    
//                     <TableCell>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" className="h-8 w-8 p-0">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="w-48">
//                           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                           <DropdownMenuItem
//                             onClick={() => router.push(`/portal/interventions/${intervention.id}`)}
//                           >
//                             <Eye className="h-4 w-4 mr-2" />
//                             View Details
//                           </DropdownMenuItem>
                          
//                           {intervention.tracker && (
//                             <>
//                               <DropdownMenuItem
//                                 onClick={() => router.push(`/portal/interventions/tracker/${intervention.tracker?.id}`)}
//                               >
//                                 <Edit className="h-4 w-4 mr-2" />
//                                 Edit Tracker
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => router.push(`/portal/interventions/comments/${intervention.tracker?.id}`)}
//                               >
//                                 <MessageSquare className="h-4 w-4 mr-2" />
//                                 View Comments ({intervention.tracker.comments?.length || 0})
//                               </DropdownMenuItem>
//                               {activeTab === 'assignment' && (
//                                 <DropdownMenuItem
//                                   onClick={() => router.push(`/portal/interventions/reviewers/${intervention.tracker?.id}`)}
//                                 >
//                                   <Users className="h-4 w-4 mr-2" />
//                                   Manage Reviewers
//                                 </DropdownMenuItem>
//                               )}
//                             </>
//                           )}
                          
//                           {!intervention.tracker && activeTab === 'thematic' && (
//                             <DropdownMenuItem
//                               onClick={() => onCreateTracker(intervention)}
//                             >
//                               <Plus className="h-4 w-4 mr-2" />
//                               Create Tracker
//                             </DropdownMenuItem>
//                           )}
                          
//                           <DropdownMenuSeparator />
//                           <DropdownMenuItem
//                             onClick={() => window.open(`mailto:${intervention.email}`, '_blank')}
//                           >
//                             <Mail className="h-4 w-4 mr-2" />
//                             Contact Submitter
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }