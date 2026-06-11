import { Database } from '../data.js';
import { generateWorkbook } from './WorkbookGenerator.js';

function calculateReadiness(proj) {
  let score = 0;
  const items = {
    bill: proj.uploadedBillName ? true : false,
    carrier: proj.currentProvider && !proj.currentProvider.toLowerCase().includes('unsure') && proj.portingRequired !== 'Unsure',
    hours: proj.hours && proj.hours.mondayOpen !== 'Closed',
    employees: proj.employees && proj.employees.length > 0 && proj.employees[0].name !== '',
    callflow: proj.callFlow && (proj.callFlow.greeting || proj.callFlow.press1),
    devices: proj.devices && (proj.devices.deskPhonesCount > 0 || proj.devices.reusePhones === 'Yes')
  };

  if (items.bill) score += 20;
  if (items.carrier) score += 20;
  if (items.hours) score += 20;
  if (items.employees) score += 10;
  if (items.callflow) score += 15;
  if (items.devices) score += 15;

  return { score, items };
}

export function initDetailDrawer(drawerId, onDataModified) {
  const drawer = document.getElementById(drawerId);
  const body = document.getElementById('drawer-body');
  
  if (!drawer || !body) return;

  let currentSubId = null;
  let activeTab = 'summary'; // 'summary', 'ooma', 'activity'

  function open(id) {
    currentSubId = id;
    activeTab = 'summary';
    drawer.classList.add('open');
    render();
  }

  function close() {
    drawer.classList.remove('open');
    currentSubId = null;
  }

  // Close when clicking overlay or close button
  document.getElementById('drawer-overlay').addEventListener('click', close);

  function render() {
    const proj = Database.getSubmissions().find(s => s.id === currentSubId);
    if (!proj) {
      body.innerHTML = '<div style="padding:2rem; text-align:center;">Project not found.</div>';
      return;
    }

    body.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-header-title">
          <h2>${proj.companyName}</h2>
          <p>Intake Date: ${new Date(proj.submissionDate).toLocaleString()}</p>
        </div>
        <button type="button" class="close-drawer-btn" id="close-drawer-btn">
          <i class="ri-close-line"></i>
        </button>
      </div>
      
      <div class="drawer-body-scroll">
        <!-- Status Dropdown Quick Change -->
        <div class="status-change-wrapper" style="flex-direction:column; align-items:stretch; gap:0.75rem;">
          <div style="display:flex; align-items:center; gap:1rem; width:100%;">
            <label style="font-weight:700; color:var(--text-primary);">Deployment Status:</label>
            <select id="drawer-status-select" style="max-width:220px; background-color:var(--bg-primary);">
              <option value="Discovery Received" ${proj.status === 'Discovery Received' ? 'selected' : ''}>Discovery Received</option>
              <option value="Porting Submitted" ${proj.status === 'Porting Submitted' ? 'selected' : ''}>Porting Submitted</option>
              <option value="Configuration Started" ${proj.status === 'Configuration Started' ? 'selected' : ''}>Configuration Started</option>
              <option value="Testing" ${proj.status === 'Testing' ? 'selected' : ''}>Testing / Verification</option>
              <option value="Go-Live Ready" ${proj.status === 'Go-Live Ready' ? 'selected' : ''}>Go-Live Ready</option>
            </select>
            <span style="margin-left:auto;" class="priority-badge ${proj.priority.toLowerCase()}">${proj.priority} Priority</span>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem; display:flex; align-items:center;">
            <label class="checkbox-card" style="padding:0.4rem 0.8rem; background:none; border:none; display:inline-flex; align-items:center; gap:0.5rem; cursor:pointer; margin-top:0;">
              <input type="checkbox" id="notify-client-status-checkbox" style="width:15px; height:15px; accent-color:var(--secondary);">
              <span style="font-size:0.8rem; font-weight:500; color:var(--text-secondary);">Notify client (${proj.contactEmail}) of status change</span>
            </label>
          </div>
        </div>

        <!-- Tabs Navigation inside drawer -->
        <div class="drawer-tabs">
          <button class="drawer-tab-btn ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">
            <i class="ri-survey-line"></i> Form Summary
          </button>
          <button class="drawer-tab-btn ${activeTab === 'ooma' ? 'active' : ''}" data-tab="ooma">
            <i class="ri-file-settings-line"></i> Ooma Deployment Plan
          </button>
          <button class="drawer-tab-btn ${activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
            <i class="ri-history-line"></i> Activity & Comments (${proj.comments.length})
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-pane-container">
          ${activeTab === 'summary' ? renderSummaryTab(proj) : ''}
          ${activeTab === 'ooma' ? renderOomaTab(proj) : ''}
          ${activeTab === 'activity' ? renderActivityTab(proj) : ''}
        </div>
      </div>
    `;

    attachDrawerEvents(proj);
  }

  function renderSummaryTab(proj) {
    const hourLabel = proj.hours.mondayOpen === 'Closed' ? 'Closed' : `${proj.hours.mondayOpen} - ${proj.hours.mondayClose}`;
    const satLabel = proj.hours.saturdayOpen === 'Closed' ? 'Closed' : `${proj.hours.saturdayOpen} - ${proj.hours.saturdayClose}`;
    const sunLabel = proj.hours.sundayOpen === 'Closed' ? 'Closed' : `${proj.hours.sundayOpen} - ${proj.hours.sundayClose}`;

    const readiness = calculateReadiness(proj);
    const chk = proj.portingChecklist || {
      carrierIdentified: false, billReceived: false, csrReceived: false,
      requestSubmitted: false, focReceived: false, portComplete: false
    };

    return `
      <div class="detail-grid">
        <!-- Readiness Score Card -->
        <div class="detail-section-card full-width" style="display:flex; justify-content:space-between; align-items:center; gap:2rem; background:linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(139, 92, 246, 0.05)); border-color:var(--border-focus);">
          <div style="flex:1;">
            <h3 style="margin-bottom:0.5rem;"><i class="ri-shield-flash-line"></i> Project Deployment Readiness</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem;">This score indicates whether Shai's Dumb Ideas Inc has all required client information to proceed with Ooma deployment configuration.</p>
            
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; font-size:0.8rem;">
              <div style="color:${readiness.items.bill ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.bill ? '☑' : '□'} Phone Bill Statement
              </div>
              <div style="color:${readiness.items.carrier ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.carrier ? '☑' : '□'} Carrier Details
              </div>
              <div style="color:${readiness.items.hours ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.hours ? '☑' : '□'} Operating Hours
              </div>
              <div style="color:${readiness.items.employees ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.employees ? '☑' : '□'} Employee List
              </div>
              <div style="color:${readiness.items.callflow ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.callflow ? '☑' : '□'} Call Flow Preferences
              </div>
              <div style="color:${readiness.items.devices ? 'var(--color-golive)' : 'var(--text-muted)'}">
                ${readiness.items.devices ? '☑' : '□'} Device Checklists
              </div>
            </div>
          </div>
          <div style="text-align:center; min-width:110px;">
            <div style="font-size:2rem; font-weight:800; color:${readiness.score >= 80 ? 'var(--color-golive)' : readiness.score >= 50 ? 'var(--color-porting)' : '#ef4444'}; line-height:1.2;">
              ${readiness.score}%
            </div>
            <span style="font-size:0.75rem; text-transform:uppercase; font-weight:600; color:var(--text-secondary);">Ready Score</span>
            <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; margin-top:0.4rem; overflow:hidden;">
              <div style="width:${readiness.score}%; height:100%; background:${readiness.score >= 80 ? 'var(--color-golive)' : readiness.score >= 50 ? 'var(--color-porting)' : '#ef4444'}"></div>
            </div>
          </div>
        </div>

        <!-- Porting Checklist -->
        <div class="detail-section-card full-width">
          <h3><i class="ri-list-check-2"></i> Porting Status & Milestone Checklists</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Track the key legal and submission milestones of the client's telephone carrier porting process.</p>
          
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem;">
            <div>
              <label class="checkbox-card ${chk.carrierIdentified ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="carrierIdentified" ${chk.carrierIdentified ? 'checked' : ''}>
                <span>Carrier Identified</span>
              </label>
              <label class="checkbox-card ${chk.billReceived ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="billReceived" ${chk.billReceived ? 'checked' : ''}>
                <span>Phone Bill Statement Received</span>
              </label>
              <label class="checkbox-card ${chk.csrReceived ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="csrReceived" ${chk.csrReceived ? 'checked' : ''}>
                <span>CSR (Customer Record) Received</span>
              </label>
            </div>
            <div>
              <label class="checkbox-card ${chk.requestSubmitted ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="requestSubmitted" ${chk.requestSubmitted ? 'checked' : ''}>
                <span>Port Request Submitted to Ooma</span>
              </label>
              <label class="checkbox-card ${chk.focReceived ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="focReceived" ${chk.focReceived ? 'checked' : ''}>
                <span>FOC (Firm Order Date) Received</span>
              </label>
              <label class="checkbox-card ${chk.portComplete ? 'selected' : ''}" style="margin-bottom:0.5rem; padding:0.6rem 0.8rem; cursor:pointer;">
                <input type="checkbox" class="porting-chk" data-key="portComplete" ${chk.portComplete ? 'checked' : ''}>
                <span>Porting Completed Successfully</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="detail-section-card">
          <h3><i class="ri-building-line"></i> Company Details</h3>
          <div class="detail-info-item">
            <label>Contact Name</label>
            <p>${proj.contactName}</p>
          </div>
          <div class="detail-info-item">
            <label>Phone / Email</label>
            <p>${proj.contactPhone} <br> ${proj.contactEmail}</p>
          </div>
          <div class="detail-info-item">
            <label>Website</label>
            <p>${proj.website || 'N/A'}</p>
          </div>
          <div class="detail-info-item">
            <label>Locations / Employees</label>
            <p>${proj.locationsCount || 1} Location(s) / ${proj.employeesCount || proj.employees.length} Employees</p>
          </div>
        </div>

        <!-- Porting Info -->
        <div class="detail-section-card">
          <h3><i class="ri-phone-line"></i> Porting Details</h3>
          <div class="detail-info-item">
            <label>Porting Required?</label>
            <p>${proj.portingRequired}</p>
          </div>
          <div class="detail-info-item">
            <label>Main Number to Port</label>
            <p>${proj.mainNumber || 'N/A'}</p>
          </div>
          <div class="detail-info-item">
            <label>Additional Numbers to Port</label>
            <p>${Array.isArray(proj.additionalNumbers) ? (proj.additionalNumbers.join(', ') || 'None') : (proj.additionalNumbers || 'None')}</p>
          </div>
          <div class="detail-info-item">
            <label>Current Provider / Carrier</label>
            <p>${proj.currentProvider} ${proj.currentCarrier ? `(${proj.currentCarrier})` : ''}</p>
          </div>
          <div class="detail-info-item">
            <label>Uploaded Bill Statement</label>
            <p>
              ${proj.uploadedBillName ? `
                <a href="#" style="color:var(--secondary); text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">
                  <i class="ri-file-text-line"></i> ${proj.uploadedBillName} (${proj.uploadedBillSize})
                </a>
              ` : 'No file uploaded'}
            </p>
          </div>
        </div>

        <!-- Hours and Routing -->
        <div class="detail-section-card full-width">
          <h3><i class="ri-time-line"></i> Business Hours & After-Hours</h3>
          <div style="display:flex; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
            <div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Mon - Fri</span>
              <p style="font-size:0.85rem; font-weight:600;">${hourLabel}</p>
            </div>
            <div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Saturday</span>
              <p style="font-size:0.85rem; font-weight:600;">${satLabel}</p>
            </div>
            <div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Sunday</span>
              <p style="font-size:0.85rem; font-weight:600;">${sunLabel}</p>
            </div>
            <div>
              <span style="font-size:0.75rem; color:var(--text-muted);">After-Hours Routing</span>
              <p style="font-size:0.85rem; font-weight:600; text-transform:capitalize;">${proj.hours.afterHoursRouting}</p>
            </div>
          </div>
          ${proj.hours.afterHoursCustomValue ? `
            <div class="detail-info-item" style="border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem;">
              <label>After-Hours Value</label>
              <p>${proj.hours.afterHoursCustomValue}</p>
            </div>
          ` : ''}
        </div>

        <!-- Devices & Extras -->
        <div class="detail-section-card full-width">
          <h3><i class="ri-cpu-line"></i> Device & Hardware Checklist</h3>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">
            <div class="detail-info-item">
              <label>Desk Phones Count</label>
              <p>${proj.devices.deskPhonesCount} phone(s)</p>
            </div>
            <div class="detail-info-item">
              <label>Reuse Existing Hardware?</label>
              <p>${proj.devices.reusePhones}</p>
            </div>
            <div class="detail-info-item">
              <label>Fax Support Needed?</label>
              <p>${proj.devices.needFaxSupport}</p>
            </div>
            <div class="detail-info-item">
              <label>Conference Phone?</label>
              <p>${proj.devices.needConferencePhone}</p>
            </div>
            <div class="detail-info-item">
              <label>Voicemail-to-Email?</label>
              <p>${proj.devices.needVoicemailToEmail}</p>
            </div>
            <div class="detail-info-item">
              <label>Mobile App Config?</label>
              <p>${proj.devices.needMobileAppSetup}</p>
            </div>
          </div>
          ${proj.devices.specialRoutingUsers ? `
            <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem; margin-top:0.5rem;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Special Call Routing Notes</span>
              <p style="font-size:0.85rem; color:var(--text-primary);">${proj.devices.specialRoutingUsers}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderOomaTab(proj) {
    const settings = Database.getSettings();
    
    // Generate extension layout plan automatically based on standards
    const baseExtension = parseInt(settings.userExtStart || 1100, 10);
    const increment = parseInt(settings.userBlockIncrement || 100, 10);
    const offset = parseInt(settings.receptionistOffset || 1, 10);

    const extensions = [];
    proj.employees.forEach((emp, index) => {
      const extNum = baseExtension + (index * increment);
      
      let ringDestination = 'Mobile App & Desk Phone';
      if (emp.deskPhone && !emp.mobileApp) ringDestination = 'Desk Phone Only';
      if (!emp.deskPhone && emp.mobileApp) ringDestination = 'Mobile App Only';
      if (!emp.deskPhone && !emp.mobileApp) ringDestination = 'Virtual Extension (Voicemail)';
      
      const did = emp.directDial ? (proj.mainNumber || 'N/A') : 'Auto-Receptionist Route';

      // Push user extension
      extensions.push({
        extension: extNum,
        name: emp.name || 'Unnamed Extension',
        email: emp.email || 'N/A',
        did: did,
        ringDestination: ringDestination,
        notes: emp.notes || 'User Extension'
      });

      // Push receptionist extension
      if (offset > 0) {
        extensions.push({
          extension: extNum + offset,
          name: `${emp.name || 'User'} Receptionist`,
          email: emp.email || 'N/A',
          did: 'Auto-Receptionist Route',
          ringDestination: 'Desk Phone Only',
          notes: 'Virtual Receptionist / Call Routing'
        });
      }
    });

    // Parse IVR greeting to auto-generate mapping tree
    const ivrOptions = [];
    if (proj.callFlow.press1) ivrOptions.push({ key: '1', destination: proj.callFlow.press1 });
    if (proj.callFlow.press2) ivrOptions.push({ key: '2', destination: proj.callFlow.press2 });
    if (proj.callFlow.press3) ivrOptions.push({ key: '3', destination: proj.callFlow.press3 });
    if (proj.callFlow.press4) ivrOptions.push({ key: '4', destination: proj.callFlow.press4 });
    if (proj.callFlow.press5) ivrOptions.push({ key: '5', destination: proj.callFlow.press5 });
    if (proj.callFlow.press9 === 'yes') ivrOptions.push({ key: '9', destination: "Shai's Dumb Ideas Inc Priority Support Line" });

    return `
      <div class="ooma-panel">
        <div class="ooma-header" style="width: 100%; display: flex;">
          <span class="ooma-tag" style="align-self: center;">Ooma Office Engine v1</span>
          <div style="margin-left: auto; display: flex; gap: 0.5rem;">
            <button type="button" class="btn-secondary" id="drawer-pdf-btn" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
              <i class="ri-file-pdf-line"></i> Discovery PDF
            </button>
            <button type="button" class="btn-primary" id="ooma-xls-btn" style="font-size:0.8rem; padding:0.4rem 0.8rem; background:linear-gradient(135deg, #10b981, #059669);">
              <i class="ri-file-excel-line"></i> Generate Workbook
            </button>
            <button type="button" class="btn-primary" id="ooma-csv-btn" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
              <i class="ri-file-excel-2-line"></i> Export CSV
            </button>
          </div>
        </div>

        <h4 class="ooma-section-title">Extension Assignment Sheet (Standards Configuration Map)</h4>
        <div style="overflow-x:auto; margin-bottom:1.5rem;">
          <table class="review-employee-table" style="min-width:550px;">
            <thead>
              <tr>
                <th>Ext</th>
                <th>Name / Email</th>
                <th>DID Option</th>
                <th>Destination / Role</th>
              </tr>
            </thead>
            <tbody>
              <!-- Helpers -->
              <tr style="border-left: 3px solid var(--secondary); background:rgba(6, 182, 212, 0.02)">
                <td><strong style="color:var(--secondary)">${parseInt(settings.mainReceptionist || 1000, 10)}</strong></td>
                <td><strong>Main Receptionist</strong></td>
                <td>Main Number</td>
                <td>Ring Group</td>
              </tr>
              <tr style="border-left: 3px solid var(--secondary); background:rgba(6, 182, 212, 0.02)">
                <td><strong style="color:var(--secondary)">${parseInt(settings.mainQueue || 1001, 10)}</strong></td>
                <td><strong>Main Queue</strong></td>
                <td>-</td>
                <td>Call Queue</td>
              </tr>
              <tr style="border-left: 3px solid var(--secondary); background:rgba(6, 182, 212, 0.02)">
                <td><strong style="color:var(--secondary)">${parseInt(settings.conferenceServer || 1002, 10)}</strong></td>
                <td><strong>Conference Bridge</strong></td>
                <td>-</td>
                <td>Conference Server</td>
              </tr>
              <tr style="border-left: 3px solid var(--secondary); background:rgba(6, 182, 212, 0.02)">
                <td><strong style="color:var(--secondary)">${parseInt(settings.sharedVoicemail || 1003, 10)}</strong></td>
                <td><strong>Shared Voicemail</strong></td>
                <td>-</td>
                <td>Voicemail Server</td>
              </tr>
              <tr style="border-left: 3px solid var(--primary); background:rgba(139, 92, 246, 0.02)">
                <td><strong style="color:var(--primary)">${parseInt(settings.ayeteaSupport || 6666, 10)}</strong></td>
                <td><strong>Shai's Dumb Ideas Inc Support</strong></td>
                <td>-</td>
                <td>Support Route</td>
              </tr>
              
              <!-- Divider -->
              <tr><td colspan="4" style="padding: 10px 0; border-bottom: 2px solid var(--border-light); font-weight: bold; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">User Allocations</td></tr>
              
              ${extensions.map(ext => `
                <tr style="${ext.extension % 100 !== 0 ? 'opacity: 0.75; font-style: italic;' : ''}">
                  <td><strong style="color:${ext.extension % 100 !== 0 ? 'var(--text-muted)' : 'var(--secondary)'}">${ext.extension}</strong></td>
                  <td>
                    <strong>${ext.name}</strong><br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${ext.email}</span>
                  </td>
                  <td><span style="font-size:0.8rem;">${ext.did}</span></td>
                  <td><span style="font-size:0.8rem; color:var(--text-secondary);">${ext.ringDestination}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <h4 class="ooma-section-title">IVR Greeting & Call Routing Tree</h4>
        <div style="margin-bottom:1.5rem;">
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem; font-style:italic;">"${proj.callFlow.greeting || 'No custom greeting entered. Using Ooma standard greeting.'}"</p>
          <div class="ooma-flow-box">
            <div><strong>[INCOMING CALL]</strong> ➔ [Main Auto-Receptionist]</div>
            ${ivrOptions.map(opt => `
              <div style="padding-left:1.5rem; margin-top:0.25rem;">
                └── <strong>Press ${opt.key}</strong> ➔ ${opt.destination}
              </div>
            `).join('')}
            ${ivrOptions.length === 0 ? `
              <div style="padding-left:1.5rem; margin-top:0.25rem; color:var(--text-muted);">
                └── No press options set. Routes directly to Main Ring Group (Ext ${parseInt(settings.mainReceptionist || 1000, 10)}).
              </div>
            ` : ''}
            <div style="padding-left:1.5rem; margin-top:0.25rem;">
              └── <strong>Direct Extension Dialing:</strong> ${proj.callFlow.dialExtensionsDirectly}
            </div>
            <div style="padding-left:1.5rem; margin-top:0.25rem;">
              └── <strong>Company Directory Search:</strong> ${proj.callFlow.useDirectory}
            </div>
          </div>
        </div>

        <h4 class="ooma-section-title">Hardware Order & Provisions</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="detail-section-card">
            <span style="font-size:0.75rem; color:var(--text-muted);">IP Devices Required</span>
            <p style="font-size:1.1rem; font-weight:700; color:var(--secondary);">${proj.devices.deskPhonesCount} IP Phones</p>
            <span style="font-size:0.75rem; color:var(--text-muted);">Need conference phone: ${proj.devices.needConferencePhone}</span>
          </div>
          <div class="detail-section-card">
            <span style="font-size:0.75rem; color:var(--text-muted);">Digital Service Add-ons</span>
            <p style="font-size:0.85rem; font-weight:600; color:#fff;">
              E-Fax License: ${proj.devices.needFaxSupport === 'Yes' ? 'Required (1)' : 'Not needed'}<br>
              Voicemail to Email: ${proj.devices.needVoicemailToEmail === 'Yes' ? 'Enabled' : 'Disabled'}<br>
              Ooma Mobile App Setups: ${proj.devices.needMobileAppSetup === 'Yes' ? 'Requested' : 'No'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderActivityTab(proj) {
    return `
      <div class="comments-layout">
        <!-- New Comment Form -->
        <div class="add-comment-form">
          <input type="text" id="new-comment-input" placeholder="Type internal update or note..." style="flex:1;">
          <button type="button" class="btn-primary" id="add-comment-btn" style="padding:0 1.25rem;">
            <i class="ri-chat-new-line"></i> Post
          </button>
        </div>

        <!-- Comments List -->
        <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-top:0.5rem;">Notes & Comments</h4>
        <div class="comment-list">
          ${proj.comments.map(c => `
            <div class="comment-bubble">
              <div class="comment-meta">
                <span class="comment-author">${c.author}</span>
                <span>${new Date(c.timestamp).toLocaleString()}</span>
              </div>
              <p class="comment-text">${c.text}</p>
            </div>
          `).reverse().join('')}
          ${proj.comments.length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem;">No comments recorded.</p>' : ''}
        </div>

        <!-- History/Activity Log -->
        <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-top:0.5rem; border-top:1px solid var(--border-light); padding-top:1rem;">Audit Timeline</h4>
        <div class="activity-list">
          ${proj.activities.map(a => `
            <div class="activity-item">
              <span class="activity-text">${a.text}</span>
              <span class="activity-time">${new Date(a.timestamp).toLocaleString()}</span>
            </div>
          `).reverse().join('')}
        </div>
      </div>
    `;
  }

  function handleCSVExport(proj) {
    // Generate simple Ooma Import CSV format
    // Columns: Name, Email, Ext, DeviceType, DID
    const headers = ['First Name', 'Last Name', 'Email', 'Extension', 'Device Type', 'Direct DID'];
    const rows = proj.employees.map((emp, index) => {
      const names = emp.name.split(' ');
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ') || 'Extension';
      const ext = 101 + index;
      let device = 'Ooma Desktop App';
      if (emp.deskPhone && emp.mobileApp) device = 'IP Phone & Mobile App';
      else if (emp.deskPhone) device = 'IP Phone';
      else if (emp.mobileApp) device = 'Ooma Mobile App';
      
      const did = emp.directDial ? proj.mainNumber : 'Auto-Receptionist';
      return [firstName, lastName, emp.email || '', ext, device, did];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create download element
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ooma_deployment_${proj.companyName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function attachDrawerEvents(proj) {
    // Close button
    const closeBtn = document.getElementById('close-drawer-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Status change select
    const statusSelect = document.getElementById('drawer-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        const notifyCheckbox = document.getElementById('notify-client-status-checkbox');
        const notifyClient = notifyCheckbox ? notifyCheckbox.checked : false;
        
        const updated = Database.updateSubmissionStatus(proj.id, newStatus, notifyClient);
        if (updated) {
          if (notifyClient && window.notifyClientStatusChange) {
            window.notifyClientStatusChange(updated, newStatus);
          }
          onDataModified(updated);
          render(); // Refresh drawer content
        }
      });
    }

    // Tab buttons
    const tabBtns = body.querySelectorAll('.drawer-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    // Add comment button
    const addCommentBtn = document.getElementById('add-comment-btn');
    const commentInput = document.getElementById('new-comment-input');
    if (addCommentBtn && commentInput) {
      const triggerAddComment = () => {
        const txt = commentInput.value.trim();
        if (txt) {
          const updated = Database.addComment(proj.id, 'Shais (Admin)', txt);
          if (updated) {
            onDataModified(updated);
            render();
          }
        }
      };

      addCommentBtn.addEventListener('click', triggerAddComment);
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          triggerAddComment();
        }
      });
    }

    // Export CSV trigger
    const exportBtn = document.getElementById('ooma-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        handleCSVExport(proj);
      });
    }

    // Ooma Workbook trigger
    const xlsBtn = document.getElementById('ooma-xls-btn');
    if (xlsBtn) {
      xlsBtn.addEventListener('click', () => {
        generateWorkbook(proj);
      });
    }

    // PDF trigger in drawer
    const printPdfBtn = document.getElementById('drawer-pdf-btn');
    if (printPdfBtn) {
      printPdfBtn.addEventListener('click', () => {
        if (window.generatePDFReport) {
          window.generatePDFReport(proj);
        }
      });
    }

    // Porting checklist checkbox updates
    const chks = body.querySelectorAll('.porting-chk');
    chks.forEach(ch => {
      ch.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const val = e.target.checked;
        const updated = Database.updatePortingChecklist(proj.id, { [key]: val });
        if (updated) {
          onDataModified(updated);
          render(); // Refresh drawer to update readiness score and checkbox visual styling
        }
      });
    });
  }

  return {
    open,
    close,
    refresh: render
  };
}
