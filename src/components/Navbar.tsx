import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "@mui/material";
import '../index.css';
import './style.css';
import Logo from '../assets/Group 1000003260.png';
import { Slide } from "react-awesome-reveal";

const Navbar: React.FC = () => {
  const isLargeScreen = useMediaQuery('(min-width:1024px)'); // Adjust the breakpoint as needed
  const [promoter, setPromoter] = useState<any>(null);
  const [promoterPicture, setPromoterPicture] = useState<string>(""); 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchPromoterData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Promoter/1`);
        const promoter = response.data;
        setPromoter(promoter);

        // Fetch promoter picture data
        fetchPromoterPictureData(promoter.promoterId);
      } catch (error) {
        console.error('Error fetching promoter data:', error);
      }
    };

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
      }
    };

    fetchPromoterData();
  }, []);

  if (!isLargeScreen) {
    return null; // Hide the navbar on small screens
  }

  return (
    <Slide className="fixed top-0" style={{ width: "100vw", zIndex: 999999 }} direction="down">
      <div className="navigation w-100 border-b-2 bg-white" style={{ width: "100vw" }}>
        <div className="content w-100 flex flex-row justify-between p-2 px-8">
          <div className="right-side flex flex-row justify-center items-center">
            <img src={Logo} alt="Logo" />
            <span className="mt-2 font-['Inter'] text-[24px] font-bold leading-[14.876px] text-[#2563EB] relative text-left whitespace-nowrap">
              Propelo
            </span>
          </div>
          <div className="user-avatar flex flex-row items-center justify-between w-100">
            <img src={promoterPicture || "/static/images/avatar/1.jpg"} className="avatar mr-2 rounded-full" alt="User Avatar" />
            <div className='flex flex-col justify-center items-start'>
              <span className="font-['Almarai'] text-[13.33px] font-normal leading-[14.876px] text-[#3d3935] relative text-left whitespace-nowrap">
                {promoter ? `${promoter.firstName} ${promoter.lastName}` : "Nom Non Disponible"}
              </span>
              <span className="font-['Almarai'] text-[12px] font-normal leading-[13px] text-[#a7aeb5] relative text-right whitespace-nowrap z-[6]">
                {promoter ? `ID ${promoter.id}` : "ID Non Disponible"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
};

export default Navbar;
