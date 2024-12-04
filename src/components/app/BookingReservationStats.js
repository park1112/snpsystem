import merge from 'lodash/merge';
import { useState } from 'react';
import { useTheme, styled } from '@mui/material/styles';
// @mui
import { Card, CardHeader, Box, TextField, Typography } from '@mui/material';
// components
import ReactApexChart, { BaseOptionChart } from '../chart';

// ----------------------------------------------------------------------

const CHART_DATA = [
    {
        year: 'Week',
        categories: ['월', '화', '수', '목', '금', '토'], // 주간 카테고리
        data: [
            { name: '15kg 특', data: [10, 41, 35, 10, 49, 51,] },
            { name: '15kg 대', data: [10, 34, 56, 10, 49, 51,] },
            { name: '12kg 대', data: [80, 10, 51, 11, 55, 34,] },
            { name: '12kg 중', data: [148, 91, 69, 62, 49, 51,] },
        ],
    },
    {
        year: 'Month',
        categories: ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차'], // 월간 카테고리
        data: [
            { name: '15kg 특', data: [148, 91, 69, 62, 49, 51,] },
            { name: '15kg 대', data: [45, 77, 99, 49, 51, 11,] },
            { name: '12kg 대', data: [80, 10, 49, 11, 55, 34,] },
            { name: '12kg 중', data: [76, 42, 49, 51, 11, 29,] },
        ],
    },
    {
        year: 'Year',
        categories: ['5월', '6월', '7월', '8월', '9월', '10월'], // 연간 카테고리
        data: [
            { name: '15kg 특', data: [148, 91, 69, 62, 49,] },
            { name: '15kg 대', data: [45, 77, 99, 10, 51, 11,] },
            { name: '12kg 대', data: [80, 10, 49, 51, 55, 34,] },
            { name: '12kg 중', data: [76, 42, 10, 49, 11, 29,] },
        ],
    },
];

export default function BookingReservationStats() {
    const theme = useTheme();
    const [seriesData, setSeriesData] = useState('Year');

    const handleChangeSeriesData = (event) => {
        setSeriesData(event.target.value);
    };

    const selectedData = CHART_DATA.find((item) => item.year === seriesData);

    // 가장 최근 데이터와 그 전 데이터를 사용하여 퍼센트 변화 계산
    const lastData = selectedData.data.map((item) => item.data[item.data.length - 1]);
    const prevData = selectedData.data.map((item) => item.data[item.data.length - 2]);

    const percentageChanges = lastData.map((current, index) => {
        const previous = prevData[index];
        const change = ((current - previous) / previous) * 100;
        return change.toFixed(2);
    });
    const chartOptions = merge(BaseOptionChart(), {
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        xaxis: {
            categories: selectedData.categories, // 선택된 데이터의 카테고리로 변경
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}`,
            },
        },
    });

    return (
        <Card>
            <CardHeader
                title="가락 시장 경락단가"
                subheader={
                    <div>
                        {percentageChanges.map((change, index) => (
                            <Typography
                                key={index}
                                variant="subtitle2"
                                component="span"
                                sx={{ display: 'flex', alignItems: 'center', mr: 2, fontSize: '0.75rem' }} // 글자 크기 줄임
                            >
                                <Typography
                                    component="span"
                                    sx={{ color: 'text.secondary', mr: 0.5 }}
                                >
                                    {`${selectedData.data[index].name}:`}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        color: change > 0 ? theme.palette.chart.red[0] : theme.palette.chart.blue[0],
                                    }}
                                >
                                    {` ${change}%`}
                                </Typography>
                            </Typography>
                        ))}
                    </div>
                }
                action={
                    <TextField
                        select
                        fullWidth
                        value={seriesData}
                        SelectProps={{ native: true }}
                        onChange={handleChangeSeriesData}
                        sx={{
                            '& fieldset': { border: '0 !important' },
                            '& select': { pl: 1, py: 0.5, pr: '24px !important', typography: 'subtitle2' },
                            '& .MuiOutlinedInput-root': { borderRadius: 0.75, bgcolor: 'background.neutral' },
                            '& .MuiNativeSelect-icon': { top: 4, right: 0, width: 20, height: 20 },
                        }}
                    >
                        {CHART_DATA.map((option) => (
                            <option key={option.year} value={option.year}>
                                {option.year}
                            </option>
                        ))}
                    </TextField>
                }
            />

            <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
                <ReactApexChart type="bar" series={selectedData.data} options={chartOptions} height={364} />
            </Box>
        </Card>
    );
}