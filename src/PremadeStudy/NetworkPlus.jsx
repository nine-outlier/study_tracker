import React, { useState } from 'react';
import StudyApp from './StudyApp';
import QuizApp from './QuizApp';

// ==========================================
// SECTION 1: DATA OPTIMIZATION HELPERS
// ==========================================

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
 * TIER 1: GLOBAL IDENTIFIER BANK
 * Usage: [identifier] in question/answer text gets replaced with random choice
 * Structure: Each key has a master term (index 0) followed by variants
 */
const GLOBAL_BANK = {
  // Roles
  admin: ["admin", "network administrator", "systems engineer", "IT technician", "security analyst", "NOC technician"],
  user: ["user", "end-user", "client", "employee", "remote worker", "staff member"],
  attacker: ["attacker", "malicious actor", "hacker", "unauthorized user", "threat actor"],
  
  // Devices
  device: ["device", "node", "host", "endpoint", "workstation"],
  router: ["router", "Layer 3 gateway", "edge device"],
  switch: ["switch", "Layer 2 bridge", "intermediary device"],
  wap: ["wireless access point", "AP", "wireless router"],
  server: ["server", "backend system", "application host"],
  
  // Scenarios
  company: ["company", "CarPet Inc.", "a large enterprise", "a small startup", "a government agency", "GlobalTech"],
  location: ["location", "server room", "data center", "branch office", "cloud environment", "wiring closet", "MDF"],
  
  // Actions
  configure: ["configure", "setup", "deploy", "implement"],
  verify: ["verify", "check", "confirm", "validate"]
};

/**
 * Question Generator Helper
 * Now supports answer option variants and wrong answer explanations
 */
const q = (id, domain, section, tags, variantData) => ({
  id,
  domain: D_NAMES[domain],
  section: `${domain}.${section}`,
  tags,
  ...variantData
});

// ==========================================
// SECTION 2: DATA SETS
// ==========================================

// NOTE: We keep the specific variable name NETWORK_PLUS_QUESTIONS as requested
export const NETWORK_PLUS_QUESTIONS = [
  // --- DOMAIN 1: NETWORKING FUNDAMENTALS ---
// --- TOPIC: Topologies (Star, Mesh, Bus, Ring) ---
  
  q(1001, 1, 1, ["Topology", "Star", "SPOF"], {
    variants: [
      "Which network topology connects all [device]s to a central [switch], creating a single point of failure?",
      "You are designing a network for [company]. If every [user] connects to one central hub, which topology are you using?",
      "In a [star_term] topology, what happens when the central connecting [device] fails?",
      "An [admin] notices that when the core [switch] went down, the entire network segment became unreachable. This describes which topology?"
    ],
    localBank: { star_term: ["star", "hub-and-spoke", "centralized"] },
    answerOptions: [
      { variants: ["Star Topology", "Hub-and-Spoke", "Centralized Star"], correct: true, explanation: "Star topology connects all nodes to a central [device]. If this central [device] fails, the entire network segment goes down." },
      { variants: ["Bus Topology", "Linear Bus"], correct: false, explanation: "Bus topology uses a single backbone cable, not a central hub/switch." },
      { variants: ["Ring Topology", "Token Ring"], correct: false, explanation: "Ring topology connects devices in a loop, not to a central point." },
      { variants: ["Full Mesh", "Mesh"], correct: false, explanation: "Mesh topology uses redundant links between devices, specifically avoiding single points of failure." }
    ]
  }),

  q(1002, 1, 1, ["Topology", "Mesh", "Redundancy"], {
    variants: [
      "You are designing a network for a critical [location] requiring maximum redundancy. Which topology should you select?",
      "Which topology connects every [device] to every other [device], ensuring zero downtime if any single link fails?",
      "To guarantee maximum fault tolerance for [company], which expensive topology provides the most redundant paths?"
    ],
    answerOptions: [
      { variants: ["Full Mesh", "Complete Mesh"], correct: true, explanation: "Full Mesh connects every device to every other device, providing the highest redundancy." },
      { variants: ["Partial Mesh"], correct: false, explanation: "Partial mesh has some redundancy but does not connect every single device to every other device." },
      { variants: ["Star"], correct: false, explanation: "Star topology has a single point of failure (the central switch)." },
      { variants: ["Bus"], correct: false, explanation: "Bus topology has a single point of failure (the backbone cable)." }
    ]
  }),

  q(1003, 1, 1, ["Topology", "Ring", "Legacy"], {
    variants: [
      "In a legacy [ring_term] topology, what mechanism prevents data collisions?",
      "Which topology typically uses a token passing method to control access to the medium?"
    ],
    localBank: { ring_term: ["Ring", "Token Ring"] },
    answerOptions: [
      { variants: ["Token Passing"], correct: true, explanation: "Ring networks pass a digital 'token' around. Only the device holding the token can transmit." },
      { variants: ["CSMA/CD"], correct: false, explanation: "CSMA/CD is used by Ethernet (Bus/Star), not Ring." },
      { variants: ["CSMA/CA"], correct: false, explanation: "CSMA/CA is used by Wireless (Wi-Fi) networks." },
      { variants: ["Polling"], correct: false, explanation: "Polling is a centralized mainframe concept, not specific to Ring topologies." }
    ]
  }),

  q(1004, 1, 1, ["Topology", "Bus", "Legacy"], {
    variants: [
      "Which topology uses a single central backbone cable with terminators at both ends?",
      "If the main cable breaks in a [bus_term] network, the entire segment fails. Which topology is this?"
    ],
    localBank: { bus_term: ["Bus", "Linear"] },
    answerOptions: [
      { variants: ["Bus Topology"], correct: true, explanation: "Bus topology uses a single coaxial cable backbone. A break anywhere severs the network." },
      { variants: ["Star Topology"], correct: false, explanation: "Star uses individual cables for each device." },
      { variants: ["Mesh Topology"], correct: false, explanation: "Mesh uses multiple cables for redundancy." },
      { variants: ["Hybrid Topology"], correct: false, explanation: "Hybrid mixes multiple types." }
    ]
  }),

  q(1005, 1, 1, ["Topology", "WAN", "P2P"], {
    variants: [
      "A dedicated link connecting exactly two [router]s is known as which topology?",
      "Your ISP provides a direct fiber connection between two offices. This is an example of:"
    ],
    answerOptions: [
      { variants: ["Point-to-Point"], correct: true, explanation: "Point-to-Point is a direct connection between two nodes." },
      { variants: ["Point-to-Multipoint"], correct: false, explanation: "Point-to-Multipoint connects one central node to many remotes." },
      { variants: ["Mesh"], correct: false, explanation: "Mesh implies multiple redundant paths, not a single direct link." },
      { variants: ["Bus"], correct: false, explanation: "Bus is a shared medium for multiple devices." }
    ]
  }),

  q(1006, 1, 1, ["Topology", "Hybrid"], {
    variants: [
      "A network combining a Star topology at the edge and a Mesh topology at the core is best described as:",
      "Most modern enterprise networks use which type of topology?"
    ],
    answerOptions: [
      { variants: ["Hybrid"], correct: true, explanation: "Any combination of two or more standard topologies is a Hybrid." },
      { variants: ["Star"], correct: false, explanation: "Star is just one part of the equation." },
      { variants: ["Full Mesh"], correct: false, explanation: "Full Mesh is too expensive for the entire network." },
      { variants: ["Ring"], correct: false, explanation: "Ring is rarely used for the whole network." }
    ]
  }),

  q(1007, 1, 1, ["Topology", "Wireless"], {
    variants: [
      "Which wireless topology allows devices to connect directly to each other without an AP?",
      "An [admin] sets up a temporary network for file sharing between laptops. What mode is this?"
    ],
    answerOptions: [
      { variants: ["Ad Hoc", "IBSS"], correct: true, explanation: "Ad Hoc (Independent Basic Service Set) allows peer-to-peer wireless." },
      { variants: ["Infrastructure"], correct: false, explanation: "Infrastructure mode requires an Access Point." },
      { variants: ["Mesh"], correct: false, explanation: "Mesh usually implies managed nodes repeating signals, Ad Hoc is unmanaged P2P." },
      { variants: ["Star"], correct: false, explanation: "Wireless Star is Infrastructure mode." }
    ]
  }),

  q(1008, 1, 1, ["Topology", "Wireless"], {
    variants: [
      "Which wireless topology uses a central Access Point to manage all communications?",
      "The standard Wi-Fi setup in an office where all laptops connect to an AP is called:"
    ],
    answerOptions: [
      { variants: ["Infrastructure"], correct: true, explanation: "Infrastructure mode uses a central AP (acting like a switch) to coordinate traffic." },
      { variants: ["Ad Hoc"], correct: false, explanation: "Ad Hoc is peer-to-peer." },
      { variants: ["Mesh"], correct: false, explanation: "Mesh implies multiple APs relaying data." },
      { variants: ["Bus"], correct: false, explanation: "Wireless doesn't use a physical bus." }
    ]
  }),

  q(1009, 1, 1, ["Topology", "Mesh", "IoT"], {
    variants: [
      "Which topology is commonly used by IoT devices (like Zigbee) to extend range by hopping from node to node?",
      "Smart lightbulbs often connect to each other to reach the hub. What topology is this?"
    ],
    answerOptions: [
      { variants: ["Mesh"], correct: true, explanation: "Mesh networking allows low-power devices to daisy-chain messages to reach the controller." },
      { variants: ["Star"], correct: false, explanation: "Star would require every bulb to reach the central hub directly." },
      { variants: ["Bus"], correct: false, explanation: "Bus requires a physical cable." },
      { variants: ["Ring"], correct: false, explanation: "Ring requires a closed loop structure." }
    ]
  }),

  q(1010, 1, 1, ["Architecture", "Spine-Leaf"], {
    variants: [
      "Which data center architecture replaces the 3-tier model to reduce latency for east-west traffic?",
      "In modern data centers, which topology ensures every 'Leaf' switch connects to every 'Spine' switch?"
    ],
    answerOptions: [
      { variants: ["Spine-Leaf"], correct: true, explanation: "Spine-Leaf architecture flattens the network, ensuring predictable latency between servers." },
      { variants: ["Three-Tier"], correct: false, explanation: "Three-Tier (Core/Dist/Access) is the legacy model being replaced." },
      { variants: ["Full Mesh"], correct: false, explanation: "While Spine-Leaf is a type of mesh, the specific architectural term is Spine-Leaf." },
      { variants: ["Bus"], correct: false, explanation: "Bus is not used in data centers." }
    ]
  }),

  // --- TOPIC: OSI Model (Questions 1011-1025) ---

  q(1011, 1, 2, ["OSI", "Layer1", "Physical"], {
    variants: [
      "Which OSI layer is responsible for the transmission of raw [bits_term]?",
      "Cables, connectors, and voltage levels are defined at which OSI layer?"
    ],
    localBank: { bits_term: ["bits", "1s and 0s", "binary data"] },
    answerOptions: [
      { variants: ["Layer 1", "Physical"], correct: true, explanation: "Layer 1 (Physical) deals with the hardware means of sending bits." },
      { variants: ["Layer 2", "Data Link"], correct: false, explanation: "Layer 2 handles frames and MAC addresses." },
      { variants: ["Layer 3", "Network"], correct: false, explanation: "Layer 3 handles packets and logical addressing." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 handles segments and reliability." }
    ]
  }),

  q(1012, 1, 2, ["OSI", "Layer2", "MAC"], {
    variants: [
      "Media Access Control (MAC) addresses are used at which OSI layer?",
      "Switches make forwarding decisions based on addresses found at which layer?"
    ],
    answerOptions: [
      { variants: ["Layer 2", "Data Link"], correct: true, explanation: "Layer 2 (Data Link) uses physical MAC addresses for local delivery." },
      { variants: ["Layer 1", "Physical"], correct: false, explanation: "Layer 1 is just raw signal." },
      { variants: ["Layer 3", "Network"], correct: false, explanation: "Layer 3 uses logical IP addresses." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 uses Ports." }
    ]
  }),

  q(1013, 1, 2, ["OSI", "Layer3", "IP"], {
    variants: [
      "Logical addressing (IP) and routing occur at which OSI layer?",
      "Which layer determines the best path for data to travel across different networks?"
    ],
    answerOptions: [
      { variants: ["Layer 3", "Network"], correct: true, explanation: "Layer 3 (Network) handles routing and IP addressing." },
      { variants: ["Layer 2", "Data Link"], correct: false, explanation: "Layer 2 only handles local delivery on the same segment." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 handles end-to-end reliability." },
      { variants: ["Layer 5", "Session"], correct: false, explanation: "Layer 5 handles dialogue control." }
    ]
  }),

  q(1014, 1, 2, ["OSI", "Layer4", "Transport"], {
    variants: [
      "Which layer is responsible for end-to-end communication and error recovery?",
      "TCP and UDP operate at which layer of the OSI model?"
    ],
    answerOptions: [
      { variants: ["Layer 4", "Transport"], correct: true, explanation: "Layer 4 (Transport) ensures data gets from host to host, often handling reliability (TCP)." },
      { variants: ["Layer 3", "Network"], correct: false, explanation: "Layer 3 routes packets but doesn't guarantee the conversation." },
      { variants: ["Layer 2", "Data Link"], correct: false, explanation: "Layer 2 frames data." },
      { variants: ["Layer 5", "Session"], correct: false, explanation: "Layer 5 starts/stops the session." }
    ]
  }),

  q(1015, 1, 2, ["OSI", "Layer5", "Session"], {
    variants: [
      "Which layer manages the dialogue (start, stop, reconnect) between two computers?",
      "If a connection drops and needs to be re-established, which layer is responsible?"
    ],
    answerOptions: [
      { variants: ["Layer 5", "Session"], correct: true, explanation: "Layer 5 (Session) controls the dialogue between computers." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 transports data packets but Layer 5 manages the overall session state." },
      { variants: ["Layer 6", "Presentation"], correct: false, explanation: "Layer 6 formats data." },
      { variants: ["Layer 7", "Application"], correct: false, explanation: "Layer 7 is the user interface." }
    ]
  }),

  q(1016, 1, 2, ["OSI", "Layer6", "Format"], {
    variants: [
      "Data encryption, compression, and formatting happen at which layer?",
      "Which layer ensures the data is in a readable format for the application (e.g., JPEG, ASCII)?"
    ],
    answerOptions: [
      { variants: ["Layer 6", "Presentation"], correct: true, explanation: "Layer 6 (Presentation) translates data format (encryption/compression)." },
      { variants: ["Layer 7", "Application"], correct: false, explanation: "Layer 7 displays the data, but Layer 6 formats it." },
      { variants: ["Layer 5", "Session"], correct: false, explanation: "Layer 5 manages the connection." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 moves the data." }
    ]
  }),

  q(1017, 1, 2, ["OSI", "Layer7", "App"], {
    variants: [
      "Which layer provides network services directly to the [user]'s software?",
      "HTTP, FTP, and SMTP are protocols that operate at which layer?"
    ],
    answerOptions: [
      { variants: ["Layer 7", "Application"], correct: true, explanation: "Layer 7 (Application) is the interface between the network and the software." },
      { variants: ["Layer 6", "Presentation"], correct: false, explanation: "Layer 6 formats the data." },
      { variants: ["Layer 5", "Session"], correct: false, explanation: "Layer 5 manages the session." },
      { variants: ["Layer 4", "Transport"], correct: false, explanation: "Layer 4 moves data." }
    ]
  }),

  q(1018, 1, 2, ["OSI", "PDU", "L2"], {
    variants: [
      "What is the Protocol Data Unit (PDU) at Layer 2?",
      "When a NIC processes data, it encapsulates it into a:"
    ],
    answerOptions: [
      { variants: ["Frame"], correct: true, explanation: "The PDU for the Data Link Layer is the Frame." },
      { variants: ["Packet"], correct: false, explanation: "Packet is Layer 3." },
      { variants: ["Segment"], correct: false, explanation: "Segment is Layer 4." },
      { variants: ["Bit"], correct: false, explanation: "Bit is Layer 1." }
    ]
  }),

  q(1019, 1, 2, ["OSI", "PDU", "L3"], {
    variants: [
      "What is the Protocol Data Unit (PDU) at Layer 3?",
      "Routers process which type of PDU?"
    ],
    answerOptions: [
      { variants: ["Packet"], correct: true, explanation: "The PDU for the Network Layer is the Packet." },
      { variants: ["Frame"], correct: false, explanation: "Frame is Layer 2." },
      { variants: ["Segment"], correct: false, explanation: "Segment is Layer 4." },
      { variants: ["Datagram"], correct: false, explanation: "Datagram is usually Layer 4 (UDP)." }
    ]
  }),

  q(1020, 1, 2, ["OSI", "PDU", "L4"], {
    variants: [
      "What is the PDU for the Transport Layer when using TCP?",
      "TCP encapsulates data into:"
    ],
    answerOptions: [
      { variants: ["Segment"], correct: true, explanation: "The PDU for Layer 4 (TCP) is the Segment." },
      { variants: ["Packet"], correct: false, explanation: "Packet is Layer 3." },
      { variants: ["Frame"], correct: false, explanation: "Frame is Layer 2." },
      { variants: ["Bit"], correct: false, explanation: "Bit is Layer 1." }
    ]
  }),

  q(1021, 1, 2, ["OSI", "Hardware"], {
    variants: [
      "A standard network switch operates primarily at which OSI layer?",
      "Which device makes decisions based on MAC addresses?"
    ],
    answerOptions: [
      { variants: ["Layer 2"], correct: true, explanation: "Switches bridge network segments at Layer 2 using MAC addresses." },
      { variants: ["Layer 3"], correct: false, explanation: "Routers operate at Layer 3. (Multilayer switches can too, but 'standard' implies L2)." },
      { variants: ["Layer 1"], correct: false, explanation: "Hubs operate at Layer 1." },
      { variants: ["Layer 4"], correct: false, explanation: "Firewalls often operate at Layer 4." }
    ]
  }),

  q(1022, 1, 2, ["OSI", "Hardware"], {
    variants: [
      "A router operates primarily at which OSI layer?",
      "Which device connects different networks using logical addressing?"
    ],
    answerOptions: [
      { variants: ["Layer 3"], correct: true, explanation: "Routers use IP addresses (Layer 3) to route packets." },
      { variants: ["Layer 2"], correct: false, explanation: "Switches operate at Layer 2." },
      { variants: ["Layer 4"], correct: false, explanation: "Gateways/Firewalls operate at Layer 4." },
      { variants: ["Layer 1"], correct: false, explanation: "Repeaters operate at Layer 1." }
    ]
  }),

  q(1023, 1, 2, ["OSI", "Hardware"], {
    variants: [
      "A hub operates at which OSI layer?",
      "Which device is considered 'dumb' because it broadcasts data out every port?"
    ],
    answerOptions: [
      { variants: ["Layer 1"], correct: true, explanation: "Hubs are physical repeaters with no logic; they operate at Layer 1." },
      { variants: ["Layer 2"], correct: false, explanation: "Switches operate at Layer 2." },
      { variants: ["Layer 3"], correct: false, explanation: "Routers operate at Layer 3." },
      { variants: ["Layer 4"], correct: false, explanation: "No standard device operates ONLY at Layer 4." }
    ]
  }),

  q(1024, 1, 2, ["TCP/IP", "Model"], {
    variants: [
      "Which layer of the TCP/IP model corresponds to the OSI Physical and Data Link layers?",
      "In the 4-layer TCP/IP model, where do hardware and framing reside?"
    ],
    answerOptions: [
      { variants: ["Network Interface", "Link Layer"], correct: true, explanation: "The Network Interface (or Link) layer covers OSI Layers 1 and 2." },
      { variants: ["Internet"], correct: false, explanation: "Internet layer matches OSI Layer 3." },
      { variants: ["Transport"], correct: false, explanation: "Transport layer matches OSI Layer 4." },
      { variants: ["Application"], correct: false, explanation: "Application layer matches OSI Layers 5, 6, and 7." }
    ]
  }),

  q(1025, 1, 2, ["OSI", "Encapsulation"], {
    variants: [
      "The process of adding headers and trailers to data as it moves down the OSI stack is called:",
      "When data goes from Layer 7 to Layer 1, what happens to it?"
    ],
    answerOptions: [
      { variants: ["Encapsulation"], correct: true, explanation: "Encapsulation wraps data in protocol headers." },
      { variants: ["Decapsulation"], correct: false, explanation: "Decapsulation happens when data moves UP the stack (receiving)." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption is a security function, not the structural wrapping of data." },
      { variants: ["Segmentation"], correct: false, explanation: "Segmentation is just what happens at Layer 4." }
    ]
  }),

  // --- TOPIC: Cabling & Connectors (Questions 1026-1045) ---

  q(1026, 1, 3, ["Cabling", "Standard"], {
    variants: [
      "When wiring an RJ-45 connector using T568B, what is the color of the first pin?",
      "An [admin] inspects a cable end. The first wire is White-Orange. Which standard is this?"
    ],
    answerOptions: [
      { variants: ["White-Orange", "T568B"], correct: true, explanation: "T568B starts with White-Orange, Orange, White-Green..." },
      { variants: ["White-Green", "T568A"], correct: false, explanation: "T568A starts with White-Green." },
      { variants: ["Orange"], correct: false, explanation: "Orange is pin 2 in T568B." },
      { variants: ["Blue"], correct: false, explanation: "Blue is pin 4 in both standards." }
    ]
  }),

  q(1027, 1, 3, ["Cabling", "Speed"], {
    variants: [
      "What is the maximum supported speed for Cat5e cable?",
      "To support Gigabit Ethernet (1000 Mbps), what is the minimum category of copper cable needed?"
    ],
    answerOptions: [
      { variants: ["1 Gbps", "1000 Mbps"], correct: true, explanation: "Cat5e is rated for 1 Gbps up to 100 meters." },
      { variants: ["100 Mbps"], correct: false, explanation: "Cat5 (non-e) was 100 Mbps." },
      { variants: ["10 Gbps"], correct: false, explanation: "Cat6/6a are needed for 10 Gbps." },
      { variants: ["40 Gbps"], correct: false, explanation: "40 Gbps requires Cat8 or Fiber." }
    ]
  }),

  q(1028, 1, 3, ["Cabling", "Speed"], {
    variants: [
      "What is the maximum distance for Cat6 cable running at 10 Gbps?",
      "An [admin] needs 10Gbps speed. At what length must they switch from Cat6 to Cat6a?"
    ],
    answerOptions: [
      { variants: ["55 meters"], correct: true, explanation: "Cat6 supports 10GBASE-T only up to 55m. Beyond that, it drops to 1G." },
      { variants: ["100 meters"], correct: false, explanation: "100 meters is the max for Cat6a at 10Gbps." },
      { variants: ["30 meters"], correct: false, explanation: "Too short." },
      { variants: ["90 meters"], correct: false, explanation: "Cat6 can do 1G at 90m (plus 10m patch), but not 10G." }
    ]
  }),

  q(1029, 1, 3, ["Cabling", "Plenum"], {
    variants: [
      "Which cable rating is required for cables run in drop ceilings used for air return?",
      "An [admin] is wiring above the ceiling tiles in an office. To comply with fire codes, what cable type must be used?"
    ],
    answerOptions: [
      { variants: ["Plenum", "CMP"], correct: true, explanation: "Plenum cables have special low-smoke, fire-retardant jackets for air handling spaces." },
      { variants: ["Riser", "CMR"], correct: false, explanation: "Riser is for vertical runs between floors, not air plenums." },
      { variants: ["PVC", "CM"], correct: false, explanation: "PVC cables release toxic fumes when burned." },
      { variants: ["Shielded"], correct: false, explanation: "Shielding protects against EMI, not fire." }
    ]
  }),

  q(1030, 1, 3, ["Fiber", "Mode"], {
    variants: [
      "Which fiber type uses a laser light source and has a very small core?",
      "For a 10km link between buildings, which fiber type is required?"
    ],
    answerOptions: [
      { variants: ["Single-Mode", "SMF"], correct: true, explanation: "Single-Mode fiber (SMF) uses lasers and a small core (9 microns) for long distance." },
      { variants: ["Multi-Mode", "MMF"], correct: false, explanation: "Multi-Mode uses LEDs and a larger core, suitable only for short distances." },
      { variants: ["Coaxial"], correct: false, explanation: "Coaxial is copper, not fiber." },
      { variants: ["STP"], correct: false, explanation: "STP is Shielded Twisted Pair (copper)." }
    ]
  }),

  q(1031, 1, 3, ["Fiber", "Mode"], {
    variants: [
      "Which fiber type uses LEDs and is typically used for short distances within a data center?",
      "An [admin] connects servers within the same rack using fiber. Which type is most cost-effective?"
    ],
    answerOptions: [
      { variants: ["Multi-Mode", "MMF"], correct: true, explanation: "Multi-Mode (MMF) is cheaper and uses LEDs, perfect for short runs." },
      { variants: ["Single-Mode", "SMF"], correct: false, explanation: "Single-Mode is more expensive and meant for long haul." },
      { variants: ["Cat6a"], correct: false, explanation: "Cat6a is copper." },
      { variants: ["Plenum"], correct: false, explanation: "Plenum is a fire rating, not a fiber mode." }
    ]
  }),

  q(1032, 1, 3, ["Connector", "Copper"], {
    variants: [
      "Which connector type is standard for Ethernet twisted-pair cables?",
      "What type of plug do you crimp onto a Cat6 cable?"
    ],
    answerOptions: [
      { variants: ["RJ-45", "8P8C"], correct: true, explanation: "RJ-45 (8P8C) is the standard Ethernet connector." },
      { variants: ["RJ-11"], correct: false, explanation: "RJ-11 is for telephone lines." },
      { variants: ["BNC"], correct: false, explanation: "BNC is for coaxial cable." },
      { variants: ["LC"], correct: false, explanation: "LC is a fiber connector." }
    ]
  }),

  q(1033, 1, 3, ["Connector", "Fiber"], {
    variants: [
      "Which fiber connector is square-shaped and snaps into place?",
      "An [admin] identifies a large, square push-pull connector on the fiber patch panel. What is it?"
    ],
    answerOptions: [
      { variants: ["SC", "Subscriber Connector"], correct: true, explanation: "SC connectors are square and use a push-pull mechanism." },
      { variants: ["ST"], correct: false, explanation: "ST connectors are round and twist-lock (like a BNC)." },
      { variants: ["LC"], correct: false, explanation: "LC connectors are small and have a locking tab (like RJ-45)." },
      { variants: ["MTRJ"], correct: false, explanation: "MTRJ looks like a small RJ-45 with two fibers." }
    ]
  }),

  q(1034, 1, 3, ["Connector", "Fiber"], {
    variants: [
      "Which fiber connector is a small form factor (SFF) connector with a locking tab?",
      "High-density switches often use this small fiber connector that looks like a mini RJ-45:"
    ],
    answerOptions: [
      { variants: ["LC", "Lucent Connector"], correct: true, explanation: "LC is the most common SFF connector in modern data centers." },
      { variants: ["SC"], correct: false, explanation: "SC is larger and square." },
      { variants: ["ST"], correct: false, explanation: "ST is round." },
      { variants: ["FC"], correct: false, explanation: "FC is a screw-on connector." }
    ]
  }),

  q(1035, 1, 3, ["Tools", "Cable"], {
    variants: [
      "Which tool is used to attach an RJ-45 connector to the end of a raw cable?",
      "An [admin] needs to make a patch cable. What tool do they need?"
    ],
    answerOptions: [
      { variants: ["Crimper", "Crimping Tool"], correct: true, explanation: "A crimper presses the metal pins of the connector into the wires." },
      { variants: ["Punchdown Tool"], correct: false, explanation: "Punchdown tools are used for patch panels and wall jacks, not plugs." },
      { variants: ["Stripper"], correct: false, explanation: "Strippers remove the jacket but don't attach the connector." },
      { variants: ["TDR"], correct: false, explanation: "TDR tests the cable, it doesn't make it." }
    ]
  }),

  q(1036, 1, 3, ["Tools", "Cable"], {
    variants: [
      "Which tool is used to terminate wires into a 110-block patch panel?",
      "An [admin] is wiring a wall jack. What tool forces the wire into the IDC slots?"
    ],
    answerOptions: [
      { variants: ["Punchdown Tool"], correct: true, explanation: "A punchdown tool pushes the wire into the insulation displacement connector (IDC) and cuts off the excess." },
      { variants: ["Crimper"], correct: false, explanation: "Crimpers are for RJ-45 plugs." },
      { variants: ["Snips"], correct: false, explanation: "Snips cut wire but don't terminate it properly into a block." },
      { variants: ["Tone Probe"], correct: false, explanation: "Tone probes find cables." }
    ]
  }),

  q(1037, 1, 3, ["Tools", "Testing"], {
    variants: [
      "Which tool helps locate a specific cable in a messy bundle by emitting a sound?",
      "An [admin] can't find the other end of a cable in the ceiling. What tool helps?"
    ],
    answerOptions: [
      { variants: ["Tone Generator and Probe", "Fox and Hound"], correct: true, explanation: "The generator sends a signal (tone) down the wire, and the probe detects it." },
      { variants: ["Cable Tester"], correct: false, explanation: "Cable testers check continuity." },
      { variants: ["TDR"], correct: false, explanation: "TDR measures length." },
      { variants: ["Multimeter"], correct: false, explanation: "Multimeters check voltage." }
    ]
  }),

  q(1038, 1, 3, ["Tools", "Testing"], {
    variants: [
      "Which tool checks for correct pinouts (continuity) on an Ethernet cable?",
      "After crimping a cable, which device confirms that pin 1 goes to pin 1?"
    ],
    answerOptions: [
      { variants: ["Cable Tester", "Wiremap Tester"], correct: true, explanation: "A wiremap tester verifies that all wires are connected in the correct order." },
      { variants: ["TDR"], correct: false, explanation: "TDR finds the distance to a fault." },
      { variants: ["Certifier"], correct: false, explanation: "Certifiers check speed/quality (more advanced than simple map)." },
      { variants: ["Loopback Plug"], correct: false, explanation: "Loopback plugs test the NIC port, not the cable." }
    ]
  }),

  q(1039, 1, 3, ["Tools", "Testing"], {
    variants: [
      "Which tool can measure the length of a cable and locate a break in the wire?",
      "An [admin] suspects a cable is cut halfway down the hall. Which tool confirms this?"
    ],
    answerOptions: [
      { variants: ["TDR", "Time Domain Reflectometer"], correct: true, explanation: "TDR sends a pulse and times the reflection to calculate distance to a fault." },
      { variants: ["OTDR"], correct: false, explanation: "OTDR is for Fiber, not copper (usually)." },
      { variants: ["Multimeter"], correct: false, explanation: "Multimeters generally don't measure length." },
      { variants: ["Tone Probe"], correct: false, explanation: "Tone probes find the cable, but don't measure it." }
    ]
  }),

  q(1040, 1, 3, ["Coaxial", "Media"], {
    variants: [
      "Which connector is typically used with RG-6 coaxial cable for cable modems?",
      "The cable screw-on connector found on a TV or Cable Modem is called:"
    ],
    answerOptions: [
      { variants: ["F-Type"], correct: true, explanation: "F-Type connectors are the threaded connectors used for cable TV and modems." },
      { variants: ["BNC"], correct: false, explanation: "BNC is a twist-lock connector used in older networks or video." },
      { variants: ["RJ-45"], correct: false, explanation: "RJ-45 is for Ethernet." },
      { variants: ["ST"], correct: false, explanation: "ST is for Fiber." }
    ]
  }),

  q(1041, 1, 3, ["Ethernet", "Speed"], {
    variants: [
      "Which twisted-pair standard supports 10 Gbps up to 100 meters?",
      "To future-proof a new building for 10 Gigabit Ethernet on copper, the [admin] should install:",
      "Cat6 supports 10G up to 55m. Which cable supports 10G up to 100m?"
    ],
    answerOptions: [
      { variants: ["Cat6a"], correct: true, explanation: "Cat6a (Augmented) reduces crosstalk and supports 10 Gbps at the full 100-meter distance." },
      { variants: ["Cat6"], correct: false, explanation: "Cat6 only supports 10G up to 55 meters." },
      { variants: ["Cat5e"], correct: false, explanation: "Cat5e maxes out at 1 Gbps." },
      { variants: ["Cat8"], correct: false, explanation: "Cat8 is for data centers (very short distance), Cat6a is standard for building runs." }
    ]
  }),

  q(1042, 1, 3, ["Hardware", "Transceiver"], {
    variants: [
      "Which transceiver form factor is most commonly used for 10 Gbps fiber uplinks on modern switches?",
      "An [admin] needs to connect two switches at 10Gb speed using fiber. Which module fits in the slot?",
      "SFP supports 1Gbps. ________ supports 10Gbps."
    ],
    answerOptions: [
      { variants: ["SFP+", "Small Form-factor Pluggable Plus"], correct: true, explanation: "SFP+ is the industry standard for 10Gbps fiber uplinks." },
      { variants: ["SFP"], correct: false, explanation: "SFP is 1Gbps." },
      { variants: ["GBIC"], correct: false, explanation: "GBIC is legacy/large." },
      { variants: ["QSFP"], correct: false, explanation: "QSFP is 40Gbps+." }
    ]
  }),

  q(1043, 1, 2, ["Addressing", "MAC"], {
    variants: [
      "A MAC address is how many bits long?",
      "The physical address burned into a NIC is represented by how many bits?",
      "48-bit hexadecimal addresses are known as:"
    ],
    answerOptions: [
      { variants: ["48 bits"], correct: true, explanation: "MAC addresses are 48 bits (6 bytes), typically written in Hex." },
      { variants: ["32 bits"], correct: false, explanation: "IPv4 is 32 bits." },
      { variants: ["64 bits"], correct: false, explanation: "IPv6 host portions are often 64 bits." },
      { variants: ["128 bits"], correct: false, explanation: "IPv6 addresses are 128 bits." }
    ]
  }),

  q(1044, 1, 2, ["Addressing", "OUI"], {
    variants: [
      "The first 24 bits of a MAC address identify the manufacturer. This is called the:",
      "To identify if a [device] is made by Apple or Dell based on its MAC, look at the:",
      "OUI stands for:"
    ],
    answerOptions: [
      { variants: ["OUI", "Organizationally Unique Identifier"], correct: true, explanation: "The OUI is assigned to vendors by the IEEE and makes up the first half of the MAC address." },
      { variants: ["EUI-64"], correct: false, explanation: "EUI-64 is an IPv6 formatting method." },
      { variants: ["NIC ID"], correct: false, explanation: "The last 24 bits are the unique NIC ID." },
      { variants: ["IP Prefix"], correct: false, explanation: "Prefix is Layer 3." }
    ]
  }),

  q(1045, 1, 2, ["Protocol", "ARP"], {
    variants: [
      "Which protocol resolves a known IPv4 address to an unknown MAC address?",
      "When a [device] knows the destination IP but needs the hardware address to build the frame, it sends an:",
      "An [admin] sees broadcast packets asking 'Who has 192.168.1.5?'. This is:"
    ],
    answerOptions: [
      { variants: ["ARP", "Address Resolution Protocol"], correct: true, explanation: "ARP broadcasts a request to find the MAC address associated with a specific IP." },
      { variants: ["DNS"], correct: false, explanation: "DNS resolves Hostnames to IPs." },
      { variants: ["DHCP"], correct: false, explanation: "DHCP assigns IPs." },
      { variants: ["RARP"], correct: false, explanation: "RARP resolves MAC to IP (legacy)." }
    ]
  }),

  q(1046, 1, 2, ["Protocol", "ICMP"], {
    variants: [
      "Which protocol is primarily used for network diagnostics and error reporting (e.g., Ping)?",
      "If a [router] drops a packet because the TTL expired, it sends a message back using:",
      "Echo Request and Echo Reply are message types of:"
    ],
    answerOptions: [
      { variants: ["ICMP", "Internet Control Message Protocol"], correct: true, explanation: "ICMP is the maintenance protocol of the IP suite, handling errors and diagnostics." },
      { variants: ["TCP"], correct: false, explanation: "TCP carries data." },
      { variants: ["UDP"], correct: false, explanation: "UDP carries data." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is management." }
    ]
  }),

  q(1047, 1, 2, ["Traffic", "Cast Types"], {
    variants: [
      "Which traffic type sends data from one sender to multiple specific recipients (a group)?",
      "Video streaming to subscribed users on a network typically uses:",
      "One-to-Many communication is called:"
    ],
    answerOptions: [
      { variants: ["Multicast"], correct: true, explanation: "Multicast sends data once, and network devices replicate it only to subscribed group members." },
      { variants: ["Broadcast"], correct: false, explanation: "Broadcast sends to EVERYONE." },
      { variants: ["Unicast"], correct: false, explanation: "Unicast sends to ONE destination." },
      { variants: ["Anycast"], correct: false, explanation: "Anycast sends to the NEAREST destination." }
    ]
  }),

  q(1048, 1, 2, ["Traffic", "Cast Types"], {
    variants: [
      "Which traffic type sends data from one sender to every device on the local subnet?",
      "ARP Requests are sent as:",
      "One-to-All communication is called:"
    ],
    answerOptions: [
      { variants: ["Broadcast"], correct: true, explanation: "Broadcast traffic (Destination IP 255.255.255.255 or MAC FF:FF:FF:FF:FF:FF) goes to all nodes." },
      { variants: ["Multicast"], correct: false, explanation: "Multicast goes to a specific group." },
      { variants: ["Unicast"], correct: false, explanation: "Unicast goes to one node." },
      { variants: ["Simulcast"], correct: false, explanation: "Not a standard networking term." }
    ]
  }),

  q(1049, 1, 4, ["Subnetting", "CIDR"], {
    variants: [
      "What is the CIDR notation for a subnet mask of 255.255.255.0?",
      "A standard Class C network uses which prefix length?",
      "If the first 24 bits are the network, the notation is:"
    ],
    answerOptions: [
      { variants: ["/24"], correct: true, explanation: "255.255.255.0 means 24 bits are set to '1' (8+8+8)." },
      { variants: ["/8"], correct: false, explanation: "255.0.0.0." },
      { variants: ["/16"], correct: false, explanation: "255.255.0.0." },
      { variants: ["/32"], correct: false, explanation: "255.255.255.255 (Host route)." }
    ]
  }),

  q(1050, 1, 4, ["IPv4", "Classes"], {
    variants: [
      "Which IPv4 class does the address 10.1.1.1 belong to?",
      "An address starting with 126.x.x.x is in which class?"
    ],
    answerOptions: [
      { variants: ["Class A"], correct: true, explanation: "Class A is 1.0.0.0 to 126.0.0.0." },
      { variants: ["Class B"], correct: false, explanation: "Class B is 128-191." },
      { variants: ["Class C"], correct: false, explanation: "Class C is 192-223." },
      { variants: ["Class D"], correct: false, explanation: "Class D is Multicast (224-239)." }
    ]
  }),

  q(1051, 1, 4, ["IPv4", "Classes"], {
    variants: [
      "What is the default subnet mask for a Class C address?",
      "If you see an address 192.168.1.1, what is the standard mask?"
    ],
    answerOptions: [
      { variants: ["255.255.255.0", "/24"], correct: true, explanation: "Class C defaults to /24." },
      { variants: ["255.0.0.0", "/8"], correct: false, explanation: "Class A default." },
      { variants: ["255.255.0.0", "/16"], correct: false, explanation: "Class B default." },
      { variants: ["255.255.255.255", "/32"], correct: false, explanation: "Host route." }
    ]
  }),

  q(1052, 1, 4, ["IPv4", "Private"], {
    variants: [
      "Which of the following is a private IP address (RFC 1918)?",
      "Which address cannot be routed over the public internet?"
    ],
    answerOptions: [
      { variants: ["172.16.5.5"], correct: true, explanation: "172.16.0.0 - 172.31.255.255 is the Private Class B range." },
      { variants: ["172.32.5.5"], correct: false, explanation: "172.32 is public." },
      { variants: ["8.8.8.8"], correct: false, explanation: "Google DNS (Public)." },
      { variants: ["11.0.0.1"], correct: false, explanation: "11.0.0.0 is public (Class A)." }
    ]
  }),

  q(1053, 1, 4, ["IPv4", "APIPA"], {
    variants: [
      "A [user] reports no internet connectivity. Their IP is 169.254.0.5. What is the issue?",
      "What type of address is automatically assigned when a DHCP server is unreachable?"
    ],
    answerOptions: [
      { variants: ["APIPA", "Link-Local"], correct: true, explanation: "169.254.x.x is an APIPA address, indicating DHCP failure." },
      { variants: ["Static IP"], correct: false, explanation: "Static IPs are manually set." },
      { variants: ["Public IP"], correct: false, explanation: "169.254 is not public." },
      { variants: ["Loopback"], correct: false, explanation: "Loopback is 127.x.x.x." }
    ]
  }),

  q(1054, 1, 4, ["IPv4", "Loopback"], {
    variants: [
      "Which address is used to ping the local NIC to test the driver stack?",
      "What is the IPv4 loopback address?"
    ],
    answerOptions: [
      { variants: ["127.0.0.1"], correct: true, explanation: "127.0.0.1 is the standard loopback address." },
      { variants: ["192.168.1.1"], correct: false, explanation: "Common gateway address." },
      { variants: ["0.0.0.0"], correct: false, explanation: "Default route/unknown address." },
      { variants: ["255.255.255.255"], correct: false, explanation: "Broadcast address." }
    ]
  }),

  q(1055, 1, 4, ["Subnetting", "Calculation"], {
    variants: [
      "How many usable host addresses are in a /24 subnet?",
      "If the mask is 255.255.255.0, how many devices can you connect?"
    ],
    answerOptions: [
      { variants: ["254"], correct: true, explanation: "2^8 = 256. Minus Network ID and Broadcast IP = 254." },
      { variants: ["256"], correct: false, explanation: "Total addresses, not usable." },
      { variants: ["255"], correct: false, explanation: "Incorrect math." },
      { variants: ["65534"], correct: false, explanation: "This is for a /16." }
    ]
  }),

  q(1056, 1, 4, ["Subnetting", "CIDR"], {
    variants: [
      "Which CIDR notation represents a subnet mask of 255.255.255.128?",
      "If you borrow 1 bit from a /24, what is the new prefix?"
    ],
    answerOptions: [
      { variants: ["/25"], correct: true, explanation: "255.255.255.128 uses 25 bits for the network." },
      { variants: ["/26"], correct: false, explanation: "Mask 192." },
      { variants: ["/24"], correct: false, explanation: "Mask 0." },
      { variants: ["/23"], correct: false, explanation: "Supernetting (255.255.254.0)." }
    ]
  }),

  q(1057, 1, 4, ["IPv6", "Addressing"], {
    variants: [
      "How many bits make up an IPv6 address?",
      "Unlike IPv4's 32 bits, IPv6 uses a much larger address space of:",
      "An address represented as 8 groups of 4 hexadecimal characters contains how many bits?"
    ],
    answerOptions: [
      { variants: ["128 bits"], correct: true, explanation: "IPv6 uses 128-bit addresses, providing a virtually infinite number of addresses." },
      { variants: ["64 bits"], correct: false, explanation: "64 bits is often the size of the network prefix, but not the whole address." },
      { variants: ["32 bits"], correct: false, explanation: "32 bits is IPv4." },
      { variants: ["256 bits"], correct: false, explanation: "There is no standard 256-bit IP protocol." }
    ]
  }),

  q(1058, 1, 4, ["IPv6", "Loopback"], {
    variants: [
      "Which IPv6 address is equivalent to the IPv4 loopback address 127.0.0.1?",
      "To ping the local stack on an IPv6-enabled [device], use:",
      "The address `::1` represents:"
    ],
    answerOptions: [
      { variants: ["::1", "Loopback"], correct: true, explanation: "::1 is the standard loopback address in IPv6." },
      { variants: ["::"], correct: false, explanation: ":: represents the unspecified address (0.0.0.0)." },
      { variants: ["FE80::1"], correct: false, explanation: "FE80 is Link-Local." },
      { variants: ["2001::1"], correct: false, explanation: "2000::/3 is Global Unicast." }
    ]
  }),

  q(1059, 1, 4, ["IPv6", "Types"], {
    variants: [
      "Which IPv6 prefix indicates a Link-Local address that is not routable?",
      "An [admin] sees an IP starting with `fe80::` on a workstation. This is a:",
      "Which address type is required on every IPv6 interface for neighbor discovery?"
    ],
    answerOptions: [
      { variants: ["Link-Local", "FE80::/10"], correct: true, explanation: "Link-Local addresses (FE80::) are used for local communication and Neighbor Discovery protocols." },
      { variants: ["Global Unicast"], correct: false, explanation: "Global Unicast starts with 2000::/3." },
      { variants: ["Unique Local"], correct: false, explanation: "Unique Local starts with FC00::/7." },
      { variants: ["Multicast"], correct: false, explanation: "Multicast starts with FF00::/8." }
    ]
  }),

  q(1060, 1, 4, ["IPv6", "Types"], {
    variants: [
      "Which IPv6 communication type replaces IPv4 Broadcasts?",
      "To send a packet to a group of devices (e.g., all routers), IPv6 uses:",
      "IPv6 does not use Broadcast. Instead, it relies heavily on:"
    ],
    answerOptions: [
      { variants: ["Multicast"], correct: true, explanation: "IPv6 phased out Broadcast in favor of Multicast (sending to a subscribed group)." },
      { variants: ["Anycast"], correct: false, explanation: "Anycast sends to the *nearest* node." },
      { variants: ["Unicast"], correct: false, explanation: "Unicast is one-to-one." },
      { variants: ["Broadcast"], correct: false, explanation: "IPv6 does not use Broadcast." }
    ]
  }),

  q(1061, 1, 4, ["IPv6", "Anycast"], {
    variants: [
      "Which IPv6 address type allows multiple [server]s to share the same IP, with the network routing packets to the nearest one?",
      "To implement a distributed DNS service where 8.8.8.8 works globally from the closest datacenter, use:",
      "One-to-Nearest routing is known as:"
    ],
    answerOptions: [
      { variants: ["Anycast"], correct: true, explanation: "Anycast routes traffic to the topologically closest member of a group sharing the same IP." },
      { variants: ["Multicast"], correct: false, explanation: "Multicast sends to ALL members of the group." },
      { variants: ["Unicast"], correct: false, explanation: "Unicast targets a specific single device." },
      { variants: ["Broadcast"], correct: false, explanation: "Broadcast sends to everyone on the subnet." }
    ]
  }),

  q(1062, 1, 3, ["Tools", "Cable"], {
    variants: [
      "Which tool validates that a [cable] is wired correctly according to T568B pinouts?",
      "An [admin] suspects a 'Split Pair' or 'Crossed Pair' fault. Which tool confirms this?",
      "To verify continuity and correct wire mapping, use a:"
    ],
    answerOptions: [
      { variants: ["Wiremap Tester", "Cable Tester"], correct: true, explanation: "A wiremap tester checks for continuity, shorts, opens, and crossed pairs." },
      { variants: ["Tone Generator"], correct: false, explanation: "Tone generators locate the cable." },
      { variants: ["TDR"], correct: false, explanation: "TDR measures length." },
      { variants: ["Multimeter"], correct: false, explanation: "Multimeters measure voltage/resistance." }
    ]
  }),

  q(1063, 1, 3, ["Tools", "TDR"], {
    variants: [
      "Which tool sends a signal down a cable and measures the time it takes to reflect back to find a break?",
      "To find exactly how many meters down the wall a cable was cut, use a:",
      "An OTDR is for fiber; a ________ is for copper."
    ],
    answerOptions: [
      { variants: ["Time Domain Reflectometer (TDR)"], correct: true, explanation: "TDRs detect faults and measure cable length by timing signal reflections." },
      { variants: ["Wiremap"], correct: false, explanation: "Wiremap checks pinouts." },
      { variants: ["Spectrum Analyzer"], correct: false, explanation: "Spectrum analyzers check wireless frequencies." },
      { variants: ["Loopback Plug"], correct: false, explanation: "Loopback tests the port." }
    ]
  }),

  q(1064, 1, 1, ["Virtualization", "Switching"], {
    variants: [
      "Which software component allows Virtual Machines (VMs) to communicate with each other and the physical network?",
      "Inside a hypervisor, the [admin] configures a ________ to bridge VMs to the physical NIC.",
      "VMware vSwitch and Hyper-V Virtual Switch act as Layer 2:"
    ],
    answerOptions: [
      { variants: ["Virtual Switch", "vSwitch"], correct: true, explanation: "A virtual switch handles Layer 2 traffic between VMs and the physical uplink." },
      { variants: ["Virtual Router"], correct: false, explanation: "Virtual routers handle Layer 3." },
      { variants: ["Virtual NIC"], correct: false, explanation: "The vNIC is on the VM itself." },
      { variants: ["Container"], correct: false, explanation: "Container is an app isolation method." }
    ]
  }),

  q(1065, 1, 4, ["Storage", "NAS"], {
    variants: [
      "Which storage protocol is standard for accessing files on a NAS from a Linux client?",
      "To share files between Unix systems over the network, use:",
      "An [admin] mounts a remote directory using port 2049. Which protocol is this?"
    ],
    answerOptions: [
      { variants: ["NFS", "Network File System"], correct: true, explanation: "NFS is the standard file-level sharing protocol for Linux/Unix systems." },
      { variants: ["SMB"], correct: false, explanation: "SMB (CIFS) is the standard for Windows." },
      { variants: ["iSCSI"], correct: false, explanation: "iSCSI is block-level." },
      { variants: ["FTP"], correct: false, explanation: "FTP is for file transfer, not mounting shares." }
    ]
  }),

  q(1066, 1, 4, ["Storage", "SAN"], {
    variants: [
      "Which storage protocol encapsulates SCSI commands over standard TCP/IP networks?",
      "To build a SAN without buying expensive Fibre Channel switches, an [admin] can use:",
      "Connecting a server to a storage array over Ethernet as a block device uses:"
    ],
    answerOptions: [
      { variants: ["iSCSI", "Internet Small Computer Systems Interface"], correct: true, explanation: "iSCSI allows block-level storage commands to run over standard IP networks." },
      { variants: ["Fibre Channel"], correct: false, explanation: "Fibre Channel requires specialized hardware." },
      { variants: ["NFS"], correct: false, explanation: "NFS is file-level." },
      { variants: ["SMB"], correct: false, explanation: "SMB is file-level." }
    ]
  }),

  q(1067, 1, 4, ["Storage", "Jumbo"], {
    variants: [
      "To improve efficiency on a SAN, an [admin] increases the MTU to 9000. This is called:",
      "Standard Ethernet frames are 1500 bytes. Larger frames used for storage performance are:",
      "Enabling ________ reduces CPU overhead for iSCSI traffic."
    ],
    answerOptions: [
      { variants: ["Jumbo Frames"], correct: true, explanation: "Jumbo Frames (MTU 9000) allow more data per packet, reducing header overhead for storage." },
      { variants: ["Giant Frames"], correct: false, explanation: "Giant usually refers to errors (>1518 bytes without Jumbo config)." },
      { variants: ["Runt Frames"], correct: false, explanation: "Runts are too small (<64 bytes)." },
      { variants: ["Baby Giants"], correct: false, explanation: "Baby giants are slightly larger than 1500 (e.g. QinQ)." }
    ]
  }),

  q(1068, 1, 3, ["Services", "DNS Records"], {
    variants: [
      "Which DNS record maps a Hostname to an IPv6 address?",
      "To ensure [server] is reachable via IPv6, the [admin] creates which record?",
      "An 'A' record is for IPv4. An '________' record is for IPv6."
    ],
    answerOptions: [
      { variants: ["AAAA", "Quad A"], correct: true, explanation: "AAAA records map hostnames to 128-bit IPv6 addresses." },
      { variants: ["A"], correct: false, explanation: "A records are for IPv4." },
      { variants: ["CNAME"], correct: false, explanation: "CNAME is an alias." },
      { variants: ["PTR"], correct: false, explanation: "PTR is reverse lookup." }
    ]
  }),

  q(1069, 1, 3, ["Services", "DNS TXT"], {
    variants: [
      "Which DNS record type is commonly used for verification (SPF, DKIM) and proving domain ownership?",
      "An [admin] needs to add a string of text to the DNS zone to verify ownership for Google Workspace. Use a:",
      "SPF records are stored within which DNS record type?"
    ],
    answerOptions: [
      { variants: ["TXT", "Text Record"], correct: true, explanation: "TXT records hold arbitrary text and are standard for SPF, DKIM, and ownership verification." },
      { variants: ["MX"], correct: false, explanation: "MX is for mail routing." },
      { variants: ["SRV"], correct: false, explanation: "SRV is for service location." },
      { variants: ["NS"], correct: false, explanation: "NS is for nameservers." }
    ]
  }),

  q(1070, 1, 2, ["Ports", "Web"], {
    variants: [
      "Which port does HTTPS use by default?",
      "An [admin] needs to open the firewall for secure web traffic. Which port is this?"
    ],
    answerOptions: [
      { variants: ["443"], correct: true, explanation: "HTTPS uses TCP 443." },
      { variants: ["80"], correct: false, explanation: "HTTP uses 80." },
      { variants: ["8080"], correct: false, explanation: "Common proxy port." },
      { variants: ["22"], correct: false, explanation: "SSH uses 22." }
    ]
  }),

  q(1071, 1, 2, ["Ports", "Remote"], {
    variants: [
      "Which secure protocol replaces Telnet for remote administration?",
      "Which protocol runs on port 22?"
    ],
    answerOptions: [
      { variants: ["SSH", "Secure Shell"], correct: true, explanation: "SSH is the encrypted replacement for Telnet, running on port 22." },
      { variants: ["RDP"], correct: false, explanation: "RDP is for GUI access (3389)." },
      { variants: ["FTP"], correct: false, explanation: "FTP is for file transfer (20/21)." },
      { variants: ["Telnet"], correct: false, explanation: "Telnet is insecure (port 23)." }
    ]
  }),

  q(1072, 1, 2, ["Ports", "Email"], {
    variants: [
      "Which protocol is used to SEND email from a client to a server?",
      "Port 25 is associated with which protocol?"
    ],
    answerOptions: [
      { variants: ["SMTP"], correct: true, explanation: "Simple Mail Transfer Protocol sends email." },
      { variants: ["POP3"], correct: false, explanation: "POP3 retrieves email." },
      { variants: ["IMAP"], correct: false, explanation: "IMAP retrieves email." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is for network management." }
    ]
  }),

  q(1073, 1, 2, ["Ports", "Files"], {
    variants: [
      "Which port does SMB (Server Message Block) use?",
      "Windows File Sharing relies on which port?"
    ],
    answerOptions: [
      { variants: ["445"], correct: true, explanation: "Modern SMB uses TCP 445." },
      { variants: ["139"], correct: false, explanation: "Legacy NetBIOS/SMB." },
      { variants: ["21"], correct: false, explanation: "FTP." },
      { variants: ["3389"], correct: false, explanation: "RDP." }
    ]
  }),

  q(1074, 1, 2, ["Ports", "DNS"], {
    variants: [
      "Which protocol translates domain names to IP addresses?",
      "Which service listens on port 53?"
    ],
    answerOptions: [
      { variants: ["DNS"], correct: true, explanation: "Domain Name System uses Port 53." },
      { variants: ["DHCP"], correct: false, explanation: "DHCP uses 67/68." },
      { variants: ["ARP"], correct: false, explanation: "ARP maps IP to MAC (Layer 2)." },
      { variants: ["NTP"], correct: false, explanation: "NTP uses 123." }
    ]
  }),

  q(1075, 1, 2, ["Ports", "DHCP"], {
    variants: [
      "Which ports are used by DHCP?",
      "The DORA process uses which UDP ports?"
    ],
    answerOptions: [
      { variants: ["67 and 68"], correct: true, explanation: "DHCP Server uses 67, Client uses 68." },
      { variants: ["20 and 21"], correct: false, explanation: "FTP." },
      { variants: ["80 and 443"], correct: false, explanation: "Web." },
      { variants: ["137 and 138"], correct: false, explanation: "NetBIOS." }
    ]
  }),

  q(1076, 1, 2, ["Ports", "RDP"], {
    variants: [
      "Which port allows a user to access a Windows desktop remotely via GUI?",
      "RDP uses which port?"
    ],
    answerOptions: [
      { variants: ["3389"], correct: true, explanation: "Remote Desktop Protocol uses 3389." },
      { variants: ["22"], correct: false, explanation: "SSH (CLI)." },
      { variants: ["23"], correct: false, explanation: "Telnet (CLI)." },
      { variants: ["5900"], correct: false, explanation: "VNC." }
    ]
  }),
  
  q(1077, 1, 5, ["Cloud", "Models"], {
    variants: [
      "Which cloud model provides the [user] with a fully managed application, like Gmail or Salesforce, where they manage no underlying hardware?",
      "An organization subscribes to a CRM software hosted entirely by a vendor. Which cloud service model is this?",
      "In which model does the provider manage everything from the networking up to the application code?"
    ],
    answerOptions: [
      { variants: ["SaaS", "Software as a Service"], correct: true, explanation: "SaaS provides a complete, usable application where the consumer manages nothing but their own settings." },
      { variants: ["IaaS", "Infrastructure as a Service"], correct: false, explanation: "IaaS provides raw compute/storage; you manage the OS." },
      { variants: ["PaaS", "Platform as a Service"], correct: false, explanation: "PaaS provides a dev platform; you manage the code." },
      { variants: ["DaaS", "Desktop as a Service"], correct: false, explanation: "DaaS provides a full virtual desktop." }
    ]
  }),

  q(1078, 1, 5, ["Cloud", "Models"], {
    variants: [
      "An [admin] needs to deploy a custom database but wants the cloud provider to manage the OS and patching. Which model fits best?",
      "Which cloud model is primarily targeted at developers who need a framework to build apps without worrying about the OS?",
      "Azure SQL and Google App Engine are examples of which service model?"
    ],
    answerOptions: [
      { variants: ["PaaS", "Platform as a Service"], correct: true, explanation: "PaaS abstracts the OS and hardware, letting you focus on deployment and code." },
      { variants: ["SaaS"], correct: false, explanation: "SaaS is a finished product." },
      { variants: ["IaaS"], correct: false, explanation: "IaaS requires you to patch the OS." },
      { variants: ["XaaS"], correct: false, explanation: "XaaS is a catch-all term." }
    ]
  }),

  q(1079, 1, 5, ["Cloud", "Models"], {
    variants: [
      "Which cloud model gives the [admin] the most control, essentially acting as a virtual data center?",
      "Amazon EC2, where you rent a virtual machine and install your own OS, is an example of:",
      "If you need to migrate a legacy server to the cloud and keep the exact same OS configuration, which model do you choose?"
    ],
    answerOptions: [
      { variants: ["IaaS", "Infrastructure as a Service"], correct: true, explanation: "IaaS offers raw virtual hardware (compute, storage, net); you manage the OS up." },
      { variants: ["PaaS"], correct: false, explanation: "PaaS hides the OS." },
      { variants: ["SaaS"], correct: false, explanation: "SaaS hides everything." },
      { variants: ["Serverless"], correct: false, explanation: "Serverless (FaaS) hides the server concept entirely." }
    ]
  }),

  q(1080, 1, 3, ["Services", "DHCP"], {
    variants: [
      "In the DHCP 'DORA' process, which is the first packet sent by the client?",
      "When a [device] first joins a network and needs an IP, what type of broadcast does it send?",
      "To find a DHCP server, a client sends a:"
    ],
    answerOptions: [
      { variants: ["DHCPDISCOVER", "Discover"], correct: true, explanation: "The client broadcasts a DISCOVER packet to find any available servers." },
      { variants: ["DHCPOFFER"], correct: false, explanation: "The server sends the OFFER." },
      { variants: ["DHCPREQUEST"], correct: false, explanation: "The client sends REQUEST after receiving an offer." },
      { variants: ["DHCPACK"], correct: false, explanation: "The server sends ACK to finalize the lease." }
    ]
  }),

  q(1081, 1, 3, ["Services", "DNS"], {
    variants: [
      "Which DNS record type is used to map an IPv4 address to a hostname (Reverse Lookup)?",
      "An [admin] is troubleshooting an email server that is being rejected by spam filters due to a missing reverse DNS entry. Which record is missing?",
      "What record does a 'dig -x' command look for?"
    ],
    answerOptions: [
      { variants: ["PTR", "Pointer Record"], correct: true, explanation: "PTR records map an IP address back to a hostname (reverse lookup)." },
      { variants: ["A"], correct: false, explanation: "A records map Hostname -> IPv4." },
      { variants: ["AAAA"], correct: false, explanation: "AAAA records map Hostname -> IPv6." },
      { variants: ["CNAME"], correct: false, explanation: "CNAME maps Alias -> Canonical Name." }
    ]
  }),

  q(1082, 1, 3, ["Services", "DNS"], {
    variants: [
      "Which DNS record creates an alias for an existing hostname?",
      "You want 'www.example.com' to point to 'server1.example.com'. Which record do you use?",
      "To map multiple names to the same canonical host without using IP addresses, use:"
    ],
    answerOptions: [
      { variants: ["CNAME", "Canonical Name"], correct: true, explanation: "CNAME records allow one domain name to alias another." },
      { variants: ["A"], correct: false, explanation: "A records map to an IP, not another name." },
      { variants: ["MX"], correct: false, explanation: "MX is for mail servers." },
      { variants: ["NS"], correct: false, explanation: "NS indicates the Name Server." }
    ]
  }),

  q(1083, 1, 3, ["Services", "DNS"], {
    variants: [
      "Which DNS record identifies the mail server responsible for accepting email for a domain?",
      "To ensure [company] receives emails, which record must be configured in the public DNS?",
      "SMTP servers query which record to find where to deliver messages?"
    ],
    answerOptions: [
      { variants: ["MX", "Mail Exchanger"], correct: true, explanation: "MX records specify the mail servers for a domain." },
      { variants: ["TXT"], correct: false, explanation: "TXT is used for SPF/DKIM, but MX is for routing." },
      { variants: ["SRV"], correct: false, explanation: "SRV is for service location (like AD/VoIP)." },
      { variants: ["A"], correct: false, explanation: "A records identify the IP, but MX identifies the *role*." }
    ]
  }),

  q(1084, 1, 1, ["Virtualization", "Switching"], {
    variants: [
      "Which software layer allows multiple operating systems to run simultaneously on a single physical [server]?",
      "What technology manages access to physical hardware for Virtual Machines?",
      "VMware ESXi and Microsoft Hyper-V are examples of a:"
    ],
    answerOptions: [
      { variants: ["Hypervisor"], correct: true, explanation: "A hypervisor abstracts physical hardware, allowing VMs to share resources." },
      { variants: ["Container"], correct: false, explanation: "Containers share the OS kernel; Hypervisors share hardware." },
      { variants: ["VLAN"], correct: false, explanation: "VLANs segment networks." },
      { variants: ["Proxy"], correct: false, explanation: "Proxies relay traffic." }
    ]
  }),

  q(1085, 1, 1, ["Virtualization", "Hardware"], {
    variants: [
      "A 'Type 1' Hypervisor is distinct because it installs:",
      "Which hypervisor type runs directly on the bare-metal hardware without a host operating system?",
      "For a production data center server, which hypervisor architecture provides the best performance?"
    ],
    answerOptions: [
      { variants: ["Bare-Metal", "Directly on Hardware"], correct: true, explanation: "Type 1 (Bare-Metal) hypervisors like ESXi run directly on hardware for max efficiency." },
      { variants: ["On top of an OS", "Hosted"], correct: false, explanation: "This describes Type 2 (Hosted) hypervisors like VirtualBox." },
      { variants: ["Inside a container"], correct: false, explanation: "Incorrect." },
      { variants: ["Without a CPU"], correct: false, explanation: "Impossible." }
    ]
  }),

  q(1086, 1, 4, ["Storage", "Protocols"], {
    variants: [
      "Which storage protocol encapsulates SCSI commands inside standard TCP/IP packets?",
      "An [admin] wants to implement a SAN using existing Ethernet switches. Which protocol allows this?",
      "Which alternative to Fibre Channel is cheaper because it runs on standard network gear?"
    ],
    answerOptions: [
      { variants: ["iSCSI"], correct: true, explanation: "iSCSI transports block-level storage commands over IP networks." },
      { variants: ["Fibre Channel"], correct: false, explanation: "Fibre Channel usually requires dedicated, specialized switches." },
      { variants: ["SMB"], correct: false, explanation: "SMB is file-level (NAS), not block-level." },
      { variants: ["FCoE"], correct: false, explanation: "FCoE requires specialized lossless Ethernet hardware." }
    ]
  }),

  q(1087, 1, 4, ["Storage", "Jumbo"], {
    variants: [
      "To improve performance on an iSCSI SAN, an [admin] enables 'Jumbo Frames'. What is the standard MTU for a Jumbo Frame?",
      "Increasing the MTU from 1500 to 9000 bytes is known as enabling:"
    ],
    answerOptions: [
      { variants: ["9000 bytes"], correct: true, explanation: "Jumbo frames increase the payload to 9000 bytes, reducing CPU overhead." },
      { variants: ["1500 bytes"], correct: false, explanation: "1500 is the standard Ethernet MTU." },
      { variants: ["1518 bytes"], correct: false, explanation: "1518 includes the headers." },
      { variants: ["65535 bytes"], correct: false, explanation: "This is the max IP packet size, not Ethernet MTU." }
    ]
  }),

  q(1088, 1, 1, ["Hardware", "Power"], {
    variants: [
      "Which [device] provides immediate, short-term battery power to a server in the event of a blackout?",
      "To prevent data corruption during a brownout, servers should be connected to a:"
    ],
    answerOptions: [
      { variants: ["UPS", "Uninterruptible Power Supply"], correct: true, explanation: "A UPS provides battery backup to bridge the gap until generators start or power returns." },
      { variants: ["PDU"], correct: false, explanation: "A Power Distribution Unit is just a fancy power strip." },
      { variants: ["Generator"], correct: false, explanation: "Generators take time to start up; they are not immediate." },
      { variants: ["Inverter"], correct: false, explanation: "An inverter converts DC to AC, but is just a component." }
    ]
  }),

  q(1089, 1, 1, ["Physical", "Layout"], {
    variants: [
      "The primary point where external ISP cables enter the building and connect to the internal network is the:",
      "Where would you typically find the main core [switch]es and routers in a large building?"
    ],
    answerOptions: [
      { variants: ["MDF", "Main Distribution Frame"], correct: true, explanation: "The MDF is the primary hub of the network (Demarc point)." },
      { variants: ["IDF", "Intermediate Distribution Frame"], correct: false, explanation: "IDFs are satellite closets connected to the MDF." },
      { variants: ["Demarc"], correct: false, explanation: "Demarc is the specific point of ownership transfer, usually located IN the MDF." },
      { variants: ["66 Block"], correct: false, explanation: "66 blocks are legacy voice termination points." }
    ]
  }),

  q(1090, 1, 2, ["Switching", "VLAN"], {
    variants: [
      "Which standard is used to 'tag' frames so they can carry multiple VLANs across a single link?",
      "To configure a trunk port between two [switch]es, which encapsulation protocol is used?"
    ],
    answerOptions: [
      { variants: ["802.1Q", "Dot1Q"], correct: true, explanation: "802.1Q inserts a 4-byte tag into the frame header to identify the VLAN." },
      { variants: ["802.1X"], correct: false, explanation: "802.1X is for port security/authentication." },
      { variants: ["802.3ad"], correct: false, explanation: "802.3ad is for Link Aggregation (LACP)." },
      { variants: ["ISL"], correct: false, explanation: "ISL is a deprecated Cisco proprietary protocol." }
    ]
  }),

  q(1091, 1, 2, ["Switching", "VLAN"], {
    variants: [
      "On an 802.1Q trunk, traffic that is NOT tagged belongs to which VLAN?",
      "For security, the [native_vlan] should be changed from default VLAN 1. Which concept is this?"
    ],
    localBank: { native_vlan: ["Native VLAN"] },
    answerOptions: [
      { variants: ["Native VLAN"], correct: true, explanation: "The Native VLAN carries untagged traffic on a trunk." },
      { variants: ["Default VLAN"], correct: false, explanation: "Default VLAN usually refers to VLAN 1, but 'Native' specifically refers to tagging behavior." },
      { variants: ["Management VLAN"], correct: false, explanation: "Management VLAN is an administrative concept." },
      { variants: ["Voice VLAN"], correct: false, explanation: "Voice VLANs are tagged for phones." }
    ]
  }),

  q(1092, 1, 2, ["Routing", "Static"], {
    variants: [
      "Which type of route is manually configured by an [admin] and does not change unless manually updated?",
      "A route with an Administrative Distance of 1 is typically a:"
    ],
    answerOptions: [
      { variants: ["Static Route"], correct: true, explanation: "Static routes are hard-coded paths. They are simple but don't adapt to outages." },
      { variants: ["Dynamic Route"], correct: false, explanation: "Dynamic routes are learned via protocols like OSPF." },
      { variants: ["Default Route"], correct: false, explanation: "A default route can be static OR dynamic." },
      { variants: ["Directly Connected"], correct: false, explanation: "Directly connected routes appear automatically (AD 0)." }
    ]
  }),

  q(1093, 1, 2, ["Routing", "Default"], {
    variants: [
      "Which IP route is known as the 'Gateway of Last Resort'?",
      "If a [router] doesn't find a specific match for a packet, where does it send it?"
    ],
    answerOptions: [
      { variants: ["0.0.0.0/0", "Default Route"], correct: true, explanation: "The default route matches everything not matched by a more specific route." },
      { variants: ["127.0.0.1"], correct: false, explanation: "Loopback." },
      { variants: ["255.255.255.255"], correct: false, explanation: "Broadcast." },
      { variants: ["192.168.1.1"], correct: false, explanation: "Common specific gateway IP." }
    ]
  }),

  q(1094, 1, 2, ["Routing", "Dynamic"], {
    variants: [
      "Which routing protocol is considered 'Link-State' and uses the Dijkstra algorithm?",
      "An [admin] chooses a fast-converging protocol for a large enterprise. Which one fits this description?"
    ],
    answerOptions: [
      { variants: ["OSPF", "Open Shortest Path First"], correct: true, explanation: "OSPF is the standard Link-State protocol used in enterprise." },
      { variants: ["RIP"], correct: false, explanation: "RIP is Distance-Vector (legacy)." },
      { variants: ["BGP"], correct: false, explanation: "BGP is Path-Vector (Internet)." },
      { variants: ["EIGRP"], correct: false, explanation: "EIGRP is Advanced Distance-Vector (Cisco)." }
    ]
  }),

  q(1095, 1, 2, ["Routing", "Dynamic"], {
    variants: [
      "Which routing protocol handles routing between Autonomous Systems (AS) on the internet?",
      "If [company] needs to route traffic to two different ISPs, which protocol must they run?"
    ],
    answerOptions: [
      { variants: ["BGP", "Border Gateway Protocol"], correct: true, explanation: "BGP is the protocol of the internet, managing paths between ISPs." },
      { variants: ["OSPF"], correct: false, explanation: "OSPF is for internal (IGP) routing." },
      { variants: ["RIP"], correct: false, explanation: "RIP is too slow for the internet." },
      { variants: ["IS-IS"], correct: false, explanation: "IS-IS is an IGP used by providers internally." }
    ]
  }),

  q(1096, 1, 4, ["Addressing", "Multicast"], {
    variants: [
      "Which IPv4 Class is reserved for Multicast traffic?",
      "An address starting with 224.x.x.x is used for what purpose?"
    ],
    answerOptions: [
      { variants: ["Class D", "Multicast"], correct: true, explanation: "Class D (224-239) is reserved for Multicast groups." },
      { variants: ["Class E"], correct: false, explanation: "Class E is Experimental." },
      { variants: ["Class C"], correct: false, explanation: "Class C is Unicast." },
      { variants: ["Class A"], correct: false, explanation: "Class A is Unicast." }
    ]
  }),

  q(1097, 1, 4, ["Addressing", "Broadcast"], {
    variants: [
      "Which IP address is the Layer 3 Limited Broadcast address?",
      "A packet sent to which address will be received by all hosts on the local subnet?"
    ],
    answerOptions: [
      { variants: ["255.255.255.255"], correct: true, explanation: "255.255.255.255 targets all hosts on the local network segment." },
      { variants: ["0.0.0.0"], correct: false, explanation: "This means 'this network' or default route." },
      { variants: ["192.168.1.255"], correct: false, explanation: "This is a Directed Broadcast for a specific subnet." },
      { variants: ["224.0.0.1"], correct: false, explanation: "This is the Multicast 'All Nodes' address." }
    ]
  }),

  q(1098, 1, 3, ["Tools", "Command"], {
    variants: [
      "Which command-line tool queries a DNS server to resolve a hostname?",
      "On Linux, the 'dig' command is the equivalent of which Windows command?"
    ],
    answerOptions: [
      { variants: ["nslookup"], correct: true, explanation: "nslookup queries DNS records." },
      { variants: ["ipconfig"], correct: false, explanation: "ipconfig shows local settings." },
      { variants: ["netstat"], correct: false, explanation: "netstat shows connections." },
      { variants: ["tracert"], correct: false, explanation: "tracert shows the path." }
    ]
  }),

  q(1099, 1, 3, ["Tools", "Command"], {
    variants: [
      "Which command is used to trace the path a packet takes to a destination?",
      "An [admin] wants to see where packets are being dropped on the internet. Which tool should they use?"
    ],
    answerOptions: [
      { variants: ["traceroute", "tracert"], correct: true, explanation: "Traceroute (tracert on Windows) shows every hop along the path." },
      { variants: ["ping"], correct: false, explanation: "Ping tests connectivity but doesn't list the path details." },
      { variants: ["route"], correct: false, explanation: "route print shows the local table." },
      { variants: ["arp"], correct: false, explanation: "arp shows MAC mappings." }
    ]
  }),

  q(1100, 1, 3, ["IoT", "Protocols"], {
    variants: [
      "Which wireless protocol is designed for home automation (IoT) and operates on 900 MHz to avoid Wi-Fi interference?",
      "Unlike Zigbee which uses 2.4 GHz, this proprietary IoT protocol has better wall penetration:"
    ],
    answerOptions: [
      { variants: ["Z-Wave"], correct: true, explanation: "Z-Wave uses sub-1GHz frequencies (900 MHz) to avoid 2.4 GHz clutter." },
      { variants: ["Zigbee"], correct: false, explanation: "Zigbee uses 2.4 GHz." },
      { variants: ["Bluetooth"], correct: false, explanation: "Bluetooth uses 2.4 GHz." },
      { variants: ["NFC"], correct: false, explanation: "NFC is extremely short range." }
    ]
  }),

// ==========================================
// DOMAIN 2: WIRELESS NETWORKING (100Q)
// ==========================================

  // --- TOPIC: Wireless Standards (802.11) ---

  q(2001, 2, 1, ["Wi-Fi", "RF"], {
    variants: [
      "In the 2.4 GHz band, which three channels are considered non-overlapping in the United States?",
      "To avoid co-channel interference on 2.4 GHz, which channels should an [admin] select?",
      "Which set of channels allows three nearby [wap]s to operate without overlapping frequencies in the 2.4 GHz band?"
    ],
    answerOptions: [
      { variants: ["1, 6, 11"], correct: true, explanation: "Channels 1, 6, and 11 are the only non-overlapping channels in the US 2.4 GHz spectrum." },
      { variants: ["1, 5, 9"], correct: false, explanation: "These channels overlap significantly." },
      { variants: ["2, 7, 12"], correct: false, explanation: "Channel 12 is not standard in the US, and these overlap." },
      { variants: ["1, 2, 3"], correct: false, explanation: "Adjacent channels overlap heavily." }
    ]
  }),

  q(2002, 2, 1, ["Wi-Fi", "Standard"], {
    variants: [
      "Which 802.11 wireless standard introduced Multi-User MIMO (MU-MIMO) but operates strictly in the 5 GHz band?",
      "Wi-Fi 5 refers to which IEEE standard?",
      "Which standard provides speeds over 1 Gbps using 5 GHz only?"
    ],
    answerOptions: [
      { variants: ["802.11ac"], correct: true, explanation: "802.11ac (Wi-Fi 5) introduced MU-MIMO and beamforming, operating exclusively in 5 GHz." },
      { variants: ["802.11n"], correct: false, explanation: "802.11n (Wi-Fi 4) operates on both 2.4 and 5 GHz." },
      { variants: ["802.11ax"], correct: false, explanation: "802.11ax (Wi-Fi 6) operates on 2.4, 5, and 6 GHz." },
      { variants: ["802.11g"], correct: false, explanation: "802.11g is a legacy 2.4 GHz standard (54 Mbps)." }
    ]
  }),

  q(2003, 2, 4, ["Security", "Wi-Fi"], {
    variants: [
      "The WPA3 security standard replaced the traditional 4-way handshake with which new protocol?",
      "Which WPA3 feature prevents offline dictionary attacks against the password?",
      "SAE stands for:"
    ],
    answerOptions: [
      { variants: ["Simultaneous Authentication of Equals (SAE)"], correct: true, explanation: "SAE (based on the Dragonfly key exchange) prevents offline password cracking by requiring live interaction." },
      { variants: ["Temporal Key Integrity Protocol (TKIP)"], correct: false, explanation: "TKIP is the deprecated encryption for WPA." },
      { variants: ["Pre-Shared Key (PSK)"], correct: false, explanation: "PSK is the mode, not the handshake protocol itself." },
      { variants: ["Advanced Encryption Standard (AES)"], correct: false, explanation: "AES is the encryption cipher, not the handshake." }
    ]
  }),

  q(2004, 2, 5, ["Interference", "RF"], {
    variants: [
      "A [user] reports Wi-Fi drops whenever the microwave oven is running. What is the cause?",
      "Which non-networking device is a common source of interference in the 2.4 GHz band?"
    ],
    answerOptions: [
      { variants: ["Electromagnetic Interference (EMI)"], correct: true, explanation: "Microwaves operate at 2.4 GHz and leak RF energy that overpowers Wi-Fi signals." },
      { variants: ["Signal Refraction"], correct: false, explanation: "Refraction is bending of waves, not noise generation." },
      { variants: ["Signal Absorption"], correct: false, explanation: "Absorption weakens signal passing through objects." },
      { variants: ["Crosstalk"], correct: false, explanation: "Crosstalk usually refers to copper cables." }
    ]
  }),

  q(2005, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "Which metric compares the level of the Wi-Fi signal to the level of background noise?",
      "A high value in this metric indicates a clear, strong signal relative to interference:"
    ],
    answerOptions: [
      { variants: ["Signal-to-Noise Ratio (SNR)"], correct: true, explanation: "SNR is the difference between Signal Strength (RSSI) and the Noise Floor. Higher is better." },
      { variants: ["RSSI"], correct: false, explanation: "RSSI is just the raw signal strength, not a comparison to noise." },
      { variants: ["dBm"], correct: false, explanation: "dBm is the unit of measurement for power." },
      { variants: ["Latency"], correct: false, explanation: "Latency is delay." }
    ]
  }),

  q(2006, 2, 1, ["Wi-Fi", "Standard"], {
    variants: [
      "Which wireless standard is commercially marketed as 'Wi-Fi 6'?",
      "Which standard introduced OFDMA to improve efficiency in dense environments?"
    ],
    answerOptions: [
      { variants: ["802.11ax"], correct: true, explanation: "802.11ax is Wi-Fi 6, focusing on high efficiency (HE)." },
      { variants: ["802.11ac"], correct: false, explanation: "802.11ac is Wi-Fi 5." },
      { variants: ["802.11n"], correct: false, explanation: "802.11n is Wi-Fi 4." },
      { variants: ["802.11a"], correct: false, explanation: "802.11a is legacy 5 GHz." }
    ]
  }),

  q(2007, 2, 3, ["Topology", "Wi-Fi"], {
    variants: [
      "Which wireless topology mode allows devices to connect directly to each other without using a central Access Point?",
      "An IBSS (Independent Basic Service Set) is also known as:"
    ],
    answerOptions: [
      { variants: ["Ad Hoc Mode"], correct: true, explanation: "Ad Hoc mode enables peer-to-peer wireless communication without infrastructure." },
      { variants: ["Infrastructure Mode"], correct: false, explanation: "Infrastructure mode requires an AP." },
      { variants: ["Mesh Mode"], correct: false, explanation: "Mesh implies a managed network of nodes, typically with backhaul." },
      { variants: ["Star Mode"], correct: false, explanation: "Star implies Infrastructure." }
    ]
  }),

  q(2008, 2, 4, ["Security", "Legacy"], {
    variants: [
      "Which legacy wireless security protocol uses RC4 encryption and is considered completely insecure?",
      "An [admin] finds an AP configured with a 40-bit key and RC4. What protocol is this?"
    ],
    answerOptions: [
      { variants: ["WEP"], correct: true, explanation: "Wired Equivalent Privacy (WEP) uses a static key and RC4, making it trivially easy to crack." },
      { variants: ["WPA2"], correct: false, explanation: "WPA2 uses AES." },
      { variants: ["WPA"], correct: false, explanation: "WPA uses TKIP." },
      { variants: ["WPA3"], correct: false, explanation: "WPA3 uses SAE/GCMP." }
    ]
  }),

  q(2009, 2, 1, ["RF", "Wi-Fi"], {
    variants: [
      "What is the primary advantage of using the 5 GHz band over the 2.4 GHz band?",
      "Why would an [admin] migrate a dense office to 5 GHz?"
    ],
    answerOptions: [
      { variants: ["More Non-Overlapping Channels"], correct: true, explanation: "5 GHz offers ~24 non-overlapping channels compared to just 3 in 2.4 GHz." },
      { variants: ["Better Range"], correct: false, explanation: "5 GHz has worse range (higher frequency attenuates faster)." },
      { variants: ["Better Wall Penetration"], correct: false, explanation: "5 GHz penetrates walls poorly compared to 2.4 GHz." },
      { variants: ["Lower Cost"], correct: false, explanation: "Equipment cost is generally similar or higher." }
    ]
  }),

  q(2010, 2, 3, ["Hardware", "Management"], {
    variants: [
      "In a large corporate environment, which device is used to centrally manage 50 lightweight Access Points?",
      "To deploy configuration changes to all APs simultaneously, an [admin] uses a:"
    ],
    answerOptions: [
      { variants: ["Wireless Controller", "WLC"], correct: true, explanation: "A Wireless LAN Controller (WLC) manages lightweight/thin APs centrally." },
      { variants: ["Router"], correct: false, explanation: "Routers route packets." },
      { variants: ["Switch"], correct: false, explanation: "Switches connect wired devices." },
      { variants: ["Firewall"], correct: false, explanation: "Firewalls filter traffic." }
    ]
  }),

  q(2011, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "A technician measures the Wi-Fi signal strength at -85 dBm. How is this signal classified?",
      "Which RSSI value represents a dead zone or unusable signal?"
    ],
    answerOptions: [
      { variants: ["Unusable / Dead Zone"], correct: true, explanation: "Signal below -80 dBm is typically indistinguishable from background noise." },
      { variants: ["Excellent"], correct: false, explanation: "-30 to -50 dBm is excellent." },
      { variants: ["Good"], correct: false, explanation: "-60 to -70 dBm is good." },
      { variants: ["Fair"], correct: false, explanation: "-70 to -75 dBm is fair." }
    ]
  }),

  q(2012, 2, 1, ["Theory", "Traffic"], {
    variants: [
      "Because wireless radios are half-duplex, which access method do they use to avoid collisions?",
      "Wi-Fi devices 'listen before talking'. This protocol is called:"
    ],
    answerOptions: [
      { variants: ["CSMA/CA"], correct: true, explanation: "Carrier Sense Multiple Access with Collision Avoidance uses RTS/CTS and backoff timers." },
      { variants: ["CSMA/CD"], correct: false, explanation: "CSMA/CD is for wired Ethernet (Collision Detection)." },
      { variants: ["Token Passing"], correct: false, explanation: "Used in Ring networks." },
      { variants: ["Polling"], correct: false, explanation: "Used in cellular or mainframe systems." }
    ]
  }),

  q(2013, 2, 3, ["Hardware", "RF"], {
    variants: [
      "Which type of antenna radiates signal power equally in all directions horizontally (360 degrees)?",
      "The standard 'rubber duck' antenna on a [wap] is an example of which antenna type?"
    ],
    answerOptions: [
      { variants: ["Omnidirectional", "Dipole"], correct: true, explanation: "Omni antennas radiate in a donut shape (360 degrees)." },
      { variants: ["Yagi"], correct: false, explanation: "Yagi is directional." },
      { variants: ["Parabolic Dish"], correct: false, explanation: "Dish is highly directional." },
      { variants: ["Patch"], correct: false, explanation: "Patch is semi-directional (wall mounted)." }
    ]
  }),

  q(2014, 2, 4, ["Security", "Auth"], {
    variants: [
      "To implement WPA2-Enterprise security, which backend service is required?",
      "802.1X authentication in a wireless network typically relies on which server?"
    ],
    answerOptions: [
      { variants: ["RADIUS Server", "AAA Server"], correct: true, explanation: "Enterprise mode uses 802.1X, which authenticates against a RADIUS backend." },
      { variants: ["Pre-Shared Key"], correct: false, explanation: "PSK is for Personal mode." },
      { variants: ["WEP Key"], correct: false, explanation: "WEP is legacy." },
      { variants: ["Captive Portal"], correct: false, explanation: "Captive portals are for guest access." }
    ]
  }),

  q(2015, 2, 2, ["Cellular", "Speed"], {
    variants: [
      "Which 5G technology uses high-frequency millimeter waves to achieve gigabit speeds but has very short range?",
      "To get maximum speed in a 5G deployment in a stadium, which band is used?"
    ],
    answerOptions: [
      { variants: ["mmWave", "High-band"], correct: true, explanation: "Millimeter wave (24 GHz+) offers extreme speed but cannot penetrate walls." },
      { variants: ["Low-band"], correct: false, explanation: "Low-band is for range." },
      { variants: ["Mid-band"], correct: false, explanation: "Mid-band balances range and speed." },
      { variants: ["LTE"], correct: false, explanation: "LTE is 4G." }
    ]
  }),

  q(2016, 2, 5, ["RF", "Physics"], {
    variants: [
      "What wireless phenomenon occurs when a signal bounces off objects and arrives at the receiver multiple times?",
      "MIMO technology takes advantage of which RF behavior that used to be considered a problem?"
    ],
    answerOptions: [
      { variants: ["Multipath Propagation", "Multipath"], correct: true, explanation: "Multipath is caused by reflected signals taking different paths. MIMO uses this to increase data density." },
      { variants: ["Refraction"], correct: false, explanation: "Bending of waves." },
      { variants: ["Diffraction"], correct: false, explanation: "Bending around obstacles." },
      { variants: ["Absorption"], correct: false, explanation: "Signal loss into materials." }
    ]
  }),

  q(2017, 2, 1, ["Wi-Fi", "Performance"], {
    variants: [
      "Which technology allows a [wap] to transmit data to multiple client [device]s simultaneously?",
      "Wi-Fi 5 (Wave 2) introduced which feature to improve downstream capacity?"
    ],
    answerOptions: [
      { variants: ["MU-MIMO"], correct: true, explanation: "Multi-User MIMO allows simultaneous transmission to different clients." },
      { variants: ["MIMO"], correct: false, explanation: "Standard MIMO sends multiple streams to ONE client at a time." },
      { variants: ["SISO"], correct: false, explanation: "Single Input Single Output (legacy)." },
      { variants: ["OFDM"], correct: false, explanation: "Modulation technique." }
    ]
  }),

  q(2018, 2, 5, ["RF", "Material"], {
    variants: [
      "Which building material causes the most significant absorption (signal loss) for Wi-Fi signals?",
      "An [admin] plans Wi-Fi for a basement. Which material will block signals the most?"
    ],
    answerOptions: [
      { variants: ["Concrete", "Brick"], correct: true, explanation: "Dense materials like concrete and brick absorb RF energy heavily." },
      { variants: ["Drywall"], correct: false, explanation: "Drywall has low absorption." },
      { variants: ["Glass"], correct: false, explanation: "Glass causes some loss and reflection but less than concrete." },
      { variants: ["Wood"], correct: false, explanation: "Wood has low absorption." }
    ]
  }),

  q(2019, 2, 2, ["WAN", "Space"], {
    variants: [
      "What is the primary benefit of Low Earth Orbit (LEO) satellite internet compared to Geostationary?",
      "Starlink satellites orbit closer to Earth to improve which performance metric?"
    ],
    answerOptions: [
      { variants: ["Lower Latency"], correct: true, explanation: "LEO satellites are ~500km up (vs 35,000km for GEO), drastically reducing latency." },
      { variants: ["Higher Altitude"], correct: false, explanation: "They are lower altitude." },
      { variants: ["Weather Resistance"], correct: false, explanation: "Both are affected by rain fade." },
      { variants: ["Static Dish"], correct: false, explanation: "LEO requires tracking antennas (phased array)." }
    ]
  }),

  q(2020, 2, 3, ["Topology", "Resilience"], {
    variants: [
      "In a Wireless Mesh Network, if one node fails, the traffic is automatically re-routed. What is this called?",
      "Mesh networks are robust because they are:"
    ],
    answerOptions: [
      { variants: ["Self-Healing"], correct: true, explanation: "Self-healing refers to the ability to dynamically find new paths when a node drops." },
      { variants: ["Failover"], correct: false, explanation: "Generic term, but self-healing is specific to mesh logic." },
      { variants: ["Load Balancing"], correct: false, explanation: "Distributing traffic, not necessarily fixing broken paths." },
      { variants: ["Switching"], correct: false, explanation: "Layer 2 forwarding." }
    ]
  }),

  q(2021, 2, 4, ["Security", "Wi-Fi"], {
    variants: [
      "The acronym SAE in WPA3 security stands for:",
      "What is the name of the handshake protocol in WPA3?"
    ],
    answerOptions: [
      { variants: ["Simultaneous Authentication of Equals"], correct: true, explanation: "SAE replaces the WPA2 4-way handshake." },
      { variants: ["Secure Authentication Exchange"], correct: false, explanation: "Incorrect." },
      { variants: ["System Access Encryption"], correct: false, explanation: "Incorrect." },
      { variants: ["Standard Advanced Encryption"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(2022, 2, 2, ["WAN", "Backhaul"], {
    variants: [
      "Which wireless technology is best suited for a point-to-point link connecting two buildings 5 miles apart with clear line-of-sight?",
      "To connect two campuses without digging fiber, an [admin] installs roof-mounted dishes. What tech is this?"
    ],
    answerOptions: [
      { variants: ["Microwave"], correct: true, explanation: "Microwave provides high-bandwidth, long-distance P2P connectivity." },
      { variants: ["Wi-Fi"], correct: false, explanation: "Standard Wi-Fi has limited range without specialized modification." },
      { variants: ["Bluetooth"], correct: false, explanation: "Short range." },
      { variants: ["NFC"], correct: false, explanation: "Near Field (inches)." }
    ]
  }),

  q(2023, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "Configuring an AP on Channel 6 and a nearby AP on Channel 7 in the 2.4 GHz band causes what?",
      "Adjacent channel interference occurs because:"
    ],
    answerOptions: [
      { variants: ["Channel Overlap"], correct: true, explanation: "Channels 6 and 7 overlap frequencies. You must use 1, 6, 11." },
      { variants: ["Refraction"], correct: false, explanation: "Bending of waves." },
      { variants: ["Signal Gain"], correct: false, explanation: "Gain implies stronger signal." },
      { variants: ["Attenuation"], correct: false, explanation: "Weakening of signal." }
    ]
  }),

  q(2024, 2, 1, ["Wi-Fi", "Standard"], {
    variants: [
      "Which 802.11 standard was the first to support both 2.4 GHz and 5 GHz bands and introduced MIMO?",
      "Wi-Fi 4 is also known as:"
    ],
    answerOptions: [
      { variants: ["802.11n"], correct: true, explanation: "802.11n brought MIMO and dual-band support." },
      { variants: ["802.11a"], correct: false, explanation: "5 GHz only." },
      { variants: ["802.11b"], correct: false, explanation: "2.4 GHz only." },
      { variants: ["802.11g"], correct: false, explanation: "2.4 GHz only." }
    ]
  }),

  q(2025, 2, 3, ["Structure", "Wi-Fi"], {
    variants: [
      "The wired Ethernet connection that connects a [wap] to the main LAN is known as the:",
      "If the [backhaul_term] is saturated, Wi-Fi speed will suffer regardless of air quality."
    ],
    localBank: { backhaul_term: ["backhaul", "uplink"] },
    answerOptions: [
      { variants: ["Backhaul"], correct: true, explanation: "Backhaul is the link carrying traffic from the edge (AP) to the core." },
      { variants: ["Fronthaul"], correct: false, explanation: "Usually refers to cellular radio to tower." },
      { variants: ["Sidehaul"], correct: false, explanation: "Not a standard term." },
      { variants: ["Mesh Link"], correct: false, explanation: "This would be wireless backhaul." }
    ]
  }),

  q(2026, 2, 3, ["Hardware", "RF"], {
    variants: [
      "Which type of antenna focuses signal energy in a single narrow direction to achieve long range?",
      "A Yagi antenna is an example of a:"
    ],
    answerOptions: [
      { variants: ["Directional Antenna", "High-Gain"], correct: true, explanation: "Directional antennas focus energy to reach further in one direction." },
      { variants: ["Omnidirectional"], correct: false, explanation: "Radiates everywhere." },
      { variants: ["Dipole"], correct: false, explanation: "Standard omni." },
      { variants: ["Whip"], correct: false, explanation: "Standard omni." }
    ]
  }),

  q(2027, 2, 4, ["Security", "Best Practice"], {
    variants: [
      "What is the minimum recommended security standard for a corporate Wi-Fi network?",
      "For a secure business network where employees have individual logins, use:"
    ],
    answerOptions: [
      { variants: ["WPA2-Enterprise", "WPA3-Enterprise"], correct: true, explanation: "Enterprise mode (802.1X) is required for individual accountability." },
      { variants: ["WPA2-PSK"], correct: false, explanation: "PSK uses one password for everyone (not enterprise-grade)." },
      { variants: ["WEP"], correct: false, explanation: "Insecure." },
      { variants: ["Open System"], correct: false, explanation: "No security." }
    ]
  }),

  q(2028, 2, 5, ["RF", "Math"], {
    variants: [
      "EIRP (Effective Isotropic Radiated Power) is a calculation that accounts for which factors?",
      "To ensure you stay within FCC power limits, you must calculate:"
    ],
    answerOptions: [
      { variants: ["Transmitter Power + Antenna Gain - Cable Loss"], correct: true, explanation: "EIRP is the net power leaving the antenna." },
      { variants: ["Only Antenna Gain"], correct: false, explanation: "Incomplete." },
      { variants: ["Only Transmitter Power"], correct: false, explanation: "Incomplete." },
      { variants: ["Signal Noise"], correct: false, explanation: "Noise is external." }
    ]
  }),

  q(2029, 2, 1, ["Wi-Fi", "Performance"], {
    variants: [
      "What feature does 802.11ac use to combine multiple 20 MHz channels into a wider channel for higher throughput?",
      "Using an 80 MHz channel instead of 20 MHz is an example of:"
    ],
    answerOptions: [
      { variants: ["Channel Bonding"], correct: true, explanation: "Bonding combines channels to increase bandwidth." },
      { variants: ["MIMO"], correct: false, explanation: "MIMO uses antennas." },
      { variants: ["Beamforming"], correct: false, explanation: "Steers signal." },
      { variants: ["Spatial Multiplexing"], correct: false, explanation: "Sends multiple streams." }
    ]
  }),

  q(2030, 2, 3, ["Tools", "RF"], {
    variants: [
      "Which tool allows a technician to visualize Wi-Fi signal coverage and dead zones on a floor plan?",
      "An [admin] walks around the office with a laptop to create a coverage map. This is a:"
    ],
    answerOptions: [
      { variants: ["Heatmap / Site Survey"], correct: true, explanation: "Heatmaps visualize RF coverage." },
      { variants: ["Port Scanner"], correct: false, explanation: "Scans IP ports." },
      { variants: ["Packet Sniffer"], correct: false, explanation: "Captures data." },
      { variants: ["Firewall"], correct: false, explanation: "Security device." }
    ]
  }),

  q(2031, 2, 1, ["Wi-Fi", "6GHz"], {
    variants: [
      "Wi-Fi 6E primarily expands Wi-Fi into which additional frequency band?",
      "To avoid 2.4 and 5 GHz congestion, new devices can use:"
    ],
    answerOptions: [
      { variants: ["6 GHz"], correct: true, explanation: "Wi-Fi 6E adds the 6 GHz spectrum." },
      { variants: ["900 MHz"], correct: false, explanation: "IoT/Z-Wave uses 900 MHz." },
      { variants: ["60 GHz"], correct: false, explanation: "WiGig uses 60 GHz." },
      { variants: ["700 MHz"], correct: false, explanation: "Cellular." }
    ]
  }),

  q(2032, 2, 5, ["RF", "Coverage"], {
    variants: [
      "A user has strong RSSI (-40 dBm) but poor throughput due to heavy interference. Which metric best reveals this?",
      "Why might a 'full bars' connection still be slow?"
    ],
    answerOptions: [
      { variants: ["Low SNR (Signal-to-Noise Ratio)"], correct: true, explanation: "If Noise is high, even a strong Signal results in a low SNR and poor performance." },
      { variants: ["High SNR"], correct: false, explanation: "High SNR is good." },
      { variants: ["Low EIRP"], correct: false, explanation: "EIRP is transmit power." },
      { variants: ["High Gain"], correct: false, explanation: "Gain helps signal." }
    ]
  }),

  q(2033, 2, 3, ["Roaming", "Enterprise"], {
    variants: [
      "Which standard (Fast BSS Transition) allows clients to roam between APs without full re-authentication?",
      "An [admin] enables 802.11r to improve performance for:"
    ],
    answerOptions: [
      { variants: ["Roaming / VoIP"], correct: true, explanation: "802.11r speeds up handoffs, critical for voice/video while moving." },
      { variants: ["Static clients"], correct: false, explanation: "Static clients don't roam." },
      { variants: ["File transfers"], correct: false, explanation: "Less sensitive to roaming delay." },
      { variants: ["Guest access"], correct: false, explanation: "Guests rarely need fast roaming." }
    ]
  }),

  q(2034, 2, 4, ["Security", "Wi-Fi"], {
    variants: [
      "Which control best prevents unauthorized APs (rogue APs) from being connected to corporate switch ports?",
      "How do you stop an employee from plugging a home router into the office LAN?"
    ],
    answerOptions: [
      { variants: ["802.1X / Port Security"], correct: true, explanation: "Port security or 802.1X ensures only authorized devices can use the jack." },
      { variants: ["WPA3"], correct: false, explanation: "WPA3 protects the wireless air, not the wired jack." },
      { variants: ["WEP"], correct: false, explanation: "Legacy wireless security." },
      { variants: ["Hidden SSID"], correct: false, explanation: "Hiding SSID doesn't stop physical connection." }
    ]
  }),

  q(2035, 2, 1, ["Wi-Fi", "Efficiency"], {
    variants: [
      "Which 802.11ax feature divides a channel into smaller sub-channels (Resource Units) for simultaneous access?",
      "Wi-Fi 6 improves efficiency using:"
    ],
    answerOptions: [
      { variants: ["OFDMA"], correct: true, explanation: "Orthogonal Frequency-Division Multiple Access allows one transmission to serve multiple clients." },
      { variants: ["OFDM"], correct: false, explanation: "Legacy modulation." },
      { variants: ["MIMO"], correct: false, explanation: "Spatial streams." },
      { variants: ["CSMA/CD"], correct: false, explanation: "Wired protocol." }
    ]
  }),

  q(2036, 2, 5, ["RF", "Interference"], {
    variants: [
      "Bluetooth devices most commonly interfere with Wi-Fi in which band?",
      "Your wireless mouse uses the same frequency as which Wi-Fi band?"
    ],
    answerOptions: [
      { variants: ["2.4 GHz"], correct: true, explanation: "Bluetooth uses 2.4 GHz, hopping frequencies." },
      { variants: ["5 GHz"], correct: false, explanation: "Bluetooth doesn't use 5 GHz." },
      { variants: ["6 GHz"], correct: false, explanation: "Bluetooth doesn't use 6 GHz." },
      { variants: ["60 GHz"], correct: false, explanation: "Bluetooth doesn't use 60 GHz." }
    ]
  }),

  q(2037, 2, 3, ["Design", "Capacity"], {
    variants: [
      "In a high-density venue like a stadium, which approach improves Wi-Fi performance?",
      "To support thousands of users in one room, should you use:"
    ],
    answerOptions: [
      { variants: ["More APs with lower transmit power"], correct: true, explanation: "Small cells (low power) allow frequency reuse and higher capacity." },
      { variants: ["Fewer APs with max power"], correct: false, explanation: "Creates massive interference/contention." },
      { variants: ["Omnidirectional antennas only"], correct: false, explanation: "Directional is often better in stadiums." },
      { variants: ["2.4 GHz only"], correct: false, explanation: "2.4 GHz has too few channels." }
    ]
  }),

  q(2038, 2, 4, ["Security", "Enterprise"], {
    variants: [
      "Which WPA3 mode supports 192-bit encryption for high-security government environments?",
      "For top-secret clearance networks, which Wi-Fi security suite is used?"
    ],
    answerOptions: [
      { variants: ["WPA3-Enterprise 192-bit"], correct: true, explanation: "WPA3-Enterprise offers an optional 192-bit security mode (CNSA suite)." },
      { variants: ["WPA3-Personal"], correct: false, explanation: "128-bit usually." },
      { variants: ["WPA2-AES"], correct: false, explanation: "128-bit." },
      { variants: ["WEP"], correct: false, explanation: "Broken." }
    ]
  }),

  q(2039, 2, 5, ["Troubleshooting", "Wi-Fi"], {
    variants: [
      "Clients connect to the 'Guest' SSID but get an IP address from the 'Corporate' subnet. What is misconfigured?",
      "An [admin] sees that the Guest VLAN tag is missing on the AP configuration. What happens?"
    ],
    answerOptions: [
      { variants: ["SSID-to-VLAN Mapping"], correct: true, explanation: "The AP maps the SSID to a VLAN. If wrong, users enter the wrong network." },
      { variants: ["Antenna Polarization"], correct: false, explanation: "Affects signal, not logic." },
      { variants: ["DNS"], correct: false, explanation: "Affects names." },
      { variants: ["WPA Key"], correct: false, explanation: "Affects login." }
    ]
  }),

  q(2040, 2, 2, ["Cellular", "Auth"], {
    variants: [
      "Which authentication method leverages the SIM card in a phone to authenticate to a corporate Wi-Fi?",
      "Mobile offloading often uses this EAP method:"
    ],
    answerOptions: [
      { variants: ["EAP-SIM / EAP-AKA"], correct: true, explanation: "EAP-SIM uses the Subscriber Identity Module for auth." },
      { variants: ["EAP-TLS"], correct: false, explanation: "Uses certificates." },
      { variants: ["PEAP"], correct: false, explanation: "Uses username/password." },
      { variants: ["PSK"], correct: false, explanation: "Uses static password." }
    ]
  }),

  q(2041, 2, 2, ["Wi-Fi", "DFS"], {
    variants: [
      "Why might an AP on 5 GHz channel 100 suddenly switch to a different channel?",
      "Dynamic Frequency Selection (DFS) requires APs to vacate channels if they detect:"
    ],
    answerOptions: [
      { variants: ["Radar Signals"], correct: true, explanation: "5 GHz shares spectrum with weather/military radar. Wi-Fi must yield." },
      { variants: ["Bluetooth"], correct: false, explanation: "Bluetooth is 2.4 GHz." },
      { variants: ["Microwaves"], correct: false, explanation: "Microwaves are 2.4 GHz." },
      { variants: ["Cellular"], correct: false, explanation: "Cellular is usually licensed bands." }
    ]
  }),

  q(2042, 2, 3, ["Roaming", "Optimization"], {
    variants: [
      "Which 802.11 amendment (Radio Resource Measurement) provides clients with a list of neighbor APs?",
      "To help clients find the next AP without scanning all channels, enable:"
    ],
    answerOptions: [
      { variants: ["802.11k"], correct: true, explanation: "802.11k provides Neighbor Reports." },
      { variants: ["802.11r"], correct: false, explanation: "Fast Transition (Handshake)." },
      { variants: ["802.11v"], correct: false, explanation: "Transition Management (Steering)." },
      { variants: ["802.11w"], correct: false, explanation: "Management Frame Protection." }
    ]
  }),

  q(2043, 2, 3, ["Roaming", "Steering"], {
    variants: [
      "Which standard allows the AP to suggest that a client move to a less congested AP?",
      "Wireless Network Management (802.11v) is primarily used for:"
    ],
    answerOptions: [
      { variants: ["Load Balancing / Steering"], correct: true, explanation: "802.11v allows the infrastructure to guide clients to better APs." },
      { variants: ["Encryption"], correct: false, explanation: "That's 802.11i." },
      { variants: ["Speed"], correct: false, explanation: "That's n/ac/ax." },
      { variants: ["Power"], correct: false, explanation: "That's WMM-PS." }
    ]
  }),

  q(2044, 2, 4, ["Security", "Legacy"], {
    variants: [
      "Which ease-of-use feature (Push Button/PIN) is a major security vulnerability and should be disabled?",
      "WPS stands for what?"
    ],
    answerOptions: [
      { variants: ["Wi-Fi Protected Setup (WPS)"], correct: true, explanation: "WPS PINs can be brute-forced easily (Reaver attack)." },
      { variants: ["WPA"], correct: false, explanation: "WPA is the security standard." },
      { variants: ["WMM"], correct: false, explanation: "WMM is QoS." },
      { variants: ["WLAN"], correct: false, explanation: "WLAN is the network type." }
    ]
  }),

  q(2045, 2, 1, ["Wi-Fi", "Channels"], {
    variants: [
      "Using a 160 MHz channel width increases throughput but also increases:",
      "Why might an [admin] choose 40 MHz over 80 MHz in a dense building?"
    ],
    answerOptions: [
      { variants: ["Risk of Interference / Consumption of Spectrum"], correct: true, explanation: "Wider channels use more spectrum, leaving less room for other APs." },
      { variants: ["Latency"], correct: false, explanation: "Wider channels usually lower latency (faster transmit)." },
      { variants: ["Encryption overhead"], correct: false, explanation: "Unrelated." },
      { variants: ["Power usage"], correct: false, explanation: "Marginal difference." }
    ]
  }),

  q(2046, 2, 5, ["RF", "Attenuation"], {
    variants: [
      "A warehouse with metal shelving experiences signal dead spots. This is primarily due to:",
      "Metal surfaces cause what RF behavior?"
    ],
    answerOptions: [
      { variants: ["Reflection / Multipath"], correct: true, explanation: "Metal reflects RF, causing scattering and multipath holes." },
      { variants: ["Absorption"], correct: false, explanation: "Metal reflects, water/concrete absorbs." },
      { variants: ["Refraction"], correct: false, explanation: "Glass/Water refracts." },
      { variants: ["Diffraction"], correct: false, explanation: "Bending around corners." }
    ]
  }),

  q(2047, 2, 4, ["Security", "Guest"], {
    variants: [
      "A hotel network redirects your browser to a login page before allowing internet. This is a:",
      "What mechanism is used to enforce Terms of Service on open Wi-Fi?"
    ],
    answerOptions: [
      { variants: ["Captive Portal"], correct: true, explanation: "Captive portals intercept HTTP traffic until auth is complete." },
      { variants: ["WPA2"], correct: false, explanation: "Layer 2 encryption." },
      { variants: ["VPN"], correct: false, explanation: "Tunnel." },
      { variants: ["Firewall"], correct: false, explanation: "Filter." }
    ]
  }),

  q(2048, 2, 3, ["Hardware", "Placement"], {
    variants: [
      "To reduce co-channel interference, [admin]s should:",
      "When placing APs, you should ensure adjacent APs use:"
    ],
    answerOptions: [
      { variants: ["Non-overlapping channels"], correct: true, explanation: "Neighbors should be on different channels (e.g., 1 and 6)." },
      { variants: ["The same channel"], correct: false, explanation: "Causes contention." },
      { variants: ["Maximum power"], correct: false, explanation: "Increases interference." },
      { variants: ["Hidden SSIDs"], correct: false, explanation: "Security obscurity, doesn't help RF." }
    ]
  }),

  q(2049, 2, 2, ["Wi-Fi", "QoS"], {
    variants: [
      "Which standard provides QoS for wireless, prioritizing Voice and Video?",
      "WMM (Wi-Fi Multimedia) is based on which IEEE amendment?"
    ],
    answerOptions: [
      { variants: ["802.11e / WMM"], correct: true, explanation: "WMM maps traffic to 4 queues: Voice, Video, Best Effort, Background." },
      { variants: ["802.11n"], correct: false, explanation: "Speed." },
      { variants: ["802.11i"], correct: false, explanation: "Security (WPA2)." },
      { variants: ["802.11r"], correct: false, explanation: "Roaming." }
    ]
  }),

  q(2050, 2, 4, ["Security", "Encryption"], {
    variants: [
      "WPA2-Personal uses which encryption cipher by default?",
      "If you select 'WPA2' on a consumer router, what encryption is applied?"
    ],
    answerOptions: [
      { variants: ["AES-CCMP"], correct: true, explanation: "AES is the cipher, CCMP is the mode. Standard for WPA2." },
      { variants: ["TKIP"], correct: false, explanation: "Legacy WPA." },
      { variants: ["RC4"], correct: false, explanation: "Legacy WEP." },
      { variants: ["GCMP"], correct: false, explanation: "WPA3." }
    ]
  }),

  // --- NEW QUESTIONS 2051-2100 (Filling the gap) ---

  q(2051, 2, 3, ["Antenna", "Polarization"], {
    variants: [
      "To maximize signal strength, the transmitting and receiving antennas should match in:",
      "If an AP antenna is vertical, the client antenna should also be vertical. This concept is:"
    ],
    answerOptions: [
      { variants: ["Polarization"], correct: true, explanation: "Mismatched polarization (e.g., vertical vs horizontal) causes significant signal loss (-20dB)." },
      { variants: ["Frequency"], correct: false, explanation: "Frequency must match, but orientation is polarization." },
      { variants: ["Gain"], correct: false, explanation: "Gain is power." },
      { variants: ["Phase"], correct: false, explanation: "Phase is timing." }
    ]
  }),

  q(2052, 2, 3, ["Survey", "Types"], {
    variants: [
      "Which type of site survey involves using software to simulate coverage based on floor plans without visiting the site?",
      "An [admin] draws walls on a map to estimate AP count. This is a:"
    ],
    answerOptions: [
      { variants: ["Predictive Survey"], correct: true, explanation: "Predictive surveys use models to estimate coverage." },
      { variants: ["Active Survey"], correct: false, explanation: "Active involves connecting to APs." },
      { variants: ["Passive Survey"], correct: false, explanation: "Passive involves listening to APs." },
      { variants: ["Post-validation"], correct: false, explanation: "After install." }
    ]
  }),

  q(2053, 2, 3, ["Survey", "Types"], {
    variants: [
      "An [admin] walks the site with a laptop measuring signal from installed APs without connecting. This is a:",
      "Listening to beacons to map coverage is called:"
    ],
    answerOptions: [
      { variants: ["Passive Survey"], correct: true, explanation: "Passive surveys listen to RF without associating." },
      { variants: ["Active Survey"], correct: false, explanation: "Active connects and tests throughput." },
      { variants: ["Predictive"], correct: false, explanation: "Simulation." },
      { variants: ["Spectrum Analysis"], correct: false, explanation: "Looks for non-Wi-Fi noise." }
    ]
  }),

  q(2054, 2, 5, ["RF", "Tools"], {
    variants: [
      "Which tool is used to detect non-Wi-Fi interference sources like microwaves or bluetooth?",
      "To see raw RF energy signatures, use a:"
    ],
    answerOptions: [
      { variants: ["Spectrum Analyzer"], correct: true, explanation: "Spectrum analyzers show raw RF energy, identifying noise sources." },
      { variants: ["Packet Sniffer"], correct: false, explanation: "Reads data packets." },
      { variants: ["Wi-Fi Analyzer"], correct: false, explanation: "Reads Wi-Fi frames/SSIDs." },
      { variants: ["TDR"], correct: false, explanation: "Cable tester." }
    ]
  }),

  q(2055, 2, 4, ["Security", "EAP"], {
    variants: [
      "Which EAP method relies on a server-side certificate but uses client credentials (username/password) via a secure tunnel?",
      "PEAP and EAP-TTLS are popular because they don't require:"
    ],
    answerOptions: [
      { variants: ["Client Certificates"], correct: true, explanation: "PEAP/TTLS build a tunnel using only a server cert, avoiding PKI on every phone." },
      { variants: ["Server Certificates"], correct: false, explanation: "Server certs are mandatory for the tunnel." },
      { variants: ["Passwords"], correct: false, explanation: "They use passwords inside the tunnel." },
      { variants: ["Encryption"], correct: false, explanation: "They use TLS." }
    ]
  }),

  q(2056, 2, 4, ["Security", "EAP"], {
    variants: [
      "Which EAP method is considered the most secure because it requires certificates on BOTH the server and the client?",
      "For high-security environments using Smart Cards, which EAP type is used?"
    ],
    answerOptions: [
      { variants: ["EAP-TLS"], correct: true, explanation: "EAP-TLS uses mutual authentication via certificates." },
      { variants: ["PEAP"], correct: false, explanation: "Only server cert." },
      { variants: ["EAP-FAST"], correct: false, explanation: "Uses PACs (Cisco)." },
      { variants: ["LEAP"], correct: false, explanation: "Legacy insecure." }
    ]
  }),

  q(2057, 2, 3, ["Antenna", "Types"], {
    variants: [
      "Which antenna type is ideal for covering a long hallway or a specific aisle in a warehouse?",
      "A Patch antenna provides what kind of coverage pattern?"
    ],
    answerOptions: [
      { variants: ["Directional / Semi-Directional"], correct: true, explanation: "Patch antennas focus energy forward (hemisphere), good for walls/halls." },
      { variants: ["Omnidirectional"], correct: false, explanation: "360 coverage." },
      { variants: ["Parabolic"], correct: false, explanation: "Too narrow (pencil beam)." },
      { variants: ["Dipole"], correct: false, explanation: "Omni." }
    ]
  }),

  q(2058, 2, 3, ["Antenna", "Types"], {
    variants: [
      "Which antenna provides the highest gain and narrowest beam, used for long-distance links?",
      "A Grid or Dish antenna is classified as:"
    ],
    answerOptions: [
      { variants: ["Highly Directional / Parabolic"], correct: true, explanation: "Parabolic dishes focus energy tight for miles of range." },
      { variants: ["Omni"], correct: false, explanation: "No." },
      { variants: ["Sector"], correct: false, explanation: "Wider than dish." },
      { variants: ["Patch"], correct: false, explanation: "Wider than dish." }
    ]
  }),

  q(2059, 2, 5, ["Troubleshooting", "Capacity"], {
    variants: [
      "Users complain of slow speeds. The [admin] sees 100 users connected to a single AP. This is an issue of:",
      "Wi-Fi is a shared medium. Too many clients causes excessive:"
    ],
    answerOptions: [
      { variants: ["Contention / Overcapacity"], correct: true, explanation: "Wi-Fi is a hub-like medium; clients compete for airtime. Too many = wait times." },
      { variants: ["Interference"], correct: false, explanation: "Interference is external noise." },
      { variants: ["Coverage"], correct: false, explanation: "They are connected, so coverage is fine." },
      { variants: ["Channel overlap"], correct: false, explanation: "Maybe, but capacity is the primary symptom described." }
    ]
  }),

  q(2060, 2, 1, ["Theory", "Goodput"], {
    variants: [
      "The actual amount of useful data (payload) transferred over a Wi-Fi link, excluding overhead, is called:",
      "If your link speed is 100 Mbps but you only get 50 Mbps of file transfer, 50 Mbps is the:"
    ],
    answerOptions: [
      { variants: ["Goodput"], correct: true, explanation: "Goodput is the application-level throughput (excluding headers, ACKs, waits)." },
      { variants: ["Throughput"], correct: false, explanation: "Throughput includes overhead." },
      { variants: ["Data Rate"], correct: false, explanation: "PHY rate." },
      { variants: ["Bandwidth"], correct: false, explanation: "Theoretical max." }
    ]
  }),

  q(2061, 2, 3, ["IoT", "Protocols"], {
    variants: [
      "Which IoT protocol operates on sub-1GHz frequencies (900 MHz) to penetrate walls better?",
      "Unlike Zigbee, this proprietary protocol doesn't use 2.4 GHz:"
    ],
    answerOptions: [
      { variants: ["Z-Wave"], correct: true, explanation: "Z-Wave uses ~900 MHz for range and reliability." },
      { variants: ["Zigbee"], correct: false, explanation: "2.4 GHz." },
      { variants: ["Bluetooth"], correct: false, explanation: "2.4 GHz." },
      { variants: ["NFC"], correct: false, explanation: "Short range." }
    ]
  }),

  q(2062, 2, 3, ["IoT", "Protocols"], {
    variants: [
      "Which open standard IoT protocol uses 2.4 GHz and creates a mesh network?",
      "Philips Hue and Amazon Echo often use this 2.4 GHz mesh protocol:"
    ],
    answerOptions: [
      { variants: ["Zigbee"], correct: true, explanation: "Zigbee is a popular 2.4 GHz mesh for home automation." },
      { variants: ["Z-Wave"], correct: false, explanation: "900 MHz." },
      { variants: ["LTE"], correct: false, explanation: "Cellular." },
      { variants: ["RFID"], correct: false, explanation: "Passive tag." }
    ]
  }),

  q(2063, 2, 3, ["IoT", "Protocols"], {
    variants: [
      "Which short-range protocol is used for contactless payments and access badges?",
      "Tap-to-pay uses:"
    ],
    answerOptions: [
      { variants: ["NFC"], correct: true, explanation: "Near Field Communication works at ~4cm." },
      { variants: ["RFID"], correct: false, explanation: "RFID is the parent tech, but payment is specifically NFC." },
      { variants: ["Bluetooth"], correct: false, explanation: "Bluetooth is longer range." },
      { variants: ["IR"], correct: false, explanation: "Infrared requires line of sight." }
    ]
  }),

  q(2064, 2, 3, ["IoT", "Protocols"], {
    variants: [
      "Passive [tag_term] tags have no battery and are powered by the reader's signal.",
      "Inventory tracking often uses tags that respond to radio energy. These are:"
    ],
    localBank: { tag_term: ["RFID", "tracking"] },
    answerOptions: [
      { variants: ["RFID"], correct: true, explanation: "Radio Frequency Identification (Passive) uses the reader's energy to reply." },
      { variants: ["NFC"], correct: false, explanation: "Subset of RFID." },
      { variants: ["Bluetooth"], correct: false, explanation: "Active radio." },
      { variants: ["GPS"], correct: false, explanation: "Receive only." }
    ]
  }),

  q(2065, 2, 3, ["IoT", "Protocols"], {
    variants: [
      "Which Bluetooth version (BLE) is designed for low-power IoT sensors that run for years on a battery?",
      "Fitness trackers primarily use:"
    ],
    answerOptions: [
      { variants: ["Bluetooth 4.0 / BLE"], correct: true, explanation: "Bluetooth Low Energy (Smart) enables long battery life." },
      { variants: ["Bluetooth 2.0"], correct: false, explanation: "Classic high power." },
      { variants: ["Wi-Fi"], correct: false, explanation: "High power." },
      { variants: ["LTE"], correct: false, explanation: "High power." }
    ]
  }),

  q(2066, 2, 2, ["Cellular", "Tech"], {
    variants: [
      "Which cellular technology (GSM vs CDMA) uses SIM cards?",
      "LTE and 5G evolved primarily from which lineage?"
    ],
    answerOptions: [
      { variants: ["GSM"], correct: true, explanation: "Global System for Mobiles (GSM) introduced the SIM card." },
      { variants: ["CDMA"], correct: false, explanation: "CDMA (Verizon/Sprint legacy) typically did not use SIMs initially." },
      { variants: ["TDMA"], correct: false, explanation: "Access method." },
      { variants: ["FDMA"], correct: false, explanation: "Access method." }
    ]
  }),

  q(2067, 2, 5, ["RF", "Zone"], {
    variants: [
      "The football-shaped area around a visual line-of-sight that must be clear of obstacles is called:",
      "Even with visual line-of-sight, a microwave link can fail if this zone is obstructed:"
    ],
    answerOptions: [
      { variants: ["Fresnel Zone"], correct: true, explanation: "The Fresnel Zone is the ellipsoid area where RF waves spread out. 60% clearance is recommended." },
      { variants: ["Dead Zone"], correct: false, explanation: "No signal." },
      { variants: ["Faraday Zone"], correct: false, explanation: "Blocked." },
      { variants: ["Spectrum"], correct: false, explanation: "Frequency range." }
    ]
  }),

  q(2068, 2, 4, ["Security", "Attack"], {
    variants: [
      "Driving around a city searching for open Wi-Fi networks is called:",
      "Marking buildings with symbols to indicate open Wi-Fi is:"
    ],
    answerOptions: [
      { variants: ["War Driving"], correct: true, explanation: "War Driving involves mapping Wi-Fi while moving." },
      { variants: ["War Chalking"], correct: false, explanation: "Marking the pavement is Chalking." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluetooth spam." },
      { variants: ["Evil Twin"], correct: false, explanation: "Fake AP." }
    ]
  }),

  q(2069, 2, 4, ["Security", "Attack"], {
    variants: [
      "Sending unsolicited messages to a Bluetooth device is called:",
      "An attacker sends a digital business card to your phone via Bluetooth without permission. This is:"
    ],
    answerOptions: [
      { variants: ["Bluejacking"], correct: true, explanation: "Bluejacking is sending annoying data (spam) via Bluetooth." },
      { variants: ["Bluesnarfing"], correct: false, explanation: "Bluesnarfing is stealing data." },
      { variants: ["Bluebugging"], correct: false, explanation: "Taking control." },
      { variants: ["Pairing"], correct: false, explanation: "Legitimate connection." }
    ]
  }),

  q(2070, 2, 4, ["Security", "Attack"], {
    variants: [
      "Stealing data (contacts, emails) from a device via Bluetooth is called:",
      "Which is more dangerous: Bluejacking or [snarfing]?"
    ],
    localBank: { snarfing: ["Bluesnarfing"] },
    answerOptions: [
      { variants: ["Bluesnarfing"], correct: true, explanation: "Bluesnarfing is data theft." },
      { variants: ["Bluejacking"], correct: false, explanation: "Annoyance." },
      { variants: ["Whitewashing"], correct: false, explanation: "Not a term." },
      { variants: ["Redboxing"], correct: false, explanation: "Phone phreaking." }
    ]
  }),

  q(2071, 2, 4, ["Security", "Defense"], {
    variants: [
      "Disabling the broadcasting of the network name (SSID) is called:",
      "Security through obscurity by hiding the network name is known as:"
    ],
    answerOptions: [
      { variants: ["SSID Cloaking", "Hiding SSID"], correct: true, explanation: "Cloaking removes the SSID from beacon frames (weak security)." },
      { variants: ["MAC Filtering"], correct: false, explanation: "Filters by hardware address." },
      { variants: ["WPA"], correct: false, explanation: "Encryption." },
      { variants: ["Isolation"], correct: false, explanation: "Separating clients." }
    ]
  }),

  q(2072, 2, 4, ["Security", "Defense"], {
    variants: [
      "Allowing only specific hardware addresses to connect to Wi-Fi is:",
      "An [admin] enters a list of allowed MAC addresses. This is:"
    ],
    answerOptions: [
      { variants: ["MAC Filtering"], correct: true, explanation: "MAC filtering creates an allow-list of devices." },
      { variants: ["Port Security"], correct: false, explanation: "Wired equivalent." },
      { variants: ["Geofencing"], correct: false, explanation: "Location based." },
      { variants: ["ACL"], correct: false, explanation: "Usually IP based." }
    ]
  }),

  q(2073, 2, 4, ["Security", "Defense"], {
    variants: [
      "Restricting Wi-Fi access based on the geographic location of the device is called:",
      "MDM software disables the camera when the user enters the secure facility. This is:"
    ],
    answerOptions: [
      { variants: ["Geofencing"], correct: true, explanation: "Geofencing triggers actions based on GPS/Location borders." },
      { variants: ["Geolocation"], correct: false, explanation: "Just finding the location." },
      { variants: ["Captive Portal"], correct: false, explanation: "Web login." },
      { variants: ["Roaming"], correct: false, explanation: "Moving APs." }
    ]
  }),

  q(2074, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "High latency and jitter on a Wi-Fi call are often caused by:",
      "Voice quality is poor despite good signal strength. The likely cause is:"
    ],
    answerOptions: [
      { variants: ["Channel Utilization / Congestion"], correct: true, explanation: "If the channel is busy, devices must wait to talk, causing jitter." },
      { variants: ["Low Power"], correct: false, explanation: "Low power causes disconnects." },
      { variants: ["Wrong SSID"], correct: false, explanation: "No connection." },
      { variants: ["Fast Roaming"], correct: false, explanation: "Fixes drops, doesn't cause jitter." }
    ]
  }),

  q(2075, 2, 3, ["Hardware", "Bridge"], {
    variants: [
      "A device used to connect two wired network segments wirelessly is a:",
      "To connect a portable classroom to the main school network wirelessly, use a:"
    ],
    answerOptions: [
      { variants: ["Wireless Bridge"], correct: true, explanation: "A bridge connects two wired LANs over Wi-Fi." },
      { variants: ["Access Point"], correct: false, explanation: "Connects wireless clients to wired LAN." },
      { variants: ["Repeater"], correct: false, explanation: "Extends range." },
      { variants: ["Switch"], correct: false, explanation: "Wired only." }
    ]
  }),

  q(2076, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "What happens if two APs use the same channel and can hear each other?",
      "Co-channel interference (CCI) increases:"
    ],
    answerOptions: [
      { variants: ["Contention"], correct: true, explanation: "Devices on the same channel share airtime; they must wait for each other." },
      { variants: ["Throughput"], correct: false, explanation: "Decreases throughput." },
      { variants: ["Signal Strength"], correct: false, explanation: "Interference doesn't change signal strength of the source." },
      { variants: ["Gain"], correct: false, explanation: "No." }
    ]
  }),

  q(2077, 2, 5, ["RF", "Troubleshooting"], {
    variants: [
      "A client device keeps connecting to a distant AP instead of the closer one. This is:",
      "The 'Sticky Client' problem results in:"
    ],
    answerOptions: [
      { variants: ["Poor performance / Low data rates"], correct: true, explanation: "Connecting to a far AP means lower modulation rates (slow speed) for everyone." },
      { variants: ["Disconnection"], correct: false, explanation: "It stays connected, just poorly." },
      { variants: ["Security risk"], correct: false, explanation: "Not inherently." },
      { variants: ["Roaming"], correct: false, explanation: "It fails to roam." }
    ]
  }),

  q(2078, 2, 1, ["Wi-Fi", "Standard"], {
    variants: [
      "Which standard introduced 256-QAM modulation for higher speeds?",
      "802.11ac improved over 802.11n by using:"
    ],
    answerOptions: [
      { variants: ["256-QAM"], correct: true, explanation: "Higher QAM density packs more bits per hertz." },
      { variants: ["QPSK"], correct: false, explanation: "Legacy." },
      { variants: ["CCK"], correct: false, explanation: "Legacy (802.11b)." },
      { variants: ["FSK"], correct: false, explanation: "Legacy." }
    ]
  }),

  q(2079, 2, 4, ["Security", "Attack"], {
    variants: [
      "An attack that forces a client to disconnect from an AP by spoofing a management frame is:",
      "To capture a WPA handshake, an attacker might first launch a:"
    ],
    answerOptions: [
      { variants: ["Deauthentication Attack"], correct: true, explanation: "Sending forged Deauth frames kicks the user off, forcing a re-connect (handshake)." },
      { variants: ["Replay Attack"], correct: false, explanation: "Using old data." },
      { variants: ["IV Attack"], correct: false, explanation: "WEP attack." },
      { variants: ["Downgrade"], correct: false, explanation: "Changing protocol." }
    ]
  }),

  q(2080, 2, 4, ["Security", "WPA"], {
    variants: [
      "What is the encryption algorithm used by TKIP?",
      "WPA (Legacy) wrapped WEP keys using:"
    ],
    answerOptions: [
      { variants: ["RC4"], correct: true, explanation: "TKIP rotates keys but still relies on the underlying RC4 cipher." },
      { variants: ["AES"], correct: false, explanation: "AES is WPA2." },
      { variants: ["DES"], correct: false, explanation: "Too old." },
      { variants: ["RSA"], correct: false, explanation: "Asymmetric." }
    ]
  }),

  q(2081, 2, 5, ["RF", "Power"], {
    variants: [
      "Increasing transmit power on an AP can fix coverage holes, but it can cause:",
      "If AP power is too high, clients can hear the AP but:"
    ],
    answerOptions: [
      { variants: ["The AP cannot hear the client (Asymmetric link)"], correct: true, explanation: "Clients have weak radios. If AP shouts, client hears it, but client's whisper can't reach AP." },
      { variants: ["Interference decreases"], correct: false, explanation: "Interference increases." },
      { variants: ["Throughput increases"], correct: false, explanation: "Errors increase due to asymmetry." },
      { variants: ["Security improves"], correct: false, explanation: "Signal bleeds outside walls." }
    ]
  }),

  q(2082, 2, 1, ["Theory", "Modulation"], {
    variants: [
      "Which spread spectrum technology uses a wide frequency band and hops between sub-frequencies?",
      "Bluetooth and legacy Wi-Fi use FHSS. What is it?"
    ],
    answerOptions: [
      { variants: ["Frequency Hopping Spread Spectrum"], correct: true, explanation: "FHSS jumps frequencies to avoid interference." },
      { variants: ["DSSS"], correct: false, explanation: "Direct Sequence (802.11b)." },
      { variants: ["OFDM"], correct: false, explanation: "Orthogonal Freq Division (Modern Wi-Fi)." },
      { variants: ["QAM"], correct: false, explanation: "Modulation type." }
    ]
  }),

  q(2083, 2, 1, ["Theory", "Modulation"], {
    variants: [
      "Modern Wi-Fi (a/g/n/ac/ax) uses which multiplexing method to split data across subcarriers?",
      "High speeds in Wi-Fi are achieved using:"
    ],
    answerOptions: [
      { variants: ["OFDM / OFDMA"], correct: true, explanation: "Orthogonal Frequency Division Multiplexing splits the channel into subcarriers." },
      { variants: ["DSSS"], correct: false, explanation: "Legacy." },
      { variants: ["FHSS"], correct: false, explanation: "Legacy." },
      { variants: ["TDM"], correct: false, explanation: "Time division." }
    ]
  }),

  q(2084, 2, 3, ["Hardware", "Controller"], {
    variants: [
      "A 'Fat' or 'Autonomous' AP handles:",
      "Unlike a Lightweight AP, an Autonomous AP:"
    ],
    answerOptions: [
      { variants: ["All processing and configuration locally"], correct: true, explanation: "Autonomous APs don't need a controller; they are standalone." },
      { variants: ["Tunneling traffic to a controller"], correct: false, explanation: "That's Lightweight." },
      { variants: ["Only encryption"], correct: false, explanation: "Incomplete." },
      { variants: ["Only antennas"], correct: false, explanation: "Incomplete." }
    ]
  }),

  q(2085, 2, 3, ["Hardware", "Controller"], {
    variants: [
      "CAPWAP is the protocol used for communication between:",
      "How does a Lightweight AP talk to the WLC?"
    ],
    answerOptions: [
      { variants: ["AP and Wireless Controller"], correct: true, explanation: "Control And Provisioning of Wireless Access Points (CAPWAP) is the standard tunnel." },
      { variants: ["Client and AP"], correct: false, explanation: "That's 802.11." },
      { variants: ["Controller and Router"], correct: false, explanation: "That's Ethernet/IP." },
      { variants: ["AP and Radius"], correct: false, explanation: "That's RADIUS." }
    ]
  }),

  q(2086, 2, 5, ["Troubleshooting", "Auth"], {
    variants: [
      "A user enters the correct WPA2-PSK but cannot connect. Other users are fine. The [admin] checks the ACL. What is the cause?",
      "If MAC Filtering is enabled, what error does a new device encounter?"
    ],
    answerOptions: [
      { variants: ["Association denied"], correct: true, explanation: "The AP rejects the association request because the MAC is not on the list." },
      { variants: ["Wrong password"], correct: false, explanation: "Password was correct." },
      { variants: ["DHCP timeout"], correct: false, explanation: "Happens after association." },
      { variants: ["DNS failure"], correct: false, explanation: "Happens after IP." }
    ]
  }),

  q(2087, 2, 1, ["Wi-Fi", "MIMO"], {
    variants: [
      "A 2x2:2 MIMO notation indicates:",
      "An AP with 4 transmit antennas and 4 receive antennas is:"
    ],
    answerOptions: [
      { variants: ["2 Transmit, 2 Receive antennas"], correct: true, explanation: "Tx x Rx : Spatial Streams." },
      { variants: ["2 GHz and 2.4 GHz"], correct: false, explanation: "Frequency." },
      { variants: ["2 Mbps"], correct: false, explanation: "Speed." },
      { variants: ["2 Clients"], correct: false, explanation: "Clients." }
    ]
  }),

  q(2088, 2, 4, ["Security", "Attack"], {
    variants: [
      "An Evil Twin attack works by:",
      "Why do clients connect to a hacker's rogue AP instead of the corporate one?"
    ],
    answerOptions: [
      { variants: ["Using the same SSID and higher power"], correct: true, explanation: "Clients automatically roam to the strongest signal with a known SSID." },
      { variants: ["Cracking the password"], correct: false, explanation: "Not required for Evil Twin setup." },
      { variants: ["Injecting packets"], correct: false, explanation: "Packet injection is different." },
      { variants: ["Using a different channel"], correct: false, explanation: "Channel doesn't force connection." }
    ]
  }),

  q(2089, 2, 3, ["Survey", "Hardware"], {
    variants: [
      "To perform an active site survey, the [admin] must:",
      "What distinguishes an active survey from a passive one?"
    ],
    answerOptions: [
      { variants: ["Connect to the APs and transfer data"], correct: true, explanation: "Active surveys measure real-world throughput and packet loss." },
      { variants: ["Just listen"], correct: false, explanation: "Passive." },
      { variants: ["Use floor plans"], correct: false, explanation: "Predictive." },
      { variants: ["Install the APs"], correct: false, explanation: "Deployment." }
    ]
  }),

  q(2090, 2, 5, ["RF", "Physics"], {
    variants: [
      "The loss of signal strength as it passes through the air (even without obstacles) is:",
      "Why does a signal get weaker the further it travels in open space?"
    ],
    answerOptions: [
      { variants: ["Free Space Path Loss (FSPL)"], correct: true, explanation: "Signal disperses over distance (inverse square law)." },
      { variants: ["Absorption"], correct: false, explanation: "Requires material." },
      { variants: ["Refraction"], correct: false, explanation: "Bending." },
      { variants: ["Gain"], correct: false, explanation: "Increase." }
    ]
  }),

  q(2091, 2, 5, ["Site Survey", "Planning"], {
    variants: [
      "Which type of wireless site survey involves simulating the network environment using software and floor plans without physically visiting the site?",
      "An [admin] estimates coverage using a CAD drawing and wall material definitions. What type of survey is this?",
      "Before buying equipment, you create a heat map based on blueprints. This is a:"
    ],
    answerOptions: [
      { variants: ["Predictive Survey"], correct: true, explanation: "Predictive surveys use software models to estimate coverage based on floor plans and wall materials." },
      { variants: ["Passive Survey"], correct: false, explanation: "Passive surveys involve walking the site listening to signals." },
      { variants: ["Active Survey"], correct: false, explanation: "Active surveys involve connecting to APs and testing throughput." },
      { variants: ["Post-deployment Survey"], correct: false, explanation: "This happens after installation." }
    ]
  }),

  q(2092, 2, 3, ["Antenna", "Polarization"], {
    variants: [
      "If a transmitting antenna is vertical, the receiving antenna should also be vertical to avoid signal loss. What concept is this?",
      "An [admin] notices poor signal on a point-to-point link because one antenna is rotated 90 degrees relative to the other. What is the issue?",
      "Matching the orientation of the electric field of the radio wave is known as:"
    ],
    answerOptions: [
      { variants: ["Polarization"], correct: true, explanation: "Antennas must have matching polarization (e.g., both vertical) to transfer maximum energy." },
      { variants: ["Gain mismatch"], correct: false, explanation: "Gain refers to power amplification." },
      { variants: ["Attenuation"], correct: false, explanation: "Attenuation is signal loss over distance." },
      { variants: ["Refraction"], correct: false, explanation: "Refraction is bending of the wave." }
    ]
  }),

  q(2093, 2, 3, ["Controller", "Protocols"], {
    variants: [
      "Which standard protocol is used for communication between a Lightweight Access Point (LWAP) and a Wireless Controller (WLC)?",
      "To manage APs centrally, the [device]s create a tunnel back to the controller using:",
      "An [admin] sees traffic on UDP ports 5246/5247. What protocol is managing the wireless network?"
    ],
    answerOptions: [
      { variants: ["CAPWAP", "Control and Provisioning of Wireless Access Points"], correct: true, explanation: "CAPWAP is the standard protocol for tunneling traffic between an AP and a WLC." },
      { variants: ["LWAPP"], correct: false, explanation: "LWAPP is the legacy Cisco-proprietary predecessor to CAPWAP." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP monitors status but doesn't tunnel client traffic." },
      { variants: ["RDP"], correct: false, explanation: "RDP is for remote desktop." }
    ]
  }),

  q(2094, 2, 4, ["Security", "Attack"], {
    variants: [
      "The act of driving around a neighborhood or business district scanning for open or insecure Wi-Fi networks is called:",
      "An [attacker] uses a GPS and a high-gain antenna to map vulnerable [wap]s from a car. This is:",
      "Chalking symbols on a sidewalk to indicate an open Wi-Fi network (War Chalking) is related to which activity?"
    ],
    answerOptions: [
      { variants: ["War Driving"], correct: true, explanation: "War Driving is the act of searching for Wi-Fi networks by a moving vehicle." },
      { variants: ["Evil Twin"], correct: false, explanation: "Evil Twin is mimicking a specific AP." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking targets Bluetooth." },
      { variants: ["Packet Sniffing"], correct: false, explanation: "Packet sniffing captures data, but isn't specifically the act of driving/mapping." }
    ]
  }),

  q(2095, 2, 1, ["Performance", "Metrics"], {
    variants: [
      "Due to protocol overhead (headers, acknowledgments), the actual amount of useful application data transferred over Wi-Fi is called:",
      "While the 'Data Rate' might be 1200 Mbps, the actual file transfer speed is lower. This effective speed is:",
      "The measure of usable data delivered to the application layer, excluding management overhead, is:"
    ],
    answerOptions: [
      { variants: ["Goodput"], correct: true, explanation: "Goodput is the application-level throughput (useful data), usually significantly lower than the raw data rate." },
      { variants: ["Throughput"], correct: false, explanation: "Throughput includes headers and overhead." },
      { variants: ["Bandwidth"], correct: false, explanation: "Bandwidth is the theoretical maximum capacity." },
      { variants: ["RSSI"], correct: false, explanation: "RSSI is signal strength." }
    ]
  }),

  q(2096, 2, 1, ["Wi-Fi 6", "Efficiency"], {
    variants: [
      "Which Wi-Fi 6 (802.11ax) feature allows IoT devices to schedule when they wake up to communicate, significantly saving battery life?",
      "To reduce power consumption on sensors, the AP schedules specific check-in times using:",
      "An [admin] deploys 802.11ax to improve battery life for mobile devices. Which feature handles this?"
    ],
    answerOptions: [
      { variants: ["Target Wake Time (TWT)"], correct: true, explanation: "TWT allows devices to sleep for long periods and wake only at scheduled intervals." },
      { variants: ["OFDMA"], correct: false, explanation: "OFDMA handles channel efficiency, not sleep scheduling." },
      { variants: ["MIMO"], correct: false, explanation: "MIMO increases throughput." },
      { variants: ["WPA3"], correct: false, explanation: "WPA3 is for security." }
    ]
  }),

  q(2097, 2, 3, ["Deployment", "Bridging"], {
    variants: [
      "An [admin] needs to connect a wired printer to the Wi-Fi network because it has no wireless card. What device mode is needed?",
      "Which mode allows a wireless device to act as a client to an AP and convert the signal to Ethernet for a wired device?",
      "Connecting two wired LAN segments wirelessly requires the APs to be in which mode?"
    ],
    answerOptions: [
      { variants: ["Bridge Mode", "Workgroup Bridge"], correct: true, explanation: "Bridge mode connects two wired segments (or a wired device) via wireless." },
      { variants: ["Repeater Mode"], correct: false, explanation: "Repeater mode extends wireless range but cuts bandwidth." },
      { variants: ["Root Mode"], correct: false, explanation: "Root mode is the standard AP function." },
      { variants: ["Scanner Mode"], correct: false, explanation: "Scanner mode is for IDS/IPS monitoring." }
    ]
  }),

  q(2098, 2, 5, ["Troubleshooting", "Capacity"], {
    variants: [
      "What happens when too many clients connect to a single [wap] using a legacy standard like 802.11g?",
      "An [admin] investigates why the Wi-Fi is slow. They find 50 devices on one AP sharing a 54Mbps link. This is an issue of:",
      "Because Wi-Fi is a shared medium, adding more clients increases:"
    ],
    answerOptions: [
      { variants: ["Contention", "Congestion"], correct: true, explanation: "Wi-Fi is a shared medium; devices must compete (contend) for airtime. More devices = higher contention." },
      { variants: ["Attenuation"], correct: false, explanation: "Attenuation is signal loss due to distance/obstacles." },
      { variants: ["Refraction"], correct: false, explanation: "Refraction is signal bending." },
      { variants: ["Crosstalk"], correct: false, explanation: "Crosstalk is interference between wires." }
    ]
  }),

  q(2099, 2, 3, ["Antenna", "Types"], {
    variants: [
      "Which antenna type creates a focused beam and has a high gain (dBi), but a very narrow coverage angle?",
      "To connect two buildings 2 miles apart, which antenna should the [admin] choose?",
      "A Yagi or Parabolic Dish is classified as:"
    ],
    answerOptions: [
      { variants: ["Directional", "High-Gain"], correct: true, explanation: "Directional antennas focus energy in one direction to travel further distances." },
      { variants: ["Omnidirectional"], correct: false, explanation: "Omni antennas radiate in all directions (low gain)." },
      { variants: ["Dipole"], correct: false, explanation: "Dipole is a standard omni antenna." },
      { variants: ["Patch"], correct: false, explanation: "Patch is semi-directional (wider angle than Yagi)." }
    ]
  }),

  q(2100, 2, 4, ["Security", "Threats"], {
    variants: [
      "An [attacker] sends unsolicited messages to a Bluetooth-enabled device. This annoyance attack is called:",
      "A user receives an anonymous contact card on their phone in a coffee shop via Bluetooth. This is:",
      "Which Bluetooth attack involves sending data but does not steal data?"
    ],
    answerOptions: [
      { variants: ["Bluejacking"], correct: true, explanation: "Bluejacking is sending unsolicited messages via Bluetooth." },
      { variants: ["Bluesnarfing"], correct: false, explanation: "Bluesnarfing is stealing data via Bluetooth." },
      { variants: ["Evil Twin"], correct: false, explanation: "Evil Twin is a Wi-Fi attack." },
      { variants: ["NFC Replay"], correct: false, explanation: "NFC is near-field, not Bluetooth." }
    ]
  }),

 // ==========================================
// DOMAIN 3: NETWORK MANAGEMENT (50Q)
// ==========================================

// --- POLICIES & AGREEMENTS ---

  q(3001, 3, 1, ["Policy", "SLA"], {
    variants: [
      "Which document is a legally binding contract that defines specific performance metrics, such as 99.9% uptime, that a vendor must meet?",
      "An [admin] reviews a contract detailing financial penalties if the ISP fails to provide guaranteed bandwidth. What is this document?",
      "Which agreement establishes the specific service expectations and responsibilities between a [company] and a service provider?"
    ],
    answerOptions: [
      { variants: ["Service Level Agreement (SLA)"], correct: true, explanation: "An SLA is a binding contract that defines metrics (uptime, latency) and penalties for failure." },
      { variants: ["Memorandum of Understanding (MOU)"], correct: false, explanation: "MOUs are generally non-binding agreements of intent." },
      { variants: ["Non-Disclosure Agreement (NDA)"], correct: false, explanation: "NDAs protect confidential information." },
      { variants: ["Statement of Work (SOW)"], correct: false, explanation: "SOW defines project specifics, not ongoing performance metrics." }
    ]
  }),

  q(3002, 3, 3, ["Protocol", "Monitoring"], {
    variants: [
      "Which protocol is used to query and monitor the status of [device]s (like CPU usage on a [router])?",
      "An [admin] configures a Network Management System (NMS) to poll switches for bandwidth utilization. Which protocol is used?",
      "Which Application Layer protocol relies on Agents, Managers, and MIBs?"
    ],
    answerOptions: [
      { variants: ["SNMP"], correct: true, explanation: "Simple Network Management Protocol (SNMP) is the standard for monitoring and managing network devices." },
      { variants: ["SMTP"], correct: false, explanation: "SMTP is for email." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog pushes logs, it doesn't typically allow polling/querying of specific variables." },
      { variants: ["NTP"], correct: false, explanation: "NTP syncs time." }
    ]
  }),

  q(3003, 3, 4, ["Tools", "Traffic"], {
    variants: [
      "You need to identify which computer is using the most bandwidth on the network. Which tool is most appropriate?",
      "An [admin] needs to see flow metadata (Source IP, Dest IP, Volume) to find a bandwidth hog. What should they use?",
      "Which technology exports traffic statistics to a collector without capturing the full packet payload?"
    ],
    answerOptions: [
      { variants: ["NetFlow Analyzer", "NetFlow"], correct: true, explanation: "NetFlow captures metadata about traffic flow, perfect for bandwidth analysis without the overhead of full packet capture." },
      { variants: ["Wireshark", "Packet Sniffer"], correct: false, explanation: "Wireshark captures full packets; effective but overkill and storage-heavy for simple bandwidth monitoring." },
      { variants: ["Ping"], correct: false, explanation: "Ping tests connectivity." },
      { variants: ["Traceroute"], correct: false, explanation: "Traceroute shows the path." }
    ]
  }),

  q(3004, 3, 5, ["Recovery", "Metrics"], {
    variants: [
      "Which disaster recovery metric defines the maximum amount of time a service is allowed to be down before it must be restored?",
      "The [company] policy states that email must be restored within 4 hours of an outage. This 4-hour window is the:",
      "To determine priority during a disaster, the [manager] looks at which time-based metric?"
    ],
    answerOptions: [
      { variants: ["Recovery Time Objective (RTO)"], correct: true, explanation: "RTO is the target time to restore a business process after a disruption." },
      { variants: ["Recovery Point Objective (RPO)"], correct: false, explanation: "RPO is the acceptable data loss (time since last backup)." },
      { variants: ["MTBF"], correct: false, explanation: "MTBF is reliability (time between failures)." },
      { variants: ["MTTR"], correct: false, explanation: "MTTR is the average time to fix a specific failed component." }
    ]
  }),

  q(3005, 3, 1, ["Policy", "Project"], {
    variants: [
      "Which document typically outlines the specific tasks, deliverables, and timeline for a project?",
      "A consultant is hired to install 50 [wap]s. Which document details exactly what they will do and when?",
      "An [admin] refers to a document to verify if the vendor is responsible for cabling cleanup. Which doc is this?"
    ],
    answerOptions: [
      { variants: ["Statement of Work (SOW)"], correct: true, explanation: "An SOW provides specific details on deliverables, timelines, and scope for a project." },
      { variants: ["SLA"], correct: false, explanation: "SLA defines performance levels (uptime)." },
      { variants: ["MOU"], correct: false, explanation: "MOU is a high-level agreement." },
      { variants: ["MSA"], correct: false, explanation: "MSA is the master contract covering general terms." }
    ]
  }),

  q(3006, 3, 3, ["Logs", "Syslog"], {
    variants: [
      "In the Syslog standard, a severity level of 0 indicates what?",
      "A [router] sends a Syslog message with Severity Level 0. How urgent is this?",
      "Which Syslog level represents a system that is unusable?"
    ],
    answerOptions: [
      { variants: ["Emergency", "Level 0"], correct: true, explanation: "Level 0 (Emergency) means the system is unusable." },
      { variants: ["Alert", "Level 1"], correct: false, explanation: "Alert (1) means action must be taken immediately." },
      { variants: ["Critical", "Level 2"], correct: false, explanation: "Critical (2) means critical conditions." },
      { variants: ["Error", "Level 3"], correct: false, explanation: "Error (3) means error conditions." }
    ]
  }),

  q(3007, 3, 2, ["Tools", "Scanning"], {
    variants: [
      "You want to quickly identify which IP addresses on a subnet are currently active. Which Nmap scan type should you use?",
      "An [admin] needs to map out live hosts in the 192.168.10.0/24 range without checking ports. What scan is best?",
      "Which technique sends ICMP Echo Requests to a range of addresses to see who responds?"
    ],
    answerOptions: [
      { variants: ["Ping Sweep", "ICMP Sweep"], correct: true, explanation: "A Ping Sweep checks for live hosts by sending ICMP requests to a range of IPs." },
      { variants: ["Port Scan"], correct: false, explanation: "Port scanning checks for open services on a specific host." },
      { variants: ["Vulnerability Scan"], correct: false, explanation: "Vuln scanning checks for security flaws." },
      { variants: ["Trap Scan"], correct: false, explanation: "Not a standard term." }
    ]
  }),

  q(3008, 3, 1, ["Policy", "Legal"], {
    variants: [
      "Which agreement typically outlines a mutual intent between two parties to work together but is generally not legally binding?",
      "Two government agencies agree to share fiber infrastructure. They sign a document expressing this intent. What is it?",
      "Which document sits between a handshake and a legally binding contract?"
    ],
    answerOptions: [
      { variants: ["Memorandum of Understanding (MOU)"], correct: true, explanation: "An MOU expresses a convergence of will between parties but lacks the binding power of a contract." },
      { variants: ["SLA"], correct: false, explanation: "SLAs are binding performance contracts." },
      { variants: ["NDA"], correct: false, explanation: "NDAs are binding legal contracts regarding secrecy." },
      { variants: ["Contract"], correct: false, explanation: "Contracts are binding." }
    ]
  }),

  q(3009, 3, 3, ["Protocol", "Time"], {
    variants: [
      "Why is the Network Time Protocol (NTP) critical for log management and security forensics?",
      "An [admin] cannot correlate an attack across the [firewall] and [server] logs. What is the likely cause?",
      "To ensure an accurate timeline of events during an incident response, all [device]s must use:"
    ],
    answerOptions: [
      { variants: ["It ensures timestamps correlate", "Time Synchronization"], correct: true, explanation: "Without synchronized time (NTP), logs from different devices cannot be correlated to reconstruct an event." },
      { variants: ["It encrypts the logs"], correct: false, explanation: "NTP does not encrypt logs; TLS does." },
      { variants: ["It compresses logs"], correct: false, explanation: "NTP does not handle compression." },
      { variants: ["It authenticates users"], correct: false, explanation: "NTP is not an authentication protocol." }
    ]
  }),

  q(3010, 3, 4, ["Tools", "Mirroring"], {
    variants: [
      "Which switch feature allows you to copy all traffic from one port to another port for analysis by a packet sniffer?",
      "To use an IDS without interrupting network flow, an [admin] configures:",
      "How can you monitor traffic on a specific port without using a physical TAP?"
    ],
    answerOptions: [
      { variants: ["Port Mirroring", "SPAN", "Switched Port Analyzer"], correct: true, explanation: "Port Mirroring (SPAN) duplicates traffic from source ports to a destination port for monitoring." },
      { variants: ["VLAN Tagging"], correct: false, explanation: "Tagging identifies VLANs." },
      { variants: ["Trunking"], correct: false, explanation: "Trunking carries multiple VLANs." },
      { variants: ["Port Security"], correct: false, explanation: "Port Security limits MAC addresses." }
    ]
  }),

  q(3011, 3, 5, ["Recovery", "Site"], {
    variants: [
      "Which type of disaster recovery site is fully equipped with hardware and real-time data replication, allowing for immediate switchover?",
      "[company] requires zero downtime in a disaster. Which recovery site model should they choose?",
      "A failover site that is up and running 24/7 with current data is called a:"
    ],
    answerOptions: [
      { variants: ["Hot Site"], correct: true, explanation: "A Hot Site is a fully mirrored duplicate ready to take over instantly." },
      { variants: ["Warm Site"], correct: false, explanation: "Warm sites have hardware but need data restoration." },
      { variants: ["Cold Site"], correct: false, explanation: "Cold sites are empty shells with power/cooling only." },
      { variants: ["Cloud Site"], correct: false, explanation: "Cloud can be hot/warm/cold depending on config; Hot Site is the specific term." }
    ]
  }),

  q(3012, 3, 1, ["Admin", "Performance"], {
    variants: [
      "The process of measuring and recording the performance of a network under normal conditions to serve as a reference point is called:",
      "An [admin] needs to know if CPU usage is abnormal. They compare current stats against the:",
      "To detect anomalies, you must first establish a:"
    ],
    answerOptions: [
      { variants: ["Baseline", "Baselining"], correct: true, explanation: "Baselining establishes standard performance metrics so deviations can be identified." },
      { variants: ["Auditing"], correct: false, explanation: "Auditing checks for compliance." },
      { variants: ["Sniffing"], correct: false, explanation: "Sniffing captures packets." },
      { variants: ["Scanning"], correct: false, explanation: "Scanning looks for open ports/hosts." }
    ]
  }),

  q(3013, 3, 2, ["Protocol", "Discovery"], {
    variants: [
      "Which vendor-neutral protocol allows network [device]s to advertise their identity and capabilities to neighbors?",
      "An [admin] wants to see what switch is connected to a router interface, but the devices are from different vendors. Which protocol works?",
      "What is the IEEE standard equivalent to Cisco's CDP?"
    ],
    answerOptions: [
      { variants: ["LLDP", "Link Layer Discovery Protocol"], correct: true, explanation: "LLDP (802.1AB) is the industry standard for neighbor discovery." },
      { variants: ["CDP"], correct: false, explanation: "CDP is Cisco Proprietary." },
      { variants: ["OSPF"], correct: false, explanation: "OSPF is a routing protocol." },
      { variants: ["BGP"], correct: false, explanation: "BGP is a routing protocol." }
    ]
  }),

  q(3014, 3, 5, ["Recovery", "Metrics"], {
    variants: [
      "Which disaster recovery metric defines the maximum amount of data loss (measured in time) that is acceptable?",
      "If [company] states they can afford to lose up to 1 hour of data, which metric is set to 1 hour?",
      "Which metric dictates how frequently backups must be run?"
    ],
    answerOptions: [
      { variants: ["RPO", "Recovery Point Objective"], correct: true, explanation: "RPO defines the maximum age of files that must be recovered (e.g., restore to 1 hour ago)." },
      { variants: ["RTO"], correct: false, explanation: "RTO defines how fast the system must be back online." },
      { variants: ["MTBF"], correct: false, explanation: "MTBF is reliability." },
      { variants: ["MTTR"], correct: false, explanation: "MTTR is repair speed." }
    ]
  }),

  q(3015, 3, 3, ["Protocol", "Security"], {
    variants: [
      "Which version of SNMP introduced cryptographic security, including encryption and authentication?",
      "To prevent attackers from reading network stats in cleartext, an [admin] should migrate to which SNMP version?",
      "Which management protocol supports the 'AuthPriv' security level?"
    ],
    answerOptions: [
      { variants: ["SNMPv3"], correct: true, explanation: "SNMPv3 adds authentication and encryption (AuthPriv). v1 and v2c use cleartext community strings." },
      { variants: ["SNMPv2c"], correct: false, explanation: "v2c is cleartext." },
      { variants: ["SNMPv1"], correct: false, explanation: "v1 is cleartext." },
      { variants: ["HTTPS"], correct: false, explanation: "HTTPS manages via web, not SNMP." }
    ]
  }),

  q(3016, 3, 4, ["Tools", "Traffic"], {
    variants: [
      "Wireshark is best described as which type of network tool?",
      "Which software allows an [admin] to perform deep packet inspection and view the hex contents of frames?",
      "To debug a specific handshake failure, you would use a:"
    ],
    answerOptions: [
      { variants: ["Packet Analyzer", "Sniffer", "Protocol Analyzer"], correct: true, explanation: "Wireshark captures and decodes the actual data packets on the wire." },
      { variants: ["Flow Collector"], correct: false, explanation: "Flow collectors (NetFlow) see metadata, not packet contents." },
      { variants: ["IPS"], correct: false, explanation: "IPS is an active security device." },
      { variants: ["Load Balancer"], correct: false, explanation: "Load balancers distribute traffic." }
    ]
  }),

  q(3017, 3, 1, ["Documentation", "Diagrams"], {
    variants: [
      "Which type of network diagram depicts the real-world arrangement of racks, cable runs, and [device] locations?",
      "To find exactly where a server is physically located in the data center, which diagram do you check?",
      "A diagram showing 'Rack 4, Unit 12' is a:"
    ],
    answerOptions: [
      { variants: ["Physical Network Diagram"], correct: true, explanation: "Physical diagrams show real-world locations, cabling, and hardware layouts." },
      { variants: ["Logical Network Diagram"], correct: false, explanation: "Logical diagrams show IP flow, subnets, and routing relationships." },
      { variants: ["Data Flow Chart"], correct: false, explanation: "Flow charts show process steps." },
      { variants: ["Block Diagram"], correct: false, explanation: "Block diagrams show high-level functional blocks." }
    ]
  }),

  q(3018, 3, 5, ["Recovery", "Site"], {
    variants: [
      "A disaster recovery site that has power and connectivity but requires you to bring and install your own servers is called a:",
      "[company] rents a facility with HVAC and internet, but no hardware. What type of site is this?",
      "Which recovery site option is cheapest but takes the longest to bring online?"
    ],
    answerOptions: [
      { variants: ["Cold Site"], correct: true, explanation: "A Cold Site provides the facility (power/cooling/net) but no IT equipment." },
      { variants: ["Warm Site"], correct: false, explanation: "Warm sites have hardware but need data restoration." },
      { variants: ["Hot Site"], correct: false, explanation: "Hot sites are fully mirrored and ready." },
      { variants: ["Mobile Site"], correct: false, explanation: "Mobile sites are trailers/pods." }
    ]
  }),

  q(3019, 3, 2, ["Tools", "Nmap"], {
    variants: [
      "OS Fingerprinting is a technique used by scanning tools like Nmap to determine:",
      "By analyzing how a TCP/IP stack responds to malformed packets, a scanner can identify:",
      "An [attacker] uses a scan to find out if a server is running Windows or Linux. This technique is:"
    ],
    answerOptions: [
      { variants: ["The Operating System", "Target OS"], correct: true, explanation: "OS Fingerprinting analyzes unique TCP/IP stack behaviors to guess the operating system." },
      { variants: ["Physical Location"], correct: false, explanation: "IPs don't reveal precise physical location." },
      { variants: ["Administrator Password"], correct: false, explanation: "Scanning doesn't reveal passwords (that's cracking)." },
      { variants: ["Switch Vendor"], correct: false, explanation: "MAC OUI reveals vendor, but 'OS Fingerprinting' refers specifically to the OS." }
    ]
  }),

  q(3020, 3, 3, ["Protocol", "Ports"], {
    variants: [
      "Which port does the Syslog protocol use by default for sending log messages?",
      "To allow standard logging traffic through a [firewall], which UDP port must be open?",
      "An [admin] sees traffic on UDP 514. What is this?"
    ],
    answerOptions: [
      { variants: ["UDP 514", "514"], correct: true, explanation: "Syslog standardly uses UDP port 514." },
      { variants: ["TCP 6514"], correct: false, explanation: "TCP 6514 is used for Syslog over TLS (secure)." },
      { variants: ["UDP 161"], correct: false, explanation: "161 is SNMP." },
      { variants: ["UDP 123"], correct: false, explanation: "123 is NTP." }
    ]
  }),

  q(3021, 3, 1, ["Admin", "Maintenance"], {
    variants: [
      "What term describes the situation where a system's configuration changes over time due to undocumented updates?",
      "When servers slowly deviate from the 'Gold Standard' configuration because of manual hotfixes, this is called:",
      "Using 'Infrastructure as Code' helps prevent which common maintenance issue?"
    ],
    answerOptions: [
      { variants: ["Configuration Drift"], correct: true, explanation: "Drift occurs when ad-hoc changes accumulate, causing systems to differ from the baseline." },
      { variants: ["Patching"], correct: false, explanation: "Patching is the act of updating." },
      { variants: ["System Rot"], correct: false, explanation: "A slang term, but Config Drift is the technical answer." },
      { variants: ["Hardening"], correct: false, explanation: "Hardening is securing a system." }
    ]
  }),

  q(3022, 3, 4, ["Hardware", "Tools"], {
    variants: [
      "Which hardware device is inserted inline on a network cable to provide a copy of traffic without dropping packets?",
      "To get 100% reliable packet capture on a fiber link without relying on the switch CPU, use a:",
      "Unlike SPAN ports, this device creates a physical copy of the signal for the IDS."
    ],
    answerOptions: [
      { variants: ["Network TAP", "Test Access Point"], correct: true, explanation: "A TAP physically splits the signal, ensuring the monitor sees 100% of traffic, including errors." },
      { variants: ["Hub"], correct: false, explanation: "Hubs are half-duplex and cause collisions." },
      { variants: ["Switch"], correct: false, explanation: "Switches use SPAN ports, which can drop packets if oversubscribed." },
      { variants: ["Router"], correct: false, explanation: "Routers route traffic, they don't split it for monitoring." }
    ]
  }),

  q(3023, 3, 5, ["Hardware", "Metrics"], {
    variants: [
      "MTBF (Mean Time Between Failures) is a metric primarily used to measure:",
      "A hard drive manufacturer states their drive lasts 1 million hours. This metric is:",
      "Which metric predicts the expected reliability or lifespan of a hardware component?"
    ],
    answerOptions: [
      { variants: ["Hardware Reliability", "Reliability"], correct: true, explanation: "MTBF predicts the average lifespan before a failure occurs." },
      { variants: ["Repair Speed"], correct: false, explanation: "Repair speed is MTTR (Mean Time To Repair)." },
      { variants: ["Availability"], correct: false, explanation: "Availability is a percentage derived from MTBF and MTTR." },
      { variants: ["Data Loss"], correct: false, explanation: "Data loss limits are RPO." }
    ]
  }),

  q(3024, 3, 3, ["Protocol", "Structure"], {
    variants: [
      "The structured database of variables on a network [device] that an SNMP manager queries is called the:",
      "To query the CPU load via SNMP, you need the correct OID from the:",
      "Which component of SNMP defines the hierarchy of objects available to be monitored?"
    ],
    answerOptions: [
      { variants: ["MIB", "Management Information Base"], correct: true, explanation: "The MIB is the database structure/schema on the device." },
      { variants: ["OID"], correct: false, explanation: "The OID is the specific address of a variable WITHIN the MIB." },
      { variants: ["Trap"], correct: false, explanation: "A Trap is a message sent by the agent." },
      { variants: ["Get Request"], correct: false, explanation: "Get is the command used to query." }
    ]
  }),

  q(3025, 3, 1, ["Documentation", "Process"], {
    variants: [
      "A document containing step-by-step instructions for performing a routine technical task is known as a:",
      "To ensure consistency when onboarding new users, the [admin] follows a:",
      "Which document helps junior technicians perform complex tasks without needing constant supervision?"
    ],
    answerOptions: [
      { variants: ["SOP", "Standard Operating Procedure"], correct: true, explanation: "SOPs provide detailed instructions for routine tasks to ensure quality and consistency." },
      { variants: ["SLA"], correct: false, explanation: "SLA is a performance contract." },
      { variants: ["NDA"], correct: false, explanation: "NDA is for secrecy." },
      { variants: ["AUP"], correct: false, explanation: "AUP rules for user behavior." }
    ]
  }),

  q(3026, 3, 2, ["Protocol", "Admin"], {
    variants: [
      "Which technology allows an [admin] to power on a computer remotely by sending a specific 'Magic Packet'?",
      "To patch computers at night without driving to the office, the [admin] uses this feature to boot them:",
      "What feature must be enabled in the BIOS/NIC to allow remote boot via network?"
    ],
    answerOptions: [
      { variants: ["Wake-on-LAN", "WoL"], correct: true, explanation: "WoL allows a sleeping computer to wake up when it receives a specific broadcast frame (Magic Packet)." },
      { variants: ["PoE"], correct: false, explanation: "PoE provides electrical power, but doesn't control the boot logic itself." },
      { variants: ["PXE"], correct: false, explanation: "PXE is for booting an OS from the network, typically after the machine is already powered on." },
      { variants: ["IPMI"], correct: false, explanation: "IPMI is a more advanced OOB management, but WoL is the specific 'Magic Packet' technology." }
    ]
  }),

  q(3027, 3, 3, ["Protocol", "Admin"], {
    variants: [
      "Which protocol provides a secure, encrypted command-line interface for remote [device] management?",
      "An [admin] disables Telnet and replaces it with this protocol on port 22:",
      "To securely configure a remote Linux server or [router], use:"
    ],
    answerOptions: [
      { variants: ["SSH", "Secure Shell"], correct: true, explanation: "SSH encrypts the session, protecting credentials and commands." },
      { variants: ["Telnet"], correct: false, explanation: "Telnet is insecure (cleartext)." },
      { variants: ["RDP"], correct: false, explanation: "RDP is for GUI access (Windows)." },
      { variants: ["VNC"], correct: false, explanation: "VNC is for GUI access." }
    ]
  }),

  q(3028, 3, 4, ["Traffic", "Analysis"], {
    variants: [
      "In network monitoring, the term 'Top Talkers' refers to:",
      "An [admin] runs a NetFlow report to find the source of congestion. They are looking for:",
      "Which report identifies the specific hosts consuming the most bandwidth?"
    ],
    answerOptions: [
      { variants: ["Hosts consuming the most bandwidth"], correct: true, explanation: "Top Talkers are the specific IP addresses generating the most traffic." },
      { variants: ["Admins with the most logins"], correct: false, explanation: "This is a security audit log." },
      { variants: ["Routers with high CPU"], correct: false, explanation: "This is device health monitoring." },
      { variants: ["Servers with most storage"], correct: false, explanation: "This is storage management." }
    ]
  }),

  q(3029, 3, 5, ["Resilience", "Hardware"], {
    variants: [
      "In a High Availability cluster, which mode allows both devices to process traffic simultaneously?",
      "[company] wants to utilize the full bandwidth of both firewalls in their cluster. Which mode should be used?",
      "Unlike Active/Passive, this failover mode distributes load across all nodes:"
    ],
    answerOptions: [
      { variants: ["Active/Active"], correct: true, explanation: "Active/Active uses all nodes to process traffic, increasing capacity and redundancy." },
      { variants: ["Active/Passive"], correct: false, explanation: "Active/Passive has one node idle, waiting for failure." },
      { variants: ["Failover"], correct: false, explanation: "Failover is the *action* of switching, not the mode itself." },
      { variants: ["Cold Standby"], correct: false, explanation: "Cold standby requires manual intervention." }
    ]
  }),

  q(3030, 3, 2, ["Tools", "Security"], {
    variants: [
      "You need to determine which services are running on a server. Which activity would give you this information?",
      "To check if a web server is listening on port 80 or 443, an [admin] performs a:",
      "An [attacker] performs this action to map out the attack surface of a target [device]:"
    ],
    answerOptions: [
      { variants: ["Port Scanning"], correct: true, explanation: "Port scanning identifies open ports, which correspond to running services." },
      { variants: ["Ping Sweep"], correct: false, explanation: "Ping sweep finds live hosts, not specific services." },
      { variants: ["DNS Query"], correct: false, explanation: "DNS resolves names to IPs." },
      { variants: ["Route Tracing"], correct: false, explanation: "Tracing shows the path." }
    ]
  }),

  q(3031, 3, 3, ["Monitoring", "Flow"], {
    variants: [
      "Which protocol is commonly used to export traffic flow metadata from a [router] to a collector?",
      "Cisco devices use this proprietary protocol to send IP statistics to an analyzer:",
      "To analyze traffic patterns without full packet capture, enable:"
    ],
    answerOptions: [
      { variants: ["NetFlow"], correct: true, explanation: "NetFlow exports 5-tuple metadata about IP traffic flows." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP polls device status/counters, but doesn't export detailed flow data." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog exports text logs." },
      { variants: ["NTP"], correct: false, explanation: "NTP syncs time." }
    ]
  }),

  q(3032, 3, 3, ["Monitoring", "Switching"], {
    variants: [
      "sFlow is best described as:",
      "Which monitoring technology captures only 1 out of every N packets to reduce overhead?",
      "An [admin] enables 'sampled' flow monitoring on a high-speed switch. This is likely:"
    ],
    answerOptions: [
      { variants: ["Sampled traffic flow monitoring"], correct: true, explanation: "sFlow takes random samples of packets to estimate traffic stats with low overhead." },
      { variants: ["Full packet capture"], correct: false, explanation: "Full capture is Wireshark/TAP." },
      { variants: ["Active monitoring"], correct: false, explanation: "Active implies generating synthetic traffic (like IPSLA)." },
      { variants: ["Routing protocol"], correct: false, explanation: "sFlow is for monitoring, not routing." }
    ]
  }),

  q(3033, 3, 1, ["Process", "Change"], {
    variants: [
      "Which best practice reduces the risk of outages during planned network changes?",
      "Before upgrading a core [router], the [admin] should secure a maintenance window and prepare a:",
      "Change Management requires identifying the scope, risk, and:"
    ],
    answerOptions: [
      { variants: ["Rollback Plan", "Backout Plan"], correct: true, explanation: "A rollback plan ensures you can quickly revert changes if things go wrong." },
      { variants: ["Disable Logging"], correct: false, explanation: "Never disable logging during changes." },
      { variants: ["Peak Hours"], correct: false, explanation: "Changes should be done during off-peak hours." },
      { variants: ["Ad-hoc changes"], correct: false, explanation: "Ad-hoc changes bypass process and increase risk." }
    ]
  }),

  q(3034, 3, 3, ["Logs", "SIEM"], {
    variants: [
      "A SIEM platform primarily helps by:",
      "Which tool aggregates logs from [router]s, [firewall]s, and servers to identify security incidents?",
      "To correlate a login failure on a server with a firewall deny log, use a:"
    ],
    answerOptions: [
      { variants: ["Aggregating and correlating logs"], correct: true, explanation: "SIEM (Security Information and Event Management) centralizes and correlates logs for analysis." },
      { variants: ["Replacing routers"], correct: false, explanation: "SIEM analyzes data; it doesn't route it." },
      { variants: ["Encrypting traffic"], correct: false, explanation: "VPNs encrypt traffic." },
      { variants: ["Blocking viruses"], correct: false, explanation: "Antivirus blocks viruses." }
    ]
  }),

  q(3035, 3, 2, ["Discovery", "Inventory"], {
    variants: [
      "Which approach is MOST appropriate to discover IP-to-MAC mappings and connected switch ports at scale?",
      "To build an automated inventory of what [device] is on what port, an [admin] uses:",
      "Reading the CAM tables and ARP tables via SNMP allows you to build a:"
    ],
    answerOptions: [
      { variants: ["Network Inventory", "Port Map"], correct: true, explanation: "Polling SNMP for ARP/CAM tables allows mapping devices to specific switch ports." },
      { variants: ["Manual Spreadsheets"], correct: false, explanation: "Manual is not scalable." },
      { variants: ["Ping Sweep"], correct: false, explanation: "Ping sweep finds IPs but doesn't tell you the physical switch port." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog shows events, not state mappings." }
    ]
  }),

  q(3036, 3, 4, ["Tools", "Remote"], {
    variants: [
      "You need secure web-based administration of a [switch] GUI. Which protocol/port should be enabled?",
      "An [admin] browses to https://192.168.1.1 to configure a firewall. This uses port:",
      "To replace insecure HTTP management, enable:"
    ],
    answerOptions: [
      { variants: ["HTTPS / 443"], correct: true, explanation: "HTTPS (TCP 443) provides encrypted web management." },
      { variants: ["HTTP / 80"], correct: false, explanation: "HTTP is cleartext." },
      { variants: ["SSH / 22"], correct: false, explanation: "SSH is CLI, not Web GUI." },
      { variants: ["Telnet / 23"], correct: false, explanation: "Telnet is insecure CLI." }
    ]
  }),

  q(3037, 3, 5, ["Resilience", "Design"], {
    variants: [
      "Which design practice MOST directly reduces single points of failure at the access layer?",
      "To ensure a switch failure doesn't disconnect users, an [admin] should configure:",
      "Connecting an access switch to two different distribution switches is an example of:"
    ],
    answerOptions: [
      { variants: ["Dual Uplinks", "Redundant Links"], correct: true, explanation: "Dual uplinks to separate upstream devices prevent isolation if one link or device fails." },
      { variants: ["Single Uplink"], correct: false, explanation: "Single uplink is a single point of failure." },
      { variants: ["Hubs"], correct: false, explanation: "Hubs increase failure domains." },
      { variants: ["Disabling STP"], correct: false, explanation: "Disabling STP causes loops, it doesn't help redundancy." }
    ]
  }),

  q(3038, 3, 1, ["Documentation", "Ops"], {
    variants: [
      "Which document should include device hostnames, management IPs, rack locations, and circuit IDs?",
      "An [admin] needs to know the IP address of the core [router]. They check the:",
      "To track hardware lifecycles and locations, update the:"
    ],
    answerOptions: [
      { variants: ["Network Inventory", "Asset Register"], correct: true, explanation: "The asset register tracks the details of every physical and logical device." },
      { variants: ["NDA"], correct: false, explanation: "NDA is legal." },
      { variants: ["AUP"], correct: false, explanation: "AUP is user policy." },
      { variants: ["Change Log"], correct: false, explanation: "Change log tracks events, not current state." }
    ]
  }),

  q(3039, 3, 3, ["Logs", "Syslog"], {
    variants: [
      "Which option is BEST to secure Syslog traffic in transit?",
      "Standard Syslog sends data in cleartext UDP. How can an [admin] protect log data from interception?",
      "To comply with security audits, logs sent to the SIEM must be:"
    ],
    answerOptions: [
      { variants: ["Syslog over TLS", "Encrypted Syslog"], correct: true, explanation: "Wrapping Syslog in TLS (TCP 6514) encrypts the log data." },
      { variants: ["UDP 514"], correct: false, explanation: "UDP 514 is cleartext." },
      { variants: ["NTP"], correct: false, explanation: "NTP is time sync." },
      { variants: ["SNMPv2"], correct: false, explanation: "SNMPv2 is cleartext monitoring." }
    ]
  }),

  q(3040, 3, 4, ["QoS", "Voice"], {
    variants: [
      "When configuring QoS for VoIP, which traffic characteristic is MOST important to minimize?",
      "Choppy voice calls are often caused by variation in packet arrival time, known as:",
      "Real-time applications require low latency and low:"
    ],
    answerOptions: [
      { variants: ["Jitter"], correct: true, explanation: "Jitter is the variation in latency. VoIP buffers can handle latency, but high jitter causes dropouts." },
      { variants: ["Bandwidth"], correct: false, explanation: "You want to MAXIMIZE bandwidth, not minimize it (though VoIP uses little)." },
      { variants: ["MTU"], correct: false, explanation: "MTU size doesn't directly cause choppiness like jitter does." },
      { variants: ["Signal Strength"], correct: false, explanation: "Signal strength relates to wireless/physical, not the traffic flow metric." }
    ]
  }),

  q(3041, 3, 2, ["SNMP", "Monitoring"], {
    variants: [
      "What is the main difference between an SNMP trap and an SNMP poll?",
      "Which SNMP message is initiated by the agent (device) rather than the manager?",
      "When a port goes down, the [switch] immediately sends an alert. This is a:"
    ],
    answerOptions: [
      { variants: ["Trap"], correct: true, explanation: "Traps are unsolicited alerts sent by the device to the manager when an event occurs." },
      { variants: ["Poll", "Get Request"], correct: false, explanation: "Polls/Gets are initiated by the manager to ask for status." },
      { variants: ["Set Request"], correct: false, explanation: "Set is used to change configuration." },
      { variants: ["Walk"], correct: false, explanation: "Walk is a series of Get requests." }
    ]
  }),

  q(3042, 3, 3, ["Syslog", "Ports"], {
    variants: [
      "A company wants encrypted Syslog transport. Which port is commonly used for Syslog over TLS?",
      "An [admin] configures the firewall to allow secure logs. Which TCP port should be opened?",
      "UDP 514 is insecure. The secure alternative typically listens on:"
    ],
    answerOptions: [
      { variants: ["6514", "TCP 6514"], correct: true, explanation: "TCP 6514 is the de facto standard port for Syslog over TLS." },
      { variants: ["514"], correct: false, explanation: "514 is standard UDP/Cleartext." },
      { variants: ["443"], correct: false, explanation: "443 is HTTPS." },
      { variants: ["22"], correct: false, explanation: "22 is SSH." }
    ]
  }),

  q(3043, 3, 1, ["Operations", "Baselines"], {
    variants: [
      "Which KPI is MOST useful to detect early signs of WAN congestion over time?",
      "To plan for bandwidth upgrades, an [admin] should look at which utilization metric?",
      "Which metric filters out short bursts to show sustained network load?"
    ],
    answerOptions: [
      { variants: ["95th Percentile Utilization", "Average Utilization"], correct: true, explanation: "95th percentile is the industry standard for billing and capacity planning as it ignores the top 5% of brief spikes." },
      { variants: ["Real-time utilization"], correct: false, explanation: "Real-time fluctuates too much for long-term planning." },
      { variants: ["CPU Load"], correct: false, explanation: "CPU load doesn't indicate WAN link congestion." },
      { variants: ["Packet drops"], correct: false, explanation: "Drops mean you are ALREADY congested; utilization predicts it." }
    ]
  }),

  q(3044, 3, 4, ["Troubleshooting", "Path"], {
    variants: [
      "Which tool combines ping and traceroute-style hop analysis to identify where latency or loss begins?",
      "An [admin] wants a continuously updating display of packet loss at every hop. Which tool is best?",
      "On Linux, 'mtr' is the equivalent of which Windows tool?"
    ],
    answerOptions: [
      { variants: ["Pathping", "MTR"], correct: true, explanation: "MTR (Linux) and Pathping (Windows) combine traceroute with continuous pinging to find exactly where loss occurs." },
      { variants: ["Ping"], correct: false, explanation: "Ping only checks the destination." },
      { variants: ["Traceroute"], correct: false, explanation: "Traceroute runs once and doesn't show long-term loss stats." },
      { variants: ["Nslookup"], correct: false, explanation: "Nslookup is for DNS." }
    ]
  }),

  q(3045, 3, 2, ["Management", "OOB"], {
    variants: [
      "To manage devices during a network outage where the main links are down, which approach is BEST?",
      "An [admin] dials into a modem connected to the router's console port. This is an example of:",
      "Separating management traffic from user traffic using a dedicated network is called:"
    ],
    answerOptions: [
      { variants: ["Out-of-Band Management (OOB)", "OOBM"], correct: true, explanation: "OOB management uses a dedicated channel (serial, separate NIC) so devices are reachable even if the production network fails." },
      { variants: ["In-Band Management"], correct: false, explanation: "In-Band uses the production network; if the network is down, you're locked out." },
      { variants: ["SSH"], correct: false, explanation: "SSH can be in-band or out-of-band." },
      { variants: ["VPN"], correct: false, explanation: "VPN relies on the network being up." }
    ]
  }),

  q(3046, 3, 3, ["Config", "Automation"], {
    variants: [
      "Which tool type is MOST associated with push-based network configuration automation at scale?",
      "To update the NTP settings on 500 routers simultaneously, an [admin] uses:",
      "Ansible, Chef, and Puppet are examples of:"
    ],
    answerOptions: [
      { variants: ["Configuration Management", "Infrastructure as Code"], correct: true, explanation: "Config management tools automate the deployment of settings to many devices." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog records events." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is mostly for monitoring (Set requests are rarely used for complex config)." },
      { variants: ["RDP"], correct: false, explanation: "RDP is manual remote desktop." }
    ]
  }),

  q(3047, 3, 1, ["Process", "Incident"], {
    variants: [
      "Which step should occur FIRST when responding to a suspected network outage affecting many users?",
      "Before attempting to fix a reported issue, the [admin] must first:",
      "A user calls the helpdesk. According to troubleshooting methodology, step 1 is:"
    ],
    answerOptions: [
      { variants: ["Identify the problem", "Verify the scope"], correct: true, explanation: "You must define the problem and its scope before you can theorize a cause or fix it." },
      { variants: ["Establish a theory"], correct: false, explanation: "Theory comes after identification." },
      { variants: ["Implement a fix"], correct: false, explanation: "Fixing comes after testing the theory." },
      { variants: ["Document findings"], correct: false, explanation: "Documentation is the final step." }
    ]
  }),

  q(3048, 3, 4, ["Monitoring", "Alerting"], {
    variants: [
      "A monitoring system generates too many low-value alerts, causing real issues to be missed. This problem is called:",
      "An [admin] ignores a critical email because they receive 500 'interface up/down' emails a day. This is:",
      "To improve incident response, you should tune thresholds to avoid:"
    ],
    answerOptions: [
      { variants: ["Alert Fatigue"], correct: true, explanation: "Alert Fatigue occurs when admins become desensitized to alarms due to excessive noise." },
      { variants: ["False Positives"], correct: false, explanation: "False positives cause fatigue, but the phenomenon of ignoring them is fatigue." },
      { variants: ["Baseline Drift"], correct: false, explanation: "Drift is configuration change." },
      { variants: ["Packet Loss"], correct: false, explanation: "Packet loss is a network error." }
    ]
  }),

  q(3049, 3, 3, ["Documentation", "Change"], {
    variants: [
      "What documentation artifact is MOST useful to record what changed, why, and who approved it?",
      "During an audit, which log proves that the firewall rule change was authorized?",
      "If a new update breaks the network, where should the [admin] look first to see what happened last night?"
    ],
    answerOptions: [
      { variants: ["Change Log", "Change Management Ticket"], correct: true, explanation: "The change log tracks the who, what, when, and why of modifications." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog shows system events, not business approval/intent." },
      { variants: ["Asset Tag"], correct: false, explanation: "Asset tags track hardware inventory." },
      { variants: ["SLA"], correct: false, explanation: "SLA tracks performance." }
    ]
  }),

  q(3050, 3, 2, ["Monitoring", "RMON"], {
    variants: [
      "RMON is primarily used to:",
      "Which extension to SNMP allows for remote probes to monitor traffic statistics and alarms independent of a central manager?",
      "To gather Layer 2 statistics (like CRC errors) across a subnet, use:"
    ],
    answerOptions: [
      { variants: ["Remote Monitoring (RMON)"], correct: true, explanation: "RMON extends SNMP to provide comprehensive network monitoring capabilities at the probe level." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog is for logs." },
      { variants: ["NetFlow"], correct: false, explanation: "NetFlow is for Layer 3 flows." },
      { variants: ["IPAM"], correct: false, explanation: "IPAM manages IP addresses." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Troubleshooting Methodology (Questions 3051-3060)
  // ============================================================

  q(3051, 3, 6, ["Troubleshooting", "Step 1"], {
    variants: [
      "In the CompTIA troubleshooting methodology, what is the very first step?",
      "A [user] calls the helpdesk reporting a network issue. Before touching any equipment, the [admin] must:",
      "Interviewing the user and duplicating the problem are part of which troubleshooting phase?"
    ],
    answerOptions: [
      { variants: ["Identify the problem"], correct: true, explanation: "Step 1 is Identify the problem (Question user, identify changes, define scope)." },
      { variants: ["Establish a theory"], correct: false, explanation: "You cannot theorize until you know what the problem is." },
      { variants: ["Test the theory"], correct: false, explanation: "Testing comes after hypothesizing." },
      { variants: ["Implement a fix"], correct: false, explanation: "Fixing is Step 4." }
    ]
  }),

  q(3052, 3, 6, ["Troubleshooting", "Step 2"], {
    variants: [
      "After identifying the problem, what is the next step in the troubleshooting process?",
      "An [admin] confirms the [server] is unreachable. They start brainstorming potential causes (e.g., DNS, Cable, Firewall). This is:",
      "Questioning the obvious is part of which troubleshooting step?"
    ],
    answerOptions: [
      { variants: ["Establish a theory of probable cause"], correct: true, explanation: "Step 2 is establishing a theory (brainstorming what *could* be wrong)." },
      { variants: ["Test the theory"], correct: false, explanation: "Testing is Step 3." },
      { variants: ["Identify the problem"], correct: false, explanation: "That was Step 1." },
      { variants: ["Document findings"], correct: false, explanation: "That is the final step." }
    ]
  }),

  q(3053, 3, 6, ["Troubleshooting", "Step 3"], {
    variants: [
      "An [admin] suspects a bad cable is causing packet loss. They swap the cable to see if the issue resolves. Which step is this?",
      "Once a theory is established, you must:",
      "If this step fails (the theory was wrong), you must go back to establishing a new theory."
    ],
    answerOptions: [
      { variants: ["Test the theory to determine cause"], correct: true, explanation: "Step 3 is testing. If the test confirms the theory, you move to planning the fix." },
      { variants: ["Establish a plan of action"], correct: false, explanation: "You only plan the fix AFTER confirming the cause." },
      { variants: ["Verify functionality"], correct: false, explanation: "Verification happens after the fix is implemented." },
      { variants: ["Identify the problem"], correct: false, explanation: "Already done." }
    ]
  }),

  q(3054, 3, 6, ["Troubleshooting", "Step 4"], {
    variants: [
      "You have confirmed the root cause is a bad switch port. You now need to map out how to move the connection without disrupting others. This is:",
      "Identifying potential effects of the solution occurs in which step?",
      "Before applying a patch to fix a bug, the [admin] schedules a maintenance window. This falls under:"
    ],
    answerOptions: [
      { variants: ["Establish a plan of action"], correct: true, explanation: "Step 4 is planning the resolution and identifying potential side effects." },
      { variants: ["Implement the solution"], correct: false, explanation: "Implementation follows the plan." },
      { variants: ["Test the theory"], correct: false, explanation: "Theory is already confirmed at this point." },
      { variants: ["Document findings"], correct: false, explanation: "Documentation is last." }
    ]
  }),

  q(3055, 3, 6, ["Troubleshooting", "Step 5"], {
    variants: [
      "After applying a fix, the [admin] asks the [user] to try accessing the file share again to ensure it works. This is:",
      "Which step includes implementing preventive measures to stop the issue from happening again?",
      "Why isn't the job done immediately after fixing the issue?"
    ],
    answerOptions: [
      { variants: ["Verify full system functionality"], correct: true, explanation: "Step 5 is verifying that the fix worked and didn't break anything else, and setting up preventive measures." },
      { variants: ["Document findings"], correct: false, explanation: "Documentation happens after verification." },
      { variants: ["Identify the problem"], correct: false, explanation: "This is the start." },
      { variants: ["Establish a theory"], correct: false, explanation: "This is Step 2." }
    ]
  }),

  q(3056, 3, 6, ["Troubleshooting", "Step 6"], {
    variants: [
      "What is the final step of the CompTIA troubleshooting methodology?",
      "To ensure the next [admin] knows what happened, you must:",
      "Recording the 'Lessons Learned' happens in which phase?"
    ],
    answerOptions: [
      { variants: ["Document findings, actions, and outcomes"], correct: true, explanation: "Step 6 is documentation. If it isn't written down, it didn't happen." },
      { variants: ["Verify functionality"], correct: false, explanation: "Verification is Step 5." },
      { variants: ["Close the ticket"], correct: false, explanation: "Closing the ticket is an admin task, but 'Documenting' is the methodology step." },
      { variants: ["Notify the user"], correct: false, explanation: "Notification happens during verification." }
    ]
  }),

  q(3057, 3, 6, ["Troubleshooting", "Escalation"], {
    variants: [
      "If a Level 1 [admin] cannot solve an issue within 15 minutes, they send it to a Level 2 engineer. This is called:",
      "Moving a support ticket to a team with more privileges or expertise is:",
      "You lack the permissions to reset the core router password. You must:"
    ],
    answerOptions: [
      { variants: ["Escalation"], correct: true, explanation: "Escalation moves an issue to higher-tier support or management." },
      { variants: ["Delegation"], correct: false, explanation: "Delegation is giving work to someone junior." },
      { variants: ["Resolution"], correct: false, explanation: "Resolution means it is fixed." },
      { variants: ["Arbitration"], correct: false, explanation: "Arbitration is for disputes." }
    ]
  }),

  q(3058, 3, 4, ["Troubleshooting", "Tools"], {
    variants: [
      "Which command displays the current TCP/IP network configuration values (IP, Mask, Gateway) on a Windows [device]?",
      "A [user] doesn't know their IP address. Which command do you tell them to run?",
      "To check if DHCP gave you a valid IP on Windows, use:"
    ],
    answerOptions: [
      { variants: ["ipconfig"], correct: true, explanation: "ipconfig shows IP details on Windows." },
      { variants: ["ifconfig"], correct: false, explanation: "ifconfig is for Linux/Unix (legacy)." },
      { variants: ["ip addr"], correct: false, explanation: "ip addr is for modern Linux." },
      { variants: ["ping"], correct: false, explanation: "Ping tests connectivity." }
    ]
  }),

  q(3059, 3, 4, ["Troubleshooting", "Tools"], {
    variants: [
      "Which command clears the local DNS resolver cache on a Windows [device]?",
      "After changing a DNS record, you can't reach the site because your computer remembers the old IP. You should run:",
      "ipconfig /___________"
    ],
    answerOptions: [
      { variants: ["flushdns"], correct: true, explanation: "'ipconfig /flushdns' clears the local client cache." },
      { variants: ["release"], correct: false, explanation: "Release drops the DHCP IP." },
      { variants: ["renew"], correct: false, explanation: "Renew asks for a new IP." },
      { variants: ["all"], correct: false, explanation: "All shows details." }
    ]
  }),

  q(3060, 3, 4, ["Troubleshooting", "Tools"], {
    variants: [
      "Which Linux command displays the current network interface configuration?",
      "The legacy equivalent of 'ip addr' on Linux/Unix systems is:",
      "To view the MAC address of a Linux interface, you might use:"
    ],
    answerOptions: [
      { variants: ["ifconfig"], correct: true, explanation: "ifconfig is the legacy Linux tool for interface config. (Modern is 'ip addr')." },
      { variants: ["ipconfig"], correct: false, explanation: "ipconfig is Windows." },
      { variants: ["iwconfig"], correct: false, explanation: "iwconfig is for wireless only." },
      { variants: ["netstat"], correct: false, explanation: "netstat shows connections." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Backups & Safety (Questions 3061-3075)
  // ============================================================

  q(3061, 3, 5, ["Backup", "Types"], {
    variants: [
      "Which backup type copies ALL selected files but does NOT mark them as backed up (doesn't clear the archive bit)?",
      "An [admin] wants to make a quick copy of data mid-day without affecting the nightly backup schedule. They use a:",
      "A 'Full' backup that doesn't reset the archive flag is a:"
    ],
    answerOptions: [
      { variants: ["Copy Backup"], correct: true, explanation: "A Copy backup duplicates data without changing the archive bit, so it doesn't disrupt Incremental/Differential chains." },
      { variants: ["Full Backup"], correct: false, explanation: "A standard Full backup clears the archive bit." },
      { variants: ["Differential"], correct: false, explanation: "Differential backs up changes since the last Full." },
      { variants: ["Incremental"], correct: false, explanation: "Incremental backs up changes since the last backup of any type." }
    ]
  }),

  q(3062, 3, 5, ["Backup", "Types"], {
    variants: [
      "Which backup type backs up only the files that changed since the last FULL backup?",
      "To restore data, you need the last Full backup and only the latest one of these:",
      "This backup grows in size every day until the next Full backup is run."
    ],
    answerOptions: [
      { variants: ["Differential"], correct: true, explanation: "Differential saves everything changed since the last Full. Restore = Full + Last Diff." },
      { variants: ["Incremental"], correct: false, explanation: "Incremental saves changes since the last backup (any type). Restore = Full + All Incremental steps." },
      { variants: ["Full"], correct: false, explanation: "Full is everything." },
      { variants: ["Snapshot"], correct: false, explanation: "Snapshot is a VM state." }
    ]
  }),

  q(3063, 3, 5, ["Backup", "Types"], {
    variants: [
      "Which backup type backs up files changed since the LAST backup of ANY type?",
      "Which backup strategy has the fastest backup time but the slowest restore time?",
      "To restore, you need the Full tape and every single daily tape of this type:"
    ],
    answerOptions: [
      { variants: ["Incremental"], correct: true, explanation: "Incremental resets the archive bit. It's fast to back up (small data) but slow to restore (must replay every tape)." },
      { variants: ["Differential"], correct: false, explanation: "Differential is slower to back up (duplicates data) but faster to restore." },
      { variants: ["Full"], correct: false, explanation: "Full is slowest to back up." },
      { variants: ["Mirror"], correct: false, explanation: "Mirror is an exact replica." }
    ]
  }),

  q(3064, 3, 5, ["Backup", "Rotation"], {
    variants: [
      "Which backup rotation scheme uses daily, weekly, and monthly sets (Son, Father, Grandfather)?",
      "To ensure you can restore data from a year ago, which rotation strategy is best?",
      "The 'Grandfather' tape in a GFS rotation usually represents which timeframe?"
    ],
    answerOptions: [
      { variants: ["Grandfather-Father-Son (GFS)", "GFS"], correct: true, explanation: "GFS is a standard rotation to maintain daily (Son), weekly (Father), and monthly (Grandfather) history." },
      { variants: ["FIFO"], correct: false, explanation: "First-In-First-Out would overwrite history." },
      { variants: ["Tower of Hanoi"], correct: false, explanation: "Tower of Hanoi is a complex rotation algorithm, but GFS is the standard naming." },
      { variants: ["3-2-1 Rule"], correct: false, explanation: "3-2-1 is a rule for copies, not a rotation schedule." }
    ]
  }),

  q(3065, 3, 5, ["Safety", "ESD"], {
    variants: [
      "What device should a technician wear to prevent damage to computer components from static electricity?",
      "Before touching a circuit board, an [admin] puts on a:",
      "ESD damage can be prevented by grounding yourself using a:"
    ],
    answerOptions: [
      { variants: ["ESD Strap", "Antistatic Wrist Strap"], correct: true, explanation: "An ESD strap grounds the technician to the chassis, preventing static discharge." },
      { variants: ["Rubber Gloves"], correct: false, explanation: "Rubber gloves insulate but don't equalize potential." },
      { variants: ["Safety Goggles"], correct: false, explanation: "Goggles protect eyes, not chips." },
      { variants: ["Multimeter"], correct: false, explanation: "Multimeters measure voltage." }
    ]
  }),

  q(3066, 3, 5, ["Safety", "Docs"], {
    variants: [
      "Which document contains safety information, handling procedures, and disposal guidelines for chemicals (like cleaners)?",
      "An [admin] spills battery acid. They verify the cleanup procedure by checking the:",
      "OSHA requires this document for any hazardous substance in the workplace."
    ],
    answerOptions: [
      { variants: ["MSDS / SDS", "Safety Data Sheet"], correct: true, explanation: "Material Safety Data Sheets (SDS) list hazards and handling instructions." },
      { variants: ["SLA"], correct: false, explanation: "SLA is for uptime." },
      { variants: ["SOP"], correct: false, explanation: "SOP is for procedures." },
      { variants: ["EULA"], correct: false, explanation: "EULA is software licensing." }
    ]
  }),

  q(3067, 3, 5, ["Environment", "Sensors"], {
    variants: [
      "High humidity in a server room can cause what type of failure?",
      "An [admin] monitors the humidity. If it gets too high, what is the risk?",
      "While low humidity causes static (ESD), high humidity causes:"
    ],
    answerOptions: [
      { variants: ["Corrosion", "Condensation"], correct: true, explanation: "High humidity leads to condensation and corrosion of metal contacts." },
      { variants: ["ESD"], correct: false, explanation: "ESD is caused by LOW humidity." },
      { variants: ["Overheating"], correct: false, explanation: "Overheating is caused by temperature, not humidity (directly)." },
      { variants: ["Fire"], correct: false, explanation: "Fire is a risk, but corrosion is the direct result of moisture." }
    ]
  }),

  q(3068, 3, 5, ["Physical", "Racks"], {
    variants: [
      "A standard server rack unit (1U) is equal to what height?",
      "When planning rack space, an [admin] calculates total 'U's. How tall is 1U?",
      "Equipment height is measured in units of:"
    ],
    answerOptions: [
      { variants: ["1.75 inches"], correct: true, explanation: "1U = 1.75 inches (44.45 mm)." },
      { variants: ["2 inches"], correct: false, explanation: "Incorrect." },
      { variants: ["1.5 inches"], correct: false, explanation: "Incorrect." },
      { variants: ["12 inches"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(3069, 3, 1, ["Cable Mgmt", "Best Practice"], {
    variants: [
      "Which cable management tool is preferred for fiber optic cables to avoid crushing the glass core?",
      "Instead of plastic zip ties, [admin]s should use this for cable bundling:",
      "What reusable cable tie prevents over-tightening?"
    ],
    answerOptions: [
      { variants: ["Velcro straps", "Hook and Loop"], correct: true, explanation: "Velcro is gentle on cables and reusable. Zip ties can crush fiber or deform copper twists." },
      { variants: ["Zip ties"], correct: false, explanation: "Zip ties can damage cables if overtightened." },
      { variants: ["Electrical tape"], correct: false, explanation: "Sticky and messy." },
      { variants: ["Staples"], correct: false, explanation: "Staples damage cables." }
    ]
  }),

  q(3070, 3, 1, ["Diagrams", "Wiring"], {
    variants: [
      "Which type of diagram shows the specific pinout of cables (e.g., T568B vs Crossover)?",
      "To troubleshoot a custom-made serial cable, an [admin] checks the:",
      "A diagram detailing which wire connects to which pin is a:"
    ],
    answerOptions: [
      { variants: ["Wiring Schematic", "Wiring Diagram"], correct: true, explanation: "Wiring schematics show the pin-level connections." },
      { variants: ["Logical Diagram"], correct: false, explanation: "Logical shows IP flow." },
      { variants: ["Physical Diagram"], correct: false, explanation: "Physical shows location." },
      { variants: ["Rack Diagram"], correct: false, explanation: "Rack shows elevation." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Policies & Procedures (Questions 3071-3085)
  // ============================================================

  q(3071, 3, 1, ["Policy", "NDA"], {
    variants: [
      "Which document prevents an external consultant from sharing [company]'s sensitive network details?",
      "Before hiring a pentester, they must sign a:",
      "To protect trade secrets and network configs during a partnership, sign a:"
    ],
    answerOptions: [
      { variants: ["NDA", "Non-Disclosure Agreement"], correct: true, explanation: "NDAs create a legal obligation to keep information confidential." },
      { variants: ["SLA"], correct: false, explanation: "SLA is for uptime." },
      { variants: ["AUP"], correct: false, explanation: "AUP is for user behavior." },
      { variants: ["BYOD"], correct: false, explanation: "BYOD is a device policy." }
    ]
  }),

  q(3072, 3, 1, ["Policy", "AUP"], {
    variants: [
      "Which policy defines what employees are allowed and not allowed to do with company IT assets?",
      "Rules about visiting gambling sites or downloading pirated movies are found in the:",
      "When a new [user] receives a laptop, they agree to the:"
    ],
    answerOptions: [
      { variants: ["AUP", "Acceptable Use Policy"], correct: true, explanation: "The AUP defines proper behavior for users on the network." },
      { variants: ["NDA"], correct: false, explanation: "NDA is for secrecy." },
      { variants: ["SLA"], correct: false, explanation: "SLA is for performance." },
      { variants: ["MOU"], correct: false, explanation: "MOU is for partnerships." }
    ]
  }),

  q(3073, 3, 1, ["Policy", "BYOD"], {
    variants: [
      "Which policy governs how employees connect their personal phones/laptops to the corporate network?",
      "Issues regarding data ownership on a personal device are handled in the:",
      "[company] allows users to use their own iPhones. This is:"
    ],
    answerOptions: [
      { variants: ["BYOD", "Bring Your Own Device"], correct: true, explanation: "BYOD policies manage the security and legal risks of personal devices." },
      { variants: ["AUP"], correct: false, explanation: "AUP is general use." },
      { variants: ["NDA"], correct: false, explanation: "NDA is secrecy." },
      { variants: ["Remote Access Policy"], correct: false, explanation: "Remote Access is for VPNs (usually corporate devices)." }
    ]
  }),

  q(3074, 3, 1, ["Policy", "Offboarding"], {
    variants: [
      "When an employee is terminated, what is the most critical first step for IT?",
      "To prevent an ex-employee from stealing data, the [admin] should immediately:",
      "Offboarding procedures prioritize:"
    ],
    answerOptions: [
      { variants: ["Disable accounts", "Revoke access"], correct: true, explanation: "Access must be cut immediately to prevent retaliation or data theft." },
      { variants: ["Wipe the laptop"], correct: false, explanation: "You may need the data; wipe later." },
      { variants: ["Forward email"], correct: false, explanation: "This can wait." },
      { variants: ["Collect badge"], correct: false, explanation: "This is HR/Physical security." }
    ]
  }),

  q(3075, 3, 1, ["Policy", "Privileged"], {
    variants: [
      "Which policy specifically governs the behavior of Administrators with elevated rights?",
      "Admins have access to sensitive data. They often sign an additional:",
      "Rules regarding when you can use the 'Domain Admin' account are in the:"
    ],
    answerOptions: [
      { variants: ["Privileged User Agreement", "PUA"], correct: true, explanation: "PUAs set higher standards and monitoring for users with elevated rights." },
      { variants: ["AUP"], correct: false, explanation: "AUP is for everyone." },
      { variants: ["SLA"], correct: false, explanation: "SLA is for service." },
      { variants: ["NDA"], correct: false, explanation: "NDA is for secrecy." }
    ]
  }),

  q(3076, 3, 1, ["Process", "Change"], {
    variants: [
      "Who is responsible for approving or rejecting a significant change to the production network?",
      "The [admin] submits a change request. Who reviews it?",
      "A group of stakeholders that meets to review the risk of changes is the:"
    ],
    answerOptions: [
      { variants: ["CAB", "Change Advisory Board"], correct: true, explanation: "The CAB reviews high-risk changes to ensure they are safe and necessary." },
      { variants: ["CEO"], correct: false, explanation: "CEO is too high level." },
      { variants: ["Helpdesk"], correct: false, explanation: "Helpdesk takes calls." },
      { variants: ["Vendor"], correct: false, explanation: "Vendors don't approve your internal changes." }
    ]
  }),

  q(3077, 3, 1, ["Inventory", "Asset"], {
    variants: [
      "Which tag is commonly used to track physical assets via radio waves without line-of-sight?",
      "To inventory equipment by walking down the aisle with a scanner, use:",
      "[company] replaces barcodes with this technology for faster inventory:"
    ],
    answerOptions: [
      { variants: ["RFID", "Radio Frequency ID"], correct: true, explanation: "RFID tags allow scanning inventory wirelessly without seeing the tag." },
      { variants: ["Barcode"], correct: false, explanation: "Barcodes require line-of-sight." },
      { variants: ["Asset Tag"], correct: false, explanation: "Asset tag is the generic term; RFID is the specific tech." },
      { variants: ["GPS"], correct: false, explanation: "GPS doesn't work well indoors for individual servers." }
    ]
  }),

  q(3078, 3, 3, ["License", "Compliance"], {
    variants: [
      "Using software on more computers than you have paid for is a violation of:",
      "An [admin] installs Windows on 50 PCs but only has 10 keys. This creates a risk of:",
      "Software piracy checks are part of:"
    ],
    answerOptions: [
      { variants: ["Licensing compliance", "License Management"], correct: true, explanation: "Organizations must ensure they have valid licenses for all deployed software." },
      { variants: ["SLA"], correct: false, explanation: "SLA is performance." },
      { variants: ["AUP"], correct: false, explanation: "AUP is usage behavior." },
      { variants: ["Export controls"], correct: false, explanation: "Export controls relate to sending tech to other countries." }
    ]
  }),

  q(3079, 3, 1, ["Management", "Vendor"], {
    variants: [
      "Using an external technician to reboot a router in a remote data center is called:",
      "You cannot drive to the data center in London. You hire the facility staff to plug in a cable. This service is:",
      "Remote hands support is often called:"
    ],
    answerOptions: [
      { variants: ["Smart Hands", "Remote Hands"], correct: true, explanation: "Smart/Remote Hands is a service where on-site staff perform physical tasks for you." },
      { variants: ["Consulting"], correct: false, explanation: "Too generic." },
      { variants: ["SLA"], correct: false, explanation: "SLA is the contract." },
      { variants: ["Managed Service"], correct: false, explanation: "Managed Service implies they own the device." }
    ]
  }),

  q(3080, 3, 5, ["Physical", "Access"], {
    variants: [
      "Which physical control creates a small room with two doors where only one can be open at a time?",
      "To prevent tailgating into the data center, install a:",
      "A vestibule designed to trap unauthorized entrants is a:"
    ],
    answerOptions: [
      { variants: ["Mantrap", "Access Control Vestibule"], correct: true, explanation: "Mantraps prevent tailgating by forcing one person to be authenticated before the second door opens." },
      { variants: ["Biometric Scanner"], correct: false, explanation: "Biometrics authenticate, but don't physically stop tailgating without a door mechanism." },
      { variants: ["Turnstile"], correct: false, explanation: "Turnstiles help, but Mantraps are the two-door solution." },
      { variants: ["Cage"], correct: false, explanation: "Cages separate racks." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Advanced Monitoring & Remote Access (Questions 3086-3100)
  // ============================================================

  q(3081, 3, 3, ["Monitoring", "Active"], {
    variants: [
      "Which tool generates traffic to test network performance (like bandwidth speed)?",
      "An [admin] uses iPerf to measure the actual throughput of a link. This is:",
      "Speedtest.net is an example of what type of monitoring?"
    ],
    answerOptions: [
      { variants: ["Active Monitoring", "Throughput Tester"], correct: true, explanation: "Active monitoring injects traffic to measure performance (e.g., iPerf, Speedtest)." },
      { variants: ["Passive Monitoring"], correct: false, explanation: "Passive (NetFlow/Sniffing) watches existing traffic." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is usually polling." },
      { variants: ["Syslog"], correct: false, explanation: "Syslog is logging." }
    ]
  }),

  q(3082, 3, 3, ["Monitoring", "Passive"], {
    variants: [
      "Capturing traffic from a SPAN port to analyze jitter without injecting new packets is:",
      "Using a TAP to watch traffic flow is an example of:",
      "Which monitoring type does not add traffic to the network?"
    ],
    answerOptions: [
      { variants: ["Passive Monitoring"], correct: true, explanation: "Passive monitoring observes traffic as it passes without modifying or adding to it." },
      { variants: ["Active Monitoring"], correct: false, explanation: "Active adds traffic." },
      { variants: ["Ping"], correct: false, explanation: "Ping is active (adds ICMP packets)." },
      { variants: ["iPerf"], correct: false, explanation: "iPerf is active." }
    ]
  }),

  q(3083, 3, 2, ["Remote", "Console"], {
    variants: [
      "Which cable type is used to connect a laptop directly to a [router]'s console port for initial configuration?",
      "To configure a [switch] with no IP address, you connect via Serial using a:",
      "A 'Rollover' cable is used for:"
    ],
    answerOptions: [
      { variants: ["Console Cable", "Rollover Cable", "DB-9"], correct: true, explanation: "Console cables (often blue 'Rollover' cables) connect serial ports for OOB management." },
      { variants: ["Ethernet"], correct: false, explanation: "Ethernet requires an IP." },
      { variants: ["Crossover"], correct: false, explanation: "Crossover connects switch-to-switch." },
      { variants: ["Straight-through"], correct: false, explanation: "Straight-through is standard data." }
    ]
  }),

  q(3084, 3, 2, ["Remote", "VPN"], {
    variants: [
      "Which VPN type allows an [admin] to work from home and access the corporate LAN securely?",
      "Connecting a single laptop to a firewall over the internet is:",
      "Client-to-Site VPN is also known as:"
    ],
    answerOptions: [
      { variants: ["Remote Access VPN"], correct: true, explanation: "Remote Access (Client-to-Site) connects a user device to the network." },
      { variants: ["Site-to-Site VPN"], correct: false, explanation: "Site-to-Site connects two routers (LAN-to-LAN)." },
      { variants: ["DMVPN"], correct: false, explanation: "DMVPN is a mesh site-to-site tech." },
      { variants: ["Split Tunnel"], correct: false, explanation: "Split tunnel is a configuration option, not the type." }
    ]
  }),

  q(3085, 3, 2, ["Remote", "VPN"], {
    variants: [
      "Which VPN config routes only corporate traffic through the tunnel, allowing internet traffic to go direct?",
      "To reduce bandwidth on the corporate pipe, the [admin] enables:",
      "If a VPN user can access Google without going through the HQ firewall, they are using:"
    ],
    answerOptions: [
      { variants: ["Split Tunnel"], correct: true, explanation: "Split tunneling sends only specific traffic to the VPN, reducing load on the VPN concentrator." },
      { variants: ["Full Tunnel"], correct: false, explanation: "Full tunnel sends ALL traffic through the VPN." },
      { variants: ["Site-to-Site"], correct: false, explanation: "Site-to-Site is router-to-router." },
      { variants: ["Clientless SSL"], correct: false, explanation: "Clientless SSL uses a browser." }
    ]
  }),

  q(3086, 3, 2, ["Remote", "Desktop"], {
    variants: [
      "Which remote access protocol is platform-independent (works on Mac, Linux, Windows) and transmits graphical desktops?",
      "An [admin] uses RealVNC to manage a Linux GUI. What protocol is this?",
      "Port 5900 is associated with:"
    ],
    answerOptions: [
      { variants: ["VNC", "Virtual Network Computing", "RFB"], correct: true, explanation: "VNC is a cross-platform graphical desktop sharing system." },
      { variants: ["RDP"], correct: false, explanation: "RDP is primarily Windows." },
      { variants: ["SSH"], correct: false, explanation: "SSH is text-based." },
      { variants: ["Telnet"], correct: false, explanation: "Telnet is text-based." }
    ]
  }),

  q(3087, 3, 3, ["Config", "TFTP"], {
    variants: [
      "Which simple UDP protocol is typically used to transfer configuration files or firmware images to a [switch]?",
      "An [admin] backs up the router config to a server on port 69. Which protocol is used?",
      "PXE booting and firmware updates often rely on:"
    ],
    answerOptions: [
      { variants: ["TFTP", "Trivial FTP"], correct: true, explanation: "TFTP is simple, requires no auth, and uses UDP. Perfect for bootloaders and firmware." },
      { variants: ["FTP"], correct: false, explanation: "FTP is TCP and more complex." },
      { variants: ["SFTP"], correct: false, explanation: "SFTP is SSH-based." },
      { variants: ["HTTP"], correct: false, explanation: "HTTP is web." }
    ]
  }),

  q(3088, 3, 2, ["IPAM", "Tools"], {
    variants: [
      "Which software solution tracks IP address allocation, DHCP scopes, and DNS records in one place?",
      "Instead of a spreadsheet, [company] uses this to manage their IP space:",
      "To prevent IP conflicts and track subnet usage, use:"
    ],
    answerOptions: [
      { variants: ["IPAM", "IP Address Management"], correct: true, explanation: "IPAM integrates DNS and DHCP management and tracks IP usage." },
      { variants: ["NMS"], correct: false, explanation: "NMS monitors health." },
      { variants: ["SIEM"], correct: false, explanation: "SIEM logs security events." },
      { variants: ["NetFlow"], correct: false, explanation: "NetFlow tracks traffic." }
    ]
  }),

  q(3089, 3, 5, ["Power", "PDU"], {
    variants: [
      "Which device allows an [admin] to remotely power cycle a frozen server?",
      "A 'Switched' or 'Managed' version of this device enables remote outlet control:",
      "It looks like a power strip but has an Ethernet port for management."
    ],
    answerOptions: [
      { variants: ["Managed PDU", "Switched PDU"], correct: true, explanation: "A Managed PDU allows remote control of individual power outlets." },
      { variants: ["UPS"], correct: false, explanation: "UPS provides battery, but outlet switching is a PDU function (though some UPSs have it)." },
      { variants: ["Inverter"], correct: false, explanation: "Inverter changes DC to AC." },
      { variants: ["Rectifier"], correct: false, explanation: "Rectifier changes AC to DC." }
    ]
  }),

  q(3090, 3, 1, ["Diagrams", "Logical"], {
    variants: [
      "Which diagram shows IP subnets, VLAN IDs, and routing protocols?",
      "To understand the flow of data between networks, check the:",
      "A diagram showing OSPF areas and IP schemes is:"
    ],
    answerOptions: [
      { variants: ["Logical Diagram"], correct: true, explanation: "Logical diagrams show how data moves (L3/L2 concepts)." },
      { variants: ["Physical Diagram"], correct: false, explanation: "Physical shows rack location/cables." },
      { variants: ["Wiring Schematic"], correct: false, explanation: "Schematic shows pinouts." },
      { variants: ["Heat Map"], correct: false, explanation: "Heat map shows Wi-Fi." }
    ]
  }),

  q(3091, 3, 4, ["Troubleshooting", "Loop"], {
    variants: [
      "A user plugs both ends of an Ethernet cable into the wall jack. The whole network slows down. What happened?",
      "Broadcast storms are typically caused by:",
      "If Spanning Tree Protocol (STP) fails or is disabled, what occurs?"
    ],
    answerOptions: [
      { variants: ["Switching Loop", "Broadcast Storm"], correct: true, explanation: "A physical loop causes frames to circle endlessly (broadcast storm), consuming all bandwidth." },
      { variants: ["Routing Loop"], correct: false, explanation: "Routing loops happen at L3 (TTL kills them). Switching loops happen at L2." },
      { variants: ["Short Circuit"], correct: false, explanation: "A short would likely just drop the link." },
      { variants: ["Duplicate IP"], correct: false, explanation: "Duplicate IP affects two hosts, not the whole net." }
    ]
  }),

  q(3092, 3, 4, ["Troubleshooting", "Duplicate IP"], {
    variants: [
      "Two users report an intermittent connection error stating 'Address Conflict'. What is the cause?",
      "An [admin] assigns a static IP to a printer that is already in the DHCP scope. What happens?",
      "If two devices try to use 192.168.1.50, this is a:"
    ],
    answerOptions: [
      { variants: ["Duplicate IP Address"], correct: true, explanation: "Duplicate IPs cause connectivity to flip-flop between devices or fail entirely." },
      { variants: ["Duplicate MAC"], correct: false, explanation: "Duplicate MACs are rare (manufacturing error or spoofing)." },
      { variants: ["DNS Failure"], correct: false, explanation: "DNS failure prevents name resolution, not IP conflicts." },
      { variants: ["DHCP Exhaustion"], correct: false, explanation: "Exhaustion means NO IP is assigned." }
    ]
  }),

  q(3093, 3, 4, ["Troubleshooting", "MTU"], {
    variants: [
      "A [user] can ping a website but cannot load the page in a browser. Large packets are being dropped. What is the issue?",
      "If a VPN adds headers that push the packet size beyond 1500 bytes, what mismatch occurs?",
      "Fragmentation needed but DF (Don't Fragment) bit is set. This causes:"
    ],
    answerOptions: [
      { variants: ["MTU Mismatch", "MTU Black Hole"], correct: true, explanation: "If the MTU (Max Transmission Unit) is exceeded and fragmentation is forbidden, packets drop." },
      { variants: ["VLAN Mismatch"], correct: false, explanation: "VLAN mismatch breaks connectivity entirely." },
      { variants: ["Speed Mismatch"], correct: false, explanation: "Speed mismatch causes link errors/flapping." },
      { variants: ["Duplex Mismatch"], correct: false, explanation: "Duplex mismatch causes slow speeds/collisions." }
    ]
  }),

  q(3094, 3, 4, ["Troubleshooting", "Time"], {
    variants: [
      "Kerberos authentication fails, and logs show 'Clock Skew'. What is the fix?",
      "If the [server] time is 5 minutes different from the Domain Controller, what fails?",
      "To fix time-based login errors, configure:"
    ],
    answerOptions: [
      { variants: ["NTP", "Time Sync"], correct: true, explanation: "NTP ensures clocks are synced. Kerberos allows only 5 minutes of skew by default." },
      { variants: ["DNS"], correct: false, explanation: "DNS resolves names." },
      { variants: ["DHCP"], correct: false, explanation: "DHCP gives IPs." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP monitors status." }
    ]
  }),

  q(3095, 3, 6, ["Process", "RCA"], {
    variants: [
      "After an incident is resolved, the team meets to determine WHY it happened. This analysis is:",
      "To prevent recurrence, the 'Post-Mortem' focuses on finding the:",
      "The '5 Whys' technique is used during:"
    ],
    answerOptions: [
      { variants: ["Root Cause Analysis", "RCA"], correct: true, explanation: "RCA goes beyond fixing the symptom to finding the underlying cause." },
      { variants: ["Risk Assessment"], correct: false, explanation: "Risk assessment happens before events." },
      { variants: ["Change Management"], correct: false, explanation: "Change management controls updates." },
      { variants: ["Incident Response"], correct: false, explanation: "RCA is part of the final phase of Incident Response." }
    ]
  }),

  q(3096, 3, 3, ["Logs", "Auditing"], {
    variants: [
      "Which log would you check to see who logged into a server at 2 AM?",
      "An [admin] suspects a brute force attack. Which log file contains login attempts?",
      "Security Audits rely primarily on:"
    ],
    answerOptions: [
      { variants: ["Security Log", "Audit Log", "Auth Log"], correct: true, explanation: "Security/Auth logs track logins, privilege use, and access violations." },
      { variants: ["System Log"], correct: false, explanation: "System log tracks hardware/driver events." },
      { variants: ["Application Log"], correct: false, explanation: "Application log tracks program errors." },
      { variants: ["Traffic Log"], correct: false, explanation: "Traffic log tracks packets." }
    ]
  }),

  q(3097, 3, 4, ["Tools", "Looking Glass"], {
    variants: [
      "Which public tool allows you to ping or traceroute from a remote server on the internet back to your network?",
      "To test if your site is reachable from Asia, you use a:",
      "An [admin] uses a 'Looking Glass' server to:"
    ],
    answerOptions: [
      { variants: ["Test external connectivity", "Verify routing from outside"], correct: true, explanation: "Looking Glass servers allow you to view routing/connectivity from an external perspective." },
      { variants: ["Scan internal ports"], correct: false, explanation: "Looking glasses are external." },
      { variants: ["Crack passwords"], correct: false, explanation: "No." },
      { variants: ["Monitor temperature"], correct: false, explanation: "No." }
    ]
  }),

  q(3098, 3, 4, ["Troubleshooting", "Wireless"], {
    variants: [
      "A [user] sits between two APs and their connection constantly drops and reconnects. This is:",
      "When a device aggressively switches between APs, it is:",
      "Device roaming issues where it can't decide which AP is better is called:"
    ],
    answerOptions: [
      { variants: ["Device Thrashing", "Rapid Roaming"], correct: true, explanation: "Thrashing occurs when a client constantly switches between two APs with similar signal strength." },
      { variants: ["Interference"], correct: false, explanation: "Interference causes noise." },
      { variants: ["Absorption"], correct: false, explanation: "Absorption causes low signal." },
      { variants: ["Refraction"], correct: false, explanation: "Refraction bends signal." }
    ]
  }),

  q(3099, 3, 4, ["Troubleshooting", "Duplex"], {
    variants: [
      "A user reports slow speeds (10Mbps) on a Gigabit link. The [switch] shows 'Late Collisions'. What is the cause?",
      "If one side is Full Duplex and the other is Half Duplex, what mismatch occurs?",
      "Late collisions are a hallmark sign of:"
    ],
    answerOptions: [
      { variants: ["Duplex Mismatch"], correct: true, explanation: "Duplex mismatch (one side auto, one side fixed) causes collisions and extreme slowness." },
      { variants: ["Speed Mismatch"], correct: false, explanation: "Speed mismatch usually results in 'Link Down'." },
      { variants: ["VLAN Mismatch"], correct: false, explanation: "VLAN mismatch causes connectivity loss (Black hole)." },
      { variants: ["Bad Cable"], correct: false, explanation: "Bad cable causes CRC errors, but Late Collisions specifically point to Duplex issues." }
    ]
  }),

  q(3100, 3, 3, ["Management", "Model"], {
    variants: [
      "Which ISO model defines the five areas of network management (Fault, Configuration, Accounting, Performance, Security)?",
      "The acronym FCAPS stands for the standard model of:",
      "Network management is often categorized into 5 functional areas known as:"
    ],
    answerOptions: [
      { variants: ["FCAPS"], correct: true, explanation: "Fault, Configuration, Accounting, Performance, Security (FCAPS) is the ISO model for network management." },
      { variants: ["OSI"], correct: false, explanation: "OSI is for data communication." },
      { variants: ["ITIL"], correct: false, explanation: "ITIL is for service management." },
      { variants: ["NIST"], correct: false, explanation: "NIST is for security." }
    ]
  }),

// ==========================================
// DOMAIN 4: SECURITY PRINCIPLES (50Q)
// ==========================================

  // --- TOPIC: The CIA Triad ---

  q(4001, 4, 1, ["CIA", "Integrity"], {
    variants: [
      "Which component of the CIA Triad ensures that data has not been modified or tampered with by an [attacker]?",
      "An [admin] uses hashing to verify that a file has not been altered. Which security principle is this?",
      "Ensuring the accuracy and completeness of data supports which goal?"
    ],
    answerOptions: [
      { variants: ["Integrity"], correct: true, explanation: "Integrity ensures data remains unchanged and accurate (using hashes/signatures)." },
      { variants: ["Confidentiality"], correct: false, explanation: "Confidentiality is about secrecy (Encryption)." },
      { variants: ["Availability"], correct: false, explanation: "Availability is about uptime." },
      { variants: ["Authorization"], correct: false, explanation: "Authorization is about permissions." }
    ]
  }),

  q(4002, 4, 2, ["Controls", "Detective"], {
    variants: [
      "A security camera that records entry into a building is classified as which type of security control?",
      "An [admin] reviews CCTV footage after a break-in. The camera acted as what type of control?",
      "Which control type identifies and records unwanted events but does not physically stop them?"
    ],
    answerOptions: [
      { variants: ["Detective Control"], correct: true, explanation: "Detective controls (Cameras, Logs, IDS) identify events during or after they occur." },
      { variants: ["Preventive Control"], correct: false, explanation: "Preventive controls (Fences, Locks) stop the event from happening." },
      { variants: ["Corrective Control"], correct: false, explanation: "Corrective controls (Backups) fix the damage." },
      { variants: ["Deterrent Control"], correct: false, explanation: "Deterrent controls (Signage) discourage the attempt." }
    ]
  }),

  q(4003, 4, 4, ["Access Control", "MAC"], {
    variants: [
      "Which access control model assigns permissions based on security labels (e.g., 'Top Secret') and user clearance levels?",
      "In a high-security military network, the OS enforces access based on labels. Which model is this?",
      "Which model restricts access based on classification levels rather than user discretion?"
    ],
    answerOptions: [
      { variants: ["Mandatory Access Control (MAC)"], correct: true, explanation: "MAC uses system-enforced labels (Top Secret, Confidential) and clearance levels." },
      { variants: ["Discretionary Access Control (DAC)"], correct: false, explanation: "DAC allows the owner to decide." },
      { variants: ["Role-Based Access Control (RBAC)"], correct: false, explanation: "RBAC is based on job titles." },
      { variants: ["Attribute-Based Access Control (ABAC)"], correct: false, explanation: "ABAC is based on context attributes." }
    ]
  }),

  q(4004, 4, 7, ["Firewall", "ACL"], {
    variants: [
      "What is the final rule in every [firewall] Access Control List (ACL), even if it is not explicitly written?",
      "If a packet does not match any 'Allow' rules in the ACL, what happens by default?",
      "An [admin] configures an ACL. What is the implicit rule at the bottom?"
    ],
    answerOptions: [
      { variants: ["Implicit Deny", "Deny All"], correct: true, explanation: "If traffic is not explicitly allowed, it is denied by default." },
      { variants: ["Allow All"], correct: false, explanation: "This would be insecure." },
      { variants: ["Log Everything"], correct: false, explanation: "Logging is an action, not a filtering rule." },
      { variants: ["Loopback"], correct: false, explanation: "Loopback is a testing address." }
    ]
  }),

  q(4005, 4, 1, ["CIA", "Confidentiality"], {
    variants: [
      "Encryption is primarily used to enforce which principle of the CIA Triad?",
      "To prevent an [attacker] from reading intercepted data, an [admin] applies AES-256. This supports:",
      "Protecting data from unauthorized disclosure is known as:"
    ],
    answerOptions: [
      { variants: ["Confidentiality"], correct: true, explanation: "Encryption makes data unreadable to unauthorized users, ensuring confidentiality." },
      { variants: ["Integrity"], correct: false, explanation: "Integrity uses Hashing." },
      { variants: ["Availability"], correct: false, explanation: "Availability uses Redundancy." },
      { variants: ["Non-Repudiation"], correct: false, explanation: "Non-Repudiation uses Digital Signatures." }
    ]
  }),

  q(4006, 4, 2, ["Controls", "Physical"], {
    variants: [
      "A physical fence surrounding a facility is an example of which type of security control?",
      "Bollards, locks, and guards fall into which control category?",
      "Controls that restrict access to the actual hardware or facility are:"
    ],
    answerOptions: [
      { variants: ["Physical Control"], correct: true, explanation: "Physical controls act as tangible barriers to the facility or hardware." },
      { variants: ["Technical Control"], correct: false, explanation: "Technical (Logical) controls involve software/hardware logic (Firewalls)." },
      { variants: ["Administrative Control"], correct: false, explanation: "Administrative controls involve policies and procedures." },
      { variants: ["Logical Control"], correct: false, explanation: "Same as Technical." }
    ]
  }),

  q(4007, 4, 4, ["Access Control", "DAC"], {
    variants: [
      "In which access control model does the creator or owner of a file have full discretion to assign permissions to others?",
      "Windows NTFS permissions, where a [user] can grant read access to their own files, is an example of:",
      "Which model allows the data owner to determine who has access?"
    ],
    answerOptions: [
      { variants: ["Discretionary Access Control (DAC)"], correct: true, explanation: "DAC allows the object owner to decide permissions (standard in Windows/Linux)." },
      { variants: ["Mandatory Access Control (MAC)"], correct: false, explanation: "MAC uses system-enforced labels." },
      { variants: ["RBAC"], correct: false, explanation: "RBAC uses centralized roles." },
      { variants: ["ABAC"], correct: false, explanation: "ABAC uses policy attributes." }
    ]
  }),

  q(4008, 4, 6, ["Appliance", "WAF"], {
    variants: [
      "Which security appliance protects a web [server] from attacks like SQL Injection and XSS?",
      "An [admin] needs to filter HTTP traffic to stop application-layer exploits. What [device] should they use?",
      "A Layer 7 firewall specifically tuned for HTTP/HTTPS is a:"
    ],
    answerOptions: [
      { variants: ["WAF", "Web Application Firewall"], correct: true, explanation: "A WAF inspects HTTP traffic for web-specific attacks (SQLi, XSS) that standard firewalls might miss." },
      { variants: ["Network Firewall"], correct: false, explanation: "Network firewalls typically focus on Ports/IPs." },
      { variants: ["IPS"], correct: false, explanation: "IPS is general purpose; WAF is HTTP specific." },
      { variants: ["Proxy"], correct: false, explanation: "Proxy is an intermediary, but WAF is the security function." }
    ]
  }),

  q(4009, 4, 5, ["Architecture", "DMZ"], {
    variants: [
      "Which network zone contains public-facing services (like web servers) that need to be accessible from the internet?",
      "To protect the internal LAN, where should an [admin] place a public FTP server?",
      "The semi-trusted zone between the internet and the internal network is the:"
    ],
    answerOptions: [
      { variants: ["DMZ", "Demilitarized Zone", "Screened Subnet"], correct: true, explanation: "The DMZ isolates public-facing services so that if they are compromised, the internal LAN remains safe." },
      { variants: ["Intranet"], correct: false, explanation: "Intranet is private internal." },
      { variants: ["Management VLAN"], correct: false, explanation: "Management is for admins only." },
      { variants: ["Guest Network"], correct: false, explanation: "Guest network is for visitors." }
    ]
  }),

  q(4010, 4, 2, ["Controls", "Deterrent"], {
    variants: [
      "A 'Warning: Guard Dog on Duty' sign serves primarily as which type of control?",
      "Bright lighting and 'Video Surveillance' signs are designed to:",
      "Which control type relies on psychology to discourage an [attacker]?"
    ],
    answerOptions: [
      { variants: ["Deterrent"], correct: true, explanation: "Deterrent controls discourage attackers from attempting the breach in the first place." },
      { variants: ["Preventive"], correct: false, explanation: "Preventive controls (locks) physically stop the action." },
      { variants: ["Detective"], correct: false, explanation: "Detective controls (cameras) record the action." },
      { variants: ["Corrective"], correct: false, explanation: "Corrective controls fix the damage." }
    ]
  }),

  q(4011, 4, 4, ["Access Control", "RBAC"], {
    variants: [
      "Which access control model grants permissions based on a [user]'s job function or title?",
      "An [admin] assigns users to the 'Sales' group to give them access to sales files. This is:",
      "Which model simplifies management by assigning rights to groups rather than individuals?"
    ],
    answerOptions: [
      { variants: ["RBAC", "Role-Based Access Control"], correct: true, explanation: "RBAC aligns permissions with organizational roles (jobs), streamlining management." },
      { variants: ["DAC"], correct: false, explanation: "DAC is owner-based." },
      { variants: ["MAC"], correct: false, explanation: "MAC is label-based." },
      { variants: ["Rule-Based"], correct: false, explanation: "Rule-based uses global rules (like firewalls)." }
    ]
  }),

  q(4012, 4, 3, ["Framework", "NIST"], {
    variants: [
      "In the NIST Cybersecurity Framework, which function involves implementing safeguards like training and encryption?",
      "To limit the impact of a potential event, [company] implements access controls. Which NIST function is this?",
      "Identify, ________, Detect, Respond, Recover."
    ],
    answerOptions: [
      { variants: ["Protect"], correct: true, explanation: "The 'Protect' function focuses on safeguards to ensure service delivery and limit impact." },
      { variants: ["Identify"], correct: false, explanation: "Identify is about understanding assets and risks." },
      { variants: ["Detect"], correct: false, explanation: "Detect is about monitoring." },
      { variants: ["Respond"], correct: false, explanation: "Respond is action during an incident." }
    ]
  }),

  q(4013, 4, 6, ["Architecture", "Jump Server"], {
    variants: [
      "What is the purpose of a Jump Server in a secure network architecture?",
      "An [admin] must VPN into a hardened 'Bastion Host' before accessing internal servers. Why?",
      "To segregate management traffic, admins connect to this intermediate [device] first:"
    ],
    answerOptions: [
      { variants: ["Single point of entry for admins", "Hardened entry point"], correct: true, explanation: "Jump Servers provide a choke point for administrative access, allowing for tight monitoring and hardening." },
      { variants: ["Load Balancing"], correct: false, explanation: "Load balancing distributes traffic." },
      { variants: ["Content Caching"], correct: false, explanation: "Proxies cache content." },
      { variants: ["Routing Email"], correct: false, explanation: "Mail gateways route email." }
    ]
  }),

  q(4014, 4, 1, ["CIA", "Availability"], {
    variants: [
      "Implementing RAID, redundant power supplies, and clustering primarily supports which CIA principle?",
      "To ensure the [server] stays online even if a drive fails, an [admin] uses RAID. This protects:",
      "DoS attacks target which leg of the CIA Triad?"
    ],
    answerOptions: [
      { variants: ["Availability"], correct: true, explanation: "Availability ensures systems and data are accessible when needed (uptime)." },
      { variants: ["Integrity"], correct: false, explanation: "Integrity prevents modification." },
      { variants: ["Confidentiality"], correct: false, explanation: "Confidentiality prevents disclosure." },
      { variants: ["Safety"], correct: false, explanation: "Safety refers to human life." }
    ]
  }),

  q(4015, 4, 6, ["Appliance", "Proxy"], {
    variants: [
      "Which [device] acts as an intermediary for client requests, often used for content filtering and caching?",
      "To hide internal IP addresses and block social media sites, [company] routes web traffic through a:",
      "A Forward ________ makes requests on behalf of the client."
    ],
    answerOptions: [
      { variants: ["Proxy Server", "Forward Proxy"], correct: true, explanation: "A Proxy intercepts client requests, allowing for caching, filtering, and anonymity." },
      { variants: ["Router"], correct: false, explanation: "Routers forward packets based on IP." },
      { variants: ["Switch"], correct: false, explanation: "Switches forward frames based on MAC." },
      { variants: ["DNS Server"], correct: false, explanation: "DNS resolves names." }
    ]
  }),

  q(4016, 4, 7, ["ACL", "Logic"], {
    variants: [
      "If a packet does not match any 'Allow' rules in an ACL, what is the default action?",
      "An [admin] writes 10 allow rules. Traffic that doesn't match any of them is:",
      "What is the 'Implicit' rule at the bottom of every ACL?"
    ],
    answerOptions: [
      { variants: ["Dropped", "Implicit Deny"], correct: true, explanation: "Security best practice is 'Default Deny'. If not explicitly allowed, it is forbidden." },
      { variants: ["Allowed"], correct: false, explanation: "Default Allow is insecure." },
      { variants: ["Flagged"], correct: false, explanation: "Logging happens, but the action is Drop." },
      { variants: ["Looped"], correct: false, explanation: "It is not looped." }
    ]
  }),

  q(4017, 4, 2, ["Controls", "Corrective"], {
    variants: [
      "Restoring a system from a backup tape after a ransomware attack is which type of control?",
      "An [admin] re-images a [device] after a malware infection. This action is:",
      "Controls that mitigate damage AFTER an incident has occurred are:"
    ],
    answerOptions: [
      { variants: ["Corrective Control"], correct: true, explanation: "Corrective controls restore the system to a normal state after an event." },
      { variants: ["Preventive Control"], correct: false, explanation: "Preventive would stop the ransomware from running." },
      { variants: ["Detective Control"], correct: false, explanation: "Detective would trigger an alert." },
      { variants: ["Deterrent Control"], correct: false, explanation: "Deterrent would discourage the attacker." }
    ]
  }),

  q(4018, 4, 4, ["Access Control", "ABAC"], {
    variants: [
      "Which access model is the most flexible, using logic like 'If User=Manager AND Time=9am'?",
      "An [admin] configures policies based on location, device health, and time of day. This is:",
      "The 'Next Generation' of access control that considers context is:"
    ],
    answerOptions: [
      { variants: ["ABAC", "Attribute-Based Access Control"], correct: true, explanation: "ABAC uses attributes of the user, resource, and environment to make dynamic decisions." },
      { variants: ["RBAC"], correct: false, explanation: "RBAC is static based on roles." },
      { variants: ["DAC"], correct: false, explanation: "DAC is owner-based." },
      { variants: ["MAC"], correct: false, explanation: "MAC is label-based." }
    ]
  }),

  q(4019, 4, 3, ["Admin", "Analysis"], {
    variants: [
      "The process of comparing your current security posture against a desired standard is:",
      "[company] checks their network against the NIST framework to find missing controls. This is a:",
      "To find where you are lacking compared to where you want to be, perform a:"
    ],
    answerOptions: [
      { variants: ["Gap Analysis"], correct: true, explanation: "Gap Analysis identifies the 'gap' between current implementation and required standards." },
      { variants: ["Penetration Test"], correct: false, explanation: "Pen tests exploit vulnerabilities." },
      { variants: ["Vulnerability Scan"], correct: false, explanation: "Scans look for software bugs." },
      { variants: ["Forensic Analysis"], correct: false, explanation: "Forensics investigate incidents." }
    ]
  }),

  q(4020, 4, 6, ["Appliance", "UTM"], {
    variants: [
      "A single appliance that combines firewall, antivirus, spam filter, and IPS is called:",
      "For a small office, an [admin] installs one [device] to handle all security functions. This is a:",
      "All-in-one security gateways are known as:"
    ],
    answerOptions: [
      { variants: ["UTM", "Unified Threat Management"], correct: true, explanation: "UTM consolidates multiple security functions into a single hardware appliance." },
      { variants: ["Router"], correct: false, explanation: "Routers route." },
      { variants: ["Switch"], correct: false, explanation: "Switches switch." },
      { variants: ["Modem"], correct: false, explanation: "Modems connect to ISP." }
    ]
  }),

  q(4021, 4, 1, ["CIA", "Non-Repudiation"], {
    variants: [
      "Which security concept ensures that a sender cannot deny having sent a specific message?",
      "Digital signatures utilize a private key to provide:",
      "In a legal dispute, which concept proves the origin of the email?"
    ],
    answerOptions: [
      { variants: ["Non-Repudiation"], correct: true, explanation: "Non-Repudiation provides proof of origin so the author cannot deny their action." },
      { variants: ["Integrity"], correct: false, explanation: "Integrity proves it wasn't changed, but not necessarily WHO sent it (unless signed)." },
      { variants: ["Confidentiality"], correct: false, explanation: "Confidentiality hides data." },
      { variants: ["Authentication"], correct: false, explanation: "Authentication proves identity for access, not necessarily authorship of a doc." }
    ]
  }),

  q(4022, 4, 5, ["Architecture", "Defense"], {
    variants: [
      "In a Defense-in-Depth strategy, endpoint devices are considered which line of defense?",
      "If the firewall and network ACLs fail, what is the 'Last Line of Defense'?",
      "Host-based firewalls and antivirus reside on the:"
    ],
    answerOptions: [
      { variants: ["Last Line of Defense", "Endpoint"], correct: true, explanation: "The endpoint is the final barrier. If network defenses fail, the endpoint must protect itself." },
      { variants: ["First Line of Defense"], correct: false, explanation: "First line is usually the perimeter firewall." },
      { variants: ["Perimeter"], correct: false, explanation: "Perimeter is the edge." },
      { variants: ["Zero Line"], correct: false, explanation: "Not a standard term." }
    ]
  }),

  q(4023, 4, 2, ["Controls", "Managerial"], {
    variants: [
      "Mandatory vacations and background checks are examples of which type of security control?",
      "An [admin] writes a policy requiring job rotation. This is a:",
      "Controls focused on people, policy, and procedures are:"
    ],
    answerOptions: [
      { variants: ["Administrative", "Managerial"], correct: true, explanation: "Administrative controls regulate human behavior and policy." },
      { variants: ["Technical"], correct: false, explanation: "Technical controls use software/hardware." },
      { variants: ["Physical"], correct: false, explanation: "Physical controls use barriers." },
      { variants: ["Logical"], correct: false, explanation: "Logical is the same as Technical." }
    ]
  }),

  q(4024, 4, 7, ["ACL", "Legacy"], {
    variants: [
      "A Standard Access Control List (ACL) on a [router] can filter traffic based on which criteria?",
      "Which legacy ACL type can ONLY filter based on Source IP address?",
      "You need to block a specific user IP from accessing anything. A Standard ACL works because it checks:"
    ],
    answerOptions: [
      { variants: ["Source IP Address"], correct: true, explanation: "Standard ACLs (1-99 on Cisco) only examine the Source IP." },
      { variants: ["Destination IP"], correct: false, explanation: "Extended ACLs check destination." },
      { variants: ["Port Number"], correct: false, explanation: "Extended ACLs check ports." },
      { variants: ["Protocol"], correct: false, explanation: "Extended ACLs check protocols." }
    ]
  }),

  q(4025, 4, 6, ["Appliance", "Load Balancer"], {
    variants: [
      "Which [device] distributes incoming traffic across multiple servers to ensure no single server is overwhelmed?",
      "To improve the availability of a web application, an [admin] installs a:",
      "Round-Robin and Least-Connections are algorithms used by a:"
    ],
    answerOptions: [
      { variants: ["Load Balancer"], correct: true, explanation: "Load Balancers distribute workload to improve performance and availability." },
      { variants: ["Proxy Server"], correct: false, explanation: "Proxy acts as an intermediary." },
      { variants: ["Router"], correct: false, explanation: "Router directs packets based on IP." },
      { variants: ["Switch"], correct: false, explanation: "Switch directs frames." }
    ]
  }),

  q(4026, 4, 5, ["Architecture", "VLAN"], {
    variants: [
      "Which technology allows you to logically segment a [switch] into multiple virtual networks?",
      "To isolate the Finance department from Engineering on the same physical switch, use:",
      "Broadcast domains can be segmented at Layer 2 using:"
    ],
    answerOptions: [
      { variants: ["VLAN", "Virtual LAN"], correct: true, explanation: "VLANs segment a switch into separate broadcast domains for security and efficiency." },
      { variants: ["Trunking"], correct: false, explanation: "Trunking carries VLANs." },
      { variants: ["Subnetting"], correct: false, explanation: "Subnetting is Layer 3 segmentation." },
      { variants: ["DMZ"], correct: false, explanation: "DMZ is a security zone concept, usually Layer 3." }
    ]
  }),

  q(4027, 4, 6, ["Appliance", "IDS"], {
    variants: [
      "Which system monitors network traffic for suspicious activity and alerts [admin]s but does NOT block the traffic?",
      "A security [device] configured in 'Promiscuous Mode' to watch traffic is likely an:",
      "Passive monitoring for signatures of known attacks is performed by:"
    ],
    answerOptions: [
      { variants: ["IDS", "Intrusion Detection System"], correct: true, explanation: "IDS detects and alerts but is passive (doesn't block)." },
      { variants: ["IPS"], correct: false, explanation: "IPS (Prevention) actively blocks." },
      { variants: ["Firewall"], correct: false, explanation: "Firewalls block based on rules." },
      { variants: ["WAF"], correct: false, explanation: "WAF blocks web attacks." }
    ]
  }),

  q(4028, 4, 1, ["Policy", "Principle"], {
    variants: [
      "The principle of Least Privilege dictates that [user]s should be granted:",
      "An [admin] audits permissions to ensure everyone has only what they need. This enforces:",
      "Limiting access to the bare minimum required for a job function is:"
    ],
    answerOptions: [
      { variants: ["Minimum permissions necessary", "Least Privilege"], correct: true, explanation: "Least Privilege ensures users have only the rights needed to do their job, reducing risk." },
      { variants: ["No permissions"], correct: false, explanation: "Users need some permissions to work." },
      { variants: ["Administrative access"], correct: false, explanation: "Admin access violates least privilege for normal users." },
      { variants: ["Read-Only access"], correct: false, explanation: "Some jobs require Write access." }
    ]
  }),

  q(4029, 4, 3, ["Defense", "Deception"], {
    variants: [
      "A decoy system configured to look vulnerable to attract and study [attacker]s is called a:",
      "To distract hackers from the real production database, an [admin] sets up a:",
      "A server with fake data and weak security monitoring for intrusion attempts is a:"
    ],
    answerOptions: [
      { variants: ["Honeypot"], correct: true, explanation: "Honeypots are decoy systems designed to lure attackers and study their methods." },
      { variants: ["Firewall"], correct: false, explanation: "Firewalls block traffic." },
      { variants: ["Jump Server"], correct: false, explanation: "Jump Servers are for secure admin access." },
      { variants: ["Proxy"], correct: false, explanation: "Proxies relay traffic." }
    ]
  }),

  q(4030, 4, 7, ["ACL", "Extended"], {
    variants: [
      "Unlike a Standard ACL, an Extended ACL can filter traffic based on:",
      "To block only Port 80 traffic from a specific IP, you must use which type of ACL?",
      "Which ACL type allows filtering by Protocol and Port number?"
    ],
    answerOptions: [
      { variants: ["Source, Destination, Protocol, and Port"], correct: true, explanation: "Extended ACLs provide granular control, filtering by IPs, Protocols (TCP/UDP), and Ports." },
      { variants: ["Source IP only"], correct: false, explanation: "This is Standard ACL." },
      { variants: ["MAC Address only"], correct: false, explanation: "This is Port Security." },
      { variants: ["Username"], correct: false, explanation: "ACLs don't see usernames (usually)." }
    ]
  }),

  q(4031, 4, 5, ["Architecture", "Segmentation"], {
    variants: [
      "Which practice MOST directly limits lateral movement if an [device] is compromised?",
      "Implementing 'Zero Trust' often involves breaking the network into tiny zones. This is:",
      "To stop ransomware from spreading between servers, you should use:"
    ],
    answerOptions: [
      { variants: ["Microsegmentation", "Network Segmentation"], correct: true, explanation: "Segmentation/Microsegmentation places controls between workloads, preventing lateral spread." },
      { variants: ["Flat Network"], correct: false, explanation: "Flat networks allow easy spread." },
      { variants: ["Disabling MFA"], correct: false, explanation: "Disabling security is bad." },
      { variants: ["Guest Wi-Fi"], correct: false, explanation: "Guest Wi-Fi segments visitors, but microsegmentation protects servers." }
    ]
  }),

  q(4032, 4, 6, ["PKI", "Trust"], {
    variants: [
      "A browser warning 'certificate not trusted' most commonly indicates:",
      "If the root CA is not in the client's trust store, what error occurs?",
      "A self-signed certificate usually triggers which browser error?"
    ],
    answerOptions: [
      { variants: ["Certificate Chain / Trust Issue", "Invalid Authority"], correct: true, explanation: "If the browser cannot trace the certificate back to a Trusted Root CA, it shows a warning." },
      { variants: ["Server is down"], correct: false, explanation: "The server responded, but the cert is bad." },
      { variants: ["DNS Error"], correct: false, explanation: "DNS resolved fine." },
      { variants: ["Expired Cert"], correct: false, explanation: "Expired is a specific date error, 'Not Trusted' is a chain error." }
    ]
  }),

  q(4033, 4, 7, ["Firewall", "Stateful"], {
    variants: [
      "A stateful [firewall] differs from a stateless firewall because it:",
      "Which [device] remembers active connections and automatically allows return traffic?",
      "To allow a reply packet without an explicit 'Allow' rule, the firewall uses:"
    ],
    answerOptions: [
      { variants: ["State Table", "Connection Tracking"], correct: true, explanation: "Stateful firewalls track the state of connections (SYN, ACK) and allow return traffic automatically." },
      { variants: ["Packet Filtering"], correct: false, explanation: "Stateless firewalls filter individual packets without context." },
      { variants: ["VLAN Routing"], correct: false, explanation: "Routing is a Layer 3 function." },
      { variants: ["DNS"], correct: false, explanation: "DNS resolves names." }
    ]
  }),

  q(4034, 4, 2, ["Controls", "Technical"], {
    variants: [
      "Requiring MFA for VPN logins is primarily which control type?",
      "A smart card reader on a door is a Physical control. A smart card reader on a laptop is a:",
      "Controls implemented via technology (software/hardware) are:"
    ],
    answerOptions: [
      { variants: ["Technical Control", "Logical Control"], correct: true, explanation: "MFA and authentication systems are Technical (Logical) controls." },
      { variants: ["Physical Control"], correct: false, explanation: "Physical controls are barriers (fences, doors)." },
      { variants: ["Administrative Control"], correct: false, explanation: "Admin controls are policies." },
      { variants: ["Corrective Control"], correct: false, explanation: "MFA is Preventive." }
    ]
  }),

  q(4035, 4, 4, ["Access Control", "NAC"], {
    variants: [
      "802.1X authentication on a [switch] port is an example of:",
      "Checking a device for antivirus updates before allowing it on the network is:",
      "What solution controls admission to the network based on identity and health?"
    ],
    answerOptions: [
      { variants: ["NAC", "Network Access Control"], correct: true, explanation: "NAC controls access to the network based on authentication (802.1X) and posture assessment." },
      { variants: ["Content Filtering"], correct: false, explanation: "Content filtering blocks websites." },
      { variants: ["Routing"], correct: false, explanation: "Routing moves packets." },
      { variants: ["DLP"], correct: false, explanation: "DLP stops data theft." }
    ]
  }),

  q(4036, 4, 6, ["Web", "Security"], {
    variants: [
      "Which web security mechanism tells browsers to prefer HTTPS and avoid protocol downgrade?",
      "To prevent 'SSL Stripping' attacks, web servers send this header:",
      "HSTS stands for:"
    ],
    answerOptions: [
      { variants: ["HTTP Strict Transport Security (HSTS)"], correct: true, explanation: "HSTS instructs the browser to always use HTTPS for a domain, preventing downgrade attacks." },
      { variants: ["NTP"], correct: false, explanation: "NTP is time." },
      { variants: ["SMB Signing"], correct: false, explanation: "SMB signing is for file shares." },
      { variants: ["WEP"], correct: false, explanation: "WEP is broken Wi-Fi security." }
    ]
  }),

  q(4037, 4, 5, ["Architecture", "Placement"], {
    variants: [
      "Which is the BEST placement for a public web server that must be reachable from the internet?",
      "To protect the database server, the web front-end should be placed in the:",
      "Services that need to be exposed to the public internet go in the:"
    ],
    answerOptions: [
      { variants: ["DMZ"], correct: true, explanation: "Public-facing services belong in the DMZ. Private data (databases) belongs in the Internal network." },
      { variants: ["Internal LAN"], correct: false, explanation: "Never put public servers directly on the Internal LAN." },
      { variants: ["Management VLAN"], correct: false, explanation: "Management is for admins." },
      { variants: ["Storage VLAN"], correct: false, explanation: "Storage is high-speed backend." }
    ]
  }),

  q(4038, 4, 3, ["Risk", "Mitigation"], {
    variants: [
      "Which action MOST directly reduces risk from known vulnerabilities on network appliances?",
      "To fix a CVE on a [firewall], the [admin] must:",
      "Firmware updates primarily provide:"
    ],
    answerOptions: [
      { variants: ["Patching", "Security Updates"], correct: true, explanation: "Patching/Updates fix known vulnerabilities (CVEs)." },
      { variants: ["Backups"], correct: false, explanation: "Backups allow recovery, they don't fix the vulnerability." },
      { variants: ["Logging"], correct: false, explanation: "Logging detects attacks." },
      { variants: ["Passwords"], correct: false, explanation: "Passwords restrict access." }
    ]
  }),

  q(4039, 4, 7, ["Wireless", "Isolation"], {
    variants: [
      "To keep guest Wi-Fi users from accessing internal resources, you should implement:",
      "Client Isolation and VLAN segregation are key for which network?",
      "How should [company] treat visitor devices?"
    ],
    answerOptions: [
      { variants: ["Guest VLAN", "Guest Isolation"], correct: true, explanation: "Guests should be on a separate VLAN with firewall rules blocking access to the internal network." },
      { variants: ["Shared PSK"], correct: false, explanation: "Shared passwords don't isolate traffic." },
      { variants: ["WEP"], correct: false, explanation: "WEP is insecure." },
      { variants: ["Port Mirroring"], correct: false, explanation: "Mirroring is for monitoring." }
    ]
  }),

  q(4040, 4, 1, ["CIA", "Recovery"], {
    variants: [
      "Regular, tested backups primarily support which CIA objective when ransomware encrypts data?",
      "If Availability is compromised by a crash, what restores it?",
      "The 'A' in CIA stands for:"
    ],
    answerOptions: [
      { variants: ["Availability"], correct: true, explanation: "Backups ensure data is available again after destruction or corruption." },
      { variants: ["Confidentiality"], correct: false, explanation: "Backups don't hide data (they actually increase exposure risk if not encrypted)." },
      { variants: ["Integrity"], correct: false, explanation: "Backups restore a previous state, but hashing ensures integrity." },
      { variants: ["Non-repudiation"], correct: false, explanation: "Signatures provide non-repudiation." }
    ]
  }),

  q(4041, 4, 4, ["Management", "Hardening"], {
    variants: [
      "Which management practice MOST reduces the risk of credential theft during [device] administration?",
      "To manage a [router] securely, avoid Telnet and use:",
      "Using SSH keys instead of passwords helps prevent:"
    ],
    answerOptions: [
      { variants: ["SSH with Keys", "Encrypted Management"], correct: true, explanation: "SSH encrypts the session. Using keys eliminates the risk of password sniffing or guessing." },
      { variants: ["Telnet"], correct: false, explanation: "Telnet sends passwords in cleartext." },
      { variants: ["HTTP"], correct: false, explanation: "HTTP is cleartext." },
      { variants: ["Shared Passwords"], correct: false, explanation: "Shared passwords reduce accountability." }
    ]
  }),

  q(4042, 4, 5, ["Logging", "Centralization"], {
    variants: [
      "Centralizing logs from routers, switches, and firewalls primarily improves:",
      "To perform correlation and root cause analysis across the enterprise, use:",
      "Why send logs to a Syslog server instead of keeping them local?"
    ],
    answerOptions: [
      { variants: ["Incident Detection", "Forensics"], correct: true, explanation: "Centralized logs allow correlation of events across devices and protect logs if a device is compromised." },
      { variants: ["Network Speed"], correct: false, explanation: "Logging generates traffic, slightly reducing speed." },
      { variants: ["Wi-Fi Roaming"], correct: false, explanation: "Roaming is unrelated to logs." },
      { variants: ["Subnet size"], correct: false, explanation: "Subnets are addressing." }
    ]
  }),

  q(4043, 4, 6, ["Certificates", "Validation"], {
    variants: [
      "Which certificate field is MOST associated with validating the site name you intended to reach?",
      "A browser checks this field in the certificate to ensure it matches the URL:",
      "Subject Alternative Name (SAN) allows a certificate to:"
    ],
    answerOptions: [
      { variants: ["SAN / Common Name", "Subject Alternative Name"], correct: true, explanation: "The SAN (or legacy Common Name) must match the DNS name (URL) the user typed." },
      { variants: ["Serial Number"], correct: false, explanation: "Serial identifies the cert, not the site name." },
      { variants: ["Issuer"], correct: false, explanation: "Issuer is the CA." },
      { variants: ["Thumbprint"], correct: false, explanation: "Thumbprint is the hash." }
    ]
  }),

  q(4044, 4, 7, ["Firewall", "Policy"], {
    variants: [
      "Best practice for firewall policy design is to:",
      "Should a firewall default to 'Allow' or 'Deny'?",
      "A whitelist approach implies:"
    ],
    answerOptions: [
      { variants: ["Default Deny", "Deny All First"], correct: true, explanation: "Block everything by default, then explicitly allow only what is necessary." },
      { variants: ["Default Allow"], correct: false, explanation: "Default Allow is insecure." },
      { variants: ["Log Everything"], correct: false, explanation: "Logging is good, but filtering is the primary goal." },
      { variants: ["Disable Updates"], correct: false, explanation: "Never disable updates." }
    ]
  }),

  q(4045, 4, 3, ["Access", "Principle"], {
    variants: [
      "Which concept ensures users receive only the access needed to perform their job?",
      "An [admin] removes 'Domain Admin' rights from a user who only resets passwords. This follows:",
      "The opposite of 'Superuser by default' is:"
    ],
    answerOptions: [
      { variants: ["Least Privilege"], correct: true, explanation: "Least Privilege limits exposure by granting minimal rights." },
      { variants: ["Implicit Trust"], correct: false, explanation: "Implicit trust is bad (Zero Trust is the modern standard)." },
      { variants: ["Full Control"], correct: false, explanation: "Full control is the opposite of least privilege." },
      { variants: ["Anonymous Access"], correct: false, explanation: "Anonymous means unauthenticated." }
    ]
  }),

  q(4046, 4, 6, ["Data", "Protection"], {
    variants: [
      "A control designed to prevent sensitive data from leaving the organization via email or uploads is:",
      "Which system detects Social Security Numbers in outgoing emails and blocks them?",
      "Stopping exfiltration is the goal of:"
    ],
    answerOptions: [
      { variants: ["DLP", "Data Loss Prevention"], correct: true, explanation: "DLP systems inspect data in motion (or at rest) to prevent unauthorized exfiltration." },
      { variants: ["NAT"], correct: false, explanation: "NAT translates IPs." },
      { variants: ["ARP"], correct: false, explanation: "ARP maps MACs." },
      { variants: ["STP"], correct: false, explanation: "STP prevents loops." }
    ]
  }),

  q(4047, 4, 5, ["Architecture", "Management"], {
    variants: [
      "Which approach BEST protects network device management interfaces from user traffic?",
      "An [admin] puts the web interface of the switch on VLAN 99. No users have access to VLAN 99. This is:",
      "Separating the Management Plane from the Data Plane uses a:"
    ],
    answerOptions: [
      { variants: ["Management VLAN", "OOB Network"], correct: true, explanation: "Using a dedicated Management VLAN combined with ACLs ensures users cannot attack device admin interfaces." },
      { variants: ["Default VLAN"], correct: false, explanation: "Default VLAN (1) is insecure." },
      { variants: ["User VLAN"], correct: false, explanation: "Mixing user and management traffic is a risk." },
      { variants: ["Open SNMP"], correct: false, explanation: "Open SNMP is insecure." }
    ]
  }),

  q(4048, 4, 4, ["Wireless", "Risk"], {
    variants: [
      "Which is the BEST reason to avoid open (unencrypted) Wi-Fi for internal corporate access?",
      "Why is 'Coffee Shop' style Wi-Fi bad for corporate data?",
      "Without encryption, wireless frames can be:"
    ],
    answerOptions: [
      { variants: ["Interception", "Sniffing"], correct: true, explanation: "Open Wi-Fi sends data in cleartext (at Layer 2), allowing anyone nearby to capture it." },
      { variants: ["Power usage"], correct: false, explanation: "Encryption uses negligible power." },
      { variants: ["VLANs"], correct: false, explanation: "Open Wi-Fi can still use VLANs, but it's insecure." },
      { variants: ["DHCP"], correct: false, explanation: "DHCP works fine on open Wi-Fi." }
    ]
  }),

  q(4049, 4, 6, ["Integrity", "Supply Chain"], {
    variants: [
      "Which practice helps ensure firmware updates for network [device]s have not been tampered with?",
      "Before installing a new router OS, the [admin] checks the SHA-256 hash. Why?",
      "Digital signatures on firmware files verify:"
    ],
    answerOptions: [
      { variants: ["Integrity", "Authenticity"], correct: true, explanation: "Verifying hashes/signatures ensures the file came from the vendor and wasn't modified." },
      { variants: ["Confidentiality"], correct: false, explanation: "Firmware is usually public code." },
      { variants: ["Availability"], correct: false, explanation: "Availability is about downloading it." },
      { variants: ["Encryption"], correct: false, explanation: "The file might not be encrypted, just signed." }
    ]
  }),

  q(4050, 4, 5, ["Auth", "Phishing"], {
    variants: [
      "Which MFA factor is MOST resistant to phishing compared to SMS codes?",
      "To stop real-time phishing proxies (like Evilginx), [company] deploys:",
      "A physical FIDO2 key is safer than an app because it validates the:"
    ],
    answerOptions: [
      { variants: ["Hardware Security Key", "FIDO2/WebAuthn"], correct: true, explanation: "Hardware keys bind the login to the specific domain, making them immune to standard phishing sites." },
      { variants: ["SMS OTP"], correct: false, explanation: "SMS is easily phished/intercepted." },
      { variants: ["Email Code"], correct: false, explanation: "Email is easily phished." },
      { variants: ["Security Question"], correct: false, explanation: "Answers can be guessed or phished." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Access Control & IAM (Questions 4051-4065)
  // ============================================================

  q(4051, 4, 4, ["Access", "Federation"], {
    variants: [
      "Which technology allows a [user] to log in to [company] using their Google credentials?",
      "To enable employees to access Salesforce using their Active Directory login, an [admin] configures:",
      "Trusting an external Identity Provider (IdP) to authenticate users is known as:"
    ],
    answerOptions: [
      { variants: ["Federation", "Federated Identity"], correct: true, explanation: "Federation establishes a trust relationship between organizations to share identity." },
      { variants: ["SSO"], correct: false, explanation: "SSO is the result; Federation is the trust model enabling it across domains." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is a directory protocol." },
      { variants: ["Radius"], correct: false, explanation: "Radius is AAA." }
    ]
  }),

  q(4052, 4, 4, ["Access", "SAML"], {
    variants: [
      "Which XML-based standard is commonly used to exchange authentication and authorization data in Federated systems?",
      "When a [user] logs into a cloud app via SSO, the browser passes a token formatted in:",
      "The standard often used between an Identity Provider (IdP) and Service Provider (SP) is:"
    ],
    answerOptions: [
      { variants: ["SAML", "Security Assertion Markup Language"], correct: true, explanation: "SAML is the XML standard for exchanging authentication/authorization data." },
      { variants: ["OIDC"], correct: false, explanation: "OIDC uses JSON (JWT), not XML." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos uses binary tickets." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS uses UDP packets." }
    ]
  }),

  q(4053, 4, 4, ["Access", "RADIUS"], {
    variants: [
      "RADIUS is primarily used for which AAA function?",
      "When a user connects to the VPN, the firewall checks their credentials against a central server using:",
      "Which protocol is the standard for network access authentication (802.1X/VPN)?"
    ],
    answerOptions: [
      { variants: ["Network Access", "Remote Access"], correct: true, explanation: "RADIUS centralizes Authentication, Authorization, and Accounting for network access." },
      { variants: ["File Access"], correct: false, explanation: "SMB/NFS handles file access." },
      { variants: ["Device Administration"], correct: false, explanation: "TACACS+ is preferred for device admin." },
      { variants: ["Email Retrieval"], correct: false, explanation: "IMAP retrieves email." }
    ]
  }),

  q(4054, 4, 4, ["Access", "TACACS+"], {
    variants: [
      "Compared to RADIUS, TACACS+ is often preferred for device administration because it:",
      "An [admin] needs to log every command typed on a [router]. Which protocol supports granular command authorization?",
      "Which AAA protocol encrypts the *entire* payload, not just the password?"
    ],
    answerOptions: [
      { variants: ["Encrypts the entire payload", "Separates AAA functions"], correct: true, explanation: "TACACS+ encrypts the whole packet and separates Authentication/Authorization/Accounting." },
      { variants: ["Is UDP based"], correct: false, explanation: "TACACS+ is TCP; RADIUS is UDP." },
      { variants: ["Is vendor neutral"], correct: false, explanation: "TACACS+ was Cisco proprietary (though now standardized as TACACS+)." },
      { variants: ["Is faster"], correct: false, explanation: "TCP overhead makes it slightly slower than UDP RADIUS." }
    ]
  }),

  q(4055, 4, 4, ["Access", "Kerberos"], {
    variants: [
      "Which authentication protocol relies on 'Tickets' and a Key Distribution Center (KDC)?",
      "Active Directory uses this time-sensitive protocol for default authentication:",
      "To prevent replay attacks, this protocol requires tight time synchronization:"
    ],
    answerOptions: [
      { variants: ["Kerberos"], correct: true, explanation: "Kerberos uses tickets (TGT/ST) and requires time sync to prevent replays." },
      { variants: ["NTLM"], correct: false, explanation: "NTLM is the legacy challenge-response fallback." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is for querying the directory, not the auth protocol itself." },
      { variants: ["Radius"], correct: false, explanation: "Radius is for network access." }
    ]
  }),

  q(4056, 4, 4, ["Access", "LDAP"], {
    variants: [
      "Which protocol is used to query and modify data in a directory service like Active Directory?",
      "To find a user's email address in the corporate directory, an app uses:",
      "Lightweight Directory Access Protocol operates on port:"
    ],
    answerOptions: [
      { variants: ["389", "LDAP"], correct: true, explanation: "LDAP (TCP 389) is the standard for directory queries." },
      { variants: ["636"], correct: false, explanation: "636 is LDAPS (Secure)." },
      { variants: ["88"], correct: false, explanation: "88 is Kerberos." },
      { variants: ["445"], correct: false, explanation: "445 is SMB." }
    ]
  }),

  q(4057, 4, 4, ["Access", "802.1X"], {
    variants: [
      "IEEE 802.1X is a standard for:",
      "Preventing unauthorized devices from using a wall jack requires enabling:",
      "Port-based Network Access Control (NAC) utilizes which protocol?"
    ],
    answerOptions: [
      { variants: ["Port-based Network Access Control"], correct: true, explanation: "802.1X forces authentication before a port passes data." },
      { variants: ["Wireless Speed"], correct: false, explanation: "That's 802.11." },
      { variants: ["VLAN Tagging"], correct: false, explanation: "That's 802.1Q." },
      { variants: ["PoE"], correct: false, explanation: "That's 802.3af/at." }
    ]
  }),

  q(4058, 4, 2, ["MFA", "Factors"], {
    variants: [
      "Which of the following is an example of 'Something You Are'?",
      "A fingerprint or retina scan falls into which authentication category?",
      "Biometrics relies on physical characteristics, known as:"
    ],
    answerOptions: [
      { variants: ["Inherence Factor", "Something You Are"], correct: true, explanation: "Inherence refers to biological traits (Face, Fingerprint, Iris)." },
      { variants: ["Knowledge Factor"], correct: false, explanation: "Knowledge is passwords/PINs." },
      { variants: ["Possession Factor"], correct: false, explanation: "Possession is tokens/phones." },
      { variants: ["Location Factor"], correct: false, explanation: "Location is where you are." }
    ]
  }),

  q(4059, 4, 2, ["MFA", "Factors"], {
    variants: [
      "A smart card or RSA token is an example of:",
      "To log in, a [user] must plug in a USB key. This is:",
      "'Something You Have' refers to:"
    ],
    answerOptions: [
      { variants: ["Possession Factor", "Something You Have"], correct: true, explanation: "Possession factors require physical ownership of a device." },
      { variants: ["Knowledge Factor"], correct: false, explanation: "Knowledge is memory." },
      { variants: ["Inherence Factor"], correct: false, explanation: "Inherence is biometrics." },
      { variants: ["Context Factor"], correct: false, explanation: "Context is time/location." }
    ]
  }),

  q(4060, 4, 2, ["MFA", "False Rejection"], {
    variants: [
      "In biometrics, a Type I Error where a legitimate user is denied access is called:",
      "The CEO cannot unlock their phone with FaceID because the lighting is bad. This is a:",
      "If the sensitivity is set too high, a scanner will have a high:"
    ],
    answerOptions: [
      { variants: ["False Rejection Rate (FRR)"], correct: true, explanation: "FRR (Type I) is annoying but secure—it blocks authorized users." },
      { variants: ["False Acceptance Rate (FAR)"], correct: false, explanation: "FAR (Type II) is dangerous—it lets bad guys in." },
      { variants: ["Crossover Error Rate (CER)"], correct: false, explanation: "CER is where FRR and FAR intersect." },
      { variants: ["True Negative"], correct: false, explanation: "True Negative is a correct rejection of an impostor." }
    ]
  }),

  q(4061, 4, 2, ["MFA", "False Acceptance"], {
    variants: [
      "Which biometric error is considered the most dangerous for security?",
      "An impostor unlocks the door using a fake fingerprint. This is a:",
      "Type II Error refers to:"
    ],
    answerOptions: [
      { variants: ["False Acceptance Rate (FAR)"], correct: true, explanation: "FAR allows unauthorized users in, defeating the security control." },
      { variants: ["False Rejection Rate (FRR)"], correct: false, explanation: "FRR is an inconvenience, not a breach." },
      { variants: ["Crossover Error Rate"], correct: false, explanation: "CER is a metric for comparing systems." },
      { variants: ["True Positive"], correct: false, explanation: "True Positive is correctly admitting a user." }
    ]
  }),

  q(4062, 4, 2, ["MFA", "Implementation"], {
    variants: [
      "Which combination constitutes valid Multi-Factor Authentication?",
      "Password + PIN is weak because it uses two of the same factor. A better combo is:",
      "Knowledge + Possession + Inherence is known as:"
    ],
    answerOptions: [
      { variants: ["Password + Fingerprint", "Know + Are"], correct: true, explanation: "This combines Knowledge and Inherence, satisfying MFA requirements." },
      { variants: ["Password + PIN"], correct: false, explanation: "Both are Knowledge (1 factor)." },
      { variants: ["Smart Card + Token"], correct: false, explanation: "Both are Possession (1 factor)." },
      { variants: ["Fingerprint + Retina"], correct: false, explanation: "Both are Inherence (1 factor)." }
    ]
  }),

  q(4063, 4, 1, ["Policy", "Account"], {
    variants: [
      "Disabling an account after 5 failed login attempts protects against:",
      "To stop an [attacker] from guessing passwords indefinitely, enable:",
      "Account Lockout policies mitigate:"
    ],
    answerOptions: [
      { variants: ["Online Brute Force", "Guessing Attacks"], correct: true, explanation: "Lockouts stop the attacker from continuing to guess." },
      { variants: ["Offline Cracking"], correct: false, explanation: "Offline attacks (on stolen hashes) ignore lockouts." },
      { variants: ["Phishing"], correct: false, explanation: "Phishing bypasses the need to guess." },
      { variants: ["Man-in-the-Middle"], correct: false, explanation: "MitM intercepts valid credentials." }
    ]
  }),

  q(4064, 4, 1, ["Policy", "Password"], {
    variants: [
      "Which password policy setting prevents a [user] from switching back to 'Password123' immediately?",
      "To force users to create *new* passwords, an [admin] configures:",
      "Password History must be combined with which setting to be effective?"
    ],
    answerOptions: [
      { variants: ["Minimum Password Age"], correct: true, explanation: "Minimum Age prevents users from cycling through history rapidly to get back to an old password." },
      { variants: ["Maximum Password Age"], correct: false, explanation: "Max Age forces the change, but doesn't prevent cycling." },
      { variants: ["Complexity"], correct: false, explanation: "Complexity enforces characters." },
      { variants: ["Length"], correct: false, explanation: "Length enforces size." }
    ]
  }),

  q(4065, 4, 1, ["Policy", "Password"], {
    variants: [
      "According to NIST, what is the most important factor in password strength?",
      "A passphrase like 'CorrectHorseBatteryStaple' is strong primarily due to its:",
      "Complexity is good, but ________ is better."
    ],
    answerOptions: [
      { variants: ["Length"], correct: true, explanation: "Mathematically, length adds more entropy than complexity. Longer is exponentially harder to crack." },
      { variants: ["Special Characters"], correct: false, explanation: "Complexity adds marginal difficulty compared to length." },
      { variants: ["Frequent Changes"], correct: false, explanation: "Frequent changes often lead to weaker passwords." },
      { variants: ["History"], correct: false, explanation: "History prevents reuse, not cracking." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Architecture & Design (Questions 4066-4080)
  // ============================================================

  q(4066, 4, 5, ["Architecture", "East-West"], {
    variants: [
      "Traffic moving between servers in the same data center is called:",
      "A firewall placed between the Web Server and Database Server inspects:",
      "Zero Trust architectures focus heavily on inspecting:"
    ],
    answerOptions: [
      { variants: ["East-West Traffic"], correct: true, explanation: "East-West is server-to-server traffic inside the data center." },
      { variants: ["North-South Traffic"], correct: false, explanation: "North-South is client-to-server (entering/leaving the data center)." },
      { variants: ["Ingress"], correct: false, explanation: "Ingress is entering." },
      { variants: ["Egress"], correct: false, explanation: "Egress is leaving." }
    ]
  }),

  q(4067, 4, 5, ["Architecture", "North-South"], {
    variants: [
      "Traffic entering or leaving the data center from the internet is called:",
      "A perimeter firewall primarily inspects:",
      "Users downloading files from your web server generate:"
    ],
    answerOptions: [
      { variants: ["North-South Traffic"], correct: true, explanation: "North-South traffic crosses the boundary of the data center." },
      { variants: ["East-West Traffic"], correct: false, explanation: "East-West is internal." },
      { variants: ["Lateral Movement"], correct: false, explanation: "Lateral is internal attacker movement." },
      { variants: ["Loopback"], correct: false, explanation: "Loopback is local." }
    ]
  }),

  q(4068, 4, 5, ["Architecture", "VPN"], {
    variants: [
      "A VPN that connects two entire office networks permanently is a:",
      "[company] connects its HQ to the branch office using the internet. This is:",
      "IPsec tunnels between routers are typically:"
    ],
    answerOptions: [
      { variants: ["Site-to-Site VPN"], correct: true, explanation: "Site-to-Site connects entire networks (LAN-to-LAN)." },
      { variants: ["Remote Access VPN"], correct: false, explanation: "Remote Access connects a single user device." },
      { variants: ["Clientless VPN"], correct: false, explanation: "Clientless is web-based remote access." },
      { variants: ["Host-to-Host"], correct: false, explanation: "Host-to-Host is specific machine to machine." }
    ]
  }),

  q(4069, 4, 5, ["Architecture", "Cloud"], {
    variants: [
      "Which secure connection method bypasses the public internet to connect an on-premise network to a Cloud Provider?",
      "AWS Direct Connect and Azure ExpressRoute are examples of:",
      "For high-speed, private connectivity to the cloud, use a:"
    ],
    answerOptions: [
      { variants: ["Dedicated Leased Line", "Direct Connection"], correct: true, explanation: "Dedicated lines provide private, SLA-backed connections to cloud providers." },
      { variants: ["VPN"], correct: false, explanation: "VPNs run over the public internet." },
      { variants: ["SD-WAN"], correct: false, explanation: "SD-WAN often uses internet links." },
      { variants: ["MPLS"], correct: false, explanation: "MPLS is a WAN tech, but 'Direct Connect' is the cloud term." }
    ]
  }),

  q(4070, 4, 5, ["Architecture", "Zero Trust"], {
    variants: [
      "The security philosophy 'Never Trust, Always Verify' is known as:",
      "Assuming the internal network is already compromised and verifying every request is:",
      "Moving the perimeter from the network edge to the individual resource is:"
    ],
    answerOptions: [
      { variants: ["Zero Trust"], correct: true, explanation: "Zero Trust assumes breach and requires authentication/authorization for every access request." },
      { variants: ["Defense in Depth"], correct: false, explanation: "Defense in Depth is layering controls (Zero Trust is a strategy *within* or evolving from this)." },
      { variants: ["Perimeter Security"], correct: false, explanation: "Perimeter security trusts the inside." },
      { variants: ["Castle and Moat"], correct: false, explanation: "Castle and Moat is the opposite of Zero Trust." }
    ]
  }),

  q(4071, 4, 5, ["Architecture", "SDN"], {
    variants: [
      "In Software-Defined Networking (SDN), network intelligence is centralized in the:",
      "Separating the Control Plane from the Data Plane allows for:",
      "The 'Brain' of an SDN network is the:"
    ],
    answerOptions: [
      { variants: ["SDN Controller"], correct: true, explanation: "The Controller centralizes logic and pushes config to the forwarding devices." },
      { variants: ["Edge Router"], correct: false, explanation: "Edge routers are data plane devices." },
      { variants: ["Management Plane"], correct: false, explanation: "Management is how you access it; Controller is the logic." },
      { variants: ["Hypervisor"], correct: false, explanation: "Hypervisor is for VMs." }
    ]
  }),

  q(4072, 4, 6, ["Device", "HSM"], {
    variants: [
      "Which dedicated hardware appliance is used to manage and store digital encryption keys securely?",
      "A bank needs to generate keys for credit card transactions. They use a:",
      "To protect the Root CA's private key, store it in a:"
    ],
    answerOptions: [
      { variants: ["HSM", "Hardware Security Module"], correct: true, explanation: "HSMs are hardened, tamper-resistant devices for crypto processing." },
      { variants: ["TPM"], correct: false, explanation: "TPM is a chip inside a PC, not a dedicated appliance." },
      { variants: ["USB Drive"], correct: false, explanation: "USB is not secure storage." },
      { variants: ["Software Vault"], correct: false, explanation: "Software is vulnerable to OS attacks." }
    ]
  }),

  q(4073, 4, 6, ["Device", "TPM"], {
    variants: [
      "Which chip on a motherboard provides hardware-based encryption key storage for the local [device]?",
      "BitLocker disk encryption relies on this chip to verify system integrity at boot:",
      "A secure cryptoprocessor embedded in a laptop is the:"
    ],
    answerOptions: [
      { variants: ["TPM", "Trusted Platform Module"], correct: true, explanation: "TPM stores keys and validates the boot process (Secure Boot)." },
      { variants: ["CPU"], correct: false, explanation: "CPU processes data." },
      { variants: ["BIOS"], correct: false, explanation: "BIOS is firmware." },
      { variants: ["HSM"], correct: false, explanation: "HSM is an external appliance." }
    ]
  }),

  q(4074, 4, 2, ["Physical", "Air Gap"], {
    variants: [
      "The most secure way to protect a critical system from network attacks is to:",
      "Physically disconnecting a computer from all networks creates an:",
      "To protect the root CA or nuclear control system, implement an:"
    ],
    answerOptions: [
      { variants: ["Air Gap"], correct: true, explanation: "An Air Gap physically isolates the system from unsecured networks." },
      { variants: ["Firewall"], correct: false, explanation: "Firewalls can be bypassed." },
      { variants: ["VLAN"], correct: false, explanation: "VLANs are logical separation." },
      { variants: ["VPN"], correct: false, explanation: "VPN connects networks." }
    ]
  }),

  q(4075, 4, 2, ["Physical", "Locks"], {
    variants: [
      "Which lock type creates a record of who entered and when?",
      "A standard key lock is preventive. A smart card lock is preventive AND:",
      "Electronic locks allow for:"
    ],
    answerOptions: [
      { variants: ["Auditing / Logging"], correct: true, explanation: "Electronic locks provide an audit trail (accounting) of access." },
      { variants: ["Biometrics"], correct: false, explanation: "Not all electronic locks use biometrics." },
      { variants: ["Remote access"], correct: false, explanation: "Possible, but logging is the key security gain." },
      { variants: ["Fail-secure"], correct: false, explanation: "This is a safety state." }
    ]
  }),

  q(4076, 4, 5, ["Architecture", "Placement"], {
    variants: [
      "Where should an Intrusion Prevention System (IPS) be placed to stop attacks from reaching the internal network?",
      "To block exploits before they hit the servers, place the IPS:",
      "An inline security [device] should sit:"
    ],
    answerOptions: [
      { variants: ["Behind the Firewall", "Inline"], correct: true, explanation: "IPS must be inline to block traffic. Placing it behind the perimeter firewall reduces noise." },
      { variants: ["In the DMZ"], correct: false, explanation: "Possible, but usually protects the edge." },
      { variants: ["On the Mirror Port"], correct: false, explanation: "That would be IDS (Passive)." },
      { variants: ["At the ISP"], correct: false, explanation: "ISP handles DDoS, not exploits." }
    ]
  }),

  q(4077, 4, 5, ["Architecture", "Honey"], {
    variants: [
      "A network segment containing multiple honeypots to analyze complex attacks is a:",
      "To study botnet behavior, researchers create a:",
      "A decoy network is a:"
    ],
    answerOptions: [
      { variants: ["Honeynet"], correct: true, explanation: "A Honeynet is a network of honeypots simulating a real environment." },
      { variants: ["DMZ"], correct: false, explanation: "DMZ is for production services." },
      { variants: ["Intranet"], correct: false, explanation: "Intranet is private." },
      { variants: ["VLAN"], correct: false, explanation: "VLAN is a segment." }
    ]
  }),

  q(4078, 4, 1, ["Risk", "Assessment"], {
    variants: [
      "Calculating ALE (Annual Loss Expectancy) is part of which risk assessment method?",
      "Assigning dollar values to assets and risks is:",
      "Quantitative Risk Assessment uses numbers. Qualitative uses:"
    ],
    answerOptions: [
      { variants: ["Quantitative"], correct: true, explanation: "Quantitative analysis uses hard numbers and cost calculations." },
      { variants: ["Qualitative"], correct: false, explanation: "Qualitative uses subjective scales (High/Medium/Low)." },
      { variants: ["Hybrid"], correct: false, explanation: "Hybrid mixes them." },
      { variants: ["Ad-hoc"], correct: false, explanation: "Ad-hoc is unplanned." }
    ]
  }),

  q(4079, 4, 1, ["Risk", "Response"], {
    variants: [
      "Buying insurance to cover the cost of a cyber breach is which risk response?",
      "Moving the financial impact of a risk to a third party is:",
      "Outsourcing a risky activity to a vendor is:"
    ],
    answerOptions: [
      { variants: ["Risk Transfer"], correct: true, explanation: "Transfer (Sharing) moves the burden to someone else (Insurance/Vendor)." },
      { variants: ["Risk Avoidance"], correct: false, explanation: "Avoidance means stopping the activity." },
      { variants: ["Risk Mitigation"], correct: false, explanation: "Mitigation reduces the impact (Controls)." },
      { variants: ["Risk Acceptance"], correct: false, explanation: "Acceptance means doing nothing." }
    ]
  }),

  q(4080, 4, 1, ["Risk", "Response"], {
    variants: [
      "Installing a firewall to block attacks is an example of which risk response?",
      "Implementing controls to lower the likelihood or impact of a threat is:",
      "Patching a server is:"
    ],
    answerOptions: [
      { variants: ["Risk Mitigation"], correct: true, explanation: "Mitigation involves taking steps to reduce risk to an acceptable level." },
      { variants: ["Risk Transfer"], correct: false, explanation: "Transfer moves it." },
      { variants: ["Risk Acceptance"], correct: false, explanation: "Acceptance does nothing." },
      { variants: ["Risk Avoidance"], correct: false, explanation: "Avoidance stops the activity." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: General Security Concepts (Questions 4081-4100)
  // ============================================================

  q(4081, 4, 7, ["Firewall", "NGFW"], {
    variants: [
      "A Next-Generation Firewall (NGFW) differs from a traditional firewall because it can:",
      "Which firewall can identify and block specific applications (like Facebook games) regardless of port?",
      "Layer 7 inspection is a key feature of:"
    ],
    answerOptions: [
      { variants: ["Inspect Application Layer traffic"], correct: true, explanation: "NGFWs understand applications (Layer 7), not just Ports/IPs." },
      { variants: ["Route packets"], correct: false, explanation: "Routers do that." },
      { variants: ["Block IPs"], correct: false, explanation: "Standard firewalls do that." },
      { variants: ["Encrypt VPNs"], correct: false, explanation: "Standard firewalls do that." }
    ]
  }),

  q(4082, 4, 2, ["Controls", "Compensation"], {
    variants: [
      "A legacy server cannot be patched. The [admin] places it on an isolated VLAN with a strict firewall. This is a:",
      "When you cannot implement the primary control, you use a:",
      "An alternative measure that provides equivalent security is:"
    ],
    answerOptions: [
      { variants: ["Compensating Control"], correct: true, explanation: "Compensating controls mitigate risk when the ideal control is not feasible." },
      { variants: ["Corrective Control"], correct: false, explanation: "Corrective fixes things." },
      { variants: ["Detective Control"], correct: false, explanation: "Detective watches." },
      { variants: ["Administrative Control"], correct: false, explanation: "Admin is policy." }
    ]
  }),

  q(4083, 4, 4, ["Access", "Privilege"], {
    variants: [
      "Granting admin rights only when needed and removing them immediately after is called:",
      "Just-in-Time (JIT) access is a method of enforcing:",
      "Privileged Access Management (PAM) systems help implement:"
    ],
    answerOptions: [
      { variants: ["Least Privilege"], correct: true, explanation: "JIT and PAM are tools to enforce the principle of Least Privilege." },
      { variants: ["Defense in Depth"], correct: false, explanation: "That's layering." },
      { variants: ["Separation of Duties"], correct: false, explanation: "That splits tasks." },
      { variants: ["Zero Trust"], correct: false, explanation: "Related, but Least Privilege is the specific principle." }
    ]
  }),

  q(4084, 4, 4, ["Access", "Separation"], {
    variants: [
      "Requiring two people to turn keys to launch a missile is an example of:",
      "To prevent fraud, the person who approves the check should not be the person who writes it. This is:",
      "Splitting critical tasks between multiple users is:"
    ],
    answerOptions: [
      { variants: ["Separation of Duties"], correct: true, explanation: "Separation of Duties prevents a single person from completing a critical/sensitive task alone." },
      { variants: ["Least Privilege"], correct: false, explanation: "Least Privilege limits rights." },
      { variants: ["Dual Control"], correct: false, explanation: "Dual control is the *action* (two keys), Separation of Duties is the *concept*." },
      { variants: ["Job Rotation"], correct: false, explanation: "Job rotation moves people." }
    ]
  }),

  q(4085, 4, 1, ["Policy", "Training"], {
    variants: [
      "What is the most effective way to mitigate Social Engineering risks?",
      "To stop phishing, technical controls must be paired with:",
      "The 'Human Firewall' is strengthened by:"
    ],
    answerOptions: [
      { variants: ["User Awareness Training"], correct: true, explanation: "Training helps users recognize and report attacks that bypass technical filters." },
      { variants: ["Firewalls"], correct: false, explanation: "Firewalls don't stop users from clicking." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption protects data, not decisions." },
      { variants: ["Antivirus"], correct: false, explanation: "AV helps, but training stops the click." }
    ]
  }),

  q(4086, 4, 6, ["Encryption", "VPN"], {
    variants: [
      "Which protocol is used to create a secure tunnel for a Site-to-Site VPN?",
      "Layer 3 VPNs typically use this protocol suite:",
      "AH (Authentication Header) and ESP (Encapsulating Security Payload) are parts of:"
    ],
    answerOptions: [
      { variants: ["IPsec"], correct: true, explanation: "IPsec is the standard for Layer 3 VPNs." },
      { variants: ["SSL/TLS"], correct: false, explanation: "TLS is for Client-to-Site (usually)." },
      { variants: ["PPTP"], correct: false, explanation: "PPTP is insecure." },
      { variants: ["L2TP"], correct: false, explanation: "L2TP needs IPsec for security." }
    ]
  }),

  q(4087, 4, 6, ["Encryption", "Modes"], {
    variants: [
      "In IPsec, which mode encrypts the entire packet, including the original IP header?",
      "For a VPN gateway-to-gateway connection, use:",
      "Which mode hides the internal IP structure?"
    ],
    answerOptions: [
      { variants: ["Tunnel Mode"], correct: true, explanation: "Tunnel Mode encapsulates the whole packet. Transport Mode only encrypts the payload." },
      { variants: ["Transport Mode"], correct: false, explanation: "Transport mode leaves headers visible." },
      { variants: ["AH Mode"], correct: false, explanation: "AH provides integrity, not encryption." },
      { variants: ["ESP Mode"], correct: false, explanation: "ESP is the protocol, Tunnel is the mode." }
    ]
  }),

  q(4088, 4, 6, ["Encryption", "Data State"], {
    variants: [
      "Full Disk Encryption (FDE) protects data in which state?",
      "BitLocker and FileVault secure data:",
      "If a laptop is stolen, FDE protects data:"
    ],
    answerOptions: [
      { variants: ["Data at Rest"], correct: true, explanation: "Data at Rest is data stored on disk." },
      { variants: ["Data in Transit"], correct: false, explanation: "Transit is network traffic (TLS)." },
      { variants: ["Data in Use"], correct: false, explanation: "Use is RAM/CPU." },
      { variants: ["Data in Motion"], correct: false, explanation: "Same as Transit." }
    ]
  }),

  q(4089, 4, 6, ["Encryption", "Data State"], {
    variants: [
      "TLS and IPsec protect data in which state?",
      "Data moving across the network is:",
      "To protect Data in Motion, use:"
    ],
    answerOptions: [
      { variants: ["Data in Transit", "Data in Motion"], correct: true, explanation: "Data traveling over a network is In Transit." },
      { variants: ["Data at Rest"], correct: false, explanation: "Rest is storage." },
      { variants: ["Data in Use"], correct: false, explanation: "Use is processing." },
      { variants: ["Data Archive"], correct: false, explanation: "Archive is Rest." }
    ]
  }),

  q(4090, 4, 3, ["Detection", "Baseline"], {
    variants: [
      "An IDS triggers an alert because traffic volume is 500% higher than normal. This is:",
      "Behavioral analysis relies on comparing current activity to a:",
      "Anomaly-based detection requires a:"
    ],
    answerOptions: [
      { variants: ["Baseline", "Anomaly Detection"], correct: true, explanation: "Anomaly/Behavioral detection looks for deviations from a known baseline." },
      { variants: ["Signature Detection"], correct: false, explanation: "Signature looks for known patterns." },
      { variants: ["Heuristic"], correct: false, explanation: "Heuristic is similar but often code-based." },
      { variants: ["Rule-based"], correct: false, explanation: "Rule-based is static." }
    ]
  }),

  q(4091, 4, 3, ["Detection", "Signature"], {
    variants: [
      "An IDS triggers because a packet matches a known malware byte sequence. This is:",
      "Antivirus software primarily uses this method to catch known viruses:",
      "Comparing traffic against a database of attack patterns is:"
    ],
    answerOptions: [
      { variants: ["Signature-based Detection"], correct: true, explanation: "Signature detection matches traffic against a database of known threats." },
      { variants: ["Anomaly-based"], correct: false, explanation: "Anomaly looks for strange behavior." },
      { variants: ["Behavior-based"], correct: false, explanation: "Same as Anomaly." },
      { variants: ["Heuristic"], correct: false, explanation: "Heuristic looks for characteristics." }
    ]
  }),

  q(4092, 4, 3, ["Testing", "Pentest"], {
    variants: [
      "An authorized simulated attack on a computer system to evaluate its security is a:",
      "[company] hires a 'Red Team' to break into their network. This is:",
      "Unlike a vulnerability scan, this test exploits the flaws:"
    ],
    answerOptions: [
      { variants: ["Penetration Test", "Pen Test"], correct: true, explanation: "Pen tests actively exploit vulnerabilities to prove impact." },
      { variants: ["Vulnerability Scan"], correct: false, explanation: "Scans only identify potential flaws." },
      { variants: ["Audit"], correct: false, explanation: "Audits check compliance." },
      { variants: ["Risk Assessment"], correct: false, explanation: "Risk assessment is paper-based." }
    ]
  }),

  q(4093, 4, 3, ["Testing", "Colors"], {
    variants: [
      "In a wargame exercise, which team defends the network?",
      "The internal security staff responding to a Pen Test are the:",
      "The Red Team attacks, the ________ Team defends."
    ],
    answerOptions: [
      { variants: ["Blue Team"], correct: true, explanation: "Blue Team defends. Red Team attacks. Purple Team coordinates." },
      { variants: ["Red Team"], correct: false, explanation: "Red attacks." },
      { variants: ["White Team"], correct: false, explanation: "White referees." },
      { variants: ["Green Team"], correct: false, explanation: "Not standard." }
    ]
  }),

  q(4094, 4, 6, ["Forensics", "Order"], {
    variants: [
      "When collecting evidence, you must capture the most volatile data first. Which comes first?",
      "Order of Volatility: CPU Cache -> RAM -> ________",
      "Which data is lost immediately upon power off?"
    ],
    answerOptions: [
      { variants: ["RAM", "Random Access Memory"], correct: true, explanation: "RAM is highly volatile. Hard drives (Data at Rest) are less volatile." },
      { variants: ["Hard Drive"], correct: false, explanation: "Persistent storage." },
      { variants: ["Backups"], correct: false, explanation: "Very persistent." },
      { variants: ["Logs"], correct: false, explanation: "Persistent." }
    ]
  }),

  q(4095, 4, 6, ["Forensics", "Chain"], {
    variants: [
      "The documentation that tracks evidence from collection to court is called:",
      "To prove evidence wasn't tampered with, you must maintain the:",
      "A log of who held the hard drive and when is the:"
    ],
    answerOptions: [
      { variants: ["Chain of Custody"], correct: true, explanation: "Chain of Custody proves integrity of evidence by tracking every hand-off." },
      { variants: ["Chain of Command"], correct: false, explanation: "Chain of Command is management." },
      { variants: ["Audit Trail"], correct: false, explanation: "Audit trail tracks system events." },
      { variants: ["SLA"], correct: false, explanation: "SLA is performance." }
    ]
  }),

  q(4096, 4, 6, ["Forensics", "Hash"], {
    variants: [
      "Before analyzing a seized hard drive, a forensic analyst creates a:",
      "To prevent altering original evidence, work is done on a:",
      "A bit-for-bit copy of a drive is a:"
    ],
    answerOptions: [
      { variants: ["Forensic Image", "Bit-stream Image"], correct: true, explanation: "Analysts work on images (copies) to preserve the original evidence." },
      { variants: ["Backup"], correct: false, explanation: "Backups modify file attributes." },
      { variants: ["Snapshot"], correct: false, explanation: "Snapshot is a VM term." },
      { variants: ["Clone"], correct: false, explanation: "Clone works, but Image is the forensic term." }
    ]
  }),

  q(4097, 4, 1, ["Compliance", "GDPR"], {
    variants: [
      "Which regulation protects the privacy of data for EU citizens?",
      "The 'Right to be Forgotten' is a key component of:",
      "[company] does business in Europe. They must comply with:"
    ],
    answerOptions: [
      { variants: ["GDPR", "General Data Protection Regulation"], correct: true, explanation: "GDPR is the strict EU privacy law." },
      { variants: ["HIPAA"], correct: false, explanation: "HIPAA is US Healthcare." },
      { variants: ["PCI-DSS"], correct: false, explanation: "PCI is Credit Cards." },
      { variants: ["SOX"], correct: false, explanation: "SOX is Finance." }
    ]
  }),

  q(4098, 4, 1, ["Compliance", "PCI"], {
    variants: [
      "Which standard governs the security of credit card information?",
      "If [company] processes Visa/Mastercard payments, they must adhere to:",
      "PCI-DSS stands for:"
    ],
    answerOptions: [
      { variants: ["PCI-DSS", "Payment Card Industry Data Security Standard"], correct: true, explanation: "PCI-DSS mandates security controls for cardholder data." },
      { variants: ["GDPR"], correct: false, explanation: "GDPR is privacy." },
      { variants: ["ISO 27001"], correct: false, explanation: "ISO is general security." },
      { variants: ["NIST"], correct: false, explanation: "NIST is a framework." }
    ]
  }),

  q(4099, 4, 1, ["Policy", "NDA"], {
    variants: [
      "To perform a Pen Test, the company and the tester sign a contract defining scope and rules. This is:",
      "The 'Get Out of Jail Free' card for a pentester is the:",
      "Which document authorizes the attack?"
    ],
    answerOptions: [
      { variants: ["Rules of Engagement", "ROE"], correct: true, explanation: "ROE defines what the tester can and cannot do (Scope, Timing, Authorization)." },
      { variants: ["NDA"], correct: false, explanation: "NDA keeps it secret." },
      { variants: ["SLA"], correct: false, explanation: "SLA is performance." },
      { variants: ["MOU"], correct: false, explanation: "MOU is intent." }
    ]
  }),

  q(4100, 4, 5, ["Physical", "Fire"], {
    variants: [
      "Which fire suppression system uses gas to extinguish fires without damaging electronics?",
      "Water sprinklers damage servers. A data center should use:",
      "FM-200 and Halon are examples of:"
    ],
    answerOptions: [
      { variants: ["Clean Agent", "Gas Suppression"], correct: true, explanation: "Clean agents (like FM-200) remove heat/oxygen without water or residue." },
      { variants: ["Wet Pipe"], correct: false, explanation: "Wet pipe destroys electronics." },
      { variants: ["Dry Pipe"], correct: false, explanation: "Dry pipe reduces leak risk but still uses water." },
      { variants: ["Class A"], correct: false, explanation: "Class A is wood/paper fire." }
    ]
  }),

  // --- DOMAIN 5: THREATS & ATTACKS ---
// ==========================================
// DOMAIN 5: THREATS & ATTACKS (Questions 5001-5050)
// ==========================================

  q(5001, 5, 1, ["Actors", "APT"], {
    variants: [
      "Which type of threat actor is typically a nation-state with significant resources and a long-term goal of espionage?",
      "An attack characterized by sophisticated tools, high funding, and persistence on the network is likely an:",
      "Government-backed hackers targeting critical infrastructure are classified as:"
    ],
    answerOptions: [
      { variants: ["Advanced Persistent Threat (APT)"], correct: true, explanation: "APTs are highly skilled, well-funded (usually state-sponsored) actors who maintain long-term access." },
      { variants: ["Script Kiddie"], correct: false, explanation: "Script Kiddies are unskilled." },
      { variants: ["Insider Threat"], correct: false, explanation: "Insiders are employees." },
      { variants: ["Hacktivist"], correct: false, explanation: "Hacktivists are political." }
    ]
  }),

  q(5002, 5, 3, ["Wireless", "Evil Twin"], {
    variants: [
      "An [attacker] sets up a rogue Wi-Fi Access Point with the same SSID as [company] to steal credentials. What is this?",
      "You connect to 'Free Airport Wi-Fi' but it's actually a hacker's laptop. This is an:",
      "Impersonating a trusted AP to intercept traffic is called:"
    ],
    answerOptions: [
      { variants: ["Evil Twin"], correct: true, explanation: "An Evil Twin mimics a trusted network SSID to trick users into connecting." },
      { variants: ["War Driving"], correct: false, explanation: "War driving is searching for networks." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth spam." },
      { variants: ["Replay Attack"], correct: false, explanation: "Replay captures valid data to resend." }
    ]
  }),

  q(5003, 5, 4, ["Malware", "Ransomware"], {
    variants: [
      "Which type of malware encrypts a user's files and demands payment for the key?",
      "An [admin] sees a screen saying 'Your files are locked. Pay 1 BTC.' This is:",
      "Crypto-malware designed for extortion is:"
    ],
    answerOptions: [
      { variants: ["Ransomware"], correct: true, explanation: "Ransomware denies access to data via encryption for extortion." },
      { variants: ["Trojan"], correct: false, explanation: "Trojans are the delivery vehicle." },
      { variants: ["Worm"], correct: false, explanation: "Worms are the transport." },
      { variants: ["Spyware"], correct: false, explanation: "Spyware steals data." }
    ]
  }),

  q(5004, 5, 3, ["Social Eng", "Whaling"], {
    variants: [
      "A targeted phishing attack specifically aimed at high-level executives like a CEO or CFO is known as:",
      "An email designed to trick the CFO into authorizing a wire transfer is:",
      "Phishing for 'Big Fish' is called:"
    ],
    answerOptions: [
      { variants: ["Whaling"], correct: true, explanation: "Whaling targets high-profile executives (C-Suite)." },
      { variants: ["Spear Phishing"], correct: false, explanation: "Spear phishing targets specific individuals, but Whaling is specific to Execs." },
      { variants: ["Vishing"], correct: false, explanation: "Vishing is voice." },
      { variants: ["Smishing"], correct: false, explanation: "Smishing is SMS." }
    ]
  }),

  q(5005, 5, 2, ["DoS", "DDoS"], {
    variants: [
      "Which attack involves compromising thousands of [device]s to flood a target [server]?",
      "A botnet is used to overwhelm a website with traffic. This is a:",
      "Disrupting availability using a distributed network of zombies is:"
    ],
    answerOptions: [
      { variants: ["DDoS", "Distributed Denial of Service"], correct: true, explanation: "DDoS uses many compromised hosts to attack a single target." },
      { variants: ["DoS"], correct: false, explanation: "DoS implies a single attacker." },
      { variants: ["Man-in-the-Middle"], correct: false, explanation: "MitM intercepts data." },
      { variants: ["IP Spoofing"], correct: false, explanation: "Spoofing is a technique." }
    ]
  }),

  q(5006, 5, 1, ["Actors", "Skill"], {
    variants: [
      "Which term describes an unskilled [attacker] who uses pre-made tools and scripts found online?",
      "A person running a 'DDoS-for-hire' script without understanding how it works is a:",
      "Low-skilled attackers motivated by attention or clout are:"
    ],
    answerOptions: [
      { variants: ["Script Kiddie"], correct: true, explanation: "Script Kiddies lack deep technical knowledge and rely on existing tools." },
      { variants: ["Hacker"], correct: false, explanation: "Hacker implies some skill." },
      { variants: ["APT"], correct: false, explanation: "APTs are elite." },
      { variants: ["Insider"], correct: false, explanation: "Insiders have authorized access." }
    ]
  }),

  q(5007, 5, 2, ["Attack", "MitM"], {
    variants: [
      "In which attack does the hacker secretly relay and possibly alter communications between two parties?",
      "Alice thinks she is talking to Bob, but Eve is intercepting everything. This is:",
      "On-path attacks are also known as:"
    ],
    answerOptions: [
      { variants: ["Man-in-the-Middle (MitM)", "On-path Attack"], correct: true, explanation: "MitM intercepts traffic between two endpoints." },
      { variants: ["Replay Attack"], correct: false, explanation: "Replay resends old data." },
      { variants: ["DDoS"], correct: false, explanation: "DDoS overwhelms the target." },
      { variants: ["SQL Injection"], correct: false, explanation: "SQLi targets databases." }
    ]
  }),

  q(5008, 5, 4, ["Malware", "Worm"], {
    variants: [
      "Unlike a virus, which type of malware is self-replicating and spreads automatically across the network without user interaction?",
      "Malware that scans the network and infects vulnerable servers on its own is a:",
      "Which malware consumes bandwidth by replicating itself?"
    ],
    answerOptions: [
      { variants: ["Worm"], correct: true, explanation: "Worms spread autonomously via network vulnerabilities." },
      { variants: ["Trojan"], correct: false, explanation: "Trojans require user installation." },
      { variants: ["Adware"], correct: false, explanation: "Adware shows ads." },
      { variants: ["Rootkit"], correct: false, explanation: "Rootkits hide." }
    ]
  }),

  q(5009, 5, 3, ["Social Eng", "Physical"], {
    variants: [
      "An [attacker] gains entry to a secure building by following closely behind an authorized employee who just badged in. What is this?",
      "Holding the door open for someone who doesn't badge in is allowing:",
      "Piggybacking is another name for:"
    ],
    answerOptions: [
      { variants: ["Tailgating"], correct: true, explanation: "Tailgating uses social pressure/politeness to bypass physical security." },
      { variants: ["Dumpster Diving"], correct: false, explanation: "Dumpster diving is trash search." },
      { variants: ["Shoulder Surfing"], correct: false, explanation: "Shoulder surfing is looking at screens." },
      { variants: ["Cloning"], correct: false, explanation: "Cloning copies badges." }
    ]
  }),

  q(5010, 5, 2, ["Attack", "ARP"], {
    variants: [
      "Which local network attack involves sending fake ARP messages to redirect traffic to the [attacker]?",
      "To perform a MitM attack on a LAN, the [attacker] associates their MAC with the Gateway's IP. This is:",
      "Poisoning the Layer 2 cache of victim [device]s is:"
    ],
    answerOptions: [
      { variants: ["ARP Poisoning", "ARP Spoofing"], correct: true, explanation: "ARP Poisoning tricks devices into sending frames to the attacker instead of the gateway." },
      { variants: ["DNS Poisoning"], correct: false, explanation: "DNS poisoning targets domain name resolution." },
      { variants: ["DHCP Snooping"], correct: false, explanation: "DHCP Snooping is the *defense*." },
      { variants: ["VLAN Hopping"], correct: false, explanation: "VLAN hopping jumps segments." }
    ]
  }),

  q(5011, 5, 4, ["Malware", "Trojan"], {
    variants: [
      "Malware that disguises itself as legitimate or useful software (like a game) to trick the [user] is a:",
      "A user installs a 'Free Screensaver' that is actually a backdoor. This is a:",
      "Malware named after the Greek wooden horse is:"
    ],
    answerOptions: [
      { variants: ["Trojan Horse", "Trojan"], correct: true, explanation: "Trojans hide malicious payload inside benign-looking programs." },
      { variants: ["Virus"], correct: false, explanation: "Viruses attach to files." },
      { variants: ["Worm"], correct: false, explanation: "Worms spread automatically." },
      { variants: ["Rootkit"], correct: false, explanation: "Rootkits hide processes." }
    ]
  }),

  q(5012, 5, 3, ["Social Eng", "Voice"], {
    variants: [
      "Social engineering attacks conducted over voice calls, often impersonating authority figures, are known as:",
      "An [attacker] calls the helpdesk pretending to be IT support. This is:",
      "Voice Phishing is shortened to:"
    ],
    answerOptions: [
      { variants: ["Vishing"], correct: true, explanation: "Vishing stands for Voice Phishing." },
      { variants: ["Smishing"], correct: false, explanation: "Smishing is SMS." },
      { variants: ["Pharming"], correct: false, explanation: "Pharming is DNS redirection." },
      { variants: ["Spam"], correct: false, explanation: "Spam is junk mail." }
    ]
  }),

  q(5013, 5, 1, ["Actors", "Ideology"], {
    variants: [
      "Which threat actor is motivated primarily by ideological, political, or social causes?",
      "An [attacker] defaces a government website to protest a new law. This is an example of:",
      "Groups like 'Anonymous' fall into which category?"
    ],
    answerOptions: [
      { variants: ["Hacktivist"], correct: true, explanation: "Hacktivists use cyberattacks to promote a political or social agenda." },
      { variants: ["APT"], correct: false, explanation: "APTs are usually state-sponsored espionage." },
      { variants: ["Organized Crime"], correct: false, explanation: "Organized crime is motivated by money." },
      { variants: ["Insider"], correct: false, explanation: "Insider is an employee." }
    ]
  }),

  q(5014, 5, 4, ["Malware", "Rootkit"], {
    variants: [
      "Which type of malware installs itself deep within the operating system (kernel level) to hide from antivirus?",
      "Malware that modifies the OS to conceal its own processes and files is a:",
      "If you cannot trust the OS to report running processes, you likely have a:"
    ],
    answerOptions: [
      { variants: ["Rootkit"], correct: true, explanation: "Rootkits operate at Ring 0 (Kernel) to subvert the OS and hide themselves." },
      { variants: ["Spyware"], correct: false, explanation: "Spyware steals info." },
      { variants: ["Ransomware"], correct: false, explanation: "Ransomware is noisy/visible." },
      { variants: ["Virus"], correct: false, explanation: "Viruses replicate." }
    ]
  }),

  q(5015, 5, 2, ["Attack", "VLAN"], {
    variants: [
      "Techniques like 'Switch Spoofing' and 'Double Tagging' are used to perform which type of attack?",
      "An [attacker] on VLAN 10 manages to send traffic to VLAN 20 without a router. This is:",
      "Exploiting DTP to negotiate a trunk link is a form of:"
    ],
    answerOptions: [
      { variants: ["VLAN Hopping"], correct: true, explanation: "VLAN Hopping allows an attacker to break out of their assigned VLAN." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." },
      { variants: ["Snarfing"], correct: false, explanation: "Snarfing is stealing data." },
      { variants: ["MAC Flooding"], correct: false, explanation: "MAC Flooding overwhelms the switch." }
    ]
  }),

  q(5016, 5, 3, ["Social Eng", "Physical"], {
    variants: [
      "Searching through an organization's trash to find discarded documents containing sensitive information is called:",
      "An [attacker] finds a post-it note with a password in the recycle bin. This is:",
      "Low-tech reconnaissance using refuse is:"
    ],
    answerOptions: [
      { variants: ["Dumpster Diving"], correct: true, explanation: "Dumpster Diving exploits poor disposal policies." },
      { variants: ["Tailgating"], correct: false, explanation: "Tailgating is entry." },
      { variants: ["Reconnaissance"], correct: false, explanation: "Recon is the phase, Dumpster Diving is the method." },
      { variants: ["Scanning"], correct: false, explanation: "Scanning is technical." }
    ]
  }),

  q(5017, 5, 4, ["Malware", "Logic Bomb"], {
    variants: [
      "Malicious code inserted into a system that lies dormant until a specific condition (like a date) is met is a:",
      "A disgruntled admin writes a script to delete servers if their name is removed from HR payroll. This is a:",
      "Code triggered by an event rather than a user action is a:"
    ],
    answerOptions: [
      { variants: ["Logic Bomb"], correct: true, explanation: "Logic bombs execute payload based on a trigger condition (Time, Event)." },
      { variants: ["Worm"], correct: false, explanation: "Worms spread immediately." },
      { variants: ["Trojan"], correct: false, explanation: "Trojans hide in apps." },
      { variants: ["Backdoor"], correct: false, explanation: "Backdoor is an access method." }
    ]
  }),

  q(5018, 5, 3, ["Social Eng", "SMS"], {
    variants: [
      "Phishing attacks conducted via SMS text messages are referred to as:",
      "A [user] gets a text: 'Your bank account is locked, click here.' This is:",
      "SMS Phishing is shortened to:"
    ],
    answerOptions: [
      { variants: ["Smishing"], correct: true, explanation: "Smishing stands for SMS Phishing." },
      { variants: ["Vishing"], correct: false, explanation: "Vishing is voice." },
      { variants: ["Whaling"], correct: false, explanation: "Whaling is exec email." },
      { variants: ["Spam"], correct: false, explanation: "Spam is junk." }
    ]
  }),

  q(5019, 5, 1, ["Actors", "Trust"], {
    variants: [
      "Which threat actor has authorized access to the network and may cause damage either maliciously or accidentally?",
      "An employee angry about being fired deletes the database. This is an:",
      "Why is the [user] often considered the most dangerous threat vector?"
    ],
    answerOptions: [
      { variants: ["Insider Threat"], correct: true, explanation: "Insiders already have access and trust, allowing them to bypass perimeter defenses." },
      { variants: ["APT"], correct: false, explanation: "APTs are external (usually)." },
      { variants: ["Competitor"], correct: false, explanation: "Competitors are external." },
      { variants: ["Script Kiddie"], correct: false, explanation: "Script Kiddies are external." }
    ]
  }),

  q(5020, 5, 2, ["Attack", "DNS"], {
    variants: [
      "Which attack involves corrupting the DNS cache to redirect a [user] from a legitimate website to a fake one?",
      "A user types 'google.com' but is sent to a malicious IP. The hosts file and DNS server are fine. The local cache is bad. This is:",
      "Pharmining is often achieved via:"
    ],
    answerOptions: [
      { variants: ["DNS Poisoning", "DNS Spoofing"], correct: true, explanation: "DNS poisoning injects false records into a cache to redirect users." },
      { variants: ["ARP Poisoning"], correct: false, explanation: "ARP redirects Layer 2 traffic." },
      { variants: ["URL Hijacking"], correct: false, explanation: "URL hijacking is registering typos (typosquatting)." },
      { variants: ["Domain Squatting"], correct: false, explanation: "Squatting is buying the name." }
    ]
  }),

  q(5021, 5, 3, ["Social Eng", "BEC"], {
    variants: [
      "A specific type of phishing where an [attacker] impersonates a C-level executive to trick the finance department into transferring funds is:",
      "The CFO emails the Controller asking for an urgent wire transfer to a vendor. The email is fake. This is:",
      "BEC stands for:"
    ],
    answerOptions: [
      { variants: ["Business Email Compromise (BEC)"], correct: true, explanation: "BEC relies on authority and urgency without malicious links/attachments." },
      { variants: ["Whaling"], correct: false, explanation: "Whaling targets the exec; BEC impersonates the exec to target staff." },
      { variants: ["Vishing"], correct: false, explanation: "Vishing is voice." },
      { variants: ["Spam"], correct: false, explanation: "Spam is generic." }
    ]
  }),

  q(5022, 5, 2, ["Defense", "Switching"], {
    variants: [
      "What is the best mitigation strategy to prevent VLAN Hopping attacks?",
      "To stop 'Switch Spoofing', an [admin] should disable:",
      "Manually configuring ports as 'Access' or 'Trunk' instead of 'Auto' disables:"
    ],
    answerOptions: [
      { variants: ["DTP (Dynamic Trunking Protocol)"], correct: true, explanation: "Disabling DTP prevents attackers from negotiating a trunk link to see all VLANs." },
      { variants: ["DHCP Snooping"], correct: false, explanation: "DHCP Snooping stops rogue DHCP." },
      { variants: ["WPA3"], correct: false, explanation: "WPA3 is wireless." },
      { variants: ["Port Mirroring"], correct: false, explanation: "Mirroring is for monitoring." }
    ]
  }),

  q(5023, 5, 4, ["Malware", "Keylogger"], {
    variants: [
      "Which type of malware records every key pressed by the user to steal passwords?",
      "To capture credit card numbers as they are typed, an [attacker] installs a:",
      "Hardware or software that tracks input is a:"
    ],
    answerOptions: [
      { variants: ["Keylogger"], correct: true, explanation: "Keyloggers capture keystrokes." },
      { variants: ["Worm"], correct: false, explanation: "Worms spread." },
      { variants: ["Ransomware"], correct: false, explanation: "Ransomware encrypts." },
      { variants: ["Adware"], correct: false, explanation: "Adware advertises." }
    ]
  }),

  q(5024, 5, 2, ["Defense", "DoS"], {
    variants: [
      "What is a common mitigation strategy for DDoS attacks where traffic is directed to a non-existent IP address?",
      "To save the network during a flood, the ISP routes malicious traffic to 'null0'. This is:",
      "Dropping traffic destined for a target IP at the routing level is:"
    ],
    answerOptions: [
      { variants: ["Blackholing", "Null Routing"], correct: true, explanation: "Blackholing drops traffic to/from a specific IP at the edge to save the rest of the network." },
      { variants: ["Antivirus"], correct: false, explanation: "AV doesn't stop volume floods." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption protects data content, not volume." },
      { variants: ["Backups"], correct: false, explanation: "Backups allow restore, they don't stop the attack." }
    ]
  }),

  q(5025, 5, 1, ["Actors", "Crime"], {
    variants: [
      "Which threat actor group is primarily motivated by financial gain and operates like a professional business?",
      "Ransomware-as-a-Service (RaaS) operations are typically run by:",
      "Attackers who steal credit card numbers to sell on the dark web are usually:"
    ],
    answerOptions: [
      { variants: ["Organized Crime"], correct: true, explanation: "Organized crime groups are profit-driven enterprises." },
      { variants: ["Hacktivist"], correct: false, explanation: "Hacktivists want change, not just money." },
      { variants: ["Script Kiddie"], correct: false, explanation: "Script Kiddies want attention." },
      { variants: ["APT"], correct: false, explanation: "APTs want intelligence/power." }
    ]
  }),

  q(5026, 5, 2, ["Attack", "Switching"], {
    variants: [
      "Which attack involves flooding a [switch] with fake MAC addresses to fill its CAM table?",
      "If a [switch] gets overwhelmed and starts acting like a hub (broadcasting everything), it is likely under a:",
      "Forcing a switch into 'Fail Open' mode to sniff traffic is achieved by:"
    ],
    answerOptions: [
      { variants: ["MAC Flooding"], correct: true, explanation: "MAC Flooding fills the CAM table, forcing the switch to broadcast traffic to all ports (fail open)." },
      { variants: ["ARP Poisoning"], correct: false, explanation: "ARP poisoning redirects specific targets." },
      { variants: ["VLAN Hopping"], correct: false, explanation: "VLAN hopping jumps segments." },
      { variants: ["Spoofing"], correct: false, explanation: "Spoofing is generic." }
    ]
  }),

  q(5027, 5, 4, ["Attack", "Botnet"], {
    variants: [
      "Which type of attack relies on a network of compromised 'zombie' computers controlled by a C2 server?",
      "A botnet is primarily used to launch what type of attack?",
      "Thousands of infected IoT devices attacking one target is a:"
    ],
    answerOptions: [
      { variants: ["DDoS", "Distributed Denial of Service"], correct: true, explanation: "Botnets provide the distributed power needed for DDoS." },
      { variants: ["Phishing"], correct: false, explanation: "Phishing uses email." },
      { variants: ["Man-in-the-Middle"], correct: false, explanation: "MitM requires position, not volume." },
      { variants: ["Dictionary Attack"], correct: false, explanation: "Dictionary attack cracks passwords." }
    ]
  }),

  q(5028, 5, 3, ["Social Eng", "Physical"], {
    variants: [
      "An [attacker] watching a [user] type their password from across the room is performing which attack?",
      "Spying on someone's screen on an airplane is:",
      "Visual observation of credentials is:"
    ],
    answerOptions: [
      { variants: ["Shoulder Surfing"], correct: true, explanation: "Shoulder surfing is observing information visually." },
      { variants: ["Tailgating"], correct: false, explanation: "Tailgating is entry." },
      { variants: ["Dumpster Diving"], correct: false, explanation: "Dumpster diving is trash." },
      { variants: ["Scanning"], correct: false, explanation: "Scanning is digital." }
    ]
  }),

  q(5029, 5, 2, ["Attack", "DHCP"], {
    variants: [
      "In which attack does a rogue [device] assign incorrect IP addresses and gateway info to clients?",
      "A [user] gets an IP that routes all their traffic through an [attacker]'s laptop. This was caused by:",
      "If you see a second OFFER packet from an unknown IP, you have a:"
    ],
    answerOptions: [
      { variants: ["DHCP Spoofing", "Rogue DHCP"], correct: true, explanation: "A rogue DHCP server can assign itself as the gateway to intercept traffic." },
      { variants: ["DNS Poisoning"], correct: false, explanation: "DNS is for names." },
      { variants: ["ARP Poisoning"], correct: false, explanation: "ARP is Layer 2 resolution." },
      { variants: ["Replay Attack"], correct: false, explanation: "Replay is reusing data." }
    ]
  }),

  q(5030, 5, 1, ["Actors", "Motivation"], {
    variants: [
      "Individuals who hack for the thrill, validation, or bragging rights are typically classified as:",
      "An [attacker] defaces a site just to prove they could do it. This fits the profile of a:",
      "Motivation: 'For the lulz' or 'Clout'."
    ],
    answerOptions: [
      { variants: ["Script Kiddies", "Thrill Seeker"], correct: true, explanation: "Script kiddies or grey hats often attack for recognition or excitement." },
      { variants: ["APT"], correct: false, explanation: "APTs are strategic." },
      { variants: ["Organized Crime"], correct: false, explanation: "Crime is for profit." },
      { variants: ["Insider"], correct: false, explanation: "Insiders usually have a personal grievance." }
    ]
  }),

  q(5031, 5, 2, ["Attack", "Amplification"], {
    variants: [
      "An [attacker] sends small spoofed DNS queries that cause large responses to flood a victim. This is:",
      "Using UDP protocols with large response sizes (like NTP/DNS) to overwhelm a target is:",
      "Reflection attacks that increase the volume of traffic are called:"
    ],
    answerOptions: [
      { variants: ["Amplification Attack", "DNS Amplification"], correct: true, explanation: "Amplification exploits protocols where the response is much larger than the request." },
      { variants: ["ARP Poisoning"], correct: false, explanation: "ARP is local." },
      { variants: ["MAC Flapping"], correct: false, explanation: "MAC flapping is a switch issue." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." }
    ]
  }),

  q(5032, 5, 3, ["Wireless", "Deauth"], {
    variants: [
      "A Wi-Fi attack that forces clients to disconnect by spoofing management frames is commonly known as:",
      "To kick a user off the Wi-Fi to capture the handshake when they reconnect, use a:",
      "Sending frames with the AP's MAC address telling the client to 'Leave' is a:"
    ],
    answerOptions: [
      { variants: ["Deauthentication Attack", "Deauth"], correct: true, explanation: "Deauth packets force a client to disconnect, often used to capture the WPA handshake upon reconnection." },
      { variants: ["Smishing"], correct: false, explanation: "Smishing is SMS." },
      { variants: ["Pharming"], correct: false, explanation: "Pharming is DNS." },
      { variants: ["Token Passing"], correct: false, explanation: "Token passing is Ring topology." }
    ]
  }),

  q(5033, 5, 2, ["Attack", "Credentials"], {
    variants: [
      "Using previously leaked username/password pairs to attempt logins across multiple services is called:",
      "Because users reuse passwords, [attacker]s try credentials from one breach on other sites. This is:",
      "Automated injection of breached username/password pairs is:"
    ],
    answerOptions: [
      { variants: ["Credential Stuffing"], correct: true, explanation: "Credential stuffing exploits password reuse." },
      { variants: ["Brute Forcing"], correct: false, explanation: "Brute force tries all combinations." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables crack hashes." },
      { variants: ["Shoulder Surfing"], correct: false, explanation: "Shoulder surfing is visual." }
    ]
  }),

  q(5034, 5, 4, ["Malware", "Lateral"], {
    variants: [
      "Which malware type most commonly spreads laterally by exploiting network services without user interaction?",
      "Once inside, a ________ scans for other vulnerable machines to infect automatically."
    ],
    answerOptions: [
      { variants: ["Worm"], correct: true, explanation: "Worms move laterally using exploits." },
      { variants: ["Adware"], correct: false, explanation: "Adware stays put." },
      { variants: ["Logic Bomb"], correct: false, explanation: "Logic bomb waits." },
      { variants: ["Spyware"], correct: false, explanation: "Spyware monitors." }
    ]
  }),

  q(5035, 5, 2, ["Attack", "Routing"], {
    variants: [
      "Illegitimately advertising IP prefixes to redirect internet traffic is an example of:",
      "An ISP accidentally announces they own Google's IP range. This is:",
      "Manipulating the routing tables of the internet involves:"
    ],
    answerOptions: [
      { variants: ["BGP Hijacking"], correct: true, explanation: "BGP Hijacking involves advertising routes you don't own, redirecting global traffic." },
      { variants: ["DNSSEC"], correct: false, explanation: "DNSSEC secures DNS." },
      { variants: ["NAT Traversal"], correct: false, explanation: "NAT-T is for VPNs." },
      { variants: ["VLAN Tagging"], correct: false, explanation: "VLANs are local." }
    ]
  }),

  q(5036, 5, 3, ["Social Eng", "Pretexting"], {
    variants: [
      "An [attacker] calls the help desk creating a scenario: 'I am a new employee and lost my password.' This is:",
      "Creating a fabricated scenario to manipulate a victim into giving up info is:",
      "The 'story' used in a social engineering attack is called the:"
    ],
    answerOptions: [
      { variants: ["Pretexting"], correct: true, explanation: "Pretexting involves creating a believable lie/scenario to obtain info." },
      { variants: ["Tailgating"], correct: false, explanation: "Tailgating is physical." },
      { variants: ["Dumpster Diving"], correct: false, explanation: "Dumpster diving is trash." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." }
    ]
  }),

  q(5037, 5, 2, ["Defense", "ARP"], {
    variants: [
      "Which control MOST directly helps prevent ARP spoofing on managed switches?",
      "To ensure ARP packets match the DHCP lease table, an [admin] enables:",
      "Preventing MitM attacks on the LAN requires:"
    ],
    answerOptions: [
      { variants: ["Dynamic ARP Inspection (DAI)"], correct: true, explanation: "DAI validates ARP packets against the DHCP snooping binding database." },
      { variants: ["DHCP Snooping"], correct: false, explanation: "DHCP Snooping builds the database, but DAI does the ARP filtering." },
      { variants: ["WEP"], correct: false, explanation: "WEP is wireless." },
      { variants: ["Port Mirroring"], correct: false, explanation: "Mirroring is for monitoring." }
    ]
  }),

  q(5038, 5, 4, ["Malware", "C2"], {
    variants: [
      "A compromised system that periodically beacons to an attacker-controlled server for instructions is communicating with:",
      "To control a botnet, the master uses this infrastructure:",
      "Blocking traffic to known ________ servers can neutralize malware."
    ],
    answerOptions: [
      { variants: ["C2", "Command and Control"], correct: true, explanation: "C2 (Command and Control) servers manage compromised hosts." },
      { variants: ["NTP"], correct: false, explanation: "NTP is time." },
      { variants: ["OCSP"], correct: false, explanation: "OCSP is certs." },
      { variants: ["SIP"], correct: false, explanation: "SIP is voice." }
    ]
  }),

  q(5039, 5, 1, ["Insider", "Risk"], {
    variants: [
      "Which control BEST reduces the risk of a single [admin] causing major damage intentionally?",
      "To ensure no one person can destroy the backups alone, implement:",
      "Requiring two people to authorize a critical action is:"
    ],
    answerOptions: [
      { variants: ["Separation of Duties", "Two-Person Control"], correct: true, explanation: "Separation of duties ensures critical tasks require more than one person." },
      { variants: ["Shared Accounts"], correct: false, explanation: "Shared accounts reduce accountability." },
      { variants: ["Disable Logging"], correct: false, explanation: "Disabling logs hides the damage." },
      { variants: ["Telnet"], correct: false, explanation: "Telnet is insecure." }
    ]
  }),

  q(5040, 5, 3, ["Email", "Defense"], {
    variants: [
      "Which email control helps prevent spoofed 'From' domains by validating sender IP addresses via DNS?",
      "A TXT record that lists authorized mail servers for a domain is:",
      "To stop spammers from sending email as your CEO, configure:"
    ],
    answerOptions: [
      { variants: ["SPF", "Sender Policy Framework"], correct: true, explanation: "SPF uses DNS to list IPs authorized to send mail for a domain." },
      { variants: ["NAT"], correct: false, explanation: "NAT is routing." },
      { variants: ["ARP"], correct: false, explanation: "ARP is L2." },
      { variants: ["EIGRP"], correct: false, explanation: "EIGRP is routing." }
    ]
  }),

  q(5041, 5, 2, ["Attack", "Credentials"], {
    variants: [
      "An [attacker] tries one common password (e.g., Winter2026!) against many user accounts to avoid lockout. This is:",
      "The opposite of a brute force attack (Many passwords vs One User) is:",
      "Testing 'Password123' against every user in the directory is:"
    ],
    answerOptions: [
      { variants: ["Password Spraying"], correct: true, explanation: "Spraying uses one password against many accounts to avoid lockout thresholds." },
      { variants: ["Dictionary Attack"], correct: false, explanation: "Dictionary attacks usually target one account with many words." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables are offline hash cracking." },
      { variants: ["Whaling"], correct: false, explanation: "Whaling is phishing." }
    ]
  }),

  q(5042, 5, 3, ["Network", "Recon"], {
    variants: [
      "Scanning a target to identify open ports and services is best classified as:",
      "Before launching an exploit, an [attacker] maps out the network. This phase is:",
      "Using Nmap to find targets is:"
    ],
    answerOptions: [
      { variants: ["Reconnaissance", "Enumeration"], correct: true, explanation: "Recon/Enumeration is the phase of gathering info about targets." },
      { variants: ["Data Exfiltration"], correct: false, explanation: "Exfiltration is stealing data." },
      { variants: ["Privilege Escalation"], correct: false, explanation: "Privilege Escalation is gaining higher rights." },
      { variants: ["Persistence"], correct: false, explanation: "Persistence is maintaining access." }
    ]
  }),

  q(5043, 5, 2, ["Attack", "Amplification"], {
    variants: [
      "A reflection/amplification attack frequently associated with UDP port 123 targets which service?",
      "The 'Monlist' command was famously abused in which protocol to cause DDoS?",
      "Unsecured time servers can be used for:"
    ],
    answerOptions: [
      { variants: ["NTP", "Network Time Protocol"], correct: true, explanation: "NTP (UDP 123) has a 'monlist' command that sends a huge response, used for amplification." },
      { variants: ["SMTP"], correct: false, explanation: "SMTP is TCP (no reflection)." },
      { variants: ["IMAP"], correct: false, explanation: "IMAP is TCP." },
      { variants: ["RDP"], correct: false, explanation: "RDP is typically TCP." }
    ]
  }),

  q(5044, 5, 3, ["Wireless", "Rogue"], {
    variants: [
      "A malicious AP connected inside the building to bypass perimeter security is best described as:",
      "An employee plugs a home router into the corporate LAN to get better Wi-Fi. This creates a:",
      "An unauthorized wireless gateway attached to the wired network is a:"
    ],
    answerOptions: [
      { variants: ["Rogue Access Point"], correct: true, explanation: "A Rogue AP is an unauthorized device connected to the wired network, creating a backdoor." },
      { variants: ["Evil Twin"], correct: false, explanation: "Evil Twins mimic the SSID but aren't necessarily plugged into your LAN." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." },
      { variants: ["Smishing"], correct: false, explanation: "Smishing is SMS." }
    ]
  }),

  q(5045, 5, 4, ["Malware", "Macro"], {
    variants: [
      "A document that asks a user to 'Enable Content' to run a malicious script is delivering:",
      "Macro viruses are commonly found in:",
      "Files like .docm or .xlsm can contain:"
    ],
    answerOptions: [
      { variants: ["Macro Virus", "Malicious Macro"], correct: true, explanation: "Macros in Office documents are a common vector for malware." },
      { variants: ["BGP Hijacking"], correct: false, explanation: "BGP is routing." },
      { variants: ["NAT Traversal"], correct: false, explanation: "NAT-T is VPN." },
      { variants: ["ARP Inspection"], correct: false, explanation: "ARP is Layer 2." }
    ]
  }),

  q(5046, 5, 2, ["Attack", "DNS"], {
    variants: [
      "Redirecting users by changing DNS settings on their router or endpoint is commonly called:",
      "Malware changes your PC's DNS server to an [attacker]'s IP. This is:",
      "If the resolver itself is malicious, you are a victim of:"
    ],
    answerOptions: [
      { variants: ["DNS Hijacking"], correct: true, explanation: "DNS Hijacking involves changing the configuration of the DNS server setting itself." },
      { variants: ["ARP Inspection"], correct: false, explanation: "ARP Inspection is a defense." },
      { variants: ["VLAN Tagging"], correct: false, explanation: "Tagging is standard." },
      { variants: ["Packet Shaping"], correct: false, explanation: "Shaping is QoS." }
    ]
  }),

  q(5047, 5, 4, ["MitM", "Wi-Fi"], {
    variants: [
      "A [user] connects to open public Wi-Fi and enters credentials on a fake login page. This is:",
      "An [attacker] sets up a portal that looks like the hotel login to steal passwords. This is:",
      "Captive Portal Phishing targets:"
    ],
    answerOptions: [
      { variants: ["Captive Portal Phishing"], correct: true, explanation: "Attackers mimic the 'Agree to Terms' or Login page of public Wi-Fi to steal credentials." },
      { variants: ["BGP Peering"], correct: false, explanation: "BGP is ISP routing." },
      { variants: ["Spanning Tree"], correct: false, explanation: "STP prevents loops." },
      { variants: ["Root Guard"], correct: false, explanation: "Root guard protects STP." }
    ]
  }),

  q(5048, 5, 3, ["Attack", "LAN"], {
    variants: [
      "Flooding a [switch] CAM table to force broadcasting and capture traffic is known as:",
      "The tool 'macof' is used to perform which attack?",
      "Turning a switch into a hub by exhausting its memory is:"
    ],
    answerOptions: [
      { variants: ["MAC Flooding"], correct: true, explanation: "MAC Flooding overflows the Content Addressable Memory (CAM) table." },
      { variants: ["Smishing"], correct: false, explanation: "Smishing is SMS." },
      { variants: ["ARP Caching"], correct: false, explanation: "Caching is normal." },
      { variants: ["DNSSEC"], correct: false, explanation: "DNSSEC is security." }
    ]
  }),

  q(5049, 5, 3, ["Social Eng", "Spoofing"], {
    variants: [
      "An [attacker] forges the 'From' address in an email to look like it came from [company]. This is:",
      "Email impersonation by altering the header is:",
      "SPF, DKIM, and DMARC are designed to prevent:"
    ],
    answerOptions: [
      { variants: ["Email Spoofing"], correct: true, explanation: "Spoofing falsifies the origin address." },
      { variants: ["BGP Hijacking"], correct: false, explanation: "BGP is routing." },
      { variants: ["NDP"], correct: false, explanation: "NDP is IPv6." },
      { variants: ["Port Security"], correct: false, explanation: "Port Security is Layer 2." }
    ]
  }),

  q(5050, 5, 3, ["Social Eng", "Phishing"], {
    variants: [
      "Tricking a victim into clicking a legitimate-looking link that actually leads to a malicious URL is best described as:",
      "A broad, automated email campaign trying to steal credentials is:",
      "The most common vector for ransomware delivery is:"
    ],
    answerOptions: [
      { variants: ["Phishing"], correct: true, explanation: "Phishing uses deceptive emails to trick users." },
      { variants: ["War Driving"], correct: false, explanation: "War driving is Wi-Fi." },
      { variants: ["Shoulder Surfing"], correct: false, explanation: "Shoulder surfing is visual." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Advanced Network & Application Attacks (Questions 5051-5075)
  // ============================================================

  q(5051, 5, 2, ["DoS", "Smurf"], {
    variants: [
      "Which specific DoS attack involves sending ICMP broadcast packets with a spoofed source IP of the victim?",
      "An [attacker] uses the amplifier network to flood a victim with ping replies. This legacy attack is a:",
      "Spoofing the target's IP in a broadcast ping request causes a:"
    ],
    answerOptions: [
      { variants: ["Smurf Attack"], correct: true, explanation: "A Smurf attack uses ICMP broadcasts to amplify traffic toward a victim." },
      { variants: ["Fraggle Attack"], correct: false, explanation: "Fraggle uses UDP, not ICMP." },
      { variants: ["Ping of Death"], correct: false, explanation: "Ping of Death uses oversized packets." },
      { variants: ["SYN Flood"], correct: false, explanation: "SYN Flood uses TCP headers." }
    ]
  }),

  q(5052, 5, 2, ["DoS", "Fraggle"], {
    variants: [
      "Which attack is similar to a Smurf attack but uses UDP packets (typically ports 7 and 19) instead of ICMP?",
      "An amplification attack targeting UDP Echo and Chargen ports is known as:",
      "Flooding a network with spoofed UDP broadcast traffic is a:"
    ],
    answerOptions: [
      { variants: ["Fraggle Attack"], correct: true, explanation: "Fraggle is the UDP variant of the ICMP-based Smurf attack." },
      { variants: ["Smurf Attack"], correct: false, explanation: "Smurf uses ICMP." },
      { variants: ["NTP Amplification"], correct: false, explanation: "NTP targets port 123 specifically." },
      { variants: ["DNS Amplification"], correct: false, explanation: "DNS targets port 53." }
    ]
  }),

  q(5053, 5, 3, ["Wireless", "Jamming"], {
    variants: [
      "An [attacker] uses a radio transmitter to generate noise on the 2.4 GHz band, making Wi-Fi unusable. This is:",
      "Intentional interference designed to disrupt wireless communication is called:",
      "A Denial of Service attack against the physical RF spectrum is:"
    ],
    answerOptions: [
      { variants: ["Jamming", "RF Jamming"], correct: true, explanation: "Jamming is the intentional emission of RF energy to block wireless signals (DoS)." },
      { variants: ["Interference"], correct: false, explanation: "Interference is usually accidental (microwaves); Jamming is intentional." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is sending messages." },
      { variants: ["Evil Twin"], correct: false, explanation: "Evil Twin is impersonation." }
    ]
  }),

  q(5054, 5, 3, ["Wireless", "WPS"], {
    variants: [
      "Which Wi-Fi feature has a known vulnerability allowing attackers to brute-force the PIN to recover the WPA2 password?",
      "An [admin] should disable this push-button connection method due to security risks:",
      "Reaver is a tool commonly used to attack:"
    ],
    answerOptions: [
      { variants: ["WPS", "Wi-Fi Protected Setup"], correct: true, explanation: "The WPS PIN mechanism is easily brute-forced, revealing the network password." },
      { variants: ["WPA2"], correct: false, explanation: "WPA2 itself is strong; WPS is the weak entry point." },
      { variants: ["WEP"], correct: false, explanation: "WEP is broken, but not via a PIN." },
      { variants: ["WMM"], correct: false, explanation: "WMM is for QoS." }
    ]
  }),

  q(5055, 5, 3, ["Wireless", "IV Attack"], {
    variants: [
      "Which cryptographic attack targets the weak Initialization Vector in WEP?",
      "WEP is vulnerable because it reuses keys. This specific flaw leads to an:",
      "An [attacker] captures packets to find repeating patterns in the stream cipher. This is an:"
    ],
    answerOptions: [
      { variants: ["IV Attack", "Initialization Vector Attack"], correct: true, explanation: "WEP's short 24-bit IV leads to repeats, allowing attackers to crack the key." },
      { variants: ["Dictionary Attack"], correct: false, explanation: "IV attacks rely on math/probability, not word lists." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables target hashes." },
      { variants: ["Brute Force"], correct: false, explanation: "IV attacks are much faster than brute force." }
    ]
  }),

  q(5056, 5, 6, ["App", "SQLi"], {
    variants: [
      "An [attacker] enters `' OR '1'='1` into a login field to bypass authentication. This is:",
      "Injecting malicious database commands into a web form is known as:",
      "Which attack targets the backend database via the application front-end?"
    ],
    answerOptions: [
      { variants: ["SQL Injection", "SQLi"], correct: true, explanation: "SQL Injection manipulates the database query to access unauthorized data." },
      { variants: ["XSS"], correct: false, explanation: "XSS targets the user's browser." },
      { variants: ["CSRF"], correct: false, explanation: "CSRF forces user actions." },
      { variants: ["Buffer Overflow"], correct: false, explanation: "Buffer overflow targets memory." }
    ]
  }),

  q(5057, 5, 6, ["App", "XSS"], {
    variants: [
      "Injecting malicious client-side scripts (JavaScript) into a webpage viewed by other users is:",
      "An [attacker] posts a comment on a blog that steals the cookies of anyone who reads it. This is:",
      "Cross-Site Scripting is abbreviated as:"
    ],
    answerOptions: [
      { variants: ["XSS", "Cross-Site Scripting"], correct: true, explanation: "XSS executes malicious scripts in the victim's browser context." },
      { variants: ["CSS"], correct: false, explanation: "CSS is Cascading Style Sheets." },
      { variants: ["XS"], correct: false, explanation: "Not a standard acronym." },
      { variants: ["SQLi"], correct: false, explanation: "SQLi targets the server database." }
    ]
  }),

  q(5058, 5, 6, ["App", "Buffer Overflow"], {
    variants: [
      "Which attack attempts to write more data into a memory block than it can hold, possibly crashing the system or executing code?",
      "An application crashes after an [attacker] sends an overly long input string. This suggests a:",
      "Overwriting adjacent memory addresses is a sign of:"
    ],
    answerOptions: [
      { variants: ["Buffer Overflow"], correct: true, explanation: "Buffer overflows occur when data exceeds the allocated memory space." },
      { variants: ["Memory Leak"], correct: false, explanation: "Memory leak is a bug, not necessarily an attack vector (though it causes DoS)." },
      { variants: ["Race Condition"], correct: false, explanation: "Race condition is timing-based." },
      { variants: ["Injection"], correct: false, explanation: "Injection targets the interpreter (SQL/LDAP)." }
    ]
  }),

  q(5059, 5, 2, ["MitM", "Hijacking"], {
    variants: [
      "Stealing a valid session ID or cookie to take over a user's active session is called:",
      "An [attacker] uses 'Firesheep' to capture unencrypted side-channel data and impersonate a logged-in user. This is:",
      "Accessing a web service using a stolen token instead of a password is:"
    ],
    answerOptions: [
      { variants: ["Session Hijacking", "Sidejacking"], correct: true, explanation: "Session hijacking uses stolen tokens to impersonate a user without needing their password." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth messages." },
      { variants: ["Clickjacking"], correct: false, explanation: "Clickjacking is UI redress." },
      { variants: ["DNS Hijacking"], correct: false, explanation: "DNS hijacking redirects traffic." }
    ]
  }),

  q(5060, 5, 6, ["MitM", "SSL Strip"], {
    variants: [
      "Which attack forces a user's browser to downgrade from HTTPS to HTTP?",
      "An [attacker] sits in the middle and proxies traffic, stripping the encryption layer. This is:",
      "Tools like 'sslstrip' are used to perform:"
    ],
    answerOptions: [
      { variants: ["SSL Stripping", "Downgrade Attack"], correct: true, explanation: "SSL Stripping tricks the browser into using unencrypted HTTP." },
      { variants: ["Replay Attack"], correct: false, explanation: "Replay resends data." },
      { variants: ["Pass-the-Hash"], correct: false, explanation: "Pass-the-Hash is for authentication." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force guesses passwords." }
    ]
  }),

  q(5061, 5, 3, ["Wireless", "NFC"], {
    variants: [
      "Which short-range technology is vulnerable to data theft from a 'bump' attack in a crowd?",
      "An [attacker] uses a portable reader to steal credit card info from a pocket. This targets:",
      "Contactless payments rely on this technology:"
    ],
    answerOptions: [
      { variants: ["NFC", "Near Field Communication"], correct: true, explanation: "NFC is used for contactless cards and can be skimmed at very close range." },
      { variants: ["Bluetooth"], correct: false, explanation: "Bluetooth has longer range (meters)." },
      { variants: ["Wi-Fi"], correct: false, explanation: "Wi-Fi has much longer range." },
      { variants: ["RFID"], correct: false, explanation: "RFID is the parent tech, but payment attacks specifically target NFC implementation." }
    ]
  }),

  q(5062, 5, 1, ["Physical", "RFID"], {
    variants: [
      "An [attacker] copies the signal from an employee's proximity badge to create a clone. This targets which technology?",
      "Cloning a building access card typically involves exploiting:",
      "Long-range asset tracking tags use:"
    ],
    answerOptions: [
      { variants: ["RFID", "Radio Frequency ID"], correct: true, explanation: "RFID is used for badges and asset tags; signals can be captured and cloned." },
      { variants: ["NFC"], correct: false, explanation: "NFC is a subset of RFID, usually for phones/payments." },
      { variants: ["Magnetic Stripe"], correct: false, explanation: "Magstripes are swiped, not broadcast." },
      { variants: ["Smart Card"], correct: false, explanation: "Smart cards (contact) require physical insertion." }
    ]
  }),

  q(5063, 5, 3, ["Social Eng", "Urgency"], {
    variants: [
      "A phishing email claims 'Your account will be deleted in 10 minutes unless you verify now!' Which psychological principle is this?",
      "An [attacker] creates a false sense of crisis to bypass critical thinking. This tactic is:",
      "Pressuring a victim to act quickly is known as:"
    ],
    answerOptions: [
      { variants: ["Urgency"], correct: true, explanation: "Urgency forces the victim to act before thinking." },
      { variants: ["Authority"], correct: false, explanation: "Authority relies on status (e.g., 'I am the CEO')." },
      { variants: ["Social Proof"], correct: false, explanation: "Social proof relies on others doing it." },
      { variants: ["Scarcity"], correct: false, explanation: "Scarcity implies limited supply." }
    ]
  }),

  q(5064, 5, 3, ["Social Eng", "Authority"], {
    variants: [
      "An [attacker] claims to be the Vice President of IT to intimidate a helpdesk technician. This relies on:",
      "Using a job title or badge to demand compliance is an example of:",
      "'Do this because I ordered you to' exploits:"
    ],
    answerOptions: [
      { variants: ["Authority", "Intimidation"], correct: true, explanation: "Authority exploits respect for hierarchy." },
      { variants: ["Consensus"], correct: false, explanation: "Consensus is 'everyone else agrees'." },
      { variants: ["Familiarity"], correct: false, explanation: "Familiarity is 'we are friends'." },
      { variants: ["Trust"], correct: false, explanation: "Trust is built over time." }
    ]
  }),

  q(5065, 5, 3, ["Social Eng", "Trust"], {
    variants: [
      "An [attacker] spends weeks chatting with employees in the smoking area to build rapport before asking for access. This is:",
      "Building a relationship with a victim to exploit them later relies on:",
      "Social engineers use ________ to lower defenses."
    ],
    answerOptions: [
      { variants: ["Trust", "Familiarity"], correct: true, explanation: "Building trust/familiarity makes victims less suspicious of requests." },
      { variants: ["Urgency"], correct: false, explanation: "Urgency is fast." },
      { variants: ["Scarcity"], correct: false, explanation: "Scarcity is 'limited time offer'." },
      { variants: ["Technical Skill"], correct: false, explanation: "This is a soft skill." }
    ]
  }),

  q(5066, 5, 3, ["Attack", "Watering Hole"], {
    variants: [
      "An [attacker] compromises a website frequently visited by [company] employees to infect them. This is a:",
      "Instead of attacking the target directly, you attack a site they trust. This strategy is:",
      "Infecting a pizza delivery menu site used by a secure facility is a:"
    ],
    answerOptions: [
      { variants: ["Watering Hole Attack"], correct: true, explanation: "Watering Hole attacks target a group by infecting a site they are known to visit." },
      { variants: ["Phishing"], correct: false, explanation: "Phishing is sent via email." },
      { variants: ["Spear Phishing"], correct: false, explanation: "Spear phishing is targeted email." },
      { variants: ["DNS Poisoning"], correct: false, explanation: "DNS poisoning redirects traffic." }
    ]
  }),

  q(5067, 5, 4, ["Vulnerability", "Zero-Day"], {
    variants: [
      "An exploit that takes advantage of a vulnerability unknown to the vendor is called a:",
      "If there is no patch available for an active attack, it is a:",
      "Stuxnet exploited multiple ________ vulnerabilities."
    ],
    answerOptions: [
      { variants: ["Zero-Day"], correct: true, explanation: "Zero-Day means the developer has had zero days to fix it." },
      { variants: ["Legacy"], correct: false, explanation: "Legacy means old." },
      { variants: ["Dictionary"], correct: false, explanation: "Dictionary is password cracking." },
      { variants: ["Insider"], correct: false, explanation: "Insider is a threat actor." }
    ]
  }),

  q(5068, 5, 1, ["Vulnerability", "EOL"], {
    variants: [
      "Systems that are no longer supported by the vendor with security patches are classified as:",
      "Running Windows XP in a modern network creates a risk because it is:",
      "End of Life (EOL) or End of Service (EOS) systems are vulnerable because:"
    ],
    answerOptions: [
      { variants: ["They receive no patches", "Unpatched"], correct: true, explanation: "EOL systems stop receiving security updates, making them permanently vulnerable to new exploits." },
      { variants: ["They are too slow"], correct: false, explanation: "Speed isn't the security risk." },
      { variants: ["They use old cables"], correct: false, explanation: "Cabling isn't the primary software risk." },
      { variants: ["They have no firewall"], correct: false, explanation: "They might have a firewall, but the OS itself is flawed." }
    ]
  }),

  q(5069, 5, 1, ["Insider", "Unintentional"], {
    variants: [
      "An employee accidentally uploads sensitive customer data to a public cloud bucket. This is an:",
      "Which insider threat is caused by lack of training rather than malice?",
      "Shadow IT often leads to this type of threat:"
    ],
    answerOptions: [
      { variants: ["Unintentional Threat", "Negligent Insider"], correct: true, explanation: "Most insider incidents are accidents (negligence) rather than malicious sabotage." },
      { variants: ["Malicious Insider"], correct: false, explanation: "Malicious implies intent to harm." },
      { variants: ["APT"], correct: false, explanation: "APT is external." },
      { variants: ["Script Kiddie"], correct: false, explanation: "Script Kiddie is external." }
    ]
  }),

  q(5070, 5, 1, ["Physical", "Cloning"], {
    variants: [
      "An [attacker] uses a handheld device to copy the data from an employee's HID proximity badge. This is:",
      "RFID ________ allows an attacker to enter a building using a duplicate card.",
      "Duplicating a physical access token is:"
    ],
    answerOptions: [
      { variants: ["Badge Cloning", "Card Cloning"], correct: true, explanation: "Cloning copies the credentials from one card to another." },
      { variants: ["Tailgating"], correct: false, explanation: "Tailgating uses the original person." },
      { variants: ["Piggybacking"], correct: false, explanation: "Same as tailgating." },
      { variants: ["Lock Picking"], correct: false, explanation: "Lock picking manipulates the mechanical lock." }
    ]
  }),

  q(5071, 5, 2, ["Password", "Brute Force"], {
    variants: [
      "Attempting to crack a password by trying every possible combination of characters is a:",
      "Which attack is guaranteed to find the password eventually, given enough time?",
      "The most computationally expensive password attack is:"
    ],
    answerOptions: [
      { variants: ["Brute Force"], correct: true, explanation: "Brute force tries everything (aaaa, aaab, aaac...). It is slow but exhaustive." },
      { variants: ["Dictionary"], correct: false, explanation: "Dictionary uses a list of words." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables use pre-computed hashes." },
      { variants: ["Spraying"], correct: false, explanation: "Spraying tries one password against many users." }
    ]
  }),

  q(5072, 5, 2, ["Password", "Hybrid"], {
    variants: [
      "A password attack that adds numbers and symbols to the end of dictionary words (e.g., 'Password123') is a:",
      "Combining a dictionary list with brute-force rules is known as:",
      "Which attack targets common patterns like capitalizing the first letter and adding a year?"
    ],
    answerOptions: [
      { variants: ["Hybrid Attack"], correct: true, explanation: "Hybrid attacks apply rules (like adding '1!') to dictionary words." },
      { variants: ["Pure Brute Force"], correct: false, explanation: "Pure brute force tries 'axq9' which is unlikely." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables are static lookups." },
      { variants: ["Pass the Hash"], correct: false, explanation: "Pass the Hash reuses the hash." }
    ]
  }),

  q(5073, 5, 4, ["Malware", "Fileless"], {
    variants: [
      "Which type of malware operates entirely in RAM and leaves no footprint on the hard drive?",
      "Powershell scripts that execute malicious code directly in memory are examples of:",
      "To evade file-based antivirus, attackers use:"
    ],
    answerOptions: [
      { variants: ["Fileless Malware"], correct: true, explanation: "Fileless malware lives in volatile memory (RAM) and uses existing system tools (Living off the Land)." },
      { variants: ["Rootkit"], correct: false, explanation: "Rootkits usually install files to hide." },
      { variants: ["Ransomware"], correct: false, explanation: "Ransomware encrypts files." },
      { variants: ["Worm"], correct: false, explanation: "Worms are defined by spreading, not storage method." }
    ]
  }),

  q(5074, 5, 4, ["Malware", "Spyware"], {
    variants: [
      "Malware that tracks browsing history and presents unwanted pop-up ads is typically:",
      "Software installed without consent that monitors user behavior for marketing is:",
      "Adware is a subset of which malware category?"
    ],
    answerOptions: [
      { variants: ["Spyware / Adware"], correct: true, explanation: "Spyware collects user data without consent; Adware displays ads." },
      { variants: ["Ransomware"], correct: false, explanation: "Ransomware demands money." },
      { variants: ["Virus"], correct: false, explanation: "Viruses corrupt data." },
      { variants: ["Logic Bomb"], correct: false, explanation: "Logic bombs wait for a trigger." }
    ]
  }),

  q(5075, 5, 4, ["Botnet", "Zombie"], {
    variants: [
      "A computer that has been infected and is under the remote control of a botmaster is called a:",
      "In a DDoS attack, the individual infected devices are known as:",
      "A network of ________ makes up a botnet."
    ],
    answerOptions: [
      { variants: ["Zombie", "Bot"], correct: true, explanation: "A Zombie is a compromised host awaiting commands." },
      { variants: ["C2 Server"], correct: false, explanation: "C2 is the master." },
      { variants: ["Honeypot"], correct: false, explanation: "Honeypot is a trap." },
      { variants: ["Rootkit"], correct: false, explanation: "Rootkit is the malware type." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Vulnerabilities & Recon (Questions 5076-5100)
  // ============================================================

  q(5076, 5, 1, ["IoT", "Vulnerability"], {
    variants: [
      "What is the most common security vulnerability found in IoT devices?",
      "An [attacker] easily compromises a smart camera because the [admin] failed to change the:",
      "The Mirai botnet spread primarily by exploiting:"
    ],
    answerOptions: [
      { variants: ["Default Credentials", "Default Passwords"], correct: true, explanation: "Many IoT devices ship with 'admin/admin' and users fail to change them." },
      { variants: ["Unencrypted Wi-Fi"], correct: false, explanation: "A risk, but default creds allow remote control." },
      { variants: ["Lack of Firewall"], correct: false, explanation: "IoT devices rarely have local firewalls." },
      { variants: ["Physical access"], correct: false, explanation: "Mirai spread remotely." }
    ]
  }),

  q(5077, 5, 1, ["IoT", "Updates"], {
    variants: [
      "Why are IoT devices considered a significant security risk regarding their lifecycle?",
      "Many smart devices become permanently vulnerable because the vendor provides no:",
      "Lack of ________ capability makes IoT hard to secure."
    ],
    answerOptions: [
      { variants: ["Firmware Updates", "Patching"], correct: true, explanation: "Many IoT vendors do not provide long-term support or patch mechanisms." },
      { variants: ["Power"], correct: false, explanation: "Power isn't a security risk." },
      { variants: ["Bandwidth"], correct: false, explanation: "Bandwidth isn't the risk." },
      { variants: ["Antennas"], correct: false, explanation: "Antennas are hardware." }
    ]
  }),

  q(5078, 5, 1, ["Cloud", "Misconfig"], {
    variants: [
      "A common cloud vulnerability where an [admin] accidentally makes a storage bucket public is:",
      "Data breaches in AWS S3 or Azure Blob Storage are most often caused by:",
      "Misconfiguration of ________ leads to data exposure."
    ],
    answerOptions: [
      { variants: ["Permissions / ACLs", "Access Controls"], correct: true, explanation: "Setting storage to 'Public' instead of 'Private' is a massive source of leaks." },
      { variants: ["Encryption"], correct: false, explanation: "Public data can be encrypted but still stolen." },
      { variants: ["DDoS"], correct: false, explanation: "DDoS attacks availability, not confidentiality." },
      { variants: ["Malware"], correct: false, explanation: "This is a configuration error, not malware." }
    ]
  }),

  q(5079, 5, 1, ["Cloud", "Secrets"], {
    variants: [
      "Hardcoding API keys into a GitHub repository creates what type of risk?",
      "An [attacker] scans public code repositories looking for:",
      "Credential leakage in source code allows:"
    ],
    answerOptions: [
      { variants: ["Unauthorized Access", "Secret Leakage"], correct: true, explanation: "Hardcoded secrets allow anyone to access the cloud resources." },
      { variants: ["SQL Injection"], correct: false, explanation: "SQLi targets the app input." },
      { variants: ["Buffer Overflow"], correct: false, explanation: "Overflow targets memory." },
      { variants: ["Man-in-the-Middle"], correct: false, explanation: "MitM intercepts traffic." }
    ]
  }),

  q(5080, 5, 3, ["Recon", "Active"], {
    variants: [
      "Which type of reconnaissance involves communicating directly with the target system?",
      "Port scanning and banner grabbing are examples of:",
      "Any recon that allows the target to see your IP address is:"
    ],
    answerOptions: [
      { variants: ["Active Reconnaissance"], correct: true, explanation: "Active recon touches the target (sending packets), which can be logged." },
      { variants: ["Passive Reconnaissance"], correct: false, explanation: "Passive uses public info (OSINT) without touching the target." },
      { variants: ["Social Engineering"], correct: false, explanation: "SE targets people." },
      { variants: ["Pivot"], correct: false, explanation: "Pivot is moving inside." }
    ]
  }),

  q(5081, 5, 3, ["Recon", "Passive"], {
    variants: [
      "Gathering information about a target using public records, WHOIS, and social media is:",
      "Open Source Intelligence (OSINT) is a form of:",
      "Which recon method is undetectable by the target's firewall?"
    ],
    answerOptions: [
      { variants: ["Passive Reconnaissance"], correct: true, explanation: "Passive recon gathers info without engaging the target's systems directly." },
      { variants: ["Active Reconnaissance"], correct: false, explanation: "Active touches the system." },
      { variants: ["Port Scanning"], correct: false, explanation: "Scanning is active." },
      { variants: ["Enumeration"], correct: false, explanation: "Enumeration is active." }
    ]
  }),

  q(5082, 5, 3, ["Scanning", "Types"], {
    variants: [
      "Which vulnerability scan type uses a valid username and password to inspect the system deeply?",
      "To check for missing patches inside the OS registry, an [admin] runs a:",
      "Which scan provides more accurate results: Credentialed or Non-credentialed?"
    ],
    answerOptions: [
      { variants: ["Credentialed Scan", "Authenticated Scan"], correct: true, explanation: "Credentialed scans log in to the system to see internal configs and patches." },
      { variants: ["Non-credentialed Scan"], correct: false, explanation: "Non-credentialed only sees the outside (ports)." },
      { variants: ["Port Scan"], correct: false, explanation: "Port scans are usually external." },
      { variants: ["Discovery Scan"], correct: false, explanation: "Discovery finds hosts." }
    ]
  }),

  q(5083, 5, 3, ["Scanning", "Agent"], {
    variants: [
      "Instead of scanning over the network, some organizations install software on every [device] to report vulnerabilities. This is:",
      "Agent-based scanning is useful for laptops because:",
      "Which scanning method works even when the device is not on the corporate network?"
    ],
    answerOptions: [
      { variants: ["Agent-based Scanning"], correct: true, explanation: "Agents run locally and report back to the server, regardless of network location." },
      { variants: ["Server-based Scanning"], correct: false, explanation: "Server-based requires network reachability." },
      { variants: ["Passive Scanning"], correct: false, explanation: "Passive listens to traffic." },
      { variants: ["Cloud Scanning"], correct: false, explanation: "Cloud scanning is external." }
    ]
  }),

  q(5084, 5, 6, ["Attack", "Web"], {
    variants: [
      "Which attack attempts to access files outside the web server's root directory using '../' patterns?",
      "A URL like `http://site.com/get?file=../../etc/passwd` is an example of:",
      "Directory Traversal is also known as:"
    ],
    answerOptions: [
      { variants: ["Directory Traversal", "Path Traversal"], correct: true, explanation: "Traversal uses '../' to climb out of the web root and access system files." },
      { variants: ["XSS"], correct: false, explanation: "XSS injects scripts." },
      { variants: ["CSRF"], correct: false, explanation: "CSRF forces actions." },
      { variants: ["SQLi"], correct: false, explanation: "SQLi targets databases." }
    ]
  }),

  q(5085, 5, 2, ["Attack", "Auth"], {
    variants: [
      "Which attack captures a password hash and uses it to authenticate without cracking the plaintext password?",
      "To move laterally in a Windows domain without knowing the actual password, attackers use:",
      "NTLM vulnerabilities are often exploited via:"
    ],
    answerOptions: [
      { variants: ["Pass-the-Hash"], correct: true, explanation: "Attackers replay the captured hash to authenticate, bypassing the need for the real password." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force guesses the text." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow tables crack the hash." },
      { variants: ["Salt"], correct: false, explanation: "Salt defends against this (in storage)." }
    ]
  }),

  q(5086, 5, 2, ["Attack", "ARP"], {
    variants: [
      "Which specific ARP packet type is sent without a request and is used to update neighbor caches (often maliciously)?",
      "An [attacker] spams these packets to declare 'I am the Gateway IP':",
      "Valid uses include HA failover; malicious use includes poisoning."
    ],
    answerOptions: [
      { variants: ["Gratuitous ARP"], correct: true, explanation: "Gratuitous ARP is an unsolicited announcement. Attackers abuse it to overwrite ARP caches." },
      { variants: ["Reverse ARP"], correct: false, explanation: "RARP is legacy." },
      { variants: ["Proxy ARP"], correct: false, explanation: "Proxy ARP is a router function." },
      { variants: ["Inverse ARP"], correct: false, explanation: "Inverse ARP is for Frame Relay." }
    ]
  }),

  q(5087, 5, 3, ["Wireless", "NFC"], {
    variants: [
      "An attack where a malicious device is pressed against a user's pocket to read a smart card is:",
      "Skimming data from a contactless card involves which technology?",
      "NFC attacks rely on:"
    ],
    answerOptions: [
      { variants: ["Close Proximity", "Near Field"], correct: true, explanation: "NFC requires extremely close range (centimeters)." },
      { variants: ["Long Range"], correct: false, explanation: "NFC is not long range." },
      { variants: ["Line of Sight"], correct: false, explanation: "Radio waves go through fabric." },
      { variants: ["Internet"], correct: false, explanation: "It is a local radio attack." }
    ]
  }),

  q(5088, 5, 3, ["Wireless", "DoS"], {
    variants: [
      "Which management frame is spoofed to forcibly disconnect a client from an AP?",
      "To perform a 'Deauth' attack, the hacker sends a:",
      "A wireless DoS that targets the connection state is:"
    ],
    answerOptions: [
      { variants: ["Disassociation Frame", "Deauthentication Frame"], correct: true, explanation: "These frames tell the client the connection is terminated." },
      { variants: ["Beacon Frame"], correct: false, explanation: "Beacons announce the SSID." },
      { variants: ["Probe Request"], correct: false, explanation: "Probes look for networks." },
      { variants: ["ACK Frame"], correct: false, explanation: "ACK confirms data." }
    ]
  }),

  q(5089, 5, 3, ["Social Eng", "Quid Pro Quo"], {
    variants: [
      "An [attacker] calls random numbers offering 'free tech support' in exchange for disabling the firewall. This is:",
      "Promising a benefit (a gift or service) in return for information is:",
      "The 'Something for Something' social engineering tactic is:"
    ],
    answerOptions: [
      { variants: ["Quid Pro Quo"], correct: true, explanation: "Quid Pro Quo exchanges a service/gift for access." },
      { variants: ["Baiting"], correct: false, explanation: "Baiting uses physical media (USB)." },
      { variants: ["Tailgating"], correct: false, explanation: "Tailgating is physical entry." },
      { variants: ["Pretexting"], correct: false, explanation: "Pretexting is a story." }
    ]
  }),

  q(5090, 5, 3, ["Social Eng", "Baiting"], {
    variants: [
      "Leaving a USB drive labeled 'Executive Salaries' in the parking lot is an example of:",
      "Relying on curiosity to trick a user into plugging in infected media is:",
      "The physical equivalent of a Trojan Horse is:"
    ],
    answerOptions: [
      { variants: ["Baiting"], correct: true, explanation: "Baiting entices victims with the promise of information or goods (USB drives)." },
      { variants: ["Phishing"], correct: false, explanation: "Phishing is digital (email)." },
      { variants: ["Vishing"], correct: false, explanation: "Vishing is voice." },
      { variants: ["Dumpster Diving"], correct: false, explanation: "Dumpster diving is looking for trash." }
    ]
  }),

  q(5091, 5, 4, ["Malware", "Evasion"], {
    variants: [
      "Malware that uses code obfuscation to make it difficult for researchers to reverse engineer is called:",
      "Wrapping malware in a protective shell to hide its core logic is:",
      "Armored Virus techniques include:"
    ],
    answerOptions: [
      { variants: ["Armored Virus"], correct: true, explanation: "Armored viruses use obfuscation to protect themselves from analysis." },
      { variants: ["Polymorphic"], correct: false, explanation: "Polymorphic changes signature." },
      { variants: ["Worm"], correct: false, explanation: "Worm spreads." },
      { variants: ["Boot Sector"], correct: false, explanation: "Boot sector targets the MBR." }
    ]
  }),

  q(5092, 5, 4, ["Malware", "Evasion"], {
    variants: [
      "Malware that changes its binary signature every time it replicates to evade antivirus is:",
      "A virus that encrypts itself with a different key for each infection is:",
      "Polymorphism helps malware avoid:"
    ],
    answerOptions: [
      { variants: ["Polymorphic Malware"], correct: true, explanation: "Polymorphic code changes its appearance (signature) while keeping the same function." },
      { variants: ["Armored"], correct: false, explanation: "Armored prevents analysis." },
      { variants: ["Trojan"], correct: false, explanation: "Trojan is the delivery method." },
      { variants: ["Logic Bomb"], correct: false, explanation: "Logic bomb is the trigger." }
    ]
  }),

  q(5093, 5, 1, ["Insider", "Risk"], {
    variants: [
      "Employees installing unauthorized Wi-Fi routers or software is known as:",
      "IT systems deployed by departments other than the central IT department are:",
      "Shadow IT creates a risk because:"
    ],
    answerOptions: [
      { variants: ["Shadow IT"], correct: true, explanation: "Shadow IT bypasses organizational security controls and patch management." },
      { variants: ["BYOD"], correct: false, explanation: "BYOD is a sanctioned policy." },
      { variants: ["Insider Threat"], correct: false, explanation: "Shadow IT is a form of insider risk, but the specific term for the *equipment* is Shadow IT." },
      { variants: ["Zero Day"], correct: false, explanation: "Zero day is a vulnerability." }
    ]
  }),

  q(5094, 5, 2, ["Attack", "Exfiltration"], {
    variants: [
      "An [attacker] uses DNS queries to slowly copy sensitive data out of the network. This is:",
      "Hiding stolen data inside ICMP ping packets to bypass the firewall is:",
      "Sneaking data out of a secure network is called:"
    ],
    answerOptions: [
      { variants: ["Data Exfiltration"], correct: true, explanation: "Exfiltration is the unauthorized transfer of data from a computer." },
      { variants: ["Infiltration"], correct: false, explanation: "Infiltration is getting in." },
      { variants: ["Lateral Movement"], correct: false, explanation: "Lateral is moving sideways." },
      { variants: ["Privilege Escalation"], correct: false, explanation: "Escalation is getting admin rights." }
    ]
  }),

  q(5095, 5, 2, ["Attack", "DNS"], {
    variants: [
      "An [attacker] gains control of the victim's domain registration and points it to a malicious server. This is:",
      "Changing the authoritative nameservers for a domain without the owner's consent is:",
      "Domain Hijacking targets the:"
    ],
    answerOptions: [
      { variants: ["Domain Hijacking"], correct: true, explanation: "Hijacking attacks the administrative control of the domain registration itself." },
      { variants: ["DNS Poisoning"], correct: false, explanation: "Poisoning attacks the cache." },
      { variants: ["ARP Spoofing"], correct: false, explanation: "ARP is local." },
      { variants: ["URL Hijacking"], correct: false, explanation: "URL hijacking relies on user typos." }
    ]
  }),

  q(5096, 5, 3, ["Social Eng", "URL"], {
    variants: [
      "Registering 'goggle.com' to trap users who misspell the popular search engine is:",
      "Typosquatting is also known as:",
      "An [attacker] relies on user typing errors to deliver malware. This is:"
    ],
    answerOptions: [
      { variants: ["Typosquatting", "URL Hijacking"], correct: true, explanation: "Typosquatting exploits common typing errors to lead users to malicious sites." },
      { variants: ["Domain Hijacking"], correct: false, explanation: "Domain hijacking steals the real domain." },
      { variants: ["DNS Poisoning"], correct: false, explanation: "Poisoning corrupts the lookup." },
      { variants: ["Watering Hole"], correct: false, explanation: "Watering hole infects a real site." }
    ]
  }),

  q(5097, 5, 6, ["Web", "UI"], {
    variants: [
      "An attack that uses invisible frames to trick a user into clicking a button they didn't intend to is:",
      "Hijacking a user's mouse click to 'Like' a page or transfer money is:",
      "UI Redressing is another name for:"
    ],
    answerOptions: [
      { variants: ["Clickjacking"], correct: true, explanation: "Clickjacking layers invisible frames over legitimate buttons." },
      { variants: ["Bluejacking"], correct: false, explanation: "Bluejacking is Bluetooth." },
      { variants: ["Session Hijacking"], correct: false, explanation: "Session hijacking steals the cookie." },
      { variants: ["XSS"], correct: false, explanation: "XSS injects scripts." }
    ]
  }),

  q(5098, 5, 6, ["Web", "CSRF"], {
    variants: [
      "Which attack forces an authenticated user to execute an unwanted action on a web application?",
      "If you are logged into your bank, and a malicious site triggers a transfer without your knowledge, this is:",
      "CSRF stands for:"
    ],
    answerOptions: [
      { variants: ["Cross-Site Request Forgery (CSRF/XSRF)"], correct: true, explanation: "CSRF exploits the trust a site has in a user's browser." },
      { variants: ["Cross-Site Scripting (XSS)"], correct: false, explanation: "XSS exploits the trust a user has in a site." },
      { variants: ["SQL Injection"], correct: false, explanation: "SQLi targets the database." },
      { variants: ["Clickjacking"], correct: false, explanation: "Clickjacking captures clicks." }
    ]
  }),

  q(5099, 5, 4, ["Malware", "Refactoring"], {
    variants: [
      "Modifying the code of a driver to introduce a vulnerability while keeping the signature valid is:",
      "Shimming is a technique often used for:",
      "Refactoring code involves:"
    ],
    answerOptions: [
      { variants: ["Driver Manipulation", "Shimming/Refactoring"], correct: true, explanation: "Refactoring changes internal structure without changing behavior to evade detection. Shimming intercepts calls." },
      { variants: ["Rootkit"], correct: false, explanation: "Rootkit is the result, Refactoring is a technique." },
      { variants: ["Logic Bomb"], correct: false, explanation: "Logic bomb is a trigger." },
      { variants: ["Worm"], correct: false, explanation: "Worm is a type." }
    ]
  }),

  q(5100, 5, 1, ["Actors", "Summary"], {
    variants: [
      "Which characteristic BEST differentiates an APT from other threat actors?",
      "A threat actor with the motto 'Low and Slow' is an:",
      "Persistence is the primary goal of:"
    ],
    answerOptions: [
      { variants: ["Persistence / Long-term access"], correct: true, explanation: "APTs aim to stay in the network undetected for long periods to gather intelligence." },
      { variants: ["Financial Gain"], correct: false, explanation: "Criminals want money fast." },
      { variants: ["Chaos"], correct: false, explanation: "Script kiddies want chaos." },
      { variants: ["Political Change"], correct: false, explanation: "Hacktivists want change (usually publicly)." }
    ]
  }),

  // --- DOMAIN 6: CRYPTOGRAPHY ---
// ==========================================
// DOMAIN 6: CRYPTOGRAPHY (50Q - Part 1)
// ==========================================

  // --- TOPIC: Concepts (CIA, Non-Repudiation, Steganography) ---

  q(6001, 6, 5, ["Concept", "Non-Repudiation"], {
    variants: [
      "Which cryptographic concept uses digital signatures to prove the origin of a message, preventing the sender from denying they sent it?",
      "An [admin] signs an email with their private key. This provides proof of origin, known as:",
      "In a legal dispute, which security concept prevents a party from denying the authenticity of their signature?"
    ],
    answerOptions: [
      { variants: ["Non-Repudiation"], correct: true, explanation: "Non-Repudiation provides proof of origin (via digital signatures) so the author cannot deny their action." },
      { variants: ["Confidentiality"], correct: false, explanation: "Confidentiality hides the data (Encryption)." },
      { variants: ["Integrity"], correct: false, explanation: "Integrity proves the data hasn't changed, but not necessarily WHO sent it (unless signed)." },
      { variants: ["Availability"], correct: false, explanation: "Availability is about uptime." }
    ]
  }),

  q(6002, 6, 3, ["Asymmetric", "Keys"], {
    variants: [
      "What is the primary advantage of Asymmetric encryption over Symmetric encryption?",
      "Why would [company] choose Public Key Cryptography despite it being slower than AES?",
      "Which encryption method solves the 'Key Exchange' problem by using two different keys?"
    ],
    answerOptions: [
      { variants: ["Solves the Key Exchange problem"], correct: true, explanation: "Asymmetric encryption uses a public key for encryption and a private key for decryption, eliminating the need to securely share a single secret key beforehand." },
      { variants: ["It is much faster"], correct: false, explanation: "Asymmetric is significantly slower than Symmetric." },
      { variants: ["The keys are smaller"], correct: false, explanation: "Asymmetric keys are generally larger/longer for equivalent strength." },
      { variants: ["It is easier to implement"], correct: false, explanation: "PKI infrastructure is complex." }
    ]
  }),

  q(6003, 6, 1, ["Hashing", "Algorithms"], {
    variants: [
      "Which of the following hashing algorithms is considered secure for modern applications?",
      "An [admin] needs to verify file integrity. Which algorithm should they choose over MD5 or SHA-1?",
      "Which member of the SHA-2 family provides strong collision resistance?"
    ],
    answerOptions: [
      { variants: ["SHA-256"], correct: true, explanation: "SHA-256 (part of SHA-2) is the current industry standard for secure hashing." },
      { variants: ["MD5"], correct: false, explanation: "MD5 has known collision vulnerabilities." },
      { variants: ["SHA-1"], correct: false, explanation: "SHA-1 is deprecated due to collisions." },
      { variants: ["CRC"], correct: false, explanation: "CRC is for accidental error detection, not security." }
    ]
  }),

  q(6004, 6, 2, ["Symmetric", "Algorithms"], {
    variants: [
      "Which Symmetric encryption algorithm is the current industry gold standard used by the US government?",
      "To secure sensitive data at rest, an [admin] should select which cipher?",
      "Which algorithm replaced 3DES as the standard for symmetric encryption?"
    ],
    answerOptions: [
      { variants: ["AES", "Advanced Encryption Standard"], correct: true, explanation: "AES is the globally accepted standard for symmetric encryption." },
      { variants: ["DES"], correct: false, explanation: "DES is obsolete (56-bit key)." },
      { variants: ["3DES"], correct: false, explanation: "3DES is slow and deprecated." },
      { variants: ["RC4"], correct: false, explanation: "RC4 is insecure (stream cipher)." }
    ]
  }),

  q(6005, 6, 1, ["Hashing", "Salting"], {
    variants: [
      "What is the process of adding random data to a password before hashing it to defend against Rainbow Table attacks?",
      "To ensure two users with the same password have different hashes, the system uses:",
      "Storing passwords securely requires hashing and:"
    ],
    answerOptions: [
      { variants: ["Salting"], correct: true, explanation: "Salting adds random data (nonce) to the input, ensuring unique hashes and defeating pre-computed Rainbow Tables." },
      { variants: ["Padding"], correct: false, explanation: "Padding fills data to block size." },
      { variants: ["Peppering"], correct: false, explanation: "Peppering is a secret key added to the hash, but Salt is the public random data." },
      { variants: ["Mixing"], correct: false, explanation: "Not a standard term." }
    ]
  }),

  q(6006, 6, 5, ["PKI", "Roles"], {
    variants: [
      "In a Public Key Infrastructure (PKI), which entity is responsible for issuing and verifying digital certificates?",
      "Who signs a digital certificate to vouch for the identity of the holder?",
      "The 'Root of Trust' in a PKI hierarchy is the:"
    ],
    answerOptions: [
      { variants: ["Certificate Authority (CA)"], correct: true, explanation: "The CA verifies the identity of the requester and issues/signs the certificate." },
      { variants: ["ISP"], correct: false, explanation: "ISP provides internet." },
      { variants: ["DNS Server"], correct: false, explanation: "DNS resolves names." },
      { variants: ["User"], correct: false, explanation: "Users request certs." }
    ]
  }),

  q(6007, 6, 1, ["Concept", "Steganography"], {
    variants: [
      "The practice of hiding data within another file, such as hiding text inside an image, is known as:",
      "An [attacker] exfiltrates data by encoding it into the pixel bits of a harmless photo. This is:",
      "Security through obscurity by hiding the existence of a message is:"
    ],
    answerOptions: [
      { variants: ["Steganography"], correct: true, explanation: "Steganography hides the message itself (often in media files), whereas encryption hides the *meaning*." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption scrambles data." },
      { variants: ["Hashing"], correct: false, explanation: "Hashing verifies integrity." },
      { variants: ["Masking"], correct: false, explanation: "Masking obfuscates specific fields." }
    ]
  }),

  q(6008, 6, 3, ["Asymmetric", "ECC"], {
    variants: [
      "Which asymmetric algorithm is preferred for mobile devices because it provides strong security with smaller key sizes?",
      "To secure IoT devices with limited processing power, use:",
      "Which crypto algorithm relies on the algebraic structure of curves over finite fields?"
    ],
    answerOptions: [
      { variants: ["Elliptic Curve Cryptography (ECC)"], correct: true, explanation: "ECC provides equivalent security to RSA with much smaller keys, making it efficient for mobile/IoT." },
      { variants: ["RSA"], correct: false, explanation: "RSA requires very large keys for modern security." },
      { variants: ["AES"], correct: false, explanation: "AES is symmetric." },
      { variants: ["Diffie-Hellman"], correct: false, explanation: "DH is for key exchange." }
    ]
  }),

  q(6009, 6, 6, ["Hashing", "Collision"], {
    variants: [
      "What has occurred when two different inputs produce the exact same hash output?",
      "If File A and File B are different but have the same MD5 sum, this is a:",
      "Cryptographic integrity fails if an algorithm allows a:"
    ],
    answerOptions: [
      { variants: ["Collision"], correct: true, explanation: "A collision occurs when two distinct inputs result in the same hash digest." },
      { variants: ["Rainbow"], correct: false, explanation: "Rainbow is an attack table." },
      { variants: ["Salt"], correct: false, explanation: "Salt prevents tables." },
      { variants: ["Match"], correct: false, explanation: "Match implies they are the same file." }
    ]
  }),

  q(6010, 6, 3, ["Asymmetric", "Diffie-Hellman"], {
    variants: [
      "The Diffie-Hellman protocol is primarily used for which purpose?",
      "How can two parties securely generate a shared secret key over an insecure network?",
      "Which protocol enables secure key exchange without pre-shared secrets?"
    ],
    answerOptions: [
      { variants: ["Secure Key Exchange"], correct: true, explanation: "Diffie-Hellman allows two parties to create a shared symmetric key over a public channel." },
      { variants: ["Encrypting Files"], correct: false, explanation: "DH is not for bulk encryption." },
      { variants: ["Hashing Passwords"], correct: false, explanation: "Hashing is one-way." },
      { variants: ["Digital Signatures"], correct: false, explanation: "Signatures use RSA/DSA/ECC." }
    ]
  }),

  q(6011, 6, 5, ["PKI", "OCSP"], {
    variants: [
      "Which protocol allows a client to check the revocation status of a digital certificate in real-time?",
      "Instead of downloading a massive CRL, a browser can query the CA using:",
      "Which protocol returns a status of 'Good', 'Revoked', or 'Unknown' for a single cert?"
    ],
    answerOptions: [
      { variants: ["OCSP", "Online Certificate Status Protocol"], correct: true, explanation: "OCSP queries the CA in real-time to check if a specific certificate is valid." },
      { variants: ["CRL"], correct: false, explanation: "CRL is a downloaded list." },
      { variants: ["CSR"], correct: false, explanation: "CSR is a request." },
      { variants: ["CA"], correct: false, explanation: "CA is the entity." }
    ]
  }),

  q(6012, 6, 2, ["Symmetric", "Weakness"], {
    variants: [
      "What is the primary disadvantage of Symmetric encryption?",
      "Why is AES difficult to use for public internet communication without a helper protocol?",
      "The 'Key Exchange Problem' affects which type of encryption?"
    ],
    answerOptions: [
      { variants: ["Key Distribution", "Key Exchange"], correct: true, explanation: "Symmetric encryption requires both parties to share the same secret key securely beforehand." },
      { variants: ["Encryption Speed"], correct: false, explanation: "Symmetric is fast." },
      { variants: ["Algorithm Strength"], correct: false, explanation: "AES is very strong." },
      { variants: ["Complexity"], correct: false, explanation: "It is mathematically simpler than asymmetric." }
    ]
  }),

  q(6013, 6, 4, ["Hardware", "TPM"], {
    variants: [
      "Which hardware chip embedded on a motherboard is used to store encryption keys and verify boot integrity?",
      "BitLocker uses this component to ensure the OS hasn't been tampered with:",
      "A laptop's 'Root of Trust' for disk encryption is the:"
    ],
    answerOptions: [
      { variants: ["TPM", "Trusted Platform Module"], correct: true, explanation: "TPM is a secure cryptoprocessor on the motherboard used for integrity checks and key storage." },
      { variants: ["CPU"], correct: false, explanation: "CPU processes data." },
      { variants: ["GPU"], correct: false, explanation: "GPU processes graphics." },
      { variants: ["BIOS"], correct: false, explanation: "BIOS is firmware (TPM secures it)." }
    ]
  }),

  q(6014, 6, 1, ["Hashing", "Integrity"], {
    variants: [
      "Hashing algorithms are used to enforce which element of the CIA Triad?",
      "To prove a downloaded file was not corrupted, an [admin] checks the hash. This verifies:",
      "Ensuring data remains unchanged is:"
    ],
    answerOptions: [
      { variants: ["Integrity"], correct: true, explanation: "Hashing detects any modification to data, ensuring Integrity." },
      { variants: ["Confidentiality"], correct: false, explanation: "Hashing doesn't encrypt." },
      { variants: ["Availability"], correct: false, explanation: "Hashing doesn't ensure uptime." },
      { variants: ["Authentication"], correct: false, explanation: "Hashing alone doesn't prove identity." }
    ]
  }),

  q(6015, 6, 5, ["PKI", "CSR"], {
    variants: [
      "What must an [admin] generate and send to a Certificate Authority to apply for a digital certificate?",
      "To get a new SSL cert, you first create a key pair and then a:",
      "The file containing your public key and identity information sent to the CA is a:"
    ],
    answerOptions: [
      { variants: ["CSR", "Certificate Signing Request"], correct: true, explanation: "A CSR contains the public key and subject info (CN/SAN) needed by the CA to issue the cert." },
      { variants: ["CRL"], correct: false, explanation: "CRL is a revocation list." },
      { variants: ["OCSP"], correct: false, explanation: "OCSP is a status check." },
      { variants: ["Private Key"], correct: false, explanation: "Never send the Private Key!" }
    ]
  }),

  q(6016, 6, 6, ["Attack", "Downgrade"], {
    variants: [
      "Which type of attack forces a system to abandon a secure connection (like TLS) and fallback to an older, insecure protocol?",
      "An [attacker] interferes with the handshake to force the server to use SSL 3.0. This is:",
      "POODLE and Logjam are examples of:"
    ],
    answerOptions: [
      { variants: ["Downgrade Attack"], correct: true, explanation: "Downgrade attacks exploit backward compatibility to force weak security." },
      { variants: ["Replay Attack"], correct: false, explanation: "Replay resends data." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force guesses keys." },
      { variants: ["Dictionary Attack"], correct: false, explanation: "Dictionary guesses passwords." }
    ]
  }),

  q(6017, 6, 4, ["Hardware", "HSM"], {
    variants: [
      "What is a Hardware Security Module (HSM)?",
      "A dedicated appliance used by CAs to protect their root private keys is a:",
      "To perform high-volume crypto operations securely, [company] installs a:"
    ],
    answerOptions: [
      { variants: ["Dedicated crypto appliance", "Key Management Appliance"], correct: true, explanation: "HSMs are hardened, tamper-resistant appliances for managing keys and crypto processing." },
      { variants: ["USB Drive"], correct: false, explanation: "USB is storage." },
      { variants: ["Server Firewall"], correct: false, explanation: "Firewalls filter traffic." },
      { variants: ["Router"], correct: false, explanation: "Routers route." }
    ]
  }),

  q(6018, 6, 4, ["Concept", "Blockchain"], {
    variants: [
      "Which technology relies on a decentralized, distributed ledger where blocks are chained together using hashes?",
      "A tamper-evident list of records linked by cryptography is:",
      "Cryptocurrencies rely on this technology to prevent modification of the ledger:"
    ],
    answerOptions: [
      { variants: ["Blockchain"], correct: true, explanation: "Blockchain links blocks via hashes; changing one block invalidates the entire subsequent chain." },
      { variants: ["Database"], correct: false, explanation: "Standard databases are centralized." },
      { variants: ["PKI"], correct: false, explanation: "PKI manages certs." },
      { variants: ["RAID"], correct: false, explanation: "RAID is redundancy." }
    ]
  }),

  q(6019, 6, 6, ["Attack", "Rainbow"], {
    variants: [
      "An attack that uses a massive database of pre-computed hashes to crack passwords instantly is known as a:",
      "To defeat a Rainbow Table attack, an [admin] must use:",
      "Which password attack trades storage space (huge tables) for speed?"
    ],
    answerOptions: [
      { variants: ["Rainbow Table Attack"], correct: true, explanation: "Rainbow tables allow instant password lookup by pre-calculating hashes. Salt defeats this." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force calculates on the fly (slow)." },
      { variants: ["Dictionary"], correct: false, explanation: "Dictionary uses wordlists." },
      { variants: ["Spraying"], correct: false, explanation: "Spraying avoids lockouts." }
    ]
  }),

  q(6020, 6, 3, ["Asymmetric", "Encryption"], {
    variants: [
      "If Alice wants to send Bob an encrypted email that only Bob can read, which key should she use to encrypt it?",
      "To ensure confidentiality using asymmetric keys, encrypt with the recipient's:",
      "Bob decrypts the message with his private key. Alice encrypted it with:"
    ],
    answerOptions: [
      { variants: ["Bob's Public Key", "Recipient's Public Key"], correct: true, explanation: "Encrypting with the recipient's Public Key ensures only their Private Key can decrypt it." },
      { variants: ["Bob's Private Key"], correct: false, explanation: "Alice doesn't have Bob's private key." },
      { variants: ["Alice's Public Key"], correct: false, explanation: "Alice's public key would allow Alice to read it." },
      { variants: ["Alice's Private Key"], correct: false, explanation: "Encrypting with private key is 'Signing' (integrity), not confidentiality." }
    ]
  }),

  q(6021, 6, 2, ["Symmetric", "Legacy"], {
    variants: [
      "Why is the 3DES encryption algorithm considered deprecated?",
      "Applying the DES algorithm three times improves security but makes it:",
      "Which legacy cipher is slow and vulnerable to the Sweet32 attack?"
    ],
    answerOptions: [
      { variants: ["Slow and vulnerable", "Inefficient"], correct: true, explanation: "3DES is computationally expensive (slow) and has small block size vulnerabilities." },
      { variants: ["Too fast"], correct: false, explanation: "It is slow." },
      { variants: ["Asymmetric"], correct: false, explanation: "It is symmetric." },
      { variants: ["64-bit OS only"], correct: false, explanation: "It works on any OS." }
    ]
  }),

  q(6022, 6, 1, ["Hashing", "One-Way"], {
    variants: [
      "Is it possible to decrypt an MD5 hash back into the original text?",
      "Hashing is a ________ function.",
      "An [attacker] captures the hashes. Can they mathematically reverse them to get the password?"
    ],
    answerOptions: [
      { variants: ["No, it is one-way", "Irreversible"], correct: true, explanation: "Hashing is designed to be destructive/one-way. You cannot 'decrypt' a hash, only crack it by guessing." },
      { variants: ["Yes, with private key"], correct: false, explanation: "That is encryption." },
      { variants: ["Yes, with public key"], correct: false, explanation: "That is encryption." },
      { variants: ["Only if salted"], correct: false, explanation: "Salt makes cracking harder, but doesn't make it reversible." }
    ]
  }),

  q(6023, 6, 5, ["PKI", "Formats"], {
    variants: [
      "Which of the following file extensions typically indicates a digital certificate?",
      "Base64 encoded certificates usually use this extension:",
      "An [admin] exports a cert to a text file. It is likely:"
    ],
    answerOptions: [
      { variants: [".pem", ".crt"], correct: true, explanation: "PEM (Privacy Enhanced Mail) is a standard container format for certs." },
      { variants: [".exe"], correct: false, explanation: "Executable." },
      { variants: [".txt"], correct: false, explanation: "Generic text." },
      { variants: [".bat"], correct: false, explanation: "Batch script." }
    ]
  }),

  q(6024, 6, 4, ["Advanced", "Homomorphic"], {
    variants: [
      "What does Homomorphic Encryption allow you to do?",
      "Performing calculations on data while it remains encrypted is:",
      "To process data in the cloud without ever decrypting it, use:"
    ],
    answerOptions: [
      { variants: ["Process encrypted data", "Calc without decrypting"], correct: true, explanation: "Homomorphic encryption allows operations (math/search) on ciphertext, producing an encrypted result." },
      { variants: ["Break keys instantly"], correct: false, explanation: "That's Quantum Computing." },
      { variants: ["Encrypt twice"], correct: false, explanation: "That's Double Encryption." },
      { variants: ["Hide data"], correct: false, explanation: "That's Steganography." }
    ]
  }),

  q(6025, 6, 5, ["PKI", "CRL"], {
    variants: [
      "If a Certificate Authority discovers a certificate has been compromised, what list must be updated?",
      "A downloadable list of serial numbers for invalid certificates is the:",
      "Before OCSP, browsers checked this list to see if a cert was bad:"
    ],
    answerOptions: [
      { variants: ["CRL", "Certificate Revocation List"], correct: true, explanation: "The CRL lists certificates that have been revoked before their expiration date." },
      { variants: ["White List"], correct: false, explanation: "Whitelist allows access." },
      { variants: ["Black List"], correct: false, explanation: "Generic term, CRL is specific." },
      { variants: ["ACL"], correct: false, explanation: "ACL is for traffic filtering." }
    ]
  }),

  q(6026, 6, 2, ["Wireless", "WPA2"], {
    variants: [
      "Which encryption protocol is the standard for WPA2 networks?",
      "WPA2 improved over WPA by replacing TKIP with:",
      "Which protocol uses AES for Wi-Fi privacy?"
    ],
    answerOptions: [
      { variants: ["CCMP", "AES-CCMP"], correct: true, explanation: "CCMP (Counter Mode with Cipher Block Chaining Message Authentication Code Protocol) uses AES and is the WPA2 standard." },
      { variants: ["TKIP"], correct: false, explanation: "TKIP is WPA (Legacy)." },
      { variants: ["RC4"], correct: false, explanation: "RC4 is WEP." },
      { variants: ["GCMP"], correct: false, explanation: "GCMP is WPA3." }
    ]
  }),

  q(6027, 6, 3, ["Asymmetric", "RSA"], {
    variants: [
      "The security of the RSA algorithm relies on the mathematical difficulty of:",
      "Factoring the product of two large prime numbers is the basis of:",
      "RSA's strength comes from:"
    ],
    answerOptions: [
      { variants: ["Factoring large primes"], correct: true, explanation: "RSA relies on the difficulty of Integer Factorization of large prime products." },
      { variants: ["Elliptic curves"], correct: false, explanation: "That is ECC." },
      { variants: ["Discrete logarithms"], correct: false, explanation: "That is Diffie-Hellman/DSA." },
      { variants: ["Block substitution"], correct: false, explanation: "That is AES." }
    ]
  }),

  q(6028, 6, 6, ["Attack", "Dictionary"], {
    variants: [
      "Which password attack tries every word in a predefined list to guess the password?",
      "Using a list of common passwords (like 'password', '123456') is a:",
      "Compared to brute force, this attack is faster but only finds common passwords:"
    ],
    answerOptions: [
      { variants: ["Dictionary Attack"], correct: true, explanation: "Dictionary attacks use a wordlist of likely candidates." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force tries ALL combinations." },
      { variants: ["Rainbow Table"], correct: false, explanation: "Rainbow table uses hashes." },
      { variants: ["Replay"], correct: false, explanation: "Replay uses network packets." }
    ]
  }),

  q(6029, 6, 1, ["Hashing", "Avalanche"], {
    variants: [
      "In hashing, the 'Avalanche Effect' refers to what property?",
      "Changing one bit of the input should result in:",
      "If 'password' and 'passworD' produce completely different hashes, this demonstrates:"
    ],
    answerOptions: [
      { variants: ["Drastic change in output", "Total hash change"], correct: true, explanation: "The Avalanche Effect ensures no correlation exists between input similarity and output similarity." },
      { variants: ["Same hash"], correct: false, explanation: "That is a collision." },
      { variants: ["Salt"], correct: false, explanation: "Salt is an input." },
      { variants: ["Padding"], correct: false, explanation: "Padding is formatting." }
    ]
  }),

  q(6030, 6, 5, ["PKI", "Hierarchy"], {
    variants: [
      "Which trust model allows internet browsers to trust websites via a hierarchy of Certificate Authorities?",
      "The chain from Root CA to Intermediate CA to Server Cert relies on:",
      "Trusting a root CA automatically trusts the certificates it signs. This is:"
    ],
    answerOptions: [
      { variants: ["Hierarchical Trust", "PKI"], correct: true, explanation: "PKI uses a hierarchical chain of trust." },
      { variants: ["Web of Trust"], correct: false, explanation: "Web of Trust is PGP (peer-based)." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos is authentication." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS is AAA." }
    ]
  }),

  q(6031, 6, 3, ["TLS", "PFS"], {
    variants: [
      "Which TLS property ensures that compromising a server’s private key later does NOT decrypt previously captured sessions?",
      "To protect past sessions from future key compromise, use:",
      "Ephemeral key exchange provides:"
    ],
    answerOptions: [
      { variants: ["Perfect Forward Secrecy (PFS)"], correct: true, explanation: "PFS uses unique session keys for every connection, so stealing the master key doesn't decrypt old logs." },
      { variants: ["Compression"], correct: false, explanation: "Compression reduces size." },
      { variants: ["Obfuscation"], correct: false, explanation: "Obfuscation hides code." },
      { variants: ["Tokenization"], correct: false, explanation: "Tokenization replaces data." }
    ]
  }),

  q(6032, 6, 5, ["PKI", "Chain"], {
    variants: [
      "A server certificate is issued by an intermediate CA which chains to a root CA. This is a:",
      "To validate a certificate, the browser follows the:",
      "Root -> Intermediate -> Leaf is the:"
    ],
    answerOptions: [
      { variants: ["Chain of Trust", "Certificate Chain"], correct: true, explanation: "The chain of trust links the specific certificate back to a trusted Root CA." },
      { variants: ["Web of Trust"], correct: false, explanation: "Web of trust is decentralized." },
      { variants: ["Ring of Trust"], correct: false, explanation: "Not a PKI term." },
      { variants: ["Shared Secret"], correct: false, explanation: "Symmetric concept." }
    ]
  }),

  q(6033, 6, 2, ["Symmetric", "AES"], {
    variants: [
      "In modern VPNs and Wi-Fi, which symmetric cipher is most commonly used as the standard baseline?",
      "AES-128 and AES-256 are versions of:",
      "The Rijndael algorithm is now known as:"
    ],
    answerOptions: [
      { variants: ["AES", "Advanced Encryption Standard"], correct: true, explanation: "AES (Rijndael) is the global standard for symmetric encryption." },
      { variants: ["DES"], correct: false, explanation: "DES is obsolete." },
      { variants: ["RC4"], correct: false, explanation: "RC4 is insecure." },
      { variants: ["MD5"], correct: false, explanation: "MD5 is a hash." }
    ]
  }),

  q(6034, 6, 1, ["Hashing", "Integrity"], {
    variants: [
      "Which cryptographic function is MOST appropriate to verify a downloaded ISO was not altered?",
      "To check if a file became corrupt during download, compare the:",
      "Software vendors publish this string to prove file integrity:"
    ],
    answerOptions: [
      { variants: ["Hash", "Checksum"], correct: true, explanation: "A hash (checksum) acts as a digital fingerprint to verify integrity." },
      { variants: ["Symmetric Key"], correct: false, explanation: "Keys encrypt." },
      { variants: ["Asymmetric Key"], correct: false, explanation: "Keys encrypt/sign." },
      { variants: ["Steganography"], correct: false, explanation: "Steganography hides." }
    ]
  }),

  q(6035, 6, 6, ["Attack", "Inspection"], {
    variants: [
      "A [device] that intercepts TLS by presenting its own certificate to clients (typically for corporate inspection) is performing:",
      "To inspect encrypted HTTPS traffic for malware, a firewall uses:",
      "SSL Interception acts as a authorized:"
    ],
    answerOptions: [
      { variants: ["TLS Inspection", "SSL Decryption"], correct: true, explanation: "TLS Inspection terminates the SSL session, inspects traffic, and re-encrypts to the client (Man-in-the-Middle by design)." },
      { variants: ["ARP Caching"], correct: false, explanation: "ARP is L2." },
      { variants: ["Tokenization"], correct: false, explanation: "Tokenization protects data." },
      { variants: ["Channel Bonding"], correct: false, explanation: "Bonding is Wi-Fi." }
    ]
  }),

  q(6036, 6, 5, ["PKI", "OCSP"], {
    variants: [
      "If OCSP is blocked on a network, a client may have difficulty:",
      "Failure to reach the OCSP responder results in inability to check:",
      "Soft-Fail and Hard-Fail are behaviors related to:"
    ],
    answerOptions: [
      { variants: ["Revocation Status"], correct: true, explanation: "OCSP checks if a cert has been revoked. If blocked, browsers may accept bad certs (Soft-fail) or block connection (Hard-fail)." },
      { variants: ["DNS Names"], correct: false, explanation: "DNS is UDP 53." },
      { variants: ["DHCP Leases"], correct: false, explanation: "DHCP is UDP 67/68." },
      { variants: ["Time Sync"], correct: false, explanation: "Time is NTP." }
    ]
  }),

  q(6037, 6, 3, ["Asymmetric", "Signature"], {
    variants: [
      "If Bob signs a message with his private key, what does Alice use to verify the signature?",
      "To check a digital signature, you need the signer's:",
      "Verification of non-repudiation requires the sender's:"
    ],
    answerOptions: [
      { variants: ["Public Key"], correct: true, explanation: "Signatures are created with the Private Key and verified with the Public Key." },
      { variants: ["Private Key"], correct: false, explanation: "Alice does not have Bob's private key." },
      { variants: ["Shared Key"], correct: false, explanation: "Symmetric keys don't provide non-repudiation." },
      { variants: ["Hash"], correct: false, explanation: "The hash is compared, but the Key is used to decrypt the signature." }
    ]
  }),

  q(6038, 6, 2, ["Wireless", "WPA2"], {
    variants: [
      "WPA2 with AES uses which encapsulation/encryption suite name?",
      "To configure WPA2 properly, select AES and:",
      "TKIP was for WPA. WPA2 uses:"
    ],
    answerOptions: [
      { variants: ["CCMP"], correct: true, explanation: "CCMP is the encryption protocol used with AES in WPA2." },
      { variants: ["TKIP"], correct: false, explanation: "TKIP is deprecated." },
      { variants: ["WEP"], correct: false, explanation: "WEP is broken." },
      { variants: ["PAP"], correct: false, explanation: "PAP is an auth protocol." }
    ]
  }),

  q(6039, 6, 4, ["Key Mgmt", "HSM"], {
    variants: [
      "Which solution is MOST appropriate to centrally protect and manage high-value private keys used for signing?",
      "Root CA keys should be stored in a:",
      "To offload crypto processing and secure keys, use:"
    ],
    answerOptions: [
      { variants: ["HSM", "Hardware Security Module"], correct: true, explanation: "HSMs provide the highest level of physical and logical protection for keys." },
      { variants: ["USB Hub"], correct: false, explanation: "USB is insecure." },
      { variants: ["Switch"], correct: false, explanation: "Switches move data." },
      { variants: ["Patch Panel"], correct: false, explanation: "Patch panels connect cables." }
    ]
  }),

  q(6040, 6, 1, ["Concept", "Encoding"], {
    variants: [
      "Which statement best describes Base64?",
      "Is Base64 a form of encryption?",
      "Converting binary data to ASCII text for email transport is:"
    ],
    answerOptions: [
      { variants: ["Encoding", "Not Encryption"], correct: true, explanation: "Base64 is an encoding scheme to represent data; it offers no security or confidentiality." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption requires a key." },
      { variants: ["Hashing"], correct: false, explanation: "Hashing is one-way." },
      { variants: ["Key Exchange"], correct: false, explanation: "Base64 doesn't exchange keys." }
    ]
  }),

  q(6041, 6, 3, ["IPsec", "Protocols"], {
    variants: [
      "Which IPsec protocol provides encryption and integrity for IP packets?",
      "To encrypt the payload in a VPN tunnel, use:",
      "IP Protocol 50 is:"
    ],
    answerOptions: [
      { variants: ["ESP", "Encapsulating Security Payload"], correct: true, explanation: "ESP provides confidentiality (encryption) and integrity. AH only provides integrity." },
      { variants: ["AH", "Authentication Header"], correct: false, explanation: "AH does not encrypt." },
      { variants: ["GRE"], correct: false, explanation: "GRE does not encrypt." },
      { variants: ["ARP"], correct: false, explanation: "ARP is Layer 2." }
    ]
  }),

  q(6042, 6, 3, ["IPsec", "Modes"], {
    variants: [
      "Which IPsec mode is most commonly used for site-to-site VPNs between gateways?",
      "To protect internal IP addresses over the internet, IPsec uses:",
      "Encapsulating the entire original packet inside a new IPsec packet is:"
    ],
    answerOptions: [
      { variants: ["Tunnel Mode"], correct: true, explanation: "Tunnel mode encrypts the header and payload, essential for gateway-to-gateway VPNs." },
      { variants: ["Transport Mode"], correct: false, explanation: "Transport mode only encrypts payload (Host-to-Host)." },
      { variants: ["Promiscuous Mode"], correct: false, explanation: "Promiscuous is for sniffing." },
      { variants: ["Half-duplex"], correct: false, explanation: "Half-duplex is for media." }
    ]
  }),

  q(6043, 6, 2, ["Integrity", "HMAC"], {
    variants: [
      "Which mechanism combines a hash with a shared secret to provide message integrity and authenticity?",
      "To ensure a message hasn't changed AND came from a trusted sender, use:",
      "IPsec uses this to verify packet integrity:"
    ],
    answerOptions: [
      { variants: ["HMAC", "Hashed Message Authentication Code"], correct: true, explanation: "HMAC adds a key to the hash process, validating both integrity and authenticity." },
      { variants: ["Base64"], correct: false, explanation: "Encoding." },
      { variants: ["Diffraction"], correct: false, explanation: "Physics." },
      { variants: ["NAT"], correct: false, explanation: "Routing." }
    ]
  }),

  q(6044, 6, 5, ["PKI", "Formats"], {
    variants: [
      "Which certificate format commonly includes both the certificate AND its private key?",
      "To back up a cert and its key to a password-protected file, use:",
      "Windows PFX files correspond to which standard?"
    ],
    answerOptions: [
      { variants: ["PKCS#12", ".p12", ".pfx"], correct: true, explanation: "PKCS#12 (.p12/.pfx) allows bundling the cert chain and private key, protected by a password." },
      { variants: [".cer"], correct: false, explanation: "CER is usually public only." },
      { variants: [".crt"], correct: false, explanation: "CRT is usually public only." },
      { variants: [".txt"], correct: false, explanation: "Text file." }
    ]
  }),

  q(6045, 6, 2, ["Wireless", "Enterprise"], {
    variants: [
      "WPA2-Enterprise most commonly uses which framework for authentication?",
      "Connecting to Wi-Fi with a username/password involves the:",
      "EAP (Extensible Authentication Protocol) is the framework for:"
    ],
    answerOptions: [
      { variants: ["802.1X"], correct: true, explanation: "802.1X is the standard for port-based access control, carrying EAP over LAN (EAPOL)." },
      { variants: ["WEP"], correct: false, explanation: "WEP is broken." },
      { variants: ["CSMA/CA"], correct: false, explanation: "CSMA is access method." },
      { variants: ["STP"], correct: false, explanation: "STP is loop prevention." }
    ]
  }),

  q(6046, 6, 3, ["TLS", "Versions"], {
    variants: [
      "Which TLS version is widely considered the modern standard with improved security and speed?",
      "Which version removed support for weak ciphers like SHA-1 and RC4 entirely?",
      "TLS 1.2 is being replaced by:"
    ],
    answerOptions: [
      { variants: ["TLS 1.3"], correct: true, explanation: "TLS 1.3 is faster (fewer round trips) and more secure (removed old ciphers)." },
      { variants: ["TLS 1.1"], correct: false, explanation: "Deprecated." },
      { variants: ["TLS 1.0"], correct: false, explanation: "Deprecated." },
      { variants: ["SSL 3.0"], correct: false, explanation: "Insecure." }
    ]
  }),

  q(6047, 6, 4, ["Encryption", "VoIP"], {
    variants: [
      "Which protocol is used to encrypt RTP media streams for VoIP?",
      "To prevent eavesdropping on a phone call, enable:",
      "SIP secures the setup, but ________ secures the audio."
    ],
    answerOptions: [
      { variants: ["SRTP", "Secure RTP"], correct: true, explanation: "Secure Real-time Transport Protocol encrypts the voice/video payload." },
      { variants: ["SIP"], correct: false, explanation: "SIP is signaling." },
      { variants: ["SMTP"], correct: false, explanation: "SMTP is email." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is management." }
    ]
  }),

  q(6048, 6, 1, ["Hashing", "Passwords"], {
    variants: [
      "Which approach BEST defends stored passwords against brute force by making each guess computationally expensive?",
      "Key Stretching algorithms like Bcrypt and PBKDF2 are used to:",
      "To slow down an attacker trying to crack hashes, use:"
    ],
    answerOptions: [
      { variants: ["Key Stretching", "Bcrypt", "PBKDF2"], correct: true, explanation: "Key stretching algorithms run the hash thousands of times, making brute force too slow to be feasible." },
      { variants: ["MD5"], correct: false, explanation: "MD5 is fast (bad for passwords)." },
      { variants: ["Base64"], correct: false, explanation: "Encoding." },
      { variants: ["RC4"], correct: false, explanation: "Stream cipher." }
    ]
  }),

  q(6049, 6, 5, ["PKI", "Rotation"], {
    variants: [
      "Regularly rotating keys and certificates primarily reduces risk from:",
      "Changing keys every year ensures that if a key is stolen, it is only useful for a limited time. This limits:",
      "Short certificate lifespans improve security by:"
    ],
    answerOptions: [
      { variants: ["Key Compromise", "Blast Radius"], correct: true, explanation: "Frequent rotation limits the window of opportunity if a key is compromised." },
      { variants: ["ARP Cache"], correct: false, explanation: "ARP is network." },
      { variants: ["VLAN Overlap"], correct: false, explanation: "VLAN is switching." },
      { variants: ["DHCP Exhaustion"], correct: false, explanation: "DHCP is addressing." }
    ]
  }),

  q(6050, 6, 6, ["Encryption", "States"], {
    variants: [
      "Full-disk encryption (FDE) primarily protects data in which state?",
      "If a server is powered off and stolen, FDE protects:",
      "BitLocker is a control for:"
    ],
    answerOptions: [
      { variants: ["Data at Rest"], correct: true, explanation: "FDE protects data stored on the physical media (At Rest)." },
      { variants: ["Data in Transit"], correct: false, explanation: "Transit is network." },
      { variants: ["Data in Use"], correct: false, explanation: "Use is RAM." },
      { variants: ["Data in Motion"], correct: false, explanation: "Motion is network." }
    ]
  }),
  
  q(6051, 6, 2, ["Symmetric", "Stream Cipher"], {
    variants: [
      "Which type of encryption encrypts data one bit or byte at a time?",
      "RC4 is an example of which type of cipher?",
      "For real-time streaming media where buffering is not possible, which cipher mode is ideal?"
    ],
    answerOptions: [
      { variants: ["Stream Cipher"], correct: true, explanation: "Stream ciphers encrypt data bit-by-bit, making them fast and suitable for streaming. (RC4 is a legacy example)." },
      { variants: ["Block Cipher"], correct: false, explanation: "Block ciphers encrypt fixed-size chunks (e.g., 128-bit blocks)." },
      { variants: ["Hashing"], correct: false, explanation: "Hashing is not encryption." },
      { variants: ["Asymmetric"], correct: false, explanation: "Asymmetric uses key pairs." }
    ]
  }),

  q(6052, 6, 2, ["Symmetric", "Block Cipher"], {
    variants: [
      "AES typically operates as which type of cipher?",
      "Encryption that breaks a message into fixed-length chunks (e.g., 128 bits) before processing is:",
      "CBC and GCM are modes of operation for:"
    ],
    answerOptions: [
      { variants: ["Block Cipher"], correct: true, explanation: "AES divides data into blocks (128-bit) and encrypts each block." },
      { variants: ["Stream Cipher"], correct: false, explanation: "Stream ciphers do bit-by-bit." },
      { variants: ["Elliptic Curve"], correct: false, explanation: "ECC is asymmetric." },
      { variants: ["Digest"], correct: false, explanation: "Digest is a hash." }
    ]
  }),

  q(6053, 6, 2, ["Symmetric", "ECB"], {
    variants: [
      "Which block cipher mode is considered insecure because identical plaintext blocks produce identical ciphertext blocks?",
      "If you encrypt a picture of a penguin and can still see the penguin in the static/noise, you used:",
      "The simplest, yet most vulnerable encryption mode is:"
    ],
    answerOptions: [
      { variants: ["ECB", "Electronic Codebook"], correct: true, explanation: "ECB does not use an IV/nonce, so patterns in the plaintext remain visible in the ciphertext." },
      { variants: ["CBC"], correct: false, explanation: "CBC uses chaining to hide patterns." },
      { variants: ["GCM"], correct: false, explanation: "GCM hides patterns and adds integrity." },
      { variants: ["CTR"], correct: false, explanation: "CTR turns a block cipher into a stream cipher." }
    ]
  }),

  q(6054, 6, 2, ["Symmetric", "GCM"], {
    variants: [
      "Which AES mode provides both confidentiality (encryption) and data integrity (hashing) simultaneously?",
      "To get performance and authentication in one pass, an [admin] selects:",
      "AES-________ is commonly used in modern Wi-Fi (WPA3) and TLS 1.3."
    ],
    answerOptions: [
      { variants: ["GCM", "Galois/Counter Mode"], correct: true, explanation: "GCM is an authenticated encryption mode that is highly efficient and provides integrity." },
      { variants: ["ECB"], correct: false, explanation: "ECB is insecure." },
      { variants: ["CBC"], correct: false, explanation: "CBC requires a separate hash for integrity." },
      { variants: ["RC4"], correct: false, explanation: "RC4 is a stream cipher." }
    ]
  }),

  q(6055, 6, 4, ["Obfuscation", "Data"], {
    variants: [
      "Replacing sensitive data (like a Credit Card number) with a non-sensitive substitute that maps back to the original is:",
      "To use real data in a test environment without exposing customer secrets, an [admin] uses:",
      "Unlike encryption, this technique usually requires a central database to map the placeholder back to the real data:"
    ],
    answerOptions: [
      { variants: ["Tokenization"], correct: true, explanation: "Tokenization replaces data with a random token; the mapping is stored in a secure vault." },
      { variants: ["Encryption"], correct: false, explanation: "Encryption uses a math formula (key), not a database mapping." },
      { variants: ["Hashing"], correct: false, explanation: "Hashing is one-way." },
      { variants: ["Masking"], correct: false, explanation: "Masking hides characters (X) but doesn't allow full reversible mapping via database." }
    ]
  }),

  q(6056, 6, 4, ["Obfuscation", "Code"], {
    variants: [
      "Making source code difficult for humans to read while still allowing it to execute is:",
      "An [attacker] uses this technique to hide malware payloads from signature-based detection:",
      "Renaming variables to random strings and removing whitespace is a form of:"
    ],
    answerOptions: [
      { variants: ["Obfuscation"], correct: true, explanation: "Obfuscation makes code unreadable to protect IP or hide malicious intent." },
      { variants: ["Encryption"], correct: false, explanation: "Encrypted code cannot execute until decrypted; obfuscated code runs as-is." },
      { variants: ["Hashing"], correct: false, explanation: "Hashing destroys the code structure." },
      { variants: ["Tokenization"], correct: false, explanation: "Tokenization is for data fields." }
    ]
  }),

  q(6057, 6, 2, ["Encryption", "Ephemeral"], {
    variants: [
      "Keys that are generated for a single session and then discarded are called:",
      "Perfect Forward Secrecy (PFS) relies on which type of keys?",
      "Unlike static keys, these keys are temporary:"
    ],
    answerOptions: [
      { variants: ["Ephemeral Keys"], correct: true, explanation: "Ephemeral keys are short-lived and unique to each session, ensuring PFS." },
      { variants: ["Static Keys"], correct: false, explanation: "Static keys persist (like a Server Private Key)." },
      { variants: ["Public Keys"], correct: false, explanation: "Public keys are usually static." },
      { variants: ["Escrow Keys"], correct: false, explanation: "Escrow keys are stored for recovery." }
    ]
  }),

  q(6058, 6, 3, ["Asymmetric", "Key Exchange"], {
    variants: [
      "Which version of Diffie-Hellman uses Elliptic Curves for faster key exchange?",
      "To enable Perfect Forward Secrecy (PFS) with high performance, use:",
      "ECDHE stands for:"
    ],
    answerOptions: [
      { variants: ["ECDHE", "Elliptic Curve Diffie-Hellman Ephemeral"], correct: true, explanation: "ECDHE provides secure, fast, ephemeral key exchange." },
      { variants: ["RSA"], correct: false, explanation: "RSA key exchange does not provide PFS." },
      { variants: ["AES"], correct: false, explanation: "AES is symmetric." },
      { variants: ["SHA"], correct: false, explanation: "SHA is hashing." }
    ]
  }),

  q(6059, 6, 4, ["Hardware", "Randomness"], {
    variants: [
      "Low entropy can lead to weak encryption. A specialized hardware component used to generate true randomness is a:",
      "A TPR (True Random Number Generator) is often found inside a:",
      "To ensure keys are unpredictable, crypto systems need high:"
    ],
    answerOptions: [
      { variants: ["Entropy", "TRNG"], correct: true, explanation: "Entropy is the measure of randomness. Hardware generators (TRNGs) provide high entropy." },
      { variants: ["Latency"], correct: false, explanation: "Latency is delay." },
      { variants: ["Frequency"], correct: false, explanation: "Frequency is speed." },
      { variants: ["Bandwidth"], correct: false, explanation: "Bandwidth is capacity." }
    ]
  }),

  q(6060, 6, 1, ["Hashing", "Birthday"], {
    variants: [
      "The 'Birthday Paradox' is a statistical probability used to find:",
      "Which attack demonstrates that collisions are more likely than people intuitively expect?",
      "To find two different messages with the same hash, an [attacker] relies on the:"
    ],
    answerOptions: [
      { variants: ["Birthday Attack", "Collisions"], correct: true, explanation: "The Birthday Attack reduces the effort needed to find a hash collision based on probability math." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force targets the pre-image." },
      { variants: ["Replay"], correct: false, explanation: "Replay is network-based." },
      { variants: ["Downgrade"], correct: false, explanation: "Downgrade is protocol-based." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: PKI Architecture & Certificates (Questions 6061-6080)
  // ============================================================

  q(6061, 6, 5, ["PKI", "Root"], {
    variants: [
      "To protect the entire PKI hierarchy, the Root CA should be:",
      "An [admin] builds a Root CA, signs the Intermediate CAs, and then powers the Root server down. This is:",
      "What is an 'Offline Root'?"
    ],
    answerOptions: [
      { variants: ["Offline", "Air Gapped"], correct: true, explanation: "Keeping the Root CA offline prevents remote compromise. It is only brought up to sign new Intermediates." },
      { variants: ["Online"], correct: false, explanation: "Online roots are high risk." },
      { variants: ["Public"], correct: false, explanation: "Roots are private (owned by the org) or Public (Verisign), but the security state is 'Offline'." },
      { variants: ["Ephemeral"], correct: false, explanation: "Roots are long-lived." }
    ]
  }),

  q(6062, 6, 5, ["PKI", "Wildcard"], {
    variants: [
      "Which type of certificate can secure '*.example.com'?",
      "To secure 'mail.corp.com', 'web.corp.com', and 'dev.corp.com' with a single cert, use a:",
      "A Wildcard Certificate protects:"
    ],
    answerOptions: [
      { variants: ["Wildcard Certificate", "Subdomains"], correct: true, explanation: "Wildcards secure the main domain and an unlimited number of first-level subdomains." },
      { variants: ["Root Certificate"], correct: false, explanation: "Root signs other certs." },
      { variants: ["Self-signed"], correct: false, explanation: "Self-signed is untrusted." },
      { variants: ["Machine Certificate"], correct: false, explanation: "Machine cert is for one device." }
    ]
  }),

  q(6063, 6, 5, ["PKI", "SAN"], {
    variants: [
      "Which certificate field allows you to secure multiple specific, different domain names (e.g., 'example.com' and 'example.net') on one cert?",
      "An [admin] needs one cert for 5 different server names. They use the:",
      "SAN stands for:"
    ],
    answerOptions: [
      { variants: ["Subject Alternative Name (SAN)"], correct: true, explanation: "SAN allows multiple specific FQDNs or IPs to be listed on a single certificate." },
      { variants: ["Common Name (CN)"], correct: false, explanation: "CN supports only one name (legacy)." },
      { variants: ["Public Key"], correct: false, explanation: "Key is the math part." },
      { variants: ["Serial Number"], correct: false, explanation: "Serial is the ID." }
    ]
  }),

  q(6064, 6, 5, ["PKI", "Escrow"], {
    variants: [
      "Which concept involves a third party (or the organization) holding a copy of a private key for recovery purposes?",
      "If an employee loses their encryption key, the data can be recovered using:",
      "Key Escrow is primarily used for:"
    ],
    answerOptions: [
      { variants: ["Key Escrow", "Key Recovery"], correct: true, explanation: "Key Escrow stores keys so data can be decrypted if the user key is lost or for legal investigations." },
      { variants: ["Non-Repudiation"], correct: false, explanation: "Escrow effectively breaks non-repudiation (someone else has the key)." },
      { variants: ["Perfect Forward Secrecy"], correct: false, explanation: "PFS avoids stored keys." },
      { variants: ["Digital Signatures"], correct: false, explanation: "Signing keys should NEVER be escrowed." }
    ]
  }),

  q(6065, 6, 5, ["PKI", "Pinning"], {
    variants: [
      "Which security mechanism allows an app to trust ONLY a specific pre-defined certificate, ignoring the system trust store?",
      "To prevent MitM attacks using fraudulent CAs, a mobile app uses:",
      "HTTP Public Key Pinning (HPKP) binds a host to a:"
    ],
    answerOptions: [
      { variants: ["Certificate Pinning"], correct: true, explanation: "Pinning forces the client to accept only a specific public key/cert, blocking spoofing even if the attacker has a valid CA." },
      { variants: ["Stapling"], correct: false, explanation: "Stapling is for OCSP performance." },
      { variants: ["Chaining"], correct: false, explanation: "Chaining is the trust path." },
      { variants: ["Escrow"], correct: false, explanation: "Escrow is storage." }
    ]
  }),

  q(6066, 6, 5, ["PKI", "Stapling"], {
    variants: [
      "Which mechanism allows the web server to query the OCSP responder and send the status to the client, reducing traffic to the CA?",
      "OCSP ________ improves performance and privacy during the handshake.",
      "To avoid the 'OCSP lookup' delay on the client side, enable:"
    ],
    answerOptions: [
      { variants: ["OCSP Stapling"], correct: true, explanation: "The server 'staples' the time-stamped OCSP response to the handshake, so the client doesn't have to query the CA." },
      { variants: ["Pinning"], correct: false, explanation: "Pinning is for trust restriction." },
      { variants: ["Caching"], correct: false, explanation: "Caching is generic." },
      { variants: ["CSR"], correct: false, explanation: "CSR is request." }
    ]
  }),

  q(6067, 6, 5, ["PKI", "Trust Models"], {
    variants: [
      "In a PGP (Pretty Good Privacy) environment, trust is decentralized. This model is:",
      "If I trust Bob, and Bob trusts Alice, I trust Alice. This is:",
      "Which model differs from the hierarchical CA model?"
    ],
    answerOptions: [
      { variants: ["Web of Trust"], correct: true, explanation: "Web of Trust relies on users vetting each other, rather than a central CA." },
      { variants: ["Hierarchical"], correct: false, explanation: "Hierarchical is standard PKI." },
      { variants: ["Bridge"], correct: false, explanation: "Bridge connects two hierarchies." },
      { variants: ["Mesh"], correct: false, explanation: "Mesh is networking." }
    ]
  }),

  q(6068, 6, 5, ["PKI", "Code Signing"], {
    variants: [
      "Which type of certificate is used to verify that software has not been modified since the developer published it?",
      "To prevent Windows from warning 'Unknown Publisher', the developer must use:",
      "Digital signatures on .exe files provide:"
    ],
    answerOptions: [
      { variants: ["Code Signing Certificate"], correct: true, explanation: "Code signing validates the author and integrity of software executables." },
      { variants: ["SSL Certificate"], correct: false, explanation: "SSL is for websites." },
      { variants: ["Root Certificate"], correct: false, explanation: "Root is for CAs." },
      { variants: ["User Certificate"], correct: false, explanation: "User cert is for auth/email." }
    ]
  }),

  q(6069, 6, 5, ["PKI", "Self-Signed"], {
    variants: [
      "A certificate generated by the [device] itself, without a trusted CA, is:",
      "These certs are free but cause browser warnings:",
      "What type of cert is acceptable for internal dev environments but not public web servers?"
    ],
    answerOptions: [
      { variants: ["Self-Signed"], correct: true, explanation: "Self-signed certs provide encryption but no identity trust (unless manually installed)." },
      { variants: ["Wildcard"], correct: false, explanation: "Wildcard can be trusted." },
      { variants: ["EV"], correct: false, explanation: "EV is high trust." },
      { variants: ["Root"], correct: false, explanation: "Root is the trust anchor." }
    ]
  }),

  q(6070, 6, 5, ["PKI", "Expiration"], {
    variants: [
      "If a certificate expires, what happens to the trust?",
      "An [admin] forgets to renew the SSL cert. Browsers will display:",
      "Validity periods are enforced to ensure:"
    ],
    answerOptions: [
      { variants: ["Trust is broken", "Warning/Error"], correct: true, explanation: "Expired certificates are untrusted, causing browser errors." },
      { variants: ["Encryption stops"], correct: false, explanation: "Encryption still works mathematically, but the *trust* is gone." },
      { variants: ["Key changes"], correct: false, explanation: "The key is the same until re-keyed." },
      { variants: ["Revocation"], correct: false, explanation: "Revocation is active; Expiration is passive/time-based." }
    ]
  }),

  q(6071, 6, 3, ["Asymmetric", "Encryption"], {
    variants: [
      "In a PKI, the Private Key is stored on the server. Where is the Public Key stored?",
      "The Public Key is included inside the:",
      "To give someone your Public Key, you send them your:"
    ],
    answerOptions: [
      { variants: ["Certificate", "Digital Certificate"], correct: true, explanation: "The certificate is the vehicle that distributes the Public Key." },
      { variants: ["Private Key"], correct: false, explanation: "Private key stays secret." },
      { variants: ["CRL"], correct: false, explanation: "CRL is a bad list." },
      { variants: ["CSR"], correct: false, explanation: "CSR is the application." }
    ]
  }),

  q(6072, 6, 3, ["Asymmetric", "Math"], {
    variants: [
      "RSA's math is based on factoring primes. ECC's math is based on:",
      "Discrete Logarithm problems over finite fields define:",
      "Which algorithm uses points on a curve to create keys?"
    ],
    answerOptions: [
      { variants: ["Elliptic Curves", "ECC"], correct: true, explanation: "ECC uses the geometry of elliptic curves." },
      { variants: ["Prime Factorization"], correct: false, explanation: "That is RSA." },
      { variants: ["Block Substitution"], correct: false, explanation: "That is AES." },
      { variants: ["XOR"], correct: false, explanation: "That is stream ciphers/One-time pad." }
    ]
  }),

  q(6073, 6, 2, ["Symmetric", "OTP"], {
    variants: [
      "Which is the only cryptographic system that is theoretically unbreakable if used correctly?",
      "A key that is as long as the message, truly random, and used only once describes:",
      "OTP stands for:"
    ],
    answerOptions: [
      { variants: ["One-Time Pad"], correct: true, explanation: "One-Time Pads are mathematically unbreakable because the key is random and never reused." },
      { variants: ["AES-256"], correct: false, explanation: "AES is computationally secure, not theoretically perfect." },
      { variants: ["RSA-4096"], correct: false, explanation: "RSA can be broken with enough power (or Quantum)." },
      { variants: ["Quantum"], correct: false, explanation: "Quantum is the threat, or distribution method." }
    ]
  }),

  q(6074, 6, 6, ["Attack", "Known Plaintext"], {
    variants: [
      "In which attack does the [attacker] have access to both the encrypted text and the original text, trying to derive the key?",
      "The attacker knows 'User:' is always at the start of the packet. This helps them crack the rest. This is:",
      "KPA stands for:"
    ],
    answerOptions: [
      { variants: ["Known Plaintext Attack"], correct: true, explanation: "The attacker uses known parts of the message (headers, greetings) to reverse engineer the key." },
      { variants: ["Chosen Plaintext"], correct: false, explanation: "Chosen means the attacker can inject data." },
      { variants: ["Ciphertext Only"], correct: false, explanation: "Ciphertext only means they have no original text." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force guesses keys." }
    ]
  }),

  q(6075, 6, 4, ["Quantum", "Post-Quantum"], {
    variants: [
      "Which emerging technology poses the biggest threat to current asymmetric algorithms like RSA and ECC?",
      "Shor's Algorithm running on this hardware could break modern PKI:",
      "Post-________ Cryptography is being developed to resist:"
    ],
    answerOptions: [
      { variants: ["Quantum Computing"], correct: true, explanation: "Quantum computers can solve factoring/discrete log problems exponentially faster, breaking RSA/ECC." },
      { variants: ["GPU Mining"], correct: false, explanation: "GPUs crack hashes, but don't break the math." },
      { variants: ["AI"], correct: false, explanation: "AI helps guessing, but Quantum breaks the math." },
      { variants: ["Botnets"], correct: false, explanation: "Botnets do DDoS." }
    ]
  }),

  // ============================================================
  // TOPIC CLUSTER: Wireless & VPN Security (Questions 6076-6100)
  // ============================================================

  q(6076, 6, 2, ["Wireless", "EAP Types"], {
    variants: [
      "Which EAP type requires client-side certificates for the highest security?",
      "For a high-security government Wi-Fi, the [admin] deploys mutual authentication using smart cards. This is:",
      "EAP-TLS differs from PEAP because:"
    ],
    answerOptions: [
      { variants: ["EAP-TLS"], correct: true, explanation: "EAP-TLS requires certificates on BOTH the server and the client (Mutual Auth)." },
      { variants: ["PEAP"], correct: false, explanation: "PEAP uses a server cert only + password." },
      { variants: ["EAP-TTLS"], correct: false, explanation: "Similar to PEAP." },
      { variants: ["EAP-FAST"], correct: false, explanation: "Cisco proprietary." }
    ]
  }),

  q(6077, 6, 2, ["Wireless", "EAP Types"], {
    variants: [
      "Which EAP type builds a TLS tunnel using only a server-side certificate, protecting the user's password inside?",
      "The most common Enterprise Wi-Fi method that uses MSCHAPv2 inside a tunnel is:",
      "If you don't want to manage client certificates, use:"
    ],
    answerOptions: [
      { variants: ["PEAP", "Protected EAP"], correct: true, explanation: "PEAP encrypts the auth process using a server cert, allowing safe use of passwords." },
      { variants: ["EAP-TLS"], correct: false, explanation: "Requires client certs." },
      { variants: ["EAP-MD5"], correct: false, explanation: "Insecure." },
      { variants: ["LEAP"], correct: false, explanation: "Legacy/Insecure." }
    ]
  }),

  q(6078, 6, 6, ["Wireless", "KRACK"], {
    variants: [
      "The 'KRACK' attack targets a vulnerability in which protocol?",
      "Key Reinstallation Attacks exploit the 4-way handshake of:",
      "WPA3 fixed the handshake vulnerability found in:"
    ],
    answerOptions: [
      { variants: ["WPA2"], correct: true, explanation: "KRACK exploits WPA2's 4-way handshake to reset the nonce and decrypt traffic." },
      { variants: ["WEP"], correct: false, explanation: "WEP was broken long before KRACK." },
      { variants: ["WPA3"], correct: false, explanation: "WPA3 uses SAE to prevent this." },
      { variants: ["Open"], correct: false, explanation: "Open has no keys." }
    ]
  }),

  q(6079, 6, 2, ["Wireless", "Enterprise"], {
    variants: [
      "A RADIUS server is required for which Wi-Fi mode?",
      "WPA2-Enterprise is also known as:",
      "802.1X requires a Supplicant, Authenticator, and:"
    ],
    answerOptions: [
      { variants: ["Authentication Server", "RADIUS"], correct: true, explanation: "The backend server validates the credentials." },
      { variants: ["PSK"], correct: false, explanation: "PSK is Personal mode." },
      { variants: ["Captive Portal"], correct: false, explanation: "Portal is web-based." },
      { variants: ["VPN Concentrator"], correct: false, explanation: "VPN is remote access." }
    ]
  }),

  q(6080, 6, 2, ["Wireless", "WPA3 Enterprise"], {
    variants: [
      "WPA3-Enterprise offers an optional high-security mode with 192-bit encryption using:",
      "Government-grade Wi-Fi security (CNSA) requires:",
      "AES-256 in WPA3 is enabled in:"
    ],
    answerOptions: [
      { variants: ["192-bit Security Mode", "CNSA Suite"], correct: true, explanation: "WPA3-Enterprise 192-bit mode uses stronger encryption (GCMP-256) for high-security environments." },
      { variants: ["Personal Mode"], correct: false, explanation: "Personal uses 128-bit." },
      { variants: ["TKIP"], correct: false, explanation: "Legacy." },
      { variants: ["RC4"], correct: false, explanation: "Legacy." }
    ]
  }),

  q(6081, 6, 3, ["VPN", "IKE"], {
    variants: [
      "In IPsec, which protocol handles the initial negotiation and key exchange?",
      "Phase 1 and Phase 2 tunnels are established by:",
      "UDP Port 500 is used by:"
    ],
    answerOptions: [
      { variants: ["IKE", "Internet Key Exchange"], correct: true, explanation: "IKE negotiates the security association (SA) for IPsec." },
      { variants: ["ESP"], correct: false, explanation: "ESP encrypts the data." },
      { variants: ["AH"], correct: false, explanation: "AH authenticates the header." },
      { variants: ["L2TP"], correct: false, explanation: "L2TP is the tunnel, IKE secures it." }
    ]
  }),

  q(6082, 6, 3, ["VPN", "SA"], {
    variants: [
      "An agreement between two IPsec peers on which algorithms to use (e.g., AES + SHA + DH Group 14) is called:",
      "The parameters of the VPN tunnel are defined in the:",
      "SA stands for:"
    ],
    answerOptions: [
      { variants: ["Security Association (SA)"], correct: true, explanation: "The SA defines the cipher suite and keys agreed upon by both VPN peers." },
      { variants: ["SLA"], correct: false, explanation: "SLA is a contract." },
      { variants: ["Certificate"], correct: false, explanation: "Cert is identity." },
      { variants: ["ACL"], correct: false, explanation: "ACL is filter." }
    ]
  }),

  q(6083, 6, 3, ["VPN", "SSL"], {
    variants: [
      "Which VPN type typically uses port 443 and works through most firewalls without config?",
      "Clientless VPNs accessed via a web browser rely on:",
      "OpenVPN is an example of an:"
    ],
    answerOptions: [
      { variants: ["SSL/TLS VPN"], correct: true, explanation: "SSL VPNs use standard HTTPS ports, making them firewall-friendly." },
      { variants: ["IPsec VPN"], correct: false, explanation: "IPsec can be blocked by NAT/Firewalls." },
      { variants: ["PPTP"], correct: false, explanation: "PPTP is insecure." },
      { variants: ["L2TP"], correct: false, explanation: "L2TP is complex." }
    ]
  }),

  q(6084, 6, 3, ["VPN", "Always On"], {
    variants: [
      "A VPN configuration that automatically connects whenever the device detects an internet connection is:",
      "To ensure remote employees are always filtered, [company] enforces:",
      "Which VPN feature prevents split tunneling leaks by forcing connection?"
    ],
    answerOptions: [
      { variants: ["Always-on VPN"], correct: true, explanation: "Always-on ensures the device is secure whenever it has network access." },
      { variants: ["Split Tunnel"], correct: false, explanation: "Split tunnel sends some traffic direct." },
      { variants: ["Clientless"], correct: false, explanation: "Clientless requires user login." },
      { variants: ["Site-to-Site"], correct: false, explanation: "Site-to-Site is for offices." }
    ]
  }),

  q(6085, 6, 2, ["Integrity", "Checksum"], {
    variants: [
      "Which is NOT a cryptographic hash, but a simple error-detection code used in network headers?",
      "Ethernet frames end with an FCS field that uses:",
      "To detect accidental corruption (not malicious tampering), use a:"
    ],
    answerOptions: [
      { variants: ["CRC", "Cyclic Redundancy Check"], correct: true, explanation: "CRC is fast and good for accidental errors, but insecure against intentional tampering." },
      { variants: ["MD5"], correct: false, explanation: "MD5 is crypto hash." },
      { variants: ["SHA"], correct: false, explanation: "SHA is crypto hash." },
      { variants: ["AES"], correct: false, explanation: "AES is encryption." }
    ]
  }),

  q(6086, 6, 1, ["Hash", "Length"], {
    variants: [
      "What is the output length of SHA-256?",
      "Which algorithm produces a 256-bit digest?",
      "SHA-2 creates digests of what size?"
    ],
    answerOptions: [
      { variants: ["256 bits"], correct: true, explanation: "SHA-256 produces a 256-bit fixed-length output." },
      { variants: ["128 bits"], correct: false, explanation: "MD5 is 128-bit." },
      { variants: ["160 bits"], correct: false, explanation: "SHA-1 is 160-bit." },
      { variants: ["512 bits"], correct: false, explanation: "SHA-512 is 512-bit." }
    ]
  }),

  q(6087, 6, 6, ["Attack", "Key Replay"], {
    variants: [
      "Capturing a valid Kerberos ticket and using it to log in later is a:",
      "To prevent ________ attacks, Kerberos relies on time-stamps.",
      "Sending valid data again to trick the system is a:"
    ],
    answerOptions: [
      { variants: ["Replay Attack"], correct: true, explanation: "Replay involves capturing valid auth tokens and using them again." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force guesses." },
      { variants: ["Downgrade"], correct: false, explanation: "Downgrade lowers security." },
      { variants: ["DoS"], correct: false, explanation: "DoS stops service." }
    ]
  }),

  q(6088, 6, 4, ["Advanced", "Quantum"], {
    variants: [
      "QKD (Quantum Key Distribution) uses physics to detect:",
      "If an [attacker] observes the key exchange in a quantum network, the key is ruined. This property is:",
      "Quantum cryptography detects eavesdropping via:"
    ],
    answerOptions: [
      { variants: ["Observation / Eavesdropping"], correct: true, explanation: "In quantum mechanics, observing a particle changes its state, alerting the users to the eavesdropper." },
      { variants: ["Math errors"], correct: false, explanation: "No." },
      { variants: ["Latency"], correct: false, explanation: "No." },
      { variants: ["Hash collisions"], correct: false, explanation: "No." }
    ]
  }),

  q(6089, 6, 5, ["PKI", "OID"], {
    variants: [
      "In a certificate, the string of numbers (e.g., 1.3.6.1.4.1...) that defines policy or usage is the:",
      "An Object Identifier (OID) is used in PKI to:",
      "To define a custom certificate extension, you assign it an:"
    ],
    answerOptions: [
      { variants: ["OID", "Object Identifier"], correct: true, explanation: "OIDs identify specific objects, policies, or algorithms in X.509." },
      { variants: ["CN"], correct: false, explanation: "CN is a name." },
      { variants: ["SAN"], correct: false, explanation: "SAN is a name." },
      { variants: ["Key"], correct: false, explanation: "Key is data." }
    ]
  }),

  q(6090, 6, 6, ["Attack", "Birth"], {
    variants: [
      "A 'Birthday Attack' specifically targets:",
      "Finding collisions in hashing algorithms is easier due to the:",
      "This attack relies on probability theory to break integrity:"
    ],
    answerOptions: [
      { variants: ["Hash Collisions"], correct: true, explanation: "Birthday attacks find collisions faster than brute force." },
      { variants: ["Encryption Keys"], correct: false, explanation: "Keys are brute forced." },
      { variants: ["Passwords"], correct: false, explanation: "Passwords are dictionary attacked." },
      { variants: ["VPN Tunnels"], correct: false, explanation: "VPNs are not hashes." }
    ]
  }),

  q(6091, 6, 4, ["Hardware", "SED"], {
    variants: [
      "A hard drive that handles its own encryption/decryption on the controller is a:",
      "Self-Encrypting Drives (SED) offload crypto from the:",
      "OPAL is a standard for:"
    ],
    answerOptions: [
      { variants: ["SED", "Self-Encrypting Drive"], correct: true, explanation: "SEDs have hardware crypto engines built in." },
      { variants: ["CPU"], correct: false, explanation: "SEDs save CPU cycles." },
      { variants: ["RAID"], correct: false, explanation: "RAID is redundancy." },
      { variants: ["TPM"], correct: false, explanation: "TPM stores keys, SED encrypts data." }
    ]
  }),

  q(6092, 6, 6, ["Attack", "Side Channel"], {
    variants: [
      "Measuring power consumption or electromagnetic emissions to extract keys is a:",
      "An [attacker] listens to the sound of the CPU fan to guess the key. This is:",
      "Attacking the implementation (physics) rather than the algorithm is:"
    ],
    answerOptions: [
      { variants: ["Side Channel Attack"], correct: true, explanation: "Side channels exploit physical leakage (power, sound, time) to infer data." },
      { variants: ["Brute Force"], correct: false, explanation: "Brute force is math." },
      { variants: ["Social Engineering"], correct: false, explanation: "SE is human." },
      { variants: ["Phishing"], correct: false, explanation: "Phishing is email." }
    ]
  }),

  q(6093, 6, 5, ["PKI", "Agent"], {
    variants: [
      "A 'Recovery Agent' in PKI is an individual who can:",
      "If the user loses their key, the Recovery Agent uses the ________ to restore data.",
      "Key Escrow enables access for the:"
    ],
    answerOptions: [
      { variants: ["Recover lost keys"], correct: true, explanation: "The Recovery Agent has authority to retrieve escrowed keys." },
      { variants: ["Revoke certificates"], correct: false, explanation: "That is the CA admin." },
      { variants: ["Issue certificates"], correct: false, explanation: "That is the CA." },
      { variants: ["Audit logs"], correct: false, explanation: "That is the Auditor." }
    ]
  }),

  q(6094, 6, 3, ["SSH", "Keys"], {
    variants: [
      "When setting up SSH keys, which part goes on the server?",
      "The 'Authorized_Keys' file on the server contains the user's:",
      "To login without a password, put your ________ on the remote host."
    ],
    answerOptions: [
      { variants: ["Public Key"], correct: true, explanation: "The server holds the Public Key. The user keeps the Private Key." },
      { variants: ["Private Key"], correct: false, explanation: "Private keys are never shared." },
      { variants: ["Shared Secret"], correct: false, explanation: "SSH keys are asymmetric." },
      { variants: ["Password"], correct: false, explanation: "We are replacing passwords." }
    ]
  }),

  q(6095, 6, 6, ["Attack", "Ransomware"], {
    variants: [
      "Modern ransomware often exfiltrates data before encrypting it. This is called:",
      "Double Extortion involves:",
      "If you have backups, the attacker threatens to ________ your data."
    ],
    answerOptions: [
      { variants: ["Leak / Publish", "Double Extortion"], correct: true, explanation: "Attackers threaten to leak the data publicly if you don't pay, even if you can restore from backup." },
      { variants: ["Delete"], correct: false, explanation: "Deleting is standard." },
      { variants: ["Modify"], correct: false, explanation: "Modification is integrity." },
      { variants: ["Archive"], correct: false, explanation: "Archive is storage." }
    ]
  }),

  q(6096, 6, 1, ["Hashing", "Usage"], {
    variants: [
      "To verify a digital signature, the receiver decrypts the signature to reveal the:",
      "Comparing the decrypted signature hash with the calculated ________ verifies integrity.",
      "A signature matches if the ________ are identical."
    ],
    answerOptions: [
      { variants: ["Hash / Digest"], correct: true, explanation: "The signature is just an encrypted hash. Decrypting it allows comparison with a freshly calculated hash." },
      { variants: ["Private Key"], correct: false, explanation: "Keys verify, they aren't the result." },
      { variants: ["Password"], correct: false, explanation: "Password is unrelated." },
      { variants: ["Certificate"], correct: false, explanation: "Cert holds the key." }
    ]
  }),

  q(6097, 6, 3, ["TLS", "Cipher Suite"], {
    variants: [
      "In a cipher suite like 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', what does ECDHE do?",
      "Which part of the suite handles Key Exchange?",
      "Which part ensures Forward Secrecy?"
    ],
    answerOptions: [
      { variants: ["Key Exchange"], correct: true, explanation: "ECDHE handles the secure exchange of the session keys." },
      { variants: ["Encryption"], correct: false, explanation: "AES is encryption." },
      { variants: ["Hashing"], correct: false, explanation: "SHA is hashing." },
      { variants: ["Authentication"], correct: false, explanation: "RSA is auth." }
    ]
  }),

  q(6098, 6, 3, ["TLS", "Cipher Suite"], {
    variants: [
      "In 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', what does RSA do?",
      "Which part of the suite authenticates the server's identity?",
      "The certificate type is determined by:"
    ],
    answerOptions: [
      { variants: ["Authentication"], correct: true, explanation: "RSA (or ECDSA) is used to sign the exchange, proving the server's identity." },
      { variants: ["Encryption"], correct: false, explanation: "AES is encryption." },
      { variants: ["Key Exchange"], correct: false, explanation: "ECDHE is exchange." },
      { variants: ["Hashing"], correct: false, explanation: "SHA is hashing." }
    ]
  }),

  q(6099, 6, 3, ["TLS", "Cipher Suite"], {
    variants: [
      "In 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', what does AES_128_GCM do?",
      "Which part of the suite encrypts the actual application data?",
      "The symmetric bulk cipher is:"
    ],
    answerOptions: [
      { variants: ["Bulk Encryption"], correct: true, explanation: "AES GCM encrypts the data stream." },
      { variants: ["Key Exchange"], correct: false, explanation: "ECDHE is exchange." },
      { variants: ["Integrity"], correct: false, explanation: "SHA is hash (though GCM does integrity too)." },
      { variants: ["Auth"], correct: false, explanation: "RSA is auth." }
    ]
  }),

  q(6100, 6, 6, ["Attack", "POODLE"], {
    variants: [
      "Which attack exploited fallback to SSL 3.0 to break encryption?",
      "POODLE targets which protocol?",
      "To prevent POODLE, you must disable:"
    ],
    answerOptions: [
      { variants: ["SSL 3.0"], correct: true, explanation: "POODLE (Padding Oracle) exploited weaknesses in the legacy SSL 3.0 protocol." },
      { variants: ["TLS 1.2"], correct: false, explanation: "TLS 1.2 is secure against POODLE." },
      { variants: ["SSH"], correct: false, explanation: "SSH is different." },
      { variants: ["IPsec"], correct: false, explanation: "IPsec is different." }
    ]
  }),

  // --- DOMAIN 7: IAM & ADMIN ---
// ==========================================
// DOMAIN 7: IAM & ADMIN (50Q - Part 1)
// ==========================================

  // --- TOPIC: Authentication Protocols ---

  q(7001, 7, 1, ["Auth", "Kerberos"], {
    variants: [
      "Which authentication protocol uses time-stamped 'tickets' to prevent replay attacks and is the default for Active Directory?",
      "An [admin] investigates a login issue and sees a 'TGT' error. Which protocol is in use?",
      "The default authentication protocol for Windows domains that relies on a KDC is:"
    ],
    answerOptions: [
      { variants: ["Kerberos"], correct: true, explanation: "Kerberos uses time-stamped tickets (TGT/ST) issued by a Key Distribution Center (KDC) to authenticate users." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS is for network access (VPN/Wi-Fi)." },
      { variants: ["TACACS+"], correct: false, explanation: "TACACS+ is for device administration." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is for directory queries." }
    ]
  }),

  q(7002, 7, 2, ["Auth", "Biometric"], {
    variants: [
      "A fingerprint scan falls under which category of authentication factors?",
      "Facial recognition and retina scans are examples of:",
      "Which authentication factor relies on a unique physical characteristic of the [user]?"
    ],
    answerOptions: [
      { variants: ["Something You Are", "Inherence"], correct: true, explanation: "Biometrics (fingerprint, face, iris) are intrinsic physical traits of the user (Inherence)." },
      { variants: ["Something You Know"], correct: false, explanation: "Knowledge is passwords/PINs." },
      { variants: ["Something You Have"], correct: false, explanation: "Possession is tokens/cards." },
      { variants: ["Somewhere You Are"], correct: false, explanation: "Location is GPS/IP." }
    ]
  }),

  q(7003, 7, 1, ["Auth", "TACACS+"], {
    variants: [
      "Which Cisco-proprietary protocol separates Authentication, Authorization, and Accounting (AAA) and encrypts the entire payload?",
      "An [admin] needs granular command-by-command authorization for router management. Which protocol is best?",
      "Unlike RADIUS, which uses UDP and only encrypts the password, this protocol uses TCP and encrypts everything:"
    ],
    answerOptions: [
      { variants: ["TACACS+", "Terminal Access Controller Access-Control System Plus"], correct: true, explanation: "TACACS+ separates AAA functions, uses TCP 49, and encrypts the entire packet body." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS combines Auth/AuthZ and only encrypts the password." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos is for domain auth." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is a directory protocol." }
    ]
  }),

  q(7004, 7, 1, ["Auth", "RADIUS"], {
    variants: [
      "RADIUS typically uses which transport protocol and ports?",
      "To allow 802.1X authentication traffic through a firewall, which UDP ports must be open?",
      "An [admin] configures a VPN to authenticate against a central server on port 1812. This is:"
    ],
    answerOptions: [
      { variants: ["UDP 1812/1813", "UDP 1645/1646"], correct: true, explanation: "Standard RADIUS uses UDP 1812 (Auth) and 1813 (Acct). Legacy ports are 1645/1646." },
      { variants: ["TCP 443"], correct: false, explanation: "HTTPS." },
      { variants: ["TCP 49"], correct: false, explanation: "TACACS+." },
      { variants: ["UDP 53"], correct: false, explanation: "DNS." }
    ]
  }),

  q(7005, 7, 4, ["AD", "Structure"], {
    variants: [
      "In Active Directory, which container is the smallest scope to which Group Policy can be applied?",
      "To apply a specific wallpaper setting to only the 'Sales' computers, an [admin] should place them in an:",
      "Users and computers are organized into containers called:"
    ],
    answerOptions: [
      { variants: ["Organizational Unit (OU)"], correct: true, explanation: "OUs are containers within a domain used to organize objects and apply Group Policies." },
      { variants: ["Group"], correct: false, explanation: "Groups are for permissions, not Group Policy linking." },
      { variants: ["Folder"], correct: false, explanation: "Folders are generic containers." },
      { variants: ["User"], correct: false, explanation: "A user is a leaf object." }
    ]
  }),

  q(7006, 7, 1, ["Auth", "SSO"], {
    variants: [
      "Which technology allows a [user] to log in once and access multiple different applications without re-entering credentials?",
      "Reducing password fatigue by using one set of credentials for email, file shares, and HR apps is:",
      "An [admin] implements Okta or Azure AD to provide:"
    ],
    answerOptions: [
      { variants: ["Single Sign-On (SSO)"], correct: true, explanation: "SSO allows a user to authenticate once and gain access to multiple resources." },
      { variants: ["MFA"], correct: false, explanation: "MFA adds security steps." },
      { variants: ["VPN"], correct: false, explanation: "VPN provides connectivity." },
      { variants: ["DAC"], correct: false, explanation: "DAC is access control." }
    ]
  }),

  q(7007, 7, 2, ["Auth", "Factors"], {
    variants: [
      "Using a Smart Card or RSA Token is an example of which authentication factor?",
      "To log in, the [user] must physically plug in a YubiKey. This represents:",
      "Possession of a hardware device for auth is:"
    ],
    answerOptions: [
      { variants: ["Something You Have", "Possession"], correct: true, explanation: "Physical tokens, smart cards, and phones are 'Something You Have'." },
      { variants: ["Something You Know"], correct: false, explanation: "Passwords/PINs." },
      { variants: ["Something You Are"], correct: false, explanation: "Biometrics." },
      { variants: ["Somewhere You Are"], correct: false, explanation: "Location." }
    ]
  }),

  q(7008, 7, 5, ["Linux", "Permissions"], {
    variants: [
      "Which Linux command is used to change the read/write/execute permissions of a file?",
      "An [admin] needs to make a script executable. They run:",
      "To set a file to '755', use:"
    ],
    answerOptions: [
      { variants: ["chmod", "Change Mode"], correct: true, explanation: "chmod modifies the file mode bits (permissions)." },
      { variants: ["chown"], correct: false, explanation: "chown changes the owner." },
      { variants: ["ls"], correct: false, explanation: "ls lists files." },
      { variants: ["pwd"], correct: false, explanation: "pwd shows directory." }
    ]
  }),

  q(7009, 7, 5, ["Linux", "Permissions"], {
    variants: [
      "What does the permission '777' represent in the Linux file system?",
      "If a file has 'rwxrwxrwx' permissions, who can modify it?",
      "Why is 'chmod 777' generally considered insecure?"
    ],
    answerOptions: [
      { variants: ["Full Read/Write/Execute for Everyone"], correct: true, explanation: "7 (rwx) for Owner, Group, and Others means anyone can do anything to the file." },
      { variants: ["Read Only for Everyone"], correct: false, explanation: "That would be 444." },
      { variants: ["No Access"], correct: false, explanation: "That would be 000." },
      { variants: ["Root Only"], correct: false, explanation: "That would depend on ownership, not just mode." }
    ]
  }),

  q(7010, 7, 1, ["Auth", "Federation"], {
    variants: [
      "Which XML-based standard is commonly used to exchange authentication and authorization data in Federated systems?",
      "When a [user] logs into a SaaS app using their corporate credentials, the IdP sends a token using:",
      "Shibboleth and ADFS heavily rely on this protocol:"
    ],
    answerOptions: [
      { variants: ["SAML", "Security Assertion Markup Language"], correct: true, explanation: "SAML is the XML-based standard for federated identity assertions." },
      { variants: ["OIDC"], correct: false, explanation: "OIDC uses JSON." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS is UDP." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos uses binary tickets." }
    ]
  }),

  q(7011, 7, 2, ["Policy", "Password"], {
    variants: [
      "Which password policy setting prevents a [user] from cycling between their last 5 passwords?",
      "To ensure users pick unique new passwords when theirs expires, enforce:",
      "An [admin] sets 'Enforce Password History' to 24. What does this do?"
    ],
    answerOptions: [
      { variants: ["Password History"], correct: true, explanation: "Password History remembers previous hashes and blocks their reuse for a set number of changes." },
      { variants: ["Password Age"], correct: false, explanation: "Age forces the change, History enforces uniqueness." },
      { variants: ["Length"], correct: false, explanation: "Length is strength." },
      { variants: ["Complexity"], correct: false, explanation: "Complexity is character types." }
    ]
  }),

  q(7012, 7, 3, ["Permissions", "Logic"], {
    variants: [
      "If a [user] is in the 'Sales' group (Read Access) and the 'Managers' group (Write Access), what is their effective permission?",
      "In Windows NTFS, 'Allow' permissions are cumulative. If you have Read + Write, what can you do?",
      "Unless there is a 'Deny', combining group permissions results in:"
    ],
    answerOptions: [
      { variants: ["Read and Write", "Least Restrictive"], correct: true, explanation: "Allow permissions combine. Read + Write = Read & Write. (Only Deny overrides Allow)." },
      { variants: ["Read Only"], correct: false, explanation: "Incorrect." },
      { variants: ["Write Only"], correct: false, explanation: "Incorrect." },
      { variants: ["No Access"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(7013, 7, 4, ["AD", "Structure"], {
    variants: [
      "What is the top-level container in an Active Directory structure that creates a security boundary?",
      "Multiple domain trees can be combined into a single:",
      "The ultimate boundary for AD schema and configuration is the:"
    ],
    answerOptions: [
      { variants: ["Forest"], correct: true, explanation: "The Forest is the top-level container. Domains share a schema within a Forest." },
      { variants: ["Tree"], correct: false, explanation: "A Tree is a collection of domains." },
      { variants: ["Domain"], correct: false, explanation: "A Domain is a logical boundary inside a forest." },
      { variants: ["Site"], correct: false, explanation: "A Site is a physical topology boundary." }
    ]
  }),

  q(7014, 7, 2, ["Biometric", "Error"], {
    variants: [
      "In biometrics, what is a False Rejection Rate (FRR)?",
      "A legitimate [user] tries to scan their finger but the system denies them. This is:",
      "Type I error refers to:"
    ],
    answerOptions: [
      { variants: ["The system denies an authorized user"], correct: true, explanation: "FRR (Type I) is when the system fails to recognize a valid user." },
      { variants: ["The system grants an unauthorized user"], correct: false, explanation: "That is FAR (Type II)." },
      { variants: ["The scan is too slow"], correct: false, explanation: "Performance issue." },
      { variants: ["The scanner is broken"], correct: false, explanation: "Hardware failure." }
    ]
  }),

  q(7015, 7, 1, ["Protocol", "Directory"], {
    variants: [
      "Which protocol is used to query and modify data in directory services like Active Directory?",
      "To search for a user's phone number in the corporate address book, an app uses:",
      "TCP Port 389 is associated with:"
    ],
    answerOptions: [
      { variants: ["LDAP", "Lightweight Directory Access Protocol"], correct: true, explanation: "LDAP is the standard protocol for interacting with directory services." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is for device monitoring." },
      { variants: ["SMTP"], correct: false, explanation: "SMTP is email." },
      { variants: ["HTTP"], correct: false, explanation: "HTTP is web." }
    ]
  }),

  q(7016, 7, 2, ["Policy", "Account"], {
    variants: [
      "Which policy setting defends against online brute force attacks by disabling an account after too many failed attempts?",
      "To stop an [attacker] from guessing passwords indefinitely, enable:",
      "After 3 bad attempts, the user must wait 15 minutes. This is:"
    ],
    answerOptions: [
      { variants: ["Account Lockout"], correct: true, explanation: "Locking the account prevents further guessing attempts." },
      { variants: ["Complexity"], correct: false, explanation: "Complexity makes guessing harder, but doesn't stop the attempts." },
      { variants: ["Password History"], correct: false, explanation: "History prevents reuse." },
      { variants: ["Expiration"], correct: false, explanation: "Expiration forces changes." }
    ]
  }),

  q(7017, 7, 5, ["Linux", "Security"], {
    variants: [
      "In a Linux system, which file securely stores the encrypted password hashes?",
      "While /etc/passwd is world-readable, this file is readable only by root:",
      "To crack Linux passwords, an [attacker] needs to steal the:"
    ],
    answerOptions: [
      { variants: ["/etc/shadow"], correct: true, explanation: "/etc/shadow stores the hashes and is restricted. /etc/passwd stores user info and is public." },
      { variants: ["/etc/passwd"], correct: false, explanation: "Public user info." },
      { variants: ["/etc/group"], correct: false, explanation: "Group info." },
      { variants: ["/root"], correct: false, explanation: "Root's home directory." }
    ]
  }),

  q(7018, 7, 1, ["Auth", "Time"], {
    variants: [
      "Why is accurate time synchronization (NTP) critical for Kerberos authentication?",
      "An [admin] sees Kerberos ticket failures. The server time is off by 10 minutes. Why does this matter?",
      "Replay attacks in Kerberos are prevented by using:"
    ],
    answerOptions: [
      { variants: ["To prevent Replay Attacks", "Time-stamped Tickets"], correct: true, explanation: "Kerberos tickets are valid only for a short window (e.g., 5 mins) to prevent attackers from capturing and replaying them later." },
      { variants: ["To encrypt the password"], correct: false, explanation: "Encryption relies on keys, not time." },
      { variants: ["To compress the ticket"], correct: false, explanation: "Time doesn't compress." },
      { variants: ["To log the login"], correct: false, explanation: "Logging needs time, but Auth *fails* without it." }
    ]
  }),

  q(7019, 7, 4, ["AD", "Admin"], {
    variants: [
      "What tool allows [admin]s to deploy configuration settings (like wallpaper or password policies) to thousands of computers at once?",
      "In an Active Directory domain, how do you enforce a screen lock timeout on all laptops?",
      "Centralized management of Windows settings is done via:"
    ],
    answerOptions: [
      { variants: ["Group Policy Object (GPO)", "Group Policy"], correct: true, explanation: "GPOs allow centralized configuration management for domain-joined devices." },
      { variants: ["Registry Editor"], correct: false, explanation: "Registry is local/manual." },
      { variants: ["Script"], correct: false, explanation: "Scripts work but GPO is the native tool." },
      { variants: ["Manual Config"], correct: false, explanation: "Not scalable." }
    ]
  }),

  q(7020, 7, 3, ["Permissions", "Files"], {
    variants: [
      "When you move a file from one NTFS volume to a different volume, what happens to its permissions?",
      "Moving a file from C: to D: acts like a 'Copy then Delete'. The file inherits permissions from:",
      "Does a file keep its original ACLs when moved to a new drive?"
    ],
    answerOptions: [
      { variants: ["Inherits from new parent", "Resets permissions"], correct: true, explanation: "Moving across volumes creates a new file, so it inherits the permissions of the destination folder." },
      { variants: ["Keeps original permissions"], correct: false, explanation: "This only happens when moving within the *same* volume." },
      { variants: ["Becomes public"], correct: false, explanation: "Not necessarily." },
      { variants: ["Becomes encrypted"], correct: false, explanation: "Only if the folder is encrypted." }
    ]
  }),

  q(7021, 7, 2, ["Auth", "Context"], {
    variants: [
      "Allowing login only when the [user] is physically located in the office building is an example of:",
      "An [admin] restricts VPN access to specific countries. This is:",
      "Using Time, Location, or Device Health to make auth decisions is:"
    ],
    answerOptions: [
      { variants: ["Context-aware Authentication"], correct: true, explanation: "Context-aware auth looks at the environment (context) of the request, not just the password." },
      { variants: ["MFA"], correct: false, explanation: "MFA is factors." },
      { variants: ["SSO"], correct: false, explanation: "SSO is single login." },
      { variants: ["Federation"], correct: false, explanation: "Federation is trust." }
    ]
  }),

  q(7022, 7, 1, ["Auth", "Federation"], {
    variants: [
      "Which protocol is commonly used for 'Social Logins' (e.g., Log in with Google)?",
      "A consumer app wants to let users log in with Facebook. They implement:",
      "OAuth 2.0 and OpenID Connect (OIDC) are typically used for:"
    ],
    answerOptions: [
      { variants: ["OAuth / OIDC"], correct: true, explanation: "OAuth/OIDC is the standard for modern web/mobile app federation." },
      { variants: ["SAML"], correct: false, explanation: "SAML is mostly Enterprise/Legacy web." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is internal directory." },
      { variants: ["RADIUS"], correct: false, explanation: "RADIUS is network access." }
    ]
  }),

  q(7023, 7, 5, ["Linux", "Permissions"], {
    variants: [
      "In Linux octal permissions, what is the numeric value for 'Read'?",
      "To give 'Read and Execute' (r-x), you add 4 and 1 to get:",
      "r = 4, w = 2, x = ?"
    ],
    answerOptions: [
      { variants: ["4"], correct: true, explanation: "Read=4, Write=2, Execute=1." },
      { variants: ["2"], correct: false, explanation: "Write." },
      { variants: ["1"], correct: false, explanation: "Execute." },
      { variants: ["7"], correct: false, explanation: "All." }
    ]
  }),

  q(7024, 7, 2, ["Biometric", "Accuracy"], {
    variants: [
      "Which biometric factor is considered the most accurate and unique, but is often viewed as intrusive?",
      "Scanning the blood vessel pattern in the eye is:",
      "Which has a lower error rate: Fingerprint or Retina?"
    ],
    answerOptions: [
      { variants: ["Retina / Iris Scan"], correct: true, explanation: "Eye scans are extremely unique and stable, but require close contact (intrusive)." },
      { variants: ["Fingerprint"], correct: false, explanation: "Fingerprints can be worn down." },
      { variants: ["Voice"], correct: false, explanation: "Voice can change." },
      { variants: ["Face"], correct: false, explanation: "Face changes with age/glasses." }
    ]
  }),

  q(7025, 7, 1, ["Auth", "Network"], {
    variants: [
      "IEEE 802.1X is a standard used for what purpose?",
      "To prevent someone from plugging into a lobby jack and getting on the network, enable:",
      "Port-based Network Access Control uses which standard?"
    ],
    answerOptions: [
      { variants: ["Port-based Network Access Control"], correct: true, explanation: "802.1X authenticates devices before the switch port opens." },
      { variants: ["Wireless Speed"], correct: false, explanation: "802.11 is speed." },
      { variants: ["Encryption"], correct: false, explanation: "802.1X is the auth framework, not the encryption itself." },
      { variants: ["Routing"], correct: false, explanation: "Routing is L3." }
    ]
  }),

  q(7026, 7, 2, ["Biometric", "Error"], {
    variants: [
      "What is a Type II Biometric Error?",
      "The system grants access to an unauthorized [attacker]. This is a:",
      "Which is worse: False Rejection or False Acceptance?"
    ],
    answerOptions: [
      { variants: ["False Acceptance Rate (FAR)"], correct: true, explanation: "FAR (Type II) is a security breach—the system accepted an impostor." },
      { variants: ["False Rejection Rate (FRR)"], correct: false, explanation: "FRR (Type I) is a usability issue." },
      { variants: ["Crossover Error"], correct: false, explanation: "CER is the balance point." },
      { variants: ["System Crash"], correct: false, explanation: "Crash is failure." }
    ]
  }),

  q(7027, 7, 1, ["Auth", "Kerberos"], {
    variants: [
      "In Kerberos, what is the TGT?",
      "After a successful login, the KDC gives the [user] a:",
      "To request a Service Ticket for a file server, the client presents the:"
    ],
    answerOptions: [
      { variants: ["Ticket Granting Ticket"], correct: true, explanation: "The TGT is the master ticket used to request access to specific services without logging in again." },
      { variants: ["Time Granting Token"], correct: false, explanation: "Incorrect." },
      { variants: ["Total Group Trust"], correct: false, explanation: "Incorrect." },
      { variants: ["Token Generated Time"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(7028, 7, 5, ["Linux", "Admin"], {
    variants: [
      "Which command changes the owner of a file in Linux?",
      "To give ownership of 'file.txt' to user 'bob', an [admin] runs:",
      "chown stands for:"
    ],
    answerOptions: [
      { variants: ["chown", "Change Owner"], correct: true, explanation: "chown user:group file changes ownership." },
      { variants: ["chmod"], correct: false, explanation: "chmod changes permissions." },
      { variants: ["useradd"], correct: false, explanation: "useradd creates users." },
      { variants: ["sudo"], correct: false, explanation: "sudo runs as root." }
    ]
  }),

  q(7029, 7, 3, ["Permissions", "Logic"], {
    variants: [
      "In a permission conflict between an 'Allow' rule and a 'Deny' rule, which one typically takes precedence?",
      "A [user] is in 'HR' (Allow Read) and 'Temp' (Deny Read). Can they read the file?",
      "Explicit Deny ________ Explicit Allow."
    ],
    answerOptions: [
      { variants: ["Deny overrides Allow"], correct: true, explanation: "In most ACLs and File Systems, an explicit Deny beats any Allow." },
      { variants: ["Allow overrides Deny"], correct: false, explanation: "This would be insecure." },
      { variants: ["Last rule wins"], correct: false, explanation: "Not for file permissions (usually)." },
      { variants: ["First rule wins"], correct: false, explanation: "True for Firewalls, but 'Deny overrides' is the rule for Permissions." }
    ]
  }),

  q(7030, 7, 2, ["Policy", "Password"], {
    variants: [
      "To ensure high entropy, what is the modern recommendation for minimum password length?",
      "NIST suggests prioritizing length over complexity. What is a good minimum?",
      "A 7-character complex password is weaker than a:"
    ],
    answerOptions: [
      { variants: ["12+ characters", "Length"], correct: true, explanation: "Length adds exponential difficulty to brute force. 12-14 is the modern baseline." },
      { variants: ["8 characters"], correct: false, explanation: "8 is too short for modern GPUs." },
      { variants: ["4 characters"], correct: false, explanation: "Way too short." },
      { variants: ["6 characters"], correct: false, explanation: "Too short." }
    ]
  }),

  q(7031, 7, 1, ["AAA", "Concept"], {
    variants: [
      "In AAA, which component is responsible for recording user actions for auditing?",
      "Logs showing who logged in and what commands they ran fall under:",
      "Authentication, Authorization, and ________."
    ],
    answerOptions: [
      { variants: ["Accounting"], correct: true, explanation: "Accounting tracks usage (time, data, commands) for billing or auditing." },
      { variants: ["Authentication"], correct: false, explanation: "Authn is identity." },
      { variants: ["Authorization"], correct: false, explanation: "Authz is permission." },
      { variants: ["Aggregation"], correct: false, explanation: "Not part of AAA." }
    ]
  }),

  q(7032, 7, 2, ["MFA", "Factors"], {
    variants: [
      "Which option is an example of 'something you have'?",
      "A YubiKey or Google Authenticator app represents which factor?",
      "Possession factor relies on:"
    ],
    answerOptions: [
      { variants: ["Hardware Token", "Smart Phone"], correct: true, explanation: "You physically possess the token or phone." },
      { variants: ["PIN"], correct: false, explanation: "Knowledge." },
      { variants: ["Password"], correct: false, explanation: "Knowledge." },
      { variants: ["Maiden Name"], correct: false, explanation: "Knowledge." }
    ]
  }),

  q(7033, 7, 1, ["RADIUS", "Use Case"], {
    variants: [
      "RADIUS is MOST commonly used for:",
      "When a [user] connects to Enterprise Wi-Fi, the AP talks to a:",
      "Centralizing VPN authentication usually involves:"
    ],
    answerOptions: [
      { variants: ["Network Access Control", "VPN/Wi-Fi Auth"], correct: true, explanation: "RADIUS handles AAA for network access scenarios." },
      { variants: ["Email Retrieval"], correct: false, explanation: "IMAP." },
      { variants: ["File Transfer"], correct: false, explanation: "FTP." },
      { variants: ["Time Sync"], correct: false, explanation: "NTP." }
    ]
  }),

  q(7034, 7, 1, ["TACACS+", "Admin"], {
    variants: [
      "Compared to RADIUS, TACACS+ is often preferred for network [device] administration because it:",
      "For granular control over which commands a router admin can run, use:",
      "TACACS+ uses TCP and:"
    ],
    answerOptions: [
      { variants: ["Separates AAA functions", "Encrypts payload"], correct: true, explanation: "TACACS+ allows Authorization to be handled separately from Authentication, ideal for command sets." },
      { variants: ["Uses UDP"], correct: false, explanation: "RADIUS is UDP." },
      { variants: ["Requires no secret"], correct: false, explanation: "Both need secrets." },
      { variants: ["Is faster"], correct: false, explanation: "TCP is slower." }
    ]
  }),

  q(7035, 7, 4, ["AD", "DNS"], {
    variants: [
      "A domain-joined Windows client cannot locate a domain controller. Which dependency is MOST likely failing?",
      "Active Directory relies on SRV records in which protocol to find services?",
      "If DNS is down, AD logins fail because:"
    ],
    answerOptions: [
      { variants: ["DNS", "SRV Records"], correct: true, explanation: "Clients query DNS for _ldap._tcp SRV records to find a DC." },
      { variants: ["NTP"], correct: false, explanation: "NTP affects Kerberos ticket validity, but not locating the server." },
      { variants: ["FTP"], correct: false, explanation: "FTP is files." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is monitoring." }
    ]
  }),

  q(7036, 7, 2, ["Policy", "MFA"], {
    variants: [
      "Which control is MOST effective at reducing risk from stolen passwords?",
      "If a hacker steals a password but cannot log in, the user likely has:",
      "Enabling ________ stops 99% of automated credential attacks."
    ],
    answerOptions: [
      { variants: ["Multi-Factor Authentication (MFA)"], correct: true, explanation: "MFA requires a second factor (like a phone), so a stolen password alone is useless." },
      { variants: ["Account Lockout"], correct: false, explanation: "Lockout helps brute force, not stolen creds." },
      { variants: ["Shorter Passwords"], correct: false, explanation: "Bad idea." },
      { variants: ["Shared Accounts"], correct: false, explanation: "Bad idea." }
    ]
  }),

  q(7037, 7, 1, ["SSO", "Tokens"], {
    variants: [
      "A [user] logs into an identity provider and then accesses multiple SaaS apps without re-entering credentials. This is:",
      "Authenticating once to access Gmail, Slack, and Zoom is:",
      "SSO stands for:"
    ],
    answerOptions: [
      { variants: ["Single Sign-On"], correct: true, explanation: "SSO provides a seamless experience across applications." },
      { variants: ["NAT"], correct: false, explanation: "NAT is network." },
      { variants: ["DHCP"], correct: false, explanation: "DHCP is IP." },
      { variants: ["Spanning Tree"], correct: false, explanation: "STP is switching." }
    ]
  }),

  q(7038, 7, 1, ["Federation", "OIDC"], {
    variants: [
      "OpenID Connect (OIDC) is built on top of which framework?",
      "OIDC adds authentication to the authorization capabilities of:",
      "Modern app authentication relies on:"
    ],
    answerOptions: [
      { variants: ["OAuth 2.0"], correct: true, explanation: "OAuth 2.0 handles authorization; OIDC adds the identity layer." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos is legacy/LAN." },
      { variants: ["RIP"], correct: false, explanation: "RIP is routing." },
      { variants: ["SNMP"], correct: false, explanation: "SNMP is monitoring." }
    ]
  }),

  q(7039, 7, 3, ["Permissions", "Windows"], {
    variants: [
      "On NTFS, which permission type is MOST important to control data exposure when users change teams?",
      "Instead of assigning rights to users, assign them to:",
      "RBAC implies using:"
    ],
    answerOptions: [
      { variants: ["Group-based permissions"], correct: true, explanation: "Assigning rights to Groups (Roles) makes management easier when users change jobs." },
      { variants: ["Explicit Deny"], correct: false, explanation: "Use Deny sparingly." },
      { variants: ["Everyone:Full Control"], correct: false, explanation: "Insecure." },
      { variants: ["No auditing"], correct: false, explanation: "Bad practice." }
    ]
  }),

  q(7040, 7, 5, ["Linux", "Admin"], {
    variants: [
      "Which Linux command shows current [user] and group IDs?",
      "To check which groups you belong to in the terminal, type:",
      "Troubleshooting permission issues often starts with:"
    ],
    answerOptions: [
      { variants: ["id"], correct: true, explanation: "'id' prints the UID, GID, and group memberships." },
      { variants: ["ps"], correct: false, explanation: "ps shows processes." },
      { variants: ["grep"], correct: false, explanation: "grep searches text." },
      { variants: ["top"], correct: false, explanation: "top shows resources." }
    ]
  }),

  q(7041, 7, 2, ["Access", "PAM"], {
    variants: [
      "A system that provides time-limited admin access with approvals and session recording is:",
      "To prevent [admin]s from knowing the root password, they check it out from a:",
      "PAM stands for:"
    ],
    answerOptions: [
      { variants: ["Privileged Access Management (PAM)"], correct: true, explanation: "PAM vaults secure high-level credentials and monitor their use." },
      { variants: ["DNS Caching"], correct: false, explanation: "DNS." },
      { variants: ["VLAN Hopping"], correct: false, explanation: "Attack." },
      { variants: ["Packet Shaping"], correct: false, explanation: "QoS." }
    ]
  }),

  q(7042, 7, 3, ["Policy", "Accounts"], {
    variants: [
      "Which practice BEST improves accountability for administrative actions on network devices?",
      "Every [admin] should have their own:",
      "Shared accounts destroy:"
    ],
    answerOptions: [
      { variants: ["Named Accounts", "Individual Accounts"], correct: true, explanation: "Named accounts ensure logs can be traced back to a specific human." },
      { variants: ["Shared Accounts"], correct: false, explanation: "Shared accounts hide who did what." },
      { variants: ["Disable Syslog"], correct: false, explanation: "Bad idea." },
      { variants: ["Use Telnet"], correct: false, explanation: "Insecure." }
    ]
  }),

  q(7043, 7, 2, ["RADIUS", "Security"], {
    variants: [
      "RADIUS uses a shared secret primarily to:",
      "The pre-shared key between the Network Access Server (NAS) and the RADIUS server is for:",
      "Trust between the Switch and the RADIUS server is established by:"
    ],
    answerOptions: [
      { variants: ["Protect/Authenticate messages", "Message Integrity"], correct: true, explanation: "The shared secret is used to hash the password field and verify the sender." },
      { variants: ["Encrypt the entire payload"], correct: false, explanation: "RADIUS does NOT encrypt the whole payload (TACACS+ does)." },
      { variants: ["Replace certificates"], correct: false, explanation: "Certs are different." },
      { variants: ["Provide DHCP"], correct: false, explanation: "DHCP is different." }
    ]
  }),

  q(7044, 7, 3, ["LDAP", "Security"], {
    variants: [
      "Which is the BEST option to protect LDAP directory queries in transit?",
      "LDAP sends data in cleartext. To fix this, use:",
      "Port 636 is used for:"
    ],
    answerOptions: [
      { variants: ["LDAPS", "LDAP over TLS"], correct: true, explanation: "LDAPS wraps LDAP in SSL/TLS to protect credentials and data." },
      { variants: ["HTTP"], correct: false, explanation: "Web." },
      { variants: ["Telnet"], correct: false, explanation: "Insecure." },
      { variants: ["FTP"], correct: false, explanation: "File transfer." }
    ]
  }),

  q(7045, 7, 2, ["Auth", "MFA"], {
    variants: [
      "A push notification that the [user] approves on their phone is MOST commonly considered which factor?",
      "Mobile-based MFA is usually:",
      "Possession of the registered device is:"
    ],
    answerOptions: [
      { variants: ["Something You Have"], correct: true, explanation: "You must HAVE the phone to approve the push." },
      { variants: ["Something You Know"], correct: false, explanation: "PIN." },
      { variants: ["Something You Are"], correct: false, explanation: "Biometric." },
      { variants: ["Somewhere You Are"], correct: false, explanation: "Location." }
    ]
  }),

  q(7046, 7, 3, ["Windows", "GPO"], {
    variants: [
      "If a [user]’s security settings are controlled by a domain policy and keep reverting, the likely cause is:",
      "Why can't the local admin change the wallpaper permanently?",
      "Central enforcement is overriding local settings via:"
    ],
    answerOptions: [
      { variants: ["Group Policy Object (GPO)"], correct: true, explanation: "GPOs refresh periodically (every 90 mins) and overwrite local settings." },
      { variants: ["Local Admin Rights"], correct: false, explanation: "Admin rights would allow change, but GPO reverts it." },
      { variants: ["DNS Recursion"], correct: false, explanation: "DNS is networking." },
      { variants: ["VLAN Mismatch"], correct: false, explanation: "VLAN is connectivity." }
    ]
  }),

  q(7047, 7, 3, ["Access Control", "Models"], {
    variants: [
      "Granting permissions based on job role (e.g., Help Desk, Network Admin) is:",
      "An [admin] creates a 'Nurses' group and assigns it to the EMR app. This is:",
      "RBAC stands for:"
    ],
    answerOptions: [
      { variants: ["RBAC", "Role-Based Access Control"], correct: true, explanation: "Permissions follow the role, not the person." },
      { variants: ["DAC"], correct: false, explanation: "Owner based." },
      { variants: ["MAC"], correct: false, explanation: "Label based." },
      { variants: ["NAT"], correct: false, explanation: "Network Address Translation." }
    ]
  }),

  q(7048, 7, 4, ["Access Control", "Models"], {
    variants: [
      "Allowing access only if device is compliant AND user is in Finance AND request occurs during business hours is:",
      "Using multiple conditional attributes to decide access is:",
      "Dynamic policy evaluation is a hallmark of:"
    ],
    answerOptions: [
      { variants: ["ABAC", "Attribute-Based Access Control"], correct: true, explanation: "ABAC allows complex boolean logic using subject, object, and environmental attributes." },
      { variants: ["RBAC"], correct: false, explanation: "RBAC is usually static roles." },
      { variants: ["MAC"], correct: false, explanation: "MAC is clearance levels." },
      { variants: ["PAP"], correct: false, explanation: "PAP is an auth protocol." }
    ]
  }),

  q(7049, 7, 2, ["Passwords", "Policy"], {
    variants: [
      "Which policy MOST effectively reduces risk from password reuse across many sites?",
      "To prevent one breach from compromising all accounts, users should use:",
      "Since users can't remember 50 unique passwords, they should use a:"
    ],
    answerOptions: [
      { variants: ["Password Manager", "Unique Passwords"], correct: true, explanation: "Password managers allow users to have complex, unique passwords for every site." },
      { variants: ["Shorter Expiration"], correct: false, explanation: "Frequent expiration causes users to pick weak patterns." },
      { variants: ["Lower Complexity"], correct: false, explanation: "Weak passwords are bad." },
      { variants: ["Disable MFA"], correct: false, explanation: "Never disable MFA." }
    ]
  }),

  q(7050, 7, 3, ["Access", "Just-In-Time"], {
    variants: [
      "Granting admin rights only when needed and automatically removing them afterward is called:",
      "To reduce the attack surface of standing privileges, implement:",
      "JIT stands for:"
    ],
    answerOptions: [
      { variants: ["Just-In-Time (JIT) Access"], correct: true, explanation: "JIT access grants temporary privileges for a specific task, then revokes them." },
      { variants: ["Static Access"], correct: false, explanation: "Static is permanent." },
      { variants: ["Shared Access"], correct: false, explanation: "Shared is bad." },
      { variants: ["Open Access"], correct: false, explanation: "Open is insecure." }
    ]
  }),

// ============================================================
  // TOPIC CLUSTER: Advanced IAM & Admin (Questions 7051-7100)
  // ============================================================

  q(7051, 7, 1, ["Auth", "Trust"], {
    variants: [
      "In a Transitive Trust relationship, if Domain A trusts Domain B, and Domain B trusts Domain C, then:",
      "Trust relationships in Active Directory allow:",
      "If Trust is transitive, who can Domain A access?"
    ],
    answerOptions: [
      { variants: ["Domain A trusts Domain C"], correct: true, explanation: "Transitive trust extends the trust path automatically (A->B->C implies A->C)." },
      { variants: ["Trust is blocked"], correct: false, explanation: "That would be non-transitive." },
      { variants: ["Domain C trusts Domain A"], correct: false, explanation: "Trust direction matters (One-way vs Two-way)." },
      { variants: ["No access"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(7052, 7, 5, ["Linux", "Sudo"], {
    variants: [
      "Which Linux command allows a standard [user] to run a specific command with root privileges?",
      "To edit a system file without logging out and back in as root, an [admin] types:",
      "Superuser Do is abbreviated as:"
    ],
    answerOptions: [
      { variants: ["sudo"], correct: true, explanation: "sudo (Superuser Do) allows privileged execution for authorized users." },
      { variants: ["su"], correct: false, explanation: "su switches the user context entirely (Shell)." },
      { variants: ["chmod"], correct: false, explanation: "chmod is permissions." },
      { variants: ["grep"], correct: false, explanation: "grep is search." }
    ]
  }),

  q(7053, 7, 4, ["NAC", "Posture"], {
    variants: [
      "Before allowing a laptop on the VPN, the system checks for antivirus and OS patches. This is:",
      "Network Access Control (NAC) uses a ________ to verify device health.",
      "Ensuring a device is compliant before granting access is:"
    ],
    answerOptions: [
      { variants: ["Posture Assessment", "Health Check"], correct: true, explanation: "Posture assessment verifies the device meets security standards (AV, Patch level) before connection." },
      { variants: ["Port Security"], correct: false, explanation: "Port security checks MAC addresses." },
      { variants: ["VLAN Tagging"], correct: false, explanation: "VLANs segregate traffic." },
      { variants: ["Routing"], correct: false, explanation: "Routing moves packets." }
    ]
  }),

  q(7054, 7, 4, ["NAC", "Remediation"], {
    variants: [
      "If a device fails a NAC posture check, where should it be placed?",
      "An infected laptop plugs into the network. NAC moves it to a:",
      "To patch a non-compliant [device] safely, place it in the:"
    ],
    answerOptions: [
      { variants: ["Remediation VLAN", "Quarantine Network"], correct: true, explanation: "Remediation/Quarantine VLANs allow limited access to patch servers to fix the issue." },
      { variants: ["Guest Network"], correct: false, explanation: "Guests might still have internet access; Quarantine is stricter." },
      { variants: ["DMZ"], correct: false, explanation: "DMZ is for public servers." },
      { variants: ["Management VLAN"], correct: false, explanation: "Never put insecure devices in Mgmt." }
    ]
  }),

  q(7055, 7, 2, ["MFA", "OTP"], {
    variants: [
      "Which type of OTP (One-Time Password) changes every 30 or 60 seconds?",
      "Google Authenticator and Microsoft Authenticator use which algorithm?",
      "An algorithm relying on time synchronization between token and server is:"
    ],
    answerOptions: [
      { variants: ["TOTP", "Time-based One-Time Password"], correct: true, explanation: "TOTP relies on the current time to generate the code." },
      { variants: ["HOTP"], correct: false, explanation: "HOTP (HMAC-based) relies on a counter (button press), not time." },
      { variants: ["Static Code"], correct: false, explanation: "Static codes don't change." },
      { variants: ["SMS"], correct: false, explanation: "SMS is a delivery method, not the algorithm." }
    ]
  }),

  q(7056, 7, 1, ["AAA", "Diameter"], {
    variants: [
      "Which protocol is considered the modern, TCP-based successor to RADIUS?",
      "For LTE and VoIP networks requiring higher reliability than RADIUS, use:",
      "Unlike RADIUS, this protocol uses TCP/SCTP:"
    ],
    answerOptions: [
      { variants: ["Diameter"], correct: true, explanation: "Diameter is the successor to RADIUS, offering reliable transport (TCP) and better error handling." },
      { variants: ["TACACS+"], correct: false, explanation: "TACACS+ is an alternative, not a direct successor." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is directory." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos is authentication." }
    ]
  }),

  q(7057, 7, 1, ["Windows", "UAC"], {
    variants: [
      "Which Windows feature dims the screen and asks for permission before allowing administrative changes?",
      "To prevent unauthorized system changes by background malware, Windows uses:",
      "Running a standard user session but elevating for specific tasks relies on:"
    ],
    answerOptions: [
      { variants: ["UAC", "User Account Control"], correct: true, explanation: "UAC notifies the user when a program attempts to make changes that require administrator-level permission." },
      { variants: ["BitLocker"], correct: false, explanation: "BitLocker is encryption." },
      { variants: ["Defender"], correct: false, explanation: "Defender is AV." },
      { variants: ["Kerberos"], correct: false, explanation: "Kerberos is network auth." }
    ]
  }),

  q(7058, 7, 3, ["Access", "Audit"], {
    variants: [
      "Periodically verifying that users still need the permissions they currently hold is called:",
      "To prevent privilege creep, an [admin] conducts a quarterly:",
      "Reviewing access rights to ensure Least Privilege is maintained is an:"
    ],
    answerOptions: [
      { variants: ["Access Review", "Permission Audit"], correct: true, explanation: "Regular audits ensure that permissions are revoked when no longer needed (stopping creep)." },
      { variants: ["Vulnerability Scan"], correct: false, explanation: "Scans check for bugs." },
      { variants: ["Pen Test"], correct: false, explanation: "Pen tests exploit." },
      { variants: ["Risk Assessment"], correct: false, explanation: "Risk assessment evaluates threats." }
    ]
  }),

  q(7059, 7, 2, ["Biometric", "Enrollment"], {
    variants: [
      "The initial process of scanning a user's fingerprint to create a reference template is called:",
      "Before a biometric system can authenticate a [user], they must go through:",
      "Creating the digital signature of a biological feature is:"
    ],
    answerOptions: [
      { variants: ["Enrollment"], correct: true, explanation: "Enrollment is the one-time process of registering the biometric data." },
      { variants: ["Authentication"], correct: false, explanation: "Authentication is the subsequent checks." },
      { variants: ["Authorization"], correct: false, explanation: "Authorization is permissions." },
      { variants: ["Hashing"], correct: false, explanation: "Templates use hashing, but the *process* is enrollment." }
    ]
  }),

  q(7060, 7, 1, ["Policy", "Clean Desk"], {
    variants: [
      "Which policy requires employees to clear sensitive documents from their workspace when they leave?",
      "To prevent unauthorized viewing of passwords on sticky notes, enforce a:",
      "Locking your screen and hiding papers supports the:"
    ],
    answerOptions: [
      { variants: ["Clean Desk Policy"], correct: true, explanation: "Clean Desk policies reduce the risk of information theft or unauthorized viewing." },
      { variants: ["AUP"], correct: false, explanation: "AUP is computer usage." },
      { variants: ["NDA"], correct: false, explanation: "NDA is legal secrecy." },
      { variants: ["BYOD"], correct: false, explanation: "BYOD is devices." }
    ]
  }),

  q(7061, 7, 2, ["Physical", "Proximity"], {
    variants: [
      "Which technology allows an employee to unlock a door by waving a card near a reader?",
      "RFID-based building access relies on:",
      "A contactless smart card uses:"
    ],
    answerOptions: [
      { variants: ["Proximity Reader", "RFID"], correct: true, explanation: "Proximity readers use RFID/NFC to read badges without physical contact." },
      { variants: ["Biometric Scanner"], correct: false, explanation: "Biometric uses body parts." },
      { variants: ["Magnetic Stripe"], correct: false, explanation: "Magstripe requires swiping." },
      { variants: ["Cipher Lock"], correct: false, explanation: "Cipher lock uses a PIN code." }
    ]
  }),

  q(7062, 7, 1, ["Accounts", "Guest"], {
    variants: [
      "Which default account should always be disabled on enterprise systems?",
      "To prevent anonymous access, the [admin] disables the:",
      "What account has low privileges but no password by default on many systems?"
    ],
    answerOptions: [
      { variants: ["Guest Account"], correct: true, explanation: "Guest accounts often have weak/no passwords and provide a foothold for attackers." },
      { variants: ["Administrator"], correct: false, explanation: "Admin accounts should be renamed/secured, not necessarily disabled (you need one)." },
      { variants: ["Service Account"], correct: false, explanation: "Service accounts are needed for apps." },
      { variants: ["User Account"], correct: false, explanation: "Users need access." }
    ]
  }),

  q(7063, 7, 1, ["Accounts", "Service"], {
    variants: [
      "An account used by an application to run automated tasks (backups, database sync) is a:",
      "Non-interactive accounts that should have complex, non-expiring passwords are:",
      "What type of account should NOT be used for interactive login?"
    ],
    answerOptions: [
      { variants: ["Service Account"], correct: true, explanation: "Service accounts are for software, not humans. They should have restricted rights and no interactive login." },
      { variants: ["Guest Account"], correct: false, explanation: "Guest is for visitors." },
      { variants: ["Root Account"], correct: false, explanation: "Root is the superuser." },
      { variants: ["User Account"], correct: false, explanation: "User is a human." }
    ]
  }),

  q(7064, 7, 4, ["LDAP", "Structure"], {
    variants: [
      "In an LDAP string 'CN=John,OU=Sales,DC=Corp,DC=Com', what does CN stand for?",
      "The identifier for the specific object (like a user or printer) in LDAP is:",
      "Common Name, Organizational Unit, and ________ Component."
    ],
    answerOptions: [
      { variants: ["Common Name"], correct: true, explanation: "CN (Common Name) identifies the leaf object. DC is Domain Component." },
      { variants: ["Container Name"], correct: false, explanation: "Incorrect." },
      { variants: ["Canonical Name"], correct: false, explanation: "Close, but CN is Common Name in X.500." },
      { variants: ["Control Number"], correct: false, explanation: "Incorrect." }
    ]
  }),

  q(7065, 7, 1, ["Kerberos", "Components"], {
    variants: [
      "In Kerberos, the trusted third party that holds all secret keys is the:",
      "The Authentication Service (AS) and Ticket Granting Service (TGS) make up the:",
      "Tickets are issued by the:"
    ],
    answerOptions: [
      { variants: ["KDC", "Key Distribution Center"], correct: true, explanation: "The KDC (Key Distribution Center) is the central authority in Kerberos." },
      { variants: ["CA"], correct: false, explanation: "CA is for PKI (Certificates)." },
      { variants: ["ISP"], correct: false, explanation: "ISP is internet." },
      { variants: ["NTP"], correct: false, explanation: "NTP is time." }
    ]
  }),

  q(7066, 7, 4, ["Remote", "RDP"], {
    variants: [
      "To secure RDP sessions, which feature requires authentication *before* the session is fully created?",
      "An [admin] enables NLA on the terminal server. What does NLA stand for?",
      "To prevent DoS attacks against RDP ports, enable:"
    ],
    answerOptions: [
      { variants: ["Network Level Authentication (NLA)"], correct: true, explanation: "NLA forces the user to authenticate before the heavy RDP session (GUI) is established, saving resources and increasing security." },
      { variants: ["TLS"], correct: false, explanation: "TLS encrypts the tunnel, but NLA handles the pre-auth." },
      { variants: ["VPN"], correct: false, explanation: "VPN is a tunnel." },
      { variants: ["MFA"], correct: false, explanation: "MFA is a method, NLA is the RDP protocol feature." }
    ]
  }),

  q(7067, 7, 3, ["SSH", "Keys"], {
    variants: [
      "When using SSH keys, which key must remain on the user's laptop and never be shared?",
      "To authenticate via SSH without a password, the [user] keeps the:",
      "The public key goes to the server; the ________ stays with you."
    ],
    answerOptions: [
      { variants: ["Private Key"], correct: true, explanation: "The Private Key proves identity. If stolen, the attacker can impersonate the user." },
      { variants: ["Public Key"], correct: false, explanation: "Public keys are meant to be shared (on the server)." },
      { variants: ["Shared Secret"], correct: false, explanation: "SSH keys are asymmetric." },
      { variants: ["Certificate"], correct: false, explanation: "Certs act as containers for public keys." }
    ]
  }),

  q(7068, 7, 1, ["AAA", "Radius"], {
    variants: [
      "An [admin] configures a wireless network to use 'Eduroam'. This relies on:",
      "Using one set of credentials at multiple different universities relies on RADIUS:",
      "Routing authentication requests to a home institution is:"
    ],
    answerOptions: [
      { variants: ["RADIUS Federation", "Federated RADIUS"], correct: true, explanation: "RADIUS hierarchies allow a user to authenticate at a remote site by forwarding the request to their home server." },
      { variants: ["Local Authentication"], correct: false, explanation: "Local handles only local users." },
      { variants: ["LDAP"], correct: false, explanation: "LDAP is directory." },
      { variants: ["PSK"], correct: false, explanation: "PSK is shared." }
    ]
  }),

  q(7069, 7, 4, ["Access", "Time"], {
    variants: [
      "Restricting logins to Monday-Friday, 9am-5pm is an example of:",
      "To prevent night-shift cleaners from logging into HR systems, configure:",
      "Time of Day restrictions are a form of:"
    ],
    answerOptions: [
      { variants: ["Time of Day Restrictions"], correct: true, explanation: "Limiting WHEN a user can log in reduces the attack window." },
      { variants: ["Location Restrictions"], correct: false, explanation: "Location is WHERE." },
      { variants: ["Role Based Access"], correct: false, explanation: "Role is WHO." },
      { variants: ["Biometrics"], correct: false, explanation: "Biometrics is WHO." }
    ]
  }),

  q(7070, 7, 4, ["Access", "Location"], {
    variants: [
      "Using GPS or IP Geolocation to block logins from foreign countries is:",
      "Geofencing is used to enforce:",
      "If a user logs in from New York and 5 minutes later from London, this is detected by:"
    ],
    answerOptions: [
      { variants: ["Location-based Access", "Impossible Travel"], correct: true, explanation: "Location-based rules (and Impossible Travel detection) use geography to validate requests." },
      { variants: ["Time-based Access"], correct: false, explanation: "Time." },
      { variants: ["Rule-based Access"], correct: false, explanation: "Rule-based is generic." },
      { variants: ["Discretionary Access"], correct: false, explanation: "DAC is owner-based." }
    ]
  }),

  q(7071, 7, 5, ["Linux", "Groups"], {
    variants: [
      "Which file contains the list of groups and their members on a Linux system?",
      "To see which users belong to the 'sudo' group, check:",
      "/etc/passwd lists users, /etc/________ lists groups."
    ],
    answerOptions: [
      { variants: ["/etc/group"], correct: true, explanation: "/etc/group defines group memberships." },
      { variants: ["/etc/shadow"], correct: false, explanation: "Shadow is passwords." },
      { variants: ["/etc/gshadow"], correct: false, explanation: "Gshadow is group passwords (rarely used)." },
      { variants: ["/var/log"], correct: false, explanation: "Logs." }
    ]
  }),

  q(7072, 7, 5, ["Linux", "Permissions"], {
    variants: [
      "What is the symbolic equivalent of octal permission 755?",
      "rwxr-xr-x represents which octal code?",
      "Owner=Full, Group=Read/Exec, Other=Read/Exec is:"
    ],
    answerOptions: [
      { variants: ["rwxr-xr-x"], correct: true, explanation: "7 (rwx) + 5 (r-x) + 5 (r-x)." },
      { variants: ["rw-r--r--"], correct: false, explanation: "644." },
      { variants: ["rwxrwxrwx"], correct: false, explanation: "777." },
      { variants: ["---------"], correct: false, explanation: "000." }
    ]
  }),

  q(7073, 7, 4, ["Windows", "Accounts"], {
    variants: [
      "What is the difference between a Local Account and a Domain Account?",
      "Which account type works only on the specific computer where it was created?",
      "To log in to any computer in the [company], use a:"
    ],
    answerOptions: [
      { variants: ["Domain Account"], correct: true, explanation: "Domain accounts live in AD and work everywhere. Local accounts live in the SAM and work only locally." },
      { variants: ["Local Account"], correct: false, explanation: "Local is restricted to one PC." },
      { variants: ["Guest Account"], correct: false, explanation: "Guest is restricted." },
      { variants: ["Service Account"], correct: false, explanation: "Service is for apps." }
    ]
  }),

  q(7074, 7, 1, ["IAM", "Lifecycle"], {
    variants: [
      "The process of creating a user account, assigning permissions, and eventually deleting it is:",
      "IAM covers the entire Identity ________.",
      "Provisioning and Deprovisioning are stages of:"
    ],
    answerOptions: [
      { variants: ["Identity Lifecycle", "User Lifecycle"], correct: true, explanation: "Lifecycle management ensures security from hire (provisioning) to fire (deprovisioning)." },
      { variants: ["Risk Management"], correct: false, explanation: "Risk is different." },
      { variants: ["Change Management"], correct: false, explanation: "Change is for systems." },
      { variants: ["Asset Management"], correct: false, explanation: "Asset is for hardware." }
    ]
  }),

  q(7075, 7, 1, ["Access", "Transitive"], {
    variants: [
      "In a forest trust, if Domain A trusts B, and B trusts C, A trusts C. This property is:",
      "Transitive Trust simplifies management by:",
      "Automatically extending trust relationships is:"
    ],
    answerOptions: [
      { variants: ["Transitive Trust"], correct: true, explanation: "Transitive trust allows auth paths to flow through intermediate domains." },
      { variants: ["Non-Transitive"], correct: false, explanation: "Non-transitive requires explicit links." },
      { variants: ["One-Way Trust"], correct: false, explanation: "Directional." },
      { variants: ["Explicit Trust"], correct: false, explanation: "Manual." }
    ]
  }),

  q(7076, 7, 4, ["NAC", "Agents"], {
    variants: [
      "A NAC solution that requires permanent software installation on the endpoint is:",
      "Dissolvable agents disappear after the scan. ________ agents stay installed.",
      "To continuously monitor device health, use an:"
    ],
    answerOptions: [
      { variants: ["Agent-based", "Persistent Agent"], correct: true, explanation: "Persistent agents run continuously. Dissolvable agents run once and delete themselves." },
      { variants: ["Agentless"], correct: false, explanation: "Agentless uses network scanning." },
      { variants: ["Passive"], correct: false, explanation: "Passive listens." },
      { variants: ["Inline"], correct: false, explanation: "Inline is network placement." }
    ]
  }),

  q(7077, 7, 1, ["TACACS+", "Protocol"], {
    variants: [
      "Why is TACACS+ considered more reliable for WAN links than RADIUS?",
      "TACACS+ uses ________, which offers connection-oriented delivery.",
      "UDP can drop packets. TACACS+ avoids this by using:"
    ],
    answerOptions: [
      { variants: ["TCP"], correct: true, explanation: "TACACS+ uses TCP (Port 49), ensuring reliable delivery." },
      { variants: ["UDP"], correct: false, explanation: "RADIUS uses UDP." },
      { variants: ["ICMP"], correct: false, explanation: "ICMP is Ping." },
      { variants: ["IPsec"], correct: false, explanation: "IPsec is VPN." }
    ]
  }),

  q(7078, 7, 1, ["RADIUS", "Client"], {
    variants: [
      "In a RADIUS setup, the Wireless Access Point (AP) acts as the:",
      "The device that forwards the user's credentials to the RADIUS server is the:",
      "The RADIUS Server authenticates; the ________ enforces."
    ],
    answerOptions: [
      { variants: ["RADIUS Client", "Authenticator", "NAS"], correct: true, explanation: "The Network Access Server (Switch/AP) is the 'Client' that talks to the RADIUS server." },
      { variants: ["Supplicant"], correct: false, explanation: "Supplicant is the user's laptop." },
      { variants: ["Authentication Server"], correct: false, explanation: "That's the RADIUS server." },
      { variants: ["Proxy"], correct: false, explanation: "Proxy relays." }
    ]
  }),

  q(7079, 7, 2, ["Biometric", "Privacy"], {
    variants: [
      "Which biometric method faces the most resistance due to privacy concerns?",
      "Users often dislike facial recognition because:",
      "Collecting biometrics without consent is a violation of:"
    ],
    answerOptions: [
      { variants: ["Privacy / Consent"], correct: true, explanation: "Facial recognition can be done at a distance without knowledge/consent, raising major privacy issues." },
      { variants: ["Cost"], correct: false, explanation: "Cost is a factor, but privacy is the resistance driver." },
      { variants: ["Speed"], correct: false, explanation: "It is fast." },
      { variants: ["Accuracy"], correct: false, explanation: "It is accurate." }
    ]
  }),

  q(7080, 7, 2, ["MFA", "Tokens"], {
    variants: [
      "A disadvantage of hardware OTP tokens compared to app-based tokens is:",
      "Why might [company] prefer Google Authenticator over RSA key fobs?",
      "Hardware tokens suffer from:"
    ],
    answerOptions: [
      { variants: ["Battery life / Physical distribution"], correct: true, explanation: "Hardware tokens die and must be physically shipped. Apps are free and downloadable." },
      { variants: ["Security"], correct: false, explanation: "Hardware is arguably more secure." },
      { variants: ["Complexity"], correct: false, explanation: "Hardware is simpler for users (just read code)." },
      { variants: ["Offline use"], correct: false, explanation: "Both work offline." }
    ]
  }),

  q(7081, 7, 4, ["Access", "Rule-Based"], {
    variants: [
      "A router ACL that allows traffic based on Source IP is an example of:",
      "Which access control model relies on a static list of conditions (If X, Then Y)?",
      "Firewalls primarily use:"
    ],
    answerOptions: [
      { variants: ["Rule-Based Access Control"], correct: true, explanation: "Firewalls and ACLs use rigid rules (Rule-Based) to permit or deny access." },
      { variants: ["Role-Based"], correct: false, explanation: "Role is users." },
      { variants: ["Discretionary"], correct: false, explanation: "DAC is file owner." },
      { variants: ["Mandatory"], correct: false, explanation: "MAC is labels." }
    ]
  }),

  q(7082, 7, 1, ["Policy", "Onboarding"], {
    variants: [
      "The process of creating accounts, issuing badges, and training a new hire is:",
      "Identity Lifecycle starts with:",
      "Granting initial access rights is:"
    ],
    answerOptions: [
      { variants: ["Onboarding"], correct: true, explanation: "Onboarding initializes the user in the system." },
      { variants: ["Offboarding"], correct: false, explanation: "Offboarding removes them." },
      { variants: ["Auditing"], correct: false, explanation: "Auditing checks them." },
      { variants: ["Recertification"], correct: false, explanation: "Recertification renews them." }
    ]
  }),

  q(7083, 7, 2, ["Controls", "Personnel"], {
    variants: [
      "Background checks and credit checks are performed during hiring to mitigate:",
      "To reduce the risk of Insider Threat before hiring, [company] performs:",
      "Personnel security starts with:"
    ],
    answerOptions: [
      { variants: ["Background Checks"], correct: true, explanation: "Screening candidates prevents hiring individuals with a history of fraud or crime." },
      { variants: ["MFA"], correct: false, explanation: "Technical." },
      { variants: ["Firewalls"], correct: false, explanation: "Technical." },
      { variants: ["Exit Interviews"], correct: false, explanation: "Offboarding." }
    ]
  }),

  q(7084, 7, 2, ["Physical", "Biometrics"], {
    variants: [
      "Using a fingerprint reader to open the server room door combines:",
      "Biometric locks are which type of control?",
      "Authentication at the physical layer is:"
    ],
    answerOptions: [
      { variants: ["Physical / Technical"], correct: true, explanation: "It is a Physical control (door lock) implemented via Technical means (biometric reader)." },
      { variants: ["Administrative"], correct: false, explanation: "Admin is policy." },
      { variants: ["Deterrent"], correct: false, explanation: "Preventive." },
      { variants: ["Corrective"], correct: false, explanation: "Preventive." }
    ]
  }),

  q(7085, 7, 5, ["Physical", "Disposal"], {
    variants: [
      "Before donating old computers, the hard drives must be:",
      "Degaussing or shredding drives ensures:",
      "The process of permanently removing data from media is:"
    ],
    answerOptions: [
      { variants: ["Sanitization", "Data Destruction"], correct: true, explanation: "Sanitization ensures data cannot be recovered. Formatting is not enough." },
      { variants: ["Formatting"], correct: false, explanation: "Recoverable." },
      { variants: ["Deleting"], correct: false, explanation: "Recoverable." },
      { variants: ["Archiving"], correct: false, explanation: "Saves data." }
    ]
  }),

  q(7086, 7, 5, ["Linux", "Passwd"], {
    variants: [
      "The '/etc/passwd' file contains user IDs and home directories, but not:",
      "Why is /etc/passwd world-readable?",
      "Where are the actual passwords stored?"
    ],
    answerOptions: [
      { variants: ["Passwords (Hashes)"], correct: true, explanation: "Passwords (hashes) were moved to /etc/shadow for security. /etc/passwd is needed for mapping names to IDs." },
      { variants: ["Usernames"], correct: false, explanation: "Usernames ARE in passwd." },
      { variants: ["Shells"], correct: false, explanation: "Shells ARE in passwd." },
      { variants: ["UIDs"], correct: false, explanation: "UIDs ARE in passwd." }
    ]
  }),

  q(7087, 7, 5, ["Linux", "Logs"], {
    variants: [
      "Which command allows an [admin] to search for a specific IP address inside a text log file?",
      "To find 'Error' in /var/log/syslog, use:",
      "Pattern matching in text is handled by:"
    ],
    answerOptions: [
      { variants: ["grep"], correct: true, explanation: "grep is the standard search tool. (Global Regular Expression Print)." },
      { variants: ["ls"], correct: false, explanation: "ls lists files." },
      { variants: ["cat"], correct: false, explanation: "cat shows content." },
      { variants: ["chmod"], correct: false, explanation: "chmod is permissions." }
    ]
  }),

  q(7088, 7, 1, ["Windows", "Logs"], {
    variants: [
      "Which Windows tool is used to view the Security Log (Logon/Logoff events)?",
      "An [admin] investigates a failed login on a Domain Controller using:",
      "The graphical log viewer in Windows is:"
    ],
    answerOptions: [
      { variants: ["Event Viewer"], correct: true, explanation: "Event Viewer displays System, Application, and Security logs." },
      { variants: ["Task Manager"], correct: false, explanation: "Task Manager shows processes." },
      { variants: ["Device Manager"], correct: false, explanation: "Device Manager shows hardware." },
      { variants: ["RegEdit"], correct: false, explanation: "RegEdit shows config." }
    ]
  }),

  q(7089, 7, 3, ["Audit", "Review"], {
    variants: [
      "Which process ensures that user accounts are disabled when employees leave or change roles?",
      "Recertification of access rights is a form of:",
      "Managers perform a periodic ________ to validate their team's permissions."
    ],
    answerOptions: [
      { variants: ["Access Review", "Account Audit"], correct: true, explanation: "Regular reviews prevent privilege creep and orphaned accounts." },
      { variants: ["Penetration Test"], correct: false, explanation: "Pen tests hack." },
      { variants: ["Vulnerability Scan"], correct: false, explanation: "Scans check bugs." },
      { variants: ["Performance Monitor"], correct: false, explanation: "PerfMon is for speed." }
    ]
  }),

  q(7090, 7, 4, ["Access", "DAC"], {
    variants: [
      "Why is Discretionary Access Control (DAC) considered less secure than Mandatory Access Control (MAC)?",
      "In DAC, who controls access?",
      "If a user can copy a sensitive file to a public folder, the system is likely using:"
    ],
    answerOptions: [
      { variants: ["The data owner decides access"], correct: true, explanation: "Users (owners) make mistakes. In MAC, the system enforces rules that users cannot override." },
      { variants: ["It has no passwords"], correct: false, explanation: "DAC has passwords." },
      { variants: ["It uses roles"], correct: false, explanation: "That is RBAC." },
      { variants: ["It is only for Linux"], correct: false, explanation: "Windows uses DAC too." }
    ]
  }),

  q(7091, 7, 1, ["Federation", "SAML"], {
    variants: [
      "A SAML Token contains information about the user, known as:",
      "When the IdP talks to the SP, it sends a package of:",
      "Identity data (email, role) inside a SAML response are:"
    ],
    answerOptions: [
      { variants: ["Assertions", "Claims"], correct: true, explanation: "SAML Assertions contain the statements (claims) about the user's identity." },
      { variants: ["Hashes"], correct: false, explanation: "Hashes verify integrity." },
      { variants: ["Cookies"], correct: false, explanation: "Cookies manage sessions." },
      { variants: ["Routes"], correct: false, explanation: "Routes move packets." }
    ]
  }),

  q(7092, 7, 1, ["Federation", "JSON"], {
    variants: [
      "Unlike SAML which uses XML, OIDC uses which format for its tokens?",
      "A JWT (Web Token) is formatted as:",
      "Modern mobile apps prefer OIDC because parsing this format is lighter than XML:"
    ],
    answerOptions: [
      { variants: ["JSON", "JavaScript Object Notation"], correct: true, explanation: "JSON is lighter and easier to parse for web/mobile apps than XML." },
      { variants: ["Binary"], correct: false, explanation: "Kerberos is binary." },
      { variants: ["HTML"], correct: false, explanation: "HTML is for display." },
      { variants: ["CSV"], correct: false, explanation: "CSV is comma separated." }
    ]
  }),

  q(7093, 7, 2, ["MFA", "Behavior"], {
    variants: [
      "Analyzing a [user]'s typing rhythm (keystroke dynamics) is which type of authentication?",
      "Gait analysis (how you walk) is:",
      "Behavioral biometrics fall under:"
    ],
    answerOptions: [
      { variants: ["Something You Do", "Behavioral"], correct: true, explanation: "Behavioral biometrics analyze patterns of action." },
      { variants: ["Something You Are"], correct: false, explanation: "Static physical traits." },
      { variants: ["Something You Know"], correct: false, explanation: "Memory." },
      { variants: ["Something You Have"], correct: false, explanation: "Possession." }
    ]
  }),

  q(7094, 7, 1, ["Policy", "Exit"], {
    variants: [
      "An Exit Interview is part of which security process?",
      "Recovering assets and reminding employees of their NDA occurs during:",
      "The final step of the employment lifecycle is:"
    ],
    answerOptions: [
      { variants: ["Offboarding"], correct: true, explanation: "Offboarding ensures secure termination of employment." },
      { variants: ["Onboarding"], correct: false, explanation: "Hiring." },
      { variants: ["Auditing"], correct: false, explanation: "Checking." },
      { variants: ["Training"], correct: false, explanation: "Learning." }
    ]
  }),

  q(7095, 7, 1, ["Accounts", "Default"], {
    variants: [
      "Why must default accounts (e.g., 'admin'/'password') be changed immediately?",
      "The most common way IoT devices are compromised is via:",
      "Vendor-supplied credentials are:"
    ],
    answerOptions: [
      { variants: ["They are publicly known"], correct: true, explanation: "Default passwords are documented online, making them trivial to guess." },
      { variants: ["They expire"], correct: false, explanation: "They often don't." },
      { variants: ["They are encrypted"], correct: false, explanation: "They act as a key." },
      { variants: ["They are complex"], correct: false, explanation: "Usually they are simple (admin/admin)." }
    ]
  }),

  q(7096, 7, 3, ["Accounts", "Orphaned"], {
    variants: [
      "An account belonging to a user who left the company 6 months ago is active. This is an:",
      "Orphaned accounts create a security risk because:",
      "Accounts with no valid owner are:"
    ],
    answerOptions: [
      { variants: ["Orphaned Account"], correct: true, explanation: "Orphaned accounts are unmonitored backdoors often targeted by attackers." },
      { variants: ["Service Account"], correct: false, explanation: "Service accounts have a purpose." },
      { variants: ["Guest Account"], correct: false, explanation: "Guest is a type." },
      { variants: ["Privileged Account"], correct: false, explanation: "Privileged means high access." }
    ]
  }),

  q(7097, 7, 4, ["NAC", "Portal"], {
    variants: [
      "A guest Wi-Fi network redirects users to a webpage to accept terms. This is a:",
      "Before accessing the internet at a hotel, you must sign in via a:",
      "Captive Portals provide:"
    ],
    answerOptions: [
      { variants: ["Captive Portal"], correct: true, explanation: "Captive portals intercept web traffic to force authentication or policy acceptance." },
      { variants: ["VPN"], correct: false, explanation: "VPN encrypts." },
      { variants: ["Proxy"], correct: false, explanation: "Proxy filters." },
      { variants: ["Firewall"], correct: false, explanation: "Firewall blocks." }
    ]
  }),

  q(7098, 7, 4, ["802.1X", "Supplicant"], {
    variants: [
      "In 802.1X, the client device asking for access is called the:",
      "The software on the laptop that sends credentials to the switch is the:",
      "Supplicant, Authenticator, and Authentication Server are components of:"
    ],
    answerOptions: [
      { variants: ["Supplicant"], correct: true, explanation: "The Supplicant is the client device requesting access." },
      { variants: ["Authenticator"], correct: false, explanation: "The Switch/AP." },
      { variants: ["Server"], correct: false, explanation: "RADIUS." },
      { variants: ["Proxy"], correct: false, explanation: "Relay." }
    ]
  }),

  q(7099, 7, 4, ["802.1X", "Authenticator"], {
    variants: [
      "In 802.1X, the switch or AP that acts as the gatekeeper is the:",
      "The device that forwards the supplicant's credentials to RADIUS is the:",
      "The Authenticator sits between the:"
    ],
    answerOptions: [
      { variants: ["Authenticator"], correct: true, explanation: "The Authenticator (Switch/AP) controls the physical port based on the server's decision." },
      { variants: ["Supplicant"], correct: false, explanation: "Client." },
      { variants: ["Server"], correct: false, explanation: "RADIUS." },
      { variants: ["Gateway"], correct: false, explanation: "Router." }
    ]
  }),

  q(7100, 7, 1, ["IAM", "Summary"], {
    variants: [
      "Which term encompasses the entire framework of policies and technologies for managing digital identities?",
      "Authentication, Authorization, and Accounting are pillars of:",
      "IAM stands for:"
    ],
    answerOptions: [
      { variants: ["Identity and Access Management (IAM)"], correct: true, explanation: "IAM is the umbrella term for managing user identities and their access rights." },
      { variants: ["SIEM"], correct: false, explanation: "Security logging." },
      { variants: ["SDN"], correct: false, explanation: "Software defined networking." },
      { variants: ["PKI"], correct: false, explanation: "Certificates." }
    ]
  })

];

// ==========================================
// SECTION 3: STUDY CONTENT DEFINITIONS
// ==========================================

export const DOMAINS = [
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
export const GLOSSARY = [
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
export const PROTOCOLS = [
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
  { name: "Syslog", port: "514 (UDP)", desc: "Central logging (often TCP/TLS in modern deployments)." },
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

const NetworkPlusGuide = ({ onClose, appSettings }) => {  // ← ADD appSettings HERE
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
          pdfUrl="./public/PremadeStudy/NetworkPlus.pdf"
          onClose={() => setActiveMode(null)}
        />
      );
  }

if (activeMode === 'quiz') {
  return (
    <QuizApp 
       title="Network+"
       questions={NETWORK_PLUS_QUESTIONS}
       globalBank={GLOBAL_BANK}
       glossary={GLOSSARY}
       onClose={() => setActiveMode(null)}
       appSettings={appSettings}
    />
  );
}

  return renderMenu();
};

export default NetworkPlusGuide;