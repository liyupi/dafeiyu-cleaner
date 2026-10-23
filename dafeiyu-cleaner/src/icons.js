/* 手绘线性图标（替代 Emoji，24×24，跟随 currentColor） */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const P = {
    fish: '<path d="M2 12c2.6-4.4 7.6-6.2 12-4l6.5-4v16L14 16c-4.4 2.2-9.4.4-12-4z" fill="currentColor" stroke="none"/><circle cx="7.2" cy="11" r="1.5" fill="#fff" stroke="none"/>',
    bowl: '<path d="M3 11h18c-.6 5-4.3 8-9 8s-8.4-3-9-8z"/><path d="M9.5 19l-.5 2h6l-.5-2"/><path d="M5.5 11c.3-2.6 2.4-4 4.5-3.3C11 5.6 13 5 14.6 6.3c1.8-.7 3.8.6 3.9 4.7"/>',
    snap: '<path d="M8 21v-5.5L5.2 11.6a1.6 1.6 0 0 1 2.6-1.9L9 11.3V5.5a1.5 1.5 0 0 1 3 0V10m0 0V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0v8c0 3-2 5.5-5 5.5"/><path d="M19 2.5l.6 1.8 1.9.6-1.9.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z" fill="currentColor"/>',
    bubble: '<circle cx="10" cy="13" r="7"/><circle cx="18.5" cy="6" r="3"/><path d="M7 10.5a3.5 3.5 0 0 1 3-2"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8 8.5a3 3 0 0 1 2.5-1.5"/>',
    brain: '<path d="M9 4.5A3 3 0 0 0 4.5 7a3 3 0 0 0-1 5 3.2 3.2 0 0 0 2.5 5A3 3 0 0 0 12 18V6a2.5 2.5 0 0 0-3-1.5z"/><path d="M15 4.5A3 3 0 0 1 19.5 7a3 3 0 0 1 1 5 3.2 3.2 0 0 1-2.5 5A3 3 0 0 1 12 18"/><path d="M8 10.5c1 0 2 .6 2 2M16 10.5c-1 0-2 .6-2 2"/>',
    hide: '<path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.6M6.6 6.7A13 13 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    report: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
    check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5V14"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 21h8M9.5 18h5"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    fire: '<path d="M12 21c-4 0-7-2.7-7-6.5C5 10 9 8 9.5 3.5c3 1.8 4.5 4.6 4.3 7.4 1-.6 1.7-1.8 1.8-3 2 1.6 3.4 3.8 3.4 6.6 0 3.8-3 6.5-7 6.5z"/><path d="M12 21c-1.7 0-3-1.2-3-3 0-2 2-3 2.3-5 1.6 1 3.7 2.6 3.7 5 0 1.8-1.3 3-3 3z"/>',
    hand: '<path d="M7 12V6.5a1.5 1.5 0 0 1 3 0V11m0-6a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v5.5c0 4-2.8 7-7 7-3 0-4.6-1.4-6-3.5L3.5 14a1.5 1.5 0 0 1 2.6-1.6L7 14"/>',
    whale: '<path d="M2.5 13c0 4 3.6 6 8.5 6 5.5 0 9-2.8 9-7 1.6-.3 2.5-1.8 2.5-3.5-1.4.6-2.6.6-3.6 0C18.5 6.5 16 5 12.5 5 6.5 5 2.5 8.5 2.5 13z"/><circle cx="8" cy="12" r=".9" fill="currentColor"/><path d="M11 4.5c0-1.2.6-2 1.5-2.5M13.5 4c.4-1 1.2-1.5 2-1.6"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor"/>',
    eye: '<path d="M2.5 12C4 8.5 7.5 5.5 12 5.5s8 3 9.5 6.5c-1.5 3.5-5 6.5-9.5 6.5S4 15.5 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    minus: '<path d="M6 12h12"/>',
    sparkle: '<path d="M12 3l2 6.5L20.5 12 14 14.5 12 21l-2-6.5L3.5 12 10 9.5z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
    bow: '<path d="M12 12L4 7.5c-1 2.5-1 6.5 0 9zM12 12l8-4.5c1 2.5 1 6.5 0 9z"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4.5 3.5"/>',
    undo: '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5.5 5.5 0 0 1 0 11h-2"/>',
    bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  };
  DFY.icon = function (name, size = 16, sw = 2) {
    return `<svg class="dfy-ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.sparkle}</svg>`;
  };
})();
