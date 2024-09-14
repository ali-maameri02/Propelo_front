import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { fetchProperties } from '../utils/apiUtils';

const steps = [
  'Saisir les détails de l\'appartement',
  'Modifier les photos',
  'Modifier les documents',
];

const UpdateApartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [apartmentData, setApartmentData] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [currentPictures, setCurrentPictures] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [currentDocuments, setCurrentDocuments] = useState<any[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const isStepSkipped = (step: number) => skipped.has(step);
useEffect(()=>
{
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

          const areasResponse = await axios.get(`${API_BASE_URL}/Apartment/areas/${id}`);
          setAreas(areasResponse.data);
          console.log(areasResponse.data);

          const imagesResponse = await axios.get(`${API_BASE_URL}/ApartmentPicture/apartment/${id}`);
          console.log('Fetched Pictures:', imagesResponse.data); // Debugging line
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
    if (!id) return;

    if (activeStep === 0) {
      await handleUpdateApartmentData();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleUpdateApartmentData = async () => {
    if (!id) return;

    const payload = {
      ...apartmentData,
    };

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
        if (areas.length === 0) {
          // Create new areas if none exist
          const createPromises = areas.map((area) =>
            axios.post(`${API_BASE_URL}/Apartment/areas`, { ...area, apartmentId: id }, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
          );
          await Promise.all(createPromises);
        } else {
          // Update existing areas
          const updatePromises = areas.map((area) =>
            axios.put(`${API_BASE_URL}/Area/${area.id}`, area, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
          );
          await Promise.all(updatePromises);
        }

        setActiveStep((prev) => prev + 1);
        setSuccess('L\'appartement a été mis à jour avec succès.');
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      setError(`Erreur lors de la mise à jour: ${err}`);
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
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApartmentData({ ...apartmentData, [name]: value });
  };
  const handleEditPicture = async (pictureId: number) => {
    if (!id) {
      console.error('Property ID is undefined.');

      return;
    }
    if (pictureId === undefined) {
      console.log('ana howa',pictureId)
      console.error('pictureId is undefined.');
      return;
    }
  console.log('deuxieme fois ya zbi',pictureId)
    // Create file input dialog and handle file selection
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
        console.log(pictureId)
        formData.append('ApartmentId', id);
        formData.append('Pictures', file);
        console.log('tswurti',file)
  
        try {
          console.log('dkhlttttttt')
          const response = await axios.put(`${API_BASE_URL}/ApartmentPicture/${pictureId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  console.log('khrjt b charaf')
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
  const handleAreaChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedAreas = [...areas];
    updatedAreas[index][e.target.name] = e.target.value;
    setAreas(updatedAreas);
  };

  const handleModifyArea = async (areaId: string, updatedArea: any) => {
    try {
      await axios.put(`${API_BASE_URL}/Area/${areaId}`, updatedArea, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      setSuccess('Pièce mise à jour avec succès.');
    } catch (error) {
      setError('Erreur lors de la mise à jour de la pièce.');
    }
  };
  const handleEditDocument = async (documentId: number) => {
    if (!id) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*'; // Accept all file types
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
          <Typography variant="h6">Modifier les détails de l'apartement</Typography>

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
            name="apartmentFloor"
            id="apartmentFloor"
            value={apartmentData.floor}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        
        </div>
        <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="propertyId" className="mr-2 w-36">Propriété</label>
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
            <div className="group-input flex flex-col md:flex-row items-center font-almarai">
              <label htmlFor="description" className="mr-2 w-36">Description</label>
              <textarea
                name="description"
                id="description"
                value={apartmentData.description}
                onChange={handleTextareaChange}
                className="w-full border-2 border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          {/* Right Group */}
          <div className="group-inputs-right flex flex-col justify-around space-y-4 w-full md:w-1/ items-center">
            {/* Displaying and updating areas */}
            {areas.map((area, index) => (
              <div key={area.id} className="group-input flex flex-row  w-full justify-between md:flex-row md:w-full items-center font-almarai">
                        <div className="group-input flex flex-col md:flex-col w-full items-center font-almarai ml-2">

                <label htmlFor={`area-name-${index}`} className="mr-2 w-full">
                 Nom de piéce
                </label>
                <input
                  type="text"
                  name="name"
                  id={`area-name-${index}`}
                  value={area.name}
                  onChange={(e) => handleAreaChange(index, e)}
                  className="w-full border-2 border-gray-300 p-2 rounded"
                /></div>
                                        <div className="group-input flex flex-col md:flex-col w-full items-center font-almarai ml-2">

                <label htmlFor={`area-surface-${index}`} className="mr-2 w-36">Surface (m²)</label>
                <input
                  type="number"
                  name="surface"
                  id={`area-surface-${index}`}
                  value={area.surface}
                  onChange={(e) => handleAreaChange(index, e)}
                  className="w-full border-2 border-gray-300 p-2 rounded"
                /></div>
                                        <div className="group-input flex flex-col md:flex-col w-full items-center font-almarai ml-2">

                <label htmlFor={`area-description-${index}`} className="mr-2 w-36">Description</label>
                <input
                  type="text"
                  name="description"
                  id={`area-description-${index}`}
                  value={area.description}
                  onChange={(e) => handleAreaChange(index, e)}
                  className="w-full border-2 border-gray-300 p-2 rounded"
                /></div>
                                                        <div className="group-input flex flex-col md:flex-col w-full items-center font-almarai mt-6 ">

                <Button
                  variant="outlined"
                  className=' '
                  color="info"
                  onClick={() => handleModifyArea(area.id, area)}
                >
                  Modifier
                </Button></div>
              </div>
            ))}
          </div>
        </form></div>
      )}
      {activeStep === 1 && (
  <div>
    <Typography variant="h6">Ajouter ou Modifier les photos</Typography>
    <div className="flex flex-wrap">
    {currentPictures.map((picture: any) => (
  <div key={picture.Id} className="relative m-2">
    <img src={picture.picturePath} alt={`Appartemnt Image ${picture.id}`} className="w-40 h-40 object-cover" />
    <button
      onClick={() => {
        console.log(`Clicked picture ID: ${picture.id}`); // Debugging line
        setSelectedPictureId(picture.id);
        console.log('tklikit',)
        handleEditPicture(picture.id);
        console.log(picture.id)
      }} // Set selected picture ID
      className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded"
    >
      Modifier
    </button>
  </div>
))}

    </div>
    
  </div>
)}
 {activeStep === 2 && (
        <div className="documents-section p-4">
          <Typography variant="h6">Documents</Typography>
          {currentDocuments.map(document => (
            <div key={document.id} className="document-item flex items-center space-x-2">
             <Button variant='contained' sx={{display:'flex', flexDirection:'row',justifyContent:'space-around'}}  className='flex flex-row justify-between w-1/2'>  
               <VisibilityIcon />        
              <a href={document.documentPath} target="_blank" rel="noopener noreferrer">{document.documentName}</a>
</Button>
              <Button variant='outlined' onClick={() =>{  console.log(`${document.id}`) ;
              setSelectedDocumentId(document.id)
               handleEditDocument(document.id) }
            
              }>Modifier</Button>
            </div>
          ))}
        </div>
      )}
   <div className=" flex flex-row justify-between">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className="mr-2 bg-gray-300 text-white py-2 px-4 rounded"
        >
          Précédent
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          {activeStep === steps.length - 1 ? "Terminer" : "Suivant"}
        </button>
      </div>


      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
};

export default UpdateApartment;
