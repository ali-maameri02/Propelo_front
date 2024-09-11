import React, { useState, useEffect } from 'react';
import { TextField, Button, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Getpictures from './Getpictures';
import Navbar from './Navbar';
import PropertyMap from '../Dashboard-pages/Properities/PropertyMap';
import Footer from './Footer';
import { Slide } from 'react-awesome-reveal';
import satelliteThumbnail from '../../assets/satellite-thumbnail.jpg';
import { styled } from '@mui/material/styles';

const AvatarContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
  padding: '1rem',
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 4px rgba(174, 174, 174, 0.25)',
  position: 'sticky',
  top: '1rem',
  zIndex: 10,
});

const DetailsContainer = styled('div')({
  padding: '1.5rem',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  marginBottom: '1rem',
});

const AppartementDetails: React.FC = () => {
  const { apartmentId } = useParams(); // Get the ID from the URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [promoter, setPromoter] = useState<any>(null);
  const [promoterPicture, setPromoterPicture] = useState<string>(""); 
  const [alertVisible, setAlertVisible] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    // picture: imageavatar,
  });
  const [apartment, setApartment] = useState<any>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [rooms, setRooms] = useState<{ name: string; surface: number }[]>([]); // State to hold room details (name and surface)
  const [documents, setDocuments] = useState<{ documentName: string; documentPath: string }[]>([]);
      const [locationData, setLocationData] = useState<any>(null); // Location data for the map
  useEffect(() => {
    const fetchPromoterData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Promoter/1`);
        const promoter = response.data;
        setPromoter(promoter);

        // Set form data with promoter details
        setFormData({
          firstName: promoter.firstName,
          lastName: promoter.lastName,
          phoneNumber: promoter.phoneNumber,
          email: promoter.email,
          address: promoter.address,
        });

        // Fetch promoter picture data
        fetchPromoterPictureData(promoter.promoterId);
      } catch (error) {
        console.error('Error fetching promoter data:', error);
        setAlertVisible(true);
      }
    };
   
    fetchPromoterData();
  }, []);
  const fetchPromoterPictureData = async (promoterId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PromoterPicture/22`);
      const promoterPictureData = response.data;

      if (promoterPictureData.picturePath) {
        setPromoterPicture(promoterPictureData.picturePath);
      } else {
        // Fallback image if needed
        setPromoterPicture("/static/images/avatar/1.jpg");
      }
    } catch (error) {
      console.error('Error fetching promoter picture:', error);
      setAlertVisible(true);
    }
  };
  useEffect(() => {
    const fetchApartmentDetails = async () => {
      try {
        // Fetch apartment details by ID
        const apartmentResponse = await axios.get(`http://propelo.runasp.net/api/Apartment/${apartmentId}`);
        setApartment(apartmentResponse.data);

        // Fetch pictures for the apartment
        const picturesResponse = await axios.get(`http://propelo.runasp.net/api/ApartmentPicture/apartment/${apartmentId}`);
        const picturePaths = picturesResponse.data.map((pic: any) => pic.picturePath);
        setPictures(picturePaths);

        // Fetch areas/rooms for the apartment
        const areasResponse = await axios.get(`http://propelo.runasp.net/api/Apartment/areas/${apartmentId}`);
        const fetchedRooms = areasResponse.data;

        // Append new room data (name and surface) to the rooms state
        setDocuments((prevRooms) => [
          
          ...fetchedRooms.map((room: any) => ({
            name: room.name, // Extract name from room data
            surface: room.surface, // Extract surface from room data
          })),
        ]);
        const documentsResponse = await axios.get(`http://propelo.runasp.net/api/ApartmentDocument/apartment/${apartmentId}`);
        const fetcheddocuments = documentsResponse.data;
       console.log('fetcheddocuments',fetcheddocuments)
        // Append new room data (name and surface) to the rooms state
        setDocuments((prevDocuments) => [
          
          ...fetcheddocuments.map((document: any) => ({
            documentName: document.documentName, // Extract name from room data
            documentPath: document.documentPath, // Extract surface from room data
          })),
        ]);

        console.log('Updated Rooms:', rooms);
      } catch (error) {
        console.error('Error fetching apartment details or pictures', error);
      }
    };

    fetchApartmentDetails();
  }, [apartmentId]);

  // Handle location saving (for the map)
  const handleLocationSave = (data: { lat: number; lng: number }) => {
    console.log('Location saved:', data);
  };

  if (!apartment) {
    return <div>Loading...</div>;
  }
  const handleDownload = (documentPath: string) => {
    const link = document.createElement('a');
    link.href = documentPath; // Assuming documentPath is a URL to the file
    link.download = documentPath.split('/').pop() || 'document'; // Extract filename from URL
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="Pictures mt-1 w-full p-3">
        <h1 className="font-almarai text-black text-[2rem]">Pictures</h1>
        <Getpictures images={pictures.map((url) => ({ url }))} /> {/* Use fetched pictures */}
      </div>
      <div className="contentdetails relative flex flex-col lg:flex-row-reverse lg:justify-between p-2">
           <Slide direction='right' className="lg:w-1/3 p-2">
            <div className="sticky top-0">
            <AvatarContainer className='flex flex-col items-start justify-evenly'>
              <div className="promoter-details flex flex-row  mb-5"> 
                <Avatar alt={promoter?.firstName || "Admin"} src={promoterPicture} />
                <div className="ml-4">
                  <h3>  @{promoter ? `${promoter.firstName} ${promoter.lastName}` : "Admin"}</h3>
                  <p className="text-gray-600"> Details</p>
                  <p className="text-gray-500 text-sm">{promoter?.address || "Adresse non encore fournie"}</p>
                </div>
              </div>
              <Button variant='contained' size="large" className="mt-5 bg-color1">
                <a href="tel:+`{promoter?.phoneNumber`}">
                +213  {promoter?.phoneNumber || "Téléphone non encore fourni"}</a>
              </Button>
            </AvatarContainer>
            </div>
          </Slide>
      
        <div className="lg:w-2/3 lg:ml-6">
          {/* General Information */}
          <Slide direction='left'>
            <DetailsContainer className='bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)]'>
              <h2 className="text-xl font-semibold mb-2">General</h2>
              <p>Rooms: F{apartment.type}</p>
              <p>Surface: {apartment.surface}m²</p>
              <p>Floor: {apartment.floor}</p>
              <p>Description: {apartment.description}</p>
            </DetailsContainer>
          </Slide>

          {/* Other Surfaces */}
          <Slide direction='left'>
        
            <DetailsContainer  className='bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)]'>
              <h2 className="text-xl font-semibold mb-2">Rooms</h2>
              {rooms.map((room, index) => (
     
              <p key={index}>{room.name} Room : {room.surface}m²</p> ))}
            </DetailsContainer>
          </Slide>
      
          <Slide direction='left'>
            <DetailsContainer className="bg-white rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)]">
              <h2 className="text-xl font-semibold mb-2">Documents</h2>
              <div className="documents-container space-y-4">
                {documents.map((document, index) => (
                  <div
                    key={index}
                    className="document-card p-4 border rounded-lg shadow-sm flex flex-col space-y-2 bg-gray-50"
                  >
                    <p className="text-lg font-medium">{document.documentName}</p>
       
                    {/* Download Button for the document */}
                    <Button
                      variant="outlined"
                      color="info"
                      className="mt-2"
                      onClick={() => handleDownload(document.documentPath)}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </DetailsContainer>
          </Slide>


          {/* Map */}
          <Slide direction='left'>
            <DetailsContainer className='bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] p-0'>
              <PropertyMap 
                onLocationSave={handleLocationSave} 
                locationData={locationData} 
                disableSearch={true} 
              />
            </DetailsContainer>
          </Slide>

          {/* Contact Section */}
          <Slide direction='left'>
            <DetailsContainer className='bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)]'>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <form className="flex flex-col gap-4">
                <TextField label="Name" variant="outlined" fullWidth />
                <TextField label="Phone" variant="outlined" fullWidth />
                <TextField label="Email" variant="outlined" fullWidth />
                <TextField label="Message" variant="outlined" multiline rows={4} fullWidth />
                <Button variant="contained" color="primary" className="self-end">
                  Send
                </Button>
              </form>
            </DetailsContainer>
          </Slide>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AppartementDetails;
