// --- DOMAIN IDENTIFICATION & HIERARCHY HELPERS ---

/**
 * Maps legacy domain names to their numeric IDs using a provided map.
 * Handles both { "Name": "1.0" } and { "1": "Name" } formats.
 */
export const getDomainId = (domainName, domainMap = {}) => {
  if (!domainName) return '0.0';

  // 1. Direct lookup (Name -> ID)
  if (domainMap[domainName]) return domainMap[domainName];

  // 2. Reverse lookup (ID -> Name) - common in data files like NetworkPlus.jsx
  // e.g. D_NAMES = { 1: "Networking Fundamentals" }
  const foundKey = Object.keys(domainMap).find(key => domainMap[key] === domainName);
  
  if (foundKey) {
      // Ensure "1" becomes "1.0", but "1.2" stays "1.2"
      return foundKey.includes('.') ? foundKey : `${foundKey}.0`;
  }

  return '0.0';
};

/**
 * Parses a domain string to extract its code (e.g., "1.1") and name.
 * Handles "1.1 Title", "1.0 Title", or just "Title" (using map for lookup).
 */
export const getDomainMeta = (domainLabel, domainMap = {}) => {
  const raw = (domainLabel ?? '').toString().trim();
  
  // Regex matches: "1.1 Title", "1.0 Title", "10.2 Title", "1.1"
  const match = raw.match(/^\s*(\d+(?:\.\d+)*)\s*(?:[-:–—]\s*)?(.*)$/);
  
  if (match && match[1]) {
    const code = match[1];
    let name = (match[2] || '').trim();

    // If we have a code but no name, try to look it up in the map
    if (!name) {
       if (domainMap[code]) name = domainMap[code];
       else if (domainMap[parseInt(code)]) name = domainMap[parseInt(code)];
    }

    // If we still have no name, default to the raw string (if it wasn't just the code)
    if (!name && match[0] === code) name = raw; 

    return { code, name: name || raw };
  }
  
  // Fallback: No number found in string, try to look up ID from Name
  return { code: getDomainId(raw, domainMap), name: raw };
};

/**
 * Groups a flat list of domains into a hierarchy (Parent 1.0 -> Children 1.1, 1.2).
 * Automatically detects parent titles from the question source or domainMap.
 */
export const groupDomains = (domains, questionsSource = [], domainMap = {}) => {
  const groups = {};
  
  const findDomainTitle = (majorId) => {
    // 1. Try map lookup
    if (domainMap[majorId]) return domainMap[majorId];
    if (domainMap[parseInt(majorId)]) return domainMap[parseInt(majorId)];

    // 2. Try finding in questions source
    const match = questionsSource.find(q => {
        const sec = q.section || q.domain || '';
        return sec.startsWith(`${majorId}.`) || sec === majorId;
    });
    return match ? match.domain : `Domain ${majorId}`;
  };

  domains.forEach(d => {
    const meta = getDomainMeta(d, domainMap);
    const major = meta.code.split('.')[0];
    
    if (!groups[major]) {
      groups[major] = { id: major, title: '', children: [] };
    }
    
    groups[major].children.push({ original: d, ...meta });
    
    // Use mapped name if available for parent title
    if ((meta.code === `${major}.0` || meta.code === major) && meta.name && meta.name !== meta.code) {
        groups[major].title = meta.name;
    }
  });

  Object.values(groups).forEach(g => {
      if (!g.title) {
          g.title = findDomainTitle(g.id);
      }
  });

  return Object.values(groups)
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    .map(g => ({
      ...g,
      children: g.children.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    }));
};