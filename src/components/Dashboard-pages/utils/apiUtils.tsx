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
        console.log()
        return response.data; // Assuming the data is an array of properties
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      return [];
    }
  };
  export const fetchApartments = async (): Promise<number> => {
    try {
      const response = await axios.get('http://propelo.runasp.net/api/Apartment');
      const data = response.data;
      const apartmentIds = data.map((apartment: any) => apartment.id);
      const uniqueApartmentIds = new Set(apartmentIds);
      return uniqueApartmentIds.size;
    } catch (error) {
      console.error("Error fetching apartments", error);
      return 0; // Return 0 or handle the error as needed
    }
  };
  export const fetchApartmentssold = async (): Promise<number> => {
    try {
        const response = await axios.get('http://propelo.runasp.net/api/Apartment');
        const data = response.data;

        // Filter apartments where sold is true
        const soldApartments = data.filter((apartment: any) => apartment.sold === true);
        
        // Count unique IDs of sold apartments
        const apartmentIds = soldApartments.map((apartment: any) => apartment.id);
        const uniqueApartmentIds = new Set(apartmentIds);

        return uniqueApartmentIds.size;
    } catch (error) {
        console.error("Error fetching apartments", error);
        return 0; // Return 0 or handle the error as needed
    }
};
interface DataItem {
  name: string;  // e.g., week number or date
  current: number;  // current period sales
  previous: number;  // previous period sales
}


export const fetchSoldApartmentsData = async (): Promise<{ sold: number, unsold: number }> => {
  try {
    const response = await axios.get('http://propelo.runasp.net/api/Apartment');
    const apartments = response.data;

    // Calculate the number of sold and unsold apartments
    const soldCount = apartments.filter((apartment: any) => apartment.sold === true).length;
    const unsoldCount = apartments.filter((apartment: any) => apartment.sold !== true).length;

    return { sold: soldCount, unsold: unsoldCount };
  } catch (error) {
    console.error("Error fetching apartments data", error);
    return { sold: 0, unsold: 0 }; // Return zero counts on error
  }
};




  export const fetchOrders = async (): Promise<number> => {
    try {
      const response = await axios.get('http://propelo.runasp.net/api/Order');
      const data = response.data;
      const orderIds = data.map((order: any) => order.id);
      const uniqueOrderIds = new Set(orderIds);
      return uniqueOrderIds.size;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return 0; // Return 0 or handle the error as needed
    }
  };