/**
 * CRM Action Nodes
 *
 * This module exports all CRM-related workflow nodes for managing
 * contacts, deals, notes, and searching records in connected CRM systems.
 */

import type { NodeDefinition } from '../../types';
import { createContactNode } from './create-contact';
import { updateContactNode } from './update-contact';
import { createDealNode } from './create-deal';
import { updateDealNode } from './update-deal';
import { addNoteNode } from './add-note';
import { searchRecordsNode } from './search-records';

// Export individual nodes
export { createContactNode } from './create-contact';
export { updateContactNode } from './update-contact';
export { createDealNode } from './create-deal';
export { updateDealNode } from './update-deal';
export { addNoteNode } from './add-note';
export { searchRecordsNode } from './search-records';

// Export all CRM nodes as an array for bulk registration
export const crmNodes: NodeDefinition[] = [
  createContactNode,
  updateContactNode,
  createDealNode,
  updateDealNode,
  addNoteNode,
  searchRecordsNode,
];

// Node type constants for type-safe references
export const CRM_NODE_TYPES = {
  CREATE_CONTACT: 'crm.create-contact',
  UPDATE_CONTACT: 'crm.update-contact',
  CREATE_DEAL: 'crm.create-deal',
  UPDATE_DEAL: 'crm.update-deal',
  ADD_NOTE: 'crm.add-note',
  SEARCH_RECORDS: 'crm.search-records',
} as const;

export type CRMNodeType = (typeof CRM_NODE_TYPES)[keyof typeof CRM_NODE_TYPES];
