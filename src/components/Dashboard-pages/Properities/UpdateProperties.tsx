import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import { Stepper, Step, StepLabel, Breadcrumbs } from '@mui/material';
// import Setpictures from './Setpictures';
import PropertyMap from './PropertyMap';

const steps = [
  'Saisir les détails de la propriété',
  'Ajouter les photos',
  'Ajouter Location dans Map',
  'Confirmer la Location',
];

const UpdateProperties: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [currentPictures, setCurrentPictures] = useState<any[]>([]);
  const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(new Set<number>());
  const isStepSkipped = (step: number) => skipped.has(step);
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const propertyResponse = await axios.get(`${API_BASE_URL}/Property/${id}`);
          setFormData(propertyResponse.data);
  
          const imagesResponse = await axios.get(`${API_BASE_URL}/PropertyPicture/property/${id}`);
          console.log('Fetched Pictures:', imagesResponse.data); // Debugging line
          setCurrentPictures(imagesResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Erreur lors du chargement des données.');
        }
      };
  
      fetchData();
    } else {
      setError('ID de propriété manquant.');
    }
  }, [id, API_BASE_URL]);
  
  
  const handleNext = async () => {
    if (!id) return; // Ensure id is defined
    
    if (activeStep === 0) {
      await handleUpdatePropertyData();
    } 
    if (activeStep === 1) {
      // if (selectedPictureId) {
      //   await handleEditPicture(selectedPictureId);
      // } else {
      //   console.warn("No picture selected for editing.");
      // }
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 2) {
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 3) {
      await updatePropertyLocation();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
        formData.append('propertyId', id);
        formData.append('Pictures', file);
        console.log('tswurti',file)
  
        try {
          console.log('dkhlttttttt')
          const response = await axios.put(`${API_BASE_URL}/PropertyPicture/${pictureId}`, formData, {
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
  
  
  const handleUpdatePropertyData = async () => {
    if (!id) return; // Ensure id is defined
    
    const payload = {
      ...formData,
      latitude: locationData?.latitude || formData.latitude,
      longitude: locationData?.longitude || formData.longitude,
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/Property/${id}`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setActiveStep((prev) => prev + 1);
        setSuccess('Les détails de la propriété ont été mis à jour avec succès.');
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erreur lors de la mise à jour: ${err.message}`);
      }
    }
  };

  const updatePropertyLocation = async () => {
    if (!id) return; // Ensure id is defined
    
    try {
      const storedLocation = JSON.parse(localStorage.getItem("propertyLocation") || "{}");
      if (storedLocation.latitude && storedLocation.longitude) {
        await axios.put(`${API_BASE_URL}/Property/${id}`, {
          ...formData,
          latitude: storedLocation.latitude,
          longitude: storedLocation.longitude,
        });
        setSuccess("Propriété mise à jour avec succès!");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour de la location.");
    }
  };

  const saveLocationData = (data: any) => {
    setLocationData(data);
    localStorage.setItem('propertyLocation', JSON.stringify(data));
  };

  const loadLocationData = () => {
    const storedData = localStorage.getItem('propertyLocation');
    return storedData ? JSON.parse(storedData) : null;
  };

  const handleRadioChange = (value: boolean) => {
    setFormData({ ...formData, terrain: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-4">
      <Breadcrumbs />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label} completed={isStepSkipped(label as unknown as number)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <div>
          <Typography variant="h6">Modifier les détails de la propriété</Typography>
          <form className="w-[70vw] ml-5 mt-5 h-full flex flex-row justify-between">
                      <div className="group-inputs-left  flex flex-col justify-around  w-full md:w-1/2 mr-5">
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="name" className="mr-2 w-36">Nom</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="city" className="mr-2 w-36">Ville</label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="address" className="mr-2 w-36">Adresse</label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="floor" className="mr-2 w-36">Étages</label>
          <input
            type="number"
            name="floor"
            id="floor"
            value={formData.floor}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="state" className="mr-2 w-36">Wilaya</label>
          <input
            type="text"
            name="state"
            id="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label className="mr-2 w-36">Parcking</label>
          <div className="flex items-center">
            <label className="mr-4">
              <input
                type="radio"
                name="terrain"
                value="true"
                checked={formData.terrain === true}
                onChange={() => handleRadioChange(true)}
              />
              Oui
            </label>
            <label>
              <input
                type="radio"
                name="terrain"
                value="false"
                checked={formData.terrain === false}
                onChange={() => handleRadioChange(false)}
              />
              Non
            </label>
          </div>
        </div>
      </div>

                          <div className="group-inputs-left  flex flex-col justify-around  w-full md:w-1/2 mr-5">
      
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="apartmentsNumber" className="mr-2 w-36">Nombre d'appartements</label>
          <input
            type="number"
            name="apartmentsNumber"
            id="apartmentsNumber"
            value={formData.apartmentsNumber}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
  <label htmlFor="constructionDate" className="mr-2 w-36">Date de construction</label>
  <input
    type="date"
    name="constractionDate"
    id="constractionDate"
    value={formData.constractionDate}
    onChange={handleDateChange} // Use the new date change function
    className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
  />
</div>
<div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
  <label htmlFor="endConstractionDate" className="mr-2 w-36">Date de fin de construction</label>
  <input
    type="date"
    name="endConstractionDate"
    id="endConstractionDate"
    value={formData.endConstractionDate}
    onChange={handleDateChange} // Use the new date change function
    className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
  />
</div>

        <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="description" className="mr-2 w-36">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleTextareaChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
    
      </div>
    </form>
        </div>
      )}

{activeStep === 1 && (
  <div>
    <Typography variant="h6">Ajouter ou Modifier les photos</Typography>
    <div className="flex flex-wrap">
    {currentPictures.map((picture: any) => (
  <div key={picture.Id} className="relative m-2">
    <img src={picture.picturePath} alt={`Property Image ${picture.id}`} className="w-40 h-40 object-cover" />
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
      {activeStep === 2 && <PropertyMap onLocationSave={saveLocationData} locationData={loadLocationData()} />}
      {activeStep === 3 && <Typography variant="h6">Confirmer la Location</Typography>}

      <div className="mt-4 w-full flex flex-row justify-between items-center">
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

      {error && <div className="error-message text-red-500 mt-4">{error}</div>}
      {success && <div className="success-message text-green-500 mt-4">{success}</div>}
    </div>
  );
};

export default UpdateProperties;
