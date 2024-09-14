import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import Dashboard from '../Dashboard';
import Properities from '../Dashboard-pages/Properities/properities';
import Apartments from '../Dashboard-pages/Appartements/Appartement';
import AddAppartement from '../Dashboard-pages/Appartements/AddAppartement'; // Correct import
import AddPropertie from '../Dashboard-pages/Properities/AddPropertie';
import Commandes from '../Dashboard-pages/Commnandes/Commandes';
import Profile from '../Dashboard-pages/Profile/Profile';
import Help from '../Dashboard-pages/Help/Help';
import UpdateApartemnts from '../Dashboard-pages/Appartements/UpdateApartemnts';
import UpdateProperties from '../Dashboard-pages/Properities/UpdateProperties';
const DashboardRoutes: React.FC = () => {
  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      <main className="flex-1 p-4 px-10">
      <Routes>
    <Route path="/" element={<Dashboard id={1} />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/apartments" element={<Apartments />}>
    <Route path="update/:id" element={<UpdateApartemnts />} />

        <Route path="AddApartments" element={<AddAppartement />} />
    </Route>
    <Route path="/properties" element={<Properities />}>
                <Route path="Ajouter" element={<AddPropertie />} />
                <Route path="update/:id" element={<UpdateProperties />} />
            </Route>


    <Route path="/orders" element={<Commandes />} />
    <Route path="/help" element={<Help />} />
</Routes>

      </main>
    </div>
  );
};

export default DashboardRoutes;
