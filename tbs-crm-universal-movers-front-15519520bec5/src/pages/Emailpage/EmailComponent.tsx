import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import EmailItem from '../../components/EmailList';

const EmailLayout = ({customerId,offerId} :any) => {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [totalEmails, setTotalEmails] = useState(0);

  const fetchEmails = async (page: number, rowsPerPage: number, query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/emails`, {
        params: {
          page: page + 1,
          rowsPerPage,
          search: query,
          customerId:customerId,
          offerId:offerId
        }
      })
      setEmails(response.data.emails);
      setTotalEmails(response.data.totalEmails);
    } catch (error) {
      console.error("Error fetching emails", error);
    }
    setLoading(false);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSideButtonClick = (folder: string) => {
    console.log(folder)
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    fetchEmails(0, rowsPerPage, event.target.value); // Fetch emails with updated search query
  };

  useEffect(() => {
    fetchEmails(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery]); // Fetch emails whenever page, rowsPerPage, or searchQuery changes

  return (
    <div className="flex flex-col bg-white" style={{ minHeight: '80vh' }}>
      <div className="flex md:flex-row flex-col">
        <div className="text-white p-3" style={{display:customerId && 'none'}}>
          <div className="flex flex-col space-y-2 text-lg">
            <Button
              onClick={() => handleSideButtonClick('Inbox')}
              fullWidth
              sx={{ fontWeight: 'bold', 
                justifyContent: 'flex-start',
                textAlign: 'left',   }}
            >
              Inbox
            </Button>
            <hr className="border-t border-gray" />
            <Button
              onClick={() => handleSideButtonClick('Sent')}
              fullWidth
              sx={{ justifyContent: 'flex-start',
                textAlign: 'left',   }}
            >
              Sent
            </Button>
            <hr className="border-t border-gray" />
            <Button
              onClick={() => handleSideButtonClick('Concepts')}
              fullWidth
              sx={{ justifyContent: 'flex-start',
                textAlign: 'left',   }}
            >
              Concepts
            </Button>
            <hr className="border-t border-gray" />
            <Button
              onClick={() => handleSideButtonClick('Waste paper basket')}
              fullWidth
              sx={{ justifyContent: 'flex-start',
                textAlign: 'left',   }}
            >
              Waste Paper Basket
            </Button>
            <hr className="border-t border-gray" />
            <Button
              onClick={() => handleSideButtonClick('Spam')}
              fullWidth
              sx={{ justifyContent: 'flex-start',
                textAlign: 'left',   }}
            >
              Spam
            </Button>
            <hr className="border-t border-gray" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 border-l border-gray max-w-screen-lg mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search emails"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none w-full sm:w-60"
            />
            <Typography variant="h6" className="text-blue-600 font-bold">{totalEmails} Emails</Typography>
          </div>
          <TableContainer className="overflow-x-auto">
            <Table className="min-w-full sm:min-w-auto">
              <TableHead>
                <TableRow >
                  <TableCell sx={{ fontSize: '16px', fontWeight: '700' }}></TableCell>
                  <TableCell sx={{ fontSize: '16px', fontWeight: '700' }}>Subject</TableCell>
                  <TableCell sx={{ fontSize: '16px', fontWeight: '700' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" className="text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (
                  emails && emails.filter(email => email !== null).map((email: any, index) => (
                    <EmailItem key={index} fetchEmails={fetchEmails} id={email._id} recived_from={email.from} subject={email.subject} message={email.htmlContent} time={email.sentAt} recipient={email.recipient} />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalEmails} // Total emails count (get from API or hardcode)
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailLayout;
