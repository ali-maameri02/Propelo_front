import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import AddAppartement from './AddAppartement'; // Make sure this import is correct
import axios from 'axios';

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nom', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'floor', headerName: 'Étage', width: 130 },
    { field: 'surface', headerName: 'Surface (m²)', width: 150 },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: () => (
            <div>
                <IconButton aria-label="edit">
                    <EditIcon className="text-color1" />
                </IconButton>
                <IconButton aria-label="delete">
                    <DeleteIcon className="text-red-500" />
                </IconButton>
            </div>
        ),
    },
];

const Appartement: React.FC = () => {
    const [rows, setRows] = useState<any[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const response = await axios.get('http://propelo.runasp.net/api/Apartment');
                const data = response.data;

                // Map API data to match the columns' field names
                const mappedRows = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    floor: item.floor,
                    surface: item.surface,
                }));

                setRows(mappedRows);
            } catch (error) {
                console.error("Error fetching apartments", error);
            }
        };

        fetchApartments();
    }, []);

    const handleAddPropertyClick = () => {
        navigate(`${location.pathname}/AddApartments`);  // Navigate to 'AddApartments' relative to the current path
    };

    // Check if the current route matches the 'AddApartments' route
    const isAddApartmentsRoute = location.pathname.endsWith('/AddApartments');

    return (
        <div className="main-container ml-48 mt-16 h-full flex flex-col items-start">
            {!isAddApartmentsRoute ? (
                <>
                    <div className="head w-full flex flex-row justify-between items-center mr-0 py-3 pt-0">
                        <h1 className="font-almarai font-bold text-textcolor">Appartements</h1>
                        <Button variant="contained" onClick={handleAddPropertyClick}>Ajouter</Button>
                    </div>
                    <div style={{ height: 400, width: '80vw', display: "flex", justifyContent: "center" }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            checkboxSelection
                            style={{ marginLeft: "" }}
                        />
                    </div>
                </>
            ) : (
                <AddAppartement />  // Render the AddAppartement component if the route matches 'AddApartments'
            )}
        </div>
    );
};

export default Appartement;
