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
            <TableCell>2023년-15kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5] + data[6] + data[7]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>2023년-10kg</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">{data[12]}</TableCell>
            <TableCell align="right">{data[8] + data[9] + data[10] + data[11] + data[12]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[30]}</TableCell>
            <TableCell align="right">{data[31]}</TableCell>
            <TableCell align="right">{data[32]}</TableCell>
            <TableCell align="right">{data[33]}</TableCell>
            <TableCell align="right">{data[34]}</TableCell>
            <TableCell align="right">{data[30] + data[31] + data[32] + data[33] + data[34]}</TableCell>
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>감자(kg)</TableCell>
              <TableCell align="right">사이즈 (왕특)</TableCell>
              <TableCell align="right">사이즈 (특)</TableCell>
              <TableCell align="right">사이즈 (상)</TableCell>
              <TableCell align="right">사이즈 (중)</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>감자 5kg</TableCell>
            <TableCell align="right">{data[22]}</TableCell>
            <TableCell align="right">{data[23]}</TableCell>
            <TableCell align="right">{data[24]}</TableCell>
            <TableCell align="right">{data[25]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[22] + data[23] + data[24] + data[25]}</TableCell>
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>마늘(kg)</TableCell>
              <TableCell align="right">사이즈 (대)</TableCell>
              <TableCell align="right">사이즈 (중)</TableCell>
              <TableCell align="right">사이즈 (소)</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>마늘 1kg</TableCell>
            <TableCell align="right">{data[13]}</TableCell>
            <TableCell align="right">{data[14]}</TableCell>
            <TableCell align="right">{data[15]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[13] + data[14] + data[15]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>마늘 10kg</TableCell>
            <TableCell align="right">{data[16]}</TableCell>
            <TableCell align="right">{data[17]}</TableCell>
            <TableCell align="right">{data[18]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[16] + data[17] + data[18]}</TableCell>
          </TableBody>

          <TableBody>
            <TableCell />
            <TableCell>마늘 20kg</TableCell>
            <TableCell align="right">{data[19]}</TableCell>
            <TableCell align="right">{data[20]}</TableCell>
            <TableCell align="right">{data[21]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[19] + data[20] + data[21]}</TableCell>
          </TableBody>

          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>깐양파(kg)</TableCell>
              <TableCell align="right">사이즈 (대)</TableCell>
              <TableCell align="right">사이즈 (중)</TableCell>
              <TableCell align="right">사이즈 (소)</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>깐양파 10kg</TableCell>
            <TableCell align="right">{data[27]}</TableCell>
            <TableCell align="right">{data[28]}</TableCell>
            <TableCell align="right">{data[29]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[27] + data[28] + data[29]}</TableCell>
          </TableBody>

          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>당근 - 무(kg)</TableCell>
              <TableCell align="right">당근3kg</TableCell>
              <TableCell align="right">당근5kg</TableCell>
              <TableCell align="right">점프</TableCell>
              <TableCell align="right">무우(20kg)</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>당근 - 무(kg)</TableCell>
            <TableCell align="right">{data[35]}</TableCell>
            <TableCell align="right">{data[36]}</TableCell>
            <TableCell align="right">데이터없음</TableCell>
            <TableCell align="right">{data[37]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[35] + data[36] + data[37]}</TableCell>
          </TableBody>

          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>고구마 (3kg)</TableCell>
              <TableCell align="right">고구마3kg(xl)</TableCell>
              <TableCell align="right">고구마3kg(l)</TableCell>
              <TableCell align="right">고구마3kg(m)</TableCell>
              <TableCell align="right">고구마3kg(s)</TableCell>
              <TableCell align="right">없음</TableCell>
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>당근 - 무(kg)</TableCell>
            <TableCell align="right">{data[38]}</TableCell>
            <TableCell align="right">{data[39]}</TableCell>
            <TableCell align="right">{data[40]}</TableCell>
            <TableCell align="right">{data[41]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[38] + data[39] + data[40] + data[41]}</TableCell>
          </TableBody>







          {/* <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody> */}
          <TableBody>
            <TableCell />
            <TableCell>베트남당근</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[26]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[26]}</TableCell>
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
          <TableBody>
            <TableCell />
            <TableCell>감자5kg</TableCell>
            <TableCell align="right">{data[17]}</TableCell>
            <TableCell align="right">{data[18]}</TableCell>
            <TableCell align="right">{data[19]}</TableCell>
            <TableCell align="right">{data[20]}</TableCell>
            <TableCell align="right">없음</TableCell>
            <TableCell align="right">{data[17] + data[18] + data[19] + data[20]}</TableCell>
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
      // { kg: "당근10kg(중)", price: 7000, data: 16 },
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
      { kg: "감자5kg(왕특)", price: 20000, data: 17 },
      { kg: "감자5kg(특)", price: 20000, data: 18 },
      { kg: "감자5kg(상)", price: 20000, data: 19 },
      { kg: "감자5kg(중)", price: 20000, data: 20 },
      //마늘추가 21부터 
      { kg: "마늘1kg(대)", price: 20000, data: 21 },
      { kg: "마늘1kg(중)", price: 20000, data: 22 },
      { kg: "마늘1kg(소)", price: 20000, data: 23 },
      { kg: "마늘10kg(대)", price: 20000, data: 24 },
      { kg: "마늘10kg(중)", price: 20000, data: 25 },
      { kg: "마늘10kg(소)", price: 20000, data: 26 },
      { kg: "마늘20kg(대)", price: 20000, data: 27 },
      { kg: "마늘20kg(중)", price: 20000, data: 28 },
      { kg: "마늘20kg(소)", price: 20000, data: 29 },
      //깐양파 추가 
      { kg: "깐양파10kg(대)", price: 20000, data: 30 },
      { kg: "깐양파10kg(중)", price: 20000, data: 31 },
      { kg: "깐양파10kg(소)", price: 20000, data: 32 },



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
