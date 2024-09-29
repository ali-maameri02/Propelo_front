import React, { useState } from "react";
import Breadcrumbs from "../Breadcrumbs";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Setpictures, { ImageType } from "./Setpictures";
import PropertyMap from "./PropertyMap";
import axios, { AxiosError } from 'axios';
import { useNavigate } from "react-router-dom";

const steps = [
    'Saisir les détails de la propriété',
    'Ajouter les photos',
    'Ajouter Location dans Map',
    'Confirmer la Location'
];

const AddPropertie: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set<number>());
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        floor: 0,
        constractionDate: '2020-02-02',
        endConstractionDate: '2020-05-05',
        apartmentsNumber: 0,
        description: '',
        latitude: 0,
        longitude: 0,
        terrain: true,
        propertyId: null,
    });
    const [locationData, setLocationData] = useState<any>(null);
    const [images, setImages] = useState<ImageType[]>([]);
    const [propertyId, setPropertyId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isStepSkipped = (step: number) => skipped.has(step);
    const navigate = useNavigate();

    const handleNext = async () => {
        if (activeStep === 0) {
            handleSubmitFormData()
                // .then(id => {
                //     setPropertyId(id);
                    setActiveStep(prevActiveStep => prevActiveStep + 1);
                // })
                
        } else if (activeStep === 1) {
            handleSubmitImages()
                .then(() => {
                    setActiveStep(prevActiveStep => prevActiveStep + 1);
                })
                .catch(err => {
                    console.error("Submission failed:", err);
                });
        } else if (activeStep === 2) {
            setActiveStep(prevActiveStep => prevActiveStep + 1);
        } else if (activeStep === 3) {
            const id = await fetchLastPropertyId();
setPropertyId(id);
console.log("propid", id)
            try {
                
                if (id !== null) {
                    const storedLocation = JSON.parse(localStorage.getItem('propertyLocation') || '{}');
                    if (storedLocation.latitude && storedLocation.longitude) {
                        await updatePropertyLocation(id, storedLocation);
                        await createApartments(id, formData.apartmentsNumber); // Create apartments here
                        setSuccess('Propriété mise à jour avec succès!');
                    } else {
                        console.error("Location data not found in localStorage.");
                    }
                } else {
                    console.error("Property ID is undefined.");
                }
            } catch (err) {
                console.error("Update failed:", err);
            }
            navigate(`/dashboard/properties`); // Redirect to apartments route

            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setLocationData(null);
        setFormData({
            name: '',
            address: '',
            city: '',
            state: '',
            floor:0,
            constractionDate: '2020-02-02',
            endConstractionDate: '2020-05-05',
            apartmentsNumber: 0,
            description: '',
            latitude: 0,
            longitude: 0,
            terrain: true,
            propertyId: null,
        });
        setImages([]);
        setPropertyId(null);
        setError(null);
        setSuccess(null);
        localStorage.removeItem('propertyLocation');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRadioChange = (value: boolean) => {
        setFormData({ ...formData, terrain: value });
    };

    const saveLocationData = (data: any) => {
        setLocationData(data);
        localStorage.setItem('propertyLocation', JSON.stringify(data));
    };

    // const loadLocationData = () => {
    //     const storedData = localStorage.getItem('propertyLocation');
    //     return storedData ? JSON.parse(storedData) : null;
    // };
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
      
    const handleSubmitFormData = async () => {
        const payload = {
            ...formData,
            latitude: locationData?.latitude || 0,
            longitude: locationData?.longitude || 0,
        };

        console.log("Submitting form data:", payload);

        try {
            const response = await axios.post(`${API_BASE_URL}/Property`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            console.log("Form submission response:", response);

            if (response.status === 200) {
                return response.data.id;
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(`Erreur lors de l'envoi des données: ${err.message}`);
            } else {
                setError('Une erreur inattendue est survenue.');
            }
            throw err;
        }
    };

    const fetchLastPropertyId = async (): Promise<number | null> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Property`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            console.log("Fetching last property ID response:", response);

            if (response.status === 200) {
                const properties = response.data;
                const lastProperty = properties[properties.length - 1];
                return lastProperty.id;
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(`Erreur lors de la récupération de l'ID de propriété: ${err.message}`);
            } else {
                setError('Une erreur inattendue est survenue.');
            }
            return null;
        }
    };

    const handleSubmitImages = async () => {
        const propertyId = await fetchLastPropertyId();
        if (propertyId === null) {
            setError("Property ID is not available.");
            return;
        }

        console.log("Submitting images for property ID:", propertyId);

        const formData = new FormData();
        images.forEach((image) => {
            if (image.file) {
                formData.append('Pictures', image.file, image.file.name);
            }
        });
        formData.append('PropertyId', propertyId.toString());

        try {
            const response = await axios.post(`${API_BASE_URL}/PropertyPicture`, formData, {
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

    const updatePropertyLocation = (propertyId: number, locationData: any) => {
        if (propertyId === null) {
            setError("Property ID is not available.");
            return;
        }
    
        // Complete property data with some default or existing values
        const payload = {
            id: propertyId,
            name: formData.name || "", // Provide actual values or default
            address: formData.address || "",
            city: formData.city || "",
            state: formData.state || "",
            floor : formData.floor || 0,
            latitude: locationData.latitude || 0,
            longitude: locationData.longitude || 0,
            constractionDate: formData.constractionDate || "",
            endConstractionDate: formData.endConstractionDate || "",
            apartmentsNumber: formData.apartmentsNumber || 0,
            terrain: formData.terrain || false,
            description: formData.description || ""
        };
    
        console.log('Updating property location with payload:', payload);
    
        axios.put(`${API_BASE_URL}/Property/${propertyId}`, payload, {
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
            console.log("Update property location response:", response);
            if (response.status === 200) {
                setSuccess('Location updated successfully!');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .catch(err => {
            if (err instanceof AxiosError) {
                console.error("Error response:", err.response?.data);
                setError(`Erreur lors de la mise à jour de la localisation: ${err.response?.data.message || 'Unknown error'}`);
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        });
    };
    const createApartments = async (propertyId: number, numApartments: number) => {
        const promises = [];
    
        for (let i = 0; i < numApartments; i++) {
            const apartmentData = {
                propertyId,
                // Add additional apartment fields here if necessary
            };
    
            console.log('Creating apartment with data:', apartmentData);
    
            promises.push(axios.post(`${API_BASE_URL}/Apartment`, apartmentData, {
                headers: { 'Content-Type': 'application/json' }
            }).catch(error => {
                console.error('Error creating apartment:', error);
            }));
        }
    
        try {
            await Promise.all(promises);
            console.log('All apartments created successfully.');
            setSuccess('Tous les appartements ont été créés avec succès!');
        } catch (err) {
            console.error('Error creating apartments:', err);
            setError('Erreur lors de la création des appartements.');
        }
    };

    return (
        <div className="w-full p-4">
            <Breadcrumbs />
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <div className="pt-4">
                {activeStep === 0 && (
                    <div>
                        {/* Render form for property details */}
                        <Typography variant="h6">Saisir les détails de le Bâtiment</Typography>
                        <form className="w-full mt-5 h-full flex flex-row md:flex-row justify-between">
                      <div className="group-inputs-left  flex flex-col justify-around  w-full md:w-1/2 mr-5">
                          <div className="group-input flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="name" className="mr-2 w-full">Nom</label>
                              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="city" className="mr-2 w-full">Ville</label>
                              <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="address" className="mr-2 w-full">Adresse</label>
                              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="floor" className="mr-2 w-full">Nombres Des Étages</label>
                              <input type="number" name="floor" id="floor" value={formData.floor} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-2 flex flex-col md:flex-row justify-start items-center font-almarai ">
                              <label className="mr-2 w-64">Parcking</label>
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
                         
                        
                          <div className="group-input  flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="apartmentsNumber" className="mr-2 w-full">Nombre d'apartements</label>
                              <input type="number" name="apartmentsNumber" id="apartmentsNumber" value={formData.apartmentsNumber} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="constractionDate" className="mr-2 w-full">Date de construction</label>
                              <input type="date" name="constractionDate" id="constractionDate" value={formData.constractionDate} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          <div className="group-input mt-1 flex flex-col md:flex-row items-center font-almarai">
                              <label htmlFor="endConstractionDate" className="mr-2 w-full">Date de fin de construction</label>
                              <input type="date" name="endConstractionDate" id="endConstractionDate" value={formData.endConstractionDate} onChange={handleChange} className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                         
                          <div className="group-input mt-1 flex flex-col justify-around md:flex-row items-center font-almarai">
                              <label htmlFor="description" className="mr-2 w-full">Description</label>
                              <textarea name="description" id="description" value={formData.description}   onChange={handleTextareaChange}  // Use textarea handler
 className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1" />
                          </div>
                          </div>
                  
                    
                  </form>
                    </div>
                )}
                {activeStep === 1 && (
                    <Setpictures onImagesChange={(newImages) => setImages(newImages)} />
                    )}
                {activeStep === 2 && (
 <PropertyMap 
 onLocationSave={saveLocationData} 
 locationData={locationData} 
//  disableSearch={true} 
//  disableLayerControl={false} 
//  hideLayerControl={true} 
/>           )}
                {activeStep === 3 && (
                    <div>
                        <Typography variant="h6">Confirm Location</Typography>
                        <PropertyMap 
  onLocationSave={saveLocationData} 
  locationData={locationData} 
//   disableSearch={true} 
//   disableLayerControl={false} 
//   hideLayerControl={true} 
/> 
                    </div>
                )}
                <Box  sx={{ display: 'flex', flexDirection: 'row', pt: 2 , justifyContent:'space-between' }}>
                    <Button
                        color="inherit"
                        variant="contained"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {activeStep === steps.length ? (
                        <Button onClick={handleReset}>Reset</Button>
                    ) : (
                        <Button onClick={handleNext}                         variant="contained"
                        >
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    )}
                </Box>
            </div>
        </div>
    );
};

export default AddPropertie;
