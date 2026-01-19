/**
 * Workflow Nodes
 *
 * This module exports all workflow node definitions and provides
 * utilities for working with the node registry.
 */

import { nodeRegistry } from './registry';
import { crmNodes } from './crm';

// Export registry
export { nodeRegistry, NodeRegistry } from './registry';

// Export CRM nodes
export * from './crm';

// Register all nodes
function registerAllNodes(): void {
  nodeRegistry.registerAll(crmNodes);
}

// Initialize nodes on module load
registerAllNodes();

// Export initialization function for explicit control
export { registerAllNodes };
