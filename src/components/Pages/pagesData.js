// Default seed data — replace with API calls in production
export const INITIAL_PAGES = [
  {
    id: 'welcome',
    title: 'Welcome to Pages',
    parentId: null,
    content: '<h2>Welcome to Pages</h2><p>Start creating your documentation here.</p><p>Use the toolbar to format your text with <strong>bold</strong>, <em>italic</em>, lists, and more!</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    parentId: 'welcome',
    content: '<h2>Getting Started</h2><p>This page will guide you through the basics of using Pages.</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'policies',
    title: 'Policies & Procedures',
    parentId: null,
    content: '<h2>Policies & Procedures</h2><p>Document your organization\'s policies here.</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'action-plans',
    title: 'Action Plans',
    parentId: null,
    content: '<h2>Action Plans</h2><p>Track and document your annual action plans.</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'caper-reports',
    title: 'CAPER Reports',
    parentId: null,
    content: '<h2>CAPER Reports</h2><p>Consolidated Annual Performance and Evaluation Reports.</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const buildPageTree = (pages) => {
  const map = {};
  const roots = [];
  pages.forEach((p) => { map[p.id] = { ...p, children: [] }; });
  pages.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });
  return roots;
};
