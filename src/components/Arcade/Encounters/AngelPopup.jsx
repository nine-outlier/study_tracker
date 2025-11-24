import React from 'react';

const AngelPopup = ({ message = "ANGEL BLESSING: +1 LIFE" }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] animate-bounce">
     <div className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.6)] border-2 border-yellow-200">
         {message} 🪽
     </div>
  </div>
);

export default AngelPopup;