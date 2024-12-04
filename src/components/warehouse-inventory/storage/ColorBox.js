import React from 'react';
import { Box, Typography } from '@mui/material';

const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];

function ColorBox({ remarks, onClick }) {
    // remarks가 배열이 아니면 빈 배열로 초기화
    const safeRemarks = Array.isArray(remarks) ? remarks : Array(4).fill('');

    return (
        <Box
            sx={{
                height: 100,
                border: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
            }}
            onClick={onClick}
        >
            {safeRemarks.map((remark, index) => (
                <Box
                    key={index}
                    sx={{
                        height: '25%',
                        backgroundColor: remarks[index] ? pastelColors[index % pastelColors.length] : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: remark ? '#000' : 'transparent',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                        }}
                    >
                        {remarks[index] || ''}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export default React.memo(ColorBox);