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
export async function getStaticProps() {
  const apiUrl = 'http://localhost:3034/api/1';
  const res = await Axios.get(apiUrl);
  const data = res.data;
  const isLoading = false;

  return {
    props: {
      list: data,
      isLoading: isLoading,
    },
  };
}

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

  const [nextToken, setNextToken] = useState(null);

  const [firstBt, setFirstBt] = useState(false);
  const [secondBt, setSecondBt] = useState(true);
  const [itemList, setItemList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // const getCoupangList = async () => {
  //   const apiUrl = 'http://localhost:3034/api/1';
  //   await axios.get(apiUrl).then((res) => setData(res.data));
  //   setItemList(data.data);
  //   console.log(itemList);
  //   DataLog(itemList);
  //   setIsLoading(false);
  //   // console.log(data);
  // };

  useEffect(() => {
    setItemList(list.list.data);
    setIsLoading(list.isLoading);
    DataLog(itemList);
    console.log(itemList);
  }, []);

  const getCoupangList = () => {
    setItemList(list.list.data);
    setIsLoading(list.isLoading);
    DataLog(itemList);
    console.log(itemList);
    setFirstBt(false);
  };

  // const getCoupangListf = async () => {
  //   const apiUrl = `http://localhost:3034/api/1?nextToken=${nextToken}`;

  //   if (!data.data.nextToken) {
  //     await Axios.get(apiUrl).then((res) => setData(res.data));
  //     setItemList([...itemList, ...data.data]);
  //     DataLog(itemList);
  //   } else if (data.data.nextToken == nextToken) {
  //     await Axios.get(apiUrl).then((res) => setData(res.data));
  //     setItemList([...itemList, ...data.data]);
  //     DataLog(itemList);
  //   } else if (data.data.nextToken != nextToken) {
  //     setNextToken(data.data.nextToken);
  //     await Axios.get(apiUrl).then((res) => setData(res.data));
  //   }

  //   DataLog(itemList);
  //   console.log(itemList);
  // };

  // 여기 추가
  const getCoupangListMain = async () => {
    const apiUrl = `http://localhost:3034/api/1?nextToken=${nextToken}`;
    await Axios.get(apiUrl).then((res) => setData(res.data));

    if (typeof data.data.nextToken == undefined || data.data.nextToken == nextToken) {
      setItemList([...new Set([...itemList, ...data.data])]);
      DataLog(itemList);
    } else if (data.data.nextToken != nextToken) {
      setNextToken(data.data.nextToken);
      await Axios.get(apiUrl).then((res) => setData(res.data));
      setItemList([...new Set([...itemList, ...data.data])]);
    }
  };

  //

  const getCoupangListe = async () => {
    const apiUrl = 'http://localhost:3034/api/3';
    await Axios.get(apiUrl).then((res) => setItemList([...itemList, ...res.data.data]));
    console.log(itemList);
    DataLog(itemList);
  };

  const DataLog = (data) => {
    const result = {};

    // console.log(data.nextToken);
    //forEach 함수를 통해서 같은값을 아이템과 아이템 수량을 체크한다 !
    data.forEach((x) => {
      result[x.orderItems[0].vendorItemId] = (result[x.orderItems[0].vendorItemId] || 0) + 1;
    });

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
  };
  const totalCount =
    twentyL + twentyM + twentyS + tenL + tenM + tenS + fiveL + fiveM + fiveS + threeL + threeM + threeS;

  function ButtonFirst() {
    setFirstBt(true);
    if (itemList.length < 50) {
      getCoupangList();
    } else if (itemList.length >= 50) {
      getCoupangList(list.list.nextToken);
      setNextToken();
      setFirstBt(true);
    }
  }

  function ButtonSecond() {
    setSecondBt(true);
    if (itemList.length < 50) {
      getCoupangList();
    } else if (itemList.length >= 50) {
      getCoupangList();
      setSecondBt(true);
    }
  }

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
            초기값 불러오기(50개)
          </Button>
          <Button
            disabled={secondBt}
            onClick={ButtonSecond}
            variant="contained"
            color="secondary"
            endIcon={<Iconify icon="ic:round-access-alarm" />}
          >
            다음 데이터 새로고침
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
    </Page>
  );
}
