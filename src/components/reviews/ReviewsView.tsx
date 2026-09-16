'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Star, CheckCircle2, EyeOff } from 'lucide-react';

export default function ReviewsView() {
  const { reviews, updateReviewStatus } = useRentalStore();

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Customer Feedback & Service Reviews</h3>
          <p className="text-xs text-slate-500">Moderate customer ratings, trip testimonials, and driver/valet service feedback</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 Average Rating
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="card-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-sm ring-2 ring-emerald-200">
                  {rev.customerName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rev.customerName}</h4>
                  <p className="text-xs text-slate-500">
                    Target: <span className="font-semibold text-primary">{rev.targetName}</span> ({rev.reviewType}) • Ref: <span className="font-mono text-slate-700">{rev.bookingNumber}</span> • {rev.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rev.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {rev.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
              "{rev.reviewText}"
            </p>

            <div className="flex justify-end gap-2 text-xs pt-1">
              {rev.status !== 'Approved' && (
                <button
                  onClick={() => updateReviewStatus(rev.id, 'Approved')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Approve Review
                </button>
              )}
              {rev.status !== 'Hidden' && (
                <button
                  onClick={() => updateReviewStatus(rev.id, 'Hidden')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded"
                >
                  Hide Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
