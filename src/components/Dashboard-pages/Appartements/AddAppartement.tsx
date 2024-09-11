import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField'; // Import TextField here
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem if used
import Setpictures, { ImageType } from '../Properities/Setpictures';
import Documents, { DocumentType } from './Documents';
import { fetchLastApartmentId, uploadDocument, fetchProperties } from '../utils/apiUtils';
import axios, { AxiosError } from 'axios';
import { Grid } from '@mui/material';

const steps = [
  "Saisir Les Détails De L'Appartement",
  "Ajouter Documents",
  "Ajouter les photos",
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

const AddAppartement: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [pieces, setPieces] = useState<number[]>([1]);
  const [pieceNames, setPieceNames] = useState<string[]>(["Pièce 1"]);
  const [selectedF, setSelectedF] = useState<PieceType>("F1");
  const [images, setImages] = useState<ImageType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const [apartmentId, setApartmentId] = useState<number | null>(null);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
 

  // Form input state
  const [apartmentName, setApartmentName] = useState("");
  const [apartmentSurface, setApartmentSurface] = useState("");
  const [apartmentDescription, setApartmentDescription] = useState("");
  const [apartmentFloor, setApartmentFloor] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const loadProperties = async () => {
      const fetchedProperties = await fetchProperties();
      setProperties(fetchedProperties);
    };

    loadProperties();
  }, [selectedF]);

  useEffect(() => {
    if (apartmentId !== null && activeStep === 0) {
      handlePieceSubmission();
    }
  }, [apartmentId, activeStep]);

  const isStepSkipped = (step: number) => skipped.has(step);

  const handleNext = async () => {
    if (activeStep === 0) {
      try {
        const response = await axios.post("http://propelo.runasp.net/api/Apartment", {
          name: apartmentName,
          type: getNumericType(selectedF),
          floor: parseInt(apartmentFloor, 10),
          surface: parseFloat(apartmentSurface),
          description: apartmentDescription,
          propertyId: parseInt(propertyId, 10),
        });

        if (response.status === 200 || response.status === 201) {
          const id = await fetchLastApartmentId();
          if (id !== null) {
            setApartmentId(id);
          } else {
            throw new Error("Failed to fetch apartment ID.");
          }
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to create apartment:", error);
        setError('Failed to create apartment.');
        return;
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    if (activeStep === 1) {
      handleSubmitDocuments()
        .then(() => {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
        })
        .catch(err => {
          console.error("Document submission failed:", err);
          setError('Document submission failed.');
        });
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

    }

    if (activeStep === 2) {
      if (apartmentId === null) {
        console.error("Apartment ID is not available.");
        setError('Apartment ID is not available.');
        return;
      }
      try {
        await handleSubmitImages();
      } catch (error) {
        console.error("Failed to submit pieces:", error);
        setError('Failed to submit pieces.');
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);

    }

  };

  const handlePieceSubmission = async () => {
    if (apartmentId === null) {
      console.error("Apartment ID is not available.");
      setError('Apartment ID is not available.');
      return;
    }

    try {
      const requests = pieces.map(async (pieceSurface, index) => {
        const pieceName = pieceNames[index] || `Piece ${index + 1}`;
        const pieceDescription = `Surface for ${pieceName}`;

        const response = await axios.post(`${API_BASE_URL}/Area`, {
          name: pieceName,
          surface: pieceSurface,
          description: pieceDescription,
          apartmentId: apartmentId,
        });

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Failed to submit ${pieceName}: Status ${response.status}`);
        }
      });

      await Promise.all(requests);
      console.log("All pieces submitted successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(`Erreur lors de l'envoi des pièces: ${error.response?.data.message || error.message}`);
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleFChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValue = event.target.value as PieceType;
    setSelectedF(selectedValue);
    setPieces(piecesOptions[selectedValue] || []);
  };

  const handleAddPiece = () => {
    setPieces((prevPieces) => [...prevPieces, prevPieces.length + 1]);
    setPieceNames((prevNames) => [...prevNames, `Pièce ${pieces.length + 1}`]);
  };

  const handleRemovePiece = (index: number) => {
    setPieces((prevPieces) => prevPieces.filter((_, i) => i !== index));
    setPieceNames((prevNames) => prevNames.filter((_, i) => i !== index));
  };
  const handleImagesChange = (newImages: ImageType[]) => {
    setImages(newImages);
  };

  const handleDocumentsChange = (newDocuments: DocumentType[]) => {
    setDocuments(newDocuments);
  };
//   const handleImagesChange = (newImages: ImageType[]) => {
//     setImages(newImages);
//   };

const handleSubmitDocuments = async () => {
    const apartmentId = await fetchLastApartmentId();
    if (apartmentId === null) {
        setError("apprtementid  is not available.");
        return;
    }

    console.log("Submitting documents for apprtement ID:", apartmentId);

    const formData = new FormData();
    documents.forEach((document) => {
        if (document.file) {
            formData.append('Documents', document.file, document.file.name);
        }
    });
    formData.append('apartmentId', apartmentId.toString());

    try {
        const response = await axios.post(`${API_BASE_URL}/ApartmentDocument`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Document submission response:", response);

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
const handleSubmitImages = async () => {
    const apartmentId = await fetchLastApartmentId();
    if (apartmentId === null) {
        setError("Property ID is not available.");
        return;
    }

    console.log("Submitting images for property ID:", apartmentId);

    const formData = new FormData();
    images.forEach((image) => {
        if (image.file) {
            formData.append('Pictures', image.file, image.file.name);
        }
    });
    formData.append('apartmentId', apartmentId.toString());

    try {
        const response = await axios.post(`${API_BASE_URL}/ApartmentPicture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Image submission response:", response);

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

  return (
    <Box sx={{ width: '100%' }}>
      <Breadcrumbs />
      <Typography variant="h4" gutterBottom>
        Ajouter un Appartement
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success">{success}</Typography>}
        <div>
          {activeStep === 0 && (
      <form className="w-[70vw] ml-5 mt-5 h-full flex flex-row justify-between">
      {/* Left Group */}
      <div className="group-inputs-left flex flex-col justify-around space-y-4 w-full md:w-1/2 mr-5">
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="apartmentName" className="mr-2 w-36">Nom de l'appartement</label>
          <input
            type="text"
            name="apartmentName"
            id="apartmentName"
            value={apartmentName}
            onChange={(e) => setApartmentName(e.target.value)}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="apartmentSurface" className="mr-2 w-36">Surface (m²)</label>
          <input
            type="number"
            name="apartmentSurface"
            id="apartmentSurface"
            value={apartmentSurface}
            onChange={(e) => setApartmentSurface(e.target.value)}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="description" className="mr-2 w-36">Description</label>
          <textarea
            name="description"
            id="description"
            value={apartmentDescription}
            onChange={(e) => setApartmentDescription(e.target.value)}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
            rows={4}
          />
        </div>
      </div>
    
      {/* Right Group */}
      <div className="group-inputs-right flex flex-col justify-around space-y-4 w-full md:w-1/2 mr-5">
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="apartmentFloor" className="mr-2 w-36">Étage</label>
          <input
            type="number"
            name="apartmentFloor"
            id="apartmentFloor"
            value={apartmentFloor}
            onChange={(e) => setApartmentFloor(e.target.value)}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="propertyId" className="mr-2 w-36">Propriété</label>
          <select
            name="propertyId"
            id="propertyId"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="selectedF" className="mr-2 w-36">Type de pièce</label>
          <select
            name="selectedF"
            id="selectedF"
            value={selectedF}
            onChange={handleFChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          >
            {Object.keys(piecesOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
    
        {pieces.map((_, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="text"
              name={`pieceName${index + 1}`}
              value={pieceNames[index] || ""}
              onChange={(e) => {
                const newNames = [...pieceNames];
                newNames[index] = e.target.value;
                setPieceNames(newNames);
              }}
              className="w-full border-2 rounded-lg border-gray-300 p-2 mr-2"
              placeholder={`Nom de la pièce ${index + 1}`}
            />
            <input
              type="number"
              name={`pieceSurface${index + 1}`}
              value={pieces[index]}
              onChange={(e) => {
                const newPieces = [...pieces];
                newPieces[index] = parseInt(e.target.value, 10);
                setPieces(newPieces);
              }}
              className="w-full border-2 rounded-lg border-gray-300 p-2 mr-2"
              placeholder={`Surface de la pièce ${index + 1}`}
            />
            <button
              type="button"
              className="text-white bg-red-600 p-2 rounded-lg"
              onClick={() => handleRemovePiece(index)}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" className="text-white bg-blue-600 p-2 rounded-lg w-1/2" onClick={handleAddPiece}>
          Ajouter une pièce
        </button>
        </div>
    
      {/* Pieces Section */}
     
    </form>
    
     
          )}
          {activeStep === 1 && (
                  <Documents onDocumentsChange={handleDocumentsChange} />

          )}
          {activeStep === 2 && (
            <Setpictures onImagesChange={handleImagesChange} />
          )}
        </div>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ mr: 1 }}
          >
            Retour
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleReset} sx={{ mr: 1 }}>
            Réinitialiser
          </Button>
          <Button onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </Box>
      </div>
    </Box>
  );
};

export default AddAppartement;
