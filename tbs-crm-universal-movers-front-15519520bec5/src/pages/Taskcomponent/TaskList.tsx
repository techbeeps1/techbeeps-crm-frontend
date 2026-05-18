import { useEffect, useRef, useState } from 'react';
import { Badge, Button, IconButton } from '@mui/material';
import { Flag } from '@mui/icons-material';
import { apiPath } from '../../../apiPath';

const TaskList = ({ setSelectedStaff }:any) => {
    const [data, setData] = useState([]);
    const tableRef = useRef(null as any);

    useEffect(() => {
        const table = $(tableRef.current).DataTable({
            processing: true,
            serverSide: true,
            pageLength: 10,
            ajax: function ({data, callback, settings}:any) {
                const page = settings.page + 1;
                const limit = settings.length;

                fetch(`${apiPath}/api/task?page=${page}&limit=${limit}`)
                    .then((response) => response.json())
                    .then((responseData) => {
                        callback({
                            recordsTotal: 5,
                            recordsFiltered: 5,
                            data: responseData,
                        });
                    });
            },
            columns: [
                { data: 'summary' },
                { data: 'assignedTo' },
                { data: 'status' }
            ]
        });


        return () => {
            // Cleanup when the component is unmounted
            table.destroy();
        };
    }, []);

    return (
        <div>
            <table ref={tableRef} id="taskss" className="display">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Assigned to</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((item:any) => (
                        <tr key={item._id} onClick={() => setSelectedStaff(item)}>
                            <td>
                                <Badge color="error" variant="dot" badgeContent=" " className="mr-1">
                                    <IconButton size="small">
                                        <Flag color="error" />
                                    </IconButton>
                                </Badge>
                                {item?.summary} {item?.customer?.firstName} {item?.customer?.lastName}{" "}
                                ({item?.job?.index})
                            </td>
                            <td>{item?.assignedTo}</td>
                            <td>
                                <Button variant="outlined" size="small">
                                    {item?.status}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskList;
