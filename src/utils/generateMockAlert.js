export const generateMockAlert = () => ({
  id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  ts: new Date().toISOString(),
  machine_id: ["M-101", "M-102", "M-103"][Math.floor(Math.random() * 3)],
  rule: ["idle_gt_30min", "temp_high", "vibration_alert"][
    Math.floor(Math.random() * 3)
  ],
  severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
  msg: ["Idle > 30 min", "Temperature exceeded", "High vibration detected"][
    Math.floor(Math.random() * 3)
  ],
  status: "created",
  acknowledgedBy: null,
  acknowledgedAt: null,
  clearedBy: null,
  clearedAt: null,
});
