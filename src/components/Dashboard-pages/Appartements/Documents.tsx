import React, { useState } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DocumentType {
    file: File;
    type: string;  // Add the type property
  }
  
interface DocumentsProps {
  onDocumentsChange: (documents: DocumentType[]) => void;
}

const Documents: React.FC<DocumentsProps> = ({ onDocumentsChange }) => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
  
    const newDocuments = Array.from(files).map((file) => {
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      return {
        file,
        type: fileType,  // Add file type based on file extension
      };
    });
  
    setDocuments((prevDocuments) => {
      const updatedDocuments = [...prevDocuments, ...newDocuments];
      onDocumentsChange(updatedDocuments);
      return updatedDocuments;
    });
  };
  
  const handleDocumentDelete = (index: number) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = prevDocuments.filter((_, i) => i !== index);
      onDocumentsChange(updatedDocuments);
      return updatedDocuments;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Set Documents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {documents.map((document, index) => (
          <div className="relative flex items-center p-2 border rounded-lg" key={index}>
            <InsertDriveFileIcon className="text-gray-500 mr-2" fontSize="large" />
            <div className="flex-1">
              <span className="block truncate">{document.file.name}</span>
              <span className="text-sm text-gray-400">{(document.file.size / 1024).toFixed(2)} KB</span>
            </div>
            <button
              onClick={() => handleDocumentDelete(index)}
              className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full"
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4">
          <label className="flex flex-col items-center cursor-pointer">
            <InsertDriveFileIcon className="text-color1" fontSize="large" />
            <span className="mt-2 text-color1 underline">Add Documents</span>
            <span className="mt-2 text-gray-400">format: PDF, DOC, DOCX, TXT</span>
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleDocumentUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Documents;
