import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CallIcon from '@mui/icons-material/Call';

const columns = (handleOpen: (rowData: any) => void, navigate: any): GridColDef[] => [
  { field: 'name', headerName: 'Nom', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'phoneNumber', headerName: 'Numéro de téléphone', width: 180 },
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

const rows = [
  { id: 1, name: 'Commande1', email: 'email1@example.com', phoneNumber: '0123456789', apartmentId: 'A001' },
  { id: 2, name: 'Commande2', email: 'email2@example.com', phoneNumber: '0987654321', apartmentId: 'A002' },
  { id: 3, name: 'Commande3', email: 'email3@example.com', phoneNumber: '1112233445', apartmentId: 'A003' },
  { id: 4, name: 'Commande4', email: 'email4@example.com', phoneNumber: '2223344556', apartmentId: 'A004' },
];

const Commandes: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const navigate = useNavigate();

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
          rows={rows}
          columns={columns(handleOpen, navigate)}
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
            <strong>Numéro de téléphone:</strong> {selectedRow?.phoneNumber}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => window.location.href = `tel:${selectedRow?.phoneNumber}`}
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
