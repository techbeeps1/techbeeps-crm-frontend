import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
    Button,
    Modal,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Inputfieldfrom from './Inputfieldfrom';

const AppointmentType: React.FC<{ inputFor: string }> = ({ inputFor }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>("");
    const [previous, setPrevious] = useState<any>("");
    const [templates, setTemplates] = useState<any>([])
    const [templatesNames, setTemplatesName] = useState<any>([])


    const handleAllinputs = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/input?inputFor=${inputFor}`);
            setData(response["data"]);
            setSelectedStaff("")
            setTimeout(() => {
                $('#input').DataTable();
            }, 0);
        } catch (err) {
            setError('Failed to fetch agents. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = () => {
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(`${apiPath}/api/input/${selectedStaff._id}`);
            if (response.status == 200) {
                handleAllinputs()
            }
        } catch (err) {
            console.error('Failed to delete agent:', err);
        } finally {
            closeDeleteModal();
        }
    }

    const handleAlltemplates = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/templates`);
            setTemplatesName(response.data)
            const dataNames = data.map((item: any) => item.name);
            const filteredTemplates = response.data.filter((template: any) => !dataNames.includes(template._id));
            setTemplates(filteredTemplates);
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (data: any): void => {
        setEditModalOpen(true);
        setPrevious(data)
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
    };

    useEffect(() => {
        handleAllinputs();
    }, []);
    useEffect(() => {
        if (inputFor === 'Template') {
            handleAlltemplates()
        }
    }, [inputFor,data]);
    


    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }
    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    return (
        <div className="flex mt-2" style={{ justifyContent: "flex-start", minHeight: "85vh" }}>
            <div className="w-1/2 bg-white pt-2 pl-1">
                <div className="mx-2">
                    <Button variant="outlined" className='shadow-md' onClick={() => openEditModal(null)}>New Input</Button>
                </div>
                <div className="rounded-sm p-3 mt-4 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id="input" className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                                <th className="border-b">Input For</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index) => {
                                const templateName =templatesNames && templatesNames.find((template: any) => template._id === item.name)
                                return (
                                    <tr key={index} onClick={() => setSelectedStaff(item)}>
                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{templateName ? templateName.name : item.name}</td>
                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.inputFor}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                        <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                            <IconButton
                                onClick={closeDeleteModal}
                                className="absolute top-0 right-2"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" component="h2" marginY={"10px"} >
                                Confirm Delete
                            </Typography>
                            <Typography className="mb-4" style={{ margin: "5px 0" }}>
                                Are you sure you want to delete {selectedStaff?.name}?
                            </Typography>
                            <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={confirmDelete}
                                    className="mr-2"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={closeDeleteModal}
                                >
                                    No
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                    <Modal open={isEditModalOpen} onClose={closeEditModal}>
                        <Box className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mt-2 relative">
                            <IconButton
                                onClick={closeEditModal}
                                className="absolute top-2 right-2"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Inputfieldfrom templates={templates} inputFor={inputFor} value={previous} close={closeEditModal} handler={handleAllinputs} />
                        </Box>
                    </Modal>
                </div>
            </div>
            <div className="relative w-1/2 bg-white border-l border-blue">
                {selectedStaff !== "" ? <div className="p-5">
                    <IconButton onClick={() => setSelectedStaff("")} className="absolute top-0 left-0">
                        <CloseIcon />
                    </IconButton>
                    <div className="flex justify-between">
                        <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mb-4">{templatesNames && (templatesNames.find((template: any) => template._id === selectedStaff.name))?.name || selectedStaff.name}</div>
                    </div>
                    <div>
                        <div className="flex mb-3 justify-between">
                            <h2 className="text-xl font-bold mb-2 me-4">Input Information</h2>
                            <DeleteIcon onClick={() => openDeleteModal()} />
                        </div>
                        <div className="flex justify-between mb-2">
                            <p>Name:</p>
                            <p className="text-lg font-bold pe-5">{templatesNames && (templatesNames.find((template: any) => template._id === selectedStaff.name))?.name || selectedStaff.name}</p>
                            <p></p>
                        </div>
                        <div className="flex justify-between">
                            <p>Input For:</p>
                            <p className="text-lg font-bold pe-5">{selectedStaff?.inputFor}</p>
                            <p></p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-3 mt-4">Feild regarding to Name</h3>
                        <div className="flex flex-wrap">
                            {selectedStaff?.extraFields?.map((item: any, index: number) => <div className=" m-3 flex items-center gap-4" key={index}>
                                <div>
                                    <p className="font-bold">{item.label}</p>
                                    <p className="text-black">{item.name}</p>
                                </div>
                            </div>)}
                        </div>
                        <div className="mt-5">
                            <Button variant="contained" color="primary" onClick={() => openEditModal(selectedStaff)}>
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
                    : ""}

            </div>
        </div>


    );
};

export default AppointmentType;
