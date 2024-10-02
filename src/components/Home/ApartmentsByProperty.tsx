import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Modal,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Slide } from "react-awesome-reveal";
import Footer from "./Footer";
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import Navbar from "./Navbar";
// Define the type for an apartment
interface Apartment {
  id: number;
  propertyId: number;
  name: string;
  type: string;
  floor: number;
  surface: number;
}

// Define the type for a property
interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  terrain: boolean;
  latitude: number;
  longitude: number;
}

// Define the type for picture data
interface PictureData {
  id: number;
  pictures: string[];
}

const ApartmentsByProperty: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [pictures, setPictures] = useState<{ [key: number]: string[] }>({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        const propertyResponse = await axios.get<Property>(`http://propelo.runasp.net/api/Property/${propertyId}`);
        setProperty(propertyResponse.data);

        const pictureResponse = await axios.get<{ picturePath: string }[]>(`http://propelo.runasp.net/api/PropertyPicture/property/${propertyResponse.data.id}`);
        setPictures({ [propertyResponse.data.id]: pictureResponse.data.map(pic => pic.picturePath) });

      } catch (error) {
        console.error("Erreur lors de la récupération des données de la propriété", error);
      }
    };

    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    const fetchApartments = async () => {
      if (!propertyId) return;

      try {
        const apartmentsResponse = await axios.get<Apartment[]>('http://propelo.runasp.net/api/Apartment');
        const allApartments = apartmentsResponse.data;

        // Filter apartments by propertyId
        const filtered = allApartments.filter((apartment) => apartment.propertyId === parseInt(propertyId));
        setApartments(filtered);

        // Fetch pictures for each apartment
        const picturePromises = filtered.map(async (apartment) => {
          const pictureResponse = await axios.get<{ picturePath: string }[]>(`http://propelo.runasp.net/api/ApartmentPicture/apartment/${apartment.id}`);
          return {
            id: apartment.id,
            pictures: pictureResponse.data.map(pic => pic.picturePath)
          };
        });

        const pictureData = await Promise.all(picturePromises);
        setPictures(prevPictures => pictureData.reduce((acc, item) => {
          acc[item.id] = item.pictures;
          return acc;
        }, { ...prevPictures }));

      } catch (error) {
        console.error("Erreur lors de la récupération des appartements ou des images", error);
      }
    };

    fetchApartments();
  }, [propertyId]);

  const handleCardClick = (apartmentId: number, propertyId: number) => {
    navigate(`/Apprtementdetail/${apartmentId}?propertyId=${propertyId}`);
  };

  const handleImageClick = (images: string[], index: number) => {
    setCurrentGalleryImages(images);
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentGalleryImages.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
  };

  return (
    <>
    <Navbar/>
    <div className="flex flex-col p-4">
      {property && (
        <div className="mb-4">
          <Typography variant="h5" gutterBottom>
          Bâtiment: {property.name}
          </Typography>
          <Typography variant="body1">{property.address}, {property.city}</Typography>
          {pictures[property.id]?.length > 0 && (
            <div className="mb-4">
              <img
                src={pictures[property.id][0]}
                alt={`Image de ${property.name}`}
                className="w-full h-48 object-cover rounded-md mb-2 cursor-pointer"
                onClick={() => handleImageClick(pictures[property.id], 0)}
              />
              <div className="grid grid-cols-3 gap-2">
                {pictures[property.id].slice(1).map((pic, index) => (
                  <img
                    key={index}
                    src={pic}
                    alt={`Image supplémentaire ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md cursor-pointer"
                    onClick={() => handleImageClick(pictures[property.id], index + 1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="card-apartments flex flex-col space-y-4 overflow-y-scroll" style={{ maxHeight: '80vh', scrollbarWidth: "thin", scrollbarColor: "#2563EB transparent" }}>
        {apartments.length === 0 ? (
          <Typography>Aucun appartement trouvé pour cette propriété.</Typography>
        ) : (
          apartments.map((apartment) => (
            <Slide direction="left" key={apartment.id} className="p-4 bg-white shadow rounded-md cursor-pointer mb-4">
              <div onClick={() => handleCardClick(apartment.id, apartment.propertyId)}>
                <div className="flex flex-row items-center justify-around w-96">
                  {pictures[apartment.id]?.length > 0 ? (
                    <div className="mb-2">
                      <img
                        src={pictures[apartment.id][0]}
                        // alt={`Images de ${apartment.name}`}
                        className="w-64 h-32 object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="mb-2">
                      <img
                        src="/path/to/default-image.jpg"
                        alt="Aucune image disponible"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="details ml-5 flex flex-col">
                    <Typography variant="h6" component="span" className="font-semibold">{apartment.name}</Typography>
                    <Typography variant="body2" component="span"> <strong> F</strong>{apartment.type} | Étage: {apartment.floor} | Surface: {apartment.surface} m²</Typography>
                  </div>
                </div>
              </div>
            </Slide>
          ))
        )}
      </div>

      {/* Modal for image gallery */}
      <Modal open={isGalleryOpen} onClose={() => setIsGalleryOpen(false)}>
        <div className="flex flex-col items-center justify-center h-full bg-black">
          <img src={currentGalleryImages[currentImageIndex]} alt={`Image de la galerie ${currentImageIndex + 1}`} className="max-w-full max-h-full" />
          <div className="flex justify-between w-full p-4 absolute top-52">
            <Button onClick={handlePrev} style={{ color: 'white' }}>
              <ArrowBack />
            </Button>
            <Button onClick={handleNext} style={{ color: 'white' }}>
              <ArrowForward />
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div></>
  );
};

export default ApartmentsByProperty;
