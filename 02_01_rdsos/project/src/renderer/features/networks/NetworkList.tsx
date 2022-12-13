import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppSelector } from 'renderer/hooks';
import NetworkCard from './NetworkCard';
import { selectNetworks } from './networksSlice';

export default function NetworkList() {
  React.useMemo(() => window.electron.scan(), []);

  const networks = useAppSelector(selectNetworks);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <List>
        {networks.map((network) => (
          <ListItem divider key={network.ssid}>
            <NetworkCard {...network} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
