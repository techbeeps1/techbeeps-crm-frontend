import React, { useState } from 'react';
import { Grid, Button, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider } from '@mui/material';

const Availability = () => {
    const [availability, setAvailability] = useState({
        and: Array(10).fill(true),
        of: Array(10).fill(true),
        where: Array(10).fill(true),
        do: Array(10).fill(true),
        vr: Array(10).fill(true),
    });

    const handleSliderChange = (day, newValue) => {
        setAvailability((prev) => {
            const updated = { ...prev };
            updated[day] = Array(10).fill(false);
            newValue.forEach(index => {
                updated[day][index] = true;
            });
            return updated;
        });
    };

    const days = ['and', 'of', 'where', 'do', 'vr'];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Availability</Typography>
            <Grid container spacing={2}>
                {days.map((day) => (
                    <Grid item xs={2} key={day}>
                        <Typography>{day}</Typography>
                        <p className="mb-4"></p>
                        <Slider
                            value={availability[day].map((val, index) => (val ? index : null)).filter((val) => val !== null)}
                            onChange={(event, newValue) => handleSliderChange(day, newValue)}
                            valueLabelDisplay="auto"
                            max={10}
                            step={1}
                            marks={times.map((time, index) => ({ value: index, label: time }))}
                            orientation="vertical"
                            sx={{ height: 250, marginLeft: 0 }} // Adjust margins for better alignment
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const WorkScheduleTable = () => {
    const rows = [
        { week: 'Even', and: '08:00', of: '08:00', where: '08:00', do: '08:00', vr: '09:00', for: '00:00', likeThis: '00:00' },
        { week: 'Odd', and: '08:00', of: '08:00', where: '08:00', do: '08:00', vr: '08:00', for: '00:00', likeThis: '00:00' }
    ];

    return (
        <Box mt={4}>
            <Typography variant="h6" gutterBottom>Work Schedule</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Week</TableCell>
                            <TableCell>And</TableCell>
                            <TableCell>Of</TableCell>
                            <TableCell>Where</TableCell>
                            <TableCell>Do</TableCell>
                            <TableCell>Vr</TableCell>
                            <TableCell>For</TableCell>
                            <TableCell>Like This</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.week}>
                                <TableCell>{row.week}</TableCell>
                                <TableCell>{row.and}</TableCell>
                                <TableCell>{row.of}</TableCell>
                                <TableCell>{row.where}</TableCell>
                                <TableCell>{row.do}</TableCell>
                                <TableCell>{row.vr}</TableCell>
                                <TableCell>{row.for}</TableCell>
                                <TableCell>{row.likeThis}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const SporadicAvailability = () => (
    <Box mt={4}>
        <Button variant="contained" color="primary">
            Add availability
        </Button>
    </Box>
);

const AvailabilityComponent = () => {
    return (
        <Box p={3}>
            <Availability />
            <WorkScheduleTable />
            <SporadicAvailability />
        </Box>
    );
};

export default AvailabilityComponent;
