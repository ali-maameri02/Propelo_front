import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import './style.css';
import axios from 'axios';

const Sidebar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width:1024px)');
  const location = useLocation();
  const [ordersFromDb, setOrdersFromDb] = useState<Set<number>>(new Set<number>());
  const [unseenOrdersCount, setUnseenOrdersCount] = useState<number>(0);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    // Read unseenOrdersCount from localStorage
    const storedUnseenCount = parseInt(localStorage.getItem('unseenOrdersCount') || '0', 10);
    setUnseenOrdersCount(storedUnseenCount);

    const fetchOrders = async (): Promise<void> => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/Order');
        const orders = response.data;
  
        console.log('Orders fetched from API:', orders);
  
        const newOrderIdsSet = new Set<number>(orders.map((order: any) => order.id));
        setOrdersFromDb(newOrderIdsSet);
  
        const lastCount = parseInt(localStorage.getItem('totalOrders') || '0', 10);
        console.log('Last saved order count from localStorage:', lastCount);
  
        const newOrderCount = newOrderIdsSet.size - lastCount;
        console.log('New calculated order count:', newOrderCount);
  
        // Update unseen orders count
        if (newOrderCount > 0) {
          const updatedUnseenCount = storedUnseenCount + newOrderCount;
          setUnseenOrdersCount(updatedUnseenCount);
          localStorage.setItem('unseenOrdersCount', updatedUnseenCount.toString());
        }
  
        localStorage.setItem('totalOrders', newOrderIdsSet.size.toString());
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
    // const intervalId = setInterval(fetchOrders, 30000); // Fetch every 30 seconds

    // return () => clearInterval(intervalId);
  }, []);

  const handleCommandsClick = () => {
    // Reset unseen orders count
    setUnseenOrdersCount(0);
    localStorage.setItem('unseenOrdersCount', '0');
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
        <ListItemText primary="Bâtiments" />
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
        onClick={handleCommandsClick}
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/orders' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
        <Badge badgeContent={unseenOrdersCount > 0 ? unseenOrdersCount : '0'} color="error">
        <LightbulbOutlinedIcon />

</Badge>


        </ListItemIcon>
        <ListItemText primary="Commandes" />
      </ListItem>

      <ListItem
        component={Link}
        to="/dashboard/profile"
        className={`sidebar-item flex flex-row font-['Inter'] text-[18.33px] ml-2 py-1 ${location.pathname === '/dashboard/profile' ? 'active' : ''}`}
      >
        <ListItemIcon className="mr-2 ml-2 text-gray-700 group-hover:text-color1 group-hover:fill-color1 group-hover:transition-all group-hover:ease-in-out">
        <AccountCircleOutlinedIcon />

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
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer} className='flex flex-col justify-start h-[10vh] ' sx={{ ml: 2 }}>
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
