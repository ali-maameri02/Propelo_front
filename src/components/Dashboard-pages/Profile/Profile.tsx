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
        console.error('Erreur lors de la récupération des données du promoteur:', error);
        setError('Erreur lors de la récupération des données du promoteur.');
      }
    };

    fetchPromoterData();
  }, []);

  useEffect(() => {
    const fetchPromoterPictureData = async () => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/PromoterPicture/1');
        const promoterPictureData = response.data;

        if (promoterPictureData.picturePath) {
          setPromoterPicture(promoterPictureData.picturePath); 
        } else {
          setPromoterPicture(imageavatar); 
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'image du promoteur:', error);
        setError('Erreur lors de la récupération de l\'image du promoteur.');
      }
    };

    fetchPromoterPictureData();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

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

      if (selectedImage) {
        const formDataForImage = new FormData();
        formDataForImage.append('Picture', selectedImage);
        formDataForImage.append('PromoterId', promoterId.toString());

        const imageResponse = await axios.put('http://propelo.runasp.net/api/PromoterPicture/1', formDataForImage, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("Réponse de soumission de l'image:", imageResponse);
        setSuccess('Photo de profil mise à jour avec succès!');
      }

      const promoterResponse = await axios.put('http://propelo.runasp.net/api/Promoter/1', {
        id: promoterId, 
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      });

      console.log("Réponse de mise à jour du promoteur:", promoterResponse);
      setSuccess('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(`Erreur: ${error.response.data.message || error.message}`);
        } else if (error.request) {
          setError('Aucune réponse reçue du serveur.');
        } else {
          setError(`Erreur: ${error.message}`);
        }
      } else {
        setError('Une erreur inattendue s\'est produite.');
      }
    }
  };

  return (
    <div className="main-container ml-48 mt-16 p-4 px-5 h-full flex flex-col items-start">
      <Typography variant="h4" component="h1" className="font-almarai font-bold text-textcolor">
        Profil
      </Typography>
      <Typography variant="h6" component="h2" className="mt-4">
        Modifier le profil
      </Typography>
      <Typography variant="body2" className="mb-8">
        Faites des modifications à votre profil ici. Cliquez sur "Enregistrer" lorsque vous avez terminé.
      </Typography>

      <Grid container spacing={3} alignItems="center">
        <Grid item xs={15} sm={5} position="relative">
          <Avatar
            alt="Photo de profil"
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
              aria-label="télécharger une image"
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
                label="Prénom"
                variant="outlined"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                variant="outlined"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro de téléphone"
                variant="outlined"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse"
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
        
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Enregistrer
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
    </div>
  );
};

export default Profile;
