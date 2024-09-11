import { Card, Typography, Avatar } from "@mui/material";
import { IconButton } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import React from "react";
import imageavatar1 from '../../../assets/devloper abdo.webp';
import imageavatar from '../../../assets/image 1.png';
import imageavatar2 from '../../../assets/WhatsApp Image 2024-08-04 at 20.43.43.jpeg';
import { Slide } from "react-awesome-reveal";

const Help: React.FC = () => {
  const whatsappNumber = "1234567890"; // Replace with the actual number

  return (
    <div className="main-container ml-48 mt-16 p-4 px-5 h-full flex flex-col items-start">
      <Typography variant="h4" component="h1" className="font-almarai font-bold text-textcolor">
        Profile
      </Typography>
      <Slide>
        <Card className="w-1/2 p-5">
          <h1 className="font-almarai text-[1.5rem]">Our Contact</h1>
          <p className="font-almarai text-gray-500">This page helps you to find our contacts and supports for any questions or problems on the system.</p>
        </Card>
      </Slide>
      <div className="team-cards flex flex-row justify-between w-full">
        <Slide direction="up">
          <div className="statistic-card w-[20vw] flex flex-col justify-around items-center p-7 bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10">
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              Developer
            </span>
            <Avatar
              alt="Profile Image"
              src={imageavatar2}
              sx={{ width: 100, height: 100, border: '2px dashed #ccc' }}
            />
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              alimaameri02@gmail.com
            </span>
            <div className="flex space-x-4">
              <IconButton color="inherit">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <a href={`https://wa.me/${+213697983187}`} target="_blank" rel="noopener noreferrer">
                <IconButton color="inherit">
                  <WhatsAppIcon />
                </IconButton>
              </a>
            </div>
          </div>
        </Slide>
        <Slide direction="up" delay={200}>
          <div className="statistic-card w-[20vw] flex flex-col justify-around items-center p-7 bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10">
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              Developer
            </span>
            <Avatar
              alt="Profile Image"
              src={imageavatar1}
              sx={{ width: 100, height: 100, border: '2px dashed #ccc' }}
            />
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              abdelmotalib.chemouri@gmail.com
            </span>
            <div className="flex space-x-4">
              <IconButton color="inherit">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <a href={`https://wa.me/${+213556147267}`} target="_blank" rel="noopener noreferrer">
                <IconButton color="inherit">
                  <WhatsAppIcon  />
                </IconButton>
              </a>
            </div>
          </div>
        </Slide>
        <Slide direction="up" delay={300}>
          <div className="statistic-card w-[20vw] flex flex-col justify-around items-center p-7 bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10">
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              Owner
            </span>
            <Avatar
              alt="Profile Image"
              src={imageavatar}
              sx={{ width: 100, height: 100, border: '2px dashed #ccc' }}
            />
            <span className="Appartement_Sold font-almarai font-bold font[18px]">
              alimaameri02@gmail.com
            </span>
            <div className="flex space-x-4">
              <IconButton color="inherit">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <IconButton color="inherit">
                  <WhatsAppIcon />
                </IconButton>
              </a>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  );
};

export default Help;
