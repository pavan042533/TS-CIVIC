import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSchemes, type Scheme } from "@/context/SchemesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  ExternalLink,
  Save,
  X,
  BarChart3,
  Activity,
  Globe,
} from "lucide-react";

const AdminSchemeManager = () => {
  const { language, t } = useLanguage();
  const { schemes, addScheme, updateScheme, deleteScheme } = useSchemes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newScheme, setNewScheme] = useState({
    name: { en: "", hi: "", te: "" },
    description: { en: "", hi: "", te: "" },
    eligibility: { en: [""], hi: [""], te: [""] },
    documents: { en: [""], hi: [""], te: [""] },
    benefits: { en: [""], hi: [""], te: [""] },
    category: "all" as "farmers" | "senior" | "students" | "women" | "all",
    applicationUrl: "",
    department: "",
    isActive: true,
  });

  const categories = [
    { id: "all", label: "All Citizens", icon: "👥" },
    { id: "farmers", label: "Farmers", icon: "🌾" },
    { id: "senior", label: "Senior Citizens", icon: "👴" },
    { id: "students", label: "Students", icon: "🎓" },
    { id: "women", label: "Women", icon: "👩" },
  ];

  const handleAddScheme = async () => {
    setIsSubmitting(true);
    try {
      const success = await addScheme(newScheme);
      if (success) {
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding scheme:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScheme = async () => {
    if (!selectedScheme) return;

    setIsSubmitting(true);
    try {
      const success = await updateScheme(selectedScheme.id, newScheme);
      if (success) {
        setIsEditDialogOpen(false);
        setSelectedScheme(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating scheme:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    try {
      await deleteScheme(schemeId);
    } catch (error) {
      console.error("Error deleting scheme:", error);
    }
  };

  const openEditDialog = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setNewScheme({
      name: scheme.name,
      description: scheme.description,
      eligibility: scheme.eligibility,
      documents: scheme.documents,
      benefits: scheme.benefits,
      category: scheme.category,
      applicationUrl: scheme.applicationUrl,
      department: scheme.department,
      isActive: scheme.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setNewScheme({
      name: { en: "", hi: "", te: "" },
      description: { en: "", hi: "", te: "" },
      eligibility: { en: [""], hi: [""], te: [""] },
      documents: { en: [""], hi: [""], te: [""] },
      benefits: { en: [""], hi: [""], te: [""] },
      category: "all",
      applicationUrl: "",
      department: "",
      isActive: true,
    });
  };

  const addArrayItem = (field: "eligibility" | "documents" | "benefits") => {
    setNewScheme((prev) => ({
      ...prev,
      [field]: {
        en: [...prev[field].en, ""],
        hi: [...prev[field].hi, ""],
        te: [...prev[field].te, ""],
      },
    }));
  };

  const removeArrayItem = (
    field: "eligibility" | "documents" | "benefits",
    index: number,
  ) => {
    setNewScheme((prev) => ({
      ...prev,
      [field]: {
        en: prev[field].en.filter((_, i) => i !== index),
        hi: prev[field].hi.filter((_, i) => i !== index),
        te: prev[field].te.filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (
    field: "eligibility" | "documents" | "benefits",
    index: number,
    lang: "en" | "hi" | "te",
    value: string,
  ) => {
    setNewScheme((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: prev[field][lang].map((item, i) =>
          i === index ? value : item,
        ),
      },
    }));
  };

  const getTotalViews = () => {
    return schemes.reduce((total, scheme) => total + scheme.clickCount, 0);
  };

  const getTopScheme = () => {
    return schemes.reduce((top, scheme) =>
      scheme.clickCount > top.clickCount ? scheme : top,
    );
  };

  const SchemeForm = ({ isEdit = false }) => (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">Basic Information</h3>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={newScheme.category}
            onValueChange={(value: any) =>
              setNewScheme((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={newScheme.department}
            onChange={(e) =>
              setNewScheme((prev) => ({ ...prev, department: e.target.value }))
            }
            placeholder="Department name"
          />
        </div>

        {/* Application URL */}
        <div>
          <Label htmlFor="applicationUrl">Application URL</Label>
          <Input
            id="applicationUrl"
            value={newScheme.applicationUrl}
            onChange={(e) =>
              setNewScheme((prev) => ({
                ...prev,
                applicationUrl: e.target.value,
              }))
            }
            placeholder="https://..."
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={newScheme.isActive}
            onCheckedChange={(checked) =>
              setNewScheme((prev) => ({ ...prev, isActive: checked }))
            }
          />
          <Label htmlFor="isActive">Active Scheme</Label>
        </div>
      </div>

      {/* Multilingual Content */}
      <div className="space-y-4">
        <h3 className="font-semibold">Multilingual Content</h3>

        {/* Scheme Name */}
        <div className="space-y-2">
          <Label>Scheme Name</Label>
          {(["en", "hi", "te"] as const).map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Badge variant="secondary" className="w-12 text-xs">
                {lang.toUpperCase()}
              </Badge>
              <Input
                value={newScheme.name[lang]}
                onChange={(e) =>
                  setNewScheme((prev) => ({
                    ...prev,
                    name: { ...prev.name, [lang]: e.target.value },
                  }))
                }
                placeholder={`Scheme name in ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}`}
              />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          {(["en", "hi", "te"] as const).map((lang) => (
            <div key={lang} className="flex items-start space-x-2">
              <Badge variant="secondary" className="w-12 text-xs mt-2">
                {lang.toUpperCase()}
              </Badge>
              <Textarea
                value={newScheme.description[lang]}
                onChange={(e) =>
                  setNewScheme((prev) => ({
                    ...prev,
                    description: {
                      ...prev.description,
                      [lang]: e.target.value,
                    },
                  }))
                }
                placeholder={`Description in ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}`}
                rows={2}
              />
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Eligibility Criteria</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("eligibility")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          {newScheme.eligibility.en.map((_, index) => (
            <div key={index} className="space-y-2 border p-3 rounded">
              {(["en", "hi", "te"] as const).map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Badge variant="secondary" className="w-12 text-xs">
                    {lang.toUpperCase()}
                  </Badge>
                  <Input
                    value={newScheme.eligibility[lang][index] || ""}
                    onChange={(e) =>
                      updateArrayItem(
                        "eligibility",
                        index,
                        lang,
                        e.target.value,
                      )
                    }
                    placeholder={`Eligibility criteria in ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}`}
                  />
                  {index > 0 && lang === "en" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("eligibility", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Required Documents</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("documents")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          {newScheme.documents.en.map((_, index) => (
            <div key={index} className="space-y-2 border p-3 rounded">
              {(["en", "hi", "te"] as const).map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Badge variant="secondary" className="w-12 text-xs">
                    {lang.toUpperCase()}
                  </Badge>
                  <Input
                    value={newScheme.documents[lang][index] || ""}
                    onChange={(e) =>
                      updateArrayItem("documents", index, lang, e.target.value)
                    }
                    placeholder={`Required document in ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}`}
                  />
                  {index > 0 && lang === "en" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("documents", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Benefits</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("benefits")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          {newScheme.benefits.en.map((_, index) => (
            <div key={index} className="space-y-2 border p-3 rounded">
              {(["en", "hi", "te"] as const).map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Badge variant="secondary" className="w-12 text-xs">
                    {lang.toUpperCase()}
                  </Badge>
                  <Input
                    value={newScheme.benefits[lang][index] || ""}
                    onChange={(e) =>
                      updateArrayItem("benefits", index, lang, e.target.value)
                    }
                    placeholder={`Benefit in ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}`}
                  />
                  {index > 0 && lang === "en" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("benefits", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheme Manager</h2>
          <p className="text-gray-600">
            Manage government schemes and track their performance
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Scheme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Scheme</DialogTitle>
              <DialogDescription>
                Create a new government scheme with multilingual support
              </DialogDescription>
            </DialogHeader>
            <SchemeForm />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddScheme} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Scheme
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schemes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schemes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active government schemes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalViews()}</div>
            <p className="text-xs text-muted-foreground">Scheme page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Scheme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schemes.length > 0 ? getTopScheme().name.en : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {schemes.length > 0
                ? `${getTopScheme().clickCount} views`
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(schemes.map((s) => s.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schemes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.map((scheme) => (
                <TableRow key={scheme.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{scheme.name[language]}</div>
                      <div className="text-sm text-gray-500">
                        {scheme.description[language].substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categories.find((c) => c.id === scheme.category)?.icon}{" "}
                      {categories.find((c) => c.id === scheme.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{scheme.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {scheme.clickCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={scheme.isActive ? "default" : "secondary"}>
                      {scheme.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(scheme.applicationUrl, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(scheme)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {scheme.name[language]}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteScheme(scheme.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Scheme</DialogTitle>
            <DialogDescription>
              Update scheme information and translations
            </DialogDescription>
          </DialogHeader>
          <SchemeForm isEdit={true} />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedScheme(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditScheme} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Scheme
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSchemeManager;
