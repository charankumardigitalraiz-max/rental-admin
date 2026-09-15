'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName: string;
  itemDetails?: string;
  itemImage?: string;
  warningText?: string;
  confirmText?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Item Deletion',
  itemName,
  itemDetails,
  itemImage,
  warningText = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmText = 'Yes, Delete',
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Permanent deletion warning"
      icon={AlertTriangle}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Item Preview Box */}
        <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-md flex items-center gap-3">
          {itemImage && (
            <img
              src={itemImage}
              alt={itemName}
              className="w-16 h-12 rounded-md object-cover border border-rose-200 shrink-0"
            />
          )}
          <div>
            <h4 className="font-bold text-rose-950 text-sm">{itemName}</h4>
            {itemDetails && <p className="text-xs text-rose-700 font-medium mt-0.5">{itemDetails}</p>}
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{warningText}</p>

        {/* Action Buttons */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold text-xs shadow-2xs transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

