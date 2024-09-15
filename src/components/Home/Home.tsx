import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PropertiesMarkerMap from "./PropertiesMarkerMap";
import Footer from "./Footer";
import { Slide } from "react-awesome-reveal";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Define state to hold apartment data
  const [apartments, setApartments] = useState<any[]>([]);
  const [pictures, setPictures] = useState<{ [key: number]: string[] }>({});
  const [locationData, setLocationData] = useState<any>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/Apartment');
        setApartments(response.data);

        // Fetch pictures for each apartment
        const picturePromises = response.data.map(async (apartment: any) => {
          const pictureResponse = await axios.get(`http://propelo.runasp.net/api/ApartmentPicture/apartment/${apartment.id}`);
          return {
            id: apartment.id,
            pictures: pictureResponse.data.map((pic: any) => pic.picturePath)
          };
        });

        const pictureData = await Promise.all(picturePromises);
        setPictures(pictureData.reduce((acc: any, item: any) => {
          acc[item.id] = item.pictures;
          return acc;
        }, {}));

      } catch (error) {
        console.error("Error fetching apartments or pictures", error);
      }
    };

    fetchApartments();
  }, []);

  const handleCardClick = (apartmentId: number, propertyId: number) => {
    navigate(`/Apprtementdetail/${apartmentId}?propertyId=${propertyId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 p-4">
        {/* Left Panel */}
        <div className="flex flex-col w-1/3 space-y-4">
          {/* Filters */}
          <div className="flex space-x-2 mb-4">
            <Button variant="outlined">Filters</Button>
            <Button variant="contained">f</Button>
            <Button variant="contained">v</Button>
            <Button variant="contained">etage</Button>
          </div>
          <div className="card-appartments w-[100%] flex flex-col justify-around  overflow-y-scroll" style={{maxHeight:'80vh',  scrollbarWidth: "thin",
            scrollbarColor: "#2563EB transparent",
            // '&::-webkit-scrollbar': {
            //   width: '12px',
            // },
            // '&::-webkit-scrollbar-track': {
            //   background: 'blue',
            // },
            // '&::-webkit-scrollbar-thumb': {
            //   background: '#888',
            //   borderRadius: '6px',
            // },
            // '&::-webkit-scrollbar-thumb:hover': {
            //   background: '#555',
            
            }}>

          {/* List of apartments */}
          {apartments.map((apartment) => (
            <Slide direction="left" className="p-4 bg-white shadow rounded-md cursor-pointer mb-4">
            <div
              key={apartment.id}  // Use the unique apartment ID for the key
              className=""
              onClick={() => handleCardClick(apartment.id, apartment.propertyId)}             >
              <div className="flex flex-row items-center justify-around w-100">
                {/* Display first picture if available */}
                {pictures[apartment.id]?.length > 0 ? (
                  <div className="mb-2">
                    <img
                      // Display the first image for the apartment
                      src={pictures[apartment.id][0]}  
                      alt={`Picture of ${apartment.name}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="mb-2">
                    <img
                      // Fallback in case there is no image
                      src="/path/to/default-image.jpg"
                      alt="No picture available"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="details flex flex-col ">
                <span className="font-semibold">{apartment.name}</span>
                <span className="text-sm text-gray-500">{`Type: ${apartment.type}`}</span>
                <span className="text-sm text-gray-500">{`Floor: ${apartment.floor}`}</span>
                <span className="text-sm text-gray-500">{`Surface: ${apartment.surface} sqm`}</span>
                {/* <span className="text-sm text-gray-400">{`Description: ${apartment.description}`}</span> */}
                </div>
              </div>
            </div>
            </Slide>
          ))}
        </div>
        </div>
        {/* Map Container */}
        <Slide direction="right" className="flex-1 p-4">
        <PropertiesMarkerMap />

        </Slide>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
