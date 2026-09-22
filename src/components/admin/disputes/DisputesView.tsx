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
      {/* Unified Support Metrics Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Support Tickets
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{supportTickets.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">Reported issues & disputes</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Open Tickets
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{openCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Requires admin review</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Under Investigation
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{investigatingCount}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Claims currently being verified</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{resolvedCount}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Successfully closed</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
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

      {/* Ticket List Cards */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  {ticket.ticketNumber}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-emerald-50 text-[#023526] px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {ticket.issueType}
                </span>
                {ticket.bookingNumber && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Ref: {ticket.bookingNumber}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : ticket.priority === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-700'
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
              </div>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={ticket.userAvatar}
                alt={ticket.userName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{ticket.userName} <span className="text-xs font-normal text-slate-500">({ticket.userType})</span></h4>
                  <span className="text-[11px] text-slate-400">{ticket.createdAt}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  "{ticket.description}"
                </p>

                {ticket.resolutionNotes && (
                  <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-lg text-xs space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Admin Resolution Notes ({ticket.assignedAdmin || 'Support Admin'})
                    </span>
                    <p className="text-emerald-900 font-medium">{ticket.resolutionNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">Phone: {ticket.userPhone}</span>
              <div className="flex items-center gap-2">
                {ticket.status !== 'Resolved' && (
                  <>
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'Under Investigation')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg transition-colors border border-amber-200"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1.5 bg-[#023526] hover:bg-emerald-900 text-white font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Resolve Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
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
