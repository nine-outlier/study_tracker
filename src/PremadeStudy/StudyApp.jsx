import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- HELPER HOOK: USE IN VIEW ---
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

// --- HELPER COMPONENT: PAGE RENDERER ---
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

    pdfDocument.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale });
        
        const content = syncData.items.map((item, idx) => {
          if (!item.str || !item.str.trim()) return null;

          const [tx, ty] = applyTransform(viewport.transform, [item.x, item.y]);
          
          const fontHeight = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);
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

          const termLower = searchTerm && searchTerm.length >= 1 ? searchTerm.toLowerCase() : null;
          const isHighlight = termLower && item.str.toLowerCase().includes(termLower);

          return (
            <span 
                key={idx} 
                style={style}
                className={isHighlight ? 'bg-yellow-300' : ''}
            >
              {item.str}
            </span>
          );
        });

        setRenderedContent(content);
    }).catch(err => console.error("Page Render Error:", err));

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

// --- MAIN COMPONENT: STUDY APP ---
const StudyApp = ({ title, domains = [], glossary, protocols, pdfUrl, onClose }) => {
  const [activeTab, setActiveTab] = useState('domains'); 
  const [activeDomain, setActiveDomain] = useState(domains.length > 0 ? domains[0] : null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showFullPdf, setShowFullPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const [pdfTextContent, setPdfTextContent] = useState([]);
  const [syncMap, setSyncMap] = useState({});
  const [pdfDocument, setPdfDocument] = useState(null);
  const [libLoaded, setLibLoaded] = useState(false);

  const [useFakeBook, setUseFakeBook] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(0);
  
  const sectionRefs = useRef({});
  const pdfFrameRef = useRef(null);
  const scrollContainerRef = useRef(null); 

  // --- DYNAMIC PDF.JS LOADER ---
  useEffect(() => {
    if (window.pdfjsLib) {
      setLibLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setLibLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  let normalizedPath = pdfUrl.replace(/\\/g, '/');
  if (normalizedPath.startsWith('/public/')) normalizedPath = normalizedPath.replace('/public/', './');
  else if (normalizedPath.startsWith('/')) normalizedPath = `.${normalizedPath}`;
  else if (!normalizedPath.startsWith('./') && !normalizedPath.startsWith('http')) normalizedPath = `./${normalizedPath}`;
  const correctedPdfUrl = normalizedPath;

  const startRobot = useCallback(async (forceRescan = false) => {
    // Only run if the library is loaded
    if (!libLoaded || (status === 'synced' && !forceRescan)) return;
    
    // Access global pdfjsLib
    const pdfLib = window.pdfjsLib;
    if (!pdfLib) return;

    const cacheKeyIndex = `pdf_index_${title.replace(/\s/g, '')}_v10_fixed`;
    
    try {
      setStatus('indexing');
      setProgress(1);

      let pdf = pdfDocument;
      if (!pdf) {
        const loadingTask = pdfLib.getDocument(correctedPdfUrl);
        pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
      }

      let fullText = [];
      const cachedIndex = !forceRescan ? localStorage.getItem(cacheKeyIndex) : null;
      
      if (cachedIndex) {
        fullText = JSON.parse(cachedIndex);
        setPdfTextContent(fullText);
        setProgress(40); 
      } else {
        for (let i = 1; i <= pdf.numPages; i++) {
           const page = await pdf.getPage(i);
           const content = await page.getTextContent();
           const str = content.items.map(item => item.str).join(' ');
           fullText.push({ page: i, text: str });
           setProgress(Math.floor((i / pdf.numPages) * 40));
        }
        setPdfTextContent(fullText);
        localStorage.setItem(cacheKeyIndex, JSON.stringify(fullText));
      }

      setStatus('syncing');
      const BATCH_SIZE = 5;
      
      for (let i = 1; i <= pdf.numPages; i += BATCH_SIZE) {
        const end = Math.min(i + BATCH_SIZE - 1, pdf.numPages);
        const promises = [];

        for (let p = i; p <= end; p++) {
          promises.push(pdf.getPage(p).then(async (page) => {
            const viewport = page.getViewport({ scale: 1.0 });
            const textContent = await page.getTextContent();
            
            const textItems = textContent.items.map(item => ({
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
          }));
        }

        const batchResults = await Promise.all(promises);
        const batchMap = {};
        batchResults.forEach(res => {
          batchMap[res.pageNumber] = res;
        });
        setSyncMap(prev => ({ ...prev, ...batchMap }));

        const syncPercent = Math.floor((end / pdf.numPages) * 60);
        setProgress(40 + syncPercent);
        
        await new Promise(r => setTimeout(r, 10));
      }

      setStatus('synced');
      setProgress(100);

    } catch (err) {
      console.error("Robot Error", err);
      setErrorMessage("Sync Failed");
      setStatus('error');
    }
  }, [correctedPdfUrl, title, pdfDocument, status, libLoaded]);

  useEffect(() => {
    startRobot();
  }, [startRobot]);

  const jumpToPage = (num) => {
    const p = Math.max(1, Math.min(num, numPages));
    setCurrentPage(p);
    
    if (useFakeBook) {
        const targetNode = document.getElementById(`page-node-${p}`);
        if (targetNode) {
            targetNode.scrollIntoView({ behavior: 'auto', block: 'start' });
        } 
        else if (scrollContainerRef.current && Object.keys(syncMap).length > 0) {
             let offset = 0;
             for (let i = 1; i < p; i++) {
                 const h = syncMap[i] ? syncMap[i].height : (syncMap[1]?.height || 792);
                 offset += (h * scale) + 48;
             }
             scrollContainerRef.current.scrollTop = offset;
        }
    } else {
        if (pdfFrameRef.current) {
            const cleanUrl = correctedPdfUrl.split('?')[0].split('#')[0];
            pdfFrameRef.current.src = `${cleanUrl}#page=${p}&toolbar=0&navpanes=0`;
        }
    }
  };

  const jumpToSection = (sectionId) => {
      const domain = domains.find(d => d.sections.some(s => s.id === sectionId));
      if (domain) {
          if (domain.id !== activeDomain.id) setActiveDomain(domain);
          setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
          setTimeout(() => {
              if (sectionRefs.current[sectionId]) {
                  sectionRefs.current[sectionId].scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
          }, 100);
      }
  };

  const highlightTag = (text, term) => {
      if (!term || term.trim().length < 2) return text;
      const regex = new RegExp(`(\\b${term.trim()}\\b)`, 'gi');
      return text.split(regex).map((part, i) => 
        regex.test(part) ? <span key={i} className="bg-yellow-300 dark:bg-yellow-600 text-slate-900 px-0.5 rounded shadow-sm">{part}</span> : part
      );
  };

  // --- SEARCH LOGIC (Updated to use 'domains' prop) ---
  const { direct: directResults, mentioned: mentionedResults, pdfHits } = (() => {
    if (!searchTerm || searchTerm.length < 1) return { direct: [], mentioned: [], pdfHits: [] };
    const regex = new RegExp(`\\b${searchTerm.trim()}\\b`, 'i');
    
    const direct = [];
    const mentioned = [];
    // Strictly use the 'domains' prop
    if (domains && domains.length > 0) {
        domains.forEach(d => d.sections.forEach(s => {
            if (s.title.toLowerCase().includes("additional notes")) return;

            if (regex.test(s.title)) direct.push(s);
            else if (regex.test(s.content) || s.tags?.some(t => regex.test(t))) mentioned.push(s);
        }));
    }

    const hits = pdfTextContent
        .filter(p => regex.test(p.text))
        .map(p => ({ page: p.page, preview: `...${p.text.substring(p.text.search(regex) - 20, p.text.search(regex) + 60)}...` }));
        
    return { direct, mentioned, pdfHits: hits };
  })();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-900 animate-fadeIn text-slate-900 dark:text-slate-100 overflow-hidden">
      {!showFullPdf && (
        <div className="bg-white dark:bg-slate-950 px-4 border-b border-slate-200 dark:border-slate-800 flex justify-between shadow-sm shrink-0 h-16">
          <div className="flex h-full space-x-8">
            <div className="flex items-center space-x-3 self-center">
              <div className="bg-sky-600 p-2 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="hidden md:block">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none">{title}</h2>
              </div>
            </div>

            <div className="flex space-x-6 h-full items-end">
              {['domains', 'glossary', 'protocols'].map(tab => (
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
            <div className={`hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all duration-500 ${
                status === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                status === 'synced' ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300' :
                'bg-orange-50 border-orange-200 text-orange-600'
            }`}>
                {status !== 'synced' && status !== 'error' && (
                    <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="uppercase tracking-wider">Loading... {Math.max(5, progress)}%</span>
                    </>
                )}
                {status === 'synced' && <span className="uppercase tracking-wider">Synced</span>}
                {status === 'error' && <span>Sync Failed</span>}
            </div>

            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowFullPdf(true)}
                  className="px-3 py-1.5 rounded-md text-xs font-bold border transition-all bg-white text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm"
                >
                  Full Book
                </button>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </div>
                            Back to Guide
                          </button>
                          
                          <button 
                            onClick={onClose} 
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            title="Close App"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>

                      <div className="relative">
                          <input 
                              type="text" 
                              placeholder="Search in book..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-3 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          />
                      </div>

                      <div className="flex flex-col space-y-3">
                          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                              <button 
                                  onClick={() => setUseFakeBook(false)}
                                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!useFakeBook ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                              >
                                  Standard
                              </button>
                              <button 
                                  onClick={() => status === 'synced' && setUseFakeBook(true)}
                                  disabled={status !== 'synced'}
                                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center transition-all ${
                                      useFakeBook ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 
                                      status !== 'synced' ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                  }`}
                              >
                                  Enhanced
                                  {status !== 'synced' && <svg className="w-3 h-3 ml-1 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                              </button>
                          </div>

                          <div className="flex items-center space-x-2">
                              <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-1 py-1">
                                  <button onClick={() => jumpToPage(currentPage - 1)} disabled={currentPage <= 1} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-30">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                  </button>
                                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                      {currentPage} / {numPages}
                                  </span>
                                  <button onClick={() => jumpToPage(currentPage + 1)} disabled={currentPage >= numPages} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 disabled:opacity-30">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  </button>
                              </div>
                              
                              {useFakeBook && (
                                <div className="flex items-center bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-1 py-1">
                                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold">-</button>
                                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 min-w-[30px] text-center">
                                        {Math.round(scale * 100)}%
                                    </span>
                                    <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="px-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold">+</button>
                                </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                      {searchTerm ? (
                          <>
                              {directResults.length > 0 && (
                                  <div className="mb-4">
                                      <div className="text-xs font-bold text-sky-600 uppercase px-2 mb-2 tracking-wider mt-2">Topic Matches</div>
                                      {directResults.map(s => <button key={s.id} onClick={() => jumpToPage(s.page)} className="w-full text-left text-sm py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sky-600 font-medium">{s.title}</button>)}
                                  </div>
                              )}

                              {pdfHits.length > 0 && (
                                  <div className="mb-4">
                                      <div className="text-xs font-bold text-slate-400 uppercase px-2 mb-2 tracking-wider">Text Matches</div>
                                      {pdfHits.map((hit, idx) => (
                                          <button key={idx} onClick={() => { jumpToPage(hit.page); }} className="w-full text-left text-sm text-slate-700 dark:text-slate-300 px-3 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg border border-transparent hover:border-sky-100 mb-1 group transition-all">
                                              <span className="font-bold text-sky-600 text-xs mr-2">Pg {hit.page}</span>
                                              <span className="text-xs opacity-80">{highlightTag(hit.preview, searchTerm)}</span>
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </>
                      ) : (
                          domains.map(d => (
                              <div key={d.id} className="mb-4">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 tracking-wider sticky top-0 bg-white dark:bg-slate-950 py-1">{d.title}</div>
                                  {d.sections
                                    .filter(s => !s.title.toLowerCase().includes('additional notes'))
                                    .map(s => (
                                      <button key={s.id} onClick={() => jumpToPage(s.page)} className="block w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors truncate">
                                          {s.title}
                                      </button>
                                  ))}
                              </div>
                          ))
                      )}
                  </div>
              </div>

              <div className="flex-1 flex flex-col relative bg-slate-200 dark:bg-gray-900/50">
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-auto flex justify-center p-8 bg-slate-200 dark:bg-black/80"
                  >
                      {useFakeBook ? (
                          <div className="flex flex-col items-center w-full pb-32">
                              {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
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
                      ) : (
                          <div className="w-full h-full max-w-5xl px-0 lg:px-8">
                              <iframe 
                                  key={currentPage}
                                  ref={pdfFrameRef}
                                  src={`${correctedPdfUrl.split('?')[0].split('#')[0]}#page=${currentPage}&toolbar=0&navpanes=0`} 
                                  className="w-full h-full bg-white rounded-lg shadow-2xl border border-slate-300"
                                  title="Original Document"
                              />
                          </div>
                      )}
                  </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full px-6 py-6 h-full">
              <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-0">
                  {activeTab === 'domains' && (
                      <>
                      <div className="w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto hidden md:flex flex-col p-4 shrink-0">
                          <input type="text" placeholder="Filter topics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-sky-500 outline-none" />
                          {searchTerm ? (
                              <div className="space-y-1">
                                  {directResults.map(s => <button key={s.id} onClick={() => jumpToSection(s.id)} className="w-full text-left text-sm py-2 px-3 hover:bg-sky-50 rounded-md text-sky-600 font-medium">{s.title}</button>)}
                                  {mentionedResults.map(s => <button key={s.id} onClick={() => jumpToSection(s.id)} className="w-full text-left text-sm py-2 px-3 hover:bg-slate-100 rounded-md text-slate-600">{s.title}</button>)}
                              </div>
                          ) : (
                              domains.map(d => (
                                  <div key={d.id} className="mb-4">
                                      <div className="font-bold text-xs uppercase text-slate-200 mb-2 tracking-wider pl-2">Domain {d.id}</div>
                                      <div className="space-y-0.5">
                                          {d.sections.map(s => (
                                              <button key={s.id} onClick={() => jumpToSection(s.id)} className="block w-full text-left text-sm py-1.5 px-3 text-slate-600 dark:text-slate-200 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors truncate">
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
                              {activeDomain && (
                                <>
                                <h1 className="text-4xl font-bold dark:text-white mb-8 border-b pb-4">{activeDomain.title}</h1>
                                {activeDomain.sections.map(section => (
                                    <div key={section.id} ref={el => sectionRefs.current[section.id] = el} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-300 ${expandedSections[section.id] ? 'border-sky-200 shadow-lg ring-1 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}>
                                        <button onClick={() => setExpandedSections(p => ({...p, [section.id]: !p[section.id]}))} className="w-full text-left p-6 flex justify-between items-start group">
                                            <div>
                                                <h3 className="text-xl font-bold dark:text-white mb-3 group-hover:text-sky-600 transition-colors">{highlightTag(section.title, searchTerm)}</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {section.tags && section.tags.map(tag => <span key={tag} className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 px-2 py-1 rounded">{highlightTag(tag, searchTerm)}</span>)}
                                                </div>
                                            </div>
                                            <div className={`mt-1 p-2 rounded-full transition-colors ${expandedSections[section.id] ? 'bg-sky-100 text-sky-600' : 'bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500'}`}><svg className={`w-5 h-5 transition-transform duration-300 ${expandedSections[section.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                                        </button>
                                        {expandedSections[section.id] && (
                                            <div className="p-8 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 font-sans prose dark:prose-invert max-w-none text-black dark:text-white leading-relaxed animate-fadeIn">
                                                {section.content.split('\n').map((line, i) => (
                                                    <div key={i} className={line.startsWith('[+]') ? "text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 mb-2 text-sm font-medium" : line.startsWith('[-]') ? "text-red-700 bg-red-50 p-2 rounded border border-red-100 mb-2 text-sm font-medium" : line === line.toUpperCase() && line.length > 5 ? "font-bold text-black dark:text-white text-sm tracking-wide mt-6 mb-2 uppercase" : "mb-1"}>
                                                        {highlightTag(line.replace(/\[.\]/, ''), searchTerm)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </>
                              )}
                            </div>
                      </div>
                      </>
                  )}
                  {activeTab === 'glossary' && (
                      <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {glossary && glossary.map((item, i) => <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800"><div className="font-bold text-sky-600 mb-2 text-lg">{item.term}</div><div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.def}</div></div>)}
                        </div>
                      </div>
                  )}
                  {activeTab === 'protocols' && (
                      <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                              <table className="w-full text-left border-collapse">
                                  <thead><tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Protocol</th><th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Port</th><th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Description</th></tr></thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{protocols && protocols.map((p, i) => <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"><td className="py-4 px-6 font-mono font-bold text-sky-600">{p.name}</td><td className="py-4 px-6 font-mono text-slate-500 font-medium">{p.port}</td><td className="py-4 px-6 text-slate-600">{p.desc}</td></tr>)}</tbody>
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