import React, { useState, useEffect } from "react";
import { Button, Slider, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PropertiesMarkerMap from "./PropertiesMarkerMap";
import Footer from "./Footer";
import { Slide } from "react-awesome-reveal";
import { SelectChangeEvent } from "@mui/material";
import { Apartment } from "@mui/icons-material";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Define state to hold apartment data
  const [apartments, setApartments] = useState<any[]>([]);
  const [pictures, setPictures] = useState<{ [key: number]: string[] }>({});
  const [filter, setFilter] = useState({
    floor: '',
    type: '',
    minSurface: 0,
    maxSurface: 500,
  });

  // State for unique floor and etage options
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [etageOptions, setEtageOptions] = useState<string[]>([]);

  // Fetch apartments and their pictures
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/Apartment');
        const apartmentData = response.data;
    
        // Filter apartments that are not sold
        const unsoldApartments = apartmentData.filter((apartment: any) => !apartment.sold);
        const emptyApartments = apartmentData.filter((apartment: any) => apartment.name || apartment.floor);
        
        
        setApartments(unsoldApartments);
        setApartments(emptyApartments);
       
    
    
        // Fetch pictures for each unsold apartment
        const picturePromises = unsoldApartments.map(async (apartment: any) => {
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
    
        // Extract unique floor and etage values
        const uniqueFloors: string[] = Array.from(new Set(unsoldApartments.map((apartment: any) => apartment.type)));
        const uniqueEtages: string[] = Array.from(new Set(unsoldApartments.map((apartment: any) => apartment.floor)));
    
        setFloorOptions(uniqueFloors);
        setEtageOptions(uniqueEtages);
    
      } catch (error) {
        console.error("Error fetching apartments or pictures", error);
      }
    };
    

    fetchApartments();
  }, []);

  // Handle filter changes
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setFilter(prev => ({ ...prev, minSurface: newValue[0], maxSurface: newValue[1] }));
    }
  };

  // Filter apartments based on filter criteria
  const filteredApartments = apartments.filter(apartment => {
    return (
      (filter.floor ? apartment.floor === filter.floor : true) &&
      (filter.type ? apartment.type === filter.type : true) &&
      apartment.surface >= filter.minSurface &&
      apartment.surface <= filter.maxSurface
    );
  });

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
          <div className="flex flex-col space-y-4 mb-4">
          <div className="flex flex-row justify-between items-center">
  <FormControl variant="outlined" size="small" className="w-52" >
    <InputLabel id="floor-label">Étages</InputLabel>
    <Select
      labelId="floor-label"
      name="floor"
      value={filter.floor}
      onChange={handleFilterChange}
    >
              <MenuItem value="">Tous les Étages</MenuItem>
      {etageOptions.map((floor, index) => (
        <MenuItem key={index} value={floor}>{floor}</MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl variant="outlined" size="small" className="w-52" >
   
    <InputLabel id="type-label">Nombre de Chambres</InputLabel>
    <Select
      labelId="type-label"
      name="type"
      value={filter.type}
      onChange={handleFilterChange}
    >
              <MenuItem value="">Toutes les Chambres</MenuItem>
      {floorOptions.map((type, index) => (
        <MenuItem key={index} value={type}>
          {`F${type}`}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  </div>
  <div className="mb-4">
    <span className="block text-gray-700 mb-2">Superficie</span>
    <Slider
      value={[filter.minSurface, filter.maxSurface]}
      onChange={handleSliderChange}
      valueLabelDisplay="auto"
      min={0}
      max={500}
      step={10}
      aria-labelledby="surface-slider"
    />
    <div className="flex justify-between text-gray-600 text-sm">
      <span>Min: {filter.minSurface} m²</span>
      <span>Max: {filter.maxSurface} m²</span>
    </div>
  </div>

  <Button
    variant="contained"
    onClick={() => setFilter({
      floor: "",
      type: "",
      minSurface: 0,
      maxSurface: 500,
    })}
  >
    Réinitialiser les filtres
  </Button>
</div>

          <div className="card-appartments w-[100%] flex flex-col justify-around overflow-y-scroll" style={{ maxHeight: '80vh', scrollbarWidth: "thin",
            scrollbarColor: "#2563EB transparent", }}>
            {/* List of apartments */}
            {filteredApartments.map((apartment) => (
              <Slide key={apartment.id} direction="left" className="p-4 bg-white shadow rounded-md cursor-pointer mb-4 w-100">
                <div className="" onClick={() => handleCardClick(apartment.id, apartment.propertyId)}>
                  <div className="flex flex-row items-center  w-100">
                    {/* Display first picture if available */}
                    {pictures[apartment.id]?.length > 0 ? (
                      <div className="mb-2 mr-3">
                        <img
                          src={pictures[apartment.id][0]}
                          alt={`Image de ${apartment.name}`}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="mb-2">
                        <img
                          src="/path/to/default-image.jpg"
                          alt="Pas d'image disponible"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="details flex flex-col ">
                      <span className="font-semibold">{apartment.name}</span>
                      <span className="text-sm text-gray-500">{`Type: F${apartment.type}`}</span>
                      <span className="text-sm text-gray-500">{`Étage: ${apartment.floor}`}</span>
                      <span className="text-sm text-gray-500">{`Superficie: ${apartment.surface} m²`}</span>
                    </div>
                  </div>
                </div>
              </Slide>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <Slide direction="right" className="flex-1 p-4 ">
          <PropertiesMarkerMap />
        </Slide>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
