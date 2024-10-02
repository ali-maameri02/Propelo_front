import {  IconButton } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import Logo from '../../assets/Group 1000003260.png';
import CopyrightOutlinedIcon from '@mui/icons-material/CopyrightOutlined';
const Footer : React.FC = () =>{
    return(
        <footer className="flex flex-col p-5">
        <div className="flex flex-row justify-around items-center p-4 bg-white text-black">
                      <div className="flex items-center">
<img src= {Logo} alt="" />
            <span className="ml-2 text-xl font-semibold">Propelo</span>
          </div >
          <div className="number flex flex-col justify-center items-center">
          <span className="ml-2 text-xl font-semibold">+213 669-79-39-38</span>
      <span>Support@gmail.com</span>
          </div>
        <div className="flex space-x-4">
          <IconButton color="inherit">
            <LinkedInIcon />
          </IconButton>
          <IconButton color="inherit">
            <FacebookIcon />
          </IconButton>
          <IconButton color="inherit">
            <TwitterIcon />
          </IconButton>
        </div>
      </div>
<hr /> 
<caption className="font-almarai mt-5">
    <p>
        A product by<CopyrightOutlinedIcon></CopyrightOutlinedIcon>Propelo2024 All right reserved
    </p>
</caption>
     </footer>
    );
};
export default Footer;