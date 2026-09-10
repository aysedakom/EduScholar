import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PublicFooter: React.FC = () => {
  const { isTagalog } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 border-t border-slate-800 relative z-20 text-xs font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: LGU Branding */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Quezon City Logo" className="h-9 w-9 object-contain bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0" />
              <div>
                <span className="font-heading font-extrabold text-white text-base block">GovServe – Quezon City</span>
                <span className="text-slate-400 text-[11px] font-semibold">{isTagalog ? 'Pamahalaang Lokal ng Lungsod Quezon' : 'Quezon City Local Government Unit'}</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {isTagalog
                ? 'Opisyal na Portal ng Edukasyon at Iskolarship ng Lungsod Quezon. Pinalalakas ang bawat estudyanteng QCitizen sa pamamagitan ng transparent at libreng serbisyo.'
                : 'Official Quezon City Education & Scholarship Management Portal. Empowering QCitizen students through transparent, accessible municipal grants.'}
            </p>
          </div>

          {/* Col 2: Legal & Governance Links */}
          <div className="md:col-span-3 space-y-2">
            <p className="font-extrabold uppercase text-[11px] tracking-wider text-slate-100 flex items-center gap-1.5 font-heading">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Legal & Privacy
            </p>
            <ul className="space-y-1.5 text-slate-400 font-medium">
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                  {isTagalog ? 'Patakaran sa Pribasya (RA 10173)' : 'Privacy Policy (DPA Compliance)'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition-colors">
                  {isTagalog ? 'Mga Alituntunin at Kondisyon' : 'Terms & Conditions of Service'}
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-blue-400 transition-colors">
                  {isTagalog ? 'Polisiya sa Libreng Serbisyo' : 'Fee Disclosure & Refund Policy'}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-blue-400 transition-colors">
                  {isTagalog ? 'Patakaran sa Cookie at Storage' : 'Cookie & Browser Storage Policy'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="md:col-span-4 space-y-2">
            <p className="font-extrabold uppercase text-[11px] tracking-wider text-slate-100 font-heading">
              Official Contact & Helpline
            </p>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>QC Hall Complex, Elliptical Rd, Diliman, Quezon City</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>support.edu2026@gmail.com | dpo@quezoncity.gov.ph</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>QC Helpline 122 / (02) 8988-4242</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 Quezon City Local Government Unit. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built for QCitizens with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
