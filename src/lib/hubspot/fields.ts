/**
 * HubSpot field mapping utilities
 */

import type {
  FieldMapping,
  HubSpotFieldType,
  HubSpotProperty,
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
} from './types';

/**
 * Standard contact fields with their HubSpot mappings
 */
export const STANDARD_CONTACT_FIELDS: FieldMapping[] = [
  {
    hubspotField: 'email',
    hubspotFieldType: 'string',
    internalField: 'email',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'firstname',
    hubspotFieldType: 'string',
    internalField: 'firstName',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'lastname',
    hubspotFieldType: 'string',
    internalField: 'lastName',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'phone',
    hubspotFieldType: 'phone_number',
    internalField: 'phone',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'company',
    hubspotFieldType: 'string',
    internalField: 'companyName',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'jobtitle',
    hubspotFieldType: 'string',
    internalField: 'jobTitle',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'lifecyclestage',
    hubspotFieldType: 'enumeration',
    internalField: 'lifecycleStage',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'hs_lead_status',
    hubspotFieldType: 'enumeration',
    internalField: 'leadStatus',
    direction: 'bidirectional',
  },
];

/**
 * Standard company fields with their HubSpot mappings
 */
export const STANDARD_COMPANY_FIELDS: FieldMapping[] = [
  {
    hubspotField: 'name',
    hubspotFieldType: 'string',
    internalField: 'name',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'domain',
    hubspotFieldType: 'string',
    internalField: 'domain',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'industry',
    hubspotFieldType: 'enumeration',
    internalField: 'industry',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'numberofemployees',
    hubspotFieldType: 'number',
    internalField: 'employeeCount',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'annualrevenue',
    hubspotFieldType: 'number',
    internalField: 'annualRevenue',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'city',
    hubspotFieldType: 'string',
    internalField: 'city',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'state',
    hubspotFieldType: 'string',
    internalField: 'state',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'country',
    hubspotFieldType: 'string',
    internalField: 'country',
    direction: 'bidirectional',
  },
];

/**
 * Standard deal fields with their HubSpot mappings
 */
export const STANDARD_DEAL_FIELDS: FieldMapping[] = [
  {
    hubspotField: 'dealname',
    hubspotFieldType: 'string',
    internalField: 'name',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'amount',
    hubspotFieldType: 'number',
    internalField: 'amount',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'dealstage',
    hubspotFieldType: 'enumeration',
    internalField: 'stage',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'pipeline',
    hubspotFieldType: 'enumeration',
    internalField: 'pipeline',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'closedate',
    hubspotFieldType: 'date',
    internalField: 'closeDate',
    direction: 'bidirectional',
  },
  {
    hubspotField: 'hs_priority',
    hubspotFieldType: 'enumeration',
    internalField: 'priority',
    direction: 'bidirectional',
  },
];

/**
 * Map HubSpot field type to internal type
 */
export function mapFieldType(hubspotType: HubSpotFieldType): string {
  const typeMap: Record<HubSpotFieldType, string> = {
    string: 'text',
    number: 'number',
    date: 'date',
    datetime: 'datetime',
    enumeration: 'select',
    bool: 'boolean',
    phone_number: 'phone',
    json: 'json',
  };
  return typeMap[hubspotType] || 'text';
}

/**
 * Convert HubSpot property to field mapping
 */
export function propertyToFieldMapping(
  property: HubSpotProperty,
  direction: FieldMapping['direction'] = 'bidirectional'
): FieldMapping {
  return {
    hubspotField: property.name,
    hubspotFieldType: property.type,
    internalField: camelCase(property.name),
    direction,
  };
}

/**
 * Convert string to camelCase
 */
function camelCase(str: string): string {
  return str
    .replace(/[_-](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/**
 * Apply field mappings to transform HubSpot data to internal format
 */
export function mapFromHubSpot<T extends Record<string, unknown>>(
  hubspotObject: HubSpotContact | HubSpotCompany | HubSpotDeal,
  mappings: FieldMapping[]
): T {
  const result: Record<string, unknown> = {
    id: hubspotObject.id,
    createdAt: hubspotObject.createdAt,
    updatedAt: hubspotObject.updatedAt,
  };

  for (const mapping of mappings) {
    if (mapping.direction === 'outbound') continue;

    const value = hubspotObject.properties[mapping.hubspotField];
    if (value !== null && value !== undefined) {
      result[mapping.internalField] = convertFromHubSpot(
        value,
        mapping.hubspotFieldType
      );
    }
  }

  return result as T;
}

/**
 * Apply field mappings to transform internal data to HubSpot format
 */
export function mapToHubSpot(
  data: Record<string, unknown>,
  mappings: FieldMapping[]
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const mapping of mappings) {
    if (mapping.direction === 'inbound') continue;

    const value = data[mapping.internalField];
    if (value !== null && value !== undefined) {
      result[mapping.hubspotField] = convertToHubSpot(
        value,
        mapping.hubspotFieldType
      );
    }
  }

  return result;
}

/**
 * Convert value from HubSpot format
 */
function convertFromHubSpot(
  value: string,
  type: HubSpotFieldType
): unknown {
  switch (type) {
    case 'number':
      return parseFloat(value) || 0;
    case 'bool':
      return value === 'true';
    case 'date':
    case 'datetime':
      return new Date(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

/**
 * Convert value to HubSpot format
 */
function convertToHubSpot(value: unknown, type: HubSpotFieldType): string {
  switch (type) {
    case 'number':
      return String(value);
    case 'bool':
      return value ? 'true' : 'false';
    case 'date':
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      return String(value);
    case 'datetime':
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

/**
 * Merge custom mappings with standard mappings
 */
export function mergeFieldMappings(
  standard: FieldMapping[],
  custom: FieldMapping[]
): FieldMapping[] {
  const mappingMap = new Map<string, FieldMapping>();

  // Add standard mappings first
  for (const mapping of standard) {
    mappingMap.set(mapping.hubspotField, mapping);
  }

  // Override/add custom mappings
  for (const mapping of custom) {
    mappingMap.set(mapping.hubspotField, mapping);
  }

  return Array.from(mappingMap.values());
}

/**
 * Get field names for API requests
 */
export function getHubSpotFieldNames(mappings: FieldMapping[]): string[] {
  return mappings
    .filter((m) => m.direction !== 'outbound')
    .map((m) => m.hubspotField);
}

/**
 * Validate field mapping configuration
 */
export function validateFieldMappings(mappings: FieldMapping[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const seenHubSpotFields = new Set<string>();
  const seenInternalFields = new Set<string>();

  for (const mapping of mappings) {
    // Check for duplicate HubSpot fields
    if (seenHubSpotFields.has(mapping.hubspotField)) {
      errors.push(`Duplicate HubSpot field: ${mapping.hubspotField}`);
    }
    seenHubSpotFields.add(mapping.hubspotField);

    // Check for duplicate internal fields
    if (seenInternalFields.has(mapping.internalField)) {
      errors.push(`Duplicate internal field: ${mapping.internalField}`);
    }
    seenInternalFields.add(mapping.internalField);

    // Validate field names
    if (!mapping.hubspotField || mapping.hubspotField.trim() === '') {
      errors.push('Empty HubSpot field name');
    }
    if (!mapping.internalField || mapping.internalField.trim() === '') {
      errors.push('Empty internal field name');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
