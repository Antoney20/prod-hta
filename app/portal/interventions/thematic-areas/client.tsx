"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Palette } from "lucide-react";
import type { ThematicArea } from "@/types/interventions";
import { createThematicArea } from "@/app/api/dashboard";

interface ThematicAreasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thematicAreas: ThematicArea[];
  onRefresh: () => Promise<void>;
}

interface FormData {
  name: string;
  description: string;
  color_code: string;
}

const defaultColors = [
  "#27aae1", "#fe7105", "#6366f1", "#10b981", "#f59e0b", 
  "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316",
  "#3b82f6", "#22c55e", "#eab308", "#e11d48", "#a855f7"
];

export default function ThematicAreasDialog({
  open,
  onOpenChange,
  thematicAreas,
  onRefresh,
}: ThematicAreasDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    color_code: defaultColors[0],
  });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        color_code: defaultColors[0],
      });
      setShowCreateForm(false);
    }
  }, [open]);

  const handleCreateArea = async () => {
    if (!formData.name.trim()) return;

    try {
      setLoading(true);

      await createThematicArea({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color_code: formData.color_code,
        is_active: true,
      });

      await onRefresh();
      setFormData({
        name: "",
        description: "",
        color_code: defaultColors[0],
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating thematic area:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeAreas = thematicAreas.filter(area => area.is_active);
  const inactiveAreas = thematicAreas.filter(area => !area.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Thematic Areas</DialogTitle>
          <DialogDescription>
            Create and manage thematic areas for categorizing intervention proposals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Create New Area Form */}
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Thematic Area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area_name">Name *</Label>
                    <Input
                      id="area_name"
                      placeholder="e.g., Health & Nutrition"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area_color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: formData.color_code }}
                      />
                      <Input
                        id="area_color"
                        type="color"
                        value={formData.color_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, color_code: e.target.value }))}
                        className="w-16 h-8 p-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
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
                  <Label htmlFor="area_description">Description</Label>
                  <Textarea
                    id="area_description"
                    placeholder="Brief description of this thematic area..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateArea}
                    disabled={!formData.name.trim() || loading}
                    className="bg-[#27aae1] hover:bg-[#27aae1]/90"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Area
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Existing Thematic Areas</h3>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#27aae1] hover:bg-[#27aae1]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Area
              </Button>
            </div>
          )}

          {/* Active Areas */}
          {activeAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Active Areas ({activeAreas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAreas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {area.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: area.color_code }}
                            />
                            <span className="text-xs font-mono text-gray-500">
                              {area.color_code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(area.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Inactive Areas */}
          {inactiveAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md text-gray-500">
                  Inactive Areas ({inactiveAreas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveAreas.map((area) => (
                      <TableRow key={area.id} className="opacity-60">
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {area.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: area.color_code }}
                            />
                            <span className="text-xs font-mono text-gray-500">
                              {area.color_code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(area.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {activeAreas.length === 0 && !showCreateForm && (
            <Card>
              <CardContent className="p-8 text-center">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No thematic areas yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first thematic area to start categorizing interventions.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#27aae1] hover:bg-[#27aae1]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Area
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}