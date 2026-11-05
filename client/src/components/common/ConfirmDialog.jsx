import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  loading = false,
}) {
  const iconConfig = {
    warning: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50', button: 'primary' },
    danger: { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50', button: 'danger' },
    info: { icon: Info, color: 'text-sky-500 bg-sky-50', button: 'primary' },
    success: { icon: CheckCircle2, color: 'text-farm-600 bg-farm-50', button: 'success' },
  }[type] || { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50', button: 'primary' };

  const Icon = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!loading}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${iconConfig.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={iconConfig.button}
          size="md"
          loading={loading}
          onClick={() => {
            onConfirm();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
