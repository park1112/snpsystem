import merge from 'lodash/merge';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
// utils
import { fNumber } from '../../utils/formatNumber';
// components
import ReactApexChart, { BaseOptionChart } from '../chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
    height: CHART_HEIGHT,
    marginTop: theme.spacing(5),
    '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
    '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
        overflow: 'visible',
    },
    '& .apexcharts-legend': {
        height: LEGEND_HEIGHT,
        alignContent: 'center',
        position: 'relative !important',
        borderTop: `solid 1px ${theme.palette.divider}`,
        top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
    },
}));

// ----------------------------------------------------------------------

const CHART_DATA = [3, 5, 12, 13, 6, 7];

export default function AnalyticsCurrentVisits() {
    const theme = useTheme();

    const chartOptions = merge(BaseOptionChart(), {
        colors: [
            theme.palette.primary.main,
            theme.palette.chart.blue[0],
            theme.palette.chart.violet[0],
            theme.palette.chart.yellow[0],
        ],
        labels: ['15kg4줄', '15kg5줄', '15kg6줄', '12kg6줄', '12kg7줄', '12kg8줄',],
        stroke: { colors: [theme.palette.background.paper] },
        legend: { floating: true, horizontalAlign: 'center' },
        dataLabels: { enabled: true, dropShadow: { enabled: false } },
        tooltip: {
            fillSeriesColor: false,
            y: {
                formatter: (seriesName) => fNumber(seriesName),
                title: {
                    formatter: (seriesName) => `${seriesName}`,
                },
            },
        },
        plotOptions: {
            pie: { donut: { labels: { show: false } } },
        },
    });

    return (
        <Card>
            <CardHeader title="상품별 생산량 추이" />
            <ChartWrapperStyle dir="ltr">
                <ReactApexChart type="pie" series={CHART_DATA} options={chartOptions} height={280} />
            </ChartWrapperStyle>
        </Card>
    );
}
