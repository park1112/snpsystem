import merge from 'lodash/merge';
// components
import ReactApexChart, { BaseOptionChart } from '../../models/chart';

export default function ChartColumnStacked({ data }) {
  const itemName = data.response.body.items.item;
  const death = itemName.map((death, idx) => {
    death = death.deathCnt;
    return death;
  });
  const decide = itemName.map((decide, idx) => {
    decide = decide.decideCnt;
    return decide;
  });
  const date = itemName.map((date, idx) => {
    date = date.createDt;
    return date;
  });

  const CHART_DATA = [
    { name: '확진자', data: decide },
    { name: '사망자', data: death },
  ];

  const chartOptions = merge(BaseOptionChart(), {
    chart: {
      stacked: true,
      zoom: { enabled: true },
    },
    legend: { itemMargin: { vertical: 8 }, position: 'right', offsetY: 20 },
    plotOptions: { bar: { columnWidth: '16%' } },
    stroke: { show: false },
    xaxis: {
      type: 'datetime',
      categories: date,
    },
  });

  return <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} height={320} />;
}
