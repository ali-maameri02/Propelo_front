import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import AddAppartement from './AddAppartement'; // Ensure this is the correct path
import axios from 'axios';
import UpdateApartemnts from "./UpdateApartemnts";

interface Apartment {
    id: number;
    name: string;
    type: string;
    floor: string;
    surface: number;
    sold: boolean; // Added sold field
}

const Appartement: React.FC = () => {
    const [rows, setRows] = useState<Apartment[]>([]);
    const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Nom', width: 150 },
        {
            field: 'type',
            headerName: 'Type',
            width: 150,
            renderCell: (params) => (
                <span>{`F ${params.row.type} `}</span> // Customize the display format
            ),
        },
                { field: 'floor', headerName: 'Étage', width: 130 },
        { field: 'surface', headerName: 'Surface (m²)', width: 150 },
        {
            field: 'sold',
            headerName: 'Vendu',
            width: 150,
            renderCell: (params) => (
                <select
                    value={params.row.sold ? 'true' : 'false'}
                    onChange={(event) => handleSoldStatusChange(params.row.id, event.target.value === 'true')}
                    className="form-select"
                >
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                </select>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <IconButton aria-label="edit" onClick={() => handleEditClick(params.row.id)}>
                        <EditIcon className="text-color1" />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDeleteClick([params.row.id])}>
                        <DeleteIcon className="text-red-500" />
                    </IconButton>
                </div>
            ),
        },
    ];

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const response = await axios.get('http://propelo.runasp.net/api/Apartment');
                const data = response.data as Apartment[];
                setRows(data);
            } catch (error) {
                setError("Erreur lors de la récupération des appartements");
                console.error("Error fetching apartments", error);
            }
        };

        fetchApartments();
    }, []);

    const handleAddPropertyClick = () => {
        navigate(`${location.pathname}/AddApartments`);
    };

    const handleEditClick = (id: number) => {
        navigate(`update/${id}`);
        console.log('click')
    };

    const handleDeleteClick = async (ids: number[]) => {
        try {
            await Promise.all(ids.map(async (id) => {
                await axios.delete(`http://propelo.runasp.net/api/Apartment/${id}`);
            }));
            // Update the rows state to remove the deleted apartments
            setRows((prevRows) => prevRows.filter((row) => !ids.includes(row.id)));
            setSelectedRows([]); // Clear selected rows after deletion
            setError(null);
        } catch (error) {
            setError("Erreur lors de la suppression des appartements");
            console.error("Error deleting apartments", error);
        }
    };

    const handleDeleteSelectedRows = () => {
        if (selectedRows.length > 0) {
            handleDeleteClick(selectedRows as number[]);
        }
    };

    const handleSoldStatusChange = async (id: number, sold: boolean) => {
        try {
            // Fetch the current apartment data
            const response = await axios.get(`http://propelo.runasp.net/api/Apartment/${id}`);
            const apartment = response.data;
    
            // Update the sold field
            const updatedApartment = { ...apartment, sold };
    
            // Send the updated apartment object to the server
            await axios.put(`http://propelo.runasp.net/api/Apartment/${id}`, updatedApartment);
    
            // Update the rows state to reflect the changed sold status
            setRows((prevRows) =>
                prevRows.map((row) => (row.id === id ? { ...row, sold } : row))
            );
            console.log(response.status)
            setError(null);
        } catch (error) {
            setError("Erreur lors de la mise à jour du statut vendu");
            console.error("Error updating sold status", error);
        }
    };
    

    const isAddApartmentsRoute = location.pathname.endsWith('/AddApartments');
    const isUpdateApartmentsRoute = location.pathname.includes('/update/');

    return (
        <div className="main-container ml-48 mt-16 h-full flex flex-col items-start">
            {error && <div className="text-red-500 mb-4">{error}</div>}

            {!isAddApartmentsRoute && !isUpdateApartmentsRoute ? (
                <>
                    <div className="head w-full flex flex-row justify-between items-center mr-0 py-3 pt-0">
                        <h1 className="font-almarai font-bold text-textcolor">Appartements</h1>
                        <div className="flex flex-row justify-end  w-full">
                            {selectedRows.length > 0 && (
                                <Button variant="contained" sx={{mr:'5rem'}} color="error" onClick={handleDeleteSelectedRows}>
                                    Supprimer sélection
                                </Button>
                            )}
                            <Button variant="contained" onClick={handleAddPropertyClick}>Ajouter</Button>
                        </div>
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
                            onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                            rowSelectionModel={selectedRows}
                        />
                    </div>
                </>
            ) : isAddApartmentsRoute ? (
                <AddAppartement />
            ) : (
                <UpdateApartemnts />
            )}
        </div>
    );
};

export default Appartement;
