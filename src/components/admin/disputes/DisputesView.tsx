'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import {
  LifeBuoy,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  Filter,
  User,
  Phone,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { SupportTicket } from '@/types';

export default function DisputesView() {
  const { supportTickets, updateTicketStatus } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.bookingNumber && ticket.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = supportTickets.filter((t) => t.status === 'Open').length;
  const investigatingCount = supportTickets.filter((t) => t.status === 'Under Investigation').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'Resolved').length;

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'Resolved', resolutionText);
    setSelectedTicket(null);
    setResolutionText('');
  };

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Individual Support Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Support Tickets */}
        <div
          onClick={() => setStatusFilter('All')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'All'
            ? 'ring-2 ring-primary border-transparent shadow-xs'
            : 'hover:border-slate-300'
            }`}
          title="Click to view all tickets"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Support Tickets
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">{supportTickets.length}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Reported issues & disputes</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        {/* Open Tickets */}
        <div
          onClick={() => setStatusFilter('Open')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Open'
            ? 'ring-2 ring-rose-600 border-transparent shadow-xs'
            : 'hover:border-rose-200'
            }`}
          title="Click to filter open tickets"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">
              Open Tickets
            </span>
            <div className="text-xl font-bold text-rose-700 mt-1">{openCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Requires admin review</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Under Investigation */}
        <div
          onClick={() => setStatusFilter('Under Investigation')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Under Investigation'
            ? 'ring-2 ring-amber-500 border-transparent shadow-xs'
            : 'hover:border-amber-200'
            }`}
          title="Click to filter claims under investigation"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Under Investigation
            </span>
            <div className="text-xl font-bold text-amber-700 mt-1">{investigatingCount}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Claims currently being verified</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved Cases */}
        <div
          onClick={() => setStatusFilter('Resolved')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Resolved'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter resolved cases"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
              Resolved Cases
            </span>
            <div className="text-xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Successfully closed</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Unified Ticket Management Card */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Search & Filter Header Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket number, customer, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
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
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ticket List Items */}
        <div className="divide-y divide-slate-100">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No support tickets found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-slate-50/60 transition-colors space-y-2.5"
              >
                {/* Header line: Ticket ID, Issue Type, Booking Ref, Priority, Status, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-[#023526] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {ticket.issueType}
                    </span>
                    {ticket.bookingNumber && (
                      <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                        Ref: {ticket.bookingNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : ticket.priority === 'High'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                      {ticket.priority} Priority
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ticket.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ticket.status === 'Under Investigation'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                      {ticket.status}
                    </span>

                    {ticket.status !== 'Resolved' && (
                      <div className="flex items-center gap-1.5 ml-1">
                        {ticket.status !== 'Under Investigation' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'Under Investigation')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] rounded-md transition-colors border border-amber-200 shadow-2xs"
                          >
                            Investigate
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-2.5 py-1 bg-[#023526] hover:bg-emerald-900 text-white font-semibold text-[11px] rounded-md transition-colors shadow-2xs"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body: Avatar + Details + Description + Resolution */}
                <div className="flex items-start gap-3">
                  <img
                    src={ticket.userAvatar}
                    alt={ticket.userName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{ticket.userName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({ticket.userType})</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {ticket.userPhone}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {ticket.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100">
                      "{ticket.description}"
                    </p>

                    {ticket.resolutionNotes && (
                      <div className="bg-emerald-50/80 border border-emerald-200/70 px-3 py-2 rounded-lg text-xs flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                            Resolution Notes ({ticket.assignedAdmin || 'Support Admin'})
                          </span>
                          <p className="text-emerald-900 font-medium text-[11.5px]">{ticket.resolutionNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Resolve Ticket: {selectedTicket.ticketNumber}
            </h3>
            <p className="text-xs text-slate-600">
              Issue Type: <span className="font-bold text-slate-800">{selectedTicket.issueType}</span> for {selectedTicket.userName}
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution & Action Taken Notes
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Verified trip log, processed customer refund of ₹300, and warned driver."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#023526] text-white font-bold rounded-lg hover:bg-emerald-900"
                >
                  Confirm & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
