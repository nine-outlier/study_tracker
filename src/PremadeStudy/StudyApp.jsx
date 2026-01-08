import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// =========================
// CONFIGURE PDF.JS WORKER
// =========================
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  console.warn('PDF Worker setup warning:', e);
}

// =========================
// PDF CACHE (IndexedDB)
// =========================
const PDF_CACHE_DB = 'StudyAppPDFCache';
const PDF_CACHE_STORE = 'pdf_cache';
const PDF_CACHE_VERSION = 1;

// bump this if you change cache schema
const PDF_CACHE_SCHEMA = 'v1';

const openPdfCacheDB = () =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB not supported'));

    const req = window.indexedDB.open(PDF_CACHE_DB, PDF_CACHE_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PDF_CACHE_STORE)) {
        db.createObjectStore(PDF_CACHE_STORE);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbGet = async (key) => {
  const db = await openPdfCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_CACHE_STORE, 'readonly');
    const store = tx.objectStore(PDF_CACHE_STORE);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
};

const idbSet = async (key, value) => {
  const db = await openPdfCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_CACHE_STORE, 'readwrite');
    const store = tx.objectStore(PDF_CACHE_STORE);
    const req = store.put(value, key);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
};

// =========================
// SMALL UTILS
// =========================
const escapeRegExp = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizePdfUrl = (pdfUrl) => {
  if (!pdfUrl) return '';
  let normalizedPath = pdfUrl.replace(/\\/g, '/');
  if (normalizedPath.startsWith('/public/')) normalizedPath = normalizedPath.replace('/public/', './');
  else if (normalizedPath.startsWith('/')) normalizedPath = `.${normalizedPath}`;
  else if (!normalizedPath.startsWith('./') && !normalizedPath.startsWith('http')) normalizedPath = `./${normalizedPath}`;
  return normalizedPath;
};

const cleanPdfUrl = (url) => String(url || '').split('?')[0].split('#')[0];

const makeCacheKey = ({ schema, title, cleanUrl }) => {
  // stable key per schema + title + url (safe encoded)
  const safeTitle = String(title || 'Untitled').replace(/\s/g, '');
  return `studyapp_pdf_cache_${schema}_${safeTitle}_${encodeURIComponent(cleanUrl)}`;
};

// =========================
// INTERSECTION OBSERVER HOOK
// =========================
const useInView = (options = { root: null, rootMargin: '200px', threshold: 0.1 }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, isInView];
};

// =========================
// PAGE RENDERER (ENHANCED VIEW)
// =========================
const PageRenderer = ({ pageNumber, pdfDocument, scale, syncData, searchTerm, onVisible }) => {
  const [containerRef, isInView] = useInView();
  const [renderedContent, setRenderedContent] = useState(null);

  useEffect(() => {
    if (isInView && onVisible) onVisible(pageNumber);
  }, [isInView, pageNumber, onVisible]);

  const applyTransform = (transform, [x, y]) => {
    return [
      transform[0] * x + transform[2] * y + transform[4],
      transform[1] * x + transform[3] * y + transform[5]
    ];
  };

  useEffect(() => {
    if (!isInView || !pdfDocument || !syncData) return;

    let cancelled = false;

    pdfDocument
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const termLower = searchTerm && searchTerm.length >= 1 ? searchTerm.toLowerCase() : null;

        const content = syncData.items.map((item, idx) => {
          if (!item.str || !item.str.trim()) return null;

          const [tx, ty] = applyTransform(viewport.transform, [item.x, item.y]);

          const fontHeight = Math.sqrt(
            item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]
          );
          const scaledFontSize = fontHeight * scale;

          const fName = (item.fontName || '').toLowerCase();
          const isBold = fName.includes('bold') || fName.includes('black');
          const isSerif = fName.includes('serif') || fName.includes('roman') || fName.includes('times');

          const style = {
            position: 'absolute',
            left: `${Math.round(tx)}px`,
            top: `${Math.round(ty - scaledFontSize)}px`,
            fontSize: `${Math.round(scaledFontSize)}px`,
            fontFamily: isSerif ? 'Georgia, serif' : 'Arial, sans-serif',
            fontWeight: isBold ? 'bold' : 'normal',
            lineHeight: '1.1',
            whiteSpace: 'pre',
            cursor: 'text',
            transformOrigin: '0% 0%',
            color: '#000000',
            zIndex: 1,
            pointerEvents: 'auto'
          };

          const isHighlight = termLower && item.str.toLowerCase().includes(termLower);

          return (
            <span key={idx} style={style} className={isHighlight ? 'bg-yellow-300' : ''}>
              {item.str}
            </span>
          );
        });

        setRenderedContent(content);
      })
      .catch((err) => console.error('Page Render Error:', err));

    return () => {
      cancelled = true;
    };
  }, [isInView, pdfDocument, scale, syncData, searchTerm, pageNumber]);

  const width = syncData ? Math.round(syncData.width * scale) : Math.round(612 * scale);
  const height = syncData ? Math.round(syncData.height * scale) : Math.round(792 * scale);

  return (
    <div
      id={`page-node-${pageNumber}`}
      ref={containerRef}
      className="relative bg-white shadow-xl mb-12 mx-auto transition-all duration-200 border border-slate-200"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minHeight: `${Math.round(792 * scale)}px`
      }}
    >
      {isInView && renderedContent ? (
        renderedContent
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <div className="flex flex-col items-center opacity-20 text-slate-400">
            <span className="text-2xl font-bold font-mono">Pg {pageNumber}</span>
            <span className="text-xs uppercase mt-2">Loading Content...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================
// MAIN APP
// =========================
// Future-ready: you can optionally pass a single `course` object later:
// <StudyApp course={{ title, domains, glossary, protocols, pdfUrl }} ... />
const StudyApp = ({
  title: titleProp,
  domains: domainsProp,
  glossary: glossaryProp,
  protocols: protocolsProp,
  pdfUrl: pdfUrlProp,
  course,
  onClose
}) => {
  // Backward-compatible props
  const title = course?.title ?? titleProp ?? 'Study';
  const domains = course?.domains ?? domainsProp ?? [];
  const glossary = course?.glossary ?? glossaryProp ?? [];
  const protocols = course?.protocols ?? protocolsProp ?? [];
  const pdfUrl = course?.pdfUrl ?? pdfUrlProp ?? '';

  const correctedPdfUrl = useMemo(() => normalizePdfUrl(pdfUrl), [pdfUrl]);

  const [activeTab, setActiveTab] = useState('domains');
  const [activeDomain, setActiveDomain] = useState(domains?.[0] ?? null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showFullPdf, setShowFullPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const [pdfTextContent, setPdfTextContent] = useState([]);
  const [syncMap, setSyncMap] = useState({});
  const [pdfDocument, setPdfDocument] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(0);

  const sectionRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const glossaryRefs = useRef({});
  const protocolRefs = useRef({});

  // prevent duplicate loads / race conditions
  const pdfLoadingPromiseRef = useRef(null);
  const scanRunIdRef = useRef(0);

  // keep activeDomain safe if domains changes
  useEffect(() => {
    if (!Array.isArray(domains) || domains.length === 0) {
      setActiveDomain(null);
      return;
    }
    setActiveDomain((prev) => {
      if (prev && domains.some((d) => d.id === prev.id)) return prev;
      return domains[0];
    });
  }, [domains]);

  const highlightTag = useCallback((text, term) => {
    if (!term || String(term).trim().length < 2) return text;
    const safe = escapeRegExp(String(term).trim());
    const regex = new RegExp(`(${safe})`, 'gi');

    return String(text).split(regex).map((part, i) =>
      i % 2 === 1 ? (
        <span
          key={i}
          className="bg-yellow-300 dark:bg-yellow-600 text-slate-900 px-0.5 rounded shadow-sm"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  }, []);

  const loadPdfDocument = useCallback(async () => {
    if (pdfDocument) return pdfDocument;
    if (!correctedPdfUrl) throw new Error('No PDF URL provided');

    if (pdfLoadingPromiseRef.current) return pdfLoadingPromiseRef.current;

    const loadingTask = pdfjsLib.getDocument(correctedPdfUrl);
    pdfLoadingPromiseRef.current = loadingTask.promise
      .then((pdf) => {
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        return pdf;
      })
      .finally(() => {
        // allow future reload if needed
        pdfLoadingPromiseRef.current = null;
      });

    return pdfLoadingPromiseRef.current;
  }, [pdfDocument, correctedPdfUrl]);

  const startRobot = useCallback(
    async (forceRescan = false) => {
      if (!correctedPdfUrl) return;
      if (status === 'synced' && !forceRescan) return;

      const runId = ++scanRunIdRef.current;

      const cUrl = cleanPdfUrl(correctedPdfUrl);
      const cacheKey = makeCacheKey({ schema: PDF_CACHE_SCHEMA, title, cleanUrl: cUrl });

      try {
        setErrorMessage(null);
        setStatus('indexing');
        setProgress(1);

        // 1) Cache-first (the "never scan again" path)
        if (!forceRescan) {
          try {
            const cached = await idbGet(cacheKey);
            if (runId !== scanRunIdRef.current) return;

            if (
              cached &&
              cached.schema === PDF_CACHE_SCHEMA &&
              Array.isArray(cached.pdfTextContent) &&
              cached.pdfTextContent.length > 0 &&
              cached.syncMap &&
              typeof cached.syncMap === 'object' &&
              cached.numPages
            ) {
              setPdfTextContent(cached.pdfTextContent);
              setSyncMap(cached.syncMap);
              setNumPages(cached.numPages);

              setStatus('synced');
              setProgress(100);
              return;
            }
          } catch (e) {
            console.warn('PDF cache read failed, falling back to scan:', e);
          }
        }

        // 2) No cache => do the full scan ONCE
        const pdf = await loadPdfDocument();
        if (runId !== scanRunIdRef.current) return;

        setProgress(5);

        // --- Text index (search) ---
        const fullText = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (runId !== scanRunIdRef.current) return;

          const content = await page.getTextContent();
          const str = content.items.map((item) => item.str).join(' ');
          fullText.push({ page: i, text: str });

          setProgress(Math.floor((i / pdf.numPages) * 40));
        }
        setPdfTextContent(fullText);

        // --- Sync map (Enhanced renderer positioning) ---
        setStatus('syncing');

        const BATCH_SIZE = 5;
        const fullSyncMap = {};

        for (let i = 1; i <= pdf.numPages; i += BATCH_SIZE) {
          const end = Math.min(i + BATCH_SIZE - 1, pdf.numPages);

          const batchResults = await Promise.all(
            Array.from({ length: end - i + 1 }, (_, off) => i + off).map(async (p) => {
              const page = await pdf.getPage(p);
              const viewport = page.getViewport({ scale: 1.0 });
              const textContent = await page.getTextContent();

              const textItems = textContent.items.map((item) => ({
                str: item.str,
                transform: item.transform,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width,
                height: item.height,
                fontName: item.fontName
              }));

              return {
                pageNumber: p,
                width: viewport.width,
                height: viewport.height,
                items: textItems
              };
            })
          );

          if (runId !== scanRunIdRef.current) return;

          const batchMap = {};
          batchResults.forEach((res) => {
            batchMap[res.pageNumber] = res;
            fullSyncMap[res.pageNumber] = res;
          });

          setSyncMap((prev) => ({ ...prev, ...batchMap }));

          const syncPercent = Math.floor((end / pdf.numPages) * 60);
          setProgress(40 + syncPercent);

          await new Promise((r) => setTimeout(r, 10));
        }

        // 3) Save finished scan ONCE
        try {
          await idbSet(cacheKey, {
            schema: PDF_CACHE_SCHEMA,
            numPages: pdf.numPages,
            pdfTextContent: fullText,
            syncMap: fullSyncMap,
            savedAt: Date.now()
          });
        } catch (e) {
          console.warn('PDF cache write failed (still works, just won’t persist):', e);
        }

        setStatus('synced');
        setProgress(100);
      } catch (err) {
        console.error('Robot Error', err);
        setErrorMessage('Sync Failed');
        setStatus('error');
      }
    },
    [correctedPdfUrl, title, loadPdfDocument, status]
  );

  useEffect(() => {
    startRobot(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRobot]);

  // Ensure PDF is loaded when opening Full Book (even on cache hit)
  useEffect(() => {
    if (!showFullPdf) return;
    if (status !== 'synced') return;

    if (!pdfDocument) {
      loadPdfDocument().catch((e) => console.error('PDF load failed:', e));
    }
  }, [showFullPdf, status, pdfDocument, loadPdfDocument]);

  const jumpToPage = useCallback(
    (num) => {
      const p = Math.max(1, Math.min(num, numPages || 1));
      setCurrentPage(p);

      // Enhanced-only: scroll to rendered page node
      const targetNode = document.getElementById(`page-node-${p}`);
      if (targetNode) {
        targetNode.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (scrollContainerRef.current && Object.keys(syncMap).length > 0) {
        // fallback: approximate offset if node isn't mounted yet
        let offset = 0;
        for (let i = 1; i < p; i++) {
          const h = syncMap[i] ? syncMap[i].height : syncMap[1]?.height || 792;
          offset += h * scale + 48;
        }
        scrollContainerRef.current.scrollTop = offset;
      }
    },
    [numPages, syncMap, scale]
  );

  const jumpToSection = useCallback(
    (sectionId) => {
      const domain = (domains || []).find((d) => d.sections?.some((s) => s.id === sectionId));
      if (!domain) return;

      if (!activeDomain || domain.id !== activeDomain.id) setActiveDomain(domain);

      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
    [domains, activeDomain]
  );

  const jumpToGlossary = useCallback((idx) => {
    setShowFullPdf(false);
    setActiveTab('glossary');
    setTimeout(() => {
      glossaryRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, []);

  const jumpToProtocol = useCallback((idx) => {
    setShowFullPdf(false);
    setActiveTab('protocols');
    setTimeout(() => {
      protocolRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, []);

  // =========================
  // SEARCH (Future-ready)
  // - Adding a new study content type later = add an adapter + include in results UI
  // =========================
  const searchResults = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) {
      return {
        directTopics: [],
        mentionedTopics: [],
        pdfHits: [],
        glossaryHits: [],
        protocolHits: []
      };
    }

    const directTopics = [];
    const mentionedTopics = [];

    (domains || []).forEach((d) =>
      (d.sections || []).forEach((s) => {
        if ((s.title || '').toLowerCase().includes('additional notes')) return;

        const inTitle = String(s.title || '').toLowerCase().includes(term);
        const inContent = String(s.content || '').toLowerCase().includes(term);
        const inTags = (s.tags || []).some((t) => String(t || '').toLowerCase().includes(term));

        if (inTitle) directTopics.push(s);
        else if (inContent || inTags) mentionedTopics.push(s);
      })
    );

    const pdfHits = (pdfTextContent || [])
      .filter((p) => String(p.text || '').toLowerCase().includes(term))
      .slice(0, 200)
      .map((p) => {
        const full = String(p.text || '');
        const idx = full.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 30);
        const end = Math.min(full.length, idx + 90);
        return { page: p.page, preview: `...${full.substring(start, end)}...` };
      });

    const glossaryHits = (glossary || [])
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) =>
        `${item?.term || ''} ${item?.def || ''}`.toLowerCase().includes(term)
      )
      .slice(0, 50);

    const protocolHits = (protocols || [])
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) =>
        `${item?.name || ''} ${item?.port || ''} ${item?.desc || ''}`.toLowerCase().includes(term)
      )
      .slice(0, 50);

    return { directTopics, mentionedTopics, pdfHits, glossaryHits, protocolHits };
  }, [searchTerm, domains, glossary, protocols, pdfTextContent]);

  const { directTopics, mentionedTopics, pdfHits, glossaryHits, protocolHits } = searchResults;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-900 animate-fadeIn text-slate-900 dark:text-slate-100 overflow-hidden">
      {!showFullPdf && (
        <div className="bg-white dark:bg-slate-950 px-4 border-b border-slate-200 dark:border-slate-800 flex justify-between shadow-sm shrink-0 h-16">
          <div className="flex h-full space-x-8">
            <div className="flex items-center space-x-3 self-center">
              <div className="bg-sky-600 p-2 rounded-lg shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="hidden md:block">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex space-x-6 h-full items-end">
              {['domains', 'glossary', 'protocols'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-1 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-[3px] -mb-[1px] ${
                    activeTab === tab
                      ? 'text-sky-600 border-sky-600'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 self-center">
            <div
              className={`hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all duration-500 ${
                status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : status === 'synced'
                    ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300'
                    : 'bg-orange-50 border-orange-200 text-orange-600'
              }`}
            >
              {status !== 'synced' && status !== 'error' && (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="uppercase tracking-wider">Loading... {Math.max(5, progress)}%</span>
                </>
              )}
              {status === 'synced' && <span className="uppercase tracking-wider">Synced</span>}
              {status === 'error' && <span>{errorMessage || 'Sync Failed'}</span>}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullPdf(true)}
                className="px-3 py-1.5 rounded-md text-xs font-bold border transition-all bg-white text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm"
              >
                Full Book
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showFullPdf ? (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFullPdf(false)}
                  className="flex items-center text-sky-600 hover:text-sky-700 font-bold text-sm transition-colors group"
                >
                  <div className="bg-sky-100 group-hover:bg-sky-200 p-1.5 rounded-full mr-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                  Back to Guide
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  title="Close App"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search (PDF + Topics + Glossary + Protocols)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-1 py-1">
                    <button
                      onClick={() => jumpToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      {currentPage} / {numPages}
                    </span>
                    <button
                      onClick={() => jumpToPage(currentPage + 1)}
                      disabled={currentPage >= numPages}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-1 py-1">
                    <button
                      onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                      className="px-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 min-w-[42px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale((s) => Math.min(3.0, s + 0.1))}
                      className="px-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {searchTerm ? (
                <>
                  {directTopics.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-sky-600 uppercase px-2 mb-2 tracking-wider mt-2">
                        Topic Matches
                      </div>
                      {directTopics.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => (s.page ? jumpToPage(s.page) : setShowFullPdf(false))}
                          className="w-full text-left text-sm py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sky-600 font-medium flex items-center justify-between"
                        >
                          <span>{highlightTag(s.title, searchTerm)}</span>
                          <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                            Topic
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {pdfHits.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-slate-400 uppercase px-2 mb-2 tracking-wider">
                        PDF Text Matches
                      </div>
                      {pdfHits.map((hit, idx) => (
                        <button
                          key={idx}
                          onClick={() => jumpToPage(hit.page)}
                          className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg border border-transparent hover:border-sky-100 mb-1 group transition-all"
                        >
                          <span className="font-bold text-sky-600 text-xs mr-2">Pg {hit.page}</span>
                          <span className="text-xs opacity-80">{highlightTag(hit.preview, searchTerm)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {glossaryHits.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-emerald-600 uppercase px-2 mb-2 tracking-wider">
                        Glossary Matches
                      </div>
                      {glossaryHits.map(({ item, idx }) => (
                        <button
                          key={`fp-g-${idx}`}
                          onClick={() => jumpToGlossary(idx)}
                          className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-emerald-100 mb-1 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-700">
                              {highlightTag(item.term, searchTerm)}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Glossary
                            </span>
                          </div>
                          <div className="text-xs opacity-80 mt-1">{highlightTag(item.def, searchTerm)}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {protocolHits.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-violet-600 uppercase px-2 mb-2 tracking-wider">
                        Protocol Matches
                      </div>
                      {protocolHits.map(({ item, idx }) => (
                        <button
                          key={`fp-p-${idx}`}
                          onClick={() => jumpToProtocol(idx)}
                          className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-violet-100 mb-1 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-violet-700">
                              {highlightTag(item.name, searchTerm)}{' '}
                              <span className="text-xs font-mono opacity-80">
                                ({highlightTag(item.port, searchTerm)})
                              </span>
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200">
                              Protocol
                            </span>
                          </div>
                          <div className="text-xs opacity-80 mt-1">{highlightTag(item.desc, searchTerm)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                (domains || []).map((d) => (
                  <div key={d.id} className="mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 tracking-wider sticky top-0 bg-white dark:bg-slate-950 py-1">
                      {d.title}
                    </div>
                    {(d.sections || [])
                      .filter((s) => !(s.title || '').toLowerCase().includes('additional notes'))
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => (s.page ? jumpToPage(s.page) : null)}
                          className="block w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors truncate"
                        >
                          {s.title}
                        </button>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative bg-slate-200 dark:bg-gray-900/50">
            <div ref={scrollContainerRef} className="flex-1 overflow-auto flex justify-center p-8 bg-slate-200 dark:bg-black/80">
              <div className="flex flex-col items-center w-full pb-32">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <PageRenderer
                    key={pageNum}
                    pageNumber={pageNum}
                    pdfDocument={pdfDocument}
                    scale={scale}
                    syncData={syncMap[pageNum]}
                    searchTerm={searchTerm}
                    onVisible={setCurrentPage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full px-6 py-6 h-full">
          <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-0">
            {activeTab === 'domains' && (
              <>
                <div className="w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto hidden md:flex flex-col p-4 shrink-0">
                  <input
                    type="text"
                    placeholder="Search topics, glossary, protocols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-sky-500 outline-none"
                  />

                  {searchTerm ? (
                    <div className="space-y-3">
                      {directTopics.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-sky-600 uppercase px-2 tracking-wider">
                            Topic Matches
                          </div>
                          {directTopics.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => jumpToSection(s.id)}
                              className="w-full text-left text-sm py-2 px-3 hover:bg-sky-50 rounded-md text-sky-600 font-medium flex items-center justify-between"
                            >
                              <span>{highlightTag(s.title, searchTerm)}</span>
                              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                                Topic
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {mentionedTopics.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">
                            Mentioned In Topics
                          </div>
                          {mentionedTopics.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => jumpToSection(s.id)}
                              className="w-full text-left text-sm py-2 px-3 hover:bg-slate-100 rounded-md text-slate-600 flex items-center justify-between"
                            >
                              <span>{highlightTag(s.title, searchTerm)}</span>
                              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                Topic
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {glossaryHits.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-bold text-emerald-600 uppercase px-2 mb-2 tracking-wider">
                            Glossary Matches
                          </div>
                          {glossaryHits.map(({ item, idx }) => (
                            <button
                              key={`g-${idx}`}
                              onClick={() => jumpToGlossary(idx)}
                              className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-emerald-100 mb-1 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-700">
                                  {highlightTag(item.term, searchTerm)}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Glossary
                                </span>
                              </div>
                              <div className="text-xs opacity-80 mt-1">{highlightTag(item.def, searchTerm)}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {protocolHits.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-bold text-violet-600 uppercase px-2 mb-2 tracking-wider">
                            Protocol Matches
                          </div>
                          {protocolHits.map(({ item, idx }) => (
                            <button
                              key={`p-${idx}`}
                              onClick={() => jumpToProtocol(idx)}
                              className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-violet-100 mb-1 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-violet-700">
                                  {highlightTag(item.name, searchTerm)}{' '}
                                  <span className="text-xs font-mono opacity-80">
                                    ({highlightTag(item.port, searchTerm)})
                                  </span>
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200">
                                  Protocol
                                </span>
                              </div>
                              <div className="text-xs opacity-80 mt-1">{highlightTag(item.desc, searchTerm)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    (domains || []).map((d) => (
                      <div key={d.id} className="mb-4">
                        <div className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider pl-2">
                          Domain {d.id}
                        </div>
                        <div className="space-y-0.5">
                          {(d.sections || []).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => jumpToSection(s.id)}
                              className="block w-full text-left text-sm py-1.5 px-3 text-slate-600 dark:text-slate-200 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors truncate"
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-4xl font-bold dark:text-white mb-8 border-b pb-4">
                      {activeDomain?.title || 'Domains'}
                    </h1>

                    {(activeDomain?.sections || []).map((section) => (
                      <div
                        key={section.id}
                        ref={(el) => (sectionRefs.current[section.id] = el)}
                        className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-300 ${
                          expandedSections[section.id]
                            ? 'border-sky-200 shadow-lg ring-1 ring-sky-100'
                            : 'border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <button
                          onClick={() =>
                            setExpandedSections((p) => ({ ...p, [section.id]: !p[section.id] }))
                          }
                          className="w-full text-left p-6 flex justify-between items-start group"
                        >
                          <div>
                            <h3 className="text-xl font-bold dark:text-white mb-3 group-hover:text-sky-600 transition-colors">
                              {highlightTag(section.title, searchTerm)}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(section.tags || []).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 px-2 py-1 rounded"
                                >
                                  {highlightTag(tag, searchTerm)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div
                            className={`mt-1 p-2 rounded-full transition-colors ${
                              expandedSections[section.id]
                                ? 'bg-sky-100 text-sky-600'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500'
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform duration-300 ${
                                expandedSections[section.id] ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {expandedSections[section.id] && (
                          <div className="p-8 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 font-sans prose dark:prose-invert max-w-none text-black dark:text-white leading-relaxed animate-fadeIn">
                            {String(section.content || '')
                              .split('\n')
                              .map((line, i) => (
                                <div
                                  key={i}
                                  className={
                                    line.startsWith('[+]')
                                      ? 'text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 mb-2 text-sm font-medium'
                                      : line.startsWith('[-]')
                                        ? 'text-red-700 bg-red-50 p-2 rounded border border-red-100 mb-2 text-sm font-medium'
                                        : line === line.toUpperCase() && line.length > 5
                                          ? 'font-bold text-black dark:text-white text-sm tracking-wide mt-6 mb-2 uppercase'
                                          : 'mb-1'
                                  }
                                >
                                  {highlightTag(line.replace(/\[.\]/, ''), searchTerm)}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'glossary' && (
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(glossary || []).map((item, i) => (
                    <div
                      key={i}
                      ref={(el) => (glossaryRefs.current[i] = el)}
                      className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800"
                    >
                      <div className="font-bold text-sky-600 mb-2 text-lg">
                        {highlightTag(item.term, searchTerm)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {highlightTag(item.def, searchTerm)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'protocols' && (
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                          Protocol
                        </th>
                        <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                          Port
                        </th>
                        <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(protocols || []).map((p, i) => (
                        <tr
                          key={i}
                          ref={(el) => (protocolRefs.current[i] = el)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-sky-600">
                            {highlightTag(p.name, searchTerm)}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-500 font-medium">
                            {highlightTag(p.port, searchTerm)}
                          </td>
                          <td className="py-4 px-6 text-slate-600">{highlightTag(p.desc, searchTerm)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyApp;