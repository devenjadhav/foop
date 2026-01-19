/**
 * Delay Node
 *
 * Adds delays to workflow execution for timing control.
 * Supports fixed delays, random delays, scheduled execution,
 * and rate limiting.
 */

import { BaseActionNode } from '../base-node';
import type {
  DelayNodeConfig,
  NodePort,
  NodeData,
  ExecutionContext,
  ExecutionResult,
} from '../types';

export class DelayNode extends BaseActionNode<DelayNodeConfig> {
  readonly type = 'delay' as const;
  readonly name = 'Delay';
  readonly description = 'Add delays or rate limiting to workflow execution';

  readonly inputs: NodePort[] = [
    {
      id: 'input',
      name: 'Input',
      description: 'Data to pass through after delay',
      required: true,
    },
  ];

  readonly outputs: NodePort[] = [
    {
      id: 'output',
      name: 'Output',
      description: 'Data passed through after delay',
    },
  ];

  // Rate limit tracking (in production, this would be stored externally)
  private rateLimitState: Map<string, { count: number; windowStart: number }> = new Map();

  validateConfig(config: DelayNodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validDelayTypes = ['fixed', 'random', 'scheduled', 'rateLimit'];
    if (!config.delayType || !validDelayTypes.includes(config.delayType)) {
      errors.push(`delayType must be one of: ${validDelayTypes.join(', ')}`);
    }

    switch (config.delayType) {
      case 'fixed':
        if (config.duration === undefined || typeof config.duration !== 'number') {
          errors.push('duration is required for fixed delay and must be a number');
        } else if (config.duration < 0) {
          errors.push('duration must be non-negative');
        } else if (config.duration > 3600000) {
          // Max 1 hour
          errors.push('duration cannot exceed 3600000ms (1 hour)');
        }
        break;

      case 'random':
        if (config.minDuration === undefined || typeof config.minDuration !== 'number') {
          errors.push('minDuration is required for random delay');
        }
        if (config.maxDuration === undefined || typeof config.maxDuration !== 'number') {
          errors.push('maxDuration is required for random delay');
        }
        if (
          config.minDuration !== undefined &&
          config.maxDuration !== undefined
        ) {
          if (config.minDuration < 0) {
            errors.push('minDuration must be non-negative');
          }
          if (config.maxDuration < config.minDuration) {
            errors.push('maxDuration must be greater than or equal to minDuration');
          }
          if (config.maxDuration > 3600000) {
            errors.push('maxDuration cannot exceed 3600000ms (1 hour)');
          }
        }
        break;

      case 'scheduled':
        if (!config.scheduleTime || typeof config.scheduleTime !== 'string') {
          errors.push('scheduleTime is required for scheduled delay');
        } else {
          const scheduledDate = new Date(config.scheduleTime);
          if (isNaN(scheduledDate.getTime())) {
            errors.push('scheduleTime must be a valid ISO date string');
          }
        }
        break;

      case 'rateLimit':
        if (!config.rateLimit) {
          errors.push('rateLimit configuration is required for rate limiting');
        } else {
          if (
            config.rateLimit.count === undefined ||
            typeof config.rateLimit.count !== 'number' ||
            config.rateLimit.count <= 0
          ) {
            errors.push('rateLimit.count must be a positive number');
          }
          if (
            config.rateLimit.windowMs === undefined ||
            typeof config.rateLimit.windowMs !== 'number' ||
            config.rateLimit.windowMs <= 0
          ) {
            errors.push('rateLimit.windowMs must be a positive number');
          }
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    input: NodeData,
    config: DelayNodeConfig,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      return this.failure(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    try {
      switch (config.delayType) {
        case 'fixed':
          await this.executeFixedDelay(config.duration!);
          break;

        case 'random':
          await this.executeRandomDelay(config.minDuration!, config.maxDuration!);
          break;

        case 'scheduled':
          await this.executeScheduledDelay(config.scheduleTime!);
          break;

        case 'rateLimit':
          await this.executeRateLimit(config.rateLimit!, context);
          break;
      }

      return this.success(input);
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error during delay execution'
      );
    }
  }

  /**
   * Execute a fixed duration delay
   */
  private async executeFixedDelay(duration: number): Promise<void> {
    await this.sleep(duration);
  }

  /**
   * Execute a random delay within a range
   */
  private async executeRandomDelay(min: number, max: number): Promise<void> {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.sleep(duration);
  }

  /**
   * Wait until a scheduled time
   */
  private async executeScheduledDelay(scheduleTime: string): Promise<void> {
    const targetTime = new Date(scheduleTime).getTime();
    const now = Date.now();

    if (targetTime > now) {
      const waitTime = targetTime - now;
      // Cap at 1 hour for safety
      const cappedWaitTime = Math.min(waitTime, 3600000);
      await this.sleep(cappedWaitTime);

      if (waitTime > cappedWaitTime) {
        // If we had to cap, throw an error indicating partial wait
        throw new Error(
          `Scheduled time too far in future. Waited 1 hour, ${Math.floor(
            (waitTime - cappedWaitTime) / 1000
          )} seconds remaining.`
        );
      }
    }
    // If target time is in the past, continue immediately
  }

  /**
   * Execute with rate limiting
   */
  private async executeRateLimit(
    config: { count: number; windowMs: number },
    context: ExecutionContext
  ): Promise<void> {
    const key = `${context.workflowId}:${context.executionId}`;
    const now = Date.now();

    let state = this.rateLimitState.get(key);

    // Initialize or reset window if needed
    if (!state || now - state.windowStart >= config.windowMs) {
      state = { count: 0, windowStart: now };
      this.rateLimitState.set(key, state);
    }

    // Check if we're at the limit
    if (state.count >= config.count) {
      // Wait until the window resets
      const waitTime = config.windowMs - (now - state.windowStart);
      if (waitTime > 0) {
        await this.sleep(waitTime);
        // Reset after waiting
        state = { count: 0, windowStart: Date.now() };
        this.rateLimitState.set(key, state);
      }
    }

    // Increment counter
    state.count++;
  }

  /**
   * Calculate remaining time for rate limit
   */
  getRateLimitStatus(
    workflowId: string,
    executionId: string,
    config: { count: number; windowMs: number }
  ): { remaining: number; resetsIn: number } {
    const key = `${workflowId}:${executionId}`;
    const now = Date.now();
    const state = this.rateLimitState.get(key);

    if (!state || now - state.windowStart >= config.windowMs) {
      return { remaining: config.count, resetsIn: 0 };
    }

    return {
      remaining: Math.max(0, config.count - state.count),
      resetsIn: Math.max(0, config.windowMs - (now - state.windowStart)),
    };
  }

  /**
   * Clear rate limit state (useful for cleanup)
   */
  clearRateLimitState(workflowId?: string): void {
    if (workflowId) {
      const keys = Array.from(this.rateLimitState.keys());
      for (const key of keys) {
        if (key.startsWith(`${workflowId}:`)) {
          this.rateLimitState.delete(key);
        }
      }
    } else {
      this.rateLimitState.clear();
    }
  }
}

// Default configuration for delay node
export const delayNodeDefaults: DelayNodeConfig = {
  delayType: 'fixed',
  duration: 1000,
};
