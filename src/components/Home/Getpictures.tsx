import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Slide } from 'react-awesome-reveal';

const Getpictures: React.FC<{ images: { url: string }[] }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to track the selected image

  // Function to open the modal with the clicked image
  const openModal = (url: string) => {
    setSelectedImage(url);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex gap-8 flex-wrap flex-row w-full justify-end p-10 pl-20">
      {images.map((image, index) => (
        <Slide
          direction='up'
          delay={index * 50} // Apply a delay of 100ms per image index
          key={index}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => openModal(image.url)} // Open the modal when an image is clicked
          >
            <img
              src={image.url}
              alt={`uploaded-${index}`}
              className="w-64 h-52 rounded-lg object-cover transition-transform duration-500 ease-in-out transform hover:scale-110 shadow-lg hover:shadow-2xl cursor-pointer"
            />
          </motion.div>
        </Slide>
      ))}

      {/* Modal to display the full-size image */}
      <Modal
        open={!!selectedImage}
        onClose={closeModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1,
            outline: 'none',
            height:'80vh',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            maxHeight: '90vh',
            width: '90vw',
          }}
        >
          <IconButton
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <motion.img
              src={selectedImage}
              alt="Selected"
              className="rounded-lg w-[100%] max-h-[40vh] object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Getpictures;
