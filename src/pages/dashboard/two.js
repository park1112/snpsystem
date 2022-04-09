import { Container, Typography, Grid, Card, CardHeader, Button, Stack, CircularProgress } from '@mui/material';
// layouts
import Layout from '../../layouts';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import CollapsibleTable from '../../components/table';
import DataTable from '../../components/table/dataTable';
import { ca } from 'date-fns/locale';
import { set } from 'lodash';
import { useRouter } from 'next/router';
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

PageTwo.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

export default function PageTwo(list) {
  const { themeStretch } = useSettings();
  const [data, setData] = useState([]);

  const [twentyL, setTwentyL] = useState(0);
  const [twentyM, setTwentyM] = useState(0);
  const [twentyS, setTwentyS] = useState(0);
  const [tenL, setTenL] = useState(0);
  const [tenM, setTenM] = useState(0);
  const [tenS, setTenS] = useState(0);
  const [fiveL, setFiveL] = useState(0);
  const [fiveM, setFiveM] = useState(0);
  const [fiveS, setFiveS] = useState(0);
  const [threeL, setThreeL] = useState(0);
  const [threeM, setThreeM] = useState(0);
  const [threeS, setThreeS] = useState(0);

  const [snptwentyL, snpsetTwentyL] = useState(0);
  const [snptwentyM, snpsetTwentyM] = useState(0);
  const [snptwentyS, snpsetTwentyS] = useState(0);
  const [snptenL, snpsetTenL] = useState(0);
  const [snptenM, snpsetTenM] = useState(0);
  const [snptenS, snpsetTenS] = useState(0);
  const [snpfiveL, snpsetFiveL] = useState(0);
  const [snpfiveM, snpsetFiveM] = useState(0);
  const [snpfiveS, snpsetFiveS] = useState(0);
  const [snpthreeL, snpsetThreeL] = useState(0);
  const [snpthreeM, snpsetThreeM] = useState(0);
  const [snpthreeS, snpsetThreeS] = useState(0);

  const [nextToken, setNextToken] = useState(1);

  const [firstBt, setFirstBt] = useState(false);
  const [snpBt, setSnpBt] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  // const HOMEPAGE = 'https://snpsystem.vercel.app/';
  const homepage = 'http://localhost:3034/';
  // const homepage = process.env.REACT_APP_HOMEPAGE;

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // 여기 추가
  async function getCoupangListMain() {
    setFirstBt(true);
    const apiUrl = `${homepage}api/1?nextToken=1`;
    let itemfirst = await Axios.get(apiUrl);
    let itemListMax = [];
    let newNextToken = 1;
    let tokenCheck = false;

    itemListMax = [...itemfirst.data.data];
    // console.log(itemfirst.data.nextToken);

    if (!itemfirst.data.nextToken) {
      // console.log('없다!');
      itemSearch(itemfirst.data.data);
      setFirstBt(false);
    } else if (itemfirst.data.nextToken) {
      // console.log('있다!!!');
      tokenCheck = true;
      newNextToken = itemfirst.data.nextToken;
      // console.log(newNextToken);

      while (tokenCheck == true) {
        const apiUrl = `${homepage}api/1?nextToken=${newNextToken}`;
        const axiosData = await Axios.get(apiUrl);
        itemListMax = [...itemListMax, ...axiosData.data.data];
        // console.log('아이템맥스!!!');
        // console.log(itemListMax);
        // console.log('액시오스!!!');
        // console.log(axiosData);
        if (!axiosData.data.nextToken) {
          console.log('새로운데이터 없음!!');
          itemSearch(itemListMax);
          tokenCheck = false;
        } else if (axiosData.data.nextToken) {
          console.log('새로운데이터 있음!');
          newNextToken = axiosData.data.nextToken;
        }
      }
      tokenCheck = false;
      setFirstBt(false);
    }
  }

  // 에스엔피 추가 !

  async function getSnpCoupangListMain() {
    setSnpBt(true);
    const apiUrl = `${homepage}api/2?nextToken=1`;
    let itemfirst = await Axios.get(apiUrl);
    let itemListMax = [];
    let newNextToken = 1;
    let tokenCheck = false;

    itemListMax = [...itemfirst.data.data];
    console.log(itemfirst.data.nextToken);

    if (!itemfirst.data.nextToken) {
      // console.log('없다!');
      snpItemSearch(itemfirst.data.data);
      setSnpBt(false);
    } else if (itemfirst.data.nextToken) {
      // console.log('있다!!!');
      tokenCheck = true;
      newNextToken = itemfirst.data.nextToken;
      // console.log(newNextToken);

      while (tokenCheck == true) {
        const apiUrl = `${homepage}/api/2?nextToken=${newNextToken}`;
        const axiosData = await Axios.get(apiUrl);
        itemListMax = [...itemListMax, ...axiosData.data.data];
        // console.log('아이템맥스!!!');
        // console.log(itemListMax);
        // console.log('액시오스!!!');
        // console.log(axiosData);
        if (!axiosData.data.nextToken) {
          // console.log('새로운데이터 없음!!');
          snpItemSearch(itemListMax);
          tokenCheck = false;
        } else if (axiosData.data.nextToken) {
          // console.log('새로운데이터 있음!');
          newNextToken = axiosData.data.nextToken;
        }
      }
      tokenCheck = false;
      setSnpBt(false);
    }
  }

  // console.log(itemfirst);

  // const itemId = list.list.data;
  // console.log(itemId);

  // console.log('아이템리스트생성!');
  // console.log(itemList);
  // if (list.list.nextToken == 1) {
  //   console.log('토큰없음!');
  //   DataLog(itemList);
  // } else if (list.list.nextToken != nextToken) {
  //   await DataLog(itemList);
  //   console.log(itemList);
  //   console.log('토큰생성!');
  //   setNextToken(Number(data.nextToken)); //2새로운 토큰생성!
  //   await Axios.get(apiUrl).then((res) => setData(res.data));
  //   setItemList([...new Set([...itemList, ...data.data])]); //3번째 토큰 생성
  //   DataLog(itemList);
  //   if (data.nextToken != nextToken) {
  //     setNextToken(Number(data.nextToken));
  //     await Axios.get(apiUrl).then((res) => setData(res.data));
  //     setItemList([...new Set([...itemList, ...data.data])]); //3번째 토큰 생성
  //     DataLog(itemList);
  //     if (data.nextToken != nextToken) {
  //       setNextToken(Number(data.nextToken));
  //       await Axios.get(apiUrl).then((res) => setData(res.data));
  //       setItemList([...new Set([...itemList, ...data.data])]); //3번째 토큰 생성
  //       DataLog(itemList);
  //     }
  //   }
  //   setNextToken(Number(1));
  // }

  //

  function itemSearch(list) {
    const result = {};
    list.forEach((x, i) => {
      result[x.orderItems[0].vendorItemId] = (result[x.orderItems[0].vendorItemId] || 0) + 1;
    });
    console.log(result);
    for (const [key, value] of Object.entries(result)) {
      switch (key) {
        case '78670305294':
          setTwentyL(value);
          break;
        case '78670337609':
          setTwentyM(value);
          break;
        case '78670343332':
          setTwentyS(value);
          break;

        case '75962046384':
          setTenL(value);
          break;
        case '75938820657':
          setTenM(value);
          break;
        case '75962239234':
          setTenS(value);
          break;

        case '75962046334':
          setFiveL(value);
          break;
        case '75938820679':
          setFiveM(value);
          break;
        case '75962239207':
          setFiveS(value);
          break;

        case '75962046427':
          setThreeL(value);
          break;
        case '75938820691':
          setThreeM(value);
          break;
        case '75962239350':
          setThreeS(value);
          break;
      }
    }
  }

  const totalCount =
    twentyL + twentyM + twentyS + tenL + tenM + tenS + fiveL + fiveM + fiveS + threeL + threeM + threeS;

  // 에스엔피 추가 !!

  function snpItemSearch(list) {
    const result = {};
    list.forEach((x, i) => {
      result[x.orderItems[0].vendorItemId] = (result[x.orderItems[0].vendorItemId] || 0) + 1;
    });
    console.log(result);
    for (const [key, value] of Object.entries(result)) {
      switch (key) {
        case '80818673834':
          snpsetTwentyL(value);
          break;
        case '80818673849':
          snpsetTwentyM(value);
          break;
        case '80818673862':
          snpsetTwentyS(value);
          break;

        case '80931650520':
          snpsetTenL(value);
          break;
        case '80931650516':
          snpsetTenM(value);
          break;
        case '80931650513':
          snpsetTenS(value);
          break;

        case '75962046334':
          snpsetFiveL(value);
          break;
        case '75938820679':
          snpsetFiveM(value);
          break;
        case '75962239207':
          snpsetFiveS(value);
          break;

        case '75962046427':
          snpsetThreeL(value);
          break;
        case '75938820691':
          snpsetThreeM(value);
          break;
        case '75962239350':
          snpsetThreeS(value);
          break;
      }
    }
  }

  const snpTotalCount =
    snptwentyL +
    snptwentyM +
    snptwentyS +
    snptenL +
    snptenM +
    snptenS +
    snpfiveL +
    snpfiveM +
    snpfiveS +
    snpthreeL +
    snpthreeM +
    snpthreeS;

  return (
    <Page title="Page Two">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          쿠팡 총 합계 !{totalCount}
          <Button
            disabled={firstBt}
            onClick={getCoupangListMain}
            variant="contained"
            color="secondary"
            endIcon={<Iconify icon="ic:round-access-alarm" />}
          >
            쿠팡 새로고침
          </Button>
        </Typography>
        {isLoading && (
          <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
            <CircularProgress color="success" />
          </Stack>
        )}
        {!isLoading && (
          <Grid item xs={12} md={12}>
            <Card>
              <CardHeader title="오픈마켓 판매현황판" />

              <CollapsibleTable
                data={[twentyL, twentyM, twentyS, tenL, tenM, tenS, fiveL, fiveM, fiveS, threeL, threeM, threeS]}
              />
            </Card>
          </Grid>
        )}
      </Container>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          에스엔피 쿠팡 총 합계 !{snpTotalCount}
          <Button
            disabled={snpBt}
            onClick={getSnpCoupangListMain}
            variant="contained"
            color="secondary"
            endIcon={<Iconify icon="ic:round-access-alarm" />}
          >
            쿠팡 새로고침
          </Button>
        </Typography>
        {isLoading && (
          <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
            <CircularProgress color="success" />
          </Stack>
        )}
        {!isLoading && (
          <Grid item xs={12} md={12}>
            <Card>
              <CardHeader title="오픈마켓 판매현황판" />

              <CollapsibleTable
                data={[
                  snptwentyL,
                  snptwentyM,
                  snptwentyS,
                  snptenL,
                  snptenM,
                  snptenS,
                  snpfiveL,
                  snpfiveM,
                  snpfiveS,
                  snpthreeL,
                  snpthreeM,
                  snpthreeS,
                ]}
              />
            </Card>
          </Grid>
        )}
      </Container>
    </Page>
  );
}
