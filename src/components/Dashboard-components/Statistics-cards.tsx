import React from "react";
import { Slide } from "react-awesome-reveal";


const Statisics : React.FC = () =>{
    return(
        <div className="cards flex flex-row flex-wrap justify-between py-0  w-full p-3 px-8 pl-0  " >
<Slide direction="up">
        <div className="statistic-card  flex flex-col justify-around items-center p-7  bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10 w-[20vw]">
<span className="Appartement_Sold font-almarai font-bold text-wrap text-center">
Appartements Vendu
</span>

<span className="Appartement_Sold font-almarai font-bold font[18px] text-color1">
200
</span>
</div>
</Slide>

<Slide direction="up" delay={50}>

        <div className="statistic-card  w-[20vw] flex flex-col justify-around items-center p-7 bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10">
        <span className="Appartement_Sold font-almarai font-bold font[18px]">
        Commandes
        </span>
        
        <span className="Appartement_Sold font-almarai font-bold font[18px] text-color1">
        700
        </span>
        </div>
        </Slide>

        <Slide direction="up" delay={100}>

        <div className="statistic-card  w-[20vw] flex flex-col justify-around items-center p-7 bg-[#fff] rounded-[6px] border-solid border border-[#e5e7eb] relative shadow-[0_4px_4px_0_rgba(174,174,174,0.25)] mt-10">
        <span className="Appartement_Sold   font-almarai font-bold font[18px]">
        Appartements
        </span>
        
        <span className="Appartement_Sold font-almarai font-bold font[18px] text-color1">
        200
        </span>
        </div>
        </Slide>
        </div>
    );
};
export default Statisics;