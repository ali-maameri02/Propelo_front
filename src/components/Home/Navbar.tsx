import React, { useEffect, useState } from "react";
import { Slide } from "react-awesome-reveal";
import axios from "axios";
import Logo from '../../assets/Group 1000003260.png';

const Navbar: React.FC = () => {
    const [unsoldApartmentsCount, setUnsoldApartmentsCount] = useState<number>(0);

    const fetchApartments = async () => {
        try {
            const response = await axios.get('http://propelo.runasp.net/api/Apartment');
            const apartmentData = response.data;

            // Filter apartments that are not sold
            const unsoldApartments = apartmentData.filter((apartment: any) => !apartment.sold);
            setUnsoldApartmentsCount(unsoldApartments.length);
        } catch (error) {
            console.error("Error fetching apartments", error);
        }
    };

    useEffect(() => {
        fetchApartments();
    }, []);

    return (
        <Slide direction="down">
            <nav className="bg-white shadow-md flex justify-between p-4">
                <div className="flex items-center">
                    <div className="flex items-center">
                        <img src={Logo} alt="" />
                        <span className="ml-2 text-xl font-semibold">Propelo</span>
                    </div>
                </div>
                <span className="text-gray-500">{unsoldApartmentsCount} Apartments for sale</span>
            </nav>
        </Slide>
    );
};

export default Navbar;
