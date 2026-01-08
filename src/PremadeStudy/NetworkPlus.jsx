import React, { useState } from 'react';
import StudyApp from './StudyApp';
import QuizApp from './QuizApp';

// ==========================================
// SECTION 1: DATA OPTIMIZATION HELPERS
// ==========================================

// Domain Mapping to save text space
const D_NAMES = {
  1: "Networking Fundamentals",
  2: "Wireless Networking",
  3: "Network Management",
  4: "Security Principles",
  5: "Threats & Attacks",
  6: "Cryptography",
  7: "IAM & Admin"
};

/**
 * Question Generator Helper with TAGS
 */
const q = (id, d, s, t, q, o, a, e) => ({
  id,
  domain: D_NAMES[d],
  section: `${d}.${s}`,
  tags: t, 
  question: q,
  options: o,
  correctAnswer: a,
  explanation: e
});

// ==========================================
// SECTION 2: DATA SETS
// ==========================================

export const NETWORK_PLUS_QUESTIONS = [
  // --- DOMAIN 1: NETWORKING FUNDAMENTALS ---
  q(1001, 1, "1", ["Topology", "Hardware"], "Which of the following network topologies connects all devices to a single central device, such as a switch, creating a single point of failure for the entire network segment?", ["Bus Topology", "Star Topology", "Ring Topology", "Mesh Topology"], "Star Topology", "A Star topology connects all nodes to a central device. If this central device fails, the entire network goes down."),
  q(1002, 1, "1", ["Topology", "Redundancy"], "You are designing a network for a critical data center that requires the highest possible level of redundancy. Which topology should you select?", ["Full Mesh", "Partial Mesh", "Bus", "Star"], "Full Mesh", "A Full Mesh topology connects every device to every other device, offering the highest level of fault tolerance and redundancy."),
  q(1003, 1, "2", ["OSI", "Hardware"], "Routers determine the best path for data packets based on logical IP addresses. At which layer of the OSI model do routers primarily operate?", ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 1 (Physical)"], "Layer 3 (Network)", "Routers operate at Layer 3 (The Network Layer) because they route traffic using logical IP addresses."),
  q(1004, 1, "1", ["Hardware", "Traffic"], "Which legacy network device operates at Layer 1 and broadcasts all incoming data out of every port, effectively creating a single large collision domain?", ["Switch", "Router", "Hub", "Bridge"], "Hub", "A Hub is a Layer 1 device that blindly repeats signals to all ports, which is inefficient and causes collisions."),
  q(1005, 1, "2", ["OSI", "Protocol"], "Which Transport Layer protocol is considered 'connectionless' and does not guarantee the delivery or ordering of packets?", ["TCP", "UDP", "IP", "HTTP"], "UDP", "UDP (User Datagram Protocol) is a connectionless protocol used for speed (like streaming), but it does not verify that data arrived."),
  q(1006, 1, "3", ["Cabling", "Physical"], "When terminating a cable using the T568B standard, which wire color is placed in the first pin position?", ["White-Orange", "Orange", "White-Green", "Blue"], "White-Orange", "The T568B wiring standard begins with White-Orange, followed by Orange, White-Green, Blue, White-Blue, Green, White-Brown, and Brown."),
  q(1007, 1, "4", ["Storage", "Hardware"], "What is the primary architectural difference between a Storage Area Network (SAN) and Network Attached Storage (NAS)?", ["NAS provides Block-level access; SAN provides File-level access", "NAS provides File-level access; SAN provides Block-level access", "There is no difference; they are the same", "SAN relies exclusively on wireless connectivity"], "NAS provides File-level access; SAN provides Block-level access", "A NAS appears as a file server (SMB/NFS), whereas a SAN appears to the server as a local hard drive (Block-level access)."),
  q(1008, 1, "4", ["Addressing", "IPv4"], "Which Class of IPv4 addresses uses a default subnet mask of 255.0.0.0 and supports over 16 million hosts per network?", ["Class A", "Class B", "Class C", "Class D"], "Class A", "Class A networks range from 1.0.0.0 to 126.0.0.0 and have a default subnet mask of /8, supporting millions of hosts."),
  q(1009, 1, "4", ["Addressing", "IPv4", "Troubleshooting"], "A user reports they cannot access the internet. You check their IP address and see it is 169.254.12.45. What does this indicate?", ["The device uses a static IP", "The device failed to contact a DHCP server (APIPA)", "The device is using a Loopback address", "The device is connected to a Multicast network"], "The device failed to contact a DHCP server (APIPA)", "An address starting with 169.254.x.x is an APIPA address, which the OS assigns itself when it cannot find a DHCP server."),
  q(1010, 1, "2", ["OSI", "Session"], "Which layer of the OSI model is responsible for establishing, managing, and terminating sessions between local and remote applications?", ["Session Layer", "Transport Layer", "Application Layer", "Presentation Layer"], "Session Layer", "The Session Layer (Layer 5) manages the dialog (session) between two computers."),
  q(1011, 1, "2", ["OSI", "Addressing"], "Media Access Control (MAC) addresses are physical hardware addresses. At which layer of the OSI model do they exist?", ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], "Layer 2", "MAC addresses are used for physical addressing at the Data Link Layer (Layer 2)."),
  q(1012, 1, "2", ["OSI", "Theory"], "Data at the Network Layer (Layer 3) is encapsulated into which Protocol Data Unit (PDU)?", ["Frame", "Packet", "Segment", "Bit"], "Packet", "Layer 1 uses Bits, Layer 2 uses Frames, Layer 3 uses Packets, and Layer 4 uses Segments."),
  q(1013, 1, "1", ["Hardware", "Traffic"], "Which network device is capable of breaking up collision domains on each port but maintains a single broadcast domain for all connected devices?", ["Hub", "Switch", "Router", "Repeater"], "Switch", "A Switch isolates collision domains to individual ports but still forwards broadcast traffic to all ports."),
  q(1014, 1, "3", ["Cabling", "Safety"], "You are running network cables through the drop ceiling space used for HVAC air return. Which cable rating must you use to comply with fire codes?", ["Riser", "PVC", "Plenum", "Shielded"], "Plenum", "Plenum-rated cables have a special jacket that is fire-resistant and emits low smoke, required for air handling spaces."),
  q(1015, 1, "3", ["Cabling", "Fiber"], "Which type of fiber optic cable uses a laser as the light source and is capable of carrying data over extremely long distances (kilometers)?", ["Multi-Mode", "Single-Mode", "Coaxial", "Cat6"], "Single-Mode", "Single-Mode fiber has a tiny core and uses lasers, allowing for long-distance transmission with minimal signal loss."),
  q(1016, 1, "1", ["Theory", "Traffic"], "Which communication mode allows data to be transmitted and received simultaneously, similar to a telephone conversation?", ["Half-Duplex", "Full-Duplex", "Simplex", "Multiplex"], "Full-Duplex", "Full-Duplex allows simultaneous two-way communication. Half-Duplex allows two-way communication, but only one at a time (like a walkie-talkie)."),
  q(1017, 1, "2", ["OSI", "Encryption"], "Data formatting, encryption, and compression occur at which layer of the OSI model?", ["Application", "Presentation", "Session", "Transport"], "Presentation", "The Presentation Layer (Layer 6) acts as a translator, handling encryption and file formats."),
  q(1018, 1, "4", ["Addressing", "IPv4"], "Which IPv4 address is reserved for loopback testing to verify the local TCP/IP stack?", ["127.0.0.1", "192.168.1.1", "10.0.0.1", "169.254.1.1"], "127.0.0.1", "The 127.0.0.0/8 range is reserved for loopback. Pinging 127.0.0.1 tests if the local network card drivers are working."),
  q(1019, 1, "4", ["Addressing", "IPv4"], "Which of the following IP addresses falls within the private Class B range?", ["10.1.1.1", "172.20.1.1", "192.168.1.1", "172.40.1.1"], "172.20.1.1", "The private Class B range is 172.16.0.0 to 172.31.255.255. Therefore, 172.20.1.1 is private."),
  q(1020, 1, "1", ["Topology", "Traffic"], "In a legacy Ring topology, what mechanism is used to prevent data collisions?", ["CSMA/CD", "CSMA/CA", "Token Passing", "Switching"], "Token Passing", "Devices in a ring topology pass a digital 'token' around. Only the device holding the token is allowed to transmit data."),
  q(1021, 1, "3", ["Cabling", "Speed"], "What is the maximum distance for a Cat6 cable running at 10 Gbps speeds?", ["100 meters", "55 meters", "30 meters", "10 meters"], "55 meters", "Cat6 supports 10 Gbps up to 55 meters. For the full 100 meters at 10 Gbps, Cat6a is required."),
  q(1022, 1, "2", ["OSI", "Addressing"], "Logical addressing (IP addresses) occurs at which layer of the OSI model?", ["Layer 2", "Layer 3", "Layer 4", "Layer 5"], "Layer 3", "Layer 3 (The Network Layer) handles logical addressing and routing."),
  q(1023, 1, "4", ["Storage", "Database"], "Which type of database organizes data into structured tables with rows and columns and uses SQL for queries?", ["NoSQL", "RDBMS", "Key-Value Store", "Graph Database"], "RDBMS", "Relational Database Management Systems (RDBMS) use structured schemas and tables."),
  q(1024, 1, "3", ["Cabling", "Fiber"], "What is the primary advantage of using fiber optic cabling over copper cabling in an industrial environment?", ["Lower Cost", "Immunity to EMI", "Greater Flexibility", "Carries Power (PoE)"], "Immunity to EMI", "Fiber uses light pulses instead of electricity, making it completely immune to Electromagnetic Interference from machinery."),
  q(1025, 1, "4", ["Addressing", "IPv6"], "How many bits are in an IPv6 address?", ["32 bits", "64 bits", "128 bits", "256 bits"], "128 bits", "IPv6 addresses are 128-bit numbers, typically represented in hexadecimal format."),
  q(1026, 1, "1", ["Topology", "Cost"], "Which topology is the most expensive to implement because it requires a physical cable connection between every single pair of devices?", ["Star", "Bus", "Full Mesh", "Ring"], "Full Mesh", "A Full Mesh topology requires n(n-1)/2 cables, which becomes exponentially expensive as devices are added."),
  q(1027, 1, "2", ["OSI", "Ports"], "Port numbers (such as TCP 80 or UDP 53) are used to direct traffic to specific applications at which OSI layer?", ["Transport Layer", "Network Layer", "Data Link Layer", "Physical Layer"], "Transport Layer", "The Transport Layer (Layer 4) uses ports to multiplex and demultiplex traffic for different services."),
  q(1028, 1, "3", ["WAN", "Internet"], "Starlink and other modern satellite internet providers use which orbit to reduce latency?", ["GEO (Geostationary)", "MEO (Medium Earth)", "LEO (Low Earth)", "Polar Orbit"], "LEO (Low Earth)", "Low Earth Orbit satellites are much closer to the planet, significantly reducing signal travel time (latency)."),
  q(1029, 1, "1", ["Topology", "WAN"], "A dedicated physical link connecting exactly two routers is known as which type of topology?", ["Point-to-Point", "Star", "Bus", "Mesh"], "Point-to-Point", "A Point-to-Point link connects two specific nodes directly, common in WAN connections."),
  q(1030, 1, "4", ["Storage", "Protocol"], "Which storage technology connects to the network via Ethernet and allows users to access files using protocols like SMB or NFS?", ["SAN", "NAS", "DAS", "SCSI"], "NAS", "Network Attached Storage (NAS) is a file-level storage device that attaches to the LAN."),
  q(1031, 1, "4", ["Addressing", "Subnetting"], "A network is using 192.168.10.0/26. How many usable host addresses are available per subnet?", ["30", "62", "126", "254"], "62", "/26 provides 64 total addresses per subnet; subtract network + broadcast = 62 usable."),
  q(1032, 1, "4", ["IPv6", "Addressing"], "Which IPv6 address type is used for communication to the nearest instance of a service (based on routing distance)?", ["Multicast", "Anycast", "Unicast", "Broadcast"], "Anycast", "Anycast allows multiple hosts to share an address and routes traffic to the 'nearest' node."),
  q(1033, 1, "4", ["IPv6", "Config"], "Which IPv6 method allows a host to self-configure an address using router advertisements without a DHCPv6 server?", ["SLAAC", "NAT64", "Teredo", "APIPA"], "SLAAC", "SLAAC uses Router Advertisements (RA) to build an address and learn the default gateway."),
  q(1034, 1, "2", ["OSI", "Encapsulation"], "At which OSI layer are VLAN tags (802.1Q) added to Ethernet frames?", ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], "Layer 2", "802.1Q tagging modifies the Ethernet frame header, which is Layer 2."),
  q(1035, 1, "1", ["Switching", "Broadcast"], "Which device is required to prevent broadcasts from VLAN 10 reaching VLAN 20?", ["Layer 2 switch", "Hub", "Layer 3 device (router/L3 switch)", "Repeater"], "Layer 3 device (router/L3 switch)", "VLANs are separate Layer 2 broadcast domains; inter-VLAN traffic requires routing (Layer 3)."),
  q(1036, 1, "3", ["Ethernet", "PoE"], "Which PoE standard is commonly associated with up to ~30W at the port for access points and cameras?", ["802.3af", "802.3at", "802.3bt Type 3", "802.3bt Type 4"], "802.3at", "802.3at (PoE+) delivers more power than 802.3af and is widely used for higher-power APs."),
  q(1037, 1, "3", ["Fiber", "Transceivers"], "You need 10GbE over fiber for a switch uplink. Which transceiver form factor is most commonly used?", ["GBIC", "SFP+", "QSFP-DD", "RJ-45"], "SFP+", "SFP+ is the common pluggable transceiver form factor for 10GbE fiber links."),
  q(1038, 1, "2", ["Traffic", "NAT"], "Which NAT type allows many internal hosts to share a single public IP by tracking connections with ports?", ["Static NAT", "Dynamic NAT", "PAT (NAT Overload)", "One-to-one NAT"], "PAT (NAT Overload)", "PAT translates multiple private IPs to one public IP using unique source ports."),
  q(1039, 1, "1", ["Architecture", "SDN"], "In a Software-Defined Network (SDN), which plane is typically centralized in a controller?", ["Data plane", "Control plane", "Physical plane", "Session plane"], "Control plane", "SDN separates the control plane from the data plane and centralizes control logic in a controller."),
  q(1040, 1, "3", ["Cabling", "Testing"], "Which tool verifies end-to-end copper continuity and correct pinout (e.g., detects crossed pairs)?", ["Tone generator", "Cable certifier", "Cable tester (wiremap)", "Optical power meter"], "Cable tester (wiremap)", "A wiremap-style cable tester checks pair mapping/pinout and continuity for copper."),
  q(1041, 1, "4", ["Subnetting", "CIDR"], "You need at least 100 usable host IPs in a single IPv4 subnet. Which prefix is the smallest that meets this requirement?", ["/24", "/25", "/26", "/27"], "/25", "/25 provides 128 total addresses (126 usable), meeting the 100-host requirement with the smallest subnet."),
  q(1042, 1, "2", ["MTU", "TCP/IP"], "A VPN causes some websites to partially load unless you reduce packet size. Which issue is most likely occurring?", ["ARP poisoning", "Path MTU black hole", "DNS cache poisoning", "VLAN hopping"], "Path MTU black hole", "If ICMP fragmentation-needed messages are blocked, PMTUD fails and traffic can stall unless MTU/MSS is lowered."),
  q(1043, 1, "3", ["DHCP", "Addressing"], "A client has an IP address, subnet mask, and gateway but no DNS servers. Which DHCP component likely provides DNS server info?", ["DHCP relay", "DHCP option", "DHCPDISCOVER", "DHCP lease time"], "DHCP option", "DHCP options deliver additional settings (like DNS servers) beyond the IP address itself."),
  q(1044, 1, "2", ["Switching", "Loop Prevention"], "Which Layer 2 protocol prevents switching loops by blocking redundant paths in a bridged network?", ["OSPF", "STP", "BGP", "RIP"], "STP", "Spanning Tree Protocol prevents loops by placing redundant links into a blocking state."),
  q(1045, 1, "3", ["Ethernet", "Speed"], "Which twisted-pair standard supports 10 Gbps up to 100 meters and is commonly used for modern copper runs?", ["Cat5e", "Cat6", "Cat6a", "Cat3"], "Cat6a", "Cat6a is rated for 10GBASE-T at the full 100-meter channel length."),
  q(1046, 1, "4", ["IPv6", "Basics"], "Which IPv6 prefix represents the Link-Local address range used for neighbor discovery on the local segment?", ["2000::/3", "fc00::/7", "fe80::/10", "::1/128"], "fe80::/10", "IPv6 link-local addresses begin with fe80::/10 and are not routed off-link."),
  q(1047, 1, "2", ["Routing", "Default"], "Which entry in a routing table is used when no more-specific route matches a destination?", ["Host route", "Default route", "Connected route", "Null route"], "Default route", "The default route (0.0.0.0/0 or ::/0) is the route of last resort."),
  q(1048, 1, "3", ["NAT", "IPv6"], "Which technology allows IPv6-only clients to reach IPv4-only servers by translating between protocols?", ["NAT64", "SLAAC", "ARP", "GRE"], "NAT64", "NAT64 translates IPv6 traffic to IPv4, commonly paired with DNS64."),
  q(1049, 1, "2", ["DNS", "Records"], "Which DNS record type maps a hostname to an IPv4 address?", ["AAAA", "A", "CNAME", "MX"], "A", "An A record resolves a name to an IPv4 address; AAAA is for IPv6."),
  q(1050, 1, "3", ["WAN", "Tunneling"], "Which protocol is commonly used to create a simple point-to-point tunnel that encapsulates various Layer 3 protocols?", ["GRE", "HTTP", "SMB", "DHCP"], "GRE", "GRE provides generic encapsulation and is often paired with IPsec for encryption."),

  // --- DOMAIN 2: WIRELESS NETWORKING ---
  q(2001, 2, "1", ["Wi-Fi", "RF"], "In the 2.4 GHz band, which three channels are considered non-overlapping in the United States?", ["1, 5, 9", "1, 6, 11", "2, 7, 12", "1, 2, 3"], "1, 6, 11", "Channels 1, 6, and 11 are the standard non-overlapping channels used to avoid interference in 2.4 GHz Wi-Fi."),
  q(2002, 2, "1", ["Wi-Fi", "Standard"], "Which 802.11 wireless standard introduced Multi-User MIMO (MU-MIMO) but operates strictly in the 5 GHz band?", ["802.11n", "802.11ac", "802.11ax", "802.11g"], "802.11ac", "802.11ac (Wi-Fi 5) introduced MU-MIMO to serve multiple clients at once, but only runs on 5 GHz."),
  q(2003, 2, "4", ["Security", "Wi-Fi"], "The WPA3 security standard replaced the traditional 4-way handshake with which new protocol to prevent offline dictionary attacks?", ["Simultaneous Authentication of Equals (SAE)", "Temporal Key Integrity Protocol (TKIP)", "Pre-Shared Key (PSK)", "Advanced Encryption Standard (AES)"], "Simultaneous Authentication of Equals (SAE)", "SAE is the modern handshake in WPA3 that makes it impossible to crack the password offline using dictionary attacks."),
  q(2004, 2, "5", ["Interference", "RF"], "A user reports their Wi-Fi connection drops whenever they use the microwave oven. What is the most likely cause?", ["Signal Refraction", "Electromagnetic Interference", "Signal Absorption", "Signal Reflection"], "Electromagnetic Interference", "Microwaves operate at 2.4 GHz, causing significant electromagnetic interference for Wi-Fi networks on the same band."),
  q(2005, 2, "5", ["RF", "Troubleshooting"], "Which metric compares the level of the Wi-Fi signal to the level of background noise?", ["RSSI", "Signal-to-Noise Ratio (SNR)", "dBm", "Latency"], "Signal-to-Noise Ratio (SNR)", "SNR measures the quality of the connection. A higher SNR means the signal is much stronger than the background noise."),
  q(2006, 2, "1", ["Wi-Fi", "Standard"], "Which wireless standard is commercially marketed as 'Wi-Fi 6'?", ["802.11ac", "802.11ax", "802.11n", "802.11a"], "802.11ax", "802.11ax is Wi-Fi 6, designed for high efficiency in dense environments."),
  q(2007, 2, "3", ["Topology", "Wi-Fi"], "Which wireless topology mode allows devices to connect directly to each other without using a central Access Point?", ["Infrastructure Mode", "Ad Hoc Mode", "Mesh Mode", "Star Mode"], "Ad Hoc Mode", "Ad Hoc (IBSS) mode enables peer-to-peer wireless connections without an AP."),
  q(2008, 2, "4", ["Security", "Legacy"], "Which legacy wireless security protocol uses RC4 encryption and is considered completely insecure and easily cracked?", ["WPA2", "WPA", "WEP", "WPA3"], "WEP", "Wired Equivalent Privacy (WEP) has severe vulnerabilities and can be cracked in minutes."),
  q(2009, 2, "1", ["RF", "Wi-Fi"], "What is the primary advantage of using the 5 GHz band over the 2.4 GHz band?", ["Better Range", "Better Wall Penetration", "More Non-Overlapping Channels", "Lower Cost"], "More Non-Overlapping Channels", "The 5 GHz band has significantly more channels available, reducing congestion and interference compared to 2.4 GHz."),
  q(2010, 2, "3", ["Hardware", "Management"], "In a large corporate environment, which device is used to centrally manage configuration and security policies for 50 lightweight Access Points?", ["Router", "Wireless Controller", "Switch", "Firewall"], "Wireless Controller", "A Wireless Controller provides a single pane of glass for managing, configuring, and updating many APs."),
  q(2011, 2, "5", ["RF", "Troubleshooting"], "A technician measures the Wi-Fi signal strength at -85 dBm. How would you classify this signal?", ["Excellent", "Good", "Usable", "Unusable / Dead Zone"], "Unusable / Dead Zone", "Wi-Fi signal is measured in negative dBm. -30 is excellent, -67 is good for VoIP, but anything below -80 is typically unusable noise."),
  q(2012, 2, "1", ["Theory", "Traffic"], "Because wireless radios are half-duplex, which access method do they use to avoid data collisions?", ["CSMA/CD", "CSMA/CA", "Token Passing", "Polling"], "CSMA/CA", "Carrier Sense Multiple Access / Collision Avoidance. Devices listen to ensure the air is clear before transmitting."),
  q(2013, 2, "3", ["Hardware", "RF"], "Which type of antenna radiates signal power equally in all directions horizontally (360 degrees)?", ["Yagi", "Parabolic Dish", "Omnidirectional", "Patch"], "Omnidirectional", "Omnidirectional antennas (like standard dipoles) create a 360-degree coverage area."),
  q(2014, 2, "4", ["Security", "Auth"], "To implement WPA2-Enterprise security, which backend service is required to authenticate users?", ["Pre-Shared Key", "RADIUS Server", "WEP Key", "Captive Portal"], "RADIUS Server", "Enterprise security (802.1X) requires an authentication server, typically using the RADIUS protocol."),
  q(2015, 2, "2", ["Cellular", "Speed"], "Which 5G technology uses high-frequency millimeter waves to achieve gigabit speeds but suffers from very short range?", ["Low-band", "Mid-band", "mmWave", "LTE"], "mmWave", "Millimeter wave (mmWave) offers extreme speeds but is easily blocked by walls and has a short effective range."),
  q(2016, 2, "5", ["RF", "Physics"], "What wireless phenomenon occurs when a signal bounces off objects and arrives at the receiver at slightly different times?", ["Multipath Propagation", "Refraction", "Diffraction", "Absorption"], "Multipath Propagation", "Multipath is caused by reflected signals. While it used to be a problem, modern MIMO technology actually uses it to increase speed."),
  q(2017, 2, "1", ["Wi-Fi", "Performance"], "Which technology allows a Wireless Access Point to transmit data to multiple client devices simultaneously?", ["MIMO", "MU-MIMO", "SISO", "OFDM"], "MU-MIMO", "Multi-User MIMO allows the AP to communicate with several devices at the exact same instant."),
  q(2018, 2, "5", ["RF", "Material"], "Which building material causes the most significant absorption (signal loss) for Wi-Fi signals?", ["Drywall", "Glass", "Concrete", "Wood"], "Concrete", "Dense materials like concrete and brick absorb radio waves heavily, blocking Wi-Fi signals."),
  q(2019, 2, "2", ["WAN", "Space"], "What is the primary benefit of Low Earth Orbit (LEO) satellite internet (like Starlink) compared to traditional Geostationary satellites?", ["Lower Latency", "Higher Altitude", "Better Weather Resistance", "Lower Cost"], "Lower Latency", "LEO satellites are much closer to Earth (~500km vs 35,000km), drastically reducing the round-trip time for data."),
  q(2020, 2, "3", ["Topology", "Resilience"], "In a Wireless Mesh Network, if one node fails, the traffic is automatically re-routed through other nodes. What is this feature called?", ["Failover", "Self-Healing", "Load Balancing", "Switching"], "Self-Healing", "Mesh networks are designed to be self-healing, dynamically finding new paths if a node goes offline."),
  q(2021, 2, "4", ["Security", "Wi-Fi"], "The acronym SAE in WPA3 security stands for:", ["Secure Authentication Exchange", "Simultaneous Authentication of Equals", "System Access Encryption", "Standard Advanced Encryption"], "Simultaneous Authentication of Equals", "SAE is the handshake protocol that provides forward secrecy and protection against password guessing."),
  q(2022, 2, "2", ["WAN", "Backhaul"], "Which wireless technology is best suited for a point-to-point link connecting two buildings 5 miles apart with clear line-of-sight?", ["Wi-Fi", "Microwave", "Bluetooth", "NFC"], "Microwave", "Microwave links are the standard for long-distance, high-speed wireless backhaul between buildings."),
  q(2023, 2, "5", ["RF", "Troubleshooting"], "Configuring an Access Point on Channel 6 and a nearby Access Point on Channel 7 in the 2.4 GHz band causes what issue?", ["Channel Overlap / Interference", "Refraction", "Signal Gain", "Attenuation"], "Channel Overlap / Interference", "Channels in the 2.4 GHz band overlap. Channels 6 and 7 overlap significantly, causing interference."),
  q(2024, 2, "1", ["Wi-Fi", "Standard"], "Which 802.11 standard was the first to support both 2.4 GHz and 5 GHz bands and introduced MIMO technology?", ["802.11a", "802.11b", "802.11g", "802.11n"], "802.11n", "802.11n (Wi-Fi 4) introduced MIMO antennas and supports operation on both frequency bands."),
  q(2025, 2, "3", ["Structure", "Wi-Fi"], "The wired Ethernet connection that connects a Wireless Access Point to the main LAN is known as the:", ["Backhaul", "Fronthaul", "Sidehaul", "Mesh Link"], "Backhaul", "The backhaul is the link that carries traffic from the edge (AP) back to the core network."),
  q(2026, 2, "3", ["Hardware", "RF"], "Which type of antenna focuses signal energy in a single narrow direction to achieve long range?", ["Dipole", "Yagi", "Omnidirectional", "Whip"], "Yagi", "Yagi antennas are highly directional, focusing the signal into a beam for longer distance."),
  q(2027, 2, "4", ["Security", "Best Practice"], "What is the minimum recommended security standard for a corporate Wi-Fi network?", ["WPA2-PSK", "WPA2-Enterprise", "WEP", "Open System"], "WPA2-Enterprise", "Enterprise mode is required for corporate environments to allow individual user authentication and revocation."),
  q(2028, 2, "5", ["RF", "Math"], "EIRP (Effective Isotropic Radiated Power) is a calculation that accounts for which factors?", ["Transmitter Power + Antenna Gain - Cable Loss", "Only Antenna Gain", "Only Transmitter Power", "Signal Noise"], "Transmitter Power + Antenna Gain - Cable Loss", "EIRP represents the total power radiated by the antenna system after accounting for gains and losses."),
  q(2029, 2, "1", ["Wi-Fi", "Performance"], "What feature does 802.11ac use to combine multiple 20 MHz channels into a wider channel for higher throughput?", ["Channel Bonding", "MIMO", "Beamforming", "Spatial Multiplexing"], "Channel Bonding", "Channel bonding allows combining channels to create 40, 80, or 160 MHz wide paths for more data."),
  q(2030, 2, "3", ["Tools", "RF"], "Which tool allows a technician to visualize Wi-Fi signal coverage and dead zones on a floor plan?", ["Heatmap Software", "Port Scanner", "Packet Sniffer", "Firewall"], "Heatmap Software", "Heatmap software uses signal readings to create a color-coded map of wireless coverage."),
  q(2031, 2, "1", ["Wi-Fi", "6GHz"], "Wi-Fi 6E primarily expands Wi-Fi into which additional frequency band?", ["900 MHz", "6 GHz", "60 GHz", "700 MHz"], "6 GHz", "Wi-Fi 6E extends 802.11ax operation into the 6 GHz band where allowed, reducing congestion."),
  q(2032, 2, "5", ["RF", "Coverage"], "A user has strong RSSI but poor throughput due to heavy interference. Which metric best captures this relationship?", ["dBi", "SNR", "EIRP", "MTU"], "SNR", "SNR compares signal to noise; strong signal with even stronger noise still yields poor performance."),
  q(2033, 2, "3", ["Roaming", "Enterprise"], "Which feature helps clients roam faster between APs by reducing full re-authentication overhead?", ["Band steering", "802.11r (Fast BSS Transition)", "Channel bonding", "WMM"], "802.11r (Fast BSS Transition)", "802.11r enables faster roaming by optimizing the authentication/handshake process."),
  q(2034, 2, "4", ["Security", "Wi-Fi"], "Which control best prevents unauthorized APs from being connected to corporate switch ports?", ["WPA3-Personal", "802.1X (NAC) on wired ports", "WEP", "Open SSID"], "802.1X (NAC) on wired ports", "Port-based authentication can block rogue devices/APs from gaining LAN access."),
  q(2035, 2, "1", ["Wi-Fi", "Efficiency"], "Which 802.11ax feature divides a channel into smaller sub-channels so multiple clients can transmit simultaneously?", ["Beamforming", "OFDMA", "CSMA/CD", "Token passing"], "OFDMA", "OFDMA improves efficiency in dense environments by scheduling resource units to clients."),
  q(2036, 2, "5", ["RF", "Interference"], "Bluetooth devices most commonly interfere with Wi-Fi in which band?", ["2.4 GHz", "5 GHz", "6 GHz", "60 GHz"], "2.4 GHz", "Bluetooth uses 2.4 GHz, potentially overlapping with 2.4 GHz Wi-Fi channels."),
  q(2037, 2, "3", ["Design", "Capacity"], "In a high-density venue, which approach usually improves overall Wi-Fi performance the most?", ["Max transmit power on all APs", "More APs with lower power + smaller cells", "WEP for lower overhead", "Only 2.4 GHz"], "More APs with lower power + smaller cells", "High density favors careful cell sizing and channel reuse over brute-force power."),
  q(2038, 2, "4", ["Security", "Enterprise"], "Which WPA3 mode is the enterprise option that supports stronger cryptographic suites for regulated environments?", ["WPA3-Personal", "WPA3-Enterprise (192-bit)", "WPA2-PSK", "WPA"], "WPA3-Enterprise (192-bit)", "WPA3-Enterprise offers an enhanced security mode for high-assurance environments."),
  q(2039, 2, "5", ["Troubleshooting", "Wi-Fi"], "Clients connect but can’t reach internal resources. The SSID maps to the wrong VLAN. What’s the most likely misconfiguration?", ["Incorrect antenna type", "Incorrect SSID-to-VLAN mapping on controller/AP", "Bad DNS record", "MTU too large"], "Incorrect SSID-to-VLAN mapping on controller/AP", "If SSID-to-VLAN mapping is wrong, users land in the wrong network segment."),
  q(2040, 2, "2", ["Cellular", "Auth"], "A SIM-based authentication method commonly used in cellular networks is:", ["Kerberos", "EAP-SIM", "CHAP", "PAP"], "EAP-SIM", "EAP-SIM leverages SIM credentials for authentication (common in mobile/cellular integration)."),
  q(2041, 2, "2", ["Wi-Fi", "DFS"], "On 5 GHz, why might an AP suddenly switch channels when configured for certain frequencies?", ["It detected a DNS failure", "DFS radar detection triggered a channel change", "The cable was unplugged", "The SSID changed names"], "DFS radar detection triggered a channel change", "DFS channels must move if radar is detected to avoid interference with weather/aviation radar."),
  q(2042, 2, "3", ["Roaming", "Optimization"], "Which standard provides clients with AP neighbor reports to assist in faster roaming decisions?", ["802.11k", "802.11b", "802.1Q", "802.3at"], "802.11k", "802.11k helps clients roam by sharing radio resource/neighbor information."),
  q(2043, 2, "3", ["Roaming", "Steering"], "Which feature lets an AP suggest that a client roam to a better AP to improve performance?", ["802.11v", "802.11a", "WEP", "CSMA/CD"], "802.11v", "802.11v includes BSS transition management to steer clients toward better choices."),
  q(2044, 2, "4", ["Security", "Legacy"], "Which Wi-Fi feature is commonly disabled in enterprise networks because it can be brute-forced or abused?", ["WPS", "WMM", "MIMO", "OFDMA"], "WPS", "Wi-Fi Protected Setup (especially PIN mode) is a known weak point and is typically disabled."),
  q(2045, 2, "1", ["Wi-Fi", "Channels"], "Which channel width generally provides the highest throughput but increases the chance of co-channel interference?", ["20 MHz", "40 MHz", "80 MHz", "160 MHz"], "160 MHz", "Wider channels can increase throughput but reduce available clean spectrum and increase interference risk."),
  q(2046, 2, "5", ["RF", "Attenuation"], "A warehouse has metal shelving and machinery causing highly variable signal quality. What RF issue is MOST likely?", ["Multipath and reflection", "DNS latency", "Subnet mismatch", "MTU mismatch"], "Multipath and reflection", "Metal surfaces reflect RF, producing multipath that can degrade or (with modern MIMO) complicate performance."),
  q(2047, 2, "4", ["Security", "Guest"], "A hotel requires users to accept terms in a browser before getting internet access. This is called a:", ["Captive portal", "WPA3-Enterprise", "RADIUS federation", "Channel bonding"], "Captive portal", "Captive portals gate access through a web page (terms, voucher codes, etc.)."),
  q(2048, 2, "3", ["Hardware", "Placement"], "To reduce co-channel interference between two nearby APs, you should primarily:", ["Set both to channel 6", "Use different non-overlapping channels", "Increase both transmit powers", "Disable encryption"], "Use different non-overlapping channels", "Channel planning reduces interference; power increases often make contention worse."),
  q(2049, 2, "2", ["Wi-Fi", "QoS"], "Which Wi-Fi mechanism prioritizes voice/video traffic over best-effort data on a WLAN?", ["WMM", "WPS", "SSID cloaking", "CSMA/CD"], "WMM", "Wi-Fi Multimedia (WMM) provides traffic prioritization (QoS) on Wi-Fi."),
  q(2050, 2, "4", ["Security", "Encryption"], "Which cipher suite is commonly associated with WPA3-Personal encryption on modern Wi-Fi?", ["AES-GCMP", "RC4", "3DES", "MD5"], "AES-GCMP", "WPA3 commonly uses AES-GCMP (while WPA2 commonly uses AES-CCMP)."),

  // --- DOMAIN 3: NETWORK MANAGEMENT ---
  q(3001, 3, "1", ["Policy", "Admin"], "Which document is a legally binding contract that defines specific performance metrics, such as 99.9% uptime, that a vendor must meet?", ["Service Level Agreement (SLA)", "Memorandum of Understanding (MOU)", "Non-Disclosure Agreement (NDA)", "Statement of Work (SOW)"], "Service Level Agreement (SLA)", "An SLA defines the level of service expected and usually includes penalties if those levels are not met."),
  q(3002, 3, "3", ["Protocol", "Monitoring"], "Which protocol is used to query and monitor the status of network devices (like CPU usage on a router)?", ["SNMP", "SMTP", "Syslog", "NTP"], "SNMP", "The Simple Network Management Protocol (SNMP) is the standard for monitoring and configuring network gear."),
  q(3003, 3, "4", ["Tools", "Traffic"], "You need to identify which computer is using the most bandwidth on the network. Which tool would be most appropriate?", ["NetFlow Analyzer", "Wireshark", "Ping", "Traceroute"], "NetFlow Analyzer", "NetFlow captures metadata about traffic (source, destination, volume) which is ideal for bandwidth analysis."),
  q(3004, 3, "5", ["Recovery", "Metrics"], "Which disaster recovery metric defines the maximum amount of time a service is allowed to be down before it must be restored?", ["Recovery Time Objective (RTO)", "Recovery Point Objective (RPO)", "Mean Time Between Failures (MTBF)", "Mean Time To Repair (MTTR)"], "Recovery Time Objective (RTO)", "RTO is the target time for restoring a business process after a disruption."),
  q(3005, 3, "1", ["Policy", "Admin"], "Which document typically outlines the specific tasks, deliverables, and timeline for a project?", ["Statement of Work (SOW)", "Service Level Agreement (SLA)", "Memorandum of Understanding (MOU)", "Master Service Agreement (MSA)"], "Statement of Work (SOW)", "An SOW is a detailed document that defines exactly what work will be performed."),
  q(3006, 3, "3", ["Logs", "Troubleshooting"], "In the Syslog standard, a severity level of 0 indicates what?", ["Emergency (System Unusable)", "Alert (Action Required)", "Error", "Debug Information"], "Emergency (System Unusable)", "Level 0 is 'Emergency', the highest severity, indicating the system is down or unusable."),
  q(3007, 3, "2", ["Tools", "Discovery"], "You want to quickly identify which IP addresses on a subnet are currently active. Which Nmap scan type should you use?", ["Ping Sweep", "Port Scan", "Vulnerability Scan", "Trap Scan"], "Ping Sweep", "A Ping Sweep sends ICMP Echo requests to a range of IPs to see which hosts respond."),
  q(3008, 3, "1", ["Policy", "Legal"], "Which agreement typically outlines a mutual intent between two parties to work together but is generally not legally binding?", ["Memorandum of Understanding (MOU)", "Service Level Agreement (SLA)", "Contract", "Non-Disclosure Agreement (NDA)"], "Memorandum of Understanding (MOU)", "An MOU expresses a convergence of will between parties but lacks the binding power of a contract."),
  q(3009, 3, "3", ["Protocol", "Logs"], "Why is the Network Time Protocol (NTP) critical for log management and security forensics?", ["It ensures timestamps correlate across devices", "It encrypts the log files", "It compresses log data", "It authenticates the log server"], "It ensures timestamps correlate across devices", "If devices have different times, it is impossible to accurately reconstruct the sequence of events during an incident."),
  q(3010, 3, "4", ["Tools", "Switching"], "Which switch feature allows you to copy all traffic from one port to another port for analysis by a packet sniffer?", ["Port Mirroring / SPAN", "VLAN Tagging", "Trunking", "Port Security"], "Port Mirroring / SPAN", "Port Mirroring (or SPAN) duplicates traffic so it can be monitored without interrupting the flow."),
  q(3011, 3, "5", ["Recovery", "Physical"], "Which type of disaster recovery site is fully equipped with hardware and real-time data replication, allowing for immediate switchover?", ["Hot Site", "Warm Site", "Cold Site", "Cloud Site"], "Hot Site", "A Hot Site is a fully mirrored duplicate of the production environment, ready to take over instantly."),
  q(3012, 3, "1", ["Admin", "Maintenance"], "The process of measuring and recording the performance of a network under normal conditions to serve as a reference point is called:", ["Baselining", "Auditing", "Sniffing", "Scanning"], "Baselining", "Baselining establishes what 'normal' looks like so anomalies can be detected later."),
  q(3013, 3, "2", ["Protocol", "Discovery"], "Which vendor-neutral protocol allows network devices to advertise their identity and capabilities to directly connected neighbors?", ["LLDP", "CDP", "OSPF", "BGP"], "LLDP", "Link Layer Discovery Protocol (LLDP) is the industry standard for neighbor discovery. CDP is Cisco proprietary."),
  q(3014, 3, "5", ["Recovery", "Metrics"], "Which disaster recovery metric defines the maximum amount of data loss (measured in time) that is acceptable?", ["Recovery Point Objective (RPO)", "Recovery Time Objective (RTO)", "Mean Time Between Failures (MTBF)", "Mean Time To Repair (MTTR)"], "Recovery Point Objective (RPO)", "RPO dictates how far back you must be able to restore data (e.g., 'We can lose up to 1 hour of data')."),
  q(3015, 3, "3", ["Protocol", "Security"], "Which version of SNMP introduced cryptographic security, including encryption and authentication?", ["SNMPv3", "SNMPv2c", "SNMPv1", "SNMPv4"], "SNMPv3", "SNMPv3 added essential security features. Previous versions sent community strings in cleartext."),
  q(3016, 3, "4", ["Tools", "Traffic"], "Wireshark is best described as which type of network tool?", ["Packet Analyzer / Sniffer", "Flow Collector", "Intrusion Prevention System", "Firewall"], "Packet Analyzer / Sniffer", "Wireshark captures and inspects the actual data packets on the wire."),
  q(3017, 3, "1", ["Documentation", "Physical"], "Which type of network diagram depicts the real-world arrangement of racks, cable runs, and device locations?", ["Physical Network Diagram", "Logical Network Diagram", "Data Flow Chart", "Block Diagram"], "Physical Network Diagram", "Physical diagrams show the actual layout of hardware, whereas logical diagrams show IP schemes and flow."),
  q(3018, 3, "5", ["Recovery", "Physical"], "A disaster recovery site that has power and connectivity but requires you to bring and install your own servers and data is called a:", ["Cold Site", "Warm Site", "Hot Site", "Mobile Site"], "Cold Site", "A Cold Site is essentially an empty shell. It is the cheapest option but takes the longest to bring online."),
  q(3019, 3, "2", ["Tools", "Nmap"], "OS Fingerprinting is a technique used by scanning tools like Nmap to determine:", ["The operating system running on a target host", "The physical location of the server", "The password of the admin user", "The manufacturer of the switch"], "The operating system running on a target host", "By analyzing the unique way a TCP/IP stack responds to packets, Nmap can guess the OS (e.g., Windows vs Linux)."),
  q(3020, 3, "3", ["Protocol", "Ports"], "Which port does the Syslog protocol use by default for sending log messages?", ["UDP 514", "TCP 80", "TCP 443", "UDP 123"], "UDP 514", "Syslog standardly uses UDP port 514 for log transmission."),
  q(3021, 3, "1", ["Admin", "Maintenance"], "What term describes the situation where a system's configuration changes over time due to undocumented updates, causing it to deviate from the baseline?", ["Configuration Drift", "Patching", "System Rot", "Hardening"], "Configuration Drift", "Configuration Drift occurs when ad-hoc changes are made without proper change management, leading to inconsistent states."),
  q(3022, 3, "4", ["Hardware", "Tools"], "Which hardware device is inserted inline on a network cable to provide a copy of traffic to a monitoring tool without dropping packets?", ["Network TAP", "Hub", "Switch", "Router"], "Network TAP", "A Test Access Point (TAP) physically splits the signal, ensuring the monitor sees 100% of the traffic."),
  q(3023, 3, "5", ["Hardware", "Metrics"], "MTBF (Mean Time Between Failures) is a metric primarily used to measure:", ["Hardware Reliability", "Repair Speed", "Network Availability", "Data Loss"], "Hardware Reliability", "MTBF predicts the average lifespan of a hardware component before it fails."),
  q(3024, 3, "3", ["Protocol", "Structure"], "The structured database of variables on a network device that an SNMP manager queries is called the:", ["Management Information Base (MIB)", "Object Identifier (OID)", "Trap", "Get Request"], "Management Information Base (MIB)", "The MIB is the database structure that defines what data can be queried on the device."),
  q(3025, 3, "1", ["Documentation", "Process"], "A document containing step-by-step instructions for performing a routine technical task is known as a:", ["Standard Operating Procedure (SOP)", "Service Level Agreement (SLA)", "Non-Disclosure Agreement (NDA)", "Acceptable Use Policy (AUP)"], "Standard Operating Procedure (SOP)", "SOPs ensure consistency and quality by providing detailed instructions for common tasks."),
  q(3026, 3, "2", ["Protocol", "Admin"], "Which technology allows an administrator to power on a computer remotely by sending a specific 'Magic Packet'?", ["Wake-on-LAN (WoL)", "Power over Ethernet (PoE)", "Quality of Service (QoS)", "Network Address Translation (NAT)"], "Wake-on-LAN (WoL)", "WoL allows a sleeping computer to be woken up by a special network packet."),
  q(3027, 3, "3", ["Protocol", "Admin"], "Which protocol provides a secure, encrypted command-line interface for remote device management?", ["SSH", "Telnet", "RDP", "VNC"], "SSH", "Secure Shell (SSH) encrypts the session, replacing the insecure Telnet protocol."),
  q(3028, 3, "4", ["Traffic", "Analysis"], "In network monitoring, the term 'Top Talkers' refers to:", ["Hosts consuming the most bandwidth", "Administrators with the most logins", "Routers with the highest CPU load", "Servers with the most storage"], "Hosts consuming the most bandwidth", "Identifying Top Talkers helps troubleshoot congestion by finding who is using the most data."),
  q(3029, 3, "5", ["Resilience", "Hardware"], "In a High Availability cluster, which mode allows both devices to process traffic simultaneously?", ["Active/Active", "Active/Passive", "Failover", "Cold Standby"], "Active/Active", "In Active/Active mode, traffic is load-balanced across all nodes, maximizing performance and redundancy."),
  q(3030, 3, "2", ["Tools", "Security"], "You need to determine which services are running on a server. Which activity would give you this information?", ["Port Scanning", "Ping Sweep", "DNS Query", "Route Tracing"], "Port Scanning", "Port scanning identifies open ports, which correspond to running services (e.g., Port 80 open = Web Server)."),
  q(3031, 3, "3", ["Monitoring", "Flow"], "Which protocol is commonly used to export traffic flow metadata from a router to a collector for analysis?", ["NetFlow", "NTP", "IMAP", "ARP"], "NetFlow", "Flow protocols export summaries (5-tuple, bytes, packets) useful for visibility and capacity planning."),
  q(3032, 3, "3", ["Monitoring", "Switching"], "sFlow is best described as:", ["Full packet capture of all traffic", "Sampled traffic flow monitoring", "A routing protocol", "A time-sync protocol"], "Sampled traffic flow monitoring", "sFlow typically samples packets/flows for scalable monitoring in large environments."),
  q(3033, 3, "1", ["Process", "Change"], "Which best practice reduces the risk of outages during planned network changes?", ["Make changes ad-hoc at peak hours", "Use change windows + rollback plans", "Disable logging", "Avoid documentation"], "Use change windows + rollback plans", "Change windows and rollback procedures are core to safe change management."),
  q(3034, 3, "3", ["Logs", "SIEM"], "A SIEM platform primarily helps by:", ["Replacing routers", "Aggregating and correlating logs/alerts", "Assigning IP addresses", "Encrypting all traffic"], "Aggregating and correlating logs/alerts", "SIEM centralizes logs/events and correlates them to improve detection and response."),
  q(3035, 3, "2", ["Discovery", "Inventory"], "Which approach is MOST appropriate to discover IP-to-MAC mappings and connected switch ports at scale?", ["Manual spreadsheets", "SNMP polling + switch CAM/ARP tables", "Disabling LLDP", "Using POP3"], "SNMP polling + switch CAM/ARP tables", "SNMP can collect ARP/CAM and interface data to build accurate inventories."),
  q(3036, 3, "4", ["Tools", "Remote"], "You need secure web-based administration of a switch GUI. Which protocol/port should be enabled?", ["HTTP/80", "HTTPS/443", "Telnet/23", "FTP/21"], "HTTPS/443", "HTTPS provides encryption and integrity for browser-based management."),
  q(3037, 3, "5", ["Resilience", "Design"], "Which design practice MOST directly reduces single points of failure at the access layer?", ["One large switch stack with no uplink redundancy", "Dual uplinks to redundant distribution switches", "Use hubs for simplicity", "Disable spanning tree"], "Dual uplinks to redundant distribution switches", "Redundant uplinks (properly designed) improve availability and fault tolerance."),
  q(3038, 3, "1", ["Documentation", "Ops"], "Which document should include device hostnames, management IPs, rack locations, and circuit IDs?", ["Network inventory / asset register", "NDA", "Acceptable use policy", "Security incident report"], "Network inventory / asset register", "Accurate inventories speed troubleshooting and reduce operational risk."),
  q(3039, 3, "3", ["Logs", "Syslog"], "Which option is BEST to secure Syslog traffic in transit?", ["Use UDP 514 only", "Use Syslog over TLS", "Disable time sync", "Use Telnet"], "Use Syslog over TLS", "TLS can provide confidentiality/integrity for log transport versus plain UDP."),
  q(3040, 3, "4", ["QoS", "Voice"], "When configuring QoS for VoIP, which traffic characteristic is MOST important to minimize?", ["Jitter", "File size", "Disk I/O", "CPU temperature"], "Jitter", "Voice quality is highly sensitive to jitter (variation in packet arrival time) and loss."),
  q(3041, 3, "2", ["SNMP", "Monitoring"], "What is the main difference between an SNMP trap and an SNMP poll?", ["Traps are pushed by the device; polls are requested by the manager", "Traps are encrypted; polls are never encrypted", "Polls require TCP; traps require ICMP", "They are the same thing"], "Traps are pushed by the device; polls are requested by the manager", "Polling is manager-initiated; traps are device-initiated alerts."),
  q(3042, 3, "3", ["Syslog", "Ports"], "A company wants encrypted Syslog transport. Which port is commonly used for Syslog over TLS?", ["514", "6514", "123", "161"], "6514", "6514 is commonly used for Syslog over TLS to provide confidentiality and integrity."),
  q(3043, 3, "1", ["Operations", "Baselines"], "Which KPI is MOST useful to detect early signs of WAN congestion over time?", ["Average link utilization and 95th percentile", "Number of printers", "Room temperature", "Disk capacity of endpoints"], "Average link utilization and 95th percentile", "Trending utilization (especially 95th percentile) highlights sustained congestion vs spikes."),
  q(3044, 3, "4", ["Troubleshooting", "Path"], "Which tool combines ping and traceroute-style hop analysis to identify where latency or loss begins?", ["mtr", "nslookup", "whois", "dig"], "mtr", "mtr continuously tests hops and shows loss/latency by hop, making it ideal for path troubleshooting."),
  q(3045, 3, "2", ["Management", "OOB"], "To manage devices during a network outage, which approach is BEST?", ["In-band management only", "Out-of-band (OOB) management network", "Disable SSH", "Use a guest Wi-Fi SSID"], "Out-of-band (OOB) management network", "OOB access remains reachable even when production networks are down."),
  q(3046, 3, "3", ["Config", "Automation"], "Which tool type is MOST associated with push-based network configuration automation at scale?", ["Configuration management (e.g., Ansible)", "Packet sniffer", "Cable tester", "Tone probe"], "Configuration management (e.g., Ansible)", "Automation tools can push consistent configs, reducing drift and human error."),
  q(3047, 3, "1", ["Process", "Incident"], "Which step should occur FIRST when responding to a suspected network outage affecting many users?", ["Implement permanent fix", "Identify scope and verify the problem", "Blame the ISP", "Disable all VLANs"], "Identify scope and verify the problem", "Confirming scope/symptoms prevents wasted effort and guides triage."),
  q(3048, 3, "4", ["Monitoring", "Alerting"], "A monitoring system generates too many low-value alerts, causing real issues to be missed. This problem is called:", ["Alert fatigue", "Jitter", "MTU mismatch", "Subnet creep"], "Alert fatigue", "Too many noisy alerts reduce effectiveness; tuning thresholds and grouping helps."),
  q(3049, 3, "3", ["Documentation", "Change"], "What documentation artifact is MOST useful to record what changed, why, and who approved it?", ["Change log / change ticket", "Rack elevation only", "Acceptable use policy", "NDA"], "Change log / change ticket", "Change records provide accountability and a timeline for troubleshooting and audits."),
  q(3050, 3, "2", ["Monitoring", "RMON"], "RMON is primarily used to:", ["Synchronize time", "Monitor network traffic statistics remotely", "Assign IP addresses", "Encrypt logs"], "Monitor network traffic statistics remotely", "Remote Monitoring (RMON) extends monitoring capabilities beyond basic SNMP counters."),

  // --- DOMAIN 4: SECURITY PRINCIPLES ---
  q(4001, 4, "1", ["CIA", "Theory"], "Which component of the CIA Triad ensures that data has not been modified or tampered with by unauthorized entities?", ["Integrity", "Confidentiality", "Availability", "Authorization"], "Integrity", "Integrity guarantees the accuracy and completeness of data. Hashing is a common tool for this."),
  q(4002, 4, "2", ["Controls", "Physical"], "A security camera that records entry into a building is classified as which type of security control?", ["Detective", "Preventive", "Corrective", "Deterrent"], "Detective", "Detective controls identify and record unwanted events. While a camera might deter, its primary technical function is detection."),
  q(4003, 4, "4", ["Access Control", "Theory"], "Which access control model assigns permissions based on security labels (e.g., 'Top Secret') and user clearance levels?", ["Mandatory Access Control (MAC)", "Discretionary Access Control (DAC)", "Role-Based Access Control (RBAC)", "Attribute-Based Access Control (ABAC)"], "Mandatory Access Control (MAC)", "MAC is the strictest model, where the OS limits access based on labels, common in military environments."),
  q(4004, 4, "7", ["ACL", "Firewall"], "What is the final rule in every Firewall Access Control List (ACL), even if it is not explicitly written?", ["Implicit Deny", "Allow All", "Log Everything", "Loopback"], "Implicit Deny", "If traffic does not match any specific allow rule, the Implicit Deny rule blocks it by default."),
  q(4005, 4, "1", ["CIA", "Encryption"], "Encryption is primarily used to enforce which principle of the CIA Triad?", ["Confidentiality", "Integrity", "Availability", "Authentication"], "Confidentiality", "Encryption ensures that data remains private and unreadable to unauthorized users."),
  q(4006, 4, "2", ["Controls", "Physical"], "A physical fence surrounding a facility is an example of which type of security control?", ["Physical", "Technical", "Administrative", "Logical"], "Physical", "Physical controls are tangible barriers designed to prevent physical contact with assets."),
  q(4007, 4, "4", ["Access Control", "Theory"], "In which access control model does the creator or owner of a file have full discretion to assign permissions to others?", ["Discretionary Access Control (DAC)", "Mandatory Access Control (MAC)", "Role-Based Access Control (RBAC)", "Attribute-Based Access Control (ABAC)"], "Discretionary Access Control (DAC)", "DAC is the standard model for Windows/Linux file systems where the owner controls access."),
  q(4008, 4, "6", ["Appliance", "Web"], "Which security appliance is specifically designed to sit in front of a web server and protect it from attacks like SQL Injection and Cross-Site Scripting?", ["Web Application Firewall (WAF)", "Network Firewall", "Intrusion Prevention System (IPS)", "Proxy Server"], "Web Application Firewall (WAF)", "A WAF inspects HTTP/HTTPS traffic at Layer 7 to block web-specific exploits."),
  q(4009, 4, "5", ["Architecture", "Security"], "Which network zone contains public-facing services (like web servers) that need to be accessible from the internet but segregated from the internal LAN?", ["DMZ (Demilitarized Zone)", "Intranet", "VLAN", "Guest Network"], "DMZ (Demilitarized Zone)", "The DMZ acts as a buffer zone, exposing services to the internet while keeping the internal network secure."),
  q(4010, 4, "2", ["Controls", "Psychology"], "A 'Warning: Guard Dog on Duty' sign serves primarily as which type of control function?", ["Deterrent", "Preventive", "Detective", "Corrective"], "Deterrent", "Deterrent controls are designed to psychologically discourage an attacker from attempting the breach."),
  q(4011, 4, "4", ["Access Control", "Theory"], "Which access control model grants permissions based on a user's job function or title within the organization?", ["Role-Based Access Control (RBAC)", "Discretionary Access Control (DAC)", "Mandatory Access Control (MAC)", "Rule-Based Access Control"], "Role-Based Access Control (RBAC)", "RBAC simplifies management by assigning permissions to roles (groups) rather than individual users."),
  q(4012, 4, "3", ["Framework", "NIST"], "In the NIST Cybersecurity Framework, which function involves implementing safeguards (like training and access control) to ensure delivery of critical services?", ["Protect", "Identify", "Detect", "Respond"], "Protect", "The Protect function focuses on implementing controls to limit or contain the impact of a potential cybersecurity event."),
  q(4013, 4, "6", ["Architecture", "Admin"], "What is the purpose of a Jump Server (or Bastion Host) in a secure network architecture?", ["To provide a single, hardened entry point for administrators", "To balance traffic load across servers", "To cache web pages for faster access", "To route email traffic"], "To provide a single, hardened entry point for administrators", "Admins connect to the Jump Server first, then manage internal resources, reducing the attack surface."),
  q(4014, 4, "1", ["CIA", "Resilience"], "Implementing RAID for hard drives and using backup power generators primarily supports which CIA principle?", ["Availability", "Integrity", "Confidentiality", "Safety"], "Availability", "Redundancy measures ensure that systems remain operational and accessible even during hardware failures."),
  q(4015, 4, "6", ["Appliance", "Traffic"], "Which device acts as an intermediary for requests from clients seeking resources from other servers, often used for content filtering and caching?", ["Proxy Server", "Router", "Switch", "DNS Server"], "Proxy Server", "A Proxy Server makes requests on behalf of the client, masking the client's identity and allowing for filtering."),
  q(4016, 4, "7", ["ACL", "Logic"], "If a network packet does not match any of the 'Allow' rules in an Access Control List, what is the default action taken?", ["The packet is dropped (Implicit Deny)", "The packet is allowed", "The packet is flagged for review", "The packet is looped back"], "The packet is dropped (Implicit Deny)", "For security, ACLs are 'whitelist' based; anything not explicitly allowed is denied."),
  q(4017, 4, "2", ["Controls", "Recovery"], "Restoring a system from a backup tape after a ransomware attack is an example of which type of control?", ["Corrective", "Preventive", "Detective", "Deterrent"], "Corrective", "Corrective controls are used to restore systems to normal operations after an incident has occurred."),
  q(4018, 4, "4", ["Access Control", "Logic"], "Which access control model is the most flexible, allowing decisions based on complex logic like 'If user is a Manager AND time is between 9am-5pm'?", ["Attribute-Based Access Control (ABAC)", "Role-Based Access Control (RBAC)", "Discretionary Access Control (DAC)", "Mandatory Access Control (MAC)"], "Attribute-Based Access Control (ABAC)", "ABAC uses attributes of the user, resource, and environment (context) to make dynamic access decisions."),
  q(4019, 4, "3", ["Admin", "Analysis"], "The process of comparing your organization's current security posture against a desired standard or framework is known as:", ["Gap Analysis", "Penetration Testing", "Vulnerability Scanning", "Forensics"], "Gap Analysis", "Gap Analysis identifies the 'gap' between where you are and where you want to be according to a framework."),
  q(4020, 4, "6", ["Appliance", "Hardware"], "A single network appliance that combines a firewall, antivirus, spam filter, and intrusion prevention is called:", ["Unified Threat Management (UTM)", "Router", "Switch", "Modem"], "Unified Threat Management (UTM)", "UTM devices provide comprehensive security in a single box, ideal for small to medium businesses."),
  q(4021, 4, "1", ["CIA", "Proof"], "Which security concept ensures that a sender cannot deny having sent a specific message?", ["Non-Repudiation", "Integrity", "Confidentiality", "Authentication"], "Non-Repudiation", "Non-Repudiation provides proof of origin, typically using digital signatures, so the author cannot deny their action."),
  q(4022, 4, "5", ["Architecture", "Defense"], "In a Defense-in-Depth strategy, endpoint devices (laptops, phones) are considered which line of defense?", ["Last Line of Defense", "First Line of Defense", "Perimeter Defense", "Zero Line"], "Last Line of Defense", "If the firewall and network security fail, the endpoint's own security (like Antivirus) is the final barrier."),
  q(4023, 4, "2", ["Controls", "Admin"], "Mandatory vacations and background checks are examples of which type of security control?", ["Administrative / Managerial", "Technical", "Physical", "Logical"], "Administrative / Managerial", "These are policy-based controls focused on personnel management."),
  q(4024, 4, "7", ["ACL", "Legacy"], "A Standard Access Control List (ACL) on a router can filter traffic based on which criteria?", ["Source IP Address only", "Destination IP Address", "Port Number", "Protocol"], "Source IP Address only", "Standard ACLs are limited to filtering based solely on the Source IP address."),
  q(4025, 4, "6", ["Appliance", "Traffic"], "Which device is responsible for distributing incoming network traffic across multiple servers to ensure no single server is overwhelmed?", ["Load Balancer", "Proxy Server", "Router", "Switch"], "Load Balancer", "Load Balancers improve availability and performance by spreading work across a server farm."),
  q(4026, 4, "5", ["Architecture", "Switching"], "Which technology allows you to logically segment a switch into multiple virtual networks, improving security and reducing broadcast traffic?", ["VLAN (Virtual LAN)", "Trunking", "Subnetting", "DMZ"], "VLAN (Virtual LAN)", "VLANs partition a Layer 2 network, isolating traffic between different groups of ports."),
  q(4027, 4, "6", ["Appliance", "Monitoring"], "Which security system monitors network traffic for suspicious activity and alerts administrators but does not block the traffic?", ["Intrusion Detection System (IDS)", "Intrusion Prevention System (IPS)", "Firewall", "WAF"], "Intrusion Detection System (IDS)", "An IDS is passive; it watches and alerts. An IPS is active and can block the traffic."),
  q(4028, 4, "1", ["Policy", "Admin"], "The principle of Least Privilege dictates that users should be granted:", ["Only the minimum permissions necessary to do their job", "No permissions by default", "Full Administrative access", "Read-Only access to everything"], "Only the minimum permissions necessary to do their job", "Least Privilege minimizes the potential damage if a user account is compromised."),
  q(4029, 4, "3", ["Defense", "Deception"], "A decoy system configured to look vulnerable to attract and study attackers is called a:", ["Honeypot", "Firewall", "Jump Server", "Proxy"], "Honeypot", "Honeypots distract attackers from real assets and allow security teams to analyze their methods."),
  q(4030, 4, "7", ["ACL", "Firewall"], "Unlike a Standard ACL, an Extended ACL can filter traffic based on:", ["Source IP, Destination IP, Protocol, and Port", "Source IP only", "MAC Address only", "Username"], "Source IP, Destination IP, Protocol, and Port", "Extended ACLs provide granular control by filtering based on IP, Protocol, and Port information."),
  q(4031, 4, "5", ["Segmentation", "Zero Trust"], "Which practice MOST directly limits lateral movement if an endpoint is compromised?", ["Flat network design", "Network segmentation / microsegmentation", "Disable MFA", "Open guest Wi-Fi"], "Network segmentation / microsegmentation", "Segmentation reduces blast radius by limiting what a compromised host can reach."),
  q(4032, 4, "6", ["PKI", "Certificates"], "A browser warning 'certificate not trusted' most commonly indicates:", ["The server is down", "The certificate chain cannot be validated to a trusted root", "DNS is broken", "MTU mismatch"], "The certificate chain cannot be validated to a trusted root", "Trust depends on validating the chain to a CA root in the client trust store."),
  q(4033, 4, "7", ["Firewall", "Stateful"], "A stateful firewall differs from a stateless firewall because it:", ["Only blocks port 80", "Tracks connection state and allows return traffic dynamically", "Routes between VLANs", "Replaces DNS"], "Tracks connection state and allows return traffic dynamically", "Stateful inspection maintains session tables so return traffic is handled intelligently."),
  q(4034, 4, "2", ["Controls", "Technical"], "Requiring MFA for VPN logins is primarily which control type?", ["Detective", "Technical/Preventive", "Physical", "Deterrent only"], "Technical/Preventive", "MFA is a technical control that prevents unauthorized access by adding a factor."),
  q(4035, 4, "4", ["Access Control", "NAC"], "802.1X authentication on a switch port is an example of:", ["Content filtering", "Port-based network access control", "Routing protocol hardening", "Data loss prevention"], "Port-based network access control", "802.1X controls access at the edge before the device can join the network."),
  q(4036, 4, "6", ["Web", "Headers"], "Which web security mechanism tells browsers to prefer HTTPS and avoid protocol downgrade where possible?", ["HSTS", "NTP", "SMB signing", "WEP"], "HSTS", "HTTP Strict Transport Security helps enforce HTTPS usage and reduce downgrade risk."),
  q(4037, 4, "5", ["Architecture", "DMZ"], "Which is the BEST placement for a public web server that must be reachable from the internet but isolated from internal systems?", ["Internal LAN", "DMZ", "Management VLAN", "Storage VLAN"], "DMZ", "A DMZ isolates public-facing services to reduce risk to internal networks."),
  q(4038, 4, "3", ["Risk", "Process"], "Which action MOST directly reduces risk from known vulnerabilities on network appliances?", ["Disable backups", "Apply vendor patches/firmware updates", "Turn off logging", "Share admin passwords"], "Apply vendor patches/firmware updates", "Patching reduces exposure to known exploits and is a foundational security practice."),
  q(4039, 4, "7", ["Wireless", "Isolation"], "To keep guest Wi-Fi users from accessing internal resources, you should implement:", ["A shared PSK with employees", "Guest VLAN + firewall rules", "WEP", "Port mirroring"], "Guest VLAN + firewall rules", "Segregating guests to a dedicated VLAN and restricting with firewall rules prevents internal access."),
  q(4040, 4, "1", ["CIA", "Backups"], "Regular, tested backups primarily support which CIA objective when ransomware encrypts production data?", ["Availability", "Confidentiality", "Integrity only", "Non-repudiation"], "Availability", "Backups help restore service/data access after destructive events."),
  q(4041, 4, "4", ["Management", "Hardening"], "Which management practice MOST reduces the risk of credential theft during device administration?", ["Use Telnet", "Use SSH with key-based auth", "Use HTTP", "Share one admin password"], "Use SSH with key-based auth", "SSH encrypts management traffic; keys reduce reliance on reusable passwords."),
  q(4042, 4, "5", ["Logging", "Security"], "Centralizing logs from routers, switches, and firewalls primarily improves:", ["Cable speed", "Incident detection and investigation", "Subnet capacity", "Wi-Fi roaming"], "Incident detection and investigation", "Central logs enable correlation and faster forensics during incidents."),
  q(4043, 4, "6", ["Certificates", "Identity"], "Which certificate field is MOST associated with validating the site name you intended to reach?", ["Common Name / Subject Alternative Name", "Serial number", "Issuer country", "Key usage only"], "Common Name / Subject Alternative Name", "Modern validation relies heavily on SAN entries matching the DNS name."),
  q(4044, 4, "7", ["Firewall", "Rules"], "Best practice for firewall policy design is to:", ["Allow all and log later", "Start with deny-all then permit required traffic", "Disable rule comments", "Avoid change control"], "Start with deny-all then permit required traffic", "A default-deny stance reduces exposure by allowing only necessary traffic."),
  q(4045, 4, "3", ["Access", "Least Privilege"], "Which concept ensures users receive only the access needed to perform their job and nothing more?", ["Least privilege", "Implicit trust", "Full control", "Anonymous access"], "Least privilege", "Least privilege reduces damage if an account is compromised."),
  q(4046, 4, "6", ["Network", "DLP"], "A control designed to prevent sensitive data from leaving the organization via email or uploads is:", ["DLP", "NAT", "ARP", "STP"], "DLP", "Data Loss Prevention systems identify and block unauthorized data exfiltration."),
  q(4047, 4, "5", ["Architecture", "Mgmt Plane"], "Which approach BEST protects network device management interfaces from user traffic?", ["Put management on the same VLAN as users", "Dedicated management VLAN + ACLs", "Open SNMPv2c to the internet", "Use default passwords"], "Dedicated management VLAN + ACLs", "Separating the management plane reduces attack surface and exposure."),
  q(4048, 4, "4", ["Wireless", "Encryption"], "Which is the BEST reason to avoid open (unencrypted) Wi-Fi for internal corporate access?", ["It uses too much power", "Traffic can be intercepted and sessions hijacked", "It breaks VLANs", "It blocks DHCP"], "Traffic can be intercepted and sessions hijacked", "Without encryption/authentication, users are vulnerable to interception and on-path attacks."),
  q(4049, 4, "6", ["Patch", "Supply Chain"], "Which practice helps ensure firmware updates for network devices haven’t been tampered with?", ["Verify hashes/signatures from the vendor", "Install from random mirrors", "Disable TLS", "Turn off logging"], "Verify hashes/signatures from the vendor", "Integrity verification helps confirm firmware authenticity before deployment."),
  q(4050, 4, "5", ["Auth", "MFA"], "Which MFA factor is MOST resistant to phishing compared to SMS codes?", ["Security key (FIDO2/WebAuthn)", "Password reuse", "Email OTPs", "Knowledge questions"], "Security key (FIDO2/WebAuthn)", "Hardware-backed phishing-resistant MFA ties authentication to the legitimate site."),

  // --- DOMAIN 5: THREATS & ATTACKS ---
  q(5001, 5, "1", ["Actors", "APT"], "Which type of threat actor is typically a nation-state with significant resources, sophisticated tools, and a long-term goal of espionage?", ["Advanced Persistent Threat (APT)", "Script Kiddie", "Insider Threat", "Hacktivist"], "Advanced Persistent Threat (APT)", "APTs are well-funded, highly skilled attackers (often government-backed) who maintain long-term presence on a network."),
  q(5002, 5, "3", ["Wireless", "Attack"], "An attacker sets up a rogue Wi-Fi Access Point with the same SSID as the legitimate corporate network to steal credentials. What is this attack called?", ["Evil Twin", "War Driving", "Bluejacking", "Replay Attack"], "Evil Twin", "An Evil Twin mimics a trusted network to trick users into connecting, allowing the attacker to intercept data."),
  q(5003, 5, "4", ["Malware", "Crypto"], "Which type of malware encrypts a user's files and demands payment in exchange for the decryption key?", ["Ransomware", "Trojan", "Worm", "Spyware"], "Ransomware", "Ransomware denies access to data via encryption for the purpose of extortion."),
  q(5004, 5, "3", ["Social Eng", "Email"], "A targeted phishing attack specifically aimed at high-level executives like a CEO or CFO is known as:", ["Whaling", "Spear Phishing", "Vishing", "Smishing"], "Whaling", "Whaling is a specific form of spear phishing that targets the 'big fish' within an organization."),
  q(5005, 5, "2", ["Network Attack", "DoS"], "Which attack involves compromising thousands of devices (creating a botnet) to flood a target server with traffic and take it offline?", ["DDoS (Distributed Denial of Service)", "DoS (Denial of Service)", "Man-in-the-Middle", "IP Spoofing"], "DDoS (Distributed Denial of Service)", "DDoS attacks use multiple sources (bots) to overwhelm a target, making it harder to block than a standard DoS."),
  q(5006, 5, "1", ["Actors", "Skill"], "Which term describes an unskilled attacker who uses pre-made tools and scripts found online to launch attacks?", ["Script Kiddie", "Hacker", "APT", "Insider"], "Script Kiddie", "Script Kiddies lack deep technical knowledge and rely on tools written by others."),
  q(5007, 5, "2", ["Network Attack", "MitM"], "In which type of attack does the hacker secretly relay and possibly alter communications between two parties who believe they are communicating directly?", ["Man-in-the-Middle (On-path)", "Replay Attack", "DDoS", "SQL Injection"], "Man-in-the-Middle (On-path)", "MitM attacks involve intercepting the data flow between two endpoints."),
  q(5008, 5, "4", ["Malware", "Spread"], "Unlike a virus, which type of malware is self-replicating and spreads automatically across the network without user interaction?", ["Worm", "Trojan", "Adware", "Rootkit"], "Worm", "Worms exploit network vulnerabilities to spread themselves, whereas viruses require a host file and user action."),
  q(5009, 5, "3", ["Social Eng", "Physical"], "An attacker gains entry to a secure building by following closely behind an authorized employee who just badged in. What is this called?", ["Tailgating", "Dumpster Diving", "Shoulder Surfing", "Cloning"], "Tailgating", "Tailgating (or Piggybacking) is a physical social engineering attack that exploits common courtesy."),
  q(5010, 5, "2", ["Network Attack", "MitM"], "Which local network attack involves sending fake ARP messages to associate the attacker's MAC address with the default gateway's IP address?", ["ARP Poisoning", "DNS Poisoning", "DHCP Snooping", "VLAN Hopping"], "ARP Poisoning", "ARP Poisoning redirects traffic on the LAN to the attacker, facilitating Man-in-the-Middle attacks."),
  q(5011, 5, "4", ["Malware", "Disguise"], "Malware that disguises itself as legitimate or useful software (like a game) to trick the user into installing it is called a:", ["Trojan Horse", "Virus", "Worm", "Rootkit"], "Trojan Horse", "Like the myth, a Trojan hides a malicious payload inside a seemingly harmless package."),
  q(5012, 5, "3", ["Social Eng", "Voice"], "Social engineering attacks conducted over voice calls, often impersonating authority figures, are known as:", ["Vishing", "Smishing", "Pharming", "Spam"], "Vishing", "Vishing stands for Voice Phishing, using the telephone system to steal info."),
  q(5013, 5, "1", ["Actors", "Ideology"], "Which threat actor is motivated primarily by ideological, political, or social causes rather than financial gain?", ["Hacktivist", "APT", "Organized Crime", "Insider"], "Hacktivist", "Hacktivists (like Anonymous) attack targets to promote a cause or protest."),
  q(5014, 5, "4", ["Malware", "OS"], "Which type of malware installs itself deep within the operating system (kernel level) to hide its presence from antivirus software?", ["Rootkit", "Spyware", "Ransomware", "Virus"], "Rootkit", "Rootkits subvert the OS itself to remain undetected while maintaining privileged access."),
  q(5015, 5, "2", ["Network Attack", "VLAN"], "Techniques like 'Switch Spoofing' and 'Double Tagging' are used to perform which type of attack?", ["VLAN Hopping", "Bluejacking", "Snarfing", "MAC Flooding"], "VLAN Hopping", "VLAN Hopping allows an attacker to send traffic to a VLAN they are not authorized to access."),
  q(5016, 5, "3", ["Social Eng", "Physical"], "Searching through an organization's trash to find discarded documents containing sensitive information is called:", ["Dumpster Diving", "Tailgating", "Reconnaissance", "Scanning"], "Dumpster Diving", "Dumpster Diving is a low-tech method of gathering information (reconnaissance)."),
  q(5017, 5, "4", ["Malware", "Trigger"], "Malicious code inserted into a system that lies dormant until a specific condition (like a date or time) is met is called a:", ["Logic Bomb", "Worm", "Trojan", "Backdoor"], "Logic Bomb", "A Logic Bomb executes its payload only when specific triggers occur, such as an employee being fired."),
  q(5018, 5, "3", ["Social Eng", "SMS"], "Phishing attacks conducted via SMS text messages are referred to as:", ["Smishing", "Vishing", "Whaling", "Spam"], "Smishing", "Smishing stands for SMS Phishing."),
  q(5019, 5, "1", ["Actors", "Trust"], "Which threat actor has authorized access to the network and may cause damage either maliciously or accidentally?", ["Insider Threat", "APT", "Competitor", "Script Kiddie"], "Insider Threat", "Insiders are dangerous because they already bypass perimeter defenses like firewalls."),
  q(5020, 5, "2", ["Network Attack", "DNS"], "Which attack involves corrupting the DNS cache to redirect a user from a legitimate website to a fake one?", ["DNS Poisoning", "ARP Poisoning", "URL Hijacking", "Domain Squatting"], "DNS Poisoning", "DNS Poisoning alters name resolution records so users are unknowingly sent to a malicious server."),
  q(5021, 5, "3", ["Social Eng", "Email"], "A specific type of phishing where an attacker impersonates a C-level executive to trick the finance department into transferring funds is called:", ["Business Email Compromise (BEC)", "Whaling", "Vishing", "Spam"], "Business Email Compromise (BEC)", "BEC is a highly effective, non-technical attack that relies on authority and urgency."),
  q(5022, 5, "2", ["Defense", "Switching"], "What is the best mitigation strategy to prevent VLAN Hopping attacks?", ["Disable DTP (Dynamic Trunking Protocol) on ports", "Enable DHCP Snooping", "Use WPA3 Security", "Implement Port Mirroring"], "Disable DTP (Dynamic Trunking Protocol) on ports", "Disabling DTP and manually configuring trunk ports prevents attackers from negotiating a trunk link."),
  q(5023, 5, "4", ["Malware", "Spyware"], "Which type of malware records every key pressed by the user to steal passwords and credit card numbers?", ["Keylogger", "Worm", "Ransomware", "Adware"], "Keylogger", "Keyloggers are a form of spyware specifically designed to capture input."),
  q(5024, 5, "2", ["Defense", "DoS"], "What is a common mitigation strategy for DDoS attacks where traffic is directed to a non-existent IP address?", ["Blackholing / Null Routing", "Antivirus", "Encryption", "Backups"], "Blackholing / Null Routing", "Blackholing drops malicious traffic at the routing level so it never reaches the target."),
  q(5025, 5, "1", ["Actors", "Crime"], "Which threat actor group is primarily motivated by financial gain and operates like a professional business?", ["Organized Crime", "Hacktivist", "Script Kiddie", "APT"], "Organized Crime", "Organized Crime groups are profit-driven and often run 'Ransomware-as-a-Service' operations."),
  q(5026, 5, "2", ["Network Attack", "Switching"], "Which attack involves flooding a switch with fake MAC addresses to fill its CAM table, forcing it to act like a hub?", ["MAC Flooding", "ARP Poisoning", "VLAN Hopping", "Spoofing"], "MAC Flooding", "MAC Flooding forces the switch into 'fail-open' mode, broadcasting traffic to all ports."),
  q(5027, 5, "4", ["Network Attack", "DDoS"], "Which type of attack relies on a network of compromised 'zombie' computers controlled by a Command and Control (C2) server?", ["DDoS", "DoS", "Man-in-the-Middle", "Phishing"], "DDoS", "A botnet is the primary tool used to launch Distributed Denial of Service attacks."),
  q(5028, 5, "3", ["Social Eng", "Physical"], "An attacker watching a user type their password from across the room is performing which attack?", ["Shoulder Surfing", "Tailgating", "Dumpster Diving", "Scanning"], "Shoulder Surfing", "Shoulder Surfing is visual spying to obtain credentials."),
  q(5029, 5, "2", ["Network Attack", "DHCP"], "In which attack does a rogue device on the network assign incorrect IP addresses and gateway information to clients?", ["DHCP Spoofing", "DNS Poisoning", "ARP Poisoning", "Replay Attack"], "DHCP Spoofing", "A rogue DHCP server can direct traffic to the attacker by assigning them as the default gateway."),
  q(5030, 5, "1", ["Actors", "Skill"], "Individuals who hack for the thrill, validation, or bragging rights are typically classified as:", ["Script Kiddies", "APT", "Organized Crime", "Insiders"], "Script Kiddies", "While skill levels vary, the motivation of 'clout' or attention is typical of less professional attackers."),
  q(5031, 5, "2", ["DoS", "DNS"], "An attacker sends small spoofed DNS queries that cause large responses to flood a victim. This is best described as:", ["DNS amplification", "ARP poisoning", "MAC flapping", "Bluejacking"], "DNS amplification", "Amplification attacks leverage protocols where responses can be much larger than requests."),
  q(5032, 5, "3", ["Wireless", "Attack"], "A Wi-Fi attack that forces clients to disconnect by spoofing management frames is commonly known as:", ["Deauthentication attack", "Smishing", "Pharming", "Token passing"], "Deauthentication attack", "Spoofed deauth frames can kick clients off an AP, often as part of a larger attack."),
  q(5033, 5, "2", ["Credentials", "Attack"], "Using previously leaked username/password pairs to attempt logins across multiple services is called:", ["Credential stuffing", "Brute forcing", "Rainbow table", "Shoulder surfing"], "Credential stuffing", "Credential stuffing abuses password reuse across sites/services."),
  q(5034, 5, "4", ["Malware", "Network"], "Which malware type most commonly spreads laterally by exploiting network services without user interaction?", ["Worm", "Adware", "Logic bomb", "Spyware"], "Worm", "Worms are self-replicating and commonly spread by exploiting network-facing vulnerabilities."),
  q(5035, 5, "2", ["Routing", "Attack"], "Illegitimately advertising IP prefixes to redirect internet traffic is an example of:", ["BGP hijacking", "DNSSEC", "NAT traversal", "VLAN tagging"], "BGP hijacking", "BGP route announcements can be abused to redirect/blackhole traffic without strong protections."),
  q(5036, 5, "3", ["Social Eng", "Pretexting"], "An attacker calls the help desk pretending to be a new employee who 'lost access' to reset MFA. This is:", ["Pretexting", "Tailgating", "Dumpster diving", "Bluejacking"], "Pretexting", "Pretexting is creating a believable story to manipulate staff into bypassing controls."),
  q(5037, 5, "2", ["MitM", "LAN"], "Which control MOST directly helps prevent ARP spoofing on managed switches?", ["DHCP snooping only", "Dynamic ARP Inspection (DAI)", "WEP", "Port mirroring"], "Dynamic ARP Inspection (DAI)", "DAI validates ARP messages (often using DHCP snooping bindings) to block spoofed ARP replies."),
  q(5038, 5, "4", ["Malware", "C2"], "A system that periodically beacons to an attacker-controlled server for instructions is communicating with:", ["C2 (Command and Control)", "NTP", "OCSP", "SIP"], "C2 (Command and Control)", "C2 infrastructure is used to control compromised hosts (botnets, remote ops)."),
  q(5039, 5, "1", ["Insider", "Risk"], "Which control BEST reduces the risk of a single administrator causing major damage intentionally?", ["Shared admin accounts", "Separation of duties + least privilege", "Disable logging", "Use Telnet"], "Separation of duties + least privilege", "Splitting responsibilities and limiting privileges reduces insider impact and increases accountability."),
  q(5040, 5, "3", ["Email", "Defense"], "Which email control helps prevent spoofed 'From' domains by validating sender authorization at the domain level?", ["SPF", "NAT", "ARP", "EIGRP"], "SPF", "SPF publishes which mail servers are allowed to send for a domain, helping reduce spoofing."),
  q(5041, 5, "2", ["Credentials", "Attack"], "An attacker tries one common password (e.g., Winter2026!) against many user accounts. This is called:", ["Password spraying", "Dictionary attack", "Rainbow table", "Whaling"], "Password spraying", "Password spraying reduces lockouts by spreading attempts across many accounts."),
  q(5042, 5, "3", ["Network", "Recon"], "Scanning a target to identify open ports and services is best classified as:", ["Reconnaissance / enumeration", "Data exfiltration", "Privilege escalation", "Persistence"], "Reconnaissance / enumeration", "Port scanning is commonly used to enumerate exposed services before exploitation."),
  q(5043, 5, "2", ["DoS", "NTP"], "A reflection/amplification attack frequently associated with UDP port 123 targets which service?", ["NTP", "SMTP", "IMAP", "RDP"], "NTP", "NTP (UDP 123) has historically been abused for amplification attacks when misconfigured."),
  q(5044, 5, "3", ["Wireless", "Rogue"], "A malicious AP connected inside the building to bypass perimeter security is best described as:", ["Rogue access point", "Evil twin", "Bluejacking", "Smishing"], "Rogue access point", "A rogue AP is physically connected to the internal network, creating an unauthorized wireless entry point."),
  q(5045, 5, "4", ["Malware", "Phishing"], "A document that asks a user to 'Enable Content' to run a malicious macro is most often delivering:", ["Malware via phishing attachment", "BGP hijacking", "NAT traversal", "ARP inspection"], "Malware via phishing attachment", "Malicious macros are a common phishing delivery method for initial access."),
  q(5046, 5, "2", ["DNS", "Attack"], "Redirecting users by changing DNS settings on their router or endpoint is commonly called:", ["DNS hijacking", "ARP inspection", "VLAN tagging", "Packet shaping"], "DNS hijacking", "Changing DNS resolvers can silently redirect users to malicious destinations."),
  q(5047, 5, "4", ["MitM", "Wi-Fi"], "A user connects to open public Wi-Fi and enters credentials on a fake login page. This is MOST likely:", ["Captive portal phishing", "BGP peering", "Spanning tree loop", "STP root guard"], "Captive portal phishing", "Attackers can mimic captive portals to steal credentials on open networks."),
  q(5048, 5, "3", ["LAN", "Attack"], "Flooding a switch CAM table to force broadcasting and capture traffic is known as:", ["MAC flooding", "Smishing", "ARP caching", "DNSSEC"], "MAC flooding", "MAC flooding fills CAM tables so the switch behaves more like a hub (broadcasting frames)."),
  q(5049, 5, "2", ["Email", "Attack"], "An attacker forges the display name of a known executive to trick staff into action. This is commonly:", ["Email spoofing / impersonation", "BGP hijacking", "NDP", "Port security"], "Email spoofing / impersonation", "Display-name spoofing is a common social engineering tactic; technical controls help but training matters."),
  q(5050, 5, "3", ["Web", "Attack"], "Tricking a victim into clicking a legitimate-looking link that actually leads to a malicious URL is best described as:", ["Phishing", "War driving", "Shoulder surfing", "Bluejacking"], "Phishing", "Phishing uses deception to lure users into providing credentials or executing malicious actions."),

  // --- DOMAIN 6: CRYPTOGRAPHY ---
  q(6001, 6, "5", ["Concept", "PKI"], "Which cryptographic concept uses digital signatures to prove the origin of a message, preventing the sender from denying they sent it?", ["Non-Repudiation", "Confidentiality", "Integrity", "Availability"], "Non-Repudiation", "Non-Repudiation ensures that the author cannot dispute the validity of their signature."),
  q(6002, 6, "3", ["Asymmetric", "Keys"], "What is the primary advantage of Asymmetric encryption over Symmetric encryption?", ["Solves the Key Exchange problem", "It is much faster", "The keys are smaller", "It is easier to implement"], "Solves the Key Exchange problem", "Asymmetric encryption allows secure communication without pre-sharing a secret key."),
  q(6003, 6, "1", ["Hashing", "Algorithms"], "Which of the following hashing algorithms is considered secure for modern applications?", ["SHA-256", "MD5", "SHA-1", "CRC"], "SHA-256", "SHA-256 is a standard, secure hashing algorithm. MD5 and SHA-1 have known collision vulnerabilities."),
  q(6004, 6, "2", ["Symmetric", "Algorithms"], "Which Symmetric encryption algorithm is the current industry gold standard used by the US government?", ["AES", "DES", "3DES", "RC4"], "AES", "Advanced Encryption Standard (AES) is robust and efficient, replacing older ciphers like DES."),
  q(6005, 6, "1", ["Hashing", "Defense"], "What is the process of adding random data to a password before hashing it to defend against Rainbow Table attacks?", ["Salting", "Padding", "Peppering", "Mixing"], "Salting", "Salting ensures that identical passwords result in different hashes, making pre-computed tables useless."),
  q(6006, 6, "5", ["PKI", "Roles"], "In a Public Key Infrastructure (PKI), which entity is responsible for issuing and verifying digital certificates?", ["Certificate Authority (CA)", "ISP", "DNS Server", "User"], "Certificate Authority (CA)", "The CA acts as the trusted third party that vouches for the identity of certificate holders."),
  q(6007, 6, "1", ["Concept", "Obscurity"], "The practice of hiding data within another file, such as hiding text inside an image, is known as:", ["Steganography", "Encryption", "Hashing", "Masking"], "Steganography", "Steganography relies on security through obscurity by hiding the existence of the message."),
  q(6008, 6, "3", ["Asymmetric", "Mobile"], "Which asymmetric algorithm is preferred for mobile devices because it provides strong security with smaller key sizes?", ["Elliptic Curve Cryptography (ECC)", "RSA", "AES", "Diffie-Hellman"], "Elliptic Curve Cryptography (ECC)", "ECC is computationally efficient, making it ideal for devices with limited power like phones."),
  q(6009, 6, "6", ["Hashing", "Attack"], "What has occurred when two different inputs produce the exact same hash output?", ["Collision", "Rainbow", "Salt", "Match"], "Collision", "A collision is a cryptographic failure where the hash is not unique to the specific data."),
  q(6010, 6, "3", ["Asymmetric", "Keys"], "The Diffie-Hellman protocol is primarily used for which purpose?", ["Secure Key Exchange", "Encrypting Files", "Hashing Passwords", "Digital Signatures"], "Secure Key Exchange", "Diffie-Hellman allows two parties to securely generate a shared symmetric key over an insecure channel."),
  q(6011, 6, "5", ["PKI", "Validation"], "Which protocol allows a client to check the revocation status of a digital certificate in real-time?", ["OCSP (Online Certificate Status Protocol)", "CRL", "CSR", "CA"], "OCSP (Online Certificate Status Protocol)", "OCSP queries the CA directly for the status of a specific cert, unlike downloading a full CRL."),
  q(6012, 6, "2", ["Symmetric", "Weakness"], "What is the primary disadvantage of Symmetric encryption?", ["Key Distribution / Exchange", "Encryption Speed", "Algorithm Strength", "Complexity"], "Key Distribution / Exchange", "The sender and receiver must share the same key, and sending that key securely is difficult."),
  q(6013, 6, "4", ["Hardware", "Crypto"], "Which hardware chip embedded on a motherboard is used to store encryption keys and verify boot integrity?", ["Trusted Platform Module (TPM)", "CPU", "GPU", "BIOS"], "Trusted Platform Module (TPM)", "The TPM is a dedicated crypto processor used for functions like BitLocker encryption."),
  q(6014, 6, "1", ["Hashing", "CIA"], "Hashing algorithms are used to enforce which element of the CIA Triad?", ["Integrity", "Confidentiality", "Availability", "Authentication"], "Integrity", "Hashing verifies that a file or message has not been altered in transit."),
  q(6015, 6, "5", ["PKI", "Process"], "What must an administrator generate and send to a Certificate Authority to apply for a digital certificate?", ["Certificate Signing Request (CSR)", "CRL", "OCSP", "Private Key"], "Certificate Signing Request (CSR)", "A CSR contains the public key and identity information needed to create the certificate."),
  q(6016, 6, "6", ["Attack", "Protocol"], "Which type of attack forces a system to abandon a secure connection (like TLS) and fallback to an older, insecure protocol?", ["Downgrade Attack", "Replay Attack", "Brute Force", "Dictionary Attack"], "Downgrade Attack", "Downgrade attacks exploit backward compatibility to force the use of weak encryption."),
  q(6017, 6, "4", ["Hardware", "Crypto"], "What is a Hardware Security Module (HSM)?", ["A dedicated appliance for managing and storing encryption keys", "A USB drive for passwords", "A server firewall", "A type of router"], "A dedicated appliance for managing and storing encryption keys", "HSMs are high-security, tamper-resistant devices used in enterprise environments for crypto processing."),
  q(6018, 6, "4", ["Concept", "Ledger"], "Which technology relies on a decentralized, distributed ledger where blocks are chained together using hashes?", ["Blockchain", "Database", "PKI", "RAID"], "Blockchain", "Blockchain maintains integrity by linking every block to the previous one via a cryptographic hash."),
  q(6019, 6, "6", ["Attack", "Hashing"], "An attack that uses a massive database of pre-computed hashes to crack passwords instantly is known as a:", ["Rainbow Table Attack", "Brute Force Attack", "Dictionary Attack", "Password Spraying"], "Rainbow Table Attack", "Rainbow tables trade storage space for speed, allowing instant lookup of unsalted hashes."),
  q(6020, 6, "3", ["Asymmetric", "Keys"], "If Alice wants to send Bob an encrypted email that only Bob can read, which key should she use to encrypt it?", ["Bob's Public Key", "Bob's Private Key", "Alice's Public Key", "Alice's Private Key"], "Bob's Public Key", "Data encrypted with a Public Key can only be decrypted by the matching Private Key (which only Bob has)."),
  q(6021, 6, "2", ["Symmetric", "Legacy"], "Why is the 3DES encryption algorithm considered deprecated?", ["It is computationally slow and vulnerable", "It is too fast", "It uses asymmetric keys", "It requires 64-bit OS"], "It is computationally slow and vulnerable", "3DES applies DES three times, making it inefficient, and its small block size makes it vulnerable to modern attacks."),
  q(6022, 6, "1", ["Hashing", "Theory"], "Is it possible to decrypt an MD5 hash back into the original text?", ["No, hashing is a one-way function", "Yes, with the private key", "Yes, using the public key", "Only if it was salted"], "No, hashing is a one-way function", "Hashing is designed to be irreversible; you cannot reverse the math to get the input data."),
  q(6023, 6, "5", ["PKI", "Files"], "Which of the following file extensions typically indicates a digital certificate?", [".pem", ".exe", ".txt", ".bat"], ".pem", "Common certificate formats include .pem, .crt, .cer, and .pfx."),
  q(6024, 6, "4", ["Advanced", "Theory"], "What does Homomorphic Encryption allow you to do?", ["Perform calculations on encrypted data without decrypting it", "Break any key instantly", "Encrypt data twice", "Hide data inside audio files"], "Perform calculations on encrypted data without decrypting it", "This emerging tech allows for secure data processing (e.g., in the cloud) while keeping the data private."),
  q(6025, 6, "5", ["PKI", "Validation"], "If a Certificate Authority discovers a certificate has been compromised, what list must be updated?", ["Certificate Revocation List (CRL)", "White List", "Black List", "Access Control List"], "Certificate Revocation List (CRL)", "The CRL contains the serial numbers of certificates that are no longer trusted."),
  q(6026, 6, "2", ["Wireless", "Encryption"], "Which encryption protocol is the standard for WPA2 networks?", ["AES-CCMP", "TKIP", "RC4", "GCMP"], "AES-CCMP", "AES-CCMP is the mandatory encryption mechanism for WPA2 compliance."),
  q(6027, 6, "3", ["Asymmetric", "Math"], "The security of the RSA algorithm relies on the mathematical difficulty of:", ["Factoring large prime numbers", "Elliptic curve logarithms", "Discrete logarithms", "Block cipher substitution"], "Factoring large prime numbers", "RSA is based on the premise that it is easy to multiply primes but hard to factor the product back."),
  q(6028, 6, "6", ["Attack", "Password"], "Which password attack tries every word in a predefined list to guess the password?", ["Dictionary Attack", "Brute Force Attack", "Rainbow Table", "Replay Attack"], "Dictionary Attack", "A Dictionary Attack uses a list of likely passwords (like 'password123') rather than trying every random combination."),
  q(6029, 6, "1", ["Hashing", "Theory"], "In hashing, the 'Avalanche Effect' refers to what property?", ["A small change in input causes a drastic change in the hash", "Two inputs producing the same hash", "Adding salt to the input", "Padding the data to a fixed length"], "A small change in input causes a drastic change in the hash", "This ensures that similar inputs do not produce similar hashes, obscuring patterns."),
  q(6030, 6, "5", ["PKI", "Trust"], "Which trust model allows internet browsers to trust websites via a hierarchy of Certificate Authorities?", ["PKI (Public Key Infrastructure)", "Web of Trust", "Kerberos", "RADIUS"], "PKI (Public Key Infrastructure)", "PKI uses a hierarchical chain of trust from Root CAs down to individual server certificates."),
  q(6031, 6, "3", ["TLS", "Handshake"], "Which TLS property ensures that compromising a server’s private key later does NOT decrypt previously captured sessions?", ["Forward secrecy (PFS)", "Compression", "Token passing", "Obfuscation"], "Forward secrecy (PFS)", "PFS uses ephemeral key exchange so past sessions remain protected even if a long-term key is exposed."),
  q(6032, 6, "5", ["PKI", "Chain"], "A server certificate is issued by an intermediate CA which chains to a root CA. This is an example of:", ["Hierarchical trust model", "Web of trust", "Ring of trust", "Shared secret model"], "Hierarchical trust model", "Browsers validate certificates through a chain up to a trusted root."),
  q(6033, 6, "2", ["Symmetric", "Modes"], "In modern VPNs and Wi-Fi, which symmetric cipher is most commonly used as the standard baseline?", ["AES", "DES", "RC4", "MD5"], "AES", "AES is the widely accepted modern symmetric cipher used in many secure protocols."),
  q(6034, 6, "1", ["Hashing", "Use Case"], "Which cryptographic function is MOST appropriate to verify a downloaded ISO was not altered?", ["Hashing (e.g., SHA-256)", "Symmetric encryption", "Asymmetric encryption", "Steganography"], "Hashing (e.g., SHA-256)", "Comparing a known-good hash confirms integrity (detects modification)."),
  q(6035, 6, "6", ["Attack", "TLS"], "A device that intercepts TLS by presenting its own certificate to clients (typically in enterprises for inspection) is performing:", ["TLS inspection (SSL intercept)", "ARP caching", "Tokenization", "Channel bonding"], "TLS inspection (SSL intercept)", "TLS inspection re-terminates encryption to inspect traffic, requiring trusted CA installation on clients."),
  q(6036, 6, "5", ["PKI", "Revocation"], "If OCSP is blocked on a network, a client may have difficulty:", ["Resolving DNS names", "Checking certificate revocation status", "Renewing DHCP leases", "Negotiating VLANs"], "Checking certificate revocation status", "OCSP provides near real-time revocation checks for certificates."),
  q(6037, 6, "3", ["Asymmetric", "Signing"], "If Bob signs a message with his private key, what does Alice use to verify the signature?", ["Bob’s public key", "Bob’s private key", "Alice’s public key", "A shared symmetric key"], "Bob’s public key", "Signatures are verified using the signer’s public key."),
  q(6038, 6, "2", ["Wireless", "Security"], "WPA2 with AES uses which encapsulation/encryption suite name?", ["CCMP", "TKIP", "WEP", "PAP"], "CCMP", "WPA2 requires AES with CCMP (TKIP was used with older WPA implementations)."),
  q(6039, 6, "4", ["Key Mgmt", "Hardware"], "Which solution is MOST appropriate to centrally protect and manage high-value private keys used for signing in an enterprise?", ["HSM", "USB hub", "Unmanaged switch", "Patch panel"], "HSM", "Hardware Security Modules protect keys and perform crypto operations in tamper-resistant hardware."),
  q(6040, 6, "1", ["Concept", "Encoding"], "Which statement best describes Base64?", ["It is encryption", "It is encoding, not encryption", "It is hashing", "It is a key exchange protocol"], "It is encoding, not encryption", "Base64 changes representation for transport/storage; it provides no confidentiality."),
  q(6041, 6, "3", ["IPsec", "Protocols"], "Which IPsec protocol provides encryption and integrity for IP packets?", ["ESP", "AH", "GRE", "ARP"], "ESP", "ESP (Encapsulating Security Payload) can encrypt and authenticate traffic; AH provides integrity only."),
  q(6042, 6, "3", ["IPsec", "Use Case"], "Which IPsec mode is most commonly used for site-to-site VPNs between gateways?", ["Tunnel mode", "Transport mode", "Promiscuous mode", "Half-duplex mode"], "Tunnel mode", "Tunnel mode encapsulates the entire original packet and is typical for gateway-to-gateway VPNs."),
  q(6043, 6, "2", ["Integrity", "HMAC"], "Which mechanism combines a hash with a shared secret to provide message integrity and authenticity?", ["HMAC", "Base64", "Diffraction", "NAT"], "HMAC", "HMAC uses a shared key plus hashing to ensure the message wasn’t altered and came from someone with the key."),
  q(6044, 6, "4", ["Certificates", "Formats"], "Which certificate format commonly includes both the certificate AND its private key (often used for importing into servers)?", [".pfx/.p12", ".cer", ".crt", ".txt"], ".pfx/.p12", "PKCS#12 (.pfx/.p12) containers can bundle the cert chain and the private key."),
  q(6045, 6, "2", ["Wi-Fi", "WPA2"], "WPA2-Enterprise most commonly uses which framework for authentication?", ["802.1X/EAP", "WEP", "CSMA/CD", "STP"], "802.1X/EAP", "WPA2-Enterprise relies on 802.1X with EAP methods (often backed by RADIUS)."),
  q(6046, 6, "3", ["TLS", "Versions"], "Which TLS version is widely considered the modern standard with improved security and simpler handshakes?", ["TLS 1.0", "TLS 1.1", "TLS 1.2", "TLS 1.3"], "TLS 1.3", "TLS 1.3 removes legacy/weak features and typically reduces handshake overhead."),
  q(6047, 6, "4", ["SRTP", "VoIP"], "Which protocol is used to encrypt RTP media streams for VoIP?", ["SRTP", "SIP", "SMTP", "SNMP"], "SRTP", "Secure RTP (SRTP) adds confidentiality and integrity for voice/video media."),
  q(6048, 6, "2", ["Password", "Hashing"], "Which approach BEST defends stored passwords against brute force by making each guess computationally expensive?", ["Use bcrypt/Argon2/PBKDF2", "Use MD5 with no salt", "Use Base64", "Use RC4"], "Use bcrypt/Argon2/PBKDF2", "Slow password hashing functions increase attacker cost per guess and should be salted."),
  q(6049, 6, "3", ["Keys", "Rotation"], "Regularly rotating keys and certificates primarily reduces risk from:", ["Long-term key compromise", "ARP cache", "VLAN overlap", "DHCP scope exhaustion"], "Long-term key compromise", "Shorter key lifetimes limit blast radius if a key is stolen or leaked."),
  q(6050, 6, "3", ["Encryption", "At Rest"], "Full-disk encryption primarily protects data:", ["In transit", "At rest", "Only in RAM", "Only in backups"], "At rest", "Disk encryption helps protect stolen/lost devices by keeping stored data unreadable without the key."),

  // --- DOMAIN 7: IAM & ADMIN ---
  q(7001, 7, "1", ["Auth", "Windows"], "Which authentication protocol uses time-stamped 'tickets' to prevent replay attacks and is the default for Active Directory?", ["Kerberos", "RADIUS", "TACACS+", "LDAP"], "Kerberos", "Kerberos relies on a Key Distribution Center (KDC) to issue tickets."),
  q(7002, 7, "2", ["Auth", "Biometric"], "A fingerprint scan falls under which category of authentication factors?", ["Something You Are", "Something You Know", "Something You Have", "Somewhere You Are"], "Something You Are", "Biometrics (fingerprint, retina, face) rely on physical characteristics."),
  q(7003, 7, "1", ["Auth", "Admin"], "Which Cisco-proprietary protocol separates Authentication, Authorization, and Accounting (AAA) and encrypts the entire payload?", ["TACACS+", "RADIUS", "Kerberos", "LDAP"], "TACACS+", "TACACS+ is preferred for device administration because it separates the AAA functions."),
  q(7004, 7, "1", ["Auth", "Protocol"], "RADIUS typically uses which transport protocol and ports?", ["UDP 1812/1813", "TCP 443", "ICMP", "TCP 22"], "UDP 1812/1813", "RADIUS uses UDP ports 1812 for Authentication and 1813 for Accounting."),
  q(7005, 7, "4", ["AD", "Structure"], "In Active Directory, which container is used to organize objects and is the smallest scope to which Group Policy can be applied?", ["Organizational Unit (OU)", "Group", "Folder", "User"], "Organizational Unit (OU)", "OUs allow admins to group users/computers and apply specific policies to them."),
  q(7006, 7, "1", ["Auth", "Concept"], "Which technology allows a user to log in once and access multiple different applications without re-entering credentials?", ["Single Sign-On (SSO)", "Multi-Factor Authentication", "VPN", "Discretionary Access Control"], "Single Sign-On (SSO)", "SSO reduces password fatigue by sharing authentication tokens across applications."),
  q(7007, 7, "2", ["Auth", "Hardware"], "Using a Smart Card or RSA Token is an example of which authentication factor?", ["Something You Have", "Something You Know", "Something You Are", "Somewhere You Are"], "Something You Have", "Physical tokens verify possession."),
  q(7008, 7, "5", ["Linux", "Permissions"], "Which Linux command is used to change the read/write/execute permissions of a file?", ["chmod", "chown", "ls", "pwd"], "chmod", "The 'chmod' (change mode) command modifies file access rights."),
  q(7009, 7, "5", ["Linux", "Permissions"], "What does the permission '777' represent in the Linux file system?", ["Full Read/Write/Execute for Everyone", "Read Only for Everyone", "No Access", "Root Only Access"], "Full Read/Write/Execute for Everyone", "7 (rwx) for User, 7 for Group, and 7 for Others is open access."),
  q(7010, 7, "1", ["Auth", "Federation"], "Which XML-based standard is commonly used to exchange authentication and authorization data in Federated Identity systems?", ["SAML (Security Assertion Markup Language)", "OIDC", "RADIUS", "Kerberos"], "SAML (Security Assertion Markup Language)", "SAML allows Identity Providers to pass credentials to Service Providers over the web."),
  q(7011, 7, "2", ["Policy", "Password"], "Which password policy setting prevents a user from cycling between their last 5 passwords?", ["Password History", "Password Age", "Password Length", "Complexity Requirements"], "Password History", "Enforcing history requires the user to create unique new passwords."),
  q(7012, 7, "3", ["Permissions", "Logic"], "If a user is in the 'Sales' group (Read Access) and the 'Managers' group (Write Access), what is their effective permission?", ["Read and Write", "Read Only", "Write Only", "No Access"], "Read and Write", "Allow permissions are typically cumulative in systems like NTFS."),
  q(7013, 7, "4", ["AD", "Structure"], "What is the top-level container in an Active Directory structure that creates a security boundary?", ["Forest", "Tree", "Domain", "Site"], "Forest", "A Forest is a collection of one or more Domain Trees and represents the ultimate security border."),
  q(7014, 7, "2", ["Biometric", "Error"], "In biometrics, what is a False Rejection Rate (FRR)?", ["The system denies access to an authorized user", "The system grants access to an unauthorized user", "The speed of the scan", "The cost of the scanner"], "The system denies access to an authorized user", "FRR (Type I Error) is when the system fails to recognize a legitimate user."),
  q(7015, 7, "1", ["Protocol", "Directory"], "Which protocol is used to query and modify data in directory services like Active Directory?", ["LDAP", "SNMP", "SMTP", "HTTP"], "LDAP", "Lightweight Directory Access Protocol (LDAP) is the standard for directory interaction."),
  q(7016, 7, "2", ["Policy", "Defense"], "Which policy setting defends against online brute force attacks by disabling an account after too many failed attempts?", ["Account Lockout", "Complexity", "Password History", "Expiration"], "Account Lockout", "Locking the account stops the attacker from continuing to guess passwords."),
  q(7017, 7, "5", ["Linux", "Security"], "In a Linux system, which file securely stores the encrypted password hashes?", ["/etc/shadow", "/etc/passwd", "/etc/group", "/root"], "/etc/shadow", "While /etc/passwd lists users, /etc/shadow holds the actual hashes and is readable only by root."),
  q(7018, 7, "1", ["Auth", "Time"], "Why is accurate time synchronization (NTP) critical for Kerberos authentication?", ["To prevent Replay Attacks", "To encrypt the password", "To compress the ticket", "To log the login time"], "To prevent Replay Attacks", "Kerberos tickets have a short lifespan. If clocks are skewed, valid tickets may be rejected or replayed."),
  q(7019, 7, "4", ["AD", "Admin"], "What tool allows administrators to deploy configuration settings (like wallpaper or password policies) to thousands of computers at once?", ["Group Policy Object (GPO)", "Registry Editor", "Script", "Manual Config"], "Group Policy Object (GPO)", "GPOs allow for centralized management of user and computer settings across a domain."),
  q(7020, 7, "3", ["Permissions", "Files"], "When you move a file from one NTFS volume to a different volume, what happens to its permissions?", ["It inherits the permissions of the new parent folder", "It keeps its original permissions", "It becomes public", "It becomes encrypted"], "It inherits the permissions of the new parent folder", "Moving across volumes is technically a 'Copy then Delete' operation, so the file takes on the new folder's rules."),
  q(7021, 7, "2", ["Auth", "Context"], "Allowing login only when the user is physically located in the office building is an example of:", ["Context-aware Authentication", "Multi-Factor Authentication", "Single Sign-On", "Federation"], "Context-aware Authentication", "This uses environmental context (location, time, device health) to make auth decisions."),
  q(7022, 7, "1", ["Auth", "Federation"], "Which protocol is commonly used for 'Social Logins' (e.g., Log in with Google)?", ["OAuth / OIDC", "SAML", "LDAP", "RADIUS"], "OAuth / OIDC", "OAuth and OpenID Connect are the standards for consumer-facing identity federation."),
  q(7023, 7, "5", ["Linux", "Permissions"], "In Linux octal permissions, what is the numeric value for 'Read'?", ["4", "2", "1", "7"], "4", "Read = 4, Write = 2, Execute = 1."),
  q(7024, 7, "2", ["Biometric", "Accuracy"], "Which biometric factor is considered the most accurate and unique, but is often viewed as intrusive?", ["Retina / Iris Scan", "Fingerprint", "Voice Recognition", "Facial Recognition"], "Retina / Iris Scan", "Eye scans are highly unique and stable over time but require close proximity to the scanner."),
  q(7025, 7, "1", ["Auth", "Network"], "IEEE 802.1X is a standard used for what purpose?", ["Port-based Network Access Control", "Wireless Speed", "Encryption", "Routing"], "Port-based Network Access Control", "802.1X forces devices to authenticate (usually vs RADIUS) before the switch port passes traffic."),
  q(7026, 7, "2", ["Biometric", "Error"], "What is a Type II Biometric Error (False Acceptance)?", ["The system grants access to an unauthorized user", "The system denies an authorized user", "The crossover rate", "A system crash"], "The system grants access to an unauthorized user", "False Acceptance is the worst-case scenario where an impostor is let in."),
  q(7027, 7, "1", ["Auth", "Kerberos"], "In Kerberos, what is the TGT?", ["Ticket Granting Ticket", "Time Granting Token", "Total Group Trust", "Token Generated Time"], "Ticket Granting Ticket", "The TGT is the initial ticket issued by the KDC that allows the user to request service tickets."),
  q(7028, 7, "5", ["Linux", "Admin"], "Which command changes the owner of a file in Linux?", ["chown", "chmod", "useradd", "sudo"], "chown", "The 'chown' command stands for Change Owner."),
  q(7029, 7, "3", ["Permissions", "Logic"], "In a permission conflict between an 'Allow' rule and a 'Deny' rule, which one typically takes precedence?", ["The Deny rule", "The Allow rule", "The last rule written", "The first rule written"], "The Deny rule", "In most systems (like Windows NTFS), an explicit Deny overrides any Allow permissions."),
  q(7030, 7, "2", ["Policy", "Password"], "To ensure high entropy, what is the modern recommendation for minimum password length?", ["12+ characters", "8 characters", "4 characters", "6 characters"], "12+ characters", "Length is the most important factor in password strength. 12 or more characters makes brute forcing exponentially harder."),
  q(7031, 7, "1", ["AAA", "Concept"], "In AAA, which component is responsible for recording user actions for auditing?", ["Accounting", "Authentication", "Authorization", "Aggregation"], "Accounting", "Accounting tracks what users did (logs), supporting auditing and forensics."),
  q(7032, 7, "2", ["MFA", "Factors"], "Which option is an example of 'something you have'?", ["PIN", "Password", "Hardware token", "Mother’s maiden name"], "Hardware token", "A token/smart card is a possession factor."),
  q(7033, 7, "1", ["RADIUS", "Use Case"], "RADIUS is MOST commonly used for:", ["Email retrieval", "Network access control for VPN/Wi-Fi (802.1X)", "File transfer", "Time synchronization"], "Network access control for VPN/Wi-Fi (802.1X)", "RADIUS commonly backs 802.1X for Wi-Fi and VPN authentication."),
  q(7034, 7, "1", ["TACACS+", "Admin"], "Compared to RADIUS, TACACS+ is often preferred for network device administration because it:", ["Uses UDP only", "Separates AAA functions and encrypts the payload", "Requires no shared secret", "Runs on port 53"], "Separates AAA functions and encrypts the payload", "TACACS+ is designed for device administration workflows and granular control."),
  q(7035, 7, "4", ["AD", "DNS"], "A domain-joined Windows client cannot locate a domain controller. Which dependency is MOST likely failing?", ["DNS", "NTP", "FTP", "SNMP"], "DNS", "Active Directory relies heavily on DNS (SRV records) to locate domain controllers."),
  q(7036, 7, "2", ["Policy", "MFA"], "Which control is MOST effective at reducing risk from stolen passwords?", ["Disabling account lockout", "Multi-factor authentication", "Shorter passwords", "Shared accounts"], "Multi-factor authentication", "MFA mitigates password theft by requiring an additional independent factor."),
  q(7037, 7, "1", ["SSO", "Tokens"], "A user logs into an identity provider and then accesses multiple SaaS apps without re-entering credentials. This describes:", ["SSO", "NAT", "DHCP", "Spanning tree"], "SSO", "Single sign-on uses shared authentication tokens/assertions to access multiple services."),
  q(7038, 7, "1", ["Federation", "OIDC"], "OpenID Connect (OIDC) is built on top of which framework?", ["OAuth 2.0", "Kerberos", "RIP", "SNMP"], "OAuth 2.0", "OIDC extends OAuth 2.0 to provide authentication/identity assertions."),
  q(7039, 7, "3", ["Permissions", "Windows"], "On NTFS, which permission type is MOST important to control data exposure when users change teams?", ["Explicit Deny everywhere", "Group-based permissions via roles", "Everyone:Full Control", "No auditing"], "Group-based permissions via roles", "Role/group-based access simplifies administration and supports least privilege."),
  q(7040, 7, "5", ["Linux", "Admin"], "Which Linux command shows current user and group IDs (useful for troubleshooting permission issues)?", ["id", "ps", "grep", "top"], "id", "The `id` command displays UID, GIDs, and group memberships for the current (or specified) user."),
  q(7041, 7, "2", ["Access", "PAM"], "A system that provides time-limited admin access with approvals and session recording is best described as:", ["Privileged Access Management (PAM)", "DNS caching", "VLAN hopping", "Packet shaping"], "Privileged Access Management (PAM)", "PAM reduces standing privileges and increases accountability for privileged actions."),
  q(7042, 7, "3", ["Policy", "Accounts"], "Which practice BEST improves accountability for administrative actions on network devices?", ["Shared admin accounts", "Named accounts + logging", "Disable syslog", "Use Telnet"], "Named accounts + logging", "Individual accounts and logging tie actions to people for auditing and incident response."),
  q(7043, 7, "2", ["RADIUS", "Security"], "RADIUS uses a shared secret primarily to:", ["Encrypt the entire payload", "Protect certain fields and authenticate exchanges", "Replace certificates", "Provide DHCP leases"], "Protect certain fields and authenticate exchanges", "RADIUS uses the shared secret to protect parts of the exchange and validate communication with the server."),
  q(7044, 7, "3", ["LDAP", "Security"], "Which is the BEST option to protect LDAP directory queries in transit?", ["LDAP over TLS (LDAPS/StartTLS)", "HTTP", "Telnet", "FTP"], "LDAP over TLS (LDAPS/StartTLS)", "TLS protects credentials and directory data from interception or tampering."),
  q(7045, 7, "2", ["Auth", "MFA"], "A push notification that the user approves on their phone is MOST commonly considered:", ["Something you know", "Something you have", "Something you are", "Somewhere you are"], "Something you have", "The phone/app is a possession factor (often combined with a biometric/PIN on the device)."),
  q(7046, 7, "3", ["Windows", "GPO"], "If a user’s security settings are controlled by a domain policy and keep reverting, the MOST likely cause is:", ["Local admin rights", "A Group Policy Object (GPO) is enforcing them", "DNS recursion", "VLAN mismatch"], "A Group Policy Object (GPO) is enforcing them", "GPOs re-apply desired settings on a schedule and at login/startup."),
  q(7047, 7, "3", ["Access Control", "Models"], "Granting permissions based on job role (e.g., Help Desk, Network Admin) is:", ["RBAC", "DAC", "MAC", "NAT"], "RBAC", "Role-Based Access Control assigns access based on role membership."),
  q(7048, 7, "4", ["Access Control", "Models"], "Allowing access only if device is compliant AND user is in Finance AND request occurs during business hours is:", ["ABAC", "RBAC", "MAC", "PAP"], "ABAC", "Attribute-Based Access Control uses multiple attributes (user, device, time, location) to decide."),
  q(7049, 7, "2", ["Passwords", "Policy"], "Which policy MOST effectively reduces risk from password reuse across many sites?", ["Shorter expiration cycles", "Use a password manager + unique passwords", "Lower complexity requirements", "Disable MFA"], "Use a password manager + unique passwords", "Unique passwords limit the impact of credential reuse/credential stuffing."),
  q(7050, 7, "3", ["Access", "Just-In-Time"], "Granting admin rights only when needed and automatically removing them afterward is called:", ["Just-in-time (JIT) access", "Static access", "Shared access", "Open access"], "Just-in-time (JIT) access", "JIT access reduces standing privileges and shrinks the window of opportunity for attackers."),
];

// ==========================================
// SECTION 3: STUDY CONTENT DEFINITIONS
// ==========================================

const DOMAINS = [
  {
    id: 1,
    title: "Networking Fundamentals",
    sections: [
      {
        id: "1.1",
        title: "1.1 Network Concepts & Topologies",
        page: 15,
        tags: ["Topology", "Star", "Mesh", "Bus", "Ring", "Router", "Switch", "Hub", "MAC", "IP", "Duplex"],
        summary: "The maps (Topologies) and roles (Devices) that make up a network.",
        content: `NETWORK DEFINITION
A network is any group of connected devices that share resources (like printers or files) and data. These devices communicate using a set of rules called Protocols.

NETWORK TOPOLOGIES (THE MAP)
The topology is the physical or logical layout of the network.

Star Topology
All devices connect to a central point, usually a Switch or a Hub.
[+] Pros: Easy to install and manage. If one cable breaks, only that device goes down.
[-] Cons: Single point of failure. If the central switch dies, the entire network goes down.

Mesh Topology (Full vs Partial)
Full Mesh: Every device connects to every other device.
Partial Mesh: Some devices connect to all others, but some only connect to a few.
[+] Pros: Extremely high redundancy and fault tolerance.
[-] Cons: Very expensive due to cabling costs and complex configuration.

Bus Topology
All devices connect to a single central cable (the backbone) with terminators at each end.
[+] Pros: Cheap and uses less cable.
[-] Cons: If the main cable breaks, the whole network goes down. Prone to data collisions.

Ring Topology
Devices are connected in a closed loop. Data travels in one direction.
[+] Pros: No collisions (uses token passing).
[-] Cons: If one device fails, the ring is broken (unless dual-ring).

Point-to-Point
A dedicated link between two specific devices (e.g., two routers connecting two buildings).

DEVICE ROLES AND LAYERS
Router (Layer 3 - Network)
Connects different networks together (e.g., your LAN to the WAN/Internet). Uses IP Addresses to make routing decisions.
[!] Critical: Routers stop broadcasts, creating separate collision domains.

Switch (Layer 2 - Data Link)
Connects devices on the same network. Uses MAC Addresses to switch frames to the correct port. Switches provide dedicated bandwidth to each port.

Hub (Layer 1 - Physical)
A legacy "dumb" device. It takes data in one port and broadcasts it out every other port.
[-] Cons: It is inefficient and creates high collision domains.

KEY CONCEPTS
MAC Address: A physical, hardware address burned into the network card. It is 48-bits long (Hexadecimal). Used for local delivery.
IP Address: A logical address assigned by software. Used for end-to-end delivery across the internet.
Duplex Modes:
- Half-Duplex: Only one party can talk at a time (Walkie-Talkie). Hubs use this.
- Full-Duplex: Both parties can talk and listen at the same time (Phone call). Switches use this.`
      },
      {
        id: "1.2",
        title: "1.2 The OSI Model",
        page: 18,
        tags: ["OSI", "Layers", "TCP", "UDP", "Encapsulation", "Ports", "Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"],
        summary: "The 7-layer framework describing how data moves from apps to cables.",
        content: `THE SEVEN LAYERS
The OSI model is a conceptual framework describing how data moves from an application on one computer to an application on another.

7. Application Layer (Data)
The interface the user interacts with. This is where network-aware applications live.
[i] Protocols: HTTP, FTP, SMTP, DNS.

6. Presentation Layer (Data)
The "Translator". It formats data so the application can understand it.
Functions:
- Encryption and Decryption (TLS/SSL).
- Compression (ZIP).
- Character encoding (ASCII, JPEG, MP3).

5. Session Layer (Data)
The "Manager". It establishes, manages, and terminates connections (sessions) between local and remote applications.
Functions: Authentication and Reconnection.

4. Transport Layer (Segments)
The "Shipping Department". Responsible for end-to-end transport of data.
Protocols:
[+] TCP: Reliable, Connection-Oriented. Checks for errors and resends missing packets. (Email, Web).
[-] UDP: Unreliable, Connectionless. "Fire and forget". Fast but no guarantees. (Streaming, VOIP).
[!] Key Concept: Port Numbers are used here to direct data to specific applications.

3. Network Layer (Packets)
The "Postal Service". Responsible for Logical Addressing and Routing.
Functions:
- IP Addressing (IPv4/IPv6).
- Path Selection (Routing).
Devices: Routers, Layer 3 Switches.

2. Data Link Layer (Frames)
Responsible for physical addressing and switching frames on the local network.
Sub-layers:
- LLC (Logical Link Control): Error control and flow control.
- MAC (Media Access Control): Physical addressing.
Devices: Switches, Bridges, NICs.

1. Physical Layer (Bits)
The actual hardware and transmission medium.
Functions: Transmitting raw bits (1s and 0s) as electrical, light, or radio signals.
Components: Cables, Fiber, Hubs, Repeaters.`
      },
      {
        id: "1.3",
        title: "1.3 Internet & Cabling",
        page: 23,
        tags: ["Cabling", "Fiber", "UTP", "STP", "Cat5", "Cat6", "Plenum", "Satellite", "Cellular", "5G", "Wiring"],
        summary: "Physical connections (Fiber, Copper) and Internet types (Satellite, Cellular).",
        content: `CABLING STANDARDS (TIA/EIA 568B)
The most common wiring standard for terminating RJ-45 Ethernet cables. You must know the color order.
[!] Pinout Order:
1. White-Orange
2. Orange
3. White-Green
4. Blue
5. White-Blue
6. Green
7. White-Brown
8. Brown

CONNECTION TYPES
Fiber Optic
Uses pulses of light to transmit data through glass strands.
- Single-Mode: Laser-based. Extreme distance. Small core. Used for ISP backbones.
- Multi-Mode: LED-based. Shorter distance (within buildings). Larger core.
[+] Pros: Immune to Electromagnetic Interference (EMI), harder to tap, extremely fast.

Twisted Pair (Copper)
Uses electrical signals over copper wires twisted to cancel interference.
- UTP: Unshielded Twisted Pair (Most common).
- STP: Shielded Twisted Pair (Used in factories/high interference areas).
Categories:
- Cat5e: 1 Gbps.
- Cat6: 10 Gbps (short distance).
- Plenum: Fire-resistant jacket used in drop ceilings (HVAC spaces).

Coaxial Cable
Uses a central copper core. Common for Cable Internet (DOCSIS).

INTERNET SERVICE TYPES
Satellite (GEO vs LEO)
GEO (Geostationary): Satellites sit 22,000 miles up.
[-] Cons: High latency (~600ms). Good for rural static locations.
LEO (Low Earth Orbit): Starlink. Satellites orbit 300-1200 miles up.
[+] Pros: Low latency (~40ms), high speed.

Cellular (4G vs 5G)
4G LTE: IP-based network. Good speeds.
5G: Massive device density, ultra-low latency, high throughput. Uses millimeter waves for high speed in cities.`
      },
      {
        id: "1.4",
        title: "1.4 Storage & Databases",
        page: 25,
        tags: ["NAS", "SAN", "SQL", "NoSQL", "Database", "Storage", "RDBMS"],
        summary: "NAS, SAN, and the difference between SQL and NoSQL.",
        content: `NETWORKED STORAGE
NAS (Network Attached Storage)
A specialized appliance dedicated to serving files.
Connects via Ethernet.
[i] Protocols: SMB (Windows), NFS (Linux).
Usage: File sharing for SOHO or small business.

SAN (Storage Area Network)
A dedicated high-speed network that connects servers to storage devices.
Connects via Fiber Channel or iSCSI.
Usage: Enterprise data centers requiring block-level storage.

DATABASE TYPES
RDBMS (Relational Database)
The traditional "Spreadsheet" style. Data is stored in Tables with Rows and Columns.
Structure: Rigid and Schema-based.
[!] Key Tech: SQL (Structured Query Language).
[+] Pros: Accurate and consistent (ACID).
Use Case: Financial systems, Inventory (where accuracy is paramount).

NoSQL (Non-Relational)
Modern, flexible databases.
Structure: Documents (JSON), Key-Value pairs, or Graphs.
[!] Key Tech: MongoDB, DynamoDB.
[+] Pros: Flexible and scalable.
Use Case: Big Data, Real-time web apps, Social Media feeds.`
      },
    ]
  },
  {
    id: 2,
    title: "Wireless Networking",
    sections: [
      {
        id: "2.1",
        title: "2.1 Wireless Standards & Frequencies",
        page: 29,
        tags: ["802.11", "Wi-Fi", "Frequency", "2.4GHz", "5GHz", "CSMA/CA", "RTS/CTS", "Collision Avoidance"],
        summary: "802.11 standards, 2.4 vs 5GHz, and CSMA/CA.",
        content: `THE 802.11 STANDARDS (WI-FI)
802.11a: 54 Mbps - 5 GHz
802.11b: 11 Mbps - 2.4 GHz
802.11g: 54 Mbps - 2.4 GHz
802.11n (Wi-Fi 4): 600 Mbps - 2.4/5 GHz (Introduced MIMO)
802.11ac (Wi-Fi 5): 1 Gbps+ - 5 GHz Only (Introduced MU-MIMO)
802.11ax (Wi-Fi 6): 10 Gbps - 2.4/5/6 GHz (High efficiency for dense areas, uses OFDMA)

FREQUENCY BANDS
2.4 GHz Band
[+] Pros: Better range, penetrates solid walls better.
[-] Cons: Slower speeds, highly congested by microwaves, Bluetooth, baby monitors.
[!] Critical: Only 3 non-overlapping channels exist: 1, 6, and 11.

5 GHz Band
[+] Pros: Much faster speeds, many non-overlapping channels (less interference).
[-] Cons: Shorter range, struggles to pass through concrete/brick.

CSMA/CA (COLLISION AVOIDANCE)
Wireless is Half-Duplex (like a walkie-talkie). Devices cannot "hear" a collision while they are talking.
Protocol: Carrier Sense Multiple Access / Collision Avoidance.
Logic: Listen to the air. If silent, send data. If busy, wait a random amount of time.
[i] RTS/CTS: Request to Send / Clear to Send. A method to reserve airtime and avoid "Hidden Node" problems.`
      },
      {
        id: "2.2",
        title: "2.2 Other Wireless Technologies",
        page: 31,
        tags: ["Cellular", "LTE", "5G", "Satellite", "GEO", "LEO", "Microwave"],
        summary: "Cellular, Satellite, and Microwave links.",
        content: `CELLULAR NETWORKS
Generations:
- 2G: Digital Voice, SMS.
- 3G: First Mobile Internet (Slow).
- 4G LTE: Fully IP-based. High Speed.
- 5G: Ultra-Low Latency, Massive IoT density, Millimeter Waves (High speed/Short range).

SATELLITE
GEO (Geostationary): High orbit (22,000 miles).
[-] Cons: High Latency (600ms). Good for TV/Broadcast.
LEO (Low Earth Orbit): Low orbit (300-1200 miles).
[+] Pros: Low Latency (40ms). Requires tracking antennas (Starlink).

MICROWAVE (TERRESTRIAL)
Point-to-Point links using dishes.
[!] Requirement: Strict Line-of-Sight.
Use Case: Connecting two buildings without digging fiber.`
      },
      {
        id: "2.3",
        title: "2.3 WLAN Topologies",
        page: 34,
        tags: ["Infrastructure", "Ad Hoc", "Mesh", "WLAN", "Access Point", "Controller", "IBSS", "WMN"],
        summary: "Infrastructure, Ad Hoc, and Mesh modes.",
        content: `WIRELESS MODES
Infrastructure Mode
The most common setup.
Clients (Laptops/Phones) connect to a central Access Point (AP).
The AP connects to the wired network (Distribution System).
Topology: Logical Star.

Ad Hoc Mode (IBSS)
Devices connect directly to each other without an Access Point.
Topology: Peer-to-Peer / Mesh.
[i] Use Case: AirDrop, temporary file transfers, disaster recovery.

Mesh Network (WMN)
Nodes (APs) connect to other nodes wirelessly to form a web of coverage.
Only one node needs a physical wire to the modem/internet.
[+] Pros: Self-healing. If one node dies, traffic re-routes. Easy to expand coverage.
[-] Cons: Latency increases with every "hop" the data makes.

WIRELESS COMPONENTS
Access Point (AP): Bridges wireless clients to the wired LAN.
Wireless Controller: Centralized management appliance for large deployments. Pushes configs/updates to all APs at once.
Antennas:
- Omnidirectional: Radiates signal 360 degrees (Donut shape). Good for central placement.
- Directional (Yagi/Dish): Focuses signal in a beam. Good for long-distance Point-to-Point links.`
      },
      {
        id: "2.4",
        title: "2.4 WLAN Security",
        page: 37,
        tags: ["WPA", "WPA2", "WPA3", "WEP", "SAE", "Enterprise", "Personal", "RADIUS", "Encryption"],
        summary: "WPA2, WPA3, and Enterprise Authentication.",
        content: `SECURITY PROTOCOLS
WEP (Wired Equivalent Privacy)
The original standard. Uses RC4 encryption.
[-] Status: BROKEN. Can be cracked in minutes. Never use.

WPA (Wi-Fi Protected Access)
Intermediate replacement for WEP. Uses TKIP.
[-] Status: Deprecated.

WPA2 (Wi-Fi Protected Access 2)
The industry standard for over a decade.
Encryption: AES (Advanced Encryption Standard) with CCMP.
[-] Vulnerability: Susceptible to KRACK attacks (Key Reinstallation) and Offline Dictionary Attacks on the 4-way handshake.

WPA3 (Wi-Fi Protected Access 3)
The modern standard.
Encryption: AES-GCMP (256-bit in Enterprise).
[+] Key Feature: SAE (Simultaneous Authentication of Equals). This replaces the handshake and makes offline dictionary attacks impossible.
[+] Forward Secrecy: If a session key is stolen, it cannot be used to decrypt past traffic.

AUTHENTICATION MODES
Personal (PSK): Uses a Pre-Shared Key (password) that everyone knows. Simple but creates management issues.
Enterprise (802.1X): Each user has their own username/password. Authenticates against a RADIUS server. Much more secure.`
      },
      {
        id: "2.5",
        title: "2.5 Troubleshooting Wireless",
        page: 42,
        tags: ["Attenuation", "Interference", "SNR", "RSSI", "Refraction", "Overlap", "Capacity"],
        summary: "Signal loss, Interference, and Metrics (RSSI/SNR).",
        content: `COMMON ISSUES
Attenuation
The weakening of the signal as it travels.
Causes: Distance, Absorption (Walls).
[-] Worst Materials: Metal, Concrete, Water.
[+] Best Materials: Drywall, Wood, Air.

Interference (EMI)
Signal corruption caused by other devices.
2.4 GHz Sources: Microwave ovens, Cordless phones, Bluetooth.
Solution: Switch to 5 GHz or change channels (1, 6, 11).

Refraction
The bending of a radio wave as it passes through a medium of different density (like glass or water). Can cause signal distortion.

Capacity Overload
Too many devices on one AP.
Symptoms: Slow speeds, high latency, dropped connections.
Solution: Add more APs, enable Load Balancing, upgrade to Wi-Fi 6.

METRICS
RSSI (Received Signal Strength Indicator): Measured in dBm (negative number).
[+] -30 dBm: Amazing.
[i] -67 dBm: Minimum for VoIP.
[-] -80 dBm: Unusable/Dead Zone.

SNR (Signal-to-Noise Ratio):
[!] Goal: You want a High SNR.
High Signal (User) + Low Noise (Interference) = Good Connection.`
      }
    ]
  },
  {
    id: 3,
    title: "Network Management",
    sections: [
      {
        id: "3.1",
        title: "3.1 Documentation & Policies",
        page: 46,
        tags: ["Configuration", "Baseline", "SLA", "MOU", "MSA", "SOW", "Diagrams", "SOP"],
        summary: "Configuration management and legal agreements (SLA, MOU).",
        content: `CONFIGURATION MANAGEMENT
The process of tracking changes to the network.
[!] Baseline: A report of network performance/config when everything is working perfectly. Used for comparison later.
[-] Configuration Drift: The slow deviation from the baseline caused by undocumented changes/patches.

ADMINISTRATIVE AGREEMENTS
SLA (Service Level Agreement):
A binding contract between a provider (ISP) and a customer.
Defines metrics: "99.99% Uptime", "4 Hour Hardware Replacement".
[!] Important: Includes penalties (refunds) if metrics aren't met.

MOU (Memorandum of Understanding):
A "Gentleman's Agreement".
Usually between two departments or agencies.
Outlines intent to work together but is rarely legally binding.

MSA (Master Service Agreement):
The "Umbrella Contract". Sets the legal terms for a long-term relationship so you don't have to re-negotiate for every small project.

SOW (Statement of Work):
A document for a specific project.
Details specific deliverables, timelines, and costs. (e.g., "Install 50 APs by Friday").

DOCUMENTATION TYPES
Physical Network Diagram: Shows the real-world layout. Rack diagrams, cable runs, physical location of servers.
Logical Network Diagram: Shows the flow of data. VLANs, IP subnets, Routing protocols.
Standard Operating Procedure (SOP): Step-by-step instructions for routine tasks (e.g., "How to onboard a new user").`
      },
      {
        id: "3.2",
        title: "3.2 Host Discovery & Monitoring",
        page: 50,
        tags: ["Discovery", "CDP", "LLDP", "Nmap", "Ping", "Port Scan", "Fingerprinting", "Monitoring"],
        summary: "Finding devices (Nmap) and checking availability.",
        content: `DISCOVERY PROTOCOLS
CDP (Cisco Discovery Protocol)
Proprietary. Cisco devices can see neighbors (IP, OS version).
[-] Security Risk: Sends data in cleartext. Disable on external ports.

LLDP (Link Layer Discovery Protocol)
Vendor-Neutral (IEEE 802.1AB). Works on Juniper, HP, Dell, etc.
Same function as CDP.

DISCOVERY TOOLS (NMAP)
Ping Sweep: Pinging a range of IPs to see who is alive.
Port Scan: Knocking on ports to see what services are running.
OS Fingerprinting: Guessing the OS based on response behavior.

MONITORING TYPES
Availability: Is it alive? (Ping).
Performance: CPU, RAM, Bandwidth usage.
[!] Baseline: Comparing current stats to the "Golden Standard".`
      },
      {
        id: "3.3",
        title: "3.3 Management Protocols",
        page: 52,
        tags: ["SNMP", "Syslog", "NTP", "Logs", "Monitoring"],
        summary: "SNMP, Syslog, and NTP.",
        content: `MONITORING PROTOCOLS
SNMP (Simple Network Management Protocol)
Used to monitor and configure network devices.
- Manager: The server collecting data.
- Agent: The router/switch sending data.
- MIB: The database of variables on the device.
- Trap: An alert sent by the device to the manager (e.g., "Interface Down").
Versions:
[-] v1/v2c: Insecure. Community strings sent in Cleartext.
[+] v3: Secure. Supports Authentication (User) and Encryption.

Syslog (UDP 514)
Standard protocol for forwarding log messages to a central server.
Severity Levels (0-7):
0 - Emergency (System is unusable)
1 - Alert (Action must be taken immediately)
2 - Critical
3 - Error
4 - Warning
5 - Notice
6 - Informational
7 - Debug

NTP (Network Time Protocol)
UDP Port 123.
Synchronizes clocks on all network devices.
[!] Critical: Essential for Log Correlation. If devices have different times, you cannot trace an attack across the network.`
      },
      {
        id: "3.4",
        title: "3.4 Traffic Analysis",
        page: 55,
        tags: ["Packet Capture", "Wireshark", "NetFlow", "Traffic", "Mirroring", "TAP", "SPAN", "Sniffing"],
        summary: "Packet Capture (Wireshark) vs Flow Analysis (NetFlow).",
        content: `PACKET CAPTURE (WIRESHARK)
Also known as "Sniffing" or "Deep Packet Inspection".
Captures the actual data payload.
Can reconstruct emails, web pages, and files if unencrypted.
Requires the NIC to be in Promiscuous Mode.
[i] Use Case: Troubleshooting specific application errors, finding cleartext passwords.

FLOW ANALYSIS (NETFLOW / IPFIX)
Captures Metadata only.
Records: Source IP, Dest IP, Port, Protocol, Volume.
Does NOT record the content of the communication.
Analogy: A phone bill shows who you called and for how long, but not what you said.
[i] Use Case: Spotting bandwidth hogs, DDoS detection, identifying top talkers.

TRAFFIC MIRRORING
How do you capture traffic on a switch?
Port Mirroring (SPAN): A switch config that copies traffic from one port to another port where the sniffer is plugged in.
Network TAP: A physical hardware device inserted into the cable.
[+] Pros: Provides 100% packet capture (no drops).
[-] Cons: Requires downtime to install.`
      },
    ]
  },
  {
    id: 4,
    title: "Security Principles",
    sections: [
      {
        id: "4.1",
        title: "4.1 The CIA Triad",
        page: 59,
        tags: ["CIA", "Confidentiality", "Integrity", "Availability", "Non-Repudiation"],
        summary: "Confidentiality, Integrity, and Availability.",
        content: `THE CORE GOALS OF SECURITY
Confidentiality
Ensuring data is not accessed by unauthorized people.
[-] Attacks: Snooping, Dumpster Diving, Wiretapping.
[+] Controls: Encryption (AES), Access Lists (ACLs), Steganography.

Integrity
Ensuring data has not been modified or tampered with.
[-] Attacks: Man-in-the-Middle, Replay Attacks.
[+] Controls: Hashing (SHA-256), Digital Signatures, Checksums.

Availability
Ensuring data and systems are up and accessible when needed.
[-] Attacks: DoS (Denial of Service), Ransomware, Power Outage.
[+] Controls: RAID, Backups, Redundancy, Load Balancing.

NON-REPUDIATION
The assurance that someone cannot deny the validity of something.
[i] Example: If you sign a contract with your Private Key, you cannot claim "I didn't sign that", because only you have the key.`
      },
      {
        id: "4.2",
        title: "4.2 Security Controls",
        page: 60,
        tags: ["Controls", "Preventive", "Detective", "Corrective", "Deterrent", "Physical", "Managerial", "Technical"],
        summary: "Categories (Preventive, Detective) and Types (Technical, Physical).",
        content: `CONTROLS BY FUNCTION
Preventive
Stops the attack before it happens.
[i] Examples: Firewalls, IPS, Locks, Biometrics, Separation of Duties.

Detective
Identifies and records an attack while or after it happens.
[i] Examples: IDS (Intrusion Detection), CCTV Cameras, Log Review, Motion Sensors.

Corrective
Fixes the damage or restores the system after an attack.
[i] Examples: Restoring from Backups, Patching a vulnerability.

Deterrent
Discourages the attacker from trying.
[i] Examples: "Warning" signs, Bright lighting, Login banners.

CONTROLS BY TYPE
Technical (Logical)
Implemented via hardware or software.
[i] Examples: Firewall rules, ACLs, Encryption, Antivirus.

Managerial (Administrative)
Implemented via policy, paper, and people management.
[i] Examples: Hiring procedures, Security Awareness Training, SOPs.

Physical
Implemented via tangible barriers.
[i] Examples: Fences, Guards, Dogs, Bollards, Faraday Cages.`
      },
      {
        id: "4.3",
        title: "4.3 Cybersecurity Frameworks",
        page: 61,
        tags: ["NIST", "CSF", "Framework", "Gap Analysis"],
        summary: "NIST CSF and Gap Analysis.",
        content: `NIST CSF (CYBERSECURITY FRAMEWORK)
The US standard for managing cyber risk.
5 Functions:
1. Identify: Know what assets you have.
2. Protect: Implement controls (Training, Encryption).
3. Detect: Monitoring (IDS/SIEM).
4. Respond: Action taken during an incident.
5. Recover: Restoring services after the incident.

GAP ANALYSIS
The process of comparing your "Current State" (Where we are) to your "Desired State" (Where the framework says we should be). The difference is the Gap.`
      },
      {
        id: "4.4",
        title: "4.4 Access Control Models",
        page: 62,
        tags: ["DAC", "MAC", "RBAC", "ABAC", "Access Control"],
        summary: "DAC, MAC, RBAC, and ABAC.",
        content: `DAC (Discretionary Access Control)
The Owner of the object decides who has access.
Common in OSs (Windows/Linux file permissions).
[+] Pros: Flexible.
[-] Cons: Weak security (users make mistakes).

MAC (Mandatory Access Control)
The System decides access based on Labels.
Users have "Clearance" (Top Secret). Objects have "Labels" (Top Secret).
Common in Military/Government (SELinux).
[+] Pros: Extremely secure.
[-] Cons: Rigid and hard to manage.

RBAC (Role-Based Access Control)
Access is granted based on your Job Title or Group.
[i] Example: "Nurses" group can see records. "Billing" group can see invoices.
[+] Pros: Best for high-turnover environments (Corps).

ABAC (Attribute-Based Access Control)
The most flexible model. Access is based on "If/Then" logic using attributes.
[i] Example: "Allow access IF User=Manager AND Location=Office AND Time=9am-5pm".
[+] Pros: Context-aware security.`
      },
      {
        id: "4.5",
        title: "4.5 Enterprise Architecture",
        page: 65,
        tags: ["Architecture", "Border", "Perimeter", "DMZ", "Endpoints"],
        summary: "Node types and Security placement.",
        content: `NODE TYPES
Host Nodes (Endpoints): Devices that initiate data (Laptops, Servers).
Intermediary Nodes: Devices that forward data (Routers, Switches).

SECURITY PLACEMENT
Network Border: The "Front Door". Place Firewalls here to block entry.
Endpoints: The "Last Line of Defense". Place Antivirus and Host Firewalls here.
Internal Perimeter: Use IDS/IPS to detect lateral movement (hackers moving from one server to another).`
      },
      {
        id: "4.6",
        title: "4.6 Security Appliances",
        page: 66,
        tags: ["Firewall", "Proxy", "Load Balancer", "Jump Server", "UTM", "WAF"],
        summary: "Firewalls, Proxies, and Load Balancers.",
        content: `FIREWALL / UTM
Unified Threat Management. An all-in-one box.
Functions: Firewall, IDS/IPS, Spam Filter, Content Filter, VPN Gateway.

PROXY SERVER
An intermediary. You talk to the Proxy; the Proxy talks to the Internet.
Functions: Caching (speed), Content Filtering (blocking bad sites), Anonymity.

LOAD BALANCER
Distributes traffic across a "farm" of servers.
[+] Goal: Availability. If Server A fails, traffic goes to Server B.
WAF (Web Application Firewall): Often built into Load Balancers to stop SQL Injection.

JUMP SERVER
A hardened server used as the only entry point for Admins.
Process: Admin VPNs in -> RDPs to Jump Server -> Manages Internal Servers.`
      },
      {
        id: "4.7",
        title: "4.7 Access Control Lists (ACLs)",
        page: 67,
        tags: ["ACL", "Wildcard", "Filtering", "Rules"],
        summary: "Packet filtering rules.",
        content: `ACL BASICS
A list of rules (Allow/Deny) attached to a router interface.
Read Top-to-Bottom. The first match wins.
[!] Implicit Deny: If traffic isn't explicitly allowed, it is denied by default at the end of the list.

TYPES
Standard ACL: Filters by Source IP only. (Layer 3).
Extended ACL: Filters by Source IP, Destination IP, Port, and Protocol. (Layer 3 & 4).

WILDCARD MASKS
Used in Cisco ACLs. The inverse of a Subnet Mask.
0 means "Must Match". 1 means "Don't Care".
[i] Example: /24 (255.255.255.0) -> Wildcard 0.0.0.255.`
      }
    ]
  },
  {
    id: 5,
    title: "Threats & Attacks",
    sections: [
      {
        id: "5.1",
        title: "5.1 Threat Actors",
        page: 69,
        tags: ["Threat Actors", "Script Kiddie", "APT", "Insider", "Hacktivist"],
        summary: "Script Kiddies, APTs, and Insider Threats.",
        content: `SCRIPT KIDDIES
Unskilled attackers who use pre-made tools/scripts found online.
Motivation: Attention, Clout, or Chaos.
Resources: Low.

APT (ADVANCED PERSISTENT THREAT)
Nation-States or Government-backed groups.
Motivation: Espionage, Cyber Warfare, Political advantage.
Resources: Unlimited funding and time.
Tactic: They gain access and stay hidden for years.

INSIDER THREAT
Current or former employees/contractors.
Malicious: Angry employee seeking revenge (Sabotage/Theft).
[!] Negligent: The most common threat. An employee accidentally clicking a phishing link or losing a laptop.

HACKTIVISTS
Attackers driven by Ideology or Politics (e.g., Anonymous).
Tactic: Defacement, Doxing, DDoS.`
      },
      {
        id: "5.2",
        title: "5.2 Common Network Attacks",
        page: 71,
        tags: ["DoS", "DDoS", "MitM", "ARP Poisoning", "DNS Poisoning", "VLAN Hopping"],
        summary: "DoS, MitM, and VLAN Hopping.",
        content: `DENIAL OF SERVICE (DoS)
[-] Goal: Disrupt Availability.
DoS: One attacker floods a target.
DDoS (Distributed): A botnet (thousands of zombies) floods a target.
[+] Defense: Blackholing, Elastic Cloud Scaling.

MAN-IN-THE-MIDDLE (ON-PATH)
The attacker secretly relays and possibly alters communications between two parties.
ARP Poisoning: Local LAN attack. Attacker spams ARP replies associating their MAC with the Gateway IP.
DNS Poisoning: Redirecting a victim to a fake website by corrupting the DNS cache.

VLAN HOPPING
Switch Spoofing: Attacker pretends to be a switch to form a trunk link, gaining access to all VLANs.
Double Tagging: Attacker adds two VLAN tags to a frame to jump to a secure VLAN.
[+] Defense: Disable DTP (Dynamic Trunking Protocol) and set ports to Access Mode manually.`
      },
      {
        id: "5.3",
        title: "5.3 Social Engineering",
        page: 73,
        tags: ["Social Engineering", "Phishing", "Spear Phishing", "Whaling", "Vishing", "Tailgating", "Evil Twin", "Smishing", "BEC"],
        summary: "Hacking humans (Phishing, Vishing).",
        content: `DIGITAL DECEPTION
Phishing: Generic malicious emails sent to thousands.
Spear Phishing: Targeted email using specific details about the victim.
Whaling: Spear phishing a high-profile target (CEO/CFO).
Vishing: Phishing over the phone (Voice).
Smishing: Phishing over SMS.
BEC (Business Email Compromise): Impersonating a CEO to trick Finance into wiring money.
Evil Twin: A rogue Wi-Fi access point that mimics a legitimate one (e.g. "Free Airport Wi-Fi") to steal credentials.

PHYSICAL TACTICS
Tailgating: Following an authorized person through a secure door without a badge.
[+] Prevention: Mantraps (Two-door system).
Dumpster Diving: Looking for passwords/info in the trash.
[+] Prevention: Shredding policy.`
      },
      {
        id: "5.4",
        title: "5.4 Malware Types",
        page: 75,
        tags: ["Malware", "Virus", "Worm", "Trojan", "Ransomware", "Rootkit", "Logic Bomb"],
        summary: "Viruses, Worms, Trojans, and Ransomware.",
        content: `VIRUS
Malware that attaches to a host file (like .exe). Requires user action (clicking) to execute and spread.

WORM
Self-replicating malware. Does NOT need a host or user action. Spreads automatically through network vulnerabilities.
[+] Prevention: Patching and Firewalls.

TROJAN
Malware disguised as legitimate software. Users install it willingly thinking it is a game or tool. Creates a backdoor.

RANSOMWARE
Encrypts user data and demands payment (Crypto) for the decryption key.
[+] Defense: Offline Backups.

ROOTKIT
Malware that hides deep in the OS (Kernel level). It can subvert the antivirus and hide its own processes.
[-] Fix: Usually requires wiping the drive.

LOGIC BOMB
Malicious code that lies dormant until a specific condition is met (e.g., a specific date or an employee being fired).`
      }
    ]
  },
  {
    id: 6,
    title: "Cryptography",
    sections: [
      {
        id: "6.1",
        title: "6.1 Concepts & Hashing",
        page: 79,
        tags: ["Hashing", "Salt", "Steganography", "Integrity"],
        summary: "Integrity, Salting, and Steganography.",
        content: `HASHING
A one-way mathematical function. You cannot reverse it.
[i] Goal: Integrity. (Did the file change?)
Algorithms:
[-] MD5: 128-bit. Broken/Collision prone.
[-] SHA-1: 160-bit. Deprecated.
[+] SHA-256: 256-bit. Modern standard.

SALTING
Adding random data to a password before hashing it.
[+] Goal: Prevents Rainbow Table attacks (pre-computed databases of password hashes).

STEGANOGRAPHY
Hiding the existence of data.
Example: Hiding a text file inside the bits of an image file.
Goal: Obscurity.`
      },
      {
        id: "6.2",
        title: "6.2 Symmetric Encryption",
        page: 81,
        tags: ["Symmetric", "AES", "DES", "Blowfish", "Key Exchange"],
        summary: "One key for everything (AES).",
        content: `SYMMETRIC ENCRYPTION
Uses the SAME key to Encrypt and Decrypt.
[+] Pros: Very fast. Efficient for large data (Hard drives, VPN tunnels).
[-] Cons: Key Exchange. If I email you the key, a hacker can steal it.
Algorithms:
[+] AES (Advanced Encryption Standard): The gold standard. 128/192/256-bit.
[-] DES/3DES: Deprecated/Slow.
[-] Blowfish/Twofish.`
      },
      {
        id: "6.3",
        title: "6.3 Asymmetric Encryption",
        page: 83,
        tags: ["Asymmetric", "RSA", "ECC", "Diffie-Hellman", "Public Key", "Private Key"],
        summary: "Two keys (Public/Private). RSA and ECC.",
        content: `ASYMMETRIC ENCRYPTION
Uses a Key PAIR (Public and Private).
Public Key: Given to everyone. Encrypts data.
Private Key: Kept secret. Decrypts data.
[+] Pros: Solves the Key Exchange problem.
[-] Cons: Very slow (mathematically complex).

ALGORITHMS
RSA: Factoring large primes. The internet standard.
ECC (Elliptic Curve): Efficient. Provides same security as RSA with smaller keys. Used on mobile devices.
Diffie-Hellman: Not for encryption, but for securely GENERATING a shared Symmetric key over public internet.`
      },
      {
        id: "6.4",
        title: "6.4 Advanced Cryptography",
        page: 84,
        tags: ["Blockchain", "TPM", "HSM", "Homomorphic"],
        summary: "Blockchain, TPM, and Homomorphic Encryption.",
        content: `BLOCKCHAIN
A decentralized, distributed ledger.
Integrity is maintained by chaining blocks together using Hashes.

HARDWARE SECURITY
TPM (Trusted Platform Module): A chip on the motherboard. Stores encryption keys (BitLocker) and verifies boot integrity.
HSM (Hardware Security Module): An external, high-performance crypto processor for managing keys in enterprise.

HOMOMORPHIC ENCRYPTION
Allows computation on encrypted data without decrypting it first. (Research phase).`
      },
      {
        id: "6.5",
        title: "6.5 PKI (Public Key Infrastructure)",
        page: 87,
        tags: ["PKI", "Certificates", "CA", "CRL", "OCSP", "Digital Signature"],
        summary: "Certificates, CAs, and the Web of Trust.",
        content: `THE WEB OF TRUST
CA (Certificate Authority): A trusted 3rd party (e.g., Verisign) that verifies identity and issues certificates.
Digital Certificate: An electronic ID card (X.509 standard). It binds a Public Key to an Identity (Domain name).
CSR (Certificate Signing Request): What you send to the CA to ask for a cert.

VALIDATION
CRL (Certificate Revocation List): A list of serial numbers for certificates that have been revoked (stolen key, fraud). Downloaded periodically.
OCSP (Online Certificate Status Protocol): A protocol to check the status of a specific cert in real-time. Faster than CRL.

DIGITAL SIGNATURES
How to prove who sent an email.
Process: Sender Hashes the data -> Encrypts the Hash with their PRIVATE key.
Recipient: Decrypts with Sender's PUBLIC key. If it works, it proves the Sender is authentic (Non-Repudiation).`
      },
      {
        id: "6.6",
        title: "6.6 Cryptographic Attacks",
        page: 90,
        tags: ["Attacks", "Brute Force", "Rainbow Table", "Collision", "Downgrade"],
        summary: "Breaking the code (Rainbow Tables, Collisions).",
        content: `PASSWORD ATTACKS
Brute Force: Trying every combination.
Dictionary: Trying common words.
Rainbow Table: Using a database of pre-calculated hashes to reverse a password instantly. (Defeated by Salt).

ALGORITHM ATTACKS
Collision: Finding two different files that produce the same Hash.
Downgrade: Tricking a server into using an old, weak protocol (SSL 3.0) instead of TLS.
Replay: Capturing a valid session token and reusing it.`
      }
    ]
  },
  {
    id: 7,
    title: "IAM & Admin",
    sections: [
      {
        id: "7.1",
        title: "7.1 Authentication Technologies",
        page: 93,
        tags: ["AAA", "Authentication", "Authorization", "Accounting", "SSO", "Federation", "SAML", "OAuth", "OIDC", "Kerberos", "RADIUS", "TACACS+", "802.1X"],
        summary: "AAA, SSO/Federation, and enterprise authentication protocols.",
        content: `AAA (AUTHENTICATION / AUTHORIZATION / ACCOUNTING)
Authentication: Prove who you are. (Login)
Authorization: What you are allowed to do. (Permissions)
Accounting: Record what you did. (Logs / Auditing)

AUTHENTICATION FACTORS
Something You Know: Password, PIN.
Something You Have: Smart card, token, phone.
Something You Are: Biometrics (fingerprint, face, retina/iris).

SINGLE SIGN-ON (SSO)
Log in once and access multiple applications without re-entering credentials.
[+] Pros: Reduces password fatigue; centralized access control.
[-] Cons: If the SSO account is compromised, many apps are exposed (high-value target).

FEDERATION (TRUST BETWEEN ORGS/APPS)
SAML (Security Assertion Markup Language):
XML-based standard often used in enterprise SSO.
[i] Typical: Corporate Identity Provider (IdP) -> SaaS Service Provider (SP).

OAuth / OpenID Connect (OIDC):
Common for consumer "Login with Google" style logins.
OAuth: Authorization (delegated access).
OIDC: Authentication on top of OAuth.

AAA PROTOCOLS
RADIUS
Common for network access (Wi-Fi and 802.1X).
Transport: UDP 1812 (Auth) / 1813 (Accounting).
[+] Pros: Widely supported; great for wireless and VPN.
[-] Note: Not ideal for granular device admin commands.

TACACS+
Cisco-proprietary (commonly used for device administration).
[+] Pros: Separates AAA more cleanly; full payload encryption; command authorization.

KERBEROS (ACTIVE DIRECTORY DEFAULT)
Uses time-stamped tickets to prevent replay attacks.
Components:
- KDC (Key Distribution Center): Issues tickets.
- TGT (Ticket Granting Ticket): The initial ticket used to request service tickets.
[!] Critical: Requires accurate time sync (NTP) or tickets will fail.

802.1X (PORT-BASED NETWORK ACCESS CONTROL)
Used on wired switches and WPA2/WPA3-Enterprise Wi-Fi.
Roles:
- Supplicant: The client (laptop).
- Authenticator: Switch/AP enforcing access.
- Authentication Server: RADIUS server validating credentials.
Result: No network access until authentication succeeds.`
      },
      {
        id: "7.2",
        title: "7.2 Hardening Authentication",
        page: 96,
        tags: ["MFA", "Biometrics", "FRR", "FAR", "Account Lockout", "Password Policy", "Length", "History", "Complexity", "Context-aware"],
        summary: "MFA, biometrics accuracy terms, and password/account policies.",
        content: `MULTI-FACTOR AUTHENTICATION (MFA)
Using 2+ different factor categories (Know + Have, or Know + Are).
[i] Example: Password (Know) + Authenticator App (Have).

[!] Important: Two passwords is NOT MFA. That's still one factor (Knowledge).

BIOMETRICS TERMS
FRR (False Rejection Rate) / Type I Error:
The system denies access to a legitimate user.
Symptoms: Users complain “it never recognizes me”.

FAR (False Acceptance Rate) / Type II Error:
The system grants access to an unauthorized user.
[!] This is the worst-case scenario.

PASSWORD POLICY CONTROLS
Minimum Length:
Modern recommendation: 12+ characters (length beats complexity).

Password History:
Prevents re-using the last X passwords (stops cycling).

Password Age / Expiration:
Forces periodic change. (Use carefully—too frequent can cause weak passwords.)

Complexity Requirements:
Require a mix of character types. Helpful, but length is still most important.

Account Lockout:
Disables an account after too many failed attempts.
[+] Defense against online brute force attacks.
[-] Risk: Can be abused for DoS against user accounts (lockout attacks).

CONTEXT-AWARE AUTHENTICATION
Access decisions based on context:
- Location (Office vs Unknown country)
- Time (Business hours)
- Device health (Managed/Compliant device)
- Network (Trusted vs public Wi-Fi)
This is a core idea behind Zero Trust.`
      },
      {
        id: "7.3",
        title: "7.3 Access Control Lists (ACLs) & Permissions",
        page: 98,
        tags: ["Permissions", "Inheritance", "Effective Permissions", "Allow", "Deny", "NTFS", "Least Privilege", "Groups"],
        summary: "Effective permissions, inheritance, and allow vs deny behavior.",
        content: `LEAST PRIVILEGE
Users should have ONLY the minimum permissions required to do their job.
Goal: Reduce blast radius if an account is compromised.

PERMISSIONS CONCEPTS
Explicit Permissions:
Manually set directly on a user/object.

Inherited Permissions:
Permissions passed down from a parent folder/container.

Effective Permissions:
The final permissions a user ends up with after combining:
- Direct user permissions
- Group memberships
- Inheritance rules
- Any explicit Deny rules

ALLOW VS DENY (MOST SYSTEMS)
Allow permissions are usually cumulative:
If a user is in two groups, one with Read and one with Write, the user typically gets Read + Write.

Deny usually overrides Allow:
If there is an explicit Deny for Write, it typically wins even if another group allows Write.

MOVING FILES (NTFS BEHAVIOR)
Move within the same NTFS volume:
Often retains original permissions (because it’s the same object).

Move to a different NTFS volume:
Behaves like Copy + Delete.
Result: The file inherits permissions from the destination folder.

ACLs (NETWORK DEVICE CONTEXT)
Remember: ACLs on routers/firewalls are evaluated top-to-bottom.
First match wins, and an Implicit Deny exists at the end.`
      },
      {
        id: "7.4",
        title: "7.4 Active Directory (Windows IAM)",
        page: 99,
        tags: ["Active Directory", "Forest", "Domain", "OU", "GPO", "Kerberos", "LDAP", "Group Policy", "Authentication"],
        summary: "AD structure (Forest/Domain/OU) and centralized management via GPO.",
        content: `WHAT IS ACTIVE DIRECTORY (AD)?
Microsoft's directory service used to manage users, computers, groups, and policies in an enterprise.
Commonly paired with:
- Kerberos (authentication)
- LDAP (directory queries)
- DNS (name resolution for AD services)

AD STRUCTURE (BIG TO SMALL)
Forest:
Top-level security boundary.
A forest can contain multiple domain trees.

Domain:
A logical boundary that shares a directory database and policies.
Example: corp.local

Organizational Unit (OU):
A container to organize objects (Users/Computers).
[!] Smallest scope where Group Policy is applied cleanly.

Groups:
Used to assign permissions via RBAC (Role-Based Access Control).
[i] Best practice: Assign permissions to groups, then place users in groups.

GROUP POLICY (GPO)
A centralized way to enforce settings across many systems.
Examples:
- Password policies
- Desktop restrictions / wallpaper
- Firewall rules
- Drive mappings
- Software deployment

JOINING A DOMAIN (HIGH LEVEL)
When a computer joins a domain, it becomes a managed object in AD, can receive GPOs, and authenticates users through the domain.`
      },
      {
        id: "7.5",
        title: "7.5 Linux Users and Groups",
        page: 101,
        tags: ["Linux", "/etc/passwd", "/etc/shadow", "chmod", "chown", "Groups", "Permissions", "Octal"],
        summary: "Linux identity files, and permissions math (chmod/chown).",
        content: `IDENTITY FILES
/etc/passwd
Contains user account information (usernames, UID/GID, home directory).
[i] Historically included password hashes, but modern systems store hashes elsewhere.

/etc/shadow
Stores the encrypted password hashes and password aging information.
[!] Protected: readable only by root.

LINUX PERMISSIONS (rwx)
Permissions are defined for:
User (Owner) / Group / Others

Values:
Read (r) = 4
Write (w) = 2
Execute (x) = 1

Octal Examples:
7 = 4+2+1 = rwx
6 = 4+2 = rw-
5 = 4+1 = r-x

777 means:
Owner: rwx, Group: rwx, Others: rwx (Full access for everyone) — usually unsafe.

COMMON COMMANDS
chmod
Changes file permissions (mode).
[i] Example: chmod 644 file.txt

chown
Changes file owner (and optionally group).
[i] Example: chown user:group file.txt

WHY THIS MATTERS (SECURITY)
Misconfigured permissions are a major security risk:
- World-writable directories
- Exposed credential files
- Excessive sudo rights`
      }
    ]
  }
];

// --- UPDATED: MASSIVE GLOSSARY (replace your existing GLOSSARY constant) ---
const GLOSSARY = [
  // Core concepts
  { term: "Network", def: "A collection of connected devices that share data/resources using protocols." },
  { term: "Node", def: "Any device on a network (host, router, switch, IoT device)." },
  { term: "Host", def: "An endpoint device that originates/consumes data (PC, server, phone)." },
  { term: "Endpoint", def: "A user/device edge system (laptop, phone, workstation, printer, IoT)." },
  { term: "Client", def: "A device/app that requests services/resources from a server." },
  { term: "Server", def: "A device/app that provides services/resources to clients." },
  { term: "Peer-to-Peer (P2P)", def: "Devices share resources directly without a dedicated server." },
  { term: "LAN", def: "Local Area Network; a network within a limited area (office/home)." },
  { term: "WLAN", def: "Wireless LAN; LAN connectivity using Wi-Fi (802.11)." },
  { term: "WAN", def: "Wide Area Network; connects LANs over large distances (ISP links)." },
  { term: "MAN", def: "Metropolitan Area Network; covers a city/metro region." },
  { term: "PAN", def: "Personal Area Network; short-range (Bluetooth, NFC)." },
  { term: "CAN", def: "Campus Area Network; multiple buildings in a campus environment." },
  { term: "SAN", def: "Storage Area Network; block-level storage network (FC, iSCSI)." },
  { term: "VPN", def: "Virtual Private Network; encrypted tunnel over untrusted networks." },
  { term: "Intranet", def: "Private internal network accessible only to an organization." },
  { term: "Extranet", def: "Private network with controlled access for external partners." },

  // Traffic types & domains
  { term: "Unicast", def: "One sender to one receiver." },
  { term: "Broadcast", def: "One sender to all devices on a broadcast domain (IPv4)." },
  { term: "Multicast", def: "One sender to many subscribed receivers (group address)." },
  { term: "Anycast", def: "One sender to the nearest/best receiver in a group (common in IPv6/DNS)." },
  { term: "Collision Domain", def: "Where collisions can occur; switches segment per-port, hubs do not." },
  { term: "Broadcast Domain", def: "Scope a broadcast is forwarded; routers separate broadcast domains." },

  // OSI / TCP-IP
  { term: "OSI Model", def: "7-layer reference model describing network communications." },
  { term: "TCP/IP Model", def: "Practical model: Link, Internet, Transport, Application layers." },
  { term: "Encapsulation", def: "Wrapping data with headers/trailers as it moves down the stack." },
  { term: "Decapsulation", def: "Removing headers/trailers as data moves up the stack." },
  { term: "PDU", def: "Protocol Data Unit; data unit at a given layer (frame/packet/segment)." },
  { term: "Bits", def: "Layer 1 PDU; raw electrical/light/radio signals." },
  { term: "Frame", def: "Layer 2 PDU; includes MAC addressing and FCS." },
  { term: "Packet", def: "Layer 3 PDU; includes IP addressing and routing info." },
  { term: "Segment", def: "Layer 4 PDU (TCP); UDP uses datagram." },
  { term: "Datagram", def: "Often used for Layer 4 UDP or Layer 3 packet depending on context." },

  // Switching & Layer 2
  { term: "MAC Address", def: "48-bit Layer 2 hardware address (hex). Used for local delivery." },
  { term: "OUI", def: "Organizationally Unique Identifier; first 24 bits of MAC identify vendor." },
  { term: "CAM Table", def: "Switch MAC address table mapping MAC -> port." },
  { term: "ARP", def: "Address Resolution Protocol; maps IPv4 address -> MAC on LAN." },
  { term: "ND (Neighbor Discovery)", def: "IPv6 replacement for ARP; uses ICMPv6 for neighbor discovery." },
  { term: "VLAN", def: "Virtual LAN; logical Layer 2 segmentation into separate broadcast domains." },
  { term: "802.1Q", def: "VLAN tagging standard for trunk links." },
  { term: "Access Port", def: "Switch port carrying a single VLAN (untagged frames)." },
  { term: "Trunk Port", def: "Switch port carrying multiple VLANs using tagging (802.1Q)." },
  { term: "Native VLAN", def: "Untagged VLAN on an 802.1Q trunk (misconfig can be a security risk)." },
  { term: "Inter-VLAN Routing", def: "Routing between VLANs using a router or Layer 3 switch." },
  { term: "STP", def: "Spanning Tree Protocol; prevents Layer 2 loops by blocking links." },
  { term: "RSTP", def: "Rapid STP; faster convergence than classic STP." },
  { term: "MSTP", def: "Multiple STP; maps VLANs to spanning-tree instances." },
  { term: "BPDU", def: "Bridge Protocol Data Unit; STP control frames." },
  { term: "Root Bridge", def: "The central switch in STP topology; chosen by lowest bridge ID." },
  { term: "Link Aggregation", def: "Combining links for throughput/redundancy (LACP/EtherChannel concept)." },
  { term: "LACP", def: "Link Aggregation Control Protocol (802.3ad/802.1AX) for bundling links." },
  { term: "Port Mirroring (SPAN)", def: "Copies traffic from one/more ports to an analysis port." },
  { term: "Network TAP", def: "Inline hardware that copies traffic for monitoring without relying on switch config." },

  // Routing & Layer 3
  { term: "Router", def: "Layer 3 device that forwards packets between networks using IP routing." },
  { term: "Layer 3 Switch", def: "Switch that can route between VLANs and networks at high speed." },
  { term: "Default Gateway", def: "Router IP that hosts use to reach other networks." },
  { term: "Routing Table", def: "List of known routes (destination networks + next hops/exit interfaces)." },
  { term: "Static Route", def: "Manually configured route." },
  { term: "Default Route", def: "Catch-all route (0.0.0.0/0 or ::/0) for unknown destinations." },
  { term: "Dynamic Routing", def: "Routes learned automatically using routing protocols (OSPF, BGP, etc.)." },
  { term: "Metric", def: "A value used to choose best route (cost, hops, bandwidth, delay, etc.)." },
  { term: "Administrative Distance", def: "Trust ranking between route sources; lower is preferred." },
  { term: "Hop", def: "A single router traversal along a path." },
  { term: "NAT", def: "Network Address Translation; rewrites IPs between networks (private<->public)." },
  { term: "PAT", def: "Port Address Translation; many-to-one NAT using ports (NAT overload)." },
  { term: "SNAT", def: "Source NAT; changes source IP (common for outbound internet access)." },
  { term: "DNAT", def: "Destination NAT; changes destination IP (common for inbound publishing)." },
  { term: "Port Forwarding", def: "Inbound DNAT mapping public port -> internal host/port." },
  { term: "DMZ", def: "Demilitarized Zone; network segment for public-facing services." },

  // IPv4/IPv6 addressing
  { term: "IPv4", def: "32-bit addressing; dotted decimal (e.g., 192.168.1.10)." },
  { term: "IPv6", def: "128-bit addressing; hex groups (e.g., 2001:db8::1)." },
  { term: "Subnet Mask", def: "IPv4 mask that defines network vs host portion (e.g., 255.255.255.0)." },
  { term: "CIDR", def: "Classless Inter-Domain Routing; slash notation for prefix length (/24)." },
  { term: "Prefix Length", def: "Number of network bits in an address (e.g., /64 in IPv6 LANs)." },
  { term: "Subnet", def: "A smaller network carved from a larger address space." },
  { term: "Supernet", def: "Combining networks via route summarization (e.g., /22 from four /24s)." },
  { term: "Public IP", def: "Routable address on the internet." },
  { term: "Private IP (RFC1918)", def: "Non-routable internet ranges: 10/8, 172.16/12, 192.168/16." },
  { term: "APIPA", def: "Automatic Private IP Addressing: 169.254.0.0/16 when DHCP fails." },
  { term: "Loopback", def: "Localhost testing (127.0.0.0/8; commonly 127.0.0.1)." },
  { term: "Link-Local (IPv6)", def: "fe80::/10 used on local segment; required for ND and local comms." },
  { term: "ULA (IPv6)", def: "Unique Local Address fc00::/7 (commonly fd00::/8) for private use." },
  { term: "Global Unicast (IPv6)", def: "Routable IPv6 addresses (typically 2000::/3)." },
  { term: "Multicast (IPv6)", def: "ff00::/8; replaces broadcast with multicast groups." },
  { term: "EUI-64", def: "Method to form IPv6 interface ID from MAC (often avoided for privacy)." },
  { term: "SLAAC", def: "Stateless Address Autoconfiguration; IPv6 self-config using RA messages." },
  { term: "DHCPv6", def: "IPv6 address configuration via DHCP server (stateful or other config)." },
  { term: "RA (Router Advertisement)", def: "ICMPv6 message that announces network prefix/default route to hosts." },
  { term: "TTL / Hop Limit", def: "Prevents routing loops; decremented each hop (IPv4 TTL / IPv6 hop limit)." },
  { term: "MTU", def: "Maximum Transmission Unit; largest frame payload allowed on a link." },
  { term: "MSS", def: "Maximum Segment Size; TCP payload size (MTU minus headers)." },
  { term: "Fragmentation", def: "Splitting packets when exceeding MTU (IPv4 routers may fragment; IPv6 routers do not)." },

  // Transport and application basics
  { term: "TCP", def: "Connection-oriented transport; reliable delivery with sequencing/ACKs." },
  { term: "UDP", def: "Connectionless transport; fast but no delivery/order guarantees." },
  { term: "3-Way Handshake", def: "TCP session establishment: SYN, SYN-ACK, ACK." },
  { term: "Port", def: "Layer 4 identifier for application/service (e.g., TCP 443)." },
  { term: "Socket", def: "IP + port combination identifying a network endpoint." },
  { term: "Ephemeral Port", def: "Temporary client-side port used for outbound connections." },

  // Performance & troubleshooting metrics
  { term: "Bandwidth", def: "Maximum theoretical capacity of a link (bps)." },
  { term: "Throughput", def: "Actual achieved data rate." },
  { term: "Goodput", def: "Useful payload throughput excluding overhead/retransmits." },
  { term: "Latency", def: "Time delay for data to travel from source to destination." },
  { term: "Jitter", def: "Variation in latency over time (critical for VoIP/video)." },
  { term: "Packet Loss", def: "Percentage of packets lost in transit." },
  { term: "Error Rate", def: "Rate of corrupted frames/packets due to noise/interference." },
  { term: "QoS", def: "Quality of Service; prioritization/management of traffic types." },
  { term: "DSCP", def: "Differentiated Services Code Point; Layer 3 QoS marking in IP header." },
  { term: "CoS", def: "Class of Service; Layer 2 priority marking (802.1p within 802.1Q)." },

  // Wireless
  { term: "SSID", def: "Wi-Fi network name." },
  { term: "BSSID", def: "MAC address of the AP radio; identifies a specific Wi-Fi cell." },
  { term: "BSS", def: "Basic Service Set; one AP and its associated clients." },
  { term: "ESS", def: "Extended Service Set; multiple APs (same SSID) enabling roaming." },
  { term: "IBSS", def: "Independent BSS (Ad Hoc); peer-to-peer Wi-Fi without AP." },
  { term: "CSMA/CA", def: "Wi-Fi collision avoidance access method (wireless is half-duplex)." },
  { term: "RTS/CTS", def: "Request/Clear to Send; reduces collisions from hidden nodes." },
  { term: "Hidden Node", def: "Clients can’t hear each other but both reach the AP, causing collisions." },
  { term: "dBm", def: "Power measurement (logarithmic); Wi-Fi RSSI often shown as negative dBm." },
  { term: "RSSI", def: "Received Signal Strength Indicator; signal strength at receiver." },
  { term: "SNR", def: "Signal-to-Noise Ratio; signal strength relative to background noise." },
  { term: "Attenuation", def: "Signal weakening over distance/materials." },
  { term: "Absorption", def: "Signal energy absorbed by material (e.g., concrete, water)." },
  { term: "Reflection", def: "Signal bounces off surfaces causing multipath." },
  { term: "Refraction", def: "Signal bends passing through materials of different density." },
  { term: "Diffraction", def: "Signal bends around edges/obstacles." },
  { term: "Multipath", def: "Multiple reflected paths arrive at different times; can help/hurt." },
  { term: "MIMO", def: "Multiple Input Multiple Output; multiple antennas to increase capacity." },
  { term: "MU-MIMO", def: "Multi-User MIMO; AP serves multiple clients simultaneously." },
  { term: "Beamforming", def: "Steers RF energy toward clients to improve signal quality." },
  { term: "Channel Bonding", def: "Combines channels for more throughput (40/80/160 MHz)." },
  { term: "DFS", def: "Dynamic Frequency Selection; 5 GHz channels that avoid radar interference." },
  { term: "Band Steering", def: "Encouraging clients to use 5 GHz/6 GHz instead of 2.4 GHz." },
  { term: "Captive Portal", def: "Web-based login page for Wi-Fi access (hotels/guests)." },
  { term: "WEP", def: "Legacy Wi-Fi security using RC4; broken/insecure." },
  { term: "WPA", def: "Legacy improvement over WEP (TKIP); deprecated." },
  { term: "WPA2", def: "Wi-Fi security using AES-CCMP (standard for many years)." },
  { term: "WPA3", def: "Modern Wi-Fi security using SAE and stronger cryptography." },
  { term: "SAE", def: "Simultaneous Authentication of Equals; WPA3 handshake resistant to offline guessing." },
  { term: "TKIP", def: "Legacy WPA encryption method; weak." },
  { term: "CCMP", def: "AES-based encryption mode used by WPA2." },
  { term: "GCMP", def: "AES-based encryption mode used in WPA3 (notably enterprise options)." },
  { term: "802.1X", def: "Port-based network access control (wired/wireless enterprise auth)." },
  { term: "EAP", def: "Extensible Authentication Protocol; framework used in 802.1X auth." },
  { term: "RADIUS", def: "AAA backend commonly used for 802.1X enterprise authentication." },

  // Cabling & physical
  { term: "UTP", def: "Unshielded Twisted Pair copper cable; common Ethernet cabling." },
  { term: "STP", def: "Shielded Twisted Pair; better EMI resistance." },
  { term: "EMI", def: "Electromagnetic Interference; can corrupt copper signals." },
  { term: "Crosstalk", def: "Interference between pairs in copper cable (NEXT/FEXT)." },
  { term: "Plenum", def: "Fire-rated cable jacket for air-handling spaces (drop ceilings)." },
  { term: "Riser", def: "Cable rating for vertical runs between floors (less strict than plenum)." },
  { term: "LSZH", def: "Low Smoke Zero Halogen cable jacket; safer fumes when burning." },
  { term: "T568A/T568B", def: "RJ-45 wiring standards (pinout color order)." },
  { term: "Patch Panel", def: "Termination point for structured cabling in racks/closets." },
  { term: "Punchdown", def: "Terminating wires into IDC connectors on jacks/patch panels." },
  { term: "IDC", def: "Insulation Displacement Connector; used in punchdown terminations." },
  { term: "Fiber Optic", def: "Uses light through glass/plastic; high speed, long distance, EMI immune." },
  { term: "Single-Mode Fiber (SMF)", def: "Laser, long distance, small core." },
  { term: "Multi-Mode Fiber (MMF)", def: "LED/VCSEL, shorter distances, larger core." },
  { term: "SFP/SFP+", def: "Small Form-factor Pluggable transceivers (1G/10G variants)." },
  { term: "QSFP", def: "Quad SFP form factor (40G/100G variants)." },
  { term: "PoE", def: "Power over Ethernet; power + data on same cable." },
  { term: "802.3af/at/bt", def: "PoE standards (PoE, PoE+, PoE++ higher power levels)." },

  // Services & records
  { term: "DNS", def: "Domain Name System; converts names to IPs using records (A, AAAA, etc.)." },
  { term: "DNS A Record", def: "Maps hostname -> IPv4 address." },
  { term: "DNS AAAA Record", def: "Maps hostname -> IPv6 address." },
  { term: "DNS CNAME", def: "Alias record pointing one name to another name." },
  { term: "DNS MX", def: "Mail exchanger record for email routing." },
  { term: "DNS PTR", def: "Reverse lookup record mapping IP -> hostname." },
  { term: "DNS TXT", def: "Text record (often used for SPF/DKIM/verification)." },
  { term: "DHCP", def: "Dynamic Host Configuration Protocol; auto-assigns IP settings." },
  { term: "DHCP Scope", def: "Pool/range of addresses DHCP can lease." },
  { term: "DHCP Reservation", def: "Static mapping of MAC -> specific IP in DHCP." },
  { term: "Lease", def: "Time-bound assignment of an IP from DHCP." },

  // Tools & diagnostics
  { term: "Ping", def: "ICMP echo test for reachability/latency." },
  { term: "Traceroute", def: "Shows hop-by-hop path using TTL/hop-limit expiration." },
  { term: "nslookup/dig", def: "DNS query tools for troubleshooting name resolution." },
  { term: "ipconfig/ifconfig", def: "Displays/sets IP config (Windows/Linux variants)." },
  { term: "netstat/ss", def: "Shows sockets, ports, and connections (legacy vs modern tool)." },
  { term: "Nmap", def: "Network scanner for host discovery, port scanning, and fingerprinting." },
  { term: "Wireshark", def: "Packet capture and protocol analysis tool." },
  { term: "NetFlow/IPFIX", def: "Flow telemetry summarizing traffic (who talked to whom, how much)." },
  { term: "Syslog", def: "Central logging protocol for network devices (severity levels 0–7)." },
  { term: "SNMP", def: "Monitoring/management protocol using managers, agents, MIBs, OIDs." },
  { term: "MIB", def: "Management Information Base; SNMP object database on devices." },
  { term: "OID", def: "Object Identifier; identifies a specific SNMP variable." },
  { term: "Baseline", def: "Known-good performance/config snapshot for comparison." },
  { term: "Configuration Drift", def: "Gradual deviation from baseline due to unmanaged changes." },

  // Security fundamentals (Network+ level)
  { term: "AAA", def: "Authentication, Authorization, Accounting; access control + audit." },
  { term: "Authentication", def: "Proving identity (who you are)." },
  { term: "Authorization", def: "Granting permissions (what you can do)." },
  { term: "Accounting", def: "Tracking/logging actions (what you did)." },
  { term: "MFA", def: "Multi-Factor Authentication; uses 2+ factor categories." },
  { term: "Least Privilege", def: "Grant only minimum permissions needed." },
  { term: "RBAC", def: "Role-Based Access Control; permissions tied to job roles/groups." },
  { term: "ABAC", def: "Attribute-Based Access Control; policy decisions based on attributes/context." },
  { term: "DAC", def: "Discretionary Access Control; owner decides permissions." },
  { term: "MAC (Access Control)", def: "Mandatory Access Control; system-enforced labels/clearance model." },
  { term: "CIA Triad", def: "Confidentiality, Integrity, Availability; core security goals." },
  { term: "Confidentiality", def: "Prevent unauthorized disclosure (encryption, access control)." },
  { term: "Integrity", def: "Prevent unauthorized modification (hashing, signatures)." },
  { term: "Availability", def: "Ensure systems/data are accessible (redundancy, DR)." },
  { term: "Non-Repudiation", def: "Proof someone performed an action (digital signatures)." },
  { term: "Firewall", def: "Filters traffic based on rules (stateful/stateless/NGFW concepts)." },
  { term: "IDS", def: "Intrusion Detection System; alerts on suspicious activity." },
  { term: "IPS", def: "Intrusion Prevention System; blocks/drops malicious traffic." },
  { term: "UTM", def: "Unified Threat Management; multiple security features in one device." },
  { term: "WAF", def: "Web Application Firewall; protects web apps (SQLi/XSS, etc.)." },
  { term: "Proxy", def: "Intermediary for client requests (filtering, caching, anonymity)." },
  { term: "Reverse Proxy", def: "Intermediary in front of servers (WAF, SSL offload, publishing)." },
  { term: "Load Balancer", def: "Distributes traffic across servers for availability/performance." },

  // Attacks & mitigations (common Network+)
  { term: "DoS", def: "Denial of Service; single source overwhelms a target." },
  { term: "DDoS", def: "Distributed DoS; many compromised systems (botnet) attack a target." },
  { term: "Botnet", def: "Network of compromised devices used for coordinated attacks." },
  { term: "MitM (On-path)", def: "Attacker intercepts/possibly alters traffic between two parties." },
  { term: "ARP Poisoning", def: "Forged ARP messages redirect LAN traffic via attacker." },
  { term: "DNS Poisoning", def: "Corrupt DNS cache/answers to redirect users to malicious sites." },
  { term: "Rogue DHCP", def: "Unauthorized DHCP server handing out wrong network settings." },
  { term: "MAC Flooding", def: "Overwhelms switch CAM table; may cause flooding like a hub." },
  { term: "VLAN Hopping", def: "Gaining access to other VLANs (double-tagging/switch spoofing)." },
  { term: "Evil Twin", def: "Rogue AP mimicking legitimate SSID to capture credentials/traffic." },
  { term: "Phishing", def: "Fraudulent messages to trick users into revealing data or installing malware." },
  { term: "Spear Phishing", def: "Targeted phishing using victim-specific info." },
  { term: "Whaling", def: "Spear phishing targeting executives (CEO/CFO)." },
  { term: "Smishing", def: "Phishing via SMS text." },
  { term: "Vishing", def: "Phishing via voice/phone calls." },
  { term: "Ransomware", def: "Malware that encrypts data and demands payment." },
  { term: "Worm", def: "Self-replicating malware that spreads without user action." },
  { term: "Trojan", def: "Malware disguised as legitimate software; often installs backdoors." },
  { term: "Rootkit", def: "Malware that hides deeply in the OS to evade detection." },

  // Business continuity / ops
  { term: "SLA", def: "Service Level Agreement; binding contract defining performance/uptime metrics." },
  { term: "SOW", def: "Statement of Work; project deliverables, scope, and timeline." },
  { term: "MSA", def: "Master Service Agreement; overarching contract framework for ongoing work." },
  { term: "MOU", def: "Memorandum of Understanding; typically non-binding agreement of intent." },
  { term: "RTO", def: "Recovery Time Objective; max acceptable downtime." },
  { term: "RPO", def: "Recovery Point Objective; max acceptable data loss (time)." },
  { term: "MTBF", def: "Mean Time Between Failures; reliability metric." },
  { term: "MTTR", def: "Mean Time To Repair; maintainability metric." },
  { term: "Hot Site", def: "Fully equipped DR site with near-real-time replication; fastest recovery." },
  { term: "Warm Site", def: "Partially equipped DR site; some restore/setup required." },
  { term: "Cold Site", def: "Facility with power/connectivity only; requires bringing/installing equipment." }
];

// --- UPDATED: MASSIVE PROTOCOLS (replace your existing PROTOCOLS constant) ---
const PROTOCOLS = [
  // Web / API
  { name: "HTTP", port: "80 (TCP)", desc: "Unencrypted web traffic." },
  { name: "HTTPS", port: "443 (TCP)", desc: "Encrypted web traffic using TLS." },
  { name: "QUIC", port: "443 (UDP)", desc: "Transport used by HTTP/3; reduces latency vs TCP in many cases." },
  { name: "TLS/SSL", port: "Uses app port", desc: "Encryption protocol suite protecting application traffic (e.g., HTTPS, SMTPS)." },

  // Naming / addressing
  { name: "DNS", port: "53 (UDP/TCP)", desc: "Name resolution (A/AAAA/CNAME/MX/PTR/TXT/SRV)." },
  { name: "mDNS", port: "5353 (UDP)", desc: "Multicast DNS for local discovery (Bonjour/ZeroConf)." },
  { name: "LLMNR", port: "5355 (UDP/TCP)", desc: "Link-local multicast name resolution (Windows-heavy; can be risky)." },
  { name: "DHCP", port: "67/68 (UDP)", desc: "IPv4 address assignment (DORA process)." },
  { name: "DHCPv6", port: "546/547 (UDP)", desc: "IPv6 addressing and/or configuration options." },
  { name: "NTP", port: "123 (UDP)", desc: "Time synchronization; critical for logs/auth." },

  // Email
  { name: "SMTP", port: "25 (TCP)", desc: "Server-to-server email transport." },
  { name: "Submission", port: "587 (TCP)", desc: "Client email submission to mail server (often with STARTTLS)." },
  { name: "SMTPS", port: "465 (TCP)", desc: "SMTP over implicit TLS (common in some environments)." },
  { name: "POP3", port: "110 (TCP)", desc: "Email retrieval (download-centric)." },
  { name: "POP3S", port: "995 (TCP)", desc: "POP3 over TLS." },
  { name: "IMAP", port: "143 (TCP)", desc: "Email retrieval with server-side sync." },
  { name: "IMAPS", port: "993 (TCP)", desc: "IMAP over TLS." },

  // Remote access / management
  { name: "SSH", port: "22 (TCP)", desc: "Encrypted remote shell and tunneling; also used by SFTP." },
  { name: "SFTP", port: "22 (TCP)", desc: "Secure file transfer over SSH (not FTP)." },
  { name: "Telnet", port: "23 (TCP)", desc: "Unencrypted remote terminal; insecure." },
  { name: "RDP", port: "3389 (TCP/UDP)", desc: "Remote Desktop Protocol for Windows." },
  { name: "VNC", port: "5900 (TCP)", desc: "Remote desktop/control (often unencrypted unless wrapped)." },
  { name: "WinRM", port: "5985/5986 (TCP)", desc: "Windows Remote Management (HTTP/HTTPS)." },

  // File sharing / storage
  { name: "SMB", port: "445 (TCP)", desc: "Windows file/printer sharing; also used by AD tooling." },
  { name: "NetBIOS", port: "137/138 (UDP), 139 (TCP)", desc: "Legacy Windows naming/session services." },
  { name: "NFS", port: "2049 (TCP/UDP)", desc: "Unix/Linux file sharing." },
  { name: "AFP", port: "548 (TCP)", desc: "Apple Filing Protocol (legacy-ish; replaced largely by SMB)." },
  { name: "iSCSI", port: "3260 (TCP)", desc: "Block storage over IP (SAN-style on Ethernet)." },
  { name: "RPC Portmapper", port: "111 (TCP/UDP)", desc: "Common with NFS/RPC services to map program ports." },

  // Transfer protocols
  { name: "FTP", port: "20/21 (TCP)", desc: "File Transfer Protocol (cleartext). 21=control, 20=data (active mode)." },
  { name: "FTPS (Explicit)", port: "21 (TCP)", desc: "FTP secured with TLS via STARTTLS on control channel." },
  { name: "FTPS (Implicit)", port: "990 (TCP)", desc: "FTP over implicit TLS (less common today)." },
  { name: "TFTP", port: "69 (UDP)", desc: "Trivial FTP; simple, no auth. Common for PXE/network boot." },
  { name: "SCP", port: "22 (TCP)", desc: "Secure copy over SSH (legacy but still seen)." },

  // Directory / identity / AAA
  { name: "LDAP", port: "389 (TCP/UDP*)", desc: "Directory queries (Active Directory/LDAP directories). (*UDP is rare)." },
  { name: "LDAPS", port: "636 (TCP)", desc: "LDAP over TLS (secure directory queries)." },
  { name: "Kerberos", port: "88 (TCP/UDP)", desc: "Ticket-based auth; default for Active Directory domains." },
  { name: "RADIUS", port: "1812/1813 (UDP)", desc: "AAA for network access (auth/accounting); common with 802.1X." },
  { name: "TACACS+", port: "49 (TCP)", desc: "AAA for device administration; encrypts full payload." },
  { name: "802.1X (EAPOL)", port: "EtherType (L2)", desc: "Port-based access control framework (wired/wireless enterprise)." },

  // Monitoring / logging / telemetry
  { name: "ICMP", port: "IP protocol 1", desc: "Network diagnostics (ping, TTL exceeded for traceroute)." },
  { name: "SNMP", port: "161 (UDP)", desc: "Device monitoring/management queries (MIB/OIDs)." },
  { name: "SNMP Traps", port: "162 (UDP)", desc: "Asynchronous alerts from devices to managers." },
  { name: "Syslog", port: "514 (UDP)", desc: "Centralized logging (often TCP/TLS in modern deployments)." },
  { name: "Syslog over TLS", port: "6514 (TCP)", desc: "Encrypted syslog (common secure logging option)." },
  { name: "NetFlow", port: "2055/9995 (UDP) common", desc: "Flow telemetry (metadata about traffic) for analysis." },
  { name: "sFlow", port: "6343 (UDP)", desc: "Sampled flow/packet telemetry (lightweight monitoring)." },
  { name: "IPFIX", port: "4739 (UDP/TCP)", desc: "Standardized flow export (successor conceptually to NetFlow)." },

  // Voice / video
  { name: "SIP", port: "5060 (UDP/TCP), 5061 (TLS)", desc: "VoIP signaling (call setup/teardown)." },
  { name: "RTP", port: "Dynamic UDP (commonly 16384–32767)", desc: "Real-time audio/video media transport." },
  { name: "SRTP", port: "Dynamic UDP", desc: "Secure RTP; encrypts RTP media streams." },
  { name: "RTCP", port: "Dynamic UDP", desc: "RTP control protocol for statistics/quality reporting." },
  { name: "H.323", port: "1720 (TCP)", desc: "Legacy VoIP signaling suite." },
  { name: "RTSP", port: "554 (TCP/UDP)", desc: "Streaming control protocol (media session control)." },

  // Routing protocols
  { name: "RIP", port: "520 (UDP)", desc: "Distance-vector routing (legacy/small networks)." },
  { name: "OSPF", port: "IP protocol 89", desc: "Link-state routing common in enterprises." },
  { name: "EIGRP", port: "IP protocol 88", desc: "Advanced distance-vector (Cisco-heavy environments)." },
  { name: "BGP", port: "179 (TCP)", desc: "Internet/ISP routing and large-scale policy-based routing." },

  // Tunneling / VPN
  { name: "IPsec IKE", port: "500 (UDP)", desc: "Key exchange for IPsec tunnels (phase negotiation)." },
  { name: "IPsec NAT-T", port: "4500 (UDP)", desc: "IPsec traversal over NAT (encapsulates ESP)." },
  { name: "ESP", port: "IP protocol 50", desc: "IPsec payload encryption/integrity (Encapsulating Security Payload)." },
  { name: "AH", port: "IP protocol 51", desc: "IPsec authentication header (integrity/auth; no encryption)." },
  { name: "L2TP", port: "1701 (UDP)", desc: "Layer 2 tunneling; commonly paired with IPsec for security." },
  { name: "PPTP", port: "1723 (TCP) + GRE", desc: "Legacy VPN; insecure/deprecated." },
  { name: "GRE", port: "IP protocol 47", desc: "Generic Routing Encapsulation; tunnels many protocols (no encryption)." },
  { name: "SSTP", port: "443 (TCP)", desc: "VPN over HTTPS; firewall-friendly." },
  { name: "OpenVPN", port: "1194 (UDP/TCP) common", desc: "SSL/TLS-based VPN solution (configurable ports)." },
  { name: "WireGuard", port: "51820 (UDP) default", desc: "Modern, fast VPN with simple cryptography and config." },

  // Security / discovery / misc
  { name: "SSDP", port: "1900 (UDP)", desc: "Simple Service Discovery Protocol (UPnP discovery)." },
  { name: "UPnP", port: "1900 (UDP) + 5000/varies", desc: "Automatic port mapping/service discovery; security risk in many networks." },
  { name: "IPsec/L2TP", port: "1701 + 500/4500", desc: "Common combination for secure L2TP tunnels with IPsec." },
  { name: "LLDP", port: "EtherType 0x88cc", desc: "Neighbor discovery (vendor-neutral) at Layer 2." },
  { name: "CDP", port: "Cisco proprietary (L2)", desc: "Cisco neighbor discovery at Layer 2 (disable on untrusted ports)." },
  { name: "802.11 (Wi-Fi)", port: "RF (2.4/5/6 GHz)", desc: "Wireless LAN standard family (a/b/g/n/ac/ax)." },

  // Databases (commonly encountered in networks)
  { name: "Microsoft SQL Server", port: "1433 (TCP)", desc: "Database service port (common default)." },
  { name: "MySQL/MariaDB", port: "3306 (TCP)", desc: "Database service port (common default)." },
  { name: "PostgreSQL", port: "5432 (TCP)", desc: "Database service port (common default)." },
  { name: "MongoDB", port: "27017 (TCP)", desc: "NoSQL database port (common default)." },

  // Messaging / IoT (increasingly common)
  { name: "MQTT", port: "1883 (TCP), 8883 (TLS)", desc: "Lightweight pub/sub messaging (IoT)." },
  { name: "AMQP", port: "5672 (TCP), 5671 (TLS)", desc: "Message queueing protocol (enterprise messaging)." },
  { name: "CoAP", port: "5683 (UDP), 5684 (DTLS)", desc: "Constrained Application Protocol (IoT over UDP)." }
];

const NetworkPlusGuide = ({ onClose }) => {
  const [activeMode, setActiveMode] = useState(null); 

  const renderMenu = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fadeIn">
       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="col-span-1 md:col-span-2 text-center mb-8">
               <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Network+ Preparation</h1>
               <p className="text-slate-500 dark:text-slate-400">Select a mode to begin your session</p>
           </div>

           <button onClick={() => setActiveMode('study')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-sky-500 dark:hover:border-sky-500 transition-all group text-left">
              <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Study Guide</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Interactive study material covering all domains with glossary and protocol cheat sheets.</p>
              <span className="text-sky-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">Launch Guide <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
           </button>

           <button onClick={() => setActiveMode('quiz')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Assessment</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Test your knowledge with randomized questions, analytics, and performance tracking.</p>
              <span className="text-indigo-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">Start Quiz <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
           </button>
           
           <button onClick={onClose} className="col-span-1 md:col-span-2 text-slate-400 hover:text-slate-600 mt-8 font-bold text-sm uppercase tracking-widest">Exit Application</button>
       </div>
    </div>
  );

  if (activeMode === 'study') {
      return (
        <StudyApp 
          title="Network+ Study"
          domains={DOMAINS}
          glossary={GLOSSARY}
          protocols={PROTOCOLS}
          pdfUrl="./public/PremadeStudy/NetworkPlus1.2.pdf"
          onClose={() => setActiveMode(null)}
        />
      );
  }

  if (activeMode === 'quiz') {
      return (
        <QuizApp 
           title="Network+"
           questions={NETWORK_PLUS_QUESTIONS}
           onClose={() => setActiveMode(null)}
        />
      );
  }

  return renderMenu();
};

export default NetworkPlusGuide;