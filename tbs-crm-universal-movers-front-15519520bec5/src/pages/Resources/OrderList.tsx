import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';

const OrderList:React.FC<any> = ({type,material}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const notifyError = (message:string) => toast.error(message, {
        autoClose: 2000,
    });

    const fetchSalesGroups = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/material-stock?type=${type}&material=${material}`);
            setData(response.data);
            setTimeout(() => {
                $(`#${material}`).DataTable();
            }, 0);
        } catch (err:any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesGroups();
    }, [material]);

    return (
        <div>
            {loading && <Loader />}
            <table id={material} className="text-lg font-medium">
                <thead>
                    <tr>
                        <th className="border-b">Supplier</th>
                        <th className="border-b">{type ==='Register' ? "Recevied Quantity" : "Order Quantity"}</th>
                        <th className="border-b">{type ==='Register' ? "Recevied on" : "Order on"}</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((group:any) => (
                        <tr key={group._id}>
                            <td className="border-b text-md font-medium cursor-pointer p-2">
                                {group?.supplier?.name}
                            </td>
                            <td className="border-b">
                            {type ==='Register' ? group?.quantity || 0 : group?.orderQuantity || 0}
                            </td>
                            <td className="border-b">
                            {type ==='Register' ? (group?.receivedOn ? new Date(group.receivedOn).toLocaleDateString('en-GB') : '') : (group?.orderOn ? new Date(group.orderOn).toLocaleDateString('en-GB') : '')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;
