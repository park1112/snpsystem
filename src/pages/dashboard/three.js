import { CardHeader, Container, Grid, Typography, Card, Button, Box } from '@mui/material';
// layouts
import Layout from '../../layouts';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import useFetch from '../../hooks/useFatch';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import create from 'zustand';
import CoupangData from '../../utils/useStore';

import CollapsibleTable from '../../components/table';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { set } from 'lodash';
import useStore from '../../utils/useStore';

// ----------------------------------------------------------------------

PageThree.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------
// if (data ==  ){
// }\

console.log('데이터 테스트');

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

export default function PageThree(data) {
  // const [tatleData, setTotalData] = useState({
  //   threeL: 0,
  //   threeM: 0,
  //   threeS: 0,
  //   fiveL: 0,
  //   fiveM: 0,
  //   fiveS: 0,
  //   tenL: 0,
  //   tenM: 0,
  //   tenS: 0,
  //   twentyL: 0,
  //   twentyM: 0,
  //   twentyS: 0,
  // });

  // const twentTotal = tatleData.twentyL + tatleData.twentyM + tatleData.twentyS;
  // const tenTotal = tatleData.tenL + tatleData.tenM + tatleData.tenS;
  // const fiveTotal = tatleData.fiveL + tatleData.fiveM + tatleData.fiveS;
  // const threeTotal = tatleData.threeL + tatleData.threeM + tatleData.threeS;

  // const rows = [
  //   createData('20키로', tatleData.twentyL, tatleData.twentyM, tatleData.twentyS, twentTotal),
  //   createData('10키로', tatleData.tenL, tatleData.tenM, tatleData.tenS, tenTotal),
  //   createData('5키로', tatleData.fiveL, tatleData.fiveM, tatleData.fiveS, fiveTotal),
  //   createData('3키로', tatleData.threeL, tatleData.threeM, tatleData.threeS, threeTotal),
  // ];

  const pupies = useStore((state) => state.pupies);
  const addpuppy = useStore((state) => state.addPuppy);

  const [twentyL, setTwentyL] = useState();
  const [twentyM, setTwentyM] = useState();
  const [twentyS, setTwentyS] = useState();
  const [tenL, setTenL] = useState();
  const [tenM, setTenM] = useState();
  const [tenS, setTenS] = useState();
  const [fiveL, setFiveL] = useState();
  const [fiveM, setFiveM] = useState();
  const [fiveS, setFiveS] = useState();
  const [threeL, setThreeL] = useState();
  const [threeM, setThreeM] = useState();
  const [threeS, setThreeS] = useState();

  const twentTotal = twentyL + twentyM + twentyS;
  const tenTotal = tenL + tenM + tenS;
  const fiveTotal = fiveL + fiveM + fiveS;
  const threeTotal = threeL + threeM + threeS;

  const rows = [
    createData('20키로', twentyL, twentyM, twentyS, twentTotal),
    createData('10키로', tenL, tenM, tenS, tenTotal),
    createData('5키로', fiveL, fiveM, fiveS, fiveTotal),
    createData('3키로', threeL, threeM, threeS, threeTotal),
  ];
  const logn = 0;

  const { themeStretch } = useSettings();
  console.log(data);
  console.log(data.data[0].orderItems[0].vendorItemId);

  // const add = data.data.map((i) => {
  //   if (i.orderItems[0].vendorItemId == 78670305294) {
  //     return (setTwentyL = i.orderItems[0].shippingCount);
  //   }

  // switch (i.orderItems[0].vendorItemId) {
  //   case 78670305294:
  //     return setTwentyL + i.orderItems[0].shippingCount;
  //   // case 75962046384:
  //   return (setTenL = tenL + i.orderItems[0].shippingCount);
  // case 75962046334:
  //   return (setFiveL = fiveL + i.orderItems[0].shippingCount);
  // case 75962046427:
  //   return (setThreeL = threeL + i.orderItems[0].shippingCount);
  // case 78670337609:
  //   return (tatleData.twentyM = tatleData.twentyM + i.orderItems[0].shippingCount);
  // case 75938820657:
  //   return (tatleData.tenM = tatleData.tenM + i.orderItems[0].shippingCount);
  // case 75938820679:
  //   return (tatleData.fiveM = tatleData.fiveM + i.orderItems[0].shippingCount);
  // case 75938820691:
  //   return (tatleData.threeM = tatleData.threeM + i.orderItems[0].shippingCount);
  // case 78670343332:
  //   return (tatleData.twentyS = tatleData.twentyS + i.orderItems[0].shippingCount);
  // case 75962239234:
  //   return (tatleData.tenS = tatleData.tenS + i.orderItems[0].shippingCount);
  // case 75962239207:
  //   return (tatleData.fiveS = tatleData.fiveS + i.orderItems[0].shippingCount);
  // case 75962239350:
  //   return (tatleData.threeS = tatleData.threeS + i.orderItems[0].shippingCount);

  // const [twentyL, setTwentyL] = useState();
  // const [twentyM, setTwentyM] = useState();
  // const [twentyS, setTwentyS] = useState();
  // const [tenL, setTenL] = useState();
  // const [tenM, setTenM] = useState();
  // const [tenS, setTenS] = useState();
  // const [fiveL, setFiveL] = useState();
  // const [fiveM, setFiveM] = useState();
  // const [fiveS, setFiveS] = useState();
  // const [threeL, setThreeL] = useState();
  // const [threeM, setThreeM] = useState();
  // const [threeS, setThreeS] = useState();
  // default:
  //   return;
  // }
  // });

  // if(i.orderItems[0].vendorItemId == 6096247667){
  //   twentyL = twentyL + i.orderItems[0].shippingCount
  // } else if

  return (
    <Page title="Page Three">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Button onClick={addpuppy}>초기화!</Button>

        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>오픈마켓 판매수량 (total)</TableCell>
              <TableCell align="right">특{pupies}</TableCell>
              <TableCell align="right">대</TableCell>
              <TableCell align="right">중</TableCell>
              <TableCell align="right">총합계(total)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </Page>
  );
}

// 저장용 복사하기 !!
// const DataLog = (data) => {
//   const result = {};

//   console.log(data);
//   // console.log(data.nextToken);
//   data.forEach((x) => {
//     result[x.orderItems[0].vendorItemId] = (result[x.orderItems[0].vendorItemId] || 0) + 1;
//   });
//   for (const [key, value] of Object.entries(result)) {
//     switch (key) {
//       case '78670305294':
//         setTwentyL(twentyL + value);
//         break;
//       case '78670337609':
//         setTwentyM(twentyM + value);
//         break;
//       case '78670343332':
//         setTwentyS(twentyS + value);
//         break;

//       case '75962046384':
//         setTenL(tenL + value);
//         break;
//       case '75938820657':
//         setTenM(tenM + value);
//         break;
//       case '75962239234':
//         setTenS(tenS + value);
//         break;

//       case '75962046334':
//         setFiveL(fiveL + value);
//         break;
//       case '75938820679':
//         setFiveM(fiveM + value);
//         break;
//       case '75962239207':
//         setFiveS(fiveS + value);
//         break;

//       case '75962046427':
//         setThreeL(threeL + value);
//         break;
//       case '75938820691':
//         setThreeM(threeM + value);
//         break;
//       case '75962239350':
//         setThreeS(threeS + value);
//         break;
//     }
//   }
// };
