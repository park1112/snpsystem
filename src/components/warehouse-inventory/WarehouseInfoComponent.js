import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ReusableButton from '../ReusableButton';
import { getKoreanStatus } from '../../utils/inventoryStatus';

const WarehouseInfoComponent = ({ initialData, teams, handleSelectTeam }) => (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>창고 및 상태 정보</Typography>
            <Typography><strong>선택된 창고:</strong> {initialData.warehouseName}</Typography>
            <Typography><strong>선택된 상태:</strong> {getKoreanStatus(initialData.status)}</Typography>

            <Typography variant="h6" mt={2}>작업 팀 선택</Typography>
            <Box mt={1}>
                <ReusableButton
                    label="작업 팀 선택"
                    options={['없음', ...teams.map((team) => team.name)]}
                    onSelect={(option) => {
                        if (option === '없음') {
                            handleSelectTeam(null);
                        } else {
                            const selectedTeam = teams.find((team) => team.name === option);
                            if (selectedTeam) {
                                handleSelectTeam(selectedTeam.uid);
                            } else {
                                console.error('Selected team not found');
                            }
                        }
                    }}
                    fullWidth
                />
            </Box>
        </Paper>
    );

export default WarehouseInfoComponent;