import React from 'react';

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading = false, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,12,12,0.35)' }} onClick={onCancel} />
      <div style={{ position: 'relative', width: 'min(560px, 92%)', background: 'white', borderRadius: 12, boxShadow: '0 20px 60px rgba(11,11,11,0.15)', padding: 20 }} role="dialog" aria-modal="true">
        <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', color: '#1f5c3f' }}>{title}</h3>
        <p style={{ marginTop: 12, color: '#444', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBE0D1', cursor: 'pointer' }}>{cancelLabel}</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(180deg,#1f5c3f,#2d6b4a)', color: 'white', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Please wait...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
