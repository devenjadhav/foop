/**
 * Node registry for managing and discovering workflow nodes
 */

import type {
  NodeDefinition,
  BaseNodeConfig,
  NodeCategory,
} from '../../types/nodes'

class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map()

  /**
   * Register a node definition
   */
  register<T extends BaseNodeConfig>(definition: NodeDefinition<T>): void {
    if (this.nodes.has(definition.type)) {
      throw new Error(`Node type "${definition.type}" is already registered`)
    }
    this.nodes.set(definition.type, definition as NodeDefinition)
  }

  /**
   * Get a node definition by type
   */
  get<T extends BaseNodeConfig>(type: string): NodeDefinition<T> | undefined {
    return this.nodes.get(type) as NodeDefinition<T> | undefined
  }

  /**
   * Get all registered node definitions
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values())
  }

  /**
   * Get node definitions by category
   */
  getByCategory(category: NodeCategory): NodeDefinition[] {
    return this.getAll().filter((node) => node.category === category)
  }

  /**
   * Check if a node type is registered
   */
  has(type: string): boolean {
    return this.nodes.has(type)
  }

  /**
   * Get all action nodes
   */
  getActionNodes(): NodeDefinition[] {
    return this.getByCategory('action')
  }

  /**
   * Get all trigger nodes
   */
  getTriggerNodes(): NodeDefinition[] {
    return this.getByCategory('trigger')
  }

  /**
   * Unregister a node (useful for testing)
   */
  unregister(type: string): boolean {
    return this.nodes.delete(type)
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.nodes.clear()
  }
}

// Singleton instance
export const nodeRegistry = new NodeRegistry()
