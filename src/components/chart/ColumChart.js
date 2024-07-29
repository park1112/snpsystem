import merge from 'lodash/merge';
// components
import ReactApexChart, { BaseOptionChart } from '../../models/chart';

// ----------------------------------------------------------------------

export default function ChartColumnMultiple({ data }) {
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
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: date,
    },
    tooltip: {
      y: {
        formatter: (val) => `$ ${val} thousands`,
      },
    },
    plotOptions: { bar: { columnWidth: '36%' } },
  });

  return <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} height={320} />;
}
