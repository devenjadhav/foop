export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  };
}
