import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { GridColDef } from '@mui/x-data-grid';
import { useAppSelector } from 'renderer/hooks';
import { selectPackets } from './snifferSlice';
import { EthFrame } from '../../../lib/ethTypes';

function Row(props: { frame: EthFrame }) {
  const { frame } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell scope="row">{frame.destMAC}</TableCell>
        <TableCell scope="row">{frame.srcMAC}</TableCell>
        <TableCell scope="row">{frame.ip.version}</TableCell>
        <TableCell scope="row">{frame.ip.srcIpAddress}</TableCell>
        <TableCell scope="row">{frame.ip.dstIpAddress}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Protocol</TableCell>
                    <TableCell>Source Port</TableCell>
                    <TableCell>Destionation Port</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={`${frame.id} details`}>
                    <TableCell component="th" scope="row">
                      {frame.ip.protocol}
                    </TableCell>
                    <TableCell>{frame.ip.tcp.srcPort}</TableCell>
                    <TableCell>{frame.ip.tcp.dstPort}</TableCell>
                    <TableCell>{frame.ip.tcp.data || 'No data'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const columns: GridColDef<EthFrame>[] = [
  { field: 'destMAC', headerName: 'Destionation MAC', width: 150 },
  { field: 'srcMAC', headerName: 'Source MAC', width: 150 },
  {
    field: 'ipVersion',
    headerName: 'IP version',
    width: 80,
    type: 'number',
  },
  {
    field: 'ipSrcAddress',
    headerName: 'Source IP',
    width: 150,
  },
  {
    field: 'ipDstAddress',
    headerName: 'Destionation IP',
    width: 150,
  },
];
export default function PacketList() {
  const packets = useAppSelector(selectPackets);

  return (
    <TableContainer component={Paper} sx={{ minWidth: '75vw' }}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((col) => (
              <TableCell key={col.headerName}>{col.headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {packets.map((p) => (
            <Row key={p.id} frame={p} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
