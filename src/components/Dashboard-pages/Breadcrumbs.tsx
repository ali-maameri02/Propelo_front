import React from 'react';
import { Breadcrumbs } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div role="presentation">
      <Breadcrumbs separator="›" aria-label="breadcrumb">
      
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const last = index === pathnames.length - 1;
          return last ? (
            <Link key={to} color="text.primary" aria-current="page">
              {value}
            </Link>
          ) : (
            <Link
              underline="hover"
              key={to}
              color="inherit"
              component={RouterLink}
              to={to}
            >
              {value}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
