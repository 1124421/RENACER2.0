

(function() {
    'use strict';

    // Inyectar estilos automáticamente
    if (!document.getElementById('alerts-css')) {
        const s = document.createElement('style');
        s.id = 'alerts-css';
        s.textContent = `.alert-container{position:fixed;top:20px;right:20px;z-index:10002;display:flex;flex-direction:column;gap:10px;max-width:400px;width:calc(100% - 40px);pointer-events:none}.alert-container>*{pointer-events:auto}.custom-alert{background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);padding:16px 20px;display:flex;align-items:flex-start;gap:12px;animation:slideInRight .3s ease;position:relative;overflow:hidden}.custom-alert::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px}.custom-alert-icon{font-size:20px;flex-shrink:0;margin-top:2px}.custom-alert-content{flex:1}.custom-alert-title{font-size:16px;font-weight:600;color:#111827;margin-bottom:4px}.custom-alert-message{font-size:14px;color:#6b7280;line-height:1.5}.custom-alert-close{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:18px;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all .2s;flex-shrink:0}.custom-alert-close:hover{background:#f3f4f6;color:#374151}.custom-alert.success::before{background:#10b981}.custom-alert.success .custom-alert-icon{color:#10b981}.custom-alert.error::before{background:#ef4444}.custom-alert.error .custom-alert-icon{color:#ef4444}.custom-alert.warning::before{background:#3b82f6}.custom-alert.warning .custom-alert-icon{color:#3b82f6}.custom-alert.info::before{background:#3b82f6}.custom-alert.info .custom-alert-icon{color:#3b82f6}@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.custom-alert.hiding{animation:slideOutRight .3s ease forwards}.confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:10000;animation:fadeIn .2s}.confirm-modal{position:fixed;top:20px;right:20px;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);padding:16px 20px;max-width:400px;width:calc(100% - 40px);animation:slideInRight .3s ease;overflow:hidden;z-index:10001}.confirm-modal::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px}.confirm-modal.success::before{background:#10b981}.confirm-modal.error::before{background:#ef4444}.confirm-modal.warning::before{background:#3b82f6}.confirm-modal.info::before{background:#3b82f6}.confirm-buttons{display:flex;gap:12px;justify-content:flex-end;margin-top:16px}.confirm-btn{padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;border:none}.confirm-btn-cancel{background:#fff;color:#374151;border:1px solid #d1d5db}.confirm-btn-cancel:hover{background:#f3f4f6}.confirm-btn-ok{color:#fff}.confirm-btn-ok.success{background:#10b981}.confirm-btn-ok.error{background:#ef4444}.confirm-btn-ok.warning{background:#3b82f6}.confirm-btn-ok.info{background:#3b82f6}.confirm-btn-ok:hover{opacity:.9}@media(max-width:768px){.alert-container,.confirm-modal{top:10px;right:10px;left:10px;max-width:none;width:calc(100% - 20px)}.custom-alert,.confirm-modal{padding:14px 16px}.custom-alert-title{font-size:15px}.custom-alert-message{font-size:13px}}`;
        document.head.appendChild(s);
    }

    const icons = {success: '✓', error: '✕', warning: '⚠', info: 'ℹ'};
    const titles = {success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información'};
    
    function getContainer() {
        let c = document.querySelector('.alert-container');
        if (!c) {
            c = document.createElement('div');
            c.className = 'alert-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function createAlert(msg, type = 'info', duration = 3000) {
        const c = getContainer();
        const a = document.createElement('div');
        a.className = `custom-alert ${type}`;
        a.innerHTML = `<div class="custom-alert-icon">${icons[type]}</div><div class="custom-alert-content"><div class="custom-alert-title">${titles[type]}</div><div class="custom-alert-message">${msg}</div></div><button class="custom-alert-close">×</button>`;
        c.appendChild(a);
        
        const close = () => {
            a.classList.add('hiding');
            setTimeout(() => {
                a.remove();
                if (!c.children.length) c.remove();
            }, 300);
        };
        
        a.querySelector('.custom-alert-close').onclick = close;
        if (duration > 0) setTimeout(close, duration);
        
        return {element: a, close};
    }

    window.showSuccess = (msg, dur = 3000) => createAlert(msg, 'success', dur);
    window.showError = (msg, dur = 4000) => createAlert(msg, 'error', dur);
    window.showWarning = (msg, dur = 3500) => createAlert(msg, 'warning', dur);
    window.showInfo = (msg, dur = 3000) => createAlert(msg, 'info', dur);

    window.nativeAlert = window.alert;
    window.alert = (msg) => createAlert(msg, 'info', 3000);

    window.nativeConfirm = window.confirm;
    window.confirm = (msg, opts = {}) => new Promise(resolve => {
        const {title = 'Confirmar', confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'info'} = opts;
        const colors = {success: '#10b981', error: '#ef4444', warning: '#3b82f6', info: '#3b82f6'};
        
        const modal = document.createElement('div');
        modal.className = `confirm-modal ${type}`;
        modal.innerHTML = `<div style="display:flex;gap:12px;align-items:flex-start"><div style="font-size:20px;color:${colors[type]};flex-shrink:0;margin-top:2px">${icons[type]}</div><div style="flex:1"><div style="font-size:16px;font-weight:600;color:#111827;margin-bottom:4px">${title}</div><div style="font-size:14px;color:#6b7280;line-height:1.5">${msg}</div></div></div><div class="confirm-buttons"><button class="confirm-btn confirm-btn-cancel">${cancelText}</button><button class="confirm-btn confirm-btn-ok ${type}">${confirmText}</button></div>`;
        
        document.body.appendChild(modal);
        
        const close = r => {
            modal.remove();
            resolve(r);
        };
        
        modal.querySelector('.confirm-btn-ok').onclick = () => close(true);
        modal.querySelector('.confirm-btn-cancel').onclick = () => close(false);
    });

    window.closeAllAlerts = () => {
        const c = document.querySelector('.alert-container');
        if (c) {
            c.querySelectorAll('.custom-alert').forEach(a => a.classList.add('hiding'));
            setTimeout(() => c.remove(), 300);
        }
    };

})();