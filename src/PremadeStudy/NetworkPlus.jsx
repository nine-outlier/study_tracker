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
  q(7030, 7, "2", ["Policy", "Password"], "To ensure high entropy, what is the modern recommendation for minimum password length?", ["12+ characters", "8 characters", "4 characters", "6 characters"], "12+ characters", "Length is the most important factor in password strength. 12 or more characters makes brute forcing exponentially harder.")
];

// ==========================================
// SECTION 3: STUDY CONTENT DEFINITIONS
// ==========================================

const DOMAINS = [
  {
    id: "1.0",
    title: "Networking Fundamentals",
    sections: [
        { id: "1.1", title: "OSI Model", page: 1, content: "Layer 1: Physical (Bits)\nLayer 2: Data Link (Frames)\nLayer 3: Network (Packets)\nLayer 4: Transport (Segments)\nLayer 5: Session\nLayer 6: Presentation\nLayer 7: Application", tags: ["OSI", "Layers"] },
        { id: "1.2", title: "Network Topologies", page: 2, content: "Star: Central connection point (switch).\nBus: Single shared cable.\nRing: Token passing ring.\nMesh: Full redundancy.", tags: ["Topology", "Star", "Mesh"] },
        { id: "1.3", title: "Cabling Standards", page: 3, content: "T568A vs T568B.\nFiber Optic: Single-mode vs Multi-mode.\nPlenum rating for safety.", tags: ["Cabling", "Fiber"] },
        { id: "1.4", title: "IP Addressing", page: 4, content: "IPv4 Classes (A, B, C).\nSubnetting basics.\nIPv6 128-bit structure.", tags: ["IPv4", "IPv6", "Subnetting"] }
    ]
  },
  {
    id: "2.0",
    title: "Wireless Networking",
    sections: [
        { id: "2.1", title: "802.11 Standards", page: 5, content: "802.11a/b/g/n/ac/ax (Wi-Fi 6).\nFrequencies: 2.4 GHz vs 5 GHz.\nChannels: 1, 6, 11 (Non-overlapping 2.4GHz).", tags: ["Wi-Fi", "Standards"] },
        { id: "2.2", title: "Wireless Security", page: 6, content: "WEP (Insecure).\nWPA2 (AES/CCMP).\nWPA3 (SAE).\nEnterprise (RADIUS) vs Personal (PSK).", tags: ["WPA", "Security"] },
        { id: "2.3", title: "Site Surveys", page: 7, content: "Heatmaps.\nSignal-to-Noise Ratio (SNR).\nInterference sources (Microwaves, Bluetooth).", tags: ["Survey", "RF"] }
    ]
  },
  {
    id: "3.0",
    title: "Network Management",
    sections: [
        { id: "3.1", title: "Documentation", page: 8, content: "Physical vs Logical Diagrams.\nSOPs (Standard Operating Procedures).\nSLAs (Service Level Agreements).", tags: ["Docs", "Admin"] },
        { id: "3.2", title: "Business Continuity", page: 9, content: "RTO (Recovery Time Objective).\nRPO (Recovery Point Objective).\nCold, Warm, and Hot Sites.", tags: ["Disaster Recovery", "BCP"] },
        { id: "3.3", title: "Monitoring", page: 10, content: "SNMP (Simple Network Management Protocol).\nSyslog levels (0-7).\nNetFlow for bandwidth analysis.", tags: ["SNMP", "Logs"] }
    ]
  },
  {
    id: "4.0",
    title: "Security Principles",
    sections: [
        { id: "4.1", title: "CIA Triad", page: 11, content: "Confidentiality (Encryption).\nIntegrity (Hashing).\nAvailability (Redundancy).", tags: ["CIA", "Theory"] },
        { id: "4.2", title: "Defense in Depth", page: 12, content: "Layered security.\nPhysical controls.\nTechnical controls.\nAdministrative controls.", tags: ["Defense", "Layers"] },
        { id: "4.3", title: "Firewalls & ACLs", page: 13, content: "Packet filtering.\nStateful inspection.\nImplicit Deny rule at the end of ACLs.", tags: ["Firewall", "ACL"] }
    ]
  },
  {
    id: "5.0",
    title: "Threats & Attacks",
    sections: [
        { id: "5.1", title: "Social Engineering", page: 14, content: "Phishing (Email).\nVishing (Voice).\nTailgating (Physical).\nDumpster Diving.", tags: ["Phishing", "Social"] },
        { id: "5.2", title: "Network Attacks", page: 15, content: "DoS / DDoS.\nMan-in-the-Middle (On-path).\nARP Poisoning.\nVLAN Hopping.", tags: ["Attack", "DDoS"] },
        { id: "5.3", title: "Malware", page: 16, content: "Ransomware (Encrypts data).\nTrojans (Hidden).\nWorms (Self-replicating).\nRootkits (Kernel level).", tags: ["Malware", "Virus"] }
    ]
  },
  {
    id: "6.0",
    title: "Cryptography",
    sections: [
        { id: "6.1", title: "Symmetric Encryption", page: 17, content: "AES (Advanced Encryption Standard).\nDES/3DES (Legacy).\nSame key for encryption/decryption.", tags: ["Symmetric", "AES"] },
        { id: "6.2", title: "Asymmetric Encryption", page: 18, content: "Public/Private Key pair.\nRSA.\nECC (Elliptic Curve).\nDiffie-Hellman (Key Exchange).", tags: ["Asymmetric", "RSA"] },
        { id: "6.3", title: "Hashing", page: 19, content: "One-way function.\nSHA-256.\nMD5 (Weak).\nEnsures Integrity.", tags: ["Hashing", "Integrity"] }
    ]
  },
  {
    id: "7.0",
    title: "IAM & Admin",
    sections: [
        { id: "7.1", title: "Authentication", page: 20, content: "Factors: Knowledge, Possession, Inherence.\nMFA (Multi-Factor).\nSSO (Single Sign-On).", tags: ["Auth", "MFA"] },
        { id: "7.2", title: "Protocols", page: 21, content: "RADIUS (AAA).\nTACACS+ (Cisco).\nKerberos (Tickets/Active Directory).", tags: ["RADIUS", "Kerberos"] },
        { id: "7.3", title: "Access Control Models", page: 22, content: "DAC (Discretionary).\nMAC (Mandatory).\nRBAC (Role-Based).\nABAC (Attribute-Based).", tags: ["DAC", "RBAC"] }
    ]
  }
];

const GLOSSARY = [
    { term: "AAA", def: "Authentication, Authorization, and Accounting." },
    { term: "ACL", def: "Access Control List. A list of rules for packet filtering." },
    { term: "AES", def: "Advanced Encryption Standard. A secure symmetric algorithm." },
    { term: "APIPA", def: "Automatic Private IP Addressing (169.254.x.x)." },
    { term: "ARP", def: "Address Resolution Protocol. Resolves IP to MAC." },
    { term: "CIA", def: "Confidentiality, Integrity, Availability." },
    { term: "DHCP", def: "Dynamic Host Configuration Protocol. Assigns IPs automatically." },
    { term: "DNS", def: "Domain Name System. Resolves Hostnames to IPs." },
    { term: "DDoS", def: "Distributed Denial of Service attack." },
    { term: "EMI", def: "Electromagnetic Interference." },
    { term: "FTP", def: "File Transfer Protocol." },
    { term: "IoT", def: "Internet of Things." },
    { term: "MAC", def: "Media Access Control address (Physical address)." },
    { term: "MTU", def: "Maximum Transmission Unit." },
    { term: "NAT", def: "Network Address Translation." },
    { term: "OSI", def: "Open Systems Interconnection model." },
    { term: "PoE", def: "Power over Ethernet." },
    { term: "RAID", def: "Redundant Array of Independent Disks." },
    { term: "SSID", def: "Service Set Identifier (Wi-Fi Name)." },
    { term: "TCP", def: "Transmission Control Protocol. Connection-oriented." },
    { term: "UDP", def: "User Datagram Protocol. Connectionless." },
    { term: "VLAN", def: "Virtual Local Area Network." },
    { term: "VPN", def: "Virtual Private Network." }
];

const PROTOCOLS = [
    { name: "FTP", port: "20/21", desc: "File Transfer Protocol" },
    { name: "SSH", port: "22", desc: "Secure Shell (Remote Login)" },
    { name: "Telnet", port: "23", desc: "Unencrypted Remote Login" },
    { name: "SMTP", port: "25", desc: "Simple Mail Transfer Protocol (Sending Email)" },
    { name: "DNS", port: "53", desc: "Domain Name System" },
    { name: "DHCP", port: "67/68", desc: "Dynamic Host Configuration Protocol" },
    { name: "TFTP", port: "69", desc: "Trivial FTP" },
    { name: "HTTP", port: "80", desc: "Hypertext Transfer Protocol (Web)" },
    { name: "POP3", port: "110", desc: "Post Office Protocol v3 (Receiving Email)" },
    { name: "NTP", port: "123", desc: "Network Time Protocol" },
    { name: "IMAP", port: "143", desc: "Internet Message Access Protocol" },
    { name: "SNMP", port: "161", desc: "Simple Network Management Protocol" },
    { name: "LDAP", port: "389", desc: "Lightweight Directory Access Protocol" },
    { name: "HTTPS", port: "443", desc: "HTTP Secure" },
    { name: "SMB", port: "445", desc: "Server Message Block (File Sharing)" },
    { name: "Syslog", port: "514", desc: "System Logging" },
    { name: "LDAPS", port: "636", desc: "LDAP Secure" },
    { name: "SQL", port: "1433", desc: "Microsoft SQL Server" },
    { name: "RDP", port: "3389", desc: "Remote Desktop Protocol" },
    { name: "SIP", port: "5060", desc: "Session Initiation Protocol (VoIP)" }
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
           title="Network+ Assessment"
           questions={NETWORK_PLUS_QUESTIONS}
           onClose={() => setActiveMode(null)}
        />
      );
  }

  return renderMenu();
};

export default NetworkPlusGuide;