import React, { useEffect, useState } from "react";
import axios from "axios";
import Avatar from '@mui/material/Avatar';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SalesChart from "./Dashboard-components/SalesChart";
import Statisics from "./Dashboard-components/Statistics-cards";
import { Slide } from "react-awesome-reveal";
import Alert from '@mui/material/Alert';

interface DashboardProps {
  id: number; // Assuming id is passed as a prop
}

const Dashboard: React.FC<DashboardProps> = ({ id }) => {
  const [promoter, setPromoter] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [promoterPicture, setPromoterPicture] = useState<string>(""); 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    // picture: imageavatar,
  });
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
        setAlertVisible(false)
      } catch (error) {
        console.error('Error fetching promoter data:', error);
        setAlertVisible(true);
      }
    };

    fetchPromoterData();
  }, [id]);

  const fetchPromoterPictureData = async (promoterId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PromoterPicture/1`);
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

  return (
    <div className="content w-full">
      {/* Alert for incomplete profile */}
      {alertVisible && (
        <Alert severity="error" className="w-[60vw] mb-4 mt-16 ml-48">
          Votre profil est incomplet. Veuillez mettre à jour vos informations.
        </Alert>
      )}

      <div className="main-container flex flex-row justify-between mt-20">
        <div className="midel-container ml-52 w-full h-full flex flex-col items-start">
          <div className="head w-52 mr-0 py-3 pt-0">
            <h1 className="font-almarai font-bold text-textcolor">Overview</h1>
          </div>

          <Slide direction="left">
            <div className="user-profile-view p-2 px-4 w-auto bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)]">
              <div className="flex flex-row row">
                <Avatar alt={promoter?.firstName || "Admin"} src={promoterPicture} />
                <div className="column-details flex flex-col ml-2 w-[100%]">
                  <span className="Username-tag font-almarai text-textcolor">
                    @{promoter ? `${promoter.firstName} ${promoter.lastName}` : "Admin"}
                  </span>
                  <span className="w-[100%] flex flex-row justify-between px-2 text-gray-400">
                    {promoter?.address || "Adresse non encore fournie"}
                    <MapOutlinedIcon className="text-gray-400 font-almarai text-sm" />
                  </span>
                  <span className="w-[100%] flex flex-row justify-between text-gray-400 px-2">
                    {promoter?.phoneNumber || "Téléphone non encore fourni"}
                    <LocalPhoneOutlinedIcon className="text-gray-400 font-almarai text-sm" />
                  </span>
                  <span className="w-[100%] flex flex-row justify-between items-start text-gray-400 px-2">
                    {` ${promoter?.email || "Email non encore fourni"}`}
                    <EmailOutlinedIcon className="text-gray-400 font-almarai text-sm" />

                  </span>
                </div>
              </div>
            </div>
          </Slide>

          <Statisics />

          <div className="saleschart w-96 p-8 pb-36">
            <SalesChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
