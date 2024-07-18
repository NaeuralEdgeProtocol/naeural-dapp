import React from "react";
const columns = [
  {name: "LICENSE", uid: "license", sortable: true},
  {name: "NODE HASH", uid: "nodeHash", sortable: true},
  {name: "TYPE", uid: "type", sortable: true},
  {name: "START", uid: "startTime", sortable: true},
  {name: "END", uid: "endTime"},
  {name: "LAST CLAIMED EPOCH", uid: "lastClaim"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

const licenses = [
  {
    id: "1",
    type: "master",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd449",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "registered",
    lastClaim: "16",
  },
  {
    id: "2",
    type: "master",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd450",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "unregistered",
    lastClaim: "15",
  },
  {
    id: "3",
    type: "license",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd451",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "registered",
    lastClaim: "15",
  },
  {
    id: "4",
    type: "license",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "registered",
    lastClaim: "15",
  },
  {
    id: "5",
    type: "license",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd453",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "unregistered",
    lastClaim: "15",
  },
  {
    id: "6",
    type: "license",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd454",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "registered",
    lastClaim: "15",
  },
  {
    id: "7",
    type: "license",
    nodeHash: "0xai_a0f0db06077940492d0bb81072ad1e8bafa45c7fd455",
    startTime: "2024-06-01 00:12:22",
    endTime: "2025-06-20 00:12:22",
    status: "unregistered",
    lastClaim: "15",
  },

];

export { columns, licenses };
