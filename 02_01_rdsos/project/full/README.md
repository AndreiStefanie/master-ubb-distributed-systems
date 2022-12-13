# RDSOS Project

Network Scanner + Packet Sniffer for [RDSOS](http://www.cs.ubbcluj.ro/~forest/rdsos/).

## Technical

The application is a desktop application built with [Electron](https://www.electronjs.org/) and [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate).

To retrieve the network data, it uses [libpcap](https://www.tcpdump.org/manpages/pcap.3pcap.html) through the Node.js bindings offered by [node-pcap](https://github.com/node-pcap/node_pcap).

It can parse [beacon frames](https://en.wikipedia.org/wiki/Beacon_frame) (for networing scanning) and [ethernet frames](https://en.wikipedia.org/wiki/Ethernet_frame) (for packet sniffing).

For network scanning, it switches the network device to [monitor mode](https://en.wikipedia.org/wiki/Monitor_mode). **Make sure you are not connected to any WiFi network.**
