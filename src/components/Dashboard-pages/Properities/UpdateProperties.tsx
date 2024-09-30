import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { Stepper, Step, StepLabel, Breadcrumbs, Button, IconButton } from '@mui/material';
// import Setpictures from './Setpictures';
import PropertyMap from './PropertyMap';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/PhotoCameraOutlined';
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
  const [images, setImages] = useState<ImageWithPreview[]>([]);

  const [skipped, setSkipped] = useState(new Set<number>());
  const isStepSkipped = (step: number) => skipped.has(step);
  const navigate = useNavigate();
  type ImageWithPreview = {
    file: File;
    preview: string;
  };
  
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
      try {
        await handleSubmitImages(); // Submit images if available
      } catch (error) {
        console.error('Failed to submit images:', error);
        setError('Failed to submit images.');
      }
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 2) {
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 3) {
      await updatePropertyLocation();
      navigate(`/dashboard/properties`); // Redirect to apartments route

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
          // console.log('dkhlttttttt')
          const response = await axios.put(`${API_BASE_URL}/PropertyPicture/${pictureId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  // console.log('khrjt b charaf')
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
  
  const handleImagesChange = (newImages: ImageWithPreview[]) => {
    setImages((prevImages) => [...prevImages, ...newImages]); // Append new images
  };
  
  const handleDeletePicture = async (pictureId: number) => {
    try {
      // Make sure the id is valid and the request is correct
      await axios.delete(`${API_BASE_URL}/PropertyPicture/${pictureId}`);
      
      // Update currentPictures state after successful deletion
      setCurrentPictures((prevPictures) => prevPictures.filter(picture => picture.id !== pictureId));
  
      console.log('Picture deleted successfully');
    } catch (error) {
      console.error('Error deleting picture:', error);
      // Optionally display an error message to the user
    }
  };
  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // const handleAddNewPicture = async () => {
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/*';
  //   input.multiple = true;
  
  //   input.onchange = async (event: Event) => {
  //     const target = event.target as HTMLInputElement;
  //     const files = target.files;
  
  //     if (files && files.length > 0) {
  //       const newImages: ImageWithPreview[] = Array.from(files).map((file) => ({
  //         file,
  //         preview: URL.createObjectURL(file),
  //       }));
  
  //       handleImagesChange(newImages); // Append new images
  
  //       // Confirm before uploading
  //       if (window.confirm("Voulez-vous envoyer ces images ?")) {
  //         const formData = new FormData();
          
  //         newImages.forEach((image) => {
  //           formData.append('Pictures', image.file);
  //         });
  
  //         if (id) {
  //           formData.append('propertyId', id);
  //         } else {
  //           console.error("Property ID is undefined.");
  //           setError("ID de propriété manquant.");
  //           return;
  //         }
  
  //         try {
  //           const response = await axios.post(`${API_BASE_URL}/PropertyPicture`, formData, {
  //             headers: {
  //               'Content-Type': 'multipart/form-data',
  //             },
  //           });
  
  //           if (response.status === 200) {
  //             setCurrentPictures((prev) => [...prev, ...response.data]); // Update pictures
  //             setSuccess('Les images ont été ajoutées avec succès.');
  //             setImages([]); // Clear previews after successful upload
  //           } else {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //           }
  //         } catch (err) {
  //           if (err instanceof Error) {
  //             setError(`Erreur lors de l'ajout de l'image: ${err.message}`);
  //           }
  //         }
  //       }
  //     }
  //   };
  
  //   input.click();
  // };
  const handleSubmitImages = async () => {
    if (!id) return;
    const formData = new FormData();
    images.forEach((image) => {
      if (image.file) {
        formData.append('Pictures', image.file, image.file.name);
      }
    });
    formData.append('propertyId', id);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/PropertyPicture`, formData, {
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
          <Typography variant="h6">Modifier les détails de la Bâtiments</Typography>
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
     <h2>Modifier les photos</h2>
      <div className="flex flex-row justify-between gap-4">
        {currentPictures.map((picture) => (
          <div key={picture.id} className='flex flex-col flex-wrap w-100'>
            <img
              src={picture.picturePath}
              alt="Appartement"
              className="h-52 w-72 rounded-lg shadow-lg object-cover"
            />
            <div className='w-5 flex flex-row'>
              <IconButton onClick={() => handleDeletePicture(picture.id)}>
                <DeleteIcon />
              </IconButton>
              <Button onClick={() => handleEditPicture(picture.id)}>
                <EditIcon />
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
                const newImages: ImageWithPreview[] = files.map((file) => ({
                  file,
                  preview: URL.createObjectURL(file),
                }));
                handleImagesChange(newImages);
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

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
