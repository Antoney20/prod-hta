// "use client";

// import { useState } from "react";
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

// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Loader2, 
//   Settings, 
//   Plus, 
//   Edit2, 
//   Trash2, 
//   Save,
//   X,
//   AlertTriangle
// } from "lucide-react";
// import type { ThematicArea } from "@/types/interventions";

// interface ThematicAreasManagementProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   thematicAreas: ThematicArea[];
//   fetchData: () => Promise<void>;
// }

// interface ThematicAreaForm {
//   id?: number;
//   name: string;
//   description: string;
//   color_code: string;
//   is_active: boolean;
// }

// const defaultColors = [
//   '#27aae1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
//   '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
// ];

// export default function ThematicAreasManagement({
//   open,
//   onOpenChange,
//   thematicAreas,
//   fetchData,
// }: ThematicAreasManagementProps) {
//   const [loading, setLoading] = useState(false);
//   const [editingArea, setEditingArea] = useState<ThematicArea | null>(null);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
//   const [formData, setFormData] = useState<ThematicAreaForm>({
//     name: '',
//     description: '',
//     color_code: defaultColors[0],
//     is_active: true,
//   });

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       color_code: defaultColors[0],
//       is_active: true,
//     });
//     setEditingArea(null);
//     setShowCreateForm(false);
//   };

//   const handleEdit = (area: ThematicArea) => {
//     setFormData({
//       id: area.id,
//       name: area.name,
//       description: area.description || '',
//       color_code: area.color_code,
//       is_active: area.is_active,
//     });
//     setEditingArea(area);
//     setShowCreateForm(false);
//   };

//   const handleCreate = () => {
//     resetForm();
//     setShowCreateForm(true);
//   };

//   const handleSave = async () => {
//     if (!formData.name.trim()) return;
    
//     try {
//       setLoading(true);
      
//       const payload = {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         color_code: formData.color_code,
//         is_active: formData.is_active,
//       };

//       if (editingArea) {
//         // Update existing thematic area
//         const response = await fetch(`/api/thematic-areas/${editingArea.id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//         if (!response.ok) throw new Error('Failed to update thematic area');
//       } else {
//         // Create new thematic area
//         const response = await fetch('/api/thematic-areas', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//         if (!response.ok) throw new Error('Failed to create thematic area');
//       }

//       await fetchData();
//       resetForm();
      
//     } catch (error) {
//       console.error('Error saving thematic area:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       setLoading(true);
      
//       const response = await fetch(`/api/thematic-areas/${id}`, {
//         method: 'DELETE',
//       });
      
//       if (!response.ok) throw new Error('Failed to delete thematic area');
      
//       await fetchData();
//       setDeleteConfirm(null);
      
//     } catch (error) {
//       console.error('Error deleting thematic area:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     onOpenChange(false);
//     resetForm();
//     setDeleteConfirm(null);
//   };

//   const isEditing = editingArea !== null;
//   const isFormOpen = showCreateForm || isEditing;

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
//         <DialogHeader className="flex-shrink-0">
//           <DialogTitle className="flex items-center gap-2">
//             <Settings className="h-5 w-5 text-[#27aae1]" />
//             Manage Thematic Areas
//           </DialogTitle>
//           <DialogDescription>
//             Create, edit, and manage thematic areas for intervention categorization
//           </DialogDescription>
//         </DialogHeader>

//         <div className="flex-1 overflow-auto space-y-6">
//           {/* Create/Edit Form */}
//           {isFormOpen && (
//             <Card className="border-2 border-[#27aae1]/20">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     {isEditing ? 'Edit Thematic Area' : 'Create New Thematic Area'}
//                   </h3>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={resetForm}
//                     className="h-8 w-8 p-0"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 <div className="space-y-4">
//                   {/* Name */}
//                   <div>
//                     <Label htmlFor="name">Name *</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="Enter thematic area name"
//                       className="mt-1"
//                     />
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       placeholder="Enter description (optional)"
//                       rows={3}
//                       className="mt-1"
//                     />
//                   </div>

//                   {/* Color Selection */}
//                   <div>
//                     <Label>Color</Label>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {defaultColors.map((color) => (
//                         <button
//                           key={color}
//                           type="button"
//                           onClick={() => setFormData({ ...formData, color_code: color })}
//                           className={`w-8 h-8 rounded-full border-2 transition-all ${
//                             formData.color_code === color
//                               ? 'border-gray-900 scale-110'
//                               : 'border-gray-300 hover:scale-105'
//                           }`}
//                           style={{ backgroundColor: color }}
//                         />
//                       ))}
//                       <Input
//                         type="color"
//                         value={formData.color_code}
//                         onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
//                         className="w-12 h-8 p-1 border rounded"
//                       />
//                     </div>
//                   </div>

//                   {/* Active Status */}
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <Label htmlFor="active">Active Status</Label>
//                       <p className="text-sm text-gray-500">
//                         Inactive areas won't be available for assignment
//                       </p>
//                     </div>
                   
//                   </div>

//                   {/* Preview */}
//                   <div className="pt-4 border-t">
//                     <Label>Preview</Label>
//                     <div className="mt-2">
//                       <Badge
//                         variant="outline"
//                         style={{
//                           borderColor: formData.color_code,
//                           color: formData.color_code,
//                           backgroundColor: `${formData.color_code}10`,
//                         }}
//                       >
//                         <div
//                           className="w-3 h-3 rounded-full mr-2"
//                           style={{ backgroundColor: formData.color_code }}
//                         />
//                         {formData.name || 'Enter name...'}
//                       </Badge>
//                     </div>
//                   </div>

//                   {/* Form Actions */}
//                   <div className="flex gap-3 pt-4">
//                     <Button
//                       onClick={handleSave}
//                       disabled={!formData.name.trim() || loading}
//                       className="bg-[#27aae1] hover:bg-[#27aae1]/90"
//                     >
//                       {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                       <Save className="mr-2 h-4 w-4" />
//                       {isEditing ? 'Update' : 'Create'}
//                     </Button>
//                     <Button variant="outline" onClick={resetForm}>
//                       Cancel
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Existing Thematic Areas */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-medium text-gray-900">
//                 Existing Thematic Areas ({thematicAreas.length})
//               </h3>
//               {!isFormOpen && (
//                 <Button onClick={handleCreate} className="bg-[#27aae1] hover:bg-[#27aae1]/90">
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add New
//                 </Button>
//               )}
//             </div>

//             <div className="border rounded-lg overflow-hidden">
//               <div className="max-h-96 overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="w-8 px-3 py-3">
//                         <span className="sr-only">Color</span>
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-900">
//                         Name
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-900">
//                         Description
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-900">
//                         Status
//                       </th>
//                       <th className="w-24 px-4 py-3 text-center font-medium text-gray-900">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {thematicAreas.map((area) => (
//                       <tr key={area.id} className="hover:bg-gray-50">
//                         <td className="px-3 py-4">
//                           <div
//                             className="w-4 h-4 rounded-full"
//                             style={{ backgroundColor: area.color_code }}
//                           />
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="font-medium text-gray-900">
//                             {area.name}
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="text-gray-600 max-w-xs truncate">
//                             {area.description || '—'}
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <Badge
//                             variant={area.is_active ? 'default' : 'secondary'}
//                             className={area.is_active ? 'bg-green-100 text-green-800' : ''}
//                           >
//                             {area.is_active ? 'Active' : 'Inactive'}
//                           </Badge>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center justify-center gap-1">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleEdit(area)}
//                               className="h-8 w-8 p-0"
//                             >
//                               <Edit2 className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => setDeleteConfirm(area.id)}
//                               className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
              
//               {thematicAreas.length === 0 && (
//                 <div className="text-center text-gray-500 py-12">
//                   <Settings className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                   <p>No thematic areas created yet</p>
//                   <Button
//                     onClick={handleCreate}
//                     className="mt-3 bg-[#27aae1] hover:bg-[#27aae1]/90"
//                   >
//                     <Plus className="mr-2 h-4 w-4" />
//                     Create First Area
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Delete Confirmation Dialog */}
//         {deleteConfirm && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <Card className="w-full max-w-md mx-4">
//               <CardContent className="p-6">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                     <AlertTriangle className="h-5 w-5 text-red-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-900">
//                       Delete Thematic Area
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       This action cannot be undone.
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3">
//                   <Button
//                     onClick={() => handleDelete(deleteConfirm)}
//                     disabled={loading}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Delete
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => setDeleteConfirm(null)}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         <DialogFooter className="flex-shrink-0 border-t pt-4">
//           <Button variant="outline" onClick={handleClose}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }