import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  Trash2,
  Upload,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  File,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filesSelected, setFilesSelected] = useState(false);
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
    if (selectedDocument === docId) {
      setSelectedDocument(null);
    }
  };

  const handleAddDocument = () => {
    if (documentName.trim()) {
      const newDocument = {
        id: Date.now(),
        name: documentName.trim(),
        files: [],
      };
      setApplicants(
        applicants.map((app) => {
          if (app.id === selectedApplicant) {
            return {
              ...app,
              documents: [...app.documents, newDocument],
            };
          }
          return app;
        })
      );
      setDocumentName("");
      setIsDocDialogOpen(false);
      setSelectedDocument(newDocument.id);
    }
  };

  const handleFiles = (files, docId) => {
    const fileArray = Array.from(files)
      .slice(0, 1)
      .map((file) => ({
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
                  files: fileArray, // Replace existing files with the new file
                };
              }
              return doc;
            }),
          };
        }
        return app;
      })
    );
    setFilesSelected(true);
  };

  const handleChange = (e, docId) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files, docId);
    }
  };

  const handleUpload = (docId) => {
    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  files: doc.files.map((file) => ({
                    ...file,
                    status: "completed",
                  })),
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

  const handleCancel = (docId) => {
    setApplicants(
      applicants.map((app) => {
        if (app.id === selectedApplicant) {
          return {
            ...app,
            documents: app.documents.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  files: [], // Clear files for this document only
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

  const handleNavigation = (direction) => {
    const currentIndex = applicants.findIndex(
      (app) => app.id === selectedApplicant
    );
    let newIndex;

    if (direction === "next") {
      newIndex = currentIndex + 1;
    } else if (direction === "back") {
      newIndex = currentIndex - 1;
    }

    if (newIndex >= 0 && newIndex < applicants.length) {
      const newApplicantId = applicants[newIndex].id;
      setSelectedApplicant(newApplicantId);

      // Reset selected document to the first document of the new applicant
      const newApplicant = applicants[newIndex];
      if (newApplicant.documents.length > 0) {
        setSelectedDocument(newApplicant.documents[0].id);
      } else {
        setSelectedDocument(null);
      }
    }
  };

  const handleApplicantTabClick = (applicantId) => {
    setSelectedApplicant(applicantId);
    const applicant = applicants.find((app) => app.id === applicantId);
    if (applicant && applicant.documents.length > 0) {
      setSelectedDocument(applicant.documents[0].id);
    } else {
      setSelectedDocument(null);
    }
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
    <div className="min-h-screen p-4 md:p-6 lg:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Document Upload</h1>
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
              <X />
              Cancel
            </Button>
            <Button onClick={handleAddDocument}>
              <Save />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {applicants.length === 0 ? (
        <></>
      ) : (
        <div>
          {/* Horizontal applicant tabs */}
          <div className="mb-4 flex flex-col sm:flex-row items-center gap-2 border-b">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className={`relative cursor-pointer border-b-2 px-4 py-4 ${
                  selectedApplicant === applicant.id
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => handleApplicantTabClick(applicant.id)}
              >
                <span className="text-lg mr-4">{applicant.name}</span>
                <Button
                  variant="ghost"
                  className="text-secondary bg-primary hover:text-primary hover:bg-primary/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(applicant.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {selectedApplicant && (
            <div className="mt-6">
              {/* Vertical document tabs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/6">
                  {currentApplicant?.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`cursor-pointer text-center p-2 mb-2 ${
                        selectedDocument === doc.id
                          ? "bg-primary rounded-md text-secondary"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedDocument(doc.id)}
                    >
                      <span className="text-lg flex items-center justify-center font-medium">
                        <File className="h-4 w-4 mr-2" />
                        {doc.name}
                      </span>
                    </div>
                  ))}
                  {currentApplicant?.documents.length === 0 && (
                    <p className="text-lg py-4">No Documents available</p>
                  )}
                  <Button
                    onClick={() => setIsDocDialogOpen(true)}
                    className="w-full my-2"
                  >
                    <Plus className="mr-2 h-4 w-4 " />
                    Add Document
                  </Button>
                </div>

                {/* File list for the selected document */}
                {currentApplicant?.documents.length > 0 && (
                  <div className="w-full sm:w-3/4 border px-4 rounded-lg">
                    {/* Card Header with Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-gray-50 border-b-4 py-2">
                      <Button onClick={() => inputRef.current?.click()}>
                        <Plus />
                        Choose
                      </Button>
                      <Button
                        disabled={
                          currentApplicant?.documents.find(
                            (doc) => doc.id === selectedDocument
                          )?.files.length === 0
                        }
                        onClick={() => handleUpload(selectedDocument)} // Pass the selected document ID
                      >
                        <Upload />
                        Upload
                      </Button>
                      <Button
                        disabled={
                          currentApplicant?.documents.find(
                            (doc) => doc.id === selectedDocument
                          )?.files.length === 0
                        }
                        onClick={() => handleCancel(selectedDocument)}
                      >
                        <X />
                        Cancel
                      </Button>
                      <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        multiple={false} // Allow only one file to be selected
                        onChange={(e) => handleChange(e, selectedDocument)}
                      />
                    </div>

                    {/* File List */}
                    {selectedDocument &&
                      currentApplicant?.documents
                        .find((doc) => doc.id === selectedDocument)
                        ?.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 border rounded-lg mb-2"
                          >
                            <div className="flex items-center gap-4">
                              {file.file.type.startsWith("image/") && (
                                <img
                                  src={URL.createObjectURL(file.file)}
                                  alt={file.file.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <span>{file.file.name}</span>
                              <span className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </span>
                              <Badge
                                className={
                                  file.status === "completed"
                                    ? "bg-green-400 text-white"
                                    : "bg-orange-400 text-white"
                                }
                              >
                                {file.status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteFile(selectedDocument, file.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                    {/* Drag and Drop Area */}
                    <div
                      className="p-16 border border-dashed rounded-lg mb-4"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          e.dataTransfer.files &&
                          e.dataTransfer.files.length > 0
                        ) {
                          handleFiles(e.dataTransfer.files, selectedDocument);
                        }
                      }}
                    >
                      <p className="text-center text-gray-500">
                        Drag and drop a file here (replaces existing file)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between border-b-4 py-10">
        <Button onClick={() => handleNavigation("back")}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={() => handleNavigation("next")}>
          Next
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default App;
