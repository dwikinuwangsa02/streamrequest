type Log = {
  id: string;
  provider: string;
  payload: any;
  timestamp: string;
  streamKey: string;
};

const globalLogs = global as unknown as { webhookLogs: Log[] };
if (!globalLogs.webhookLogs) {
  globalLogs.webhookLogs = [];
}

export function addWebhookLog(log: Omit<Log, 'id' | 'timestamp'>) {
  const newLog = {
    ...log,
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString()
  };
  globalLogs.webhookLogs.unshift(newLog);
  if (globalLogs.webhookLogs.length > 50) {
    globalLogs.webhookLogs = globalLogs.webhookLogs.slice(0, 50);
  }
}

export function getWebhookLogs(streamKey: string) {
  return globalLogs.webhookLogs.filter(log => log.streamKey === streamKey);
}
