/**
 * Branch/Conditional Node
 *
 * Routes data to different outputs based on conditions.
 * Supports multiple branches with configurable conditions.
 * Can evaluate first match only or all matching branches.
 */

import { BaseActionNode } from '../base-node';
import type {
  BranchNodeConfig,
  BranchCondition,
  NodePort,
  NodeData,
  ExecutionContext,
  ExecutionResult,
} from '../types';

// Result structure for branch execution with multiple outputs
export interface BranchExecutionResult extends ExecutionResult {
  branches: {
    [outputPort: string]: Record<string, unknown>[];
  };
}

export class BranchNode extends BaseActionNode<BranchNodeConfig> {
  readonly type = 'branch' as const;
  readonly name = 'Branch';
  readonly description = 'Route data to different outputs based on conditions';

  readonly inputs: NodePort[] = [
    {
      id: 'input',
      name: 'Input',
      description: 'Data to route',
      required: true,
    },
  ];

  // Dynamic outputs based on configuration - these are base outputs
  readonly outputs: NodePort[] = [
    {
      id: 'branch1',
      name: 'Branch 1',
      description: 'First conditional branch',
    },
    {
      id: 'branch2',
      name: 'Branch 2',
      description: 'Second conditional branch',
    },
    {
      id: 'branch3',
      name: 'Branch 3',
      description: 'Third conditional branch',
    },
    {
      id: 'branch4',
      name: 'Branch 4',
      description: 'Fourth conditional branch',
    },
    {
      id: 'default',
      name: 'Default',
      description: 'Items that match no conditions',
    },
  ];

  validateConfig(config: BranchNodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.branches || !Array.isArray(config.branches)) {
      errors.push('Branches must be an array');
    } else if (config.branches.length === 0) {
      errors.push('At least one branch is required');
    } else {
      const outputPorts = new Set<string>();

      config.branches.forEach((branch, index) => {
        if (!branch.id || typeof branch.id !== 'string') {
          errors.push(`Branch ${index + 1}: id is required`);
        }
        if (!branch.name || typeof branch.name !== 'string') {
          errors.push(`Branch ${index + 1}: name is required`);
        }
        if (!branch.outputPort || typeof branch.outputPort !== 'string') {
          errors.push(`Branch ${index + 1}: outputPort is required`);
        } else {
          if (outputPorts.has(branch.outputPort)) {
            errors.push(`Branch ${index + 1}: duplicate outputPort '${branch.outputPort}'`);
          }
          outputPorts.add(branch.outputPort);
        }
        if (!branch.conditions || !Array.isArray(branch.conditions)) {
          errors.push(`Branch ${index + 1}: conditions must be an array`);
        } else if (branch.conditions.length === 0) {
          errors.push(`Branch ${index + 1}: at least one condition is required`);
        } else {
          branch.conditions.forEach((condition, condIndex) => {
            if (!condition.field || typeof condition.field !== 'string') {
              errors.push(
                `Branch ${index + 1}, Condition ${condIndex + 1}: field is required`
              );
            }
            if (!condition.operator) {
              errors.push(
                `Branch ${index + 1}, Condition ${condIndex + 1}: operator is required`
              );
            }
          });
        }
        if (!branch.logic || !['and', 'or'].includes(branch.logic)) {
          errors.push(`Branch ${index + 1}: logic must be 'and' or 'or'`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    input: NodeData,
    config: BranchNodeConfig,
    _context: ExecutionContext
  ): Promise<BranchExecutionResult> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid configuration: ${validation.errors.join(', ')}`,
        branches: {},
      };
    }

    try {
      const items = this.ensureArray(input);
      const branches: { [outputPort: string]: Record<string, unknown>[] } = {};

      // Initialize all branch output arrays
      for (const branch of config.branches) {
        branches[branch.outputPort] = [];
      }
      if (config.defaultBranch) {
        branches[config.defaultBranch] = [];
      }

      for (const item of items) {
        const matchedBranches = this.findMatchingBranches(item, config.branches);

        if (matchedBranches.length === 0) {
          // No match - send to default branch if configured
          if (config.defaultBranch) {
            branches[config.defaultBranch].push(item);
          }
        } else if (config.evaluateAll) {
          // Send to all matching branches
          for (const branch of matchedBranches) {
            branches[branch.outputPort].push(item);
          }
        } else {
          // Send to first matching branch only
          branches[matchedBranches[0].outputPort].push(item);
        }
      }

      // Determine which output port to use for the main result
      // Use the first branch that has items, or default
      let primaryOutput = config.defaultBranch || 'default';
      for (const branch of config.branches) {
        if (branches[branch.outputPort].length > 0) {
          primaryOutput = branch.outputPort;
          break;
        }
      }

      return {
        success: true,
        data: branches[primaryOutput],
        outputPort: primaryOutput,
        branches,
        metadata: {
          branchCounts: Object.fromEntries(
            Object.entries(branches).map(([port, items]) => [port, items.length])
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during branch execution',
        branches: {},
      };
    }
  }

  private findMatchingBranches(
    item: Record<string, unknown>,
    branches: BranchCondition[]
  ): BranchCondition[] {
    const matched: BranchCondition[] = [];

    for (const branch of branches) {
      if (this.evaluateConditions(item, branch.conditions, branch.logic)) {
        matched.push(branch);
      }
    }

    return matched;
  }

  /**
   * Get dynamic outputs based on configuration
   */
  getOutputsFromConfig(config: BranchNodeConfig): NodePort[] {
    const outputs: NodePort[] = config.branches.map((branch) => ({
      id: branch.outputPort,
      name: branch.name,
      description: `Branch: ${branch.name}`,
    }));

    if (config.defaultBranch) {
      outputs.push({
        id: config.defaultBranch,
        name: 'Default',
        description: 'Items matching no conditions',
      });
    }

    return outputs;
  }
}

// Default configuration for branch node
export const branchNodeDefaults: BranchNodeConfig = {
  branches: [
    {
      id: 'branch-1',
      name: 'Branch 1',
      conditions: [],
      logic: 'and',
      outputPort: 'branch1',
    },
  ],
  defaultBranch: 'default',
  evaluateAll: false,
};
