import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import AddPropertie from "./AddPropertie";
import UpdateProperties from "./UpdateProperties";

interface Property {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    apartmentsNumber: number;
}

const Properities: React.FC = () => {
    const [rows, setRows] = useState<Property[]>([]);
    const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Nom', width: 150 },
        { field: 'address', headerName: 'Adresse', width: 200 },
        { field: 'city', headerName: 'Ville', width: 130 },
        { field: 'state', headerName: 'Étages', width: 130 },
        { field: 'apartmentsNumber', headerName: 'n° Appartements', width: 180 },
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
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://propelo.runasp.net/api/Property');
                const data = response.data as Property[];
                // Ensure the 'id' from the API is used for DataGrid rows
                setRows(data);
            } catch (error) {
                setError("Erreur lors de la récupération des propriétés");
                console.error("Error fetching properties", error);
            }
        };

        fetchProperties();
    }, []);

    const handleAddPropertyClick = () => {
        navigate('Ajouter');
    };

    const handleEditClick = (id: number) => {
        navigate(`update/${id}`);
    };

    const handleDeleteClick = async (ids: number[]) => {
        try {
            await Promise.all(ids.map(async (id) => {
                // Use the correct id from the property (from the API)
                await axios.delete(`http://propelo.runasp.net/api/Property/${id}`);
            }));
            // Update the rows state to remove the deleted properties
            setRows((prevRows) => prevRows.filter((row) => !ids.includes(row.id)));
            setSelectedRows([]); // Clear selected rows after deletion
            setError(null); // Clear any previous errors
        } catch (error) {
            setError("Erreur lors de la suppression des propriétés");
            console.error("Error deleting properties", error);
        }
    };

    const handleDeleteSelectedRows = () => {
        if (selectedRows.length > 0) {
            // Cast selectedRows to number[] (as the selection is the id of the rows)
            handleDeleteClick(selectedRows as number[]);
        }
    };

    const isAddPropertieRoute = location.pathname.endsWith('/Ajouter');
    const isUpdatePropertieRoute = location.pathname.includes('/update/');

    return (
        <div className="main-container ml-48 mt-16 h-full flex flex-col items-start">
            {/* Display error message if any */}
            {error && <div className="text-red-500 mb-4">{error}</div>}
            
            {!isAddPropertieRoute && !isUpdatePropertieRoute ? (
                <>
                    <div className="head w-full flex flex-row justify-between items-center mr-0 py-3 pt-0">
                        <h1 className="font-almarai font-bold text-textcolor">Propriétés</h1>
                        <div className="flex flex-row justify-end  w-full">
                            {selectedRows.length > 0 && (
                                <Button variant="contained" sx={{mr:'5rem'}} color="error" onClick={handleDeleteSelectedRows}>
                                    Supprimer sélection
                                </Button>
                            )}
                            <Button variant="contained" onClick={handleAddPropertyClick}>Ajouter</Button>
                        </div>
                    </div>
                    <div style={{ height: 400, width: '80vw' }}>
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
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectedRows(newSelection);
                            }}
                            rowSelectionModel={selectedRows}
                        />
                    </div>
                </>
            ) : isAddPropertieRoute ? (
                <AddPropertie />
            ) : (
                <UpdateProperties />
            )}
        </div>
    );
};

export default Properities;
