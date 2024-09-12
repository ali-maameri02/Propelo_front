import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CallIcon from '@mui/icons-material/Call';
import axios from 'axios';

const columns = (handleOpen: (rowData: any) => void, navigate: any): GridColDef[] => [
  { field: 'name', headerName: 'Nom', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'phone', headerName: 'Numéro de téléphone', width: 180 },
  {
    field: 'apartmentId',
    headerName: 'ID Appartement',
    width: 180,
    renderCell: (params) => (
      <Button onClick={() => navigate(`/Apprtementdetail/${params.value}`)} color="primary">
        {params.value}
      </Button>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (params) => (
      <div>
        <IconButton aria-label="view" onClick={() => handleOpen(params.row)}>
          <VisibilityIcon className="text-blue-500" />
        </IconButton>
        <IconButton aria-label="delete">
          <DeleteIcon className="text-red-500" />
        </IconButton>
      </div>
    ),
  },
];

const Commandes: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://propelo.runasp.net/api/Order');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleOpen = (rowData: any) => {
    setSelectedRow(rowData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="main-container ml-48 mt-16 h-full flex flex-col items-start">
      <div className="head w-full flex flex-row justify-between items-center mr-0 py-3 pt-0">
        <h1 className="font-almarai font-bold text-textcolor">Commandes</h1>
      </div>
      <div className="ml-24" style={{ height: 400, width: '70vw' }}>
        <DataGrid
          rows={orders}
          columns={columns(handleOpen, navigate)}
          getRowId={(row) => row.id} // Ensure each row has a unique 'id' field
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Détails du client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Nom:</strong> {selectedRow?.name} <br />
            <strong>Email:</strong> {selectedRow?.email} <br />
            <strong>Numéro de téléphone:</strong> {selectedRow?.phone}
            <br/>
            <strong>Message:</strong> {selectedRow?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => window.location.href = `tel:${selectedRow?.phone}`}
            color="primary"
            startIcon={<CallIcon />}
          >
            Appeler
          </Button>
          <Button onClick={handleClose} color="secondary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Commandes;
