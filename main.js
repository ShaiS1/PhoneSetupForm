// main.js - Core Application Orchestrator

import { Database } from './data.js';
import { initClientForm } from './components/ClientForm.js';
import { initAdminBoard, renderAdminStats } from './components/AdminBoard.js';
import { initDetailDrawer } from './components/DetailDrawer.js';
import { generatePDF, generatePDFBlob } from './components/PDFGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
  // Expose PDF utility globally for the Detail Drawer
  window.generatePDFReport = generatePDF;

  // Setup App State & Components
  let activeView = 'client'; // Default view
  let boardRef = null;
  let drawerRef = null;

  // Initialize Toast System
  window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ri-checkbox-circle-line';
    if (type === 'error') icon = 'ri-error-warning-line';
    if (type === 'info') icon = 'ri-information-line';

    toast.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  };

  // Sync Nav Counts
  function updateNavBadge() {
    const submissions = Database.getSubmissions();
    const activeCount = submissions.filter(s => s.status !== 'Go-Live Ready').length;
    const badge = document.getElementById('admin-badge-count');
    if (badge) {
      badge.textContent = activeCount;
    }
  }

  // Load Admin Config Email and Standards Configuration
  function loadEmailConfig() {
    const settings = Database.getSettings();
    const emailInput = document.getElementById('global-config-email');
    if (emailInput) {
      emailInput.value = settings.configEmail || '';
    }
    
    const fields = [
      { id: 'cfg-receptionist', key: 'mainReceptionist' },
      { id: 'cfg-queue', key: 'mainQueue' },
      { id: 'cfg-conference', key: 'conferenceServer' },
      { id: 'cfg-voicemail', key: 'sharedVoicemail' },
      { id: 'cfg-support', key: 'ayeteaSupport' },
      { id: 'cfg-userstart', key: 'userExtStart' },
      { id: 'cfg-increment', key: 'userBlockIncrement' },
      { id: 'cfg-offset', key: 'receptionistOffset' }
    ];
    
    fields.forEach(f => {
      const input = document.getElementById(f.id);
      if (input) {
        input.value = settings[f.key] !== undefined ? settings[f.key] : '';
      }
    });
  }

  // Beautiful Simulated Email Preview Modal (For Local Testing)
  function showSimulatedEmailModal(details) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.backdropFilter = 'blur(6px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '300';

    modal.innerHTML = `
      <div class="glass" style="width: 580px; max-width: 90%; background-color: var(--bg-secondary); border: 1px solid var(--border-focus); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.25); animation: slideUp 0.3s ease-out; border-radius: var(--radius-lg);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-light); padding-bottom:0.75rem;">
          <h3 style="color:var(--secondary); font-size:1.1rem; display:flex; align-items:center; gap:0.4rem; margin:0;">
            <i class="ri-mail-send-line"></i> ${details.type === 'intake' ? 'Admin Intake Email Sent' : 'Customer Status Email Sent'}
          </h3>
          <span style="font-size:0.75rem; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:10px; color:var(--text-muted);">Local Simulation</span>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:0.75rem;">
          <div><span style="color:var(--text-muted);">From:</span> notifications@aye-tea.com</div>
          <div><span style="color:var(--text-muted);">To:</span> ${details.to}</div>
          <div><span style="color:var(--text-muted);">Subject:</span> <strong>${details.subject}</strong></div>
          ${details.filename ? `
            <div style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(6, 182, 212, 0.1); border:1px solid rgba(6, 182, 212, 0.2); padding:2px 8px; border-radius:4px; font-size:0.75rem; color:var(--secondary); margin-top:0.25rem; width:fit-content;">
              <i class="ri-attachment-2"></i> ${details.filename} (Attached)
            </div>
          ` : ''}
        </div>

        <div style="background:rgba(0,0,0,0.2); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:1rem; max-height:220px; overflow-y:auto; font-size:0.85rem; color:var(--text-primary); line-height:1.5;">
          ${details.body}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.5rem; border-top:1px solid var(--border-light); padding-top:0.75rem;">
          <button type="button" class="btn-primary" id="close-email-modal-btn" style="padding:0.5rem 1.25rem; font-size:0.85rem; background:linear-gradient(135deg, var(--secondary), var(--primary))">
            Close Preview
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-email-modal-btn').addEventListener('click', () => {
      modal.remove();
    });
  }

  // Handle Client Status Change Notification Trigger
  window.notifyClientStatusChange = (proj, newStatus) => {
    const clientEmail = proj.contactEmail;
    if (!clientEmail) return;

    const emailSubject = `Shai's Dumb Ideas Inc Phone Deployment Status Update - ${proj.companyName}`;
    const latestComment = proj.comments.length > 0 ? proj.comments[proj.comments.length - 1].text : '';
    
    const emailBody = `
      <p>Hi <strong>${proj.contactName}</strong>,</p>
      <p>This is an automated update from Shai's Dumb Ideas Inc regarding your business phone system setup.</p>
      <p>Your deployment status has been updated to: <strong style="color:#7c3aed;">${newStatus}</strong>.</p>
      ${latestComment ? `<p><strong>Latest Admin Update:</strong> "${latestComment}"</p>` : ''}
      <p>We will contact you if we need any further carrier details for Ooma configuration. No action is required from you at this time.</p>
      <p>Best regards,<br><strong>Shai's Dumb Ideas Inc Deployments Team</strong></p>
    `;

    // Try sending API post in production environment
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: clientEmail,
        subject: emailSubject,
        html: emailBody
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Local fallback");
      window.showToast("Client status notification email sent.");
    })
    .catch(() => {
      // Local offline fallback simulation modal
      showSimulatedEmailModal({
        type: 'client-status',
        to: clientEmail,
        subject: emailSubject,
        body: emailBody
      });
    });
  };

  // View Routing Manager
  function switchView(viewName) {
    activeView = viewName;
    
    // Toggle Nav States
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Toggle Content Panels
    document.querySelectorAll('.view-section').forEach(sect => {
      sect.classList.remove('active');
    });

    const activeSection = document.getElementById(`view-${viewName}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Dynamic View Refreshes
    if (viewName === 'admin') {
      renderAdminStats('stats-container');
      loadEmailConfig();
      if (boardRef) boardRef.refresh();
    } else if (viewName === 'client') {
      // Re-initialize client form to clean state
      initClientForm('wizard-container', handleFormSubmissionSuccess);
    }
  }

  // Callback on submission success
  function handleFormSubmissionSuccess(newRecord) {
    window.showToast(`Discovery Worksheet for "${newRecord.companyName}" submitted successfully!`);
    updateNavBadge();
    
    // 1. Generate & download the PDF report automatically for the client's records
    generatePDF(newRecord);

    // 2. Prepare Shai's Dumb Ideas Inc admin notification parameters
    const settings = Database.getSettings();
    const adminEmail = settings.configEmail;
    const emailSubject = `New Phone System Discovery Intake - ${newRecord.companyName}`;
    const emailBody = `
      <p>Hello Shai's Dumb Ideas Inc Admin,</p>
      <p>A new phone system discovery worksheet has been submitted by <strong>${newRecord.companyName}</strong>.</p>
      <p><strong>Primary Contact:</strong> ${newRecord.contactName} (${newRecord.contactPhone})</p>
      <p><strong>Email Address:</strong> ${newRecord.contactEmail}</p>
      <p><strong>Current Provider:</strong> ${newRecord.currentProvider}</p>
      <p><strong>Main Number:</strong> ${newRecord.mainNumber || 'None'}</p>
      <p><strong>Additional Numbers:</strong> ${Array.isArray(newRecord.additionalNumbers) ? (newRecord.additionalNumbers.join(', ') || 'None') : (newRecord.additionalNumbers || 'None')}</p>
      <p>The PDF summary report has been automatically generated and is attached to this notification.</p>
      <p>To configure extensions and view device lists, open the Shai's Dumb Ideas Inc Deployment Workspace.</p>
    `;

    // 3. Convert generated PDF to Base64 and send (or simulate locally)
    generatePDFBlob(newRecord).then(blob => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: adminEmail,
            subject: emailSubject,
            html: emailBody,
            pdfBase64: base64data,
            pdfFilename: `shais_dumb_ideas_discovery_${newRecord.companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`
          })
        })
        .then(res => {
          if (!res.ok) throw new Error("Local fallback");
          window.showToast("Intake email routed successfully.");
        })
        .catch(() => {
          // Display the simulated email preview modal locally
          showSimulatedEmailModal({
            type: 'intake',
            to: adminEmail,
            subject: emailSubject,
            filename: `shais_dumb_ideas_discovery_${newRecord.companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
            body: emailBody
          });
        });
      };
    });

    // Switch to admin workspace to let them see the new record
    switchView('admin');
    
    // Open the detail drawer of the new record automatically
    if (drawerRef) {
      setTimeout(() => {
        drawerRef.open(newRecord.id);
      }, 800);
    }
  }

  // Handle Admin Board Updates
  function handleDataModified() {
    updateNavBadge();
    renderAdminStats('stats-container');
    if (boardRef) boardRef.refresh();
    if (drawerRef) drawerRef.refresh();
  }

  // Initialize UI & components
  function init() {
    // Database check/load
    Database.getSubmissions();
    updateNavBadge();

    // Init Client Form wizard
    initClientForm('wizard-container', handleFormSubmissionSuccess);

    // Init Admin Board
    boardRef = initAdminBoard(
      'admin-board-container',
      (id) => { // onCardClick
        if (drawerRef) drawerRef.open(id);
      },
      (updated) => { // onStatusChange
        handleDataModified(updated);
        window.showToast(`"${updated.companyName}" status updated to "${updated.status}"`);
      }
    );

    // Init Detail Drawer
    drawerRef = initDetailDrawer('detail-drawer', (updated) => {
      handleDataModified(updated);
    });

    // Attach Header Tabs Click Events
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchView(tab.dataset.view);
      });
    });

    // Bind Admin Config Settings save button
    const saveConfigBtn = document.getElementById('save-config-email-btn');
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('global-config-email');
        const email = emailInput?.value.trim();
        if (email && emailInput.checkValidity()) {
          Database.saveSettings({
            configEmail: email,
            mainReceptionist: document.getElementById('cfg-receptionist')?.value.trim() || '1000',
            mainQueue: document.getElementById('cfg-queue')?.value.trim() || '1001',
            conferenceServer: document.getElementById('cfg-conference')?.value.trim() || '1002',
            sharedVoicemail: document.getElementById('cfg-voicemail')?.value.trim() || '1003',
            ayeteaSupport: document.getElementById('cfg-support')?.value.trim() || '6666',
            userExtStart: document.getElementById('cfg-userstart')?.value.trim() || '1100',
            userBlockIncrement: document.getElementById('cfg-increment')?.value.trim() || '100',
            receptionistOffset: document.getElementById('cfg-offset')?.value.trim() || '1'
          });
          window.showToast('System standards configuration updated successfully', 'success');
          if (drawerRef) {
            drawerRef.refresh();
          }
        } else {
          window.showToast('Please enter a valid email address.', 'error');
        }
      });
    }

    window.showToast("Shai's Dumb Ideas Inc Phone Portal loaded successfully", 'info');
  }

  // Kickstart
  init();
});
