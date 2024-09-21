import React, { useState, useEffect } from 'react';
import { TextField, Button, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Getpictures from './Getpictures';
import Navbar from './Navbar';
import PropertyMap from '../Dashboard-pages/Properities/PropertyMap';
import Footer from './Footer';
import { Slide } from 'react-awesome-reveal';
import { styled } from '@mui/material/styles';
import PropertiesMarkerMap from './PropertiesMarkerMap';

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
  const { apartmentId } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [promoter, setPromoter] = useState<any>(null);
  const [promoterPicture, setPromoterPicture] = useState<string>('');
  const [apartment, setApartment] = useState<any>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [rooms, setRooms] = useState<{ name: string; surface: number }[]>([]);
  const [documents, setDocuments] = useState<{ documentName: string; documentPath: string }[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    apartmentId: apartmentId,
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const searchParams = new URLSearchParams(location.search);
  const propertyId = searchParams.get("propertyId");

  useEffect(() => {
    const fetchPromoterData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Promoter/1`);
        const promoter = response.data;
        setPromoter(promoter);
        setContactForm({
          ...contactForm,
          name: `${promoter.firstName} ${promoter.lastName}`,
        });
        fetchPromoterPictureData(promoter.promoterId);
      } catch (error) {
        console.error('Error fetching promoter data:', error);
      }
    };

    fetchPromoterData();
  }, []);

  const fetchPromoterPictureData = async (promoterId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PromoterPicture/1`);
      const promoterPictureData = response.data;
      setPromoterPicture(promoterPictureData.picturePath || '/static/images/avatar/1.jpg');
    } catch (error) {
      console.error('Error fetching promoter picture:', error);
    }
  };

  useEffect(() => {
    const fetchApartmentDetails = async () => {
      try {
        const apartmentResponse = await axios.get(`http://propelo.runasp.net/api/Apartment/${apartmentId}`);
        setApartment(apartmentResponse.data);

        const picturesResponse = await axios.get(`http://propelo.runasp.net/api/ApartmentPicture/apartment/${apartmentId}`);
        setPictures(picturesResponse.data.map((pic: any) => pic.picturePath));

        const areasResponse = await axios.get(`http://propelo.runasp.net/api/Apartment/areas/${apartmentId}`);
        setRooms(areasResponse.data.map((room: any) => ({ name: room.name, surface: room.surface })));

        const documentsResponse = await axios.get(`http://propelo.runasp.net/api/ApartmentDocument/apartment/${apartmentId}`);
        setDocuments(documentsResponse.data);
      } catch (error) {
        console.error('Error fetching apartment details or pictures', error);
      }
    };

    fetchApartmentDetails();
  }, [apartmentId]);

  const handleLocationSave = (data: { lat: number; lng: number }) => {
    console.log('Location saved:', data);
  };

  const handleDownload = (documentPath: string) => {
    const link = document.createElement('a');
    link.href = documentPath;
    link.download = documentPath.split('/').pop() || 'document';
    link.click();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/Order`, contactForm);
      console.log('Order submitted:', response.data);
      alert('Your message has been sent successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (!apartment) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="Pictures mt-1 w-full p-3">
        <h1 className="font-almarai text-black text-[2rem]">Pictures</h1>
        <Getpictures images={pictures.map((url) => ({ url }))} />
      </div>
      <div className="contentdetails relative flex flex-col lg:flex-row-reverse lg:justify-between p-2">
        <Slide direction="right" className="lg:w-1/3 p-2">
          <div className="sticky top-0">
            <AvatarContainer className="flex flex-col items-start justify-evenly">
              <div className="promoter-details flex flex-row mb-5">
                <Avatar alt={promoter?.firstName || 'Admin'} src={promoterPicture} />
                <div className="ml-4">
                  <h3>@{promoter ? `${promoter.firstName} ${promoter.lastName}` : 'Admin'}</h3>
                  <p className="text-gray-600">Details</p>
                  <p className="text-gray-500 text-sm">{promoter?.address || 'Adresse non encore fournie'}</p>
                </div>
              </div>
              <Button variant="contained" size="large" className="mt-5 bg-color1">
                <a href={`tel:+${promoter?.phoneNumber}`}>+213 {promoter?.phoneNumber || 'Téléphone non encore fourni'}</a>
              </Button>
            </AvatarContainer>
          </div>
        </Slide>

        <div className="lg:w-2/3 lg:ml-6">
          {/* General Information */}
          <Slide direction="left">
            <DetailsContainer>
              <h2 className="text-xl font-semibold mb-2">General</h2>
              <p>Rooms: F{apartment.type}</p>
              <p>Surface: {apartment.surface}m²</p>
              <p>Floor: {apartment.floor}</p>
              <p>Description: <br /> {apartment.description}</p>
            </DetailsContainer>
          </Slide>

          {/* Rooms */}
          <Slide direction="left">
            <DetailsContainer>
              <h2 className="text-xl font-semibold mb-2">Rooms</h2>
              {rooms.map((room, index) => (
                <p key={index}>{room.name} Room: {room.surface}m²</p>
              ))}
            </DetailsContainer>
          </Slide>

          {/* Documents */}
          <Slide direction="left">
            <DetailsContainer>
              <h2 className="text-xl font-semibold mb-2">Documents</h2>
              {documents.map((document, index) => (
                <div key={index}>
                  <p>{document.documentName}</p>
                  <Button onClick={() => handleDownload(document.documentPath)}>Download</Button>
                </div>
              ))}
            </DetailsContainer>
          </Slide>

          {/* Map */}
          <Slide direction="left">
            <DetailsContainer>
            <PropertiesMarkerMap zoomedPropertyId={propertyId || undefined} />
            </DetailsContainer>
          </Slide>

          {/* Contact Section */}
          <Slide direction="left">
            <DetailsContainer>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <TextField
                  label="Name"
                  name="name"
                  // value={contactForm.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                />
                <Button variant="contained" color="primary" type="submit" className="self-end">
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
