import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LeakAddIcon from '@mui/icons-material/LeakAdd';
import HttpIcon from '@mui/icons-material/Http';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

const drawerWidth = 200;

export default function NavDrawer() {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open
    >
      <Divider />
      <List>
        <Link component={RouterLink} to="/">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <LeakAddIcon />
              </ListItemIcon>
              <ListItemText primary="Scanner" />
            </ListItemButton>
          </ListItem>
        </Link>
        <Divider />
        <Link component={RouterLink} to="/sniffer">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HttpIcon />
              </ListItemIcon>
              <ListItemText primary="Sniffer" />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
    </Drawer>
  );
}
