import merge from 'lodash/merge';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Box, Card, Stack, Divider, CardHeader, Typography } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import ReactApexChart, { BaseOptionChart } from '../chart';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
    '& .apexcharts-legend': {
        width: 240,
        margin: 'auto',
        [theme.breakpoints.up('sm')]: {
            flexWrap: 'wrap',
            height: 160,
            width: '50%',
        },
    },
    '& .apexcharts-datalabels-group': {
        display: 'none',
    },
}));

// ----------------------------------------------------------------------

const CHART_DATA = {
    labels: [
        '유통 1공장',
        '유통 2공장',
        '미래농산',
        '고령농협',
        '고령 유통센터',
        '함안제일농산',
        '민속농산',
        '앤오앤',
        '창녕창고',


    ],
    data: [14.4, 23.3, 21.5, 17.542, 15.456, 10.312, 12.643, 17, 21],
};

export default function BankingExpensesCategories() {
    const theme = useTheme();

    const isDesktop = useResponsive('up', 'sm');

    const chartOptions = merge(BaseOptionChart(), {
        labels: CHART_DATA.labels,
        colors: [
            theme.palette.primary.main,
            theme.palette.info.darker,
            theme.palette.chart.yellow[0],
            theme.palette.chart.blue[0],
            theme.palette.chart.red[0],
            theme.palette.chart.violet[2],
            theme.palette.chart.violet[0],
            theme.palette.success.darker,
            theme.palette.chart.green[0],
        ],
        stroke: {
            colors: [theme.palette.background.paper],
        },
        fill: { opacity: 0.8 },
        legend: {
            position: 'right',
            itemMargin: {
                horizontal: 10,
                vertical: 5,
            },
        },
        responsive: [
            {
                breakpoint: theme.breakpoints.values.sm,
                options: {
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'left',
                    },
                },
            },
        ],
    });

    return (
        <RootStyle>
            <CardHeader title="창고별 남은수량" />

            <Box sx={{ my: 5 }} dir="ltr">
                <ReactApexChart
                    type="polarArea"
                    series={CHART_DATA.data}
                    options={chartOptions}
                    height={isDesktop ? 240 : 360}
                />
            </Box>

            <Divider />

            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
                    <Typography sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>
                        창고수량
                    </Typography>
                    <Typography sx={{ typography: 'h4' }}>9</Typography>
                </Box>

                <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
                    <Typography sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>
                        Total 창고 재고 수량
                    </Typography>
                    <Typography sx={{ typography: 'h4' }}>18,765</Typography>
                </Box>
            </Stack>
        </RootStyle>
    );
}
