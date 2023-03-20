// @mui
import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';
// components
import Scrollbar from '../Scrollbar';
//
import CollapsibleTableRow from './CollapsibleTableRow';

import Axios from 'axios';
import { useState } from 'react';
import { result } from 'lodash';

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
              <TableCell align="right">사이즈 (장아찌)</TableCell>
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
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[0] + data[1] + data[2]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>2022년-15kg</TableCell>
            <TableCell align="right">{data[14]}</TableCell>
            <TableCell align="right">{data[15]}</TableCell>
            <TableCell align="right">{data[16]}</TableCell>
            <TableCell align="right">{data[17]}</TableCell>
            <TableCell align="right">{data[18]}</TableCell>
            <TableCell align="right">{data[14] + data[15] + data[16] + data[17] + data[18]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>2022년-10kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[13]}</TableCell>
            <TableCell align="right">{data[19]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5] + data[13] + data[19]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[6] + data[7] + data[8] + data[12]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>베트남당근</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[20]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[20]}</TableCell>
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
              <TableCell align="right">사이즈 (장아찌)</TableCell>
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
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[0] + data[1] + data[2]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>10kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">{data[15]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5] + data[13] + data[15]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">{data[14]}</TableCell>
            <TableCell align="right">{data[6] + data[7] + data[8] + data[12] + data[14]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>베트남당근</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[16]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[16]}</TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}

export function TotalTable({ totaldata }) {

  const obj = {
    header: ["단위", "수량(개)", "단가(원)", "합계금액(원)"],
    data: [
      { kg: "당근10kg(중)", price: 7000, data: 16 },
      { kg: "5kg(특)", price: 12000, data: 6 },
      { kg: "5kg(대)", price: 12000, data: 7 },
      { kg: "5kg(중)", price: 12000, data: 8 },
      { kg: "5kg(소)", price: 12000, data: 12 },
      { kg: "5kg(장아찌)", price: 12000, data: 14 },
      { kg: "10kg(특)", price: 18000, data: 3 },
      { kg: "10kg(대)", price: 18000, data: 4 },
      { kg: "10kg(중)", price: 18000, data: 5 },
      { kg: "10kg(소)", price: 18000, data: 12 },
      { kg: "10kg(장아찌)", price: 16000, data: 15 },
      { kg: "15kg(특)", price: 24000, data: 0 },
      { kg: "15kg(대)", price: 24000, data: 0 },
      { kg: "15kg(중)", price: 24000, data: 0 },
      { kg: "15kg(소)", price: 24000, data: 0 },
      { kg: "15kg(장아찌)", price: 20000, data: 0 },
    ],
  };


  const result = obj.data.reduce((acc, cur, i) => {
    return acc + Number(totaldata[cur.data] * cur.price)
  }, 0);



  return (
    <Scrollbar>
      <TableContainer sx={{ minWidth: 800, mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {obj.header.map((item, i) => {
                return (<TableCell key={i}>{item}</TableCell>);
              })}

              <TableCell style={{ color: "#ff0000" }}>
                {result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                } </TableCell>
            </TableRow>
          </TableHead>
          { }
          <TableBody>
            {obj.data.map((item, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>{item.kg}</TableCell>
                  <TableCell>{totaldata[item.data]}</TableCell>
                  <TableCell>{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
                  <TableCell>{(totaldata[item.data] * item.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}
