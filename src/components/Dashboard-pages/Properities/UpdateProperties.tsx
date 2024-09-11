import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Setpictures, { ImageType } from "./Setpictures";
import PropertyMap from "./PropertyMap";
import Breadcrumbs from "../Breadcrumbs";

const steps = [
  "Saisir les détails de la propriété",
  "Ajouter les photos",
  "Ajouter Location dans Map",
  "Confirmer la Location",
];

const UpdateProperties: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [formData, setFormData] = useState<any>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isStepSkipped = (step: number) => skipped.has(step);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Property/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };
    fetchProperty();
  }, [id, API_BASE_URL]);

  const handleNext = async () => {
    if (activeStep === 0) {
      handleUpdatePropertyData();
    } else if (activeStep === 1) {
      handleSubmitImages();
      setActiveStep((prev) => prev + 1);

    } else if (activeStep === 2) {
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 3) {
      updatePropertyLocation();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const saveLocationData = (data: any) => {
    setLocationData(data);
    localStorage.setItem("propertyLocation", JSON.stringify(data));
  };

  const loadLocationData = () => {
    const storedData = localStorage.getItem("propertyLocation");
    return storedData ? JSON.parse(storedData) : null;
  };

  const handleUpdatePropertyData = async () => {
    const payload = {
      ...formData,
      latitude: locationData?.latitude || formData.latitude,
      longitude: locationData?.longitude || formData.longitude,
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/Property/${id}`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setActiveStep((prev) => prev + 1);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erreur lors de la mise à jour: ${err.message}`);
      }
    }
  };

  const handleSubmitImages = async () => {
    const formData = new FormData();
  
    // Add property picture Id to form data
    formData.append("Id", id!);  // Ensure 'id' is defined
  
    // Add images to form data
    images.forEach((image) => {
      if (image.file) {
        formData.append("Pictures", image.file, image.file.name);
      } else {
        console.warn("No file found for one of the images:", image);
      }
    });
  
    // Add PropertyId to form data
    formData.append("PropertyId", id!);
  
    try {
      const response = await axios.put(`${API_BASE_URL}/PropertyPicture/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console
      if (response.status === 200) {
        setActiveStep((prev) => prev + 1);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Erreur lors de l'envoi des images: ${err.response?.data.errors.file[0]}`);
      }
    }
  };
  
  
  const updatePropertyLocation = async () => {
    if (id !== null) {
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
    }
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
      <div className="group-inputs-left flex flex-col justify-around space-y-4 w-full md:w-1/2 mr-5">
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
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
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
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
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
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="state" className="mr-2 w-36">État</label>
          <input
            type="text"
            name="state"
            id="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
      </div>

      <div className="group-inputs-right flex flex-col justify-around space-y-4 w-full md:w-1/2 mr-5">
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="description" className="mr-2 w-36">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleTextareaChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
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
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="constructionDate" className="mr-2 w-36">Date de construction</label>
          <input
            type="date"
            name="constructionDate"
            id="constructionDate"
            value={formData.constructionDate}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label htmlFor="endConstructionDate" className="mr-2 w-36">Date de fin de construction</label>
          <input
            type="date"
            name="endConstructionDate"
            id="endConstructionDate"
            value={formData.endConstructionDate}
            onChange={handleChange}
            className="w-full border-2 rounded-lg border-gray-300 p-2 focus:outline-none focus:border-text-color1"
          />
        </div>
        <div className="group-input flex flex-col md:flex-row items-center font-almarai">
          <label className="mr-2 w-36">Terrain</label>
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
    </form>
        </div>
      )}

      {activeStep === 1 && <Setpictures onImagesChange={setImages} />}
      {activeStep === 2 && <PropertyMap onLocationSave={saveLocationData} locationData={loadLocationData()} />}
      {activeStep === 3 && <Typography variant="h6">Confirmer la Location</Typography>}

      <div className="mt-4">
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
