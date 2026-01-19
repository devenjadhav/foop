import { getHealthStatus, HealthStatus } from './health';

describe('Health Service', () => {
  it('returns status ok', () => {
    const health: HealthStatus = getHealthStatus();
    expect(health.status).toBe('ok');
  });

  it('returns a valid timestamp', () => {
    const health = getHealthStatus();
    expect(health.timestamp).toBeDefined();
    expect(new Date(health.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('returns a version string', () => {
    const health = getHealthStatus();
    expect(health.version).toBeDefined();
    expect(typeof health.version).toBe('string');
  });

  it('returns the correct version from env when set', () => {
    const originalVersion = process.env.npm_package_version;
    process.env.npm_package_version = '1.2.3';

    const health = getHealthStatus();
    expect(health.version).toBe('1.2.3');

    process.env.npm_package_version = originalVersion;
  });

  it('returns default version when env not set', () => {
    const originalVersion = process.env.npm_package_version;
    delete process.env.npm_package_version;

    const health = getHealthStatus();
    expect(health.version).toBe('0.1.0');

    process.env.npm_package_version = originalVersion;
  });
});
