// ClientForm.js - 7-Step Phone Discovery Form Wizard Component

import { Database } from '../data.js';

export function initClientForm(containerId, onSubmitSuccess) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Form State
  let currentStep = 1;
  const totalSteps = 7;
  
  let formData = {
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    employeesCount: '',
    locationsCount: '',
    currentProvider: '',
    additionalNotes: '',
    
    portingRequired: 'Yes',
    mainNumber: '',
    additionalNumbers: [],
    currentCarrier: '',
    uploadedBillName: '',
    uploadedBillSize: '',
    
    employees: [
      { id: 'emp-' + Date.now(), name: '', email: '', mobile: '', directDial: false, deskPhone: false, mobileApp: false, notes: '' }
    ],
    
    hours: {
      mondayOpen: '08:00', mondayClose: '17:00',
      tuesdayOpen: '08:00', tuesdayClose: '17:00',
      wednesdayOpen: '08:00', wednesdayClose: '17:00',
      thursdayOpen: '08:00', thursdayClose: '17:00',
      fridayOpen: '08:00', fridayClose: '17:00',
      saturdayOpen: 'Closed', saturdayClose: 'Closed',
      sundayOpen: 'Closed', sundayClose: 'Closed',
      afterHoursRouting: 'voicemail',
      afterHoursCustomValue: ''
    },
    
    callFlow: {
      greeting: '',
      press1: '',
      press2: '',
      press3: '',
      press4: '',
      press5: '',
      press9: 'yes',
      dialExtensionsDirectly: 'Yes',
      useDirectory: 'No',
      additionalNotes: ''
    },
    
    devices: {
      deskPhonesCount: 0,
      reusePhones: 'No',
      needConferencePhone: 'No',
      needFaxSupport: 'No',
      needVoicemailToEmail: 'No',
      needMobileAppSetup: 'No',
      specialRoutingUsers: ''
    },
    
    priority: 'Medium'
  };

  render();

  function render() {
    container.innerHTML = `
      <div class="wizard-card glass">
        <!-- Steps Progress Header -->
        <div class="wizard-steps">
          <div class="steps-progress-bar" style="width: ${((currentStep - 1) / (totalSteps - 1)) * 100}%"></div>
          ${Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const labels = ['Company', 'Porting', 'Employees', 'Hours', 'Call Flow', 'Devices', 'Review'];
            let statusClass = '';
            if (stepNum === currentStep) statusClass = 'active';
            else if (stepNum < currentStep) statusClass = 'completed';
            
            return `
              <div class="step-indicator ${statusClass}">
                <div class="step-num">${stepNum < currentStep ? '<i class="ri-check-line"></i>' : stepNum}</div>
                <div class="step-label">${labels[i]}</div>
              </div>
            `;
          }).join('')}
        </div>

        <form id="discovery-form" onsubmit="return false;">
          <!-- Step 1: Company Information -->
          <div class="wizard-step-panel ${currentStep === 1 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 1: Company Information</h3>
              <p>Tell us about your business so we can establish your primary profile.</p>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group">
                <label>Company Name <span class="required">*</span></label>
                <input type="text" id="companyName" value="${formData.companyName}" required>
              </div>
              <div class="form-group">
                <label>Primary Contact Name <span class="required">*</span></label>
                <input type="text" id="contactName" value="${formData.contactName}" required>
              </div>
              <div class="form-group">
                <label>Contact Email <span class="required">*</span></label>
                <input type="email" id="contactEmail" value="${formData.contactEmail}" required>
              </div>
              <div class="form-group">
                <label>Contact Phone <span class="required">*</span></label>
                <input type="tel" id="contactPhone" value="${formData.contactPhone}" placeholder="(555) 000-0000" required>
              </div>
              <div class="form-group">
                <label>Company Website</label>
                <input type="url" id="website" value="${formData.website}" placeholder="https://example.com">
              </div>
              <div class="form-group">
                <label>Current Phone Provider <span class="required">*</span></label>
                <input type="text" id="currentProvider" value="${formData.currentProvider}" placeholder="Comcast, AT&T, RingCentral, etc." required>
              </div>
              <div class="form-group">
                <label>Number of Employees</label>
                <input type="number" id="employeesCount" value="${formData.employeesCount}" min="1">
              </div>
              <div class="form-group">
                <label>Number of Locations</label>
                <input type="number" id="locationsCount" value="${formData.locationsCount}" min="1">
              </div>
              <div class="form-group full-width">
                <label>Additional Notes</label>
                <textarea id="additionalNotes" rows="3" placeholder="Any special context you would like to share...">${formData.additionalNotes}</textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Number Porting -->
          <div class="wizard-step-panel ${currentStep === 2 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 2: Number Porting</h3>
              <p>We need to know if you want to keep your existing phone numbers or get new ones.</p>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group full-width">
                <label>Are you porting (transferring) numbers? <span class="required">*</span></label>
                <div class="form-grid-3" style="gap: 1rem;">
                  <label class="radio-card ${formData.portingRequired === 'Yes' ? 'selected' : ''}">
                    <input type="radio" name="portingRequired" value="Yes" ${formData.portingRequired === 'Yes' ? 'checked' : ''}>
                    <span>Yes</span>
                  </label>
                  <label class="radio-card ${formData.portingRequired === 'No' ? 'selected' : ''}">
                    <input type="radio" name="portingRequired" value="No" ${formData.portingRequired === 'No' ? 'checked' : ''}>
                    <span>No</span>
                  </label>
                  <label class="radio-card ${formData.portingRequired === 'Unsure' ? 'selected' : ''}">
                    <input type="radio" name="portingRequired" value="Unsure" ${formData.portingRequired === 'Unsure' ? 'checked' : ''}>
                    <span>Unsure</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group ${formData.portingRequired === 'No' ? 'disabled' : ''}">
                <label>Main Business Number to Port</label>
                <input type="tel" id="mainNumber" value="${formData.mainNumber}" placeholder="(555) 000-0000" ${formData.portingRequired === 'No' ? 'disabled' : ''}>
              </div>
              <!-- Dynamic Additional Numbers List -->
              <div class="form-group full-width ${formData.portingRequired === 'No' ? 'disabled' : ''}">
                <label>Additional Numbers to Port (Count: ${formData.additionalNumbers.length})</label>
                <div id="additional-numbers-container" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.5rem;">
                  ${formData.additionalNumbers.map((num, idx) => `
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                      <input type="tel" class="additional-number-input" value="${num}" placeholder="(555) 000-0000" ${formData.portingRequired === 'No' ? 'disabled' : ''}>
                      <button type="button" class="remove-file-btn remove-additional-number-btn" data-index="${idx}" ${formData.portingRequired === 'No' ? 'disabled' : ''} style="margin-top:0;">
                        <i class="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  `).join('')}
                  ${formData.additionalNumbers.length === 0 ? `
                    <span style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No additional numbers added.</span>
                  ` : ''}
                </div>
                <button type="button" class="add-employee-trigger" id="add-additional-number-btn" style="margin-top:0.25rem;" ${formData.portingRequired === 'No' ? 'disabled' : ''}>
                  <i class="ri-add-line"></i> Add Additional Number
                </button>
              </div>
              
              <div class="form-group full-width">
                <label>Upload Current Phone Bill (Required for porting)</label>
                ${formData.uploadedBillName ? `
                  <div class="file-preview-card">
                    <div class="file-info">
                      <i class="ri-file-pdf-2-line"></i>
                      <div class="file-details">
                        <h4>${formData.uploadedBillName}</h4>
                        <span>${formData.uploadedBillSize}</span>
                      </div>
                    </div>
                    <button type="button" class="remove-file-btn" id="remove-file-btn">
                      <i class="ri-delete-bin-6-line"></i>
                    </button>
                  </div>
                ` : `
                  <div class="file-upload-zone" id="file-upload-zone">
                    <i class="ri-upload-cloud-2-line"></i>
                    <p>Drag & drop your recent phone bill here, or click to upload</p>
                    <span>Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Step 3: Employee Setup -->
          <div class="wizard-step-panel ${currentStep === 3 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 3: Employee Phone Setup</h3>
              <p>Please list each employee who needs a phone extension, mobile app, or direct number.</p>
            </div>
            
            <div class="employee-repeater" id="employee-repeater-container">
              ${formData.employees.map((emp, index) => `
                <div class="employee-row-card" data-id="${emp.id}">
                  <div class="employee-row-header">
                    <span class="employee-num-label">
                      <i class="ri-user-add-line"></i> Employee #${index + 1}
                    </span>
                    ${formData.employees.length > 1 ? `
                      <button type="button" class="delete-employee-row-btn" data-id="${emp.id}">
                        <i class="ri-close-line"></i> Remove
                      </button>
                    ` : ''}
                  </div>
                  <div class="form-grid-3">
                    <div class="form-group">
                      <label>Name</label>
                      <input type="text" class="emp-name" value="${emp.name}" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                      <label>Email</label>
                      <input type="email" class="emp-email" value="${emp.email}" placeholder="john@example.com">
                    </div>
                    <div class="form-group">
                      <label>Mobile Number (For mobile app routing)</label>
                      <input type="tel" class="emp-mobile" value="${emp.mobile}" placeholder="(555) 000-0000">
                    </div>
                  </div>
                  
                  <div class="employee-options-row">
                    <label class="checkbox-card ${emp.directDial ? 'selected' : ''}">
                      <input type="checkbox" class="emp-directDial" ${emp.directDial ? 'checked' : ''}>
                      <span>Needs Direct Dial Number</span>
                    </label>
                    <label class="checkbox-card ${emp.deskPhone ? 'selected' : ''}">
                      <input type="checkbox" class="emp-deskPhone" ${emp.deskPhone ? 'checked' : ''}>
                      <span>Needs Desk Phone</span>
                    </label>
                    <label class="checkbox-card ${emp.mobileApp ? 'selected' : ''}">
                      <input type="checkbox" class="emp-mobileApp" ${emp.mobileApp ? 'checked' : ''}>
                      <span>Needs Ooma Mobile App</span>
                    </label>
                  </div>
                  <div class="form-group" style="margin-top: 1rem;">
                    <input type="text" class="emp-notes" value="${emp.notes}" placeholder="Notes (e.g. Sales Lead, needs voicemail to dispatch)">
                  </div>
                </div>
              `).join('')}
            </div>
            
            <button type="button" class="add-employee-trigger" id="add-employee-btn">
              <i class="ri-add-line"></i> Add Another Employee
            </button>
          </div>

          <!-- Step 4: Business Hours -->
          <div class="wizard-step-panel ${currentStep === 4 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 4: Business Hours & Routing</h3>
              <p>Configure when you are open and what happens to callers after business hours.</p>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group">
                <label>Monday - Friday Open Time</label>
                <input type="time" id="weekdayOpen" value="${formData.hours.mondayOpen}">
              </div>
              <div class="form-group">
                <label>Monday - Friday Close Time</label>
                <input type="time" id="weekdayClose" value="${formData.hours.mondayClose}">
              </div>
              
              <div class="form-group">
                <label>Saturday Hours</label>
                <select id="saturdayHours">
                  <option value="Closed" ${formData.hours.saturdayOpen === 'Closed' ? 'selected' : ''}>Closed</option>
                  <option value="Open" ${formData.hours.saturdayOpen !== 'Closed' ? 'selected' : ''}>Open</option>
                </select>
              </div>
              <div class="form-group">
                <label>Sunday Hours</label>
                <select id="sundayHours">
                  <option value="Closed" ${formData.hours.sundayOpen === 'Closed' ? 'selected' : ''}>Closed</option>
                  <option value="Open" ${formData.hours.sundayOpen !== 'Closed' ? 'selected' : ''}>Open</option>
                </select>
              </div>
              
              <div class="form-group full-width">
                <label>After-Hours Call Routing <span class="required">*</span></label>
                <div class="form-grid-2" style="gap: 1rem;">
                  <label class="radio-card ${formData.hours.afterHoursRouting === 'voicemail' ? 'selected' : ''}">
                    <input type="radio" name="afterHoursRouting" value="voicemail" ${formData.hours.afterHoursRouting === 'voicemail' ? 'checked' : ''}>
                    <span>Send to shared voicemail</span>
                  </label>
                  <label class="radio-card ${formData.hours.afterHoursRouting === 'oncall' ? 'selected' : ''}">
                    <input type="radio" name="afterHoursRouting" value="oncall" ${formData.hours.afterHoursRouting === 'oncall' ? 'checked' : ''}>
                    <span>Ring an on-call person</span>
                  </label>
                  <label class="radio-card ${formData.hours.afterHoursRouting === 'forward' ? 'selected' : ''}">
                    <input type="radio" name="afterHoursRouting" value="forward" ${formData.hours.afterHoursRouting === 'forward' ? 'checked' : ''}>
                    <span>Forward to mobile number</span>
                  </label>
                  <label class="radio-card ${formData.hours.afterHoursRouting === 'message' ? 'selected' : ''}">
                    <input type="radio" name="afterHoursRouting" value="message" ${formData.hours.afterHoursRouting === 'message' ? 'checked' : ''}>
                    <span>Play after-hours message only</span>
                  </label>
                  <label class="radio-card ${formData.hours.afterHoursRouting === 'unsure' ? 'selected' : ''}">
                    <input type="radio" name="afterHoursRouting" value="unsure" ${formData.hours.afterHoursRouting === 'unsure' ? 'checked' : ''}>
                    <span>Unsure (Review with AYETEA)</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group full-width" id="after-hours-value-wrapper" style="display: ${['forward', 'oncall'].includes(formData.hours.afterHoursRouting) ? 'block' : 'none'};">
                <label id="after-hours-value-label">Target Mobile Number / Details</label>
                <input type="text" id="afterHoursCustomValue" value="${formData.hours.afterHoursCustomValue || ''}" placeholder="Enter phone number or extension">
              </div>
            </div>
          </div>

          <!-- Step 5: Call Flow Preferences -->
          <div class="wizard-step-panel ${currentStep === 5 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 5: Auto-Receptionist & Call Flow</h3>
              <p>Design how the automated greeting system routes callers.</p>
            </div>
            
            <div class="form-group">
              <label>Preferred Greeting Message (Text-to-speech or recorded later)</label>
              <textarea id="greeting" rows="2" placeholder="e.g. Thank you for calling AYETEA. For sales, press 1. For support, press 2. For an extension, dial it now.">${formData.callFlow.greeting}</textarea>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group">
                <label>Press 1 Destination</label>
                <input type="text" id="press1" value="${formData.callFlow.press1}" placeholder="e.g. Sales Group, John Apex">
              </div>
              <div class="form-group">
                <label>Press 2 Destination</label>
                <input type="text" id="press2" value="${formData.callFlow.press2}" placeholder="e.g. Billing, Customer Service">
              </div>
              <div class="form-group">
                <label>Press 3 Destination</label>
                <input type="text" id="press3" value="${formData.callFlow.press3}">
              </div>
              <div class="form-group">
                <label>Press 4 Destination</label>
                <input type="text" id="press4" value="${formData.callFlow.press4}">
              </div>
              <div class="form-group">
                <label>Press 5 Destination</label>
                <input type="text" id="press5" value="${formData.callFlow.press5}">
              </div>
              <div class="form-group">
                <label>Press 9 should go to AYETEA Support? (Emergency route)</label>
                <select id="press9">
                  <option value="yes" ${formData.callFlow.press9 === 'yes' ? 'selected' : ''}>Yes, enable route to AYETEA</option>
                  <option value="no" ${formData.callFlow.press9 === 'no' ? 'selected' : ''}>No, disabled</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Should callers be able to dial extensions directly?</label>
                <select id="dialExtensionsDirectly">
                  <option value="Yes" ${formData.callFlow.dialExtensionsDirectly === 'Yes' ? 'selected' : ''}>Yes</option>
                  <option value="No" ${formData.callFlow.dialExtensionsDirectly === 'No' ? 'selected' : ''}>No</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Should callers be able to use a company directory?</label>
                <select id="useDirectory">
                  <option value="Yes" ${formData.callFlow.useDirectory === 'Yes' ? 'selected' : ''}>Yes</option>
                  <option value="No" ${formData.callFlow.useDirectory === 'No' ? 'selected' : ''}>No</option>
                </select>
              </div>
            </div>
            <div style="font-size:0.75rem; color: var(--text-muted); margin-top:1rem; border-top:1px solid var(--border-light); padding-top:0.5rem;">
              <i class="ri-lightbulb-line"></i> AYETEA will review these selections and adjust the final flow if needed for Ooma compatibility.
            </div>
          </div>

          <!-- Step 6: Devices and Extras -->
          <div class="wizard-step-panel ${currentStep === 6 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 6: Devices & Add-ons</h3>
              <p>Identify hardware needs and core service features.</p>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group">
                <label>Number of Desk Phones Needed</label>
                <input type="number" id="deskPhonesCount" value="${formData.devices.deskPhonesCount}" min="0">
              </div>
              <div class="form-group">
                <label>Do you have existing IP phones to reuse?</label>
                <select id="reusePhones">
                  <option value="No" ${formData.devices.reusePhones === 'No' ? 'selected' : ''}>No, need all new devices</option>
                  <option value="Yes" ${formData.devices.reusePhones === 'Yes' ? 'selected' : ''}>Yes (specify models in notes)</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Need Conference Phone(s)?</label>
                <select id="needConferencePhone">
                  <option value="No" ${formData.devices.needConferencePhone === 'No' ? 'selected' : ''}>No</option>
                  <option value="Yes" ${formData.devices.needConferencePhone === 'Yes' ? 'selected' : ''}>Yes</option>
                </select>
              </div>
              <div class="form-group">
                <label>Need E-Fax / Physical Fax Support?</label>
                <select id="needFaxSupport">
                  <option value="No" ${formData.devices.needFaxSupport === 'No' ? 'selected' : ''}>No</option>
                  <option value="Yes" ${formData.devices.needFaxSupport === 'Yes' ? 'selected' : ''}>Yes</option>
                </select>
              </div>
              <div class="form-group">
                <label>Need Voicemail-to-Email Delivery?</label>
                <select id="needVoicemailToEmail">
                  <option value="Yes" ${formData.devices.needVoicemailToEmail === 'Yes' ? 'selected' : ''}>Yes (Recommended)</option>
                  <option value="No" ${formData.devices.needVoicemailToEmail === 'No' ? 'selected' : ''}>No</option>
                </select>
              </div>
              <div class="form-group">
                <label>Need Mobile App Configuration support?</label>
                <select id="needMobileAppSetup">
                  <option value="Yes" ${formData.devices.needMobileAppSetup === 'Yes' ? 'selected' : ''}>Yes</option>
                  <option value="No" ${formData.devices.needMobileAppSetup === 'No' ? 'selected' : ''}>No</option>
                </select>
              </div>
              
              <div class="form-group full-width">
                <label>Users with special call routing or device notes</label>
                <textarea id="specialRoutingUsers" rows="3" placeholder="e.g. Remote users who need ring groups to hit cell phones directly...">${formData.devices.specialRoutingUsers}</textarea>
              </div>
            </div>
          </div>

          <!-- Step 7: Review and Submit -->
          <div class="wizard-step-panel ${currentStep === 7 ? 'active' : ''}">
            <div class="step-title-block">
              <h3>Step 7: Review and Submit</h3>
              <p>Review the intake worksheet and confirm your discovery parameters.</p>
            </div>
            
            <div class="review-summary-container">
              <div class="review-section-block">
                <h4><i class="ri-building-line"></i> Profile</h4>
                <div class="review-grid">
                  <div class="review-item"><h5>Company</h5><p>${formData.companyName || 'Not entered'}</p></div>
                  <div class="review-item"><h5>Primary Contact</h5><p>${formData.contactName || 'Not entered'} (${formData.contactPhone || ''})</p></div>
                  <div class="review-item"><h5>Provider</h5><p>${formData.currentProvider || 'Not entered'}</p></div>
                </div>
              </div>
              
              <div class="review-section-block">
                <h4><i class="ri-phone-line"></i> Porting Status</h4>
                <div class="review-grid">
                  <div class="review-item"><h5>Porting?</h5><p>${formData.portingRequired}</p></div>
                  <div class="review-item"><h5>Main Number</h5><p>${formData.mainNumber || 'N/A'}</p></div>
                  <div class="review-item"><h5>Addl Numbers (${formData.additionalNumbers.length})</h5><p>${formData.additionalNumbers.filter(n => n).join(', ') || 'None'}</p></div>
                  <div class="review-item"><h5>Bill Uploaded</h5><p>${formData.uploadedBillName ? '✓ ' + formData.uploadedBillName : 'None'}</p></div>
                </div>
              </div>

              <div class="review-section-block">
                <h4><i class="ri-group-line"></i> Employees (${formData.employees.filter(e => e.name).length} user extensions)</h4>
                <table class="review-employee-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Direct Number</th>
                      <th>Desk Phone</th>
                      <th>Mobile App</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${formData.employees.filter(e => e.name).map(emp => `
                      <tr>
                        <td><strong>${emp.name}</strong> ${emp.email ? `(${emp.email})` : ''}</td>
                        <td>${emp.directDial ? 'Yes' : 'No'}</td>
                        <td>${emp.deskPhone ? 'Yes' : 'No'}</td>
                        <td>${emp.mobileApp ? 'Yes' : 'No'}</td>
                      </tr>
                    `).join('')}
                    ${formData.employees.filter(e => e.name).length === 0 ? '<tr><td colspan="4" style="color:var(--text-muted)">No employee rows with names entered.</td></tr>' : ''}
                  </tbody>
                </table>
              </div>
              
              <div class="review-section-block">
                <h4><i class="ri-shield-check-line"></i> Confirmations</h4>
                <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem;">
                  <label class="checkbox-card" id="lbl-confirm-1">
                    <input type="checkbox" id="confirm-1" required>
                    <span>I understand AYETEA will review this information before configuration.</span>
                  </label>
                  <label class="checkbox-card" id="lbl-confirm-2">
                    <input type="checkbox" id="confirm-2" required>
                    <span>I understand missing or incorrect carrier information may delay number porting.</span>
                  </label>
                  <label class="checkbox-card" id="lbl-confirm-3">
                    <input type="checkbox" id="confirm-3" required>
                    <span>I confirm the submitted information is accurate to the best of my knowledge.</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="wizard-footer">
            <button type="button" class="btn-secondary" id="prev-btn" ${currentStep === 1 ? 'disabled' : ''}>
              <i class="ri-arrow-left-line"></i> Back
            </button>
            
            ${currentStep < totalSteps ? `
              <button type="button" class="btn-primary" id="next-btn">
                Next <i class="ri-arrow-right-line"></i>
              </button>
            ` : `
              <button type="button" class="btn-primary" id="submit-btn" style="background: linear-gradient(135deg, var(--secondary), var(--primary))">
                <i class="ri-send-plane-line"></i> Submit Discovery Form
              </button>
            `}
          </div>
        </form>
      </div>
    `;

    attachEvents();
  }

  function saveCurrentStepData() {
    // Collect from inputs depending on step
    if (currentStep === 1) {
      formData.companyName = document.getElementById('companyName')?.value || '';
      formData.contactName = document.getElementById('contactName')?.value || '';
      formData.contactEmail = document.getElementById('contactEmail')?.value || '';
      formData.contactPhone = document.getElementById('contactPhone')?.value || '';
      formData.website = document.getElementById('website')?.value || '';
      formData.currentProvider = document.getElementById('currentProvider')?.value || '';
      formData.employeesCount = document.getElementById('employeesCount')?.value || '';
      formData.locationsCount = document.getElementById('locationsCount')?.value || '';
      formData.additionalNotes = document.getElementById('additionalNotes')?.value || '';
    } else if (currentStep === 2) {
      formData.mainNumber = document.getElementById('mainNumber')?.value || '';
      formData.currentCarrier = document.getElementById('currentCarrier')?.value || '';
      
      const numberInputs = document.querySelectorAll('.additional-number-input');
      formData.additionalNumbers = Array.from(numberInputs).map(inp => inp.value);
    } else if (currentStep === 3) {
      // Collect all employee data rows
      const cards = document.querySelectorAll('.employee-row-card');
      formData.employees = Array.from(cards).map(card => {
        return {
          id: card.dataset.id,
          name: card.querySelector('.emp-name').value,
          email: card.querySelector('.emp-email').value,
          mobile: card.querySelector('.emp-mobile').value,
          directDial: card.querySelector('.emp-directDial').checked,
          deskPhone: card.querySelector('.emp-deskPhone').checked,
          mobileApp: card.querySelector('.emp-mobileApp').checked,
          notes: card.querySelector('.emp-notes').value
        };
      });
    } else if (currentStep === 4) {
      formData.hours = {
        mondayOpen: document.getElementById('weekdayOpen').value,
        mondayClose: document.getElementById('weekdayClose').value,
        tuesdayOpen: document.getElementById('weekdayOpen').value,
        tuesdayClose: document.getElementById('weekdayClose').value,
        wednesdayOpen: document.getElementById('weekdayOpen').value,
        wednesdayClose: document.getElementById('weekdayClose').value,
        thursdayOpen: document.getElementById('weekdayOpen').value,
        thursdayClose: document.getElementById('weekdayClose').value,
        fridayOpen: document.getElementById('weekdayOpen').value,
        fridayClose: document.getElementById('weekdayClose').value,
        saturdayOpen: document.getElementById('saturdayHours').value === 'Closed' ? 'Closed' : '09:00',
        saturdayClose: document.getElementById('saturdayHours').value === 'Closed' ? 'Closed' : '15:00',
        sundayOpen: document.getElementById('sundayHours').value === 'Closed' ? 'Closed' : '09:00',
        sundayClose: document.getElementById('sundayHours').value === 'Closed' ? 'Closed' : '15:00',
        afterHoursRouting: document.querySelector('input[name="afterHoursRouting"]:checked').value,
        afterHoursCustomValue: document.getElementById('afterHoursCustomValue')?.value || ''
      };
    } else if (currentStep === 5) {
      formData.callFlow = {
        greeting: document.getElementById('greeting').value,
        press1: document.getElementById('press1').value,
        press2: document.getElementById('press2').value,
        press3: document.getElementById('press3').value,
        press4: document.getElementById('press4').value,
        press5: document.getElementById('press5').value,
        press9: document.getElementById('press9').value,
        dialExtensionsDirectly: document.getElementById('dialExtensionsDirectly').value,
        useDirectory: document.getElementById('useDirectory').value,
        additionalNotes: formData.callFlow.additionalNotes // carry over if any
      };
    } else if (currentStep === 6) {
      formData.devices = {
        deskPhonesCount: parseInt(document.getElementById('deskPhonesCount').value || 0, 10),
        reusePhones: document.getElementById('reusePhones').value,
        needConferencePhone: document.getElementById('needConferencePhone').value,
        needFaxSupport: document.getElementById('needFaxSupport').value,
        needVoicemailToEmail: document.getElementById('needVoicemailToEmail').value,
        needMobileAppSetup: document.getElementById('needMobileAppSetup').value,
        specialRoutingUsers: document.getElementById('specialRoutingUsers').value
      };
    }
  }

  function validateStep() {
    const activePanel = container.querySelector('.wizard-step-panel.active');
    if (!activePanel) return true;
    
    const inputs = activePanel.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });
    
    // Custom Validations
    if (currentStep === 1) {
      const company = document.getElementById('companyName').value.trim();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const carrier = document.getElementById('currentProvider').value.trim();
      if (!company || !name || !email || !phone || !carrier) {
        isValid = false;
      }
    }
    
    return isValid;
  }

  function attachEvents() {
    // Next Button Click
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateStep()) {
          saveCurrentStepData();
          currentStep++;
          render();
        }
      });
    }

    // Back Button Click
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        saveCurrentStepData();
        currentStep--;
        render();
      });
    }

    // Submit Button Click
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const c1 = document.getElementById('confirm-1').checked;
        const c2 = document.getElementById('confirm-2').checked;
        const c3 = document.getElementById('confirm-3').checked;
        
        if (!c1 || !c2 || !c3) {
          alert("Please check all verification checkboxes to submit the form.");
          return;
        }

        // Final submit
        const saved = Database.addSubmission(formData);
        onSubmitSuccess(saved);
      });
    }

    // Radio select visual highlight
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(rad => {
      rad.addEventListener('change', (e) => {
        // Uncheck all siblings
        const nameAttr = e.target.getAttribute('name');
        document.querySelectorAll(`input[name="${nameAttr}"]`).forEach(el => {
          el.closest('.radio-card')?.classList.remove('selected');
        });
        if (e.target.checked) {
          e.target.closest('.radio-card')?.classList.add('selected');
        }
        
        // Custom toggle behavior for porting fields
        if (nameAttr === 'portingRequired') {
          const isNo = e.target.value === 'No';
          formData.portingRequired = e.target.value;
          
          const mainNumEl = document.getElementById('mainNumber');
          const carrierEl = document.getElementById('currentCarrier');
          const addBtnEl = document.getElementById('add-additional-number-btn');
          
          if (mainNumEl) {
            mainNumEl.disabled = isNo;
            if (isNo) mainNumEl.closest('.form-group').classList.add('disabled');
            else mainNumEl.closest('.form-group').classList.remove('disabled');
          }
          if (carrierEl) {
            carrierEl.disabled = isNo;
            if (isNo) carrierEl.closest('.form-group').classList.add('disabled');
            else carrierEl.closest('.form-group').classList.remove('disabled');
          }
          
          document.querySelectorAll('.additional-number-input').forEach(inp => {
            inp.disabled = isNo;
          });
          document.querySelectorAll('.remove-additional-number-btn').forEach(btn => {
            btn.disabled = isNo;
          });
          
          if (addBtnEl) {
            addBtnEl.disabled = isNo;
            if (isNo) addBtnEl.closest('.form-group').classList.add('disabled');
            else addBtnEl.closest('.form-group').classList.remove('disabled');
          }
        }
        
        // After hours routing display toggles
        if (nameAttr === 'afterHoursRouting') {
          const valWrapper = document.getElementById('after-hours-value-wrapper');
          const valLabel = document.getElementById('after-hours-value-label');
          if (['forward', 'oncall'].includes(e.target.value)) {
            valWrapper.style.display = 'block';
            valLabel.textContent = e.target.value === 'forward' 
              ? 'Target Mobile Number for Forwarding' 
              : 'On-Call Person Details / Extension';
          } else {
            valWrapper.style.display = 'none';
          }
        }
      });
    });

    // Checkbox cards select visual highlight
    const checkboxes = document.querySelectorAll('.checkbox-card input[type="checkbox"]');
    checkboxes.forEach(ch => {
      ch.addEventListener('change', (e) => {
        if (e.target.checked) {
          e.target.closest('.checkbox-card')?.classList.add('selected');
        } else {
          e.target.closest('.checkbox-card')?.classList.remove('selected');
        }
      });
    });

    // File Upload simulated trigger
    const uploadZone = document.getElementById('file-upload-zone');
    if (uploadZone) {
      uploadZone.addEventListener('click', () => {
        saveCurrentStepData();
        // Simulate uploading a bill statement
        formData.uploadedBillName = 'aye_tea_carrier_bill_' + Math.floor(Math.random() * 1000) + '.pdf';
        formData.uploadedBillSize = (Math.random() * 2 + 0.5).toFixed(1) + ' MB';
        render();
      });
    }

    const removeFileBtn = document.getElementById('remove-file-btn');
    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', () => {
        saveCurrentStepData();
        formData.uploadedBillName = '';
        formData.uploadedBillSize = '';
        render();
      });
    }

    // Add Additional Number Row
    const addAddNumBtn = document.getElementById('add-additional-number-btn');
    if (addAddNumBtn) {
      addAddNumBtn.addEventListener('click', () => {
        saveCurrentStepData();
        formData.additionalNumbers.push('');
        render();
      });
    }

    // Remove Additional Number Row
    const delAddNumBtns = document.querySelectorAll('.remove-additional-number-btn');
    delAddNumBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        saveCurrentStepData();
        formData.additionalNumbers.splice(idx, 1);
        render();
      });
    });

    // Add Employee Row
    const addEmpBtn = document.getElementById('add-employee-btn');
    if (addEmpBtn) {
      addEmpBtn.addEventListener('click', () => {
        saveCurrentStepData();
        formData.employees.push({
          id: 'emp-' + Date.now(),
          name: '',
          email: '',
          mobile: '',
          directDial: false,
          deskPhone: false,
          mobileApp: false,
          notes: ''
        });
        render();
      });
    }

    // Remove Employee Row
    const delEmpButtons = document.querySelectorAll('.delete-employee-row-btn');
    delEmpButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        saveCurrentStepData();
        formData.employees = formData.employees.filter(emp => emp.id !== id);
        render();
      });
    });
  }
}
