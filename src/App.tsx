import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { animateScroll } from "react-scroll";
import AdminLogin from "./components/Login";
import Home from "./components/Home/Home";
import Appartementdetails from "./components/Home/Appartementdetails";
import DashboardRoutes from "./components/Dashboard-components/DashboardRoutes";
import ApartmentsByProperty from "./components/Home/ApartmentsByProperty";

function App() {
  const directory = useLocation();

  useEffect(() => {
    animateScroll.scrollToTop({
      duration: 0,
    });
  }, [directory.pathname]);

  const isAuthenticated = !!localStorage.getItem('user'); // Check if the user is authenticated

  return (
    <div className="w-full bg-white text-gray-950 font-poppins">
      <Routes>
        <Route path="/Admin" element={<AdminLogin />} />
        <Route path="/" element={<Home />} />
        <Route path="/Apprtementdetail/:apartmentId" element={<Appartementdetails />} />
        <Route path="/apartments/:propertyId" element={<ApartmentsByProperty />} />

        
        {/* Conditional rendering of the dashboard route */}
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <DashboardRoutes /> : <Navigate to="/Admin" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;
