// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Loader2 } from "lucide-react";
// import type { InterventionProposal, ProposalTracker, ThematicArea, CustomUser } from "@/types/interventions";
// import { createProposalTracker, createReviewerAssignment } from "@/app/api/dashboard";

// interface InterventionWithTracker extends InterventionProposal {
//   tracker?: ProposalTracker;
// }

// interface CreateTrackerDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   selectedIntervention: InterventionWithTracker | null;
//   thematicAreas: ThematicArea[];
//   users: CustomUser[];
//   onCreateTracker: (formData: any) => Promise<void>;
// }

// interface FormData {
//   thematic_area_id: string;
//   priority_level: string;
//   reviewer_ids: number[];
//   notes: string;
// }

// export default function CreateTrackerDialog({
//   open,
//   onOpenChange,
//   selectedIntervention,
//   thematicAreas,
//   users,
//   onCreateTracker,
// }: CreateTrackerDialogProps) {
//   const [formData, setFormData] = useState<FormData>({
//     thematic_area_id: "",
//     priority_level: "",
//     reviewer_ids: [],
//     notes: "",
//   });
//   const [loading, setLoading] = useState(false);

//   // Reset form when dialog opens/closes
//   useEffect(() => {
//     if (!open) {
//       setFormData({
//         thematic_area_id: "",
//         priority_level: "",
//         reviewer_ids: [],
//         notes: "",
//       });
//     }
//   }, [open]);

//   const handleCreateTracker = async () => {
//     if (!selectedIntervention) return;

//     try {
//       setLoading(true);

//       // Create the tracker first
//       const trackerData = {
//         proposal: selectedIntervention.id,
//         thematic_area: formData.thematic_area_id ? parseInt(formData.thematic_area_id) : null,
//         priority_level: formData.priority_level || null,
//         review_stage: 'initial' as const,
//         notes: formData.notes,
//       };

//       const newTracker = await createProposalTracker(trackerData);

//       // Assign reviewers if selected
//       if (formData.reviewer_ids.length > 0) {
//         await Promise.all(
//           formData.reviewer_ids.map(reviewerId =>
//             createReviewerAssignment({
//               tracker_id: newTracker.id,
//               reviewer_id: reviewerId,
//               notes: `Assigned during tracker creation`,
//             })
//           )
//         );
//       }

//       await onCreateTracker(formData);
//     } catch (error) {
//       console.error("Error creating tracker:", error);
//       // You might want to show a toast notification here
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReviewerToggle = (userId: number) => {
//     setFormData(prev => ({
//       ...prev,
//       reviewer_ids: prev.reviewer_ids.includes(userId)
//         ? prev.reviewer_ids.filter(id => id !== userId)
//         : [...prev.reviewer_ids, userId]
//     }));
//   };

//   const activeThematicAreas = thematicAreas.filter(area => area.is_active);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create Proposal Tracker</DialogTitle>
//           <DialogDescription>
//             Set up tracking for "{selectedIntervention?.intervention_name || `Intervention #${selectedIntervention?.id}`}"
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-6">
//           {/* Proposal Summary */}
//           <div className="bg-gray-50 rounded-lg p-4">
//             <h4 className="font-medium text-gray-900 mb-3">Proposal Summary</h4>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-600">Submitter:</span>
//                 <p className="font-medium">{selectedIntervention?.name}</p>
//               </div>
//               <div>
//                 <span className="text-gray-600">Organization:</span>
//                 <p className="font-medium">{selectedIntervention?.organization}</p>
//               </div>
//               <div>
//                 <span className="text-gray-600">County:</span>
//                 <p className="font-medium">{selectedIntervention?.county}</p>
//               </div>
//               <div>
//                 <span className="text-gray-600">Beneficiary:</span>
//                 <p className="font-medium">{selectedIntervention?.beneficiary}</p>
//               </div>
//             </div>
//           </div>

//           {/* Tracker Configuration */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="thematic_area">Thematic Area</Label>
//               <Select
//                 value={formData.thematic_area_id}
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, thematic_area_id: value }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select thematic area" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {activeThematicAreas.map((area) => (
//                     <SelectItem key={area.id} value={area.id.toString()}>
//                       <div className="flex items-center">
//                         <div
//                           className="w-3 h-3 rounded-full mr-2"
//                           style={{ backgroundColor: area.color_code }}
//                         />
//                         {area.name}
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="priority_level">Priority Level</Label>
//               <Select
//                 value={formData.priority_level}
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: value }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select priority" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="low">Low</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                   <SelectItem value="urgent">Urgent</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Reviewer Assignment */}
//           <div className="space-y-3">
//             <Label>Assign Reviewers (Optional)</Label>
//             <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
//               {users.length === 0 ? (
//                 <p className="text-sm text-gray-500 text-center py-4">No users available for assignment</p>
//               ) : (
//                 <div className="space-y-1">
//                   {users.map((user) => (
//                     <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
//                       <input
//                         type="checkbox"
//                         id={`user-${user.id}`}
//                         checked={formData.reviewer_ids.includes(user.id)}
//                         onChange={() => handleReviewerToggle(user.id)}
//                         className="rounded border-gray-300"
//                       />
//                       <label htmlFor={`user-${user.id}`} className="flex-1 text-sm cursor-pointer">
//                         <div className="font-medium">
//                           {user.first_name && user.last_name 
//                             ? `${user.first_name} ${user.last_name}` 
//                             : user.username}
//                         </div>
//                         <div className="text-gray-600">{user.email}</div>
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {formData.reviewer_ids.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 <span className="text-sm text-gray-600">Selected reviewers:</span>
//                 {formData.reviewer_ids.map(id => {
//                   const user = users.find(u => u.id === id);
//                   return user ? (
//                     <Badge key={id} variant="secondary" className="text-xs">
//                       {user.first_name && user.last_name 
//                         ? `${user.first_name} ${user.last_name}` 
//                         : user.username}
//                     </Badge>
//                   ) : null;
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Initial Notes</Label>
//             <Textarea
//               id="notes"
//               placeholder="Add any initial notes about this proposal..."
//               value={formData.notes}
//               onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//               rows={3}
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleCreateTracker}
//             className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//             disabled={loading}
//           >
//             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Create Tracker
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }