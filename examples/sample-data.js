// Generic demo data only — NO real names, places, orgs, photos, or URLs.
// Not part of the package itself (lives outside src/); for the demos only.
export const sampleNodes = [
  { id: 'root', type: 'department', label: 'EXECUTIVE OFFICE' },
  { id: 'd-admin', parentId: 'root', type: 'department', label: 'ADMINISTRATION' },
  { id: 'd-ops', parentId: 'root', type: 'department', label: 'OPERATIONS' },
  { id: 'd-fin', parentId: 'root', type: 'department', label: 'FINANCE' },

  { id: 'p-admin-1', parentId: 'd-admin', type: 'position', label: 'ADMIN MANAGER', personName: 'SAMPLE PERSON A', status: 'FILLED' },
  { id: 'p-admin-2', parentId: 'd-admin', type: 'position', label: 'STAFF MEMBER', personName: 'SAMPLE PERSON B', status: 'FILLED' },
  { id: 'p-admin-3', parentId: 'd-admin', type: 'position', label: 'STAFF MEMBER', personName: '— VACANT —', status: 'VACANT' },

  { id: 'd-tech', parentId: 'd-ops', type: 'department', label: 'TECHNICAL TEAM' },
  { id: 'd-field', parentId: 'd-ops', type: 'department', label: 'FIELD UNIT' },
  { id: 'p-ops-1', parentId: 'd-ops', type: 'position', label: 'OPERATIONS MANAGER', personName: 'SAMPLE PERSON C', status: 'FILLED' },
  { id: 'p-ops-2', parentId: 'd-ops', type: 'position', label: 'TEAM LEAD', personName: 'SAMPLE PERSON D', status: 'FILLED' },
  { id: 'p-ops-3', parentId: 'd-ops', type: 'position', label: 'STAFF MEMBER', personName: '— UNFUNDED —', status: 'UNFUNDED' },

  { id: 'p-tech-1', parentId: 'd-tech', type: 'position', label: 'TEAM LEAD', personName: 'SAMPLE PERSON E', status: 'FILLED' },
  { id: 'p-tech-2', parentId: 'd-tech', type: 'position', label: 'STAFF MEMBER', personName: 'SAMPLE PERSON F', status: 'FILLED' },
  { id: 'p-field-1', parentId: 'd-field', type: 'position', label: 'TEAM LEAD', personName: 'SAMPLE PERSON G', status: 'FILLED' },

  { id: 'p-fin-1', parentId: 'd-fin', type: 'position', label: 'FINANCE MANAGER', personName: 'SAMPLE PERSON H', status: 'FILLED' },
  { id: 'p-fin-2', parentId: 'd-fin', type: 'position', label: 'STAFF MEMBER', personName: '— VACANT —', status: 'VACANT' },
];
