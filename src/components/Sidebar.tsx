import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import './style.css';

const Sidebar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width:1024px)'); // 1024px is the breakpoint for larger screens
  const location = useLocation(); // To get the current route path

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const sidebarContent = (
    <List>
      <span className="mt-2 px-5 font-['Inter'] text-[18.33px] font-bold leading-[14.876px] text-color2 relative text-left whitespace-nowrap">
        Menu
      </span>
      
      <ListItem
        
        component={Link}
        to="/dashboard"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <DashboardOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Accueil" />
      </ListItem>
      <ListItem
        
        component={Link}
        to="properties"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/properties' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <HomeWorkOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Propriétés" />
      </ListItem>
      <ListItem
        
        component={Link}
        to="apartments"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/apartments' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <HomeOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Appartements" />
      </ListItem>
      <ListItem
        
        component={Link}
        to="/dashboard/orders"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/orders' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <AccountCircleOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Commandes" />
      </ListItem>
      <ListItem
        
        component={Link}
        to="/dashboard/profile"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/profile' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <LightbulbOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Profil" />
      </ListItem>
      <ListItem
        
        component={Link}
        to="/dashboard/help"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/help' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
          <HeadsetMicOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Aide" />
      </ListItem>
    </List>
  );

  return (
    <>
      {!isLargeScreen && (
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer} className='flex flex-col justify-start h-[10vh] ' sx={{ ml: 2 , }}>
          <MenuIcon />
        </IconButton>
      )}

      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
        {sidebarContent}
      </Drawer>

      {isLargeScreen && (
        <div className="fixed top-14 py-8 flex flex-col items-start z-50 bg-white">
          {sidebarContent}
        </div>
      )}
    </>
  );
};

export default Sidebar;
