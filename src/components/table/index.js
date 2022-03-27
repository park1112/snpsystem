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

const TABLE_DATA = [
  createData('20kg', [0], 6.0, 24, 4.0, 3.99, [
    {
      date: '2020-01-05',
      customerId: '쿠팡',
      amount: 350,
    },
    {
      date: '2020-01-02',
      customerId: '지마켓옥션',
      amount: 200,
    },
  ]),
  createData('10kg', 237, 9.0, 37, 4.3, 4.99, [
    {
      date: '2020-01-05',
      customerId: 'vndndndn',
      amount: 350,
    },
    {
      date: '2020-01-02',
      customerId: '지마켓옥션',
      amount: 200,
    },
  ]),
  createData('5kg', 262, 16.0, 24, 6.0, 3.79, [
    {
      date: '2020-01-05',
      customerId: '쿠팡',
      amount: 350,
    },
    {
      date: '2020-01-02',
      customerId: '지마켓옥션',
      amount: 200,
    },
  ]),
  createData('3kg', 305, 3.7, 67, 4.3, 2.5, [
    {
      date: '2020-01-05',
      customerId: '쿠팡',
      amount: 350,
    },
    {
      date: '2020-01-02',
      customerId: '지마켓옥션',
      amount: 200,
    },
  ]),
  createData('합계', 305, 3.7, 67, 4.3, 2.5, [
    {
      date: '2020-01-05',
      customerId: '쿠팡',
      amount: 350,
    },
    {
      date: '2020-01-02',
      customerId: '지마켓옥션',
      amount: 200,
    },
  ]),
];

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
              <TableCell align="right">합계</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableCell />
            <TableCell>20kg</TableCell>
            <TableCell align="right">{data[0]}</TableCell>
            <TableCell align="right">{data[1]}</TableCell>
            <TableCell align="right">{data[2]}</TableCell>
            <TableCell align="right">{data[0] + data[1] + data[2]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>10kg</TableCell>
            <TableCell align="right">{data[3]}</TableCell>
            <TableCell align="right">{data[4]}</TableCell>
            <TableCell align="right">{data[5]}</TableCell>
            <TableCell align="right">{data[3] + data[4] + data[5]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>5kg</TableCell>
            <TableCell align="right">{data[6]}</TableCell>
            <TableCell align="right">{data[7]}</TableCell>
            <TableCell align="right">{data[8]}</TableCell>
            <TableCell align="right">{data[6] + data[7] + data[8]}</TableCell>
          </TableBody>
          <TableBody>
            <TableCell />
            <TableCell>3kg</TableCell>
            <TableCell align="right">{data[9]}</TableCell>
            <TableCell align="right">{data[10]}</TableCell>
            <TableCell align="right">{data[11]}</TableCell>
            <TableCell align="right">{data[9] + data[10] + data[11]}</TableCell>
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}
