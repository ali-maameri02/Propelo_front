// apiUtils.ts
import axios from "axios";

const API_BASE_URL = "http://propelo.runasp.net/api";

export const fetchLastApartmentId = async (): Promise<number | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Apartment`);
    if (response.status === 200 && response.data && response.data.length) {
      return response.data[response.data.length - 1].id;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch apartment ID:", error);
    return null;
  }
};

export const uploadDocument = async (apartmentId: number, documentFile: File) => {
  const formData = new FormData();
  formData.append("ApartmentId", apartmentId.toString());
  formData.append("document", documentFile);

  try {
    await axios.post(`${API_BASE_URL}/ApartmentDocument`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error("Failed to upload document:", error);
  }
};
// apiUtils.ts
export const fetchProperties = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Property`);
      if (response.status === 200) {
        return response.data; // Assuming the data is an array of properties
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      return [];
    }
  };
  