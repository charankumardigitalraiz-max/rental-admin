'use client';

import React, { useState, useEffect } from 'react';
import {
  usePricingStore,
  TimePricingTier,
  LocalPricingTiers,
  OutstationPricingTiers,
  defaultDriverPricingData,
  ValetParkingPricingTier,
} from '@/store/usePricingStore';
import { useToast } from '@/context/ToastContext';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Car,
  Building2,
  Zap,
  Save,
  CheckCircle,
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Sliders,
  SlidersHorizontal,
  RefreshCw,
  Sun,
  Moon,
  MapPin,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Calculator,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  MousePointerClick,
} from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { ValetPricingConfig, PricingRule } from '@/types';

// ============================================================================
// UNIQUE STYLED FIELD COMPONENTS
// ============================================================================

interface CurrencyFieldProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  unit?: string;
  accent?: 'emerald' | 'indigo' | 'amber' | 'sky';
  step?: number;
  min?: number;
}

function CurrencyField({
  label,
  sublabel,
  value,
  onChange,
  prefix = '₹',
  unit,
  accent = 'emerald',
  step = 50,
  min = 0,
}: CurrencyFieldProps) {
  const accentClasses = {
    emerald: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ring: 'focus-within:border-emerald-600 focus-within:ring-emerald-500/15',
      text: 'text-emerald-700',
    },
    indigo: {
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      ring: 'focus-within:border-indigo-600 focus-within:ring-indigo-500/15',
      text: 'text-indigo-700',
    },
    amber: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      ring: 'focus-within:border-amber-600 focus-within:ring-amber-500/15',
      text: 'text-amber-700',
    },
    sky: {
      badge: 'bg-sky-50 text-sky-800 border-sky-200',
      ring: 'focus-within:border-sky-600 focus-within:ring-sky-500/15',
      text: 'text-sky-700',
    },
  }[accent];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11.5px] font-semibold text-slate-700 tracking-tight flex items-center gap-1">
          {label}
        </label>
        {sublabel && <span className="text-[10px] text-slate-400 font-medium">{sublabel}</span>}
      </div>

      <div
        className={`relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-150 focus-within:ring-3 focus-within:shadow-xs ${accentClasses.ring} overflow-hidden`}
      >
        <span
          className={`flex items-center justify-center font-semibold text-xs px-2.5 py-2.5 border-r select-none shrink-0 ${accentClasses.badge}`}
        >
          {prefix}
        </span>

        <input
          type="number"
          min={min}
          step="any"
          value={isNaN(value) ? '' : value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none tracking-tight tabular-nums"
        />

        {unit && (
          <span className="px-2.5 py-1 text-[10.5px] font-semibold text-slate-400 bg-slate-50 border-l border-slate-100 shrink-0">
            {unit}
          </span>
        )}

        <div className="flex items-center pr-1.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            title={`Decrease by ${step}`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer select-none"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => onChange(value + step)}
            title={`Increase by ${step}`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer select-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimeWindowPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  presets?: string[];
}

function TimeWindowPicker({
  label,
  value,
  onChange,
  presets = ['06:00-18:00', '18:00-06:00', '08:00-20:00', '20:00-08:00'],
}: TimeWindowPickerProps) {
  // Parse start and end time from value string e.g. "06:00-18:00"
  const parts = (value || '').split('-');
  const startTime = parts[0] || '06:00';
  const endTime = parts[1] || '18:00';

  const handleStartChange = (newStart: string) => {
    if (!newStart) return;
    onChange(`${newStart}-${endTime}`);
  };

  const handleEndChange = (newEnd: string) => {
    if (!newEnd) return;
    onChange(`${startTime}-${newEnd}`);
  };

  const calculateHours = (s: string, e: string) => {
    if (!s || !e) return 12;
    const [sH, sM] = s.split(':').map(Number);
    const [eH, eM] = e.split(':').map(Number);
    if (isNaN(sH) || isNaN(eH)) return 12;
    let mins = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
    if (mins <= 0) mins += 24 * 60; // Next-day night shift wrap-around
    return Math.round((mins / 60) * 10) / 10;
  };

  const windowDuration = calculateHours(startTime, endTime);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11.5px] font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </label>
        {/* <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {windowDuration}h Active Window
        </span> */}
      </div>

      {/* Dual Time Pickers: Start Time & End Time */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" /> Start Time
          </span>
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-500/15 overflow-hidden transition-all">
            <span className="px-2.5 py-2 text-slate-400 bg-slate-50 border-r border-slate-200 text-xs flex items-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-500" /> End Time
          </span>
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-500/15 overflow-hidden transition-all">
            <span className="px-2.5 py-2 text-slate-400 bg-slate-50 border-r border-slate-200 text-xs flex items-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Quick Shift Presets */}
      {/* {presets && presets.length > 0 && (
        <div className="pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 mr-1">Presets:</span>
            {presets.map((preset) => {
              const isSelected = value === preset;
              const [pStart, pEnd] = preset.split('-');
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`text-[10.5px] font-mono px-2 py-0.5 rounded-md transition-all cursor-pointer select-none flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 active:scale-95'
                  }`}
                >
                  <span>{pStart}</span>
                  <span className="text-slate-400">→</span>
                  <span>{pEnd}</span>
                </button>
              );
            })}
          </div>
        </div>
      )} */}
    </div>
  );
}

interface HourSelectorProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  options?: number[];
  unitText?: string;
}

function HourSelector({
  label,
  value,
  onChange,
  options = [2, 4, 6, 8, 10, 12, 24],
  unitText = 'hrs',
}: HourSelectorProps) {
  const isDayUnit = unitText?.toLowerCase().includes('day');
  const unitSuffix = isDayUnit ? 'd' : 'h';
  const isCustomInitially = !options.includes(value);

  const [isCustomMode, setIsCustomMode] = useState<boolean>(isCustomInitially);
  const [customStr, setCustomStr] = useState<string>(() =>
    isCustomInitially ? String(value) : ''
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize when value changes externally (e.g. modal opens with new tier)
  useEffect(() => {
    if (!options.includes(value)) {
      setIsCustomMode(true);
      setCustomStr(String(value));
    } else {
      setIsCustomMode(false);
      setCustomStr('');
    }
  }, [value, options]);

  const handlePresetClick = (presetVal: number) => {
    setIsCustomMode(false);
    setCustomStr('');
    onChange(presetVal);
  };

  const handleCustomChange = (raw: string) => {
    setCustomStr(raw);
    setIsCustomMode(true);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) {
      onChange(num);
    }
  };

  const handleCustomBlur = () => {
    if (isCustomMode) {
      const num = parseInt(customStr, 10);
      if (isNaN(num) || num < 1) {
        const fallback = value > 0 ? value : 1;
        setCustomStr(String(fallback));
        onChange(fallback);
      } else {
        setCustomStr(String(num));
        onChange(num);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11.5px] font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </label>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          {value} {unitText}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((h) => {
          const isSelected = !isCustomMode && value === h;
          return (
            <button
              key={h}
              type="button"
              onClick={() => handlePresetClick(h)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none ${isSelected
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs scale-102 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                }`}
            >
              {h}{unitSuffix}
            </button>
          );
        })}

        {/* Custom Value Entry Box */}
        <div
          onClick={() => {
            setIsCustomMode(true);
            if (!customStr) {
              setCustomStr(String(value));
            }
            inputRef.current?.focus();
          }}
          className={`relative flex items-center bg-white rounded-lg border transition-all duration-150 cursor-text shadow-2xs overflow-hidden ${isCustomMode
            ? 'border-emerald-600 ring-2 ring-emerald-500/15'
            : 'border-slate-200 hover:border-slate-300'
            }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 pl-2.5 pr-1 select-none flex items-center gap-1">
            <Pencil className="w-3 h-3 text-slate-400" />
            Custom:
          </span>
          <input
            ref={inputRef}
            type="number"
            min={1}
            placeholder="e.g. 10"
            value={isCustomMode ? customStr : ''}
            onFocus={() => {
              setIsCustomMode(true);
              if (!customStr) {
                setCustomStr(String(value));
              }
            }}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomBlur}
            className="w-16 px-1 py-1.5 text-xs font-bold text-slate-900 bg-transparent text-center focus:outline-none tabular-nums"
          />
          <span className="text-[10.5px] font-semibold text-slate-400 pr-2.5 select-none">
            {unitSuffix}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MarginSplitProps {
  customerPrice: number;
  driverPrice: number;
  unitLabel?: string;
}

function MarginSplitBar({ customerPrice, driverPrice, unitLabel }: MarginSplitProps) {
  const cPrice = Math.max(0, customerPrice || 0);
  const dPrice = Math.max(0, driverPrice || 0);
  const margin = Math.max(0, cPrice - dPrice);
  const driverShare = cPrice > 0 ? Math.round((dPrice / cPrice) * 100) : 0;
  const platformShare = cPrice > 0 ? 100 - driverShare : 0;
  const isLoss = dPrice > cPrice;

  return (
    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Financial Margin Split</span>
          {unitLabel && <span className="text-[10px] text-slate-400">({unitLabel})</span>}
        </div>

        {isLoss ? (
          <span className="text-[10.5px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            ⚠ Driver Payout Exceeds Fare!
          </span>
        ) : (
          <span className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Platform Retains: ₹{margin} ({platformShare}%)
          </span>
        )}
      </div>

      {/* Visual Dual-Bar */}
      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${Math.min(100, Math.max(0, driverShare))}%` }}
          className="bg-emerald-600 transition-all duration-300"
          title={`Driver Payout: ₹${dPrice} (${driverShare}%)`}
        />
        <div
          style={{ width: `${Math.min(100, Math.max(0, platformShare))}%` }}
          className="bg-amber-500 transition-all duration-300"
          title={`Platform Commission: ₹${margin} (${platformShare}%)`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Driver Payout:</span>
          <span className="font-semibold text-slate-800">
            ₹{dPrice} ({driverShare}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Platform Commission:</span>
          <span className="font-semibold text-slate-800">
            ₹{margin} ({platformShare}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// READ-ONLY DISPLAY COMPONENTS (DEFAULT VIEW MODE)
// ============================================================================

interface ReadOnlyTierCardProps {
  shiftTitle: string;
  subTitle: string;
  badgeText: string;
  timeRange: string;
  durationHours: number;
  chargeType?: string;
  customerPrice: number;
  driverPrice: number;
  isNight?: boolean;
  onEdit: () => void;
}

function ReadOnlyTierCard({
  shiftTitle,
  subTitle,
  badgeText,
  timeRange,
  durationHours,
  chargeType,
  customerPrice,
  driverPrice,
  isNight = false,
  onEdit,
}: ReadOnlyTierCardProps) {
  const margin = Math.max(0, customerPrice - driverPrice);
  const marginPercent = customerPrice > 0 ? Math.round((margin / customerPrice) * 100) : 0;
  const driverPercent = 100 - marginPercent;

  return (
    <div
      onClick={onEdit}
      className="group rounded-xl border border-slate-200/90 bg-slate-50/60 p-4.5 space-y-3.5 hover:border-emerald-600/40 hover:bg-white hover:shadow-xs transition-all cursor-pointer relative"
    >
      {/* Shift Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold transition-transform group-hover:scale-105 ${isNight ? 'bg-indigo-100/80 text-indigo-700' : 'bg-amber-100/80 text-amber-700'
              }`}
          >
            {isNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              {shiftTitle}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {timeRange} • {chargeType || `Per ${durationHours} Hour${durationHours > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
          {badgeText}
        </span>
      </div>

      {/* Main Fare & Margin Split */}
      <div className="flex items-baseline justify-between pt-0.5">
        <div>
          <span className="text-2xl font-semibold text-slate-900 tracking-tight">
            ₹{customerPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 ml-1.5 font-medium">Customer Fare</span>
        </div>
        <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          ₹{margin.toLocaleString('en-IN')} Margin ({marginPercent}%)
        </span>
      </div>

      {/* Driver Payout and Edit Button */}
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
        <span>
          Driver Payout:{' '}
          <span className="font-semibold text-slate-800">₹{driverPrice.toLocaleString('en-IN')}</span>{' '}
          ({driverPercent}%)
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-xs font-semibold text-[#023526] group-hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
    </div>
  );
}

interface ReadOnlyOutstationCardProps {
  title: string;
  subTitle: string;
  badgeText: string;
  days: number;
  customerPrice: number;
  driverPrice: number;
  notes: string;
  onEdit: () => void;
}

function ReadOnlyOutstationCard({
  title,
  subTitle,
  badgeText,
  days,
  customerPrice,
  driverPrice,
  notes,
  onEdit,
}: ReadOnlyOutstationCardProps) {
  const margin = Math.max(0, customerPrice - driverPrice);
  const marginPercent = customerPrice > 0 ? Math.round((margin / customerPrice) * 100) : 0;
  const driverPercent = 100 - marginPercent;

  return (
    <div
      onClick={onEdit}
      className="group bg-slate-50/60 rounded-xl border border-slate-200/90 p-5 space-y-4 hover:border-sky-500/40 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-semibold border border-sky-200/80 transition-transform group-hover:scale-105">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500">{subTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-mono px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-200">
            {badgeText}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 group-hover:bg-sky-50 group-hover:text-sky-800 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
        <div>
          <span className="text-[10.5px] font-semibold text-slate-400 block uppercase tracking-wide">Included Coverage</span>
          <div className="text-lg font-semibold text-slate-900 mt-0.5">
            {days} Day(s) Package
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Minimum duration</span>
        </div>

        <div>
          <span className="text-[10.5px] font-semibold text-slate-700 block uppercase tracking-wide">Customer Base Tariff</span>
          <div className="text-lg font-semibold text-slate-900 mt-0.5">
            ₹{customerPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Billed per package</span>
        </div>

        <div>
          <span className="text-[10.5px] font-semibold text-emerald-700 block uppercase tracking-wide">Driver Base Payout</span>
          <div className="text-lg font-semibold text-emerald-700 mt-0.5">
            ₹{driverPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">{driverPercent}% Guaranteed</span>
        </div>

        <div>
          <span className="text-[10.5px] font-semibold text-amber-700 block uppercase tracking-wide">Platform Margin</span>
          <div className="text-lg font-semibold text-amber-700 mt-0.5">
            ₹{margin.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">{marginPercent}% Revenue Share</span>
        </div>
      </div>

      {/* Margin Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
          <div style={{ width: `${driverPercent}%` }} className="h-full bg-emerald-600 transition-all duration-300" />
          <div style={{ width: `${marginPercent}%` }} className="h-full bg-amber-500 transition-all duration-300" />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium">
          <span>Driver: ₹{driverPrice} ({driverPercent}%)</span>
          <span className="text-slate-500 font-semibold">{notes}</span>
          <span>Platform: ₹{margin} ({marginPercent}%)</span>
        </div>
      </div>
    </div>
  );
}

interface ReadOnlyValetOverviewProps {
  valetParkingTier: ValetParkingPricingTier;
  onEdit: () => void;
}

function ReadOnlyValetOverview({ valetParkingTier, onEdit }: ReadOnlyValetOverviewProps) {
  const customerPrice = valetParkingTier?.customerprice ?? 600;
  const driverPrice = valetParkingTier?.driverprice ?? 480;
  const margin = Math.max(0, customerPrice - driverPrice);
  const marginPercent = customerPrice > 0 ? Math.round((margin / customerPrice) * 100) : 0;
  const driverPercent = 100 - marginPercent;

  const durationHours = valetParkingTier?.hours ?? 4;
  const personCount = valetParkingTier?.person ?? 1;
  const customerHourly = Math.round(customerPrice / durationHours);
  const driverHourly = Math.round(driverPrice / durationHours);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-semibold border border-amber-200/80 shadow-2xs">
            <Building2 className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Valet Parking & Event Operations
            </h3>
            <p className="text-xs text-slate-500">
              Professional chauffeur and valet parking attendant operations for venues, hotels, and luxury private events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            Active Valet Tariff
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 bg-[#023526] hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Valet Rates
          </button>
        </div>
      </div>

      {/* 4 Feature Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Customer Package Fare
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              {durationHours}h Tier
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            ₹{customerPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>₹{customerHourly}/hr rate</span>
            <span className="text-amber-700 font-semibold">{personCount} Attendant</span>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Driver Staff Payout
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              Guaranteed
            </span>
          </div>
          <div className="text-2xl font-semibold text-emerald-700">
            ₹{driverPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>₹{driverHourly}/hr payout</span>
            <span className="text-emerald-700 font-semibold">{driverPercent}% share</span>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Platform Revenue
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Margin
            </span>
          </div>
          <div className="text-2xl font-semibold text-amber-800">
            ₹{margin.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>Retained revenue</span>
            <span className="text-amber-800 font-semibold">{marginPercent}% margin</span>
          </div>
        </div>

        {/* Tile 4 */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Service Window
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Duration
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {durationHours} Hours
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
            {personCount} Valet driver dedicated per booking
          </p>
        </div>
      </div>

      {/* Margin Split Bar */}
      <MarginSplitBar
        customerPrice={customerPrice}
        driverPrice={driverPrice}
        unitLabel={`${personCount} Attendant · ${durationHours}h Package`}
      />

      {/* Sample Booking Projection Box */}
      <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-amber-900 block">
            Standard Valet Package ({personCount} Staff × {durationHours} Hours):
          </span>
          <span className="text-slate-500 text-[11px]">
            Customer Total: <span className="font-semibold text-slate-800">₹{customerPrice.toLocaleString('en-IN')}</span> · Driver Staff Earnings: <span className="font-semibold text-slate-800">₹{driverPrice.toLocaleString('en-IN')}</span> · Platform Net Margin: <span className="text-amber-800 font-semibold">₹{margin.toLocaleString('en-IN')} ({marginPercent}%)</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="self-start md:self-auto px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Update Valet Rates
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL EDIT TYPES & COMPONENT (CARD-SPECIFIC EDIT MODAL)
// ============================================================================

export type EditModalTarget =
  | {
    category: 'local';
    tripType: 'one_way' | 'round_trip';
    shift: 'morningHours' | 'nightHours';
    title: string;
    subTitle: string;
    badgeText: string;
    isNight: boolean;
  }
  | {
    category: 'outstation';
    tripType: 'one_way' | 'round_trip';
    title: string;
    subTitle: string;
    badgeText: string;
    notes: string;
  }
  | {
    category: 'valet';
    title: string;
    subTitle: string;
  };

interface EditPricingModalProps {
  target: EditModalTarget;
  onClose: () => void;
  localTiers: LocalPricingTiers;
  outstationTiers: OutstationPricingTiers;
  valetParkingTier: ValetParkingPricingTier;
  valetPricing?: ValetPricingConfig;
  onSaveLocalTier: (
    tripType: 'one_way' | 'round_trip',
    shift: 'morningHours' | 'nightHours',
    updatedTier: TimePricingTier
  ) => Promise<void>;
  onSaveOutstationTier: (
    tripType: 'one_way' | 'round_trip',
    updatedTier: {
      day: number;
      customerPrice: number;
      driverPrice: number;
    }
  ) => Promise<void>;
  onSaveValetParkingTier: (updatedTier: ValetParkingPricingTier) => Promise<void>;
  onSaveValet?: (updatedValet: ValetPricingConfig) => void;
  isSaving: boolean;
}

const LOCAL_PRESET_CHARGES = [
  'Per 1 Hour',
  'Per 2 Hours',
  'Per 3 Hours',
  'Per 4 Hours',
  'Per 5 Hours',
  'Per 6 Hours',
  'Per 8 Hours',
  'Per 10 Hours',
  'Per 12 Hours',
  'Per 24 Hours',
];

function EditPricingModal({
  target,
  onClose,
  localTiers,
  outstationTiers,
  valetParkingTier,
  valetPricing,
  onSaveLocalTier,
  onSaveOutstationTier,
  onSaveValetParkingTier,
  onSaveValet,
  isSaving,
}: EditPricingModalProps) {
  // Local tier state
  const [localShift, setLocalShift] = useState<'morningHours' | 'nightHours'>(
    target.category === 'local' ? target.shift : 'morningHours'
  );

  const [draftLocalTier, setDraftLocalTier] = useState<TimePricingTier>(() => {
    if (target.category === 'local') {
      return { ...localTiers[target.tripType][target.shift] };
    }
    return { hours: 4, timeRange: '06:00-18:00', customerPrice: 400, driverPrice: 320 };
  });

  const [isCustomLocalBilling, setIsCustomLocalBilling] = useState<boolean>(() => {
    if (target.category === 'local') {
      const charge = localTiers[target.tripType][target.shift].chargeType;
      return Boolean(charge && !LOCAL_PRESET_CHARGES.includes(charge));
    }
    return false;
  });

  // Outstation tier state
  const [draftOutstationDays, setDraftOutstationDays] = useState<number>(() => {
    if (target.category === 'outstation') {
      return outstationTiers[target.tripType].day || 1;
    }
    return 1;
  });
  const [draftOutstationCustomerPrice, setDraftOutstationCustomerPrice] = useState<number>(() => {
    if (target.category === 'outstation') {
      return outstationTiers[target.tripType].customerPrice || 1500;
    }
    return 1500;
  });
  const [draftOutstationDriverPrice, setDraftOutstationDriverPrice] = useState<number>(() => {
    if (target.category === 'outstation') {
      return outstationTiers[target.tripType].driverPrice || 1200;
    }
    return 1200;
  });

  // Valet parking state
  const [draftValetParking, setDraftValetParking] = useState<ValetParkingPricingTier>(() => ({
    person: valetParkingTier?.person ?? 1,
    hours: valetParkingTier?.hours ?? 4,
    customerprice: valetParkingTier?.customerprice ?? 600,
    driverprice: valetParkingTier?.driverprice ?? 480,
  }));

  // Handle shift switch in Local edit modal
  const handleShiftSwitch = (shift: 'morningHours' | 'nightHours') => {
    if (target.category === 'local') {
      setLocalShift(shift);
      const tier = localTiers[target.tripType][shift];
      setDraftLocalTier({ ...tier });
      setIsCustomLocalBilling(Boolean(tier.chargeType && !LOCAL_PRESET_CHARGES.includes(tier.chargeType)));
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (target.category === 'local') {
      await onSaveLocalTier(target.tripType, localShift, draftLocalTier);
    } else if (target.category === 'outstation') {
      await onSaveOutstationTier(target.tripType, {
        day: draftOutstationDays,
        customerPrice: draftOutstationCustomerPrice,
        driverPrice: draftOutstationDriverPrice,
      });
    } else if (target.category === 'valet') {
      await onSaveValetParkingTier(draftValetParking);
    }
  };

  const isNightShift = target.category === 'local' && localShift === 'nightHours';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-gradient-to-b from-slate-50/90 to-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-semibold shrink-0 ${target.category === 'local'
                ? isNightShift
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-amber-100 text-amber-700'
                : target.category === 'outstation'
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-amber-100 text-amber-700'
                }`}
            >
              {target.category === 'local' ? (
                isNightShift ? <Moon className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Sun className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              ) : target.category === 'outstation' ? (
                <MapPin className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              ) : (
                <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-tight">
                  {target.category === 'local'
                    ? `${target.tripType === 'one_way' ? 'One-Way' : 'Round-Trip'} ${localShift === 'nightHours' ? 'Night Shift' : 'Day Shift'
                    }`
                    : target.title}
                </h3>
                {target.category === 'local' && (
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${isNightShift
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                  >
                    {isNightShift ? 'Night Tariff' : 'Day Tariff'}
                  </span>
                )}
                {target.category === 'outstation' && (
                  <span className="text-[9.5px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                    {target.badgeText}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{target.subTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-semibold text-sm transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* LOCAL TIER FIELDS */}
            {target.category === 'local' && (
              <div className="space-y-4">
              {/* Shift Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Active Shift:</span>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleShiftSwitch('morningHours')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${localShift === 'morningHours'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    Day Shift
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShiftSwitch('nightHours')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${localShift === 'nightHours'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    Night Shift
                  </button>
                </div>
              </div>

              {/* Active Time Window */}
              <TimeWindowPicker
                label="Active Time Window (Clock Shift)"
                value={draftLocalTier.timeRange}
                onChange={(val) => setDraftLocalTier({ ...draftLocalTier, timeRange: val })}
                presets={
                  localShift === 'morningHours'
                    ? ['06:00-18:00', '08:00-20:00', '07:00-19:00', '09:00-21:00']
                    : ['18:00-06:00', '20:00-08:00', '22:00-06:00', '21:00-07:00']
                }
              />

              {/* Charge Type Field (Billing Basis) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Charge Type (Billing Basis)
                  </label>
                  <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {draftLocalTier.chargeType || `Per ${draftLocalTier.hours} Hour${draftLocalTier.hours > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-500/15 overflow-hidden transition-all">
                  <span className="px-2.5 py-2.5 text-slate-400 bg-slate-50 border-r border-slate-200 text-xs flex items-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                  <select
                    value={
                      isCustomLocalBilling
                        ? 'custom'
                        : (draftLocalTier.chargeType || `Per ${draftLocalTier.hours} Hour${draftLocalTier.hours > 1 ? 's' : ''}`)
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomLocalBilling(true);
                        if (
                          !draftLocalTier.chargeType ||
                          LOCAL_PRESET_CHARGES.includes(draftLocalTier.chargeType)
                        ) {
                          setDraftLocalTier({
                            ...draftLocalTier,
                            chargeType: `Per ${draftLocalTier.hours || 2} Hours`,
                          });
                        }
                      } else {
                        setIsCustomLocalBilling(false);
                        const match = val.match(/\d+/);
                        const hrs = match ? parseInt(match[0], 10) : draftLocalTier.hours;
                        setDraftLocalTier({
                          ...draftLocalTier,
                          chargeType: val,
                          hours: hrs,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    {LOCAL_PRESET_CHARGES.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset === 'Per 24 Hours' ? 'Per 24 Hours (Full Day)' : preset}
                      </option>
                    ))}
                    <option value="custom">Custom Billing Basis...</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Direct text input when custom billing basis is selected */}
                {isCustomLocalBilling && (
                  <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-500/15 overflow-hidden transition-all mt-1.5 animate-fadeIn">
                    <span className="px-2.5 py-2 text-slate-400 bg-slate-50 border-r border-slate-200 text-xs flex items-center shrink-0">
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. Per 2 Hours or Per Trip"
                      value={draftLocalTier.chargeType || ''}
                      autoFocus
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = val.match(/\d+/);
                        const hrs = match ? parseInt(match[0], 10) : draftLocalTier.hours;
                        setDraftLocalTier({
                          ...draftLocalTier,
                          chargeType: val,
                          hours: hrs,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Fares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <CurrencyField
                  label="Customer Fare"
                  sublabel={`Billed ${draftLocalTier.chargeType || `per ${draftLocalTier.hours} hr${draftLocalTier.hours > 1 ? 's' : ''}`}`}
                  value={draftLocalTier.customerPrice}
                  onChange={(val) =>
                    setDraftLocalTier({ ...draftLocalTier, customerPrice: val })
                  }
                  accent={isNightShift ? 'indigo' : 'emerald'}
                  step={50}
                />

                <CurrencyField
                  label="Driver Payout"
                  sublabel={`Paid ${draftLocalTier.chargeType || `per ${draftLocalTier.hours} hr${draftLocalTier.hours > 1 ? 's' : ''}`}`}
                  value={draftLocalTier.driverPrice}
                  onChange={(val) =>
                    setDraftLocalTier({ ...draftLocalTier, driverPrice: val })
                  }
                  accent={isNightShift ? 'indigo' : 'emerald'}
                  step={50}
                />
              </div>

              {/* Live Margin Split */}
              <MarginSplitBar
                customerPrice={draftLocalTier.customerPrice}
                driverPrice={draftLocalTier.driverPrice}
                unitLabel={draftLocalTier.chargeType || `Per ${draftLocalTier.hours} Hour${draftLocalTier.hours > 1 ? 's' : ''}`}
              />
            </div>
          )}

          {/* OUTSTATION FIELDS */}
          {target.category === 'outstation' && (
            <div className="space-y-4">
              <HourSelector
                label="Included Coverage Duration"
                value={draftOutstationDays}
                onChange={setDraftOutstationDays}
                options={[1, 2, 3, 4, 5, 7]}
                unitText="day(s)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <CurrencyField
                  label="Customer Base Tariff"
                  sublabel="Billed per package"
                  value={draftOutstationCustomerPrice}
                  onChange={setDraftOutstationCustomerPrice}
                  accent="sky"
                  step={100}
                />

                <CurrencyField
                  label="Driver Base Payout"
                  sublabel="Guaranteed driver share"
                  value={draftOutstationDriverPrice}
                  onChange={setDraftOutstationDriverPrice}
                  accent="sky"
                  step={100}
                />
              </div>

              <MarginSplitBar
                customerPrice={draftOutstationCustomerPrice}
                driverPrice={draftOutstationDriverPrice}
                unitLabel={`${draftOutstationDays} Day(s) Package`}
              />
            </div>
          )}

          {/* VALET PARKING FIELDS */}
          {target.category === 'valet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <CurrencyField
                  label="Customer Package Fare"
                  sublabel="Billed to customer"
                  value={draftValetParking.customerprice}
                  onChange={(val) =>
                    setDraftValetParking({ ...draftValetParking, customerprice: val })
                  }
                  accent="amber"
                  step={50}
                  min={0}
                />

                <CurrencyField
                  label="Driver Staff Payout"
                  sublabel="Guaranteed driver earnings"
                  value={draftValetParking.driverprice}
                  onChange={(val) =>
                    setDraftValetParking({ ...draftValetParking, driverprice: val })
                  }
                  accent="emerald"
                  step={50}
                  min={0}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <CurrencyField
                  label="Valet Attendants / Staff"
                  sublabel="Number of staff required"
                  prefix="#"
                  unit="person"
                  value={draftValetParking.person}
                  onChange={(val) =>
                    setDraftValetParking({ ...draftValetParking, person: Math.max(1, val) })
                  }
                  accent="amber"
                  step={1}
                  min={1}
                />

                <HourSelector
                  label="Package Duration"
                  value={draftValetParking.hours}
                  onChange={(val) =>
                    setDraftValetParking({ ...draftValetParking, hours: Math.max(1, val) })
                  }
                  options={[2, 4, 6, 8, 10, 12]}
                />
              </div>

              {/* Margin Split Bar */}
              <MarginSplitBar
                customerPrice={draftValetParking.customerprice}
                driverPrice={draftValetParking.driverprice}
                unitLabel={`${draftValetParking.person} Staff · ${draftValetParking.hours}h Package`}
              />

              {/* Sample / Breakdown Projection */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1 text-xs">
                <div className="font-semibold text-amber-900">
                  Rate Summary ({draftValetParking.person} Staff × {draftValetParking.hours} Hours Package):
                </div>
                <div className="text-slate-600 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-amber-200/50">
                  <span>Customer: ₹{draftValetParking.customerprice.toLocaleString('en-IN')} (₹{Math.round(draftValetParking.customerprice / (draftValetParking.hours || 1))}/hr)</span>
                  <span>Driver Staff: ₹{draftValetParking.driverprice.toLocaleString('en-IN')} (₹{Math.round(draftValetParking.driverprice / (draftValetParking.hours || 1))}/hr)</span>
                  <span className="font-semibold text-amber-800">
                    Margin: ₹{Math.max(0, draftValetParking.customerprice - draftValetParking.driverprice).toLocaleString('en-IN')} ({draftValetParking.customerprice > 0 ? Math.round(((draftValetParking.customerprice - draftValetParking.driverprice) / draftValetParking.customerprice) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Modal Actions Footer (Pinned at bottom, always visible) */}
          <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-xs flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-[#023526] to-[#044c37] hover:from-[#012519] hover:to-[#023526] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================= ===============================
// MAIN COMPONENT
// ============================================================================

export default function PricingManagementView() {
  const { toast } = useToast();
  const {
    driverPricing,
    isLoading,
    isSaving,
    valetPricing,
    pricingRules,
    fetchDriverPricing,
    saveDriverPricing,
    updateValetPricing,
    addPricingRule,
    togglePricingRuleStatus,
  } = usePricingStore();

  const [activeTab, setActiveTab] = useState<'local' | 'outstation' | 'valet' | 'rules'>('local');

  // Modal Edit Target state (null means modal is closed)
  const [editModalTarget, setEditModalTarget] = useState<EditModalTarget | null>(null);

  // Local state initialized with store data or fallback defaults
  const [localTiers, setLocalTiers] = useState<LocalPricingTiers>(
    driverPricing?.local || defaultDriverPricingData.local
  );
  const [outstationTiers, setOutstationTiers] = useState<OutstationPricingTiers>(
    driverPricing?.outstation || defaultDriverPricingData.outstation
  );
  const [valetParkingTier, setValetParkingTier] = useState<ValetParkingPricingTier>(
    driverPricing?.valletparking || defaultDriverPricingData.valletparking!
  );
  const [valetForm, setValetForm] = useState<ValetPricingConfig>(valetPricing);

  // New Rule Form Modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: '',
    service: 'All' as PricingRule['service'],
    condition: '',
    type: 'Percentage' as PricingRule['type'],
    value: 15,
    priority: 'Medium' as PricingRule['priority'],
    status: 'Active' as PricingRule['status'],
  });

  // Fetch driver pricing from database via Zustand on mount
  useEffect(() => {
    fetchDriverPricing();
  }, [fetchDriverPricing]);

  // Synchronize local form when store receives updated pricing data
  useEffect(() => {
    if (driverPricing) {
      if (driverPricing.local) {
        setLocalTiers(driverPricing.local);
      }
      if (driverPricing.outstation) {
        setOutstationTiers(driverPricing.outstation);
      }
      if (driverPricing.valletparking) {
        setValetParkingTier(driverPricing.valletparking);
      }
    }
  }, [driverPricing]);

  // Handle Save Local Driver Tier via Zustand
  const handleSaveLocalTier = async (
    tripType: 'one_way' | 'round_trip',
    shift: 'morningHours' | 'nightHours',
    updatedTier: TimePricingTier
  ) => {
    const updatedLocal: LocalPricingTiers = {
      ...localTiers,
      [tripType]: {
        ...localTiers[tripType],
        [shift]: updatedTier,
      },
    };
    setLocalTiers(updatedLocal);

    const payload = {
      _id: driverPricing?._id,
      local: updatedLocal,
      outstation: outstationTiers,
      valletparking: valetParkingTier,
    };

    const res = await saveDriverPricing(payload);
    if (res.success) {
      toast.success('Local Rate Updated', res.message || 'Pricing saved to database.');
      setEditModalTarget(null);
    } else {
      toast.error('Save Failed', res.error || 'Could not save local pricing.');
    }
  };

  // Handle Save Outstation Pricing Tier via Zustand
  const handleSaveOutstationTier = async (
    tripType: 'one_way' | 'round_trip',
    updatedTier: {
      day: number;
      customerPrice: number;
      driverPrice: number;
    }
  ) => {
    const currentMode = outstationTiers[tripType];
    const updatedOutstation: OutstationPricingTiers = {
      ...outstationTiers,
      [tripType]: {
        ...currentMode,
        day: updatedTier.day,
        customerPrice: updatedTier.customerPrice,
        driverPrice: updatedTier.driverPrice,
        morningHours: {
          ...currentMode.morningHours,
          customerPrice: updatedTier.customerPrice,
          driverPrice: updatedTier.driverPrice,
        },
        nightHours: {
          ...currentMode.nightHours,
          customerPrice: Math.round(updatedTier.customerPrice * 1.2),
          driverPrice: Math.round(updatedTier.driverPrice * 1.2),
        },
      },
    };
    setOutstationTiers(updatedOutstation);

    const payload = {
      _id: driverPricing?._id,
      local: localTiers,
      outstation: updatedOutstation,
      valletparking: valetParkingTier,
    };

    const res = await saveDriverPricing(payload);
    if (res.success) {
      toast.success('Outstation Rate Updated', res.message || 'Pricing saved to database.');
      setEditModalTarget(null);
    } else {
      toast.error('Save Failed', res.error || 'Could not save outstation pricing.');
    }
  };

  // Handle Save Valet Parking Tier via Zustand & Database
  const handleSaveValetParkingTier = async (updatedTier: ValetParkingPricingTier) => {
    setValetParkingTier(updatedTier);

    const payload = {
      _id: driverPricing?._id,
      local: localTiers,
      outstation: outstationTiers,
      valletparking: updatedTier,
    };

    const res = await saveDriverPricing(payload);
    if (res.success) {
      toast.success('Valet Parking Rate Updated', res.message || 'Pricing saved to database.');
      setEditModalTarget(null);
    } else {
      toast.error('Save Failed', res.error || 'Could not save valet parking pricing.');
    }
  };

  // Handle Save Valet Event Pricing
  const handleSaveValet = (updatedValet: ValetPricingConfig) => {
    setValetForm(updatedValet);
    updateValetPricing(updatedValet);
    toast.success('Valet Rates Updated', 'Valet event tariff updated.');
    setEditModalTarget(null);
  };

  // Handle Add Surge Rule
  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.ruleName.trim()) return;
    addPricingRule(newRule);
    setShowAddRuleModal(false);
    setNewRule({
      ruleName: '',
      service: 'All',
      condition: '',
      type: 'Percentage',
      value: 15,
      priority: 'Medium',
      status: 'Active',
    });
    toast.success('Surge Rule Created', 'New rule added successfully.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ====================================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Pricing & Tariffs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer fare tiers, driver payouts, and operational platform margins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDriverPricing()}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 transition-all flex items-center gap-2 shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh Rates'}</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* 4 SLEEK STAT TILES */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Metric 1: Local Driver */}
        <div className="bg-white rounded-md border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Car className="w-4 h-4 text-emerald-700" />
              Local City Base
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {localTiers.one_way.morningHours.hours}h tier
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">
            ₹{localTiers.one_way.morningHours.customerPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>
              Driver: <span className="font-semibold text-slate-800">₹{localTiers.one_way.morningHours.driverPrice}</span>
            </span>
            <span className="text-emerald-700 font-semibold">
              ₹{localTiers.one_way.morningHours.customerPrice - localTiers.one_way.morningHours.driverPrice} margin
            </span>
          </div>
        </div>

        {/* Metric 2: Outstation */}
        <div className="bg-white rounded-md border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Outstation Daily
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/60">
              {outstationTiers.one_way.day} Day Min
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">
            ₹{outstationTiers.one_way.customerPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>
              Driver: <span className="font-semibold text-slate-800">₹{outstationTiers.one_way.driverPrice}</span>
            </span>
            <span className="text-sky-700 font-semibold">
              ₹{outstationTiers.one_way.customerPrice - outstationTiers.one_way.driverPrice} margin
            </span>
          </div>
        </div>

        {/* Metric 3: Valet Parking */}
        <div className="bg-white rounded-md border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Building2 className="w-4 h-4 text-amber-600" />
              Valet Parking
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
              {valetParkingTier.person} Person · {valetParkingTier.hours}h Tier
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">
            ₹{valetParkingTier.customerprice.toLocaleString('en-IN')}
            <span className="text-xs text-slate-400 font-medium ml-1">/ package</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>
              Driver: <span className="font-semibold text-slate-800">₹{valetParkingTier.driverprice}</span>
            </span>
            <span className="text-amber-800 font-semibold">
              ₹{valetParkingTier.customerprice - valetParkingTier.driverprice} margin ({valetParkingTier.customerprice > 0 ? Math.round(((valetParkingTier.customerprice - valetParkingTier.driverprice) / valetParkingTier.customerprice) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Metric 4: Surge Multipliers */}
        {/* <div className="bg-white rounded-md border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Zap className="w-4 h-4 text-purple-600" />
              Surge Rules
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200/60">
              {pricingRules.length} Total
            </span>
          </div>
          <div className="text-2xl font-semibold text-purple-900 tracking-tight">
            {pricingRules.filter((r) => r.status === 'Active').length} Active
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Dynamic Multipliers</span>
            <span className="text-purple-700 font-semibold">Operational</span>
          </div>
        </div> */}
      </div>

      {/* ====================================================================== */}
      {/* SERVICE MODE TABS NAVIGATION */}
      {/* ====================================================================== */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'local'
            ? 'bg-[#023526] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Local Driver</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outstation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'outstation'
            ? 'bg-[#023526] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Outstation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('valet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'valet'
            ? 'bg-[#023526] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Valet Parking</span>
        </button>

        {/* <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'rules'
            ? 'bg-[#023526] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Surge Rules ({pricingRules.filter((r) => r.status === 'Active').length})</span>
        </button> */}
      </div>

      {/* ====================================================================== */}
      {/* TAB CONTENT 1: LOCAL DRIVER PRICING STUDIO */}
      {/* ====================================================================== */}
      {activeTab === 'local' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 animate-fadeIn">
          {/* Section 1: One-Way Local Driver Tiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-sm font-semibold text-slate-800">One-Way Point-to-Point Tiers</h4>
                <span className="text-xs text-slate-400 font-semibold ml-1.5">• Single drop off</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Click any card to edit
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ReadOnlyTierCard
                shiftTitle="One-Way Day Shift"
                subTitle="Regular standard day point-to-point hours"
                badgeText="Day Tariff"
                timeRange={localTiers.one_way.morningHours.timeRange}
                durationHours={localTiers.one_way.morningHours.hours}
                chargeType={localTiers.one_way.morningHours.chargeType}
                customerPrice={localTiers.one_way.morningHours.customerPrice}
                driverPrice={localTiers.one_way.morningHours.driverPrice}
                isNight={false}
                onEdit={() =>
                  setEditModalTarget({
                    category: 'local',
                    tripType: 'one_way',
                    shift: 'morningHours',
                    title: 'One-Way Day Shift',
                    subTitle: 'Point-to-point standard daytime chauffeuring',
                    badgeText: 'Day Tariff',
                    isNight: false,
                  })
                }
              />

              <ReadOnlyTierCard
                shiftTitle="One-Way Night Shift"
                subTitle="Overnight late-night city rides"
                badgeText="Night Tariff"
                timeRange={localTiers.one_way.nightHours.timeRange}
                durationHours={localTiers.one_way.nightHours.hours}
                chargeType={localTiers.one_way.nightHours.chargeType}
                customerPrice={localTiers.one_way.nightHours.customerPrice}
                driverPrice={localTiers.one_way.nightHours.driverPrice}
                isNight={true}
                onEdit={() =>
                  setEditModalTarget({
                    category: 'local',
                    tripType: 'one_way',
                    shift: 'nightHours',
                    title: 'One-Way Night Shift',
                    subTitle: 'Point-to-point overnight city chauffeuring',
                    badgeText: 'Night Tariff',
                    isNight: true,
                  })
                }
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Section 2: Round-Trip Local Driver Packages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-800">Round-Trip Hourly Packages</h4>
                <span className="text-xs text-slate-400 font-semibold ml-1.5">• Return city chauffeuring</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Click any card to edit
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ReadOnlyTierCard
                shiftTitle="Round-Trip Day Shift"
                subTitle="Multi-stop day city tour with return"
                badgeText="Day Return"
                timeRange={localTiers.round_trip.morningHours.timeRange}
                durationHours={localTiers.round_trip.morningHours.hours}
                chargeType={localTiers.round_trip.morningHours.chargeType}
                customerPrice={localTiers.round_trip.morningHours.customerPrice}
                driverPrice={localTiers.round_trip.morningHours.driverPrice}
                isNight={false}
                onEdit={() =>
                  setEditModalTarget({
                    category: 'local',
                    tripType: 'round_trip',
                    shift: 'morningHours',
                    title: 'Round-Trip Day Shift',
                    subTitle: 'Multi-stop city tour with return (daytime)',
                    badgeText: 'Day Return',
                    isNight: false,
                  })
                }
              />

              <ReadOnlyTierCard
                shiftTitle="Round-Trip Night Shift"
                subTitle="Late-night party or night event chauffeuring"
                badgeText="Night Return"
                timeRange={localTiers.round_trip.nightHours.timeRange}
                durationHours={localTiers.round_trip.nightHours.hours}
                chargeType={localTiers.round_trip.nightHours.chargeType}
                customerPrice={localTiers.round_trip.nightHours.customerPrice}
                driverPrice={localTiers.round_trip.nightHours.driverPrice}
                isNight={true}
                onEdit={() =>
                  setEditModalTarget({
                    category: 'local',
                    tripType: 'round_trip',
                    shift: 'nightHours',
                    title: 'Round-Trip Night Shift',
                    subTitle: 'Late-night party or return event chauffeuring',
                    badgeText: 'Night Return',
                    isNight: true,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB CONTENT 2: OUTSTATION PRICING STUDIO */}
      {/* ====================================================================== */}
      {activeTab === 'outstation' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 animate-fadeIn">
          {/* Header directly on main card */}
          <div className="flex items-center justify-between px-0.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h4 className="text-sm font-semibold text-slate-800">Intercity Outstation Tariffs</h4>
              <span className="text-xs text-slate-400 font-semibold ml-1.5">• 2 Service Modes</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Click any card to edit
            </span>
          </div>

          {/* Outstation Cards */}
          <div className="space-y-4">
            <ReadOnlyOutstationCard
              title="One-Way Intercity Outstation Tariff"
              subTitle="Intercity driver drop to outstation cities (driver travel back required)."
              badgeText="Daily Billing Cycle"
              days={outstationTiers.one_way.day}
              customerPrice={outstationTiers.one_way.customerPrice}
              driverPrice={outstationTiers.one_way.driverPrice}
              notes="Drop to destination (one-way)"
              onEdit={() =>
                setEditModalTarget({
                  category: 'outstation',
                  tripType: 'one_way',
                  title: 'One-Way Intercity Outstation Tariff',
                  subTitle: 'Intercity driver drop to outstation cities (driver travel back required).',
                  badgeText: 'Daily Billing Cycle',
                  notes: 'Drop to destination (one-way)',
                })
              }
            />

            <div className="border-t border-slate-100" />

            <ReadOnlyOutstationCard
              title="Round-Trip Intercity Outstation Packages"
              subTitle="Chauffeur accompanies customer outstation for multi-day tours with return."
              badgeText="Tour / Return Multi-Day"
              days={outstationTiers.round_trip.day}
              customerPrice={outstationTiers.round_trip.customerPrice}
              driverPrice={outstationTiers.round_trip.driverPrice}
              notes="Multi-day tour with return"
              onEdit={() =>
                setEditModalTarget({
                  category: 'outstation',
                  tripType: 'round_trip',
                  title: 'Round-Trip Intercity Outstation Packages',
                  subTitle: 'Chauffeur accompanies customer outstation for multi-day tours with return.',
                  badgeText: 'Tour / Return Multi-Day',
                  notes: 'Multi-day tour with return',
                })
              }
            />
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB CONTENT 3: VALET PRICING STUDIO */}
      {/* ====================================================================== */}
      {activeTab === 'valet' && (
        <div className="space-y-6 animate-fadeIn">
          <ReadOnlyValetOverview
            valetParkingTier={valetParkingTier}
            onEdit={() =>
              setEditModalTarget({
                category: 'valet',
                title: 'Valet Parking & Event Operations',
                subTitle: 'Chauffeur and valet parking attendant operations for venues, hotels, and luxury private events.',
              })
            }
          />
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB CONTENT 4: SURGE RULES STUDIO */}
      {/* ====================================================================== */}
      {activeTab === 'rules' &&
        (() => {
          const ruleColumns: Column<PricingRule>[] = [
            {
              key: 'ruleName',
              header: 'Rule Identifier',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{r.ruleName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {r.id}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'service',
              header: 'Applicable Services',
              render: (r) => (
                <span className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {r.service}
                </span>
              ),
            },
            {
              key: 'condition',
              header: 'Trigger Condition',
              render: (r) => <span className="text-xs text-slate-600 font-medium">{r.condition}</span>,
            },
            {
              key: 'value',
              header: 'Surge Surcharge',
              render: (r) => (
                <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  +{r.value}
                  {r.type === 'Percentage' ? '%' : ' ₹'}
                </span>
              ),
            },
            {
              key: 'priority',
              header: 'Priority',
              render: (r) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${r.priority === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                >
                  {r.priority}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${r.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${r.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                  />
                  {r.status}
                </span>
              ),
            },
            {
              key: 'action',
              header: 'Action',
              align: 'right',
              render: (r) => (
                <button
                  onClick={() => togglePricingRuleStatus(r.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${r.status === 'Active'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                >
                  {r.status === 'Active' ? 'Disable' : 'Enable'}
                </button>
              ),
            },
          ];

          return (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <DataTable<PricingRule>
                  columns={ruleColumns}
                  data={pricingRules}
                  keyExtractor={(r) => r.id}
                  pageSize={5}
                  searchPlaceholder="Filter rules by name or condition..."
                  searchFilterKeys={['ruleName', 'service', 'condition']}
                  emptyMessage="No dynamic surge rules configured."
                  headerActions={
                    <button
                      onClick={() => setShowAddRuleModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#023526] text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Dynamic Rule
                    </button>
                  }
                />
              </div>
            </div>
          );
        })()}

      {/* ====================================================================== */}
      {/* EDIT PRICING MODAL (OPENS FOR THE EXACT CLICKED CARD) */}
      {/* ====================================================================== */}
      {editModalTarget && (
        <EditPricingModal
          target={editModalTarget}
          onClose={() => setEditModalTarget(null)}
          localTiers={localTiers}
          outstationTiers={outstationTiers}
          valetParkingTier={valetParkingTier}
          valetPricing={valetForm}
          onSaveLocalTier={handleSaveLocalTier}
          onSaveOutstationTier={handleSaveOutstationTier}
          onSaveValetParkingTier={handleSaveValetParkingTier}
          onSaveValet={handleSaveValet}
          isSaving={isSaving}
        />
      )}

      {/* ====================================================================== */}
      {/* ADD SURGE RULE MODAL */}
      {/* ====================================================================== */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden my-auto">
            <div className="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                  Add Dynamic Surge Rule
                </h3>
              </div>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-semibold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Eve Surge"
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Service Scope</label>
                <select
                  value={newRule.service}
                  onChange={(e) => setNewRule({ ...newRule, service: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none bg-white"
                >
                  <option value="All">All Services (Universal)</option>
                  <option value="Local Driver">Local Driver Only</option>
                  <option value="Outstation Driver">Outstation Driver Only</option>
                  <option value="Valet Staff">Valet Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trigger Condition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Rain Warning or 18:00 - 23:00"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Surge Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none bg-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Surcharge Value</label>
                  <input
                    type="number"
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>
              </div>

              <div className="shrink-0 flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#023526] hover:bg-emerald-900 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Create Surge Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper for round trip
function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
