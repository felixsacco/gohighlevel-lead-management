import {
  BadgeCheck,
  ShieldCheck,
  Landmark,
  Database,
  LockKeyhole,
  Star,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ScanFace,
  Scale,
} from 'lucide-react';
import { TrustBadge } from '@/components/TrustBadge';

const badges = [
  { icon: BadgeCheck, label: 'ID verified' },
  { icon: ShieldCheck, label: 'Insurance certificate' },
  { icon: Landmark, label: 'Companies House checked' },
  { icon: Database, label: 'ICO registered' },
  { icon: LockKeyhole, label: 'Secure payments' },
  { icon: Star, label: 'Reviews verified' },
  { icon: GraduationCap, label: 'Qualifications checked' },
  { icon: MapPin, label: 'Address verified' },
  { icon: Phone, label: 'Phone verified' },
  { icon: Mail, label: 'Email verified' },
  { icon: ScanFace, label: 'DBS checked' },
  { icon: Scale, label: 'Complaints process' },
];

export default function BadgesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB800]">
          Trust badges
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#111111]">
          Trust badge set
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          Twelve distinct marks, one consistent stroke and size. Each uses a
          unique lucide icon, amber icon with a near-black label, matched to the
          optical weight of the Google mark.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {badges.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-4"
            >
              <TrustBadge icon={icon} label={label} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
