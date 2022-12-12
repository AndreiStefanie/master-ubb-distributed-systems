import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WifiIndicator, { DBMToSignalStrength } from 'react-wifi-indicator';
import { Network } from './networksSlice';

export default function NetworkCard({
  signal,
  ssid,
  channel,
  frequency,
  bssid,
}: Network) {
  return (
    <>
      <ListItemAvatar>
        <WifiIndicator strength={DBMToSignalStrength(signal)} />
      </ListItemAvatar>
      <ListItemText
        primary={`${ssid} (${bssid})`}
        secondary={
          <>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="caption"
            >
              Channel {channel} | Frequency {frequency} GHz
            </Typography>
          </>
        }
      />
    </>
  );
}
