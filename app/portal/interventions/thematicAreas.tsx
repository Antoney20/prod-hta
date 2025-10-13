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
// import { Input } from "@/components/ui/input";
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
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2, Plus, Palette, Target, ArrowLeft, AlertTriangle } from "lucide-react";
// import type { InterventionProposal, ProposalTracker, ThematicArea } from "@/types/interventions";
// import { createProposalTracker, updateProposalTrackers, createThematicArea } from "@/app/api/dashboard";

// interface InterventionWithTracker extends InterventionProposal {
//   tracker?: ProposalTracker;
// }

// interface CombinedThematicAreasDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   mode: 'assign' | 'manage';
//   selectedInterventions?: InterventionWithTracker[];
//   thematicAreas: ThematicArea[];
//   onSuccess: () => Promise<void>;
//   onRefresh: () => Promise<void>;
// }

// interface FormData {
//   name: string;
//   description: string;
//   color_code: string;
// }

// const defaultColors = [
//   "#27aae1", "#fe7105", "#6366f1", "#10b981", "#f59e0b", 
//   "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316",
//   "#3b82f6", "#22c55e", "#eab308", "#e11d48", "#a855f7"
// ];

// export default function CombinedThematicAreasDialog({
//   open,
//   onOpenChange,
//   mode,
//   selectedInterventions = [],
//   thematicAreas,
//   onSuccess,
//   onRefresh,
// }: CombinedThematicAreasDialogProps) {
//   const [selectedThematicAreaId, setSelectedThematicAreaId] = useState("");
//   const [assignLoading, setAssignLoading] = useState(false);
//   const [createLoading, setCreateLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     description: "",
//     color_code: defaultColors[0],
//   });
//   const [nameError, setNameError] = useState<string | null>(null);

//   // Reset state when dialog opens/closes or mode changes
//   useEffect(() => {
//     if (!open) {
//       setSelectedThematicAreaId("");
//       setShowCreateForm(false);
//       setFormData({ name: "", description: "", color_code: defaultColors[0] });
//       setError(null);
//       setNameError(null);
//     }
//   }, [open, mode]);

//   // Validate name field
//   const validateName = (name: string) => {
//     if (!name.trim()) return "Name is required";
//     if (name.length < 3) return "Name must be at least 3 characters";
//     if (thematicAreas.some(area => area.name.toLowerCase() === name.trim().toLowerCase())) {
//       return "Name already exists";
//     }
//     return null;
//   };

//   // Update form data and validate name
//   const handleNameChange = (value: string) => {
//     setFormData(prev => ({ ...prev, name: value }));
//     setNameError(validateName(value));
//   };

//   // Assignment logic
//   const handleAssign = async () => {
//     if (!selectedThematicAreaId || mode !== 'assign') return;

//     try {
//       setAssignLoading(true);
//       setError(null);

//       // Separate interventions with and without trackers
//       const interventionsWithoutTrackers = selectedInterventions.filter(i => !i.tracker);
//       const interventionsWithTrackers = selectedInterventions.filter(i => i.tracker);

//       // Create trackers for interventions without them
//       if (interventionsWithoutTrackers.length > 0) {
//         const proposalIds = interventionsWithoutTrackers.map(i => i.id);
        
//       }

//       // Update trackers for interventions with existing trackers
//       if (interventionsWithTrackers.length > 0) {
//         const trackerIds = interventionsWithTrackers.map(i => i.tracker!.id);
//         await updateProposalTrackers({
//           ids: trackerIds,
//           thematic_area_id: parseInt(selectedThematicAreaId),
//         });
//       }

//       await onSuccess();
//       onOpenChange(false);
      
//     } catch (error: any) {
//       setError(error.message || "Failed to assign thematic areas. Please try again.");
//       console.error("Error assigning thematic areas:", error);
//     } finally {
//       setAssignLoading(false);
//     }
//   };

//   // Create new thematic area logic
//   const handleCreateArea = async () => {
//     if (!formData.name.trim()) return;
//     const nameValidation = validateName(formData.name);
//     if (nameValidation) {
//       setNameError(nameValidation);
//       return;
//     }

//     try {
//       setCreateLoading(true);
//       setError(null);

//       await createThematicArea({
//         name: formData.name.trim(),
//         description: formData.description.trim() || null,
//         color_code: formData.color_code,
//         is_active: true,
//       });

//       await onRefresh();
//       setFormData({ name: "", description: "", color_code: defaultColors[0] });
//       setShowCreateForm(false);
//     } catch (error: any) {
//       setError("Failed to create thematic area. Please try again.");
//       console.error("Error creating thematic area:", error);
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   const selectedThematicArea = thematicAreas.find(
//     area => area.id.toString() === selectedThematicAreaId
//   );

//   const activeAreas = thematicAreas.filter(area => area.is_active);
//   const inactiveAreas = thematicAreas.filter(area => !area.is_active);

//   // Render assignment content
//   const renderAssignmentContent = () => {
//     if (selectedInterventions.length === 0) {
//       return (
//         <Card>
//           <CardContent className="p-8 text-center">
//             <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No Interventions Selected</h3>
//             <p className="text-gray-600 mb-4">
//               Please select one or more interventions from the dashboard to assign a thematic area.
//             </p>
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               className="bg-[#27aae1] hover:bg-[#27aae1]/90 text-white"
//             >
//               Go Back
//             </Button>
//           </CardContent>
//         </Card>
//       );
//     }

//     return (
//       <div className="space-y-6">
//         {/* Error Alert */}
//         {error && (
//           <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
//             <AlertTriangle className="h-5 w-5 text-red-600" />
//             <p className="text-sm text-red-600">{error}</p>
//             <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
//           </div>
//         )}

//         {/* Selected Interventions */}
//         <Card>
//           <CardContent className="p-4">
//             <h4 className="font-medium text-gray-900 mb-3">
//               Selected Interventions ({selectedInterventions.length})
//             </h4>
//             <div className="space-y-2 max-h-32 overflow-y-auto">
//               {selectedInterventions.map((intervention) => (
//                 <div key={intervention.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
//                   <div className="font-medium">
//                     {intervention.intervention_name || `Intervention #${intervention.id}`}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {intervention.name} - {intervention.organization}
//                   </div>
//                   {intervention.tracker?.thematic_area && (
//                     <Badge 
//                       variant="outline" 
//                       className="mt-1"
//                       style={{ 
//                         borderColor: intervention.tracker.thematic_area.color_code,
//                         color: intervention.tracker.thematic_area.color_code 
//                       }}
//                     >
//                       Current: {intervention.tracker.thematic_area.name}
//                     </Badge>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Thematic Area Selection */}
//         <div className="space-y-3">
//           <Label htmlFor="thematic_area" className="text-sm font-medium">
//             Select Thematic Area *
//           </Label>
//           <Select
//             value={selectedThematicAreaId}
//             onValueChange={setSelectedThematicAreaId}
//           >
//             <SelectTrigger id="thematic_area" aria-label="Select a thematic area for assignment">
//               <SelectValue placeholder="Choose a thematic area" />
//             </SelectTrigger>
//             <SelectContent>
//               {activeAreas.map((area) => (
//                 <SelectItem key={area.id} value={area.id.toString()}>
//                   <div className="flex items-center">
//                     <div
//                       className="w-3 h-3 rounded-full mr-2"
//                       style={{ backgroundColor: area.color_code }}
//                     />
//                     {area.name}
//                   </div>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
          
//           {selectedThematicArea && (
//             <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
//               <Badge 
//                 variant="outline"
//                 style={{ 
//                   borderColor: selectedThematicArea.color_code,
//                   color: selectedThematicArea.color_code 
//                 }}
//               >
//                 {selectedThematicArea.name}
//               </Badge>
//               {selectedThematicArea.description && (
//                 <span className="text-sm text-gray-600">
//                   {selectedThematicArea.description}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Render management content
//   const renderManagementContent = () => (
//     <div className="space-y-6 max-h-[60vh] overflow-y-auto">
//       {/* Error Alert */}
//       {error && (
//         <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
//           <AlertTriangle className="h-5 w-5 text-red-600" />
//           <p className="text-sm text-red-600">{error}</p>
//           <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
//         </div>
//       )}

//       {/* Create New Area Form */}
//       {showCreateForm ? (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg flex items-center">
//               <ArrowLeft 
//                 className="h-4 w-4 mr-2 cursor-pointer" 
//                 onClick={() => setShowCreateForm(false)}
//                 aria-label="Back to thematic areas list"
//               />
//               Create New Thematic Area
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="area_name" className="text-sm font-medium">Name *</Label>
//                 <Input
//                   id="area_name"
//                   placeholder="e.g., Health & Nutrition"
//                   value={formData.name}
//                   onChange={(e) => handleNameChange(e.target.value)}
//                   aria-label="Thematic area name"
//                 />
//                 {nameError && (
//                   <p className="text-sm text-red-600">{nameError}</p>
//                 )}
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="area_color" className="text-sm font-medium">Color</Label>
//                 <div className="flex items-center space-x-2">
//                   <div
//                     className="w-8 h-8 rounded border-2 border-gray-300"
//                     style={{ backgroundColor: formData.color_code }}
//                   />
//                   <Input
//                     id="area_color"
//                     type="color"
//                     value={formData.color_code}
//                     onChange={(e) => setFormData(prev => ({ ...prev, color_code: e.target.value }))}
//                     className="w-16 h-8 p-1"
//                     aria-label="Select color for thematic area"
//                   />
//                   <Badge
//                     variant="outline"
//                     style={{ borderColor: formData.color_code, color: formData.color_code }}
//                   >
//                     {formData.name || "Preview"}
//                   </Badge>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label className="text-sm font-medium">Quick Colors</Label>
//               <div className="flex flex-wrap gap-2">
//                 {defaultColors.map((color) => (
//                   <button
//                     key={color}
//                     onClick={() => setFormData(prev => ({ ...prev, color_code: color }))}
//                     className={`w-6 h-6 rounded border-2 ${
//                       formData.color_code === color ? 'border-gray-800' : 'border-gray-300'
//                     }`}
//                     style={{ backgroundColor: color }}
//                     type="button"
//                     aria-label={`Select color ${color}`}
//                   />
//                 ))}
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="area_description" className="text-sm font-medium">Description</Label>
//               <Textarea
//                 id="area_description"
//                 placeholder="Brief description of this thematic area..."
//                 value={formData.description}
//                 onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                 rows={2}
//                 aria-label="Thematic area description"
//               />
//             </div>

//             <div className="flex space-x-2">
//               <Button
//                 onClick={handleCreateArea}
//                 disabled={!!nameError || !formData.name.trim() || createLoading}
//                 className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//               >
//                 {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Create Area
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowCreateForm(false)}
//                 disabled={createLoading}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="flex justify-between items-center">
//           <h3 className="text-lg font-medium">Existing Thematic Areas</h3>
//           <Button
//             onClick={() => setShowCreateForm(true)}
//             className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add New Area
//           </Button>
//         </div>
//       )}

//       {!showCreateForm && (
//         <>
//           {activeAreas.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-md flex items-center">
//                   <Palette className="h-4 w-4 mr-2" />
//                   Active Areas ({activeAreas.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead className="hidden sm:table-cell">Description</TableHead>
//                       <TableHead>Color</TableHead>
//                       <TableHead className="hidden md:table-cell">Created</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {activeAreas.map((area) => (
//                       <TableRow key={area.id}>
//                         <TableCell className="font-medium">{area.name}</TableCell>
//                         <TableCell className="hidden sm:table-cell">
//                           <p className="text-sm text-gray-600 line-clamp-2">
//                             {area.description || "-"}
//                           </p>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center space-x-2">
//                             <div
//                               className="w-4 h-4 rounded border"
//                               style={{ backgroundColor: area.color_code }}
//                             />
//                             <span className="text-xs font-mono text-gray-500">
//                               {area.color_code}
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="hidden md:table-cell">
//                           <span className="text-sm text-gray-600">
//                             {new Date(area.created_at).toLocaleDateString()}
//                           </span>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           )}

//           {inactiveAreas.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-md text-gray-500">
//                   Inactive Areas ({inactiveAreas.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead className="hidden sm:table-cell">Description</TableHead>
//                       <TableHead>Color</TableHead>
//                       <TableHead className="hidden md:table-cell">Created</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {inactiveAreas.map((area) => (
//                       <TableRow key={area.id} className="opacity-60">
//                         <TableCell className="font-medium">{area.name}</TableCell>
//                         <TableCell className="hidden sm:table-cell">
//                           <p className="text-sm text-gray-600 line-clamp-2">
//                             {area.description || "-"}
//                           </p>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center space-x-2">
//                             <div
//                               className="w-4 h-4 rounded border"
//                               style={{ backgroundColor: area.color_code }}
//                             />
//                             <span className="text-xs font-mono text-gray-500">
//                               {area.color_code}
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="hidden md:table-cell">
//                           <span className="text-sm text-gray-600">
//                             {new Date(area.created_at).toLocaleDateString()}
//                           </span>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           )}

//           {activeAreas.length === 0 && (
//             <Card>
//               <CardContent className="p-8 text-center">
//                 <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No thematic areas yet</h3>
//                 <p className="text-gray-600 mb-4">
//                   Create your first thematic area to start categorizing interventions.
//                 </p>
//                 <Button
//                   onClick={() => setShowCreateForm(true)}
//                   className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Create First Area
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </>
//       )}
//     </div>
//   );

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className={mode === 'manage' ? "sm:max-w-[800px] max-h-[90vh]" : "sm:max-w-[500px]"} aria-describedby="dialog-description">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             {mode === 'assign' ? (
//               <>
//                 <Target className="h-5 w-5 text-[#27aae1]" />
//                 Assign Thematic Area
//               </>
//             ) : (
//               <>
//                 <Palette className="h-5 w-5 text-[#27aae1]" />
//                 Manage Thematic Areas
//               </>
//             )}
//           </DialogTitle>
//           <DialogDescription id="dialog-description">
//             {mode === 'assign' 
//               ? `Assign a thematic area to ${selectedInterventions.length} selected intervention${selectedInterventions.length > 1 ? 's' : ''}.`
//               : 'Create and manage thematic areas for categorizing intervention proposals.'
//             }
//           </DialogDescription>
//         </DialogHeader>

//         {mode === 'assign' ? renderAssignmentContent() : renderManagementContent()}

//         <DialogFooter>
//           {mode === 'assign' ? (
//             <>
//               <Button
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 disabled={assignLoading}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleAssign}
//                 disabled={!selectedThematicAreaId || assignLoading || selectedInterventions.length === 0}
//                 className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//               >
//                 {assignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Assign to {selectedInterventions.length} Intervention{selectedInterventions.length > 1 ? 's' : ''}
//               </Button>
//             </>
//           ) : (
//             <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createLoading}>
//               Close
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

