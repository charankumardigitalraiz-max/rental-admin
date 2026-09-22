'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  EyeOff,
  Flag,
  CheckCircle,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { ReviewRecord } from '@/types';

export default function ReviewsView() {
  const { reviews, updateReviewStatus } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('All');

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'All' || review.rating === Number(ratingFilter);
    const matchesTarget = targetTypeFilter === 'All' || review.reviewType === targetTypeFilter;
    return matchesSearch && matchesStatus && matchesRating && matchesTarget;
  });

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)).toFixed(1);
  const flaggedCount = reviews.filter((r) => r.status === 'Flagged').length;

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Unified Reviews Metrics Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Customer Reviews
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">{reviews.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">Total driver & valet feedback submissions</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Average Overall Score
            </span>
            <div className="flex items-center gap-1.5 text-xl font-bold text-amber-700 mt-1">
              {avgRating} <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Across all completed rides</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">
              Flagged Reviews
            </span>
            <div className="text-xl font-bold text-rose-700 mt-1">{flaggedCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Requires moderation review</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver, customer, booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Service:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Driver">Drivers</option>
              <option value="Valet Staff">Valet Staff</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{review.customerName}</span>
                  <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                    Ref: {review.bookingNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviewed: <span className="font-semibold text-slate-700">{review.targetName}</span> ({review.reviewType})
                </p>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-amber-800 text-xs font-bold">
                <span>{review.rating}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <p className="text-xs text-slate-700 italic bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              "{review.reviewText}"
            </p>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-400 text-[11px]">{review.date}</span>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${review.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : review.status === 'Flagged'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  {review.status}
                </span>

                {review.status !== 'Approved' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'Approved')}
                    className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded transition-colors"
                    title="Approve Review"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                {review.status !== 'Flagged' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'Flagged')}
                    className="p-1.5 hover:bg-rose-50 text-rose-700 rounded transition-colors"
                    title="Flag Review"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}

                {review.status !== 'Hidden' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'Hidden')}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                    title="Hide Review"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
