import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Typography, TextField, IconButton } from '@mui/material';
import { fetchProperties } from '../utils/apiUtils';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/PhotoCameraOutlined';

import AttachFileIcon from '@mui/icons-material/AttachFile';
type ImageType = { file: File; preview: string };
type DocumentType = { file: File; name: string };

const steps = [
  'Saisir les détails de l\'appartement',
  'Modifier les photos',
  'Modifier les documents',
];

type PieceType = "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "Garage";
const piecesOptions: Record<PieceType, number[]> = {
  F1: [1],
  F2: [1, 2],
  F3: [1, 2, 3],
  F4: [1, 2, 3, 4],
  F5: [1, 2, 3, 4, 5],
  F6: [1, 2, 3, 4, 5, 6],
  F7: [1, 2, 3, 4, 5, 6, 7],
  Garage: [1],
};

const getNumericType = (type: PieceType): number => {
  const typeMap: Record<PieceType, number> = {
    F1: 1,
    F2: 2,
    F3: 3,
    F4: 4,
    F5: 5,
    F6: 6,
    F7: 7,
    Garage: 0,
  };
  return typeMap[type] || 0;
};
const apartmentTypes = [
  { label: 'F1', value: 1 },
  { label: 'F2', value: 2 },
  { label: 'F3', value: 3 },
  { label: 'F4', value: 4 },
  { label: 'F5', value: 5 },
  { label: 'F6', value: 6 },
  { label: 'F7', value: 7 },
  { label: 'Garage', value: 0 },
];

const UpdateApartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [apartmentData, setApartmentData] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [currentPictures, setCurrentPictures] = useState<any[]>([]);
  const [currentDocuments, setCurrentDocuments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [pieceNames, setPieceNames] = useState<string[]>([]);
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedF, setSelectedF] = useState<PieceType>('F1');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
 // States for images and documents
  const [images, setImages] = useState<ImageType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedType, setSelectedType] = useState<{ value: number; label: string } | null>(null);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(event.target.value, 10); // Convert string to number
    const selectedOption = apartmentTypes.find(option => option.value === selectedValue) || null; // Find the selected option
    setSelectedType(selectedOption);
    console.log('Selected Type:', selectedOption); // Log selected type
};
const navigate = useNavigate();
const location = useLocation();
  const isStepSkipped = (step: number) => skipped.has(step);

  useEffect(() => {
    const loadProperties = async () => {
      const fetchedProperties = await fetchProperties();
      setProperties(fetchedProperties);
    };
    loadProperties();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const apartmentResponse = await axios.get(`${API_BASE_URL}/Apartment/${id}`);
          setApartmentData(apartmentResponse.data);
          const defaultTypeValue = apartmentResponse.data.type; // assuming `type` is the field from backend
          const defaultType = apartmentTypes.find(option => option.value === defaultTypeValue) || null;
          setSelectedType(defaultType);


          const areasResponse = await axios.get(`${API_BASE_URL}/Apartment/areas/${id}`);
          setAreas(areasResponse.data);

          const imagesResponse = await axios.get(`${API_BASE_URL}/ApartmentPicture/apartment/${id}`);
          setCurrentPictures(imagesResponse.data);

          const documentsResponse = await axios.get(`${API_BASE_URL}/ApartmentDocument/apartment/${id}`);
          setCurrentDocuments(documentsResponse.data);
        } catch (error) {
          setError('Erreur lors du chargement des données.');
        }
      };
      fetchData();
    } else {
      setError('ID de l\'appartement manquant.');
    }
  }, [id, API_BASE_URL]);

  const handleNext = async () => {
    if (!id) {
      console.error('ID is missing.');
      return;
    }
  
    if (activeStep === 0) {
      try {
        await handleUpdateApartmentData();
      } catch (error) {
        console.error('Failed to update apartment data:', error);
        setError('Failed to update apartment data.');
      }
      // setActiveStep((prev) => prev + 1); // Always proceed to the next step
    } 
    else if (activeStep === 1) {
      try {
        await handleSubmitImages(); // Submit images if available
      } catch (error) {
        console.error('Failed to submit images:', error);
        setError('Failed to submit images.');
      }
      setActiveStep((prev) => prev + 1); // Proceed to the next step regardless
    } 
    else if (activeStep === 2) {
      try {
        await handleSubmitDocuments(); // Submit documents if available
      } catch (error) {
        console.error('Failed to submit documents:', error);
        setError('Failed to submit documents.');
      }
      setActiveStep((prev) => prev + 1); // Move to the final step
      navigate('/dashboard/apartments'); // Redirect after final step
    }
  };
  
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleUpdateApartmentData = async () => {
    if (!id) return;
  
    const payload = {
      ...apartmentData,
      type: selectedType ? selectedType.value : undefined, // Only include if valid

    };
    console.log('Payload being sent:', payload);

  
    try {
      // Update apartment data
      const response = await axios.put(`${API_BASE_URL}/Apartment/${id}`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        // Check if areas exist
       
          // Create new areas if none exist
          const createPromises = pieces.map((_, index) =>
            axios.post(`${API_BASE_URL}/Area`, {
              name: pieceNames[index] || '',
              surface: pieces[index],
              apartmentId: id,
              type: selectedF,
            }, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }).catch((err) => {
              console.error('Error creating area:', err);
              setError('Erreur lors de la création des zones.');
            })
          );
          await Promise.all(createPromises);
        
          // Update existing areas
          const updatePromises = areas.map((area) =>
            axios.put(`${API_BASE_URL}/Area/${area.id}`, area, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }).catch((err) => {
              console.error('Error updating area:', err);
              setError('Erreur lors de la mise à jour des zones.');
            })
          );
          await Promise.all(updatePromises);
        
  
        setActiveStep((prev) => prev + 1);
        setSuccess('L\'appartement a été mis à jour avec succès.');
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating apartment data:', err);
      // setError(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };
  // Submit Images
  const handleSubmitImages = async () => {
    if (!id) return;
    const formData = new FormData();
    images.forEach((image) => {
      if (image.file) {
        formData.append('Pictures', image.file, image.file.name);
      }
    });
    formData.append('apartmentId', id);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/ApartmentPicture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        setSuccess('Images uploaded successfully!');
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Erreur lors de l'envoi des images: ${err.response?.data.errors.file[0]}`);
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    }
  };
  
  const handleSubmitDocuments = async () => {
    if (!id) return;
    const formData = new FormData();
    documents.forEach((document) => {
      if (document.file) {
        formData.append('Documents', document.file, document.file.name);
      }
    });
    formData.append('apartmentId', id);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/ApartmentDocument`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        setSuccess('Documents uploaded successfully!');
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Erreur lors de l'envoi des documents: ${err.response?.data.errors.file[0]}`);
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    }
  };
  



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApartmentData({ ...apartmentData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApartmentData({ ...apartmentData, [name]: value });
  };

  const handleEditDocument = async (documentId: number) => {
    if (!id) return;
  
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const formData = new FormData();
        formData.append('id', documentId.toString());
        formData.append('ApartmentId', id);
        formData.append('Documents', file);
  
        try {
          const response = await axios.put(`${API_BASE_URL}/ApartmentDocument/${documentId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          if (response.status === 200) {
            const updatedDocument = { ...currentDocuments.find(d => d.Id === documentId), documentPath: URL.createObjectURL(file) };
            setCurrentDocuments(prev => prev.map(d => (d.Id === documentId ? updatedDocument : d)));
            setSuccess('Le document a été mis à jour avec succès.');
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(`Erreur lors de la mise à jour du document: ${err.message}`);
          }
        }
      }
    };
  
    input.click();
  };
  const handleDeleteDocument = async (documentId: number) => {
    try {
      // Make the DELETE request to remove the document
      await axios.delete(`${API_BASE_URL}/ApartmentDocument/${documentId}`);
      
      // Update the documents state after successful deletion
      setCurrentDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully.');
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Erreur lors de la suppression du document.');
    }
  };
  
  const handleEditPicture = async (pictureId: number) => {
    if (!id) {
      console.error('Property ID is undefined.');
      return;
    }

    if (pictureId === undefined) {
      console.error('pictureId is undefined.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const formData = new FormData();
        formData.append('id', pictureId.toString());
        formData.append('ApartmentId', id);
        formData.append('Pictures', file);

        try {
          const response = await axios.put(`${API_BASE_URL}/ApartmentPicture/${pictureId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.status === 200) {
            const updatedPicture = { ...currentPictures.find(p => p.Id === pictureId), picturePath: URL.createObjectURL(file) };
            setCurrentPictures(prev => prev.map(p => (p.Id === pictureId ? updatedPicture : p)));
            setSuccess('L\'image a été mise à jour avec succès.');
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(`Erreur lors de la mise à jour de l'image: ${err.message}`);
          }
        }
      }
    };

    input.click();
  };
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApartmentData({ ...apartmentData, [name]: value });
  };
    // Function to handle deleting an image
    const handleDeleteImage = (index: number) => {
      setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
    const handleDeletedoc = (index: number) => {
      setDocuments((prevdocs) => prevdocs.filter((_, i) => i !== index));
    };
  
    // Handle image change and addition
    const handleImagesChange = (newImages: ImageType[]) => {
      setImages((prevImages) => [...prevImages, ...newImages]); // Append new images
    };
    const handleDeletePicture = async (pictureId: number) => {
      try {
        // Make sure the id is valid and the request is correct
        await axios.delete(`${API_BASE_URL}/ApartmentPicture/${pictureId}`);
        
        // Update currentPictures state after successful deletion
        setCurrentPictures((prevPictures) => prevPictures.filter(picture => picture.id !== pictureId));
    
        console.log('Picture deleted successfully');
      } catch (error) {
        console.error('Error deleting picture:', error);
        // Optionally display an error message to the user
      }
    };
    
  const handleFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value as PieceType;
    setSelectedF(selectedType);
    setPieces(piecesOptions[selectedType]);
    setPieceNames(pieceNames.slice(0, piecesOptions[selectedType].length));
  };

  const handleAreaChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Type guard to differentiate between HTMLInputElement and HTMLTextAreaElement
    if (e.target instanceof HTMLInputElement) {
      // Handle input element case
      console.log('Input value:', e.target.value);
    } else if (e.target instanceof HTMLTextAreaElement) {
      // Handle textarea element case
      console.log('Textarea value:', e.target.value);
    }
  };
  

  const handleAddPiece = () => {
    setPieceNames([...pieceNames, '']);
    setPieces([...pieces, 0]);
  };

  const handleRemovePiece = (index: number) => {
    setPieceNames(pieceNames.filter((_, i) => i !== index));
    setPieces(pieces.filter((_, i) => i !== index));
  };
 // Handle images and documents change
//  const handleImagesChange = (newImages: ImageType[]) => {
//   setImages(newImages);
// };

const handleDocumentsChange = (newDocuments: DocumentType[]) => {
  setDocuments((prevDocuments) => [...prevDocuments, ...newDocuments]);
};

  if (!apartmentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-4">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={isStepSkipped(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <div>
          <Typography variant="h6">Modifier les détails de l'appartement</Typography>

          <form className="w-[70vw] ml-5 mt-5 h-full flex flex-row justify-between">
            {/* Left Group */}
            <div className="group-inputs-left flex flex-col justify-around space-y-4 w-full md:w-1/2 mr-5">
              <div className="group-input flex flex-col md:flex-row items-center font-almarai">
                <label htmlFor="name" className="mr-2 w-36">Nom de l'appartement</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={apartmentData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 p-2 rounded"
                />
              </div>
              <div className="group-input flex flex-col md:flex-row items-center font-almarai">
                <label htmlFor="surface" className="mr-2 w-36">Surface (m²)</label>
                <input
                  type="number"
                  name="surface"
                  id="surface"
                  value={apartmentData.surface}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 p-2 rounded"
                />
              </div>
              <div className="group-input flex flex-col md:flex-row items-center font-almarai">
                <label htmlFor="apartmentFloor" className="mr-2 w-36">Étage</label>
                <input
                  type="number"
                  name="floor"
                  id="floor"
                  value={apartmentData.floor}
                  onChange={handleChange}
                  className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
                />
              </div>
              <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
                <label htmlFor="propertyId" className="mr-2 w-36">Bâtiment</label>
                <select
                  name="propertyId"
                  id="propertyId"
                  value={apartmentData.propertyId}
                  onChange={handleSelectChange}
                  className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Add more input fields here as necessary */}
            </div>


              <div className="group-inputs-right flex flex-col w-full md:w-1/2 ml-5">
              <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="description" className="mr-2 w-36">Description</label>
          <textarea
            name="description"
            id="description"
            value={apartmentData.description}
            onChange={handleTextareaChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
            rows={4}
          />
        </div>
        <div>
        {/* Correctly render the selected type's label */}
        {selectedType ? (
            <div>Selected Type: {selectedType.label}</div>
        ) : (
            <div>No type selected</div>
        )}
        
        {/* Example for rendering apartment types */}
        <select onChange={handleTypeChange} value={apartmentData.type}>
            {apartmentTypes.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
           {/* Existing areas */}
           {areas.length > 0 && (
  <div>
    <Typography variant="h6">Zones existantes</Typography>
    {areas.map((area) => (
      <div key={area.id} className="flex flex-col md:flex-row items-center mb-4">
        <TextField
          label="Nom de la zone"
          name="name"
          value={area.name || ''}
          onChange={(e) => handleAreaChange(area.id, e)}
          className="mr-2"
        />
        <TextField
          label="Surface"
          name="surface"
          type="number"
          value={area.surface || ''}
          onChange={(e) => handleAreaChange(area.id, e)}
          className="mr-2"
        />
        {/* <Button
          variant="outlined"
          color="error"
          onClick={() => handleRemovePiece(area.id)}
        >
          Supprimer
        </Button> */}
      </div>
    ))}
  </div>
)}


              {/* Add new areas */}
              <div>
                <Typography variant="h6">Ajouter une nouvelle zone</Typography>
                {/* <div className="flex flex-col md:flex-row items-center mb-4">
                  <select onChange={handleFChange} value={selectedF} name="type" className="mr-2">
                    {Object.keys(piecesOptions).map((option) => (
                      <option key={option} value={option} >
                        {option}
                      </option>
                    ))}
                  </select>
                </div> */}

                {pieces.map((_, index) => (
  <div key={index} className="flex flex-col md:flex-row items-center mb-4">
    <TextField
      label="Nom de la zone"
      name="name"
      value={pieceNames[index] || ''}
      onChange={(e) => {
        const updatedNames = [...pieceNames];
        updatedNames[index] = e.target.value;
        setPieceNames(updatedNames);
      }}
      className="mr-2"
    />
    <TextField
      label="Surface"
      name="surface"
      type="number"
      value={pieces[index] || ''}
      onChange={(e) => {
        const updatedPieces = [...pieces];
        updatedPieces[index] = Number(e.target.value);
        setPieces(updatedPieces);
      }}
      className="mr-2"
    />
      <Button
          variant="outlined"
          color="error"
          onClick={() => handleRemovePiece(index)}
        >
          Supprimer
        </Button>
  </div>
))}


                <Button variant="contained" onClick={handleAddPiece}>
                  Ajouter une zone
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

{activeStep === 1 && (
  <div>
    <h2>Modifier les photos</h2>

    <div className="flex flex-row justify-between gap-4">
      {currentPictures.map((picture) => (
        <div key={picture.id} className='flex flex-row flex-wrap w-100'>
          <img
            src={picture.picturePath}
            alt="Appartement"
            className="h-52 w-72 rounded-lg shadow-lg object-cover"
          />
          <div className='w-5 flex flex-row'>
          <IconButton
              onClick={() => handleDeletePicture(picture.id)}
              // className="absolute top-0 right-0 m-1 bg-white text-red-600"
            >
              <DeleteIcon />
            </IconButton>
          <Button onClick={() => handleEditPicture(picture.id)}>              <EditIcon />
</Button>

          </div>

        </div>
      ))}
    </div>

    <div className="mt-6">
      <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-6 px-2 w-52">
        <label className="flex flex-col items-center cursor-pointer">
          <AddPhotoAlternateIcon className="text-color1" fontSize="large" />
          <span className="mt-2 text-color1 underline">Ajouter des images</span>
          <span className="mt-1 text-gray-400">Formats: PNG, JPG, JPEG, WEBP</span>
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const newImages = files.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
              }));
              handleImagesChange(newImages); // Append new images
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.preview}
              alt="Appartement"
              className="h-32 w-32 rounded-md object-cover shadow-md"
            />
            {/* Delete icon */}
            <IconButton
              onClick={() => handleDeleteImage(index)}
              className="absolute top-0 right-0 m-1 bg-white text-red-600"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  </div>
)}



            {activeStep === 2 && (
              <div>
                <h2>Modifier les documents</h2>
                <div>
                {currentDocuments.map((document, index) => (
  <div key={document.id} className="flex items-center justify-start mb-5 bg-gray-100 p-2 rounded-lg shadow">
    <a href={document.documentPath} target="_blank" rel="noopener noreferrer">
      {document.documentName}
    </a>
    <button onClick={() => handleEditDocument(document.id)} className="btn-edit"><AttachFileIcon/></button>
    <button onClick={() => handleDeleteDocument(document.id)} className="btn-delete"><DeleteIcon/></button>
  </div>
))}

                  <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4">
        <label className="flex flex-col items-center cursor-pointer">
          <AttachFileIcon className="text-color1" fontSize="large" />
          <span className="mt-2 text-color1 underline">Ajouter des documents</span>
          <span className="mt-2 text-gray-400">format : PDF, DOC, DOCX</span>
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const newDocuments = files.map(file => ({
                file,
                name: file.name
              }));
              handleDocumentsChange(newDocuments);
            }}
          />
        </label>
      </div>

      <div className="flex flex-col mt-4 gap-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg shadow">
            <Typography>{doc.name}</Typography>
            <Button onClick={() =>handleDeletedoc(index)} variant="outlined" color="error" size="small">
              Supprimer
            </Button>
          </div>
        ))}
      </div>
                </div>
              </div>
            )}
      <div className="flex justify-between mt-4">
      <Button
    color="inherit"
    disabled={activeStep === 0}
    onClick={handleBack}
  >
    Précédent
  </Button>
  <Button
    variant="contained"
    color="primary"
    onClick={handleNext}
  >
    {activeStep === steps.length + 1 ? 'Terminer' : 'Suivant'}
  </Button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">{success}</div>}
    </div>
  );
};

export default UpdateApartment;
