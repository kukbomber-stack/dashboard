export const Ic = ({ d }: { d: string }) => (
  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
export const icons: Record<string, string> = {
  overview: "M3 12l2-2 4 4 6-6 4 4 M3 20h18",
  drill: "M12 2v14 M8 6l4-4 4 4 M9 20h6l-1.5-4h-3z",
  status: "M9 3h6a1 1 0 011 1v1h1a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1V4a1 1 0 011-1z M9 12l2 2 4-4",
  proc: "M6 6h15l-1.5 9h-12z M6 6L5 3H2 M9 20a1 1 0 100-2 1 1 0 000 2z M18 20a1 1 0 100-2 1 1 0 000 2z",
  costs: "M7 3v18 M7 4h6a4 4 0 010 8H7 M4 14h9",
  core: "M9 2h6 M10 2v6l-5 10a2 2 0 002 3h10a2 2 0 002-3l-5-10V2",
  equip: "M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  lic: "M9 12l2 2 4-4 M7 3h10a2 2 0 012 2v14l-7-3-7 3V5a2 2 0 012-2z",
  res: "M3 3v18h18 M7 14l3-3 3 2 4-5",
  miles: "M6 3v18 M6 4h11l-2 3 2 3H6",
  sources: "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  gantt: "M3 6h7 M3 12h13 M3 18h9",
  opr: "M4 21V11l4 2.5V11l4 2.5V9l4 2.5V7l4 2v12H4z M4 21h16",
  placer: "M3 9c2-2 4 2 6 0s4 2 6 0 4 2 6 0 M3 15c2-2 4 2 6 0s4 2 6 0 4 2 6 0 M12 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
  people: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
};
