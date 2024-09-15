import React from "react";
import { Slide } from "react-awesome-reveal";
import Logo from '../../assets/Group 1000003260.png';


const Navbar : React.FC = () => {
    return (
      <Slide direction="down">
        <nav className="bg-white shadow-md flex justify-between p-4">
        <div className="flex items-center">
          <div className="flex items-center">
<img src= {Logo} alt="" />
            <span className="ml-2 text-xl font-semibold">Propelo</span>
          </div>
          {/* <TextField
            variant="outlined"
            size="small"
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <SearchIcon className="text-gray-500 mr-2" />
              ),
            }}
            className="ml-4"
          /> */}
        </div>
        <span className="text-gray-500">74552 Apartment for sale</span>
      </nav>
      </Slide>
    );
};
export default Navbar;