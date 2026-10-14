'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Radio,
  Layers,
  Users,
  Car,
  Award,
  RefreshCw,
  X,
  Info,
  Copy,
  Check,
  Key,
} from 'lucide-react';
import { NotificationRecord } from '@/types';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/context/ToastContext';

export default function NotificationsView() {
  const { toast } = useToast();
  const {
    notifications,
    isLoading: loading,
    isSending: sending,
    isTesting: testing,
    counts: stats,
    firebaseStatus,
    testResult,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dispatchNotification,
    sendTestPush,
    setTestResult,
    clearTestResult,
  } = useNotificationStore();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<NotificationRecord | null>(null);

  // Dispatch Form
  const [dispatchForm, setDispatchForm] = useState({
    title: '',
    message: '',
    targetAudience: 'All' as 'All' | 'Drivers' | 'Customers' | 'Valet Staff' | 'Custom',
    targetType: 'topic' as 'topic' | 'token',
    customToken: '',
    type: 'General' as 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General' | 'Alert',
    imageUrl: '',
    actionUrl: '',
  });

  // Test Push Modal State
  const [testForm, setTestForm] = useState({
    targetType: 'topic' as 'topic' | 'token',
    topic: 'test-channel',
    token: '',
    title: '🚗 Admin Live Test Notification',
    message: 'Firebase Cloud Messaging integration test from Admin Console.',
  });

  // Trigger feed fetch from Zustand on search or filter change
  useEffect(() => {
    fetchNotifications({
      search,
      audience: selectedAudience,
      type: selectedType,
    });
  }, [fetchNotifications, search, selectedAudience, selectedType]);

  // Handle Mark Single Read via Zustand
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await markAsRead(id);
  };

  // Handle Mark All Read via Zustand
  const handleMarkAllRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success('All marked as read', 'Updated notification inbox status.');
    } else {
      toast.error('Failed to update', 'Could not mark all notifications as read.');
    }
  };

  // Handle Delete Notification via Zustand
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteNotification(id);
    if (success) {
      toast.success('Notification Deleted', 'Removed from dispatch history.');
    } else {
      toast.error('Delete failed', 'Could not delete notification record.');
    }
  };

  // Handle Dispatch Submit via Zustand
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.title.trim() || !dispatchForm.message.trim()) {
      toast.error('Missing fields', 'Title and message are required.');
      return;
    }

    if (dispatchForm.targetAudience === 'Custom' && !dispatchForm.customToken.trim()) {
      toast.error('Device token required', 'Please provide a valid FCM registration token.');
      return;
    }

    const res = await dispatchNotification({
      title: dispatchForm.title,
      message: dispatchForm.message,
      targetAudience: dispatchForm.targetAudience,
      customToken: dispatchForm.customToken,
      type: dispatchForm.type,
      imageUrl: dispatchForm.imageUrl,
      actionUrl: dispatchForm.actionUrl,
    });

    if (res.success) {
      toast.success(
        'Push Dispatched!',
        `Broadcast sent successfully. FCM ID: ${res.fcmMessageId ? res.fcmMessageId.substring(0, 20) + '...' : 'Delivered'}`
      );
      setIsDispatchModalOpen(false);
      setDispatchForm({
        title: '',
        message: '',
        targetAudience: 'All',
        targetType: 'topic',
        customToken: '',
        type: 'General',
        imageUrl: '',
        actionUrl: '',
      });
      fetchNotifications({
        search,
        audience: selectedAudience,
        type: selectedType,
      });
    } else {
      toast.error('Dispatch issue', res.error || 'Failed to dispatch notification via Firebase.');
    }
  };

  // Handle Quick Test Push via Zustand
  const handleSendTestPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testForm.targetType === 'token' && !testForm.token.trim()) {
      toast.error('Token required', 'Please specify a device FCM token.');
      return;
    }

    const res = await sendTestPush({
      title: testForm.title,
      message: testForm.message,
      targetType: testForm.targetType,
      topic: testForm.topic,
      token: testForm.token,
    });

    if (res.success) {
      toast.success('Test Push Delivered!', res.message || 'Notification delivered successfully');
    } else {
      toast.error('FCM Test Error', res.error || 'Test notification failed');
    }
  };

  // Icon type mapping
  const iconTypeMap: Record<string, React.ElementType> = {
    Booking: CalendarCheck,
    Payment: CreditCard,
    Subscription: Award,
    Assignment: Car,
    Alert: AlertTriangle,
    General: Bell,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Title */}
      <div className="card-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Firebase Notification & Dispatch Center
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    FCM v1 Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Firebase Cloud Messaging (FCM) live push dispatcher, audience broadcasting, and dispatch telemetry
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100/80 transition-all flex items-center gap-1.5 shadow-xs"
              id="test-push-btn"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Test FCM Push
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark All as Read
            </button>
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
              id="dispatch-notification-btn"
            >
              <Send className="w-4 h-4" /> Dispatch Push Notification
            </button>
          </div>
        </div>

        {/* Firebase Live Diagnostics Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Project ID:</span>
              <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                {firebaseStatus.projectId || 'driverbooking-4b700'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Service Account:</span>
              <span className="text-slate-500 truncate max-w-xs" title={firebaseStatus.clientEmail}>
                {firebaseStatus.clientEmail || 'firebase-adminsdk-fbsvc@driverbooking-4b700.iam.gserviceaccount.com'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Engine:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-100">
                Firebase Admin SDK 13.x
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchNotifications({ search, audience: selectedAudience, type: selectedType })}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4 flex items-center gap-3.5 border-l-4 border-l-primary">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Dispatches</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.total || notifications.length}</h3>
          </div>
        </div>

        <div className="card-white p-4 flex items-center gap-3.5 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Delivered (FCM)</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.sent || notifications.filter(n => n.status !== 'failed').length}</h3>
          </div>
        </div>

        <div className="card-white p-4 flex items-center gap-3.5 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Topics</p>
            <h3 className="text-xl font-bold text-slate-900">4 Topics</h3>
            <span className="text-[10px] text-slate-400">drivers, customers, valet, all</span>
          </div>
        </div>

        <div className="card-white p-4 flex items-center gap-3.5 border-l-4 border-l-indigo-500">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unread Alerts</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.unread || notifications.filter(n => !n.read).length}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-white p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, message or audience..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter Audience:
          </div>
          {['All', 'Drivers', 'Customers', 'Valet Staff'].map((aud) => (
            <button
              key={aud}
              onClick={() => setSelectedAudience(aud)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedAudience === aud
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {aud}
            </button>
          ))}

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:border-primary"
          >
            <option value="All">All Types</option>
            <option value="Booking">Booking</option>
            <option value="Subscription">Subscription</option>
            <option value="Payment">Payment</option>
            <option value="Assignment">Assignment</option>
            <option value="Alert">Alert</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card-white p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Loading notifications telemetry...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-white p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Notifications Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no notifications matching your search or filters. You can dispatch a new notification via Firebase above.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const IconComp = iconTypeMap[n.type] || Bell;
            return (
              <div
                key={n.id || n._id}
                onClick={() => setSelectedDetail(n)}
                className={`card-white p-4.5 flex items-start gap-4 cursor-pointer transition-all border ${
                  !n.read
                    ? 'bg-primary-light/30 border-primary/30 hover:border-primary/50'
                    : 'border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    n.type === 'Booking'
                      ? 'bg-blue-100 text-blue-700'
                      : n.type === 'Payment' || n.type === 'Subscription'
                      ? 'bg-emerald-100 text-emerald-700'
                      : n.type === 'Alert'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold ${!n.read ? 'text-slate-950 font-extrabold' : 'text-slate-800'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {n.targetAudience}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-500">
                        {n.type}
                      </span>
                      {n.status === 'failed' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> FCM Sent
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">{n.sentAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>

                  {/* Metadata line */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                    {n.fcmMessageId && (
                      <span className="font-mono text-slate-500">
                        FCM ID: {n.fcmMessageId.substring(0, 22)}...
                      </span>
                    )}
                    {n.topic && <span>Topic: #{n.topic}</span>}
                    {n.sentBy && <span>Sent by: {n.sentBy}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-center">
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id || (n._id as string), e)}
                      title="Mark as Read"
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(n.id || (n._id as string), e)}
                    title="Delete Record"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DISPATCH PUSH NOTIFICATION MODAL */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-white max-w-4xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> Dispatch Live Firebase Push Notification
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted broadcast via Firebase Cloud Messaging (FCM) v1 Engine
                </p>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Form Input Columns (7 cols) */}
              <form onSubmit={handleDispatchSubmit} className="lg:col-span-7 space-y-4">
                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Audience / Channel
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'All', label: 'All Users (Broadcast)', icon: Radio },
                      { key: 'Drivers', label: 'All Drivers', icon: Car },
                      { key: 'Customers', label: 'All Customers', icon: Users },
                      { key: 'Valet Staff', label: 'Valet Staff', icon: ShieldCheck },
                      { key: 'Custom', label: 'Specific Device Token', icon: Smartphone },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = dispatchForm.targetAudience === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setDispatchForm({
                              ...dispatchForm,
                              targetAudience: item.key as any,
                            })
                          }
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                            active
                              ? 'border-primary bg-primary-light/40 text-primary font-bold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-slate-500'}`} />
                          <span className="text-[11px] leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Token input if Custom selected */}
                {dispatchForm.targetAudience === 'Custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient FCM Registration Token
                    </label>
                    <input
                      type="text"
                      placeholder="Paste FCM Device Token here..."
                      value={dispatchForm.customToken}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, customToken: e.target.value })}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}

                {/* Notification Type & Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notification Category
                  </label>
                  <select
                    value={dispatchForm.type}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, type: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="General">General Announcement / System Update</option>
                    <option value="Booking">Booking & Trip Dispatch Alert</option>
                    <option value="Subscription">Driver Subscription & Renewal</option>
                    <option value="Payment">Payment & Payout Confirmation</option>
                    <option value="Assignment">Valet / Driver Assignment</option>
                    <option value="Alert">High-Priority Alert / Emergency</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Push Title</label>
                    <span className="text-[10px] text-slate-400">{dispatchForm.title.length}/65 chars</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 🚗 Weekend Special: 20% off all chauffeur rides!"
                    value={dispatchForm.title}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Notification Message</label>
                    <span className="text-[10px] text-slate-400">{dispatchForm.message.length}/240 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter the push notification message body that will be shown on the user's lock screen..."
                    value={dispatchForm.message}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, message: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                    required
                  />
                </div>

                {/* Optional Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={dispatchForm.imageUrl}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, imageUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Optional Deep Link Action */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deep Link / Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="/driver/bookings or https://..."
                    value={dispatchForm.actionUrl}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, actionUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDispatchModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching via FCM...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Push Broadcast
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Live Mobile Push Preview (5 cols) */}
              <div className="lg:col-span-5 bg-slate-100/70 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center">
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-slate-700" /> Device Lock Screen Preview
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Live
                    </span>
                  </div>

                  {/* Simulated Mobile Push Banner */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 text-slate-900 transition-all">
                    {/* Header line */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center text-white text-[9px] font-bold">
                          D
                        </div>
                        <span className="font-bold text-slate-800">DRIVEPULSE ADMIN</span>
                      </div>
                      <span className="text-[10px]">now</span>
                    </div>

                    {/* Title */}
                    <h5 className="font-bold text-xs text-slate-900 leading-snug">
                      {dispatchForm.title.trim() || 'Notification Title Preview'}
                    </h5>

                    {/* Message */}
                    <p className="text-[11.5px] text-slate-600 mt-1 leading-snug">
                      {dispatchForm.message.trim() ||
                        'Your notification message body will be displayed cleanly on user mobile notifications.'}
                    </p>

                    {/* Image Preview if provided */}
                    {dispatchForm.imageUrl && (
                      <div className="mt-2.5 rounded-lg overflow-hidden border border-slate-200 max-h-32 bg-slate-50">
                        <img
                          src={dispatchForm.imageUrl}
                          alt="Push Banner"
                          className="w-full h-28 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Audience: {dispatchForm.targetAudience}</span>
                      <span>Type: {dispatchForm.type}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Dispatches sent to topic <strong>{dispatchForm.targetAudience.toLowerCase()}</strong> will be delivered instantly to all registered apps and background drivers.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FCM TEST MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-white max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Firebase Cloud Messaging Test Tool
              </h3>
              <button
                onClick={() => {
                  setIsTestModalOpen(false);
                  clearTestResult();
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestPush} className="mt-4 space-y-4">
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="testTarget"
                    checked={testForm.targetType === 'topic'}
                    onChange={() => setTestForm({ ...testForm, targetType: 'topic' })}
                  />
                  Test Broadcast Topic
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="testTarget"
                    checked={testForm.targetType === 'token'}
                    onChange={() => setTestForm({ ...testForm, targetType: 'token' })}
                  />
                  Specific Device Token
                </label>
              </div>

              {testForm.targetType === 'topic' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic Name</label>
                  <input
                    type="text"
                    value={testForm.topic}
                    onChange={(e) => setTestForm({ ...testForm, topic: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="test-channel or drivers"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Device FCM Token</label>
                  <input
                    type="text"
                    value={testForm.token}
                    onChange={(e) => setTestForm({ ...testForm, token: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Enter device FCM token"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Title</label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Message</label>
                <textarea
                  rows={2}
                  value={testForm.message}
                  onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-mono leading-relaxed overflow-x-auto ${
                    testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <p className="font-bold font-sans mb-1">
                    {testResult.success ? '✓ FCM Message Sent' : '✗ Dispatch Error'}
                  </p>
                  <pre className="text-[11px]">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsTestModalOpen(false);
                    clearTestResult();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Execute Test Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-white max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Notification Dispatch Details
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Title</span>
                <p className="font-bold text-slate-900 text-sm">{selectedDetail.title}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Message</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedDetail.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Audience</span>
                  <span className="font-medium text-slate-800">{selectedDetail.targetAudience}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Type</span>
                  <span className="font-medium text-slate-800">{selectedDetail.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedDetail.status === 'failed' ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedDetail.status?.toUpperCase() || 'SENT'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Dispatched At</span>
                  <span className="font-mono text-slate-700">{selectedDetail.sentAt}</span>
                </div>
              </div>

              {selectedDetail.fcmMessageId && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-400 block mb-0.5">FCM Message ID</span>
                  <p className="font-mono text-[11px] bg-slate-100 p-2 rounded text-slate-800 break-all select-all">
                    {selectedDetail.fcmMessageId}
                  </p>
                </div>
              )}

              {selectedDetail.errorDetails && (
                <div className="pt-2">
                  <span className="font-semibold text-red-500 block mb-0.5">Error Diagnostics</span>
                  <p className="font-mono text-[11px] bg-red-50 text-red-700 p-2 rounded border border-red-100">
                    {selectedDetail.errorDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
