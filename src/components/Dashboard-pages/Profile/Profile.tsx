import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Avatar, Typography, Box, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import imageavatar from '../../../assets/image 1.png';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    picture: imageavatar,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [success, setSuccess] = useState<string | null>(null); 
  const [promoterPicture, setPromoterPicture] = useState<string>(imageavatar); 

  // Fetch promoter data when component mounts
  useEffect(() => {
    const fetchPromoterData = async () => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/Promoter/1');
        const promoter = response.data;
        setFormData({
          firstName: promoter.firstName,
          lastName: promoter.lastName,
          phoneNumber: promoter.phoneNumber,
          email: promoter.email,
          address: promoter.address,
          picture: promoter.picture || imageavatar,
        });
      } catch (error) {
        console.error('Error fetching promoter data:', error);
        setError('Error fetching promoter data.');
      }
    };

    fetchPromoterData();
  }, []);

  // Fetch promoter picture data when component mounts
  // Fetch promoter picture data when component mounts
useEffect(() => {
  const fetchPromoterPictureData = async () => {
    try {
      const response = await axios.get('http://propelo.runasp.net/api/PromoterPicture/22');
      const promoterPictureData = response.data;

      // Assuming the picturePath is a public URL
      if (promoterPictureData.picturePath) {
        setPromoterPicture(promoterPictureData.picturePath); 
      } else {
        setPromoterPicture(imageavatar); // Fallback image
      }
    } catch (error) {
      console.error('Error fetching promoter picture:', error);
      setError('Error fetching promoter picture.');
    }
  };

  fetchPromoterPictureData();
}, []);


  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setFormData({ ...formData, picture: URL.createObjectURL(file) }); 
    }
  };

  const handleSubmit = async () => {
    try {
      const promoterId = 1; 

      // If an image is selected, submit it first
      if (selectedImage) {
        const formDataForImage = new FormData();
        formDataForImage.append('Picture', selectedImage);
        formDataForImage.append('PromoterId', promoterId.toString());

        const imageResponse = await axios.put('http://propelo.runasp.net/api/PromoterPicture/22', formDataForImage, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("Image submission response:", imageResponse);
        setSuccess('Profile picture updated successfully!');
      }

      // Update promoter data
      const promoterResponse = await axios.put('http://propelo.runasp.net/api/Promoter/1', {
        id: promoterId, 
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      });

      console.log("Promoter update response:", promoterResponse);
      setSuccess('Profile successfully updated!');
    } catch (error) {
      console.error('Error updating profile:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(`Error: ${error.response.data.message || error.message}`);
        } else if (error.request) {
          setError('No response received from the server.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="main-container ml-48 mt-16 p-4 px-5 h-full flex flex-col items-start">
      <Typography variant="h4" component="h1" className="font-almarai font-bold text-textcolor">
        Profile
      </Typography>
      <Typography variant="h6" component="h2" className="mt-4">
        Edit profile
      </Typography>
      <Typography variant="body2" className="mb-8">
        Make changes to your profile here. Click save when you're done.
      </Typography>

      <Grid container spacing={3} alignItems="center">
        <Grid item xs={15} sm={5} position="relative">
          <Avatar
            alt="Profile Picture"
            src={promoterPicture} 
            sx={{ width: 100, height: 100, border: '2px dashed #ccc' }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              sx={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Grid>

        <Grid item xs={12} sm={10}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" width="100%" mt={4}>
        <Button variant="outlined" color="info">
          Exit
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
    </div>
  );
};

export default Profile;
