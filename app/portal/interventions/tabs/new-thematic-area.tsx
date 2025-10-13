"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Palette, Target, ArrowLeft, AlertTriangle } from "lucide-react";
import type { ProposalTracker, ThematicArea } from "@/types/dashboard/intervention";
import { assignThematicArea, createThematicArea } from "@/app/api/dashboard/proposals";

interface ThematicAreasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'assign' | 'manage';
  selectedTrackers?: ProposalTracker[];
  thematicAreas: ThematicArea[];
  onSuccess: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

const defaultColors = [
  "#27aae1", "#fe7105", "#6366f1", "#10b981", "#f59e0b", 
  "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
];

export default function ThematicAreasDialog({
  open,
  onOpenChange,
  mode,
  selectedTrackers = [],
  thematicAreas,
  onSuccess,
  onRefresh,
}: ThematicAreasDialogProps) {
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color_code: defaultColors[0],
  });
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedAreaId("");
      setShowCreateForm(false);
      setFormData({ name: "", description: "", color_code: defaultColors[0] });
      setError(null);
      setNameError(null);
    }
  }, [open]);

  // Validate name field
  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (thematicAreas.some(area => area.name.toLowerCase() === name.trim().toLowerCase())) {
      return "Name already exists";
    }
    return null;
  };

  // Update form data and validate name
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    setNameError(validateName(value));
  };

  const handleAssign = async () => {
    if (!selectedAreaId || selectedTrackers.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Use the correct endpoint and data structure for your Django backend
      await assignThematicArea({
        tracker_ids: selectedTrackers.map(t => t.id),
        thematic_area_id: parseInt(selectedAreaId)
      });
      
      await onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      setError(error.message || "Failed to assign thematic areas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async () => {
    if (!formData.name.trim()) return;
    
    const nameValidation = validateName(formData.name);
    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create new thematic area
      await createThematicArea({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color_code: formData.color_code,
        is_active: true,
      });
      
      await onRefresh();
      setFormData({ name: "", description: "", color_code: defaultColors[0] });
      setShowCreateForm(false);
      
    } catch (error: any) {
      setError(error.message || "Failed to create thematic area");
    } finally {
      setLoading(false);
    }
  };

  const renderAssignMode = () => {
    if (selectedTrackers.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Selected</h3>
            <p className="text-gray-600 mb-4">Please select interventions to assign thematic areas.</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Go Back</Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Selected Items */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Selected Items ({selectedTrackers.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedTrackers.map((tracker) => (
                <div key={tracker.id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">
                    {tracker.proposal.intervention_name || `#${tracker.proposal.id}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tracker.proposal.name} - {tracker.proposal.organization}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Area Selection */}
        <div className="space-y-3">
          <Label htmlFor="area-select">Select Thematic Area *</Label>
          <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
            <SelectTrigger id="area-select">
              <SelectValue placeholder="Choose a thematic area" />
            </SelectTrigger>
            <SelectContent>
              {thematicAreas.filter(a => a.is_active).map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: area.color_code }}
                    />
                    <span className="truncate">{area.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderManageMode = () => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowLeft 
                className="h-4 w-4 mr-2 cursor-pointer" 
                onClick={() => setShowCreateForm(false)}
              />
              Create New Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area-name">Name *</Label>
                <Input
                  id="area-name"
                  placeholder="e.g., Health & Nutrition"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full"
                />
                {nameError && (
                  <p className="text-sm text-red-600">{nameError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area-color">Color</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: formData.color_code }}
                  />
                  <Input
                    id="area-color"
                    type="color"
                    value={formData.color_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_code: e.target.value }))}
                    className="w-16 h-8 p-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Colors</Label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color_code: color }))}
                    className={`w-6 h-6 rounded border-2 ${
                      formData.color_code === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area-desc">Description</Label>
              <Textarea
                id="area-desc"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreateArea}
                disabled={!!nameError || !formData.name.trim() || loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Area
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Thematic Areas ({thematicAreas.length})</h3>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Area
            </Button>
          </div>

          {thematicAreas.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Name</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[200px]">Description</TableHead>
                        <TableHead className="min-w-[100px]">Color</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {thematicAreas.map((area) => (
                        <TableRow key={area.id}>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[150px]">{area.name}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="text-sm text-gray-600 line-clamp-2 max-w-[200px]">
                              {area.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded border flex-shrink-0"
                                style={{ backgroundColor: area.color_code }}
                              />
                              <span className="text-xs font-mono text-gray-500 hidden sm:inline">
                                {area.color_code}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={area.is_active ? "default" : "secondary"}>
                              {area.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No areas yet</h3>
                <p className="text-gray-600 mb-4">Create your first thematic area.</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Area
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full max-w-[95vw] sm:max-w-2xl ${mode === 'manage' ? 'lg:max-w-4xl' : ''} max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'assign' ? (
              <>
                <Target className="h-5 w-5 text-blue-600" />
                Assign Thematic Area
              </>
            ) : (
              <>
                <Palette className="h-5 w-5 text-blue-600" />
                Manage Thematic Areas
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {mode === 'assign' ? renderAssignMode() : renderManageMode()}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {mode === 'assign' ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedAreaId || loading || selectedTrackers.length === 0}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign to {selectedTrackers.length} Item{selectedTrackers.length > 1 ? 's' : ''}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}