import { useEffect, useState } from 'react';
import { Flower2 } from 'lucide-react';
import { api, navigate } from '../../utils/storeUtils';

function Footer({ categories = [] }) {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api('/settings').then(setSettings).catch(() => setSettings(null)); }, []);
  const officer = settings?.grievanceOfficer;
  const go = path => event => { event.preventDefault(); navigate(path); };

  const linkClass = 'text-white/80 text-xs hover:text-[#E3B84F] transition-colors no-underline';
  const headingClass = 'text-[#D9A93F] text-[11px] font-semibold tracking-[2.5px] uppercase mb-4';

  return (
    <footer className="relative bg-[#1B4332] text-white pt-10 pb-5 px-6 md:px-12 mt-8 font-sans overflow-hidden">
      {/* Watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-10 -right-4 font-serif text-[20vw] leading-none font-bold tracking-[0.12em] text-white/[0.04] whitespace-nowrap"
      >
        VEDA
      </span>

      <div className="relative z-10 max-w-[1300px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.1fr_1fr] gap-8 lg:gap-6">
        {/* Brand */}
        <div>
          <a href="/" onClick={go('/')} className="inline-flex items-center gap-3 text-[#D9A93F] mb-4 no-underline">
            <Flower2 size={34} strokeWidth={1.4} />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[20px] font-semibold tracking-[3px] text-[#E3B84F]">
                VEDA SANKALPA
              </span>
              <small className="mt-1.5 text-[7px] tracking-[3px] uppercase text-white/60">
                The Sacred Store
              </small>
            </div>
          </a>
          <p className="text-white/80 text-xs leading-relaxed max-w-[260px] m-0">
            Objects chosen with care. Product information and pricing shared with clarity.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className={headingClass}>Explore</h3>
          <ul className="space-y-2 p-0 m-0 list-none">
            {categories.slice(0, 6).map(category => (
              <li key={category.id || category.slug}>
                <a href={`/collections/${category.slug}`} onClick={go(`/collections/${category.slug}`)} className={`${linkClass} block`}>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className={headingClass}>Help &amp; Policies</h3>
          <ul className="space-y-2 p-0 m-0 list-none">
            <li><a href="/account/orders" onClick={go('/account/orders')} className={`${linkClass} block`}>Orders</a></li>
            <li><a href="mailto:support@vedasankalpa.com" className={`${linkClass} block`}>Contact support</a></li>
            <li><a href="/login" onClick={go('/login')} className={`${linkClass} block`}>Account</a></li>
            <li className="text-white/80 text-xs">Prices include applicable GST.</li>
          </ul>
        </div>

        {/* Grievance Officer */}
        <div>
          <h3 className={headingClass}>Grievance Officer</h3>
          {officer?.name ? (
            <div className="text-white/80 text-xs leading-relaxed space-y-1">
              <p className="m-0">{officer.name}</p>
              <a href={`mailto:${officer.email}`} className={`${linkClass} block break-all`}>{officer.email}</a>
              <p className="m-0">{officer.phone}</p>
            </div>
          ) : (
            <p className="text-white/80 text-xs leading-relaxed m-0 max-w-[200px]">
              Contact <a href="mailto:support@vedasankalpa.com" className="text-white/80 hover:text-[#E3B84F] transition-colors no-underline">support@vedasankalpa.com</a> for assistance.
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 max-w-[1300px] mx-auto mt-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/70 text-[10px]">
        <span>© {new Date().getFullYear()} Veda Sankalpa</span>
        <span>Made for mindful everyday rituals</span>
      </div>
    </footer>
  );
}

export default Footer;