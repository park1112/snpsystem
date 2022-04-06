import { CardContent, CardHeader, Container, Grid, Card, Stack, Button } from '@mui/material';
// layouts
import Layout from '../layouts';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';

import Axios from 'axios';
import { useState } from 'react';

import Chart from '../components/chart/Chart';

import AppWidgetSummary from '../components/summary/Summary';
import { useTheme } from '@emotion/react';
import useFetch from '../hooks/useFatch';
import AppWidget from '../components/app/AppWidget';
import CollapsibleTable from '../components/table';
import db from '../utils/db';
import Product from '../models/Product';

// ----------------------------------------------------------------------

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

export default function Home(props) {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const corona_array = props.data.response.body.items.item;
  const corona_totle = 0;
  const percent = ((corona_totle[0] - corona_totle[1]) / corona_totle[0]) * 100;

  function ffff() {
    console.log(props.corona_date);
    console.log(props.data);
  }

  return (
    <Page title="Page One">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="생산수량"
              percent={percent}
              total={1513}
              chartColor={theme.palette.primary.main}
              chartData={[5, 18, 12, 51, 68, 11, 39, 37, 27, 20]}
            />
          </Grid>
          <Button onClick={ffff}>아리랑!!!</Button>

          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="재고수량"
              percent={0.2}
              total={4876}
              chartColor={theme.palette.chart.blue[0]}
              chartData={[20, 41, 63, 33, 28, 35, 50, 46, 11, 26]}
            />
          </Grid>

          {/* <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="코로나확진자"
              percent={percent}
              total={props.data.response.body.items.item[0].decideCnt}
              chartColor={theme.palette.chart.red[0]}
              chartData={corona_totle}
            />
          </Grid> */}

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title="코로나 전광판" />
              <CardContent>
                <Chart data={props.data} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

export async function getServerSideProps() {
  const corona_key = process.env.CORONA;
  // 현재시간 추가 !

  let today = new Date(); // today 객체에 Date()의 결과를 넣어줬다
  let time = {
    year: today.getFullYear(), //현재 년도
    month: today.getMonth() + 1, // 현재 월
    date: today.getDate(), // 현제 날짜
    hours: today.getHours(), //현재 시간
    minutes: today.getMinutes(), //현재 분
  };
  const corona_date = `${time.year}0${time.month}0${time.date} `;
  const corona = `http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?serviceKey=${corona_key}&pageNo=1&numOfRows=10&startCreateDt=${
    corona_date - 5
  }&endCreateDt=${corona_date}`;

  // const apiUrl = process.env.apiUrl;
  const res = await Axios.get(corona);
  const data = res.data;

  await db.connect();
  const featuredProductsDocs = await Product.find({ isFeatured: true }, '-reviews').lean().limit(3);
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);
  await db.disconnect();

  return {
    props: {
      data: data,
      corona_date: corona_date,
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}
