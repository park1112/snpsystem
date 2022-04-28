// @mui
import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';
// components
import Scrollbar from '../Scrollbar';
//
import CollapsibleTableRow from './CollapsibleTableRow';

import Axios from 'axios';
import { useState } from 'react';

// ----------------------------------------------------------------------

export function createData(name, calories, fat, carbs, protein, price, history) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    history,
  };
}

export default function CollapsibleTable({ data }) {
  return (
    <Scrollbar>
      <TableContainer sx={{ minWidth: 800, mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>무게(kg)</TableCell>
              <TableCell align="right">사이즈 (특)</TableCell>
              <TableCell align="right">사이즈 (대)</TableCell>
              <TableCell align="right">사이즈 (중)</TableCell>
              <TableCell align="right">사이즈 (소)</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>20kg</TableCell>
            <TableCell align="right">{data[0]}</TableCell>
            <TableCell align="right">{data[1]}</TableCell>
            <TableCell align="right">{data[2]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[0] + data[1] + data[2]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>2022년-15kg</TableCell>
            <TableCell align="right">{data[14]}</TableCell>
            <TableCell align="right">{data[15]}</TableCell>
            <TableCell align="right">{data[16]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[14] + data[15] + data[16]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>2022년-10kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[13]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5] + data[13]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">{data[6] + data[7] + data[8] + data[12]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}

export function ArgoTotal({ data }) {
  return (
    <Scrollbar>
      <TableContainer sx={{ minWidth: 800, mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>무게(kg)</TableCell>
              <TableCell align="right">사이즈 (특)</TableCell>
              <TableCell align="right">사이즈 (대)</TableCell>
              <TableCell align="right">사이즈 (중)</TableCell>
              <TableCell align="right">사이즈 (소)</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>20kg</TableCell>
            <TableCell align="right">{data[0]}</TableCell>
            <TableCell align="right">{data[1]}</TableCell>
            <TableCell align="right">{data[2]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[0] + data[1] + data[2]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>10kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[13]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5] + data[13]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">{data[6] + data[7] + data[8] + data[12]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}

export function TotalTable({ totaldata }) {
  const amountFifteen = [13000, 13000, 12000, 8000];
  const amountTen = [11000, 10500, 10000, 7500];
  const amountFive = [7500, 7000, 6500, 6000];

  const totalCountTwenty = totaldata[0] + totaldata[1] + totaldata[2];
  const totalCountTen = totaldata[3] + totaldata[4] + totaldata[5] + totaldata[13];
  const totalCountFive = totaldata[6] + totaldata[7] + totaldata[8] + totaldata[12];
  const totalCountThree = totaldata[9] + totaldata[10] + totaldata[11];

  const sumTotalpiace =
    totaldata[0] * amountFifteen[0] +
    totaldata[1] * amountFifteen[1] +
    totaldata[2] * amountFifteen[2] +
    totaldata[3] * amountTen[0] +
    totaldata[4] * amountTen[1] +
    totaldata[5] * amountTen[2] +
    totaldata[13] * amountTen[3] +
    totaldata[6] * amountFive[0] +
    totaldata[7] * amountFive[1] +
    totaldata[8] * amountFive[2] +
    totaldata[12] * amountFive[3] +
    totaldata[9] +
    totaldata[10] +
    totaldata[11];
  // 3키로는 안팔기때문에 없음! 나중에 팔면 추가할것!

  const sumTotalCount = totalCountTwenty + totalCountTen + totalCountFive + totalCountThree;
  return (
    <Scrollbar>
      <TableContainer sx={{ minWidth: 800, mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>무게(kg)</TableCell>
              <TableCell align="right">15kg</TableCell>
              <TableCell align="right">10kg</TableCell>
              <TableCell align="right">5kg</TableCell>
              <TableCell align="right">3kg</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>합계수량</TableCell>
            <TableCell align="right">{totalCountTwenty}</TableCell>
            <TableCell align="right">{totalCountTen}</TableCell>
            <TableCell align="right">{totalCountFive}</TableCell>
            <TableCell align="right">{totalCountThree}</TableCell>
          </TableBody>

          <TableBody>
            <TableCell />
            <TableCell>크기(특)</TableCell>
            <TableCell align="right">{amountFifteen[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountTen[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountFive[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">0</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>크기(대)</TableCell>
            <TableCell align="right">{amountFifteen[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountTen[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountFive[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">0</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>크기(중)</TableCell>
            <TableCell align="right">{amountFifteen[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountTen[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountFive[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">0</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>크기(소)</TableCell>
            <TableCell align="right">{amountFifteen[3].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountTen[3].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">{amountFive[3].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
            <TableCell align="right">0</TableCell>
          </TableBody>

          <TableBody>
            <TableCell />
            <TableCell>총지급금액</TableCell>
            <TableCell align="right">
              {(totalCountTwenty * amountFifteen[0]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </TableCell>
            <TableCell align="right">
              {(totalCountTen * amountFifteen[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </TableCell>
            <TableCell align="right">
              {(totalCountFive * amountFifteen[2]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </TableCell>
            <TableCell align="right">
              {(totalCountThree * amountFifteen[3]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell> </TableCell>
            <TableCell align="right">총 판매수량</TableCell>
            <TableCell align="right">{sumTotalCount}개</TableCell>
            <TableCell align="right">총 합계금액</TableCell>
            <TableCell align="right">{sumTotalpiace.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 원</TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}
