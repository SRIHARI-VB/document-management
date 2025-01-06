import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  User,
  Save,
  FolderPlus,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Upload,
  Eye,
  X,
} from "lucide-react";

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSave = () => {
    if (applicantName.trim()) {
      const newApplicant = {
        id: Date.now(),
        name: applicantName.trim(),
        documents: [],
      };
      setApplicants([...applicants, newApplicant]);
      setSelectedApplicant(newApplicant.id);
      setApplicantName("");
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (id) => {
    setApplicants(applicants.filter((app) => app.id !== id));
    if (selectedApplicant === id) {
      setSelectedApplicant(applicants[0]?.id || null);
    }
  };

  const handleDeleteDocument = (docId) => {
    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.filter((doc) => doc.id !== docId),
          };
        }
        return app;
      })
    );
  };

  const handleNavigation = (direction) => {
    const currentIndex = applicants.findIndex(
      (app) => app.id === selectedApplicant
    );
    if (direction === "next" && currentIndex < applicants.length - 1) {
      setSelectedApplicant(applicants[currentIndex + 1].id);
    } else if (direction === "back" && currentIndex > 0) {
      setSelectedApplicant(applicants[currentIndex - 1].id);
    }
  };

  const handleAddDocument = () => {
    if (documentName.trim()) {
      setApplicants(
        applicants.map((app) => {
          if (app.id === selectedApplicant) {
            return {
              ...app,
              documents: [
                ...app.documents,
                {
                  id: Date.now(),
                  name: documentName.trim(),
                  files: [],
                },
              ],
            };
          }
          return app;
        })
      );
      setDocumentName("");
      setIsDocDialogOpen(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, docId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, docId);
    }
  };

  const handleChange = (e, docId) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files, docId);
    }
  };

  const handleFiles = (files, docId) => {
    const fileArray = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending",
      size: file.size,
    }));

    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  files: [...doc.files, ...fileArray],
                };
              }
              return doc;
            }),
          };
        }
        return app;
      })
    );
  };

  const handleUpload = (docId, fileId) => {
    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  files: doc.files.map((file) => {
                    if (file.id === fileId) {
                      return { ...file, status: "completed" };
                    }
                    return file;
                  }),
                };
              }
              return doc;
            }),
          };
        }
        return app;
      })
    );
  };

  const handleDeleteFile = (docId, fileId) => {
    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  files: doc.files.filter((file) => file.id !== fileId),
                };
              }
              return doc;
            }),
          };
        }
        return app;
      })
    );
  };

  const handleView = (file) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
  };

  const currentIndex = applicants.findIndex(
    (app) => app.id === selectedApplicant
  );
  const isFirstApplicant = currentIndex === 0;
  const isLastApplicant = currentIndex === applicants.length - 1;
  const currentApplicant = applicants.find(
    (app) => app.id === selectedApplicant
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:py-8 lg:px-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="sm:w-auto">
          <User className="mr-2 h-5 w-5" />
          Add Applicant
        </Button>
      </div>

      {/* Add Applicant Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Applicant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter applicant name"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="text-lg"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDocument()}
              className="text-lg"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>
              <X/>
              Cancel
            </Button>
            <Button onClick={handleAddDocument}><Save/>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {applicants.length === 0 ? (
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">No Applicants Added</CardTitle>
            <CardDescription className="text-lg">
              Get started by adding your first applicant
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-6">
              <FolderPlus className="h-14 w-14 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Click the "Add Applicant" button above to start managing
                documents for a new applicant.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2 border-b">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className={`relative cursor-pointer border-b-4 px-4 py-2 ${
                  selectedApplicant === applicant.id
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => setSelectedApplicant(applicant.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{applicant.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(applicant.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedApplicant && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg text-muted-foreground">
                  {currentApplicant?.documents.length === 0
                    ? "No documents available"
                    : `${currentApplicant?.documents.length} document(s)`}
                </span>
                <Button
                  className="sm:w-auto"
                  onClick={() => setIsDocDialogOpen(true)}
                >
                  <FolderPlus className="mr-2 h-5 w-5" />
                  Add Document
                </Button>
              </div>

              {currentApplicant?.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="mb-6 border rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{doc.name}</span>
                      <Badge variant="secondary" className="text-lg">
                        {doc.files.length} file(s)
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-5 w-5 mr-1" />
                      Delete Document
                    </Button>
                  </div>

                  <div
                    className={`border-2 border-dashed flex flex-col items-center gap-2 rounded-lg p-4 mb-4 ${
                      dragActive ? "border-primary bg-primary/10" : ""
                    }`}
                    onDragEnter={(e) => handleDrag(e)}
                    onDragLeave={(e) => handleDrag(e)}
                    onDragOver={(e) => handleDrag(e)}
                    onDrop={(e) => handleDrop(e, doc.id)}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div className="flex justify-center mb-4">
                      <Button
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                      >
                        Choose Files
                      </Button>
                      <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => handleChange(e, doc.id)}
                      />
                    </div>
                    <p className="text-lg text-center text-muted-foreground">
                      Drag and drop files here or click to browse
                    </p>
                  </div>

                  {doc.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between border rounded-lg p-3 mb-2 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-lg">
                          {file.file.name}
                        </span>
                        <span className="text-lg text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            file.status === "completed"
                              ? "bg-green-100 text-green-700 border-green-200 text-lg"
                              : "bg-orange-100 text-orange-700 border-orange-200 text-lg"
                          }
                        >
                          {file.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {file.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleUpload(doc.id, file.id)}
                          >
                            <Upload className="h-5 w-5 mr-1" />
                            Upload
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                          onClick={() => handleView(file.file)}
                        >
                          <Eye className="h-5 w-5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteFile(doc.id, file.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {applicants.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => handleNavigation("back")}
            disabled={!applicants.length || isFirstApplicant}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <Button
            onClick={() => handleNavigation("next")}
            disabled={!applicants.length || isLastApplicant}
          >
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
