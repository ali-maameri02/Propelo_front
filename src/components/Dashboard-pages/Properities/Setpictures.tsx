import React, { useState } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

export interface ImageType {
  file: File;
}

interface SetpicturesProps {
  onImagesChange: (images: ImageType[]) => void;
}

const Setpictures: React.FC<SetpicturesProps> = ({ onImagesChange }) => {
  const [images, setImages] = useState<ImageType[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      file,
    }));

    setImages((prevImages) => {
      const updatedImages = [...prevImages, ...newImages];
      onImagesChange(updatedImages);
      return updatedImages;
    });
  };

  const handleImageDelete = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
      return updatedImages;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Set pictures</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div className="relative" key={index}>
            <img
              src={URL.createObjectURL(image.file)}
              alt={`uploaded-${index}`}
              className="w-40 h-auto rounded-lg"
            />
            <button
              onClick={() => handleImageDelete(index)}
              className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full"
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4">
          <label className="flex flex-col items-center cursor-pointer">
            <AddPhotoAlternateIcon className="text-color1" fontSize="large" />
            <span className="mt-2 text-color1 underline">Add pictures</span>
            <span className="mt-2 text-gray-400">format : PNG, JPG, JPEG, WEBP </span>
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Setpictures;
