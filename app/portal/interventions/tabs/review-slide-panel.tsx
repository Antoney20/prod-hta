// "use client";

// import { useState, useEffect } from "react";

// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { 
//   Loader2, 
//   CheckCircle, 
//   XCircle, 
//   AlertTriangle,
//   User, 
//   Calendar, 
//   Target,
//   FileText,
//   ExternalLink,
//   MessageSquare,
//   Clock,
//   Star,
//   Users,
//   ClipboardCheck,
//   X
// } from "lucide-react";
// import { format, isAfter } from "date-fns";
// import type { ProposalTracker } from "@/types/dashboard/intervention";
// import { updateTrackerStage } from "@/app/api/dashboard/proposals";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// interface ReviewDecisionPanelProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   tracker: ProposalTracker | null;
//   onSuccess: () => Promise<void>;
// }

// export default function ReviewDecisionPanel({
//   open,
//   onOpenChange,
//   tracker,
//   onSuccess,
// }: ReviewDecisionPanelProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Decision form data
//   const [decision, setDecision] = useState<string>('');
//   const [rationale, setRationale] = useState('');

//   useEffect(() => {
//     if (!open || !tracker) {
//       setDecision('');
//       setRationale('');
//       setError(null);
//     } else {
//       // Set current stage as default
//       if (['approved', 'rejected', 'needs_revision'].includes(tracker.review_stage)) {
//         setDecision(tracker.review_stage);
//       }
//     }
//   }, [open, tracker]);

//   const handleSubmitDecision = async () => {
//     if (!tracker || !decision) return;
    
//     if (!rationale.trim()) {
//       setError('Decision rationale is required');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

    
//       await updateTrackerStage(tracker.id, decision);

//       await onSuccess();
      
//     } catch (error: any) {
//       setError(error.message || "Failed to record decision");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDecisionInfo = (decisionType: string) => {
//     const decisions = {
//       approved: {
//         label: 'Approve',
//         description: 'Grant approval and proceed with implementation',
//         icon: <CheckCircle className="h-5 w-5 text-green-600" />,
//         color: 'bg-green-50 border-green-200 text-green-900',
//         buttonColor: 'bg-green-600 hover:bg-green-700'
//       },
//       rejected: {
//         label: 'Reject',
//         description: 'Decline the intervention proposal',
//         icon: <XCircle className="h-5 w-5 text-red-600" />,
//         color: 'bg-red-50 border-red-200 text-red-900',
//         buttonColor: 'bg-red-600 hover:bg-red-700'
//       },
//       needs_revision: {
//         label: 'Needs Revision',
//         description: 'Require changes before final decision',
//         icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
//         color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
//         buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
//       }
//     };
//     return decisions[decisionType as keyof typeof decisions];
//   };

//   const isOverdue = (completionDate: string | null) => {
//     if (!completionDate) return false;
//     return isAfter(new Date(), new Date(completionDate));
//   };

//   if (!tracker) return null;

//   const decisionInfo = decision ? getDecisionInfo(decision) : null;
//   const hasExistingDecision = ['approved', 'rejected', 'needs_revision'].includes(tracker.review_stage);
//   const overdue = isOverdue(tracker.completion_date);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <DialogTitle className="flex items-center gap-2">
//                 <ClipboardCheck className="h-5 w-5 text-blue-600" />
//                 {hasExistingDecision ? 'Review Decision' : 'Make Decision'}
//               </DialogTitle>
//               <p className="text-sm text-gray-600 mt-1">
//                 {hasExistingDecision 
//                   ? 'View the decision made for this intervention'
//                   : 'Review the intervention details and make a final decision'
//                 }
//               </p>
//             </div>
//             <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className="space-y-6 py-6">
//           {error && (
//             <Card className="border-red-200 bg-red-50">
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5 text-red-600" />
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Intervention Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Intervention Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div className="text-center">
//                   <div className="flex items-center justify-center mb-1">
//                     <Progress value={tracker.progress} className="h-2 flex-1" />
//                     <span className="text-sm font-medium ml-2">{tracker.progress}%</span>
//                   </div>
//                   <p className="text-xs text-gray-600">Review Progress</p>
//                 </div>
                
//                 <div className="text-center">
//                   <p className="text-lg font-medium text-gray-900">
//                     {tracker.assigned_reviewers?.length || 0}
//                   </p>
//                   <p className="text-xs text-gray-600">Assigned Reviewers</p>
//                 </div>
                
//                 <div className="text-center">
//                   <p className="text-lg font-medium text-gray-900">
//                     {tracker.comments?.length || 0}
//                   </p>
//                   <p className="text-xs text-gray-600">Comments</p>
//                 </div>
//               </div>

//               {/* Timeline Info */}
//               <div className="grid grid-cols-2 gap-4 pt-4 border-t">
//                 <div>
//                   <div className="flex items-center text-sm text-gray-600 mb-1">
//                     <Calendar className="h-4 w-4 mr-1" />
//                     Start Date
//                   </div>
//                   <p className="font-medium">
//                     {tracker.start_date ? format(new Date(tracker.start_date), 'MMM dd, yyyy') : 'Not set'}
//                   </p>
//                 </div>
//                 <div>
//                   <div className="flex items-center text-sm text-gray-600 mb-1">
//                     <Calendar className="h-4 w-4 mr-1" />
//                     Due Date {overdue && <AlertTriangle className="h-4 w-4 ml-1 text-red-500" />}
//                   </div>
//                   <p className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
//                     {tracker.completion_date ? format(new Date(tracker.completion_date), 'MMM dd, yyyy') : 'Not set'}
//                     {overdue && <span className="text-xs ml-1">(Overdue)</span>}
//                   </p>
//                 </div>
//               </div>

//               {/* Reviewers */}
//               {tracker.assigned_reviewers && tracker.assigned_reviewers.length > 0 && (
//                 <div>
//                   <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
//                     <Users className="h-4 w-4 mr-1" />
//                     Assigned Reviewers
//                   </h5>
//                   <div className="space-y-2">
//                     {tracker.assigned_reviewers.map((reviewer) => (
//                       <div key={reviewer.id} className="flex items-center space-x-2">
//                         <Avatar className="h-6 w-6">
//                           <AvatarFallback className="text-xs">
//                             {(reviewer.first_name?.[0] || reviewer.username[0] || 'U').toUpperCase()}
//                             {(reviewer.last_name?.[0] || reviewer.username[1] || '').toUpperCase()}
//                           </AvatarFallback>
//                         </Avatar>
//                         <span className="text-sm">
//                           {reviewer.first_name && reviewer.last_name 
//                             ? `${reviewer.first_name} ${reviewer.last_name}`
//                             : reviewer.username
//                           }
//                         </span>
//                         <span className="text-xs text-gray-500">({reviewer.email})</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Recent Comments */}
//           {tracker.comments && tracker.comments.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center">
//                   <MessageSquare className="h-4 w-4 mr-2" />
//                   Recent Comments ({tracker.comments.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3 max-h-48 overflow-y-auto">
//                 {tracker.comments.slice(-3).map((comment, index) => (
//                   <div key={index} className="border-l-2 border-gray-200 pl-3 text-sm">
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="font-medium text-gray-900">
//                         {comment.reviewer?.first_name && comment.reviewer?.last_name
//                           ? `${comment.reviewer.first_name} ${comment.reviewer.last_name}`
//                           : comment.reviewer?.username || 'Unknown Reviewer'
//                         }
//                       </span>
//                       <span className="text-gray-500 text-xs">
//                         {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
//                       </span>
//                     </div>
//                     <p className="text-gray-700">{comment.content}</p>
//                     {comment.comment_type !== 'general' && (
//                       <Badge variant="outline" className="mt-1 text-xs">
//                         {comment.comment_type}
//                       </Badge>
//                     )}
//                   </div>
//                 ))}
//                 {tracker.comments.length > 3 && (
//                   <Button variant="link" size="sm" className="p-0 h-auto text-xs">
//                     View all {tracker.comments.length} comments
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {/* Decision Section */}
//           {!hasExistingDecision && tracker.progress >= 75 && (
//             <Card className="border-orange-200 bg-orange-50">
//               <CardHeader>
//                 <CardTitle className="text-lg text-orange-900">Make Decision</CardTitle>
//                 <p className="text-sm text-orange-700">
//                   This intervention has sufficient review progress ({tracker.progress}%) to make a final decision.
//                 </p>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-3">
//                   <Label htmlFor="decision-select">Decision *</Label>
//                   <Select value={decision} onValueChange={setDecision}>
//                     <SelectTrigger id="decision-select">
//                       <SelectValue placeholder="Select your decision" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="approved">
//                         <div className="flex items-center gap-2">
//                           <CheckCircle className="h-4 w-4 text-green-600" />
//                           <div>
//                             <p className="font-medium text-green-900">Approve</p>
//                             <p className="text-xs text-green-700">Grant approval for implementation</p>
//                           </div>
//                         </div>
//                       </SelectItem>
//                       <SelectItem value="rejected">
//                         <div className="flex items-center gap-2">
//                           <XCircle className="h-4 w-4 text-red-600" />
//                           <div>
//                             <p className="font-medium text-red-900">Reject</p>
//                             <p className="text-xs text-red-700">Decline the intervention proposal</p>
//                           </div>
//                         </div>
//                       </SelectItem>
//                       <SelectItem value="needs_revision">
//                         <div className="flex items-center gap-2">
//                           <AlertTriangle className="h-4 w-4 text-yellow-600" />
//                           <div>
//                             <p className="font-medium text-yellow-900">Needs Revision</p>
//                             <p className="text-xs text-yellow-700">Require changes before final decision</p>
//                           </div>
//                         </div>
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {decision && decisionInfo && (
//                   <Card className={`${decisionInfo.color} border`}>
//                     <CardContent className="p-3">
//                       <div className="flex items-center gap-2 mb-2">
//                         {decisionInfo.icon}
//                         <span className="font-medium">{decisionInfo.label}</span>
//                       </div>
//                       <p className="text-sm">{decisionInfo.description}</p>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <div className="space-y-2">
//                   <Label htmlFor="rationale">Decision Rationale *</Label>
//                   <Textarea
//                     id="rationale"
//                     placeholder="Provide detailed reasoning for your decision. Include key factors that influenced your choice, any concerns, recommendations for next steps, etc."
//                     value={rationale}
//                     onChange={(e) => setRationale(e.target.value)}
//                     rows={4}
//                     className="w-full"
//                   />
//                   <p className="text-xs text-gray-500">
//                     {rationale.length}/2000 characters
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Existing Decision Display */}
//           {hasExistingDecision && (
//             <Card className={`${getDecisionInfo(tracker.review_stage)?.color} border`}>
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   {getDecisionInfo(tracker.review_stage)?.icon}
//                   Decision: {getDecisionInfo(tracker.review_stage)?.label}
//                 </CardTitle>
//                 <p className="text-sm opacity-75">
//                   {getDecisionInfo(tracker.review_stage)?.description}
//                 </p>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-sm">
//                   <p><strong>Decision Made:</strong> {format(new Date(tracker.updated_at), 'PPpp')}</p>
//                   <p className="mt-2"><strong>Current Stage:</strong> {tracker.review_stage.replace('_', ' ').charAt(0).toUpperCase() + tracker.review_stage.replace('_', ' ').slice(1)}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Progress Alert */}
//           {!hasExistingDecision && tracker.progress < 75 && (
//             <Card className="border-yellow-200 bg-yellow-50">
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-yellow-600" />
//                   <div>
//                     <p className="text-sm font-medium text-yellow-900">Review In Progress</p>
//                     <p className="text-xs text-yellow-700">
//                       Current progress is {tracker.progress}%. Consider waiting until reviews reach at least 75% completion before making a final decision.
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Footer Actions */}
//         <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//             disabled={loading}
//             className="w-full sm:w-auto"
//           >
//             Close
//           </Button>
          
//           {!hasExistingDecision && tracker.progress >= 75 && (
//             <Button
//               onClick={handleSubmitDecision}
//               disabled={!decision || !rationale.trim() || loading}
//               className={`w-full sm:w-auto ${decisionInfo?.buttonColor || 'bg-blue-600 hover:bg-blue-700'}`}
//             >
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               {decisionInfo ? `${decisionInfo.label} Intervention` : 'Record Decision'}
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }