/**
 * Node Registry - Central registry for all workflow node definitions
 */

import type { NodeDefinition } from '../types';

class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();

  /**
   * Register a node definition
   */
  register(node: NodeDefinition): void {
    if (this.nodes.has(node.type)) {
      throw new Error(`Node type "${node.type}" is already registered`);
    }
    this.nodes.set(node.type, node);
  }

  /**
   * Register multiple node definitions
   */
  registerAll(nodes: NodeDefinition[]): void {
    for (const node of nodes) {
      this.register(node);
    }
  }

  /**
   * Get a node definition by type
   */
  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  /**
   * Get all registered node definitions
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node definitions by category
   */
  getByCategory(category: string): NodeDefinition[] {
    return this.getAll().filter((node) => node.category === category);
  }

  /**
   * Check if a node type is registered
   */
  has(type: string): boolean {
    return this.nodes.has(type);
  }

  /**
   * Get all registered categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const node of this.nodes.values()) {
      categories.add(node.category);
    }
    return Array.from(categories);
  }

  /**
   * Get node count
   */
  get size(): number {
    return this.nodes.size;
  }
}

// Global node registry instance
export const nodeRegistry = new NodeRegistry();

// Re-export the class for testing
export { NodeRegistry };
