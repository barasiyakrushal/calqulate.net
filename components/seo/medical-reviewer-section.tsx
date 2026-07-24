import Image from "next/image"
import { Stethoscope, ExternalLink, CalendarCheck, UserCheck } from "lucide-react"

export function MedicalReviewerSection({ lastReviewed = "June 2026" }: { lastReviewed?: string } = {}) {
  return (
    <div className="mt-16 mb-6 max-w-2xl mx-auto">
      {/* Tool Info Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" />
          Tool Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last reviewed</span>
            <p className="text-slate-800 font-medium mt-0.5">{lastReviewed}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reviewed by</span>
            <p className="text-blue-700 font-medium mt-0.5 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Dr. Jaydeep Sanghani
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Created by</span>
            <p className="text-slate-800 font-medium mt-0.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Meet Akabari
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Card */}
      <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md ring-1 ring-blue-200">
            <Image
              src="/dr-jaydeep-sanghani.webp"
              alt="Dr. Jaydeep Sanghani"
              width={96}
              height={96}
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold text-slate-900">Dr. Jaydeep Sanghani</h3>
            <p className="text-blue-700 font-medium text-sm">MBBS, MD, DNB(Anaesth.), PDCC(CCM), DrNB(CCM)</p>
            <p className="text-blue-500 text-xs font-medium mb-2">AIIMS Bhubaneswar · AIIMS Rishikesh</p>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Critical care specialist and anesthesiologist with advanced training from AIIMS. Reviews health calculators at Calqulate to ensure medical accuracy and evidence-based standards.
            </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <a
                href="https://www.docindia.org/doctors/rajkot/dr-jaydeep-sanghani-anesthesiology"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 border border-slate-300 px-3 py-1.5 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Verified Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
