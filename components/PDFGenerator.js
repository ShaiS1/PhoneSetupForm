// PDFGenerator.js - Client-Side PDF Generation Utility using html2pdf.js
import { Database } from '../data.js';

export function generatePDF(proj) {
  const settings = Database.getSettings();
  const baseExtension = parseInt(settings.userExtStart || 1100, 10);
  const increment = parseInt(settings.userBlockIncrement || 100, 10);
  const offset = parseInt(settings.receptionistOffset || 1, 10);

  const extensions = [];
  proj.employees.forEach((emp, index) => {
    const userExt = baseExtension + (index * increment);
    let ringDestination = 'Mobile App & Desk Phone';
    if (emp.deskPhone && !emp.mobileApp) ringDestination = 'Desk Phone Only';
    if (!emp.deskPhone && emp.mobileApp) ringDestination = 'Mobile App Only';
    if (!emp.deskPhone && !emp.mobileApp) ringDestination = 'Virtual Extension (Voicemail)';
    const did = emp.directDial ? (proj.mainNumber || 'N/A') : 'Auto-Receptionist';
    
    extensions.push({
      extension: userExt,
      name: emp.name || 'Unnamed Extension',
      email: emp.email || 'N/A',
      did: did,
      ringDestination: ringDestination,
      notes: emp.notes || 'User Extension'
    });

    if (offset > 0) {
      extensions.push({
        extension: userExt + offset,
        name: `${emp.name || 'User'} Receptionist`,
        email: emp.email || 'N/A',
        did: 'Auto-Receptionist',
        ringDestination: 'Desk Phone Only',
        notes: 'Virtual Receptionist / Call Routing'
      });
    }
  });

  // Create off-screen element with styled printer layout
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.color = '#1e293b';
  element.style.backgroundColor = '#ffffff';
  element.style.width = '800px';
  element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.5';
  element.style.maxWidth = '800px';
  element.style.margin = '0 auto';
  
  // Format dates
  const submitDate = new Date(proj.submissionDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Hours
  const hourLabel = proj.hours.mondayOpen === 'Closed' ? 'Closed' : `${proj.hours.mondayOpen} - ${proj.hours.mondayClose}`;
  const satLabel = proj.hours.saturdayOpen === 'Closed' ? 'Closed' : `${proj.hours.saturdayOpen} - ${proj.hours.saturdayClose}`;
  const sunLabel = proj.hours.sundayOpen === 'Closed' ? 'Closed' : `${proj.hours.sundayOpen} - ${proj.hours.sundayClose}`;

  // Employee rows using extensions array
  const employeeRows = extensions.map((ext) => `
    <tr style="${ext.extension % 100 !== 0 ? 'opacity: 0.8; font-style: italic; background-color: #fafafa;' : ''}">
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${ext.extension % 100 !== 0 ? '#64748b' : '#06b6d4'};">${ext.extension}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 600; color: #0f172a;">${ext.name}</div>
        <div style="font-size: 8px; color: #64748b;">${ext.email || 'N/A'}</div>
      </td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #334155;">${ext.did}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #475569;">${ext.ringDestination}</td>
    </tr>
  `).join('');

  // IVR Options list
  const ivrOptions = [];
  if (proj.callFlow.press1) ivrOptions.push({ key: '1', dest: proj.callFlow.press1 });
  if (proj.callFlow.press2) ivrOptions.push({ key: '2', dest: proj.callFlow.press2 });
  if (proj.callFlow.press3) ivrOptions.push({ key: '3', dest: proj.callFlow.press3 });
  if (proj.callFlow.press4) ivrOptions.push({ key: '4', dest: proj.callFlow.press4 });
  if (proj.callFlow.press5) ivrOptions.push({ key: '5', dest: proj.callFlow.press5 });
  if (proj.callFlow.press9 === 'yes') ivrOptions.push({ key: '9', dest: "Shai's Dumb Ideas Inc Priority Support Line" });

  // Additional numbers
  const addlNumbers = Array.isArray(proj.additionalNumbers) 
    ? (proj.additionalNumbers.join(', ') || 'None') 
    : (proj.additionalNumbers || 'None');

  element.innerHTML = `
    <!-- Header -->
    <div style="border-bottom: 3px solid #8b5cf6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="margin: 0; font-size: 26px; color: #7c3aed; font-weight: 800; letter-spacing: 0.5px;">Shai's Dumb Ideas Inc</h1>
        <div style="font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px; margin-top: 2px;">Phone System Discovery Summary</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; color: #6b7280; font-weight: 600;">SUBMISSION ID</div>
        <div style="font-family: monospace; font-size: 12px; font-weight: bold; color: #06b6d4;">${proj.id}</div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <tr>
        <td style="width: 50%; padding-right: 12px; vertical-align: top;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
            <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Client Information</h3>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Company:</strong> ${proj.companyName}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Primary Contact:</strong> ${proj.contactName}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Email:</strong> ${proj.contactEmail}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Phone:</strong> ${proj.contactPhone}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Website:</strong> ${proj.website || 'N/A'}</p>
          </div>
        </td>
        <td style="width: 50%; padding-left: 12px; vertical-align: top;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
            <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Setup Metadata</h3>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Submitted On:</strong> ${submitDate}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Workflow Stage:</strong> <span style="background-color:#dbeafe; color:#1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${proj.status}</span></p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Priority Level:</strong> ${proj.priority}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Locations:</strong> ${proj.locationsCount || 1}</p>
            <p style="margin: 4px 0; font-size: 11px;"><strong>Total Extensions:</strong> ${extensions.length + 5}</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Carrier Porting -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Number Porting & Carrier Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tr>
          <td style="width: 33%; padding: 4px 0;"><strong>Porting Numbers?</strong> ${proj.portingRequired}</td>
          <td style="width: 33%; padding: 4px 0;"><strong>Main Number:</strong> ${proj.mainNumber || 'N/A'}</td>
          <td style="width: 33%; padding: 4px 0;"><strong>Current Provider:</strong> ${proj.currentProvider} ${proj.currentCarrier ? `(${proj.currentCarrier})` : ''}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 6px 0 0 0; border-top: 1px dashed #e2e8f0; margin-top: 6px;">
            <strong>Additional Numbers to Port:</strong> ${addlNumbers}
          </td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 4px 0 0 0;">
            <strong>Carrier Bill Uploaded:</strong> ${proj.uploadedBillName ? `Yes (${proj.uploadedBillName} - ${proj.uploadedBillSize})` : 'No'}
          </td>
        </tr>
      </table>
    </div>

    <!-- Ooma Extension Deployment Plan Table -->
    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Ooma Extension Deployment Plan</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #334155; font-weight: 700;">
            <th style="padding: 8px; width: 60px;">Ext</th>
            <th style="padding: 8px;">Name / Email</th>
            <th style="padding: 8px;">DID Option</th>
            <th style="padding: 8px;">Destination / Role</th>
          </tr>
        </thead>
        <tbody>
          <!-- System Helpers -->
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 8px; font-weight: 700; color: #06b6d4;">${parseInt(settings.mainReceptionist || 1000, 10)}</td>
            <td style="padding: 6px 8px; font-weight: 600;">Main Receptionist</td>
            <td style="padding: 6px 8px;">Main Number</td>
            <td style="padding: 6px 8px; color: #475569;">Ring Group</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 8px; font-weight: 700; color: #06b6d4;">${parseInt(settings.mainQueue || 1001, 10)}</td>
            <td style="padding: 6px 8px; font-weight: 600;">Main Queue</td>
            <td style="padding: 6px 8px;">-</td>
            <td style="padding: 6px 8px; color: #475569;">Call Queue</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 8px; font-weight: 700; color: #06b6d4;">${parseInt(settings.conferenceServer || 1002, 10)}</td>
            <td style="padding: 6px 8px; font-weight: 600;">Conference Bridge</td>
            <td style="padding: 6px 8px;">-</td>
            <td style="padding: 6px 8px; color: #475569;">Conference Server</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 8px; font-weight: 700; color: #06b6d4;">${parseInt(settings.sharedVoicemail || 1003, 10)}</td>
            <td style="padding: 6px 8px; font-weight: 600;">Shared Voicemail</td>
            <td style="padding: 6px 8px;">-</td>
            <td style="padding: 6px 8px; color: #475569;">Voicemail Server</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
            <td style="padding: 6px 8px; font-weight: 700; color: #7c3aed;">${parseInt(settings.ayeteaSupport || 6666, 10)}</td>
            <td style="padding: 6px 8px; font-weight: 600;">Shai's Dumb Ideas Inc Support</td>
            <td style="padding: 6px 8px;">-</td>
            <td style="padding: 6px 8px; color: #475569;">Support Route</td>
          </tr>
          
          <!-- User Allocations Title -->
          <tr style="background-color: #f8fafc;">
            <td colspan="4" style="padding: 8px; font-weight: bold; color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1;">User Allocations</td>
          </tr>
          
          <!-- Users -->
          ${employeeRows}
        </tbody>
      </table>
    </div>

    <!-- Business Hours & Call Routing -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Business Hours & Call Flow Preferences</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <tr>
          <td style="width: 33%; vertical-align: top;">
            <strong style="color: #475569;">Operating Hours:</strong><br>
            Mon - Fri: ${hourLabel}<br>
            Saturday: ${satLabel}<br>
            Sunday: ${sunLabel}
          </td>
          <td style="width: 33%; vertical-align: top;">
            <strong style="color: #475569;">After-Hours Routing:</strong><br>
            Action: ${proj.hours.afterHoursRouting === 'voicemail' ? 'Voicemail' : proj.hours.afterHoursRouting === 'forward' ? 'Forward' : proj.hours.afterHoursRouting}<br>
            Target: ${proj.hours.afterHoursCustomValue || 'Shared Voicemail Box'}
          </td>
          <td style="width: 33%; vertical-align: top;">
            <strong style="color: #475569;">Routing Details:</strong><br>
            Direct Ext Dialing: ${proj.callFlow.dialExtensionsDirectly}<br>
            Company Directory: ${proj.callFlow.useDirectory}
          </td>
        </tr>
      </table>

      <div style="border-top: 1px dashed #e2e8f0; padding-top: 10px;">
        <strong>Auto-Receptionist Routing Tree:</strong>
        <p style="margin: 4px 0 8px 0; font-size: 10.5px; font-style: italic; color: #475569;">Greeting Message: "${proj.callFlow.greeting || 'No custom greeting entered. Using Ooma standard greeting.'}"</p>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 10.5px; color: #0f172a;">
          <div style="font-weight: bold; color:#7c3aed;">[INCOMING CALL] ➔ [Main Auto-Receptionist]</div>
          ${ivrOptions.map(opt => `
            <div style="padding-left: 15px; margin-top: 2px;">
              └── <strong>Press ${opt.key}</strong> ➔ ${opt.dest}
            </div>
          `).join('')}
          ${ivrOptions.length === 0 ? `
            <div style="padding-left: 15px; margin-top: 2px; color: #64748b;">
              └── No press options set. Routes directly to Main Ring Group (Ext ${parseInt(settings.mainReceptionist || 1000, 10)}).
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Devices and Add-ons -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #7c3aed; font-weight: 700; letter-spacing: 0.5px;">Device & Add-on Order Checklist</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tr>
          <td style="padding: 4px 0;"><strong>New Desk Phones:</strong> ${proj.devices.deskPhonesCount} units</td>
          <td style="padding: 4px 0;"><strong>Reuse Existing Phones?</strong> ${proj.devices.reusePhones}</td>
          <td style="padding: 4px 0;"><strong>Conference Phone Needed?</strong> ${proj.devices.needConferencePhone}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><strong>E-Fax Support:</strong> ${proj.devices.needFaxSupport}</td>
          <td style="padding: 4px 0;"><strong>Voicemail-to-Email:</strong> ${proj.devices.needVoicemailToEmail}</td>
          <td style="padding: 4px 0;"><strong>Mobile App Setup assistance:</strong> ${proj.devices.needMobileAppSetup}</td>
        </tr>
        ${proj.devices.specialRoutingUsers ? `
          <tr>
            <td colspan="3" style="padding-top: 8px; border-top: 1px dashed #e2e8f0; margin-top: 6px;">
              <strong>Special Instructions:</strong> ${proj.devices.specialRoutingUsers}
            </td>
          </tr>
        ` : ''}
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 35px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
      This worksheet was generated automatically on behalf of Shai's Dumb Ideas Inc. <br>
      Please contact <strong>support@dumbideas.com</strong> for questions or changes.
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${proj.companyName.replace(/\s+/g, '_')}_DiscoveryPacket.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Trigger pdf save (rendering in-memory avoids layout conflicts)
  return html2pdf().set(opt).from(element).save();
}

export function generatePDFBlob(proj) {
  const settings = Database.getSettings();
  const baseExtension = parseInt(settings.userExtStart || 1100, 10);
  const increment = parseInt(settings.userBlockIncrement || 100, 10);
  const offset = parseInt(settings.receptionistOffset || 1, 10);

  const extensions = [];
  proj.employees.forEach((emp, index) => {
    const userExt = baseExtension + (index * increment);
    let ringDestination = 'Mobile App & Desk Phone';
    if (emp.deskPhone && !emp.mobileApp) ringDestination = 'Desk Phone Only';
    if (!emp.deskPhone && emp.mobileApp) ringDestination = 'Mobile App Only';
    if (!emp.deskPhone && !emp.mobileApp) ringDestination = 'Virtual Extension (Voicemail)';
    const did = emp.directDial ? (proj.mainNumber || 'N/A') : 'Auto-Receptionist';
    
    extensions.push({
      extension: userExt,
      name: emp.name || 'Unnamed Extension',
      email: emp.email || 'N/A',
      did: did,
      ringDestination: ringDestination,
      notes: emp.notes || 'User Extension'
    });

    if (offset > 0) {
      extensions.push({
        extension: userExt + offset,
        name: `${emp.name || 'User'} Receptionist`,
        email: emp.email || 'N/A',
        did: 'Auto-Receptionist',
        ringDestination: 'Desk Phone Only',
        notes: 'Virtual Receptionist / Call Routing'
      });
    }
  });

  // Returns a promise resolving to a blob for programmatic emailing
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.color = '#1e293b';
  element.style.backgroundColor = '#ffffff';
  element.style.width = '800px';
  element.style.fontFamily = 'system-ui, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.4';
  
  const submitDate = new Date(proj.submissionDate).toLocaleDateString('en-US');
  const hourLabel = proj.hours.mondayOpen === 'Closed' ? 'Closed' : `${proj.hours.mondayOpen} - ${proj.hours.mondayClose}`;
  const satLabel = proj.hours.saturdayOpen === 'Closed' ? 'Closed' : `${proj.hours.saturdayOpen} - ${proj.hours.saturdayClose}`;
  const sunLabel = proj.hours.sundayOpen === 'Closed' ? 'Closed' : `${proj.hours.sundayOpen} - ${proj.hours.sundayClose}`;

  const employeeRows = extensions.map((ext) => `
    <tr style="${ext.extension % 100 !== 0 ? 'opacity: 0.75; font-style: italic;' : ''}">
      <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">${ext.extension}</td>
      <td style="padding: 5px; border-bottom: 1px solid #ddd;">
        <strong>${ext.name}</strong><br>
        <span style="font-size: 8px; color: #666;">${ext.email || 'N/A'}</span>
      </td>
      <td style="padding: 5px; border-bottom: 1px solid #ddd;">${ext.did}</td>
      <td style="padding: 5px; border-bottom: 1px solid #ddd;">${ext.ringDestination}</td>
    </tr>
  `).join('');

  const ivrOptions = [];
  if (proj.callFlow.press1) ivrOptions.push({ key: '1', dest: proj.callFlow.press1 });
  if (proj.callFlow.press2) ivrOptions.push({ key: '2', dest: proj.callFlow.press2 });
  if (proj.callFlow.press3) ivrOptions.push({ key: '3', dest: proj.callFlow.press3 });
  if (proj.callFlow.press4) ivrOptions.push({ key: '4', dest: proj.callFlow.press4 });
  if (proj.callFlow.press5) ivrOptions.push({ key: '5', dest: proj.callFlow.press5 });
  if (proj.callFlow.press9 === 'yes') ivrOptions.push({ key: '9', dest: "Shai's Dumb Ideas Inc Support Line" });

  const addlNumbers = Array.isArray(proj.additionalNumbers) 
    ? (proj.additionalNumbers.join(', ') || 'None') 
    : (proj.additionalNumbers || 'None');

  element.innerHTML = `
    <div style="border-bottom: 3px solid #7c3aed; padding-bottom: 15px; margin-bottom: 25px;">
      <h1 style="margin: 0; font-size: 22px; color: #7c3aed;">Shai's Dumb Ideas Inc</h1>
      <div style="font-size: 10px; text-transform: uppercase; color: #6b7280;">Phone System Intake Worksheet</div>
    </div>
    <div style="margin-bottom: 15px;">
      <p><strong>Company:</strong> ${proj.companyName}</p>
      <p><strong>Primary Contact:</strong> ${proj.contactName} (${proj.contactPhone})</p>
      <p><strong>Email:</strong> ${proj.contactEmail}</p>
      <p><strong>Provider:</strong> ${proj.currentProvider}</p>
      <p><strong>Porting Main Number:</strong> ${proj.mainNumber || 'None'}</p>
      <p><strong>Additional Numbers:</strong> ${addlNumbers}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Ooma Extension Deployment Plan</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 5px; text-align: left; width: 50px;">Ext</th>
            <th style="padding: 5px; text-align: left;">Name / Email</th>
            <th style="padding: 5px; text-align: left;">DID Option</th>
            <th style="padding: 5px; text-align: left;">Destination</th>
          </tr>
        </thead>
        <tbody>
          <!-- System Helpers -->
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 4px 5px; font-weight: bold;">${parseInt(settings.mainReceptionist || 1000, 10)}</td>
            <td style="padding: 4px 5px; font-weight: bold;">Main Receptionist</td>
            <td style="padding: 4px 5px;">Main Number</td>
            <td style="padding: 4px 5px;">Ring Group</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 4px 5px; font-weight: bold;">${parseInt(settings.mainQueue || 1001, 10)}</td>
            <td style="padding: 4px 5px; font-weight: bold;">Main Queue</td>
            <td style="padding: 4px 5px;">-</td>
            <td style="padding: 4px 5px;">Call Queue</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 4px 5px; font-weight: bold;">${parseInt(settings.conferenceServer || 1002, 10)}</td>
            <td style="padding: 4px 5px; font-weight: bold;">Conference Bridge</td>
            <td style="padding: 4px 5px;">-</td>
            <td style="padding: 4px 5px;">Conference Server</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 4px 5px; font-weight: bold;">${parseInt(settings.sharedVoicemail || 1003, 10)}</td>
            <td style="padding: 4px 5px; font-weight: bold;">Shared Voicemail</td>
            <td style="padding: 4px 5px;">-</td>
            <td style="padding: 4px 5px;">Voicemail Server</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd; background-color: #fafafa;">
            <td style="padding: 4px 5px; font-weight: bold; color: #7c3aed;">${parseInt(settings.ayeteaSupport || 6666, 10)}</td>
            <td style="padding: 4px 5px; font-weight: bold;">Shai's Dumb Ideas Inc Support</td>
            <td style="padding: 4px 5px;">-</td>
            <td style="padding: 4px 5px;">Support Route</td>
          </tr>
          
          <!-- User Allocations Header -->
          <tr style="background-color: #f9f9f9;">
            <td colspan="4" style="padding: 5px; font-weight: bold; font-size: 8px; text-transform: uppercase;">User Allocations</td>
          </tr>
          
          <!-- Users -->
          ${employeeRows}
        </tbody>
      </table>
    </div>
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Hours & Call Flows</h3>
      <p><strong>Hours:</strong> Mon-Fri: ${hourLabel}, Sat: ${satLabel}, Sun: ${sunLabel}</p>
      <p><strong>After Hours Action:</strong> ${proj.hours.afterHoursRouting} to ${proj.hours.afterHoursCustomValue || 'Voicemail'}</p>
      <p><strong>Greeting Message:</strong> "${proj.callFlow.greeting || 'Default'}"</p>
      <p><strong>Dial Ext:</strong> ${proj.callFlow.dialExtensionsDirectly} | <strong>Directory:</strong> ${proj.callFlow.useDirectory}</p>
    </div>
    <div>
      <h3 style="font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Hardware & Addons</h3>
      <p><strong>Desk Phones:</strong> ${proj.devices.deskPhonesCount} | <strong>Conference Phone:</strong> ${proj.devices.needConferencePhone}</p>
      <p><strong>Fax Support:</strong> ${proj.devices.needFaxSupport} | <strong>Voicemail-to-Email:</strong> ${proj.devices.needVoicemailToEmail} | <strong>Mobile App Setup:</strong> ${proj.devices.needMobileAppSetup}</p>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${proj.companyName.replace(/\s+/g, '_')}_DiscoveryPacket.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.5, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Trigger pdf blob (rendering in-memory avoids layout conflicts)
  return html2pdf().set(opt).from(element).outputPdf('blob');
}
