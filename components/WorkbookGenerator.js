// WorkbookGenerator.js - Client-Side Excel Workbook (.xlsx) Generation using SheetJS

import { Database } from '../data.js';

export function generateWorkbook(proj) {
  const settings = Database.getSettings();
  
  // Sheet 1: Company Profile
  const companyData = [
    ["Shai's Dumb Ideas Inc Ooma Deployment Intake Summary", ''],
    ['Generated On', new Date().toLocaleString()],
    ['', ''],
    ['Company Name', proj.companyName],
    ['Primary Contact', proj.contactName],
    ['Contact Email', proj.contactEmail],
    ['Contact Phone', proj.contactPhone],
    ['Company Website', proj.website || 'N/A'],
    ['Number of Employees', proj.employeesCount || proj.employees.length],
    ['Number of Locations', proj.locationsCount || 1],
    ['Current Provider', proj.currentProvider],
    ['Priority Level', proj.priority],
    ['Workflow Status', proj.status],
  ];
  
  // Sheet 2: Porting Information
  const portingData = [
    ['Ooma Porting Request Details', ''],
    ['Porting Required?', proj.portingRequired],
    ['Main Business Number to Port', proj.mainNumber || 'N/A'],
    ['Current Carrier Name', proj.currentCarrier || 'N/A'],
    ['Uploaded Carrier Bill Statement', proj.uploadedBillName || 'None'],
    ['', ''],
    ['Additional Numbers to Port', ''],
  ];
  
  if (Array.isArray(proj.additionalNumbers)) {
    proj.additionalNumbers.forEach((num, idx) => {
      portingData.push([`Number #${idx + 1}`, num]);
    });
  } else {
    portingData.push(['Numbers List', proj.additionalNumbers || 'None']);
  }
  
  // Sheet 3: Extension Assignments
  const extHeaders = ['Extension', 'User Name', 'Email', 'Mobile', 'Direct DID Option', 'Ring Destination', 'Notes'];
  
  // Calculate dynamic extensions
  const baseExtension = parseInt(settings.userExtStart || 1100, 10);
  const increment = parseInt(settings.userBlockIncrement || 100, 10);
  const offset = parseInt(settings.receptionistOffset || 1, 10);
  
  // Helpers
  const extData = [
    ['Ooma Extension Allocation Sheet', '', '', '', '', '', ''],
    ['System Standards Config:', `Start: ${baseExtension}`, `Block Inc: ${increment}`, `Offset: ${offset}`, '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Helper Exts:', '', '', '', '', '', ''],
    [parseInt(settings.mainReceptionist || 1000, 10), 'Main Receptionist Line', '', '', 'Main Number', 'Ring Group', 'System Extension'],
    [parseInt(settings.mainQueue || 1001, 10), 'Main Queue', '', '', '', 'Call Queue', 'System Extension'],
    [parseInt(settings.conferenceServer || 1002, 10), 'Conference Bridge', '', '', '', 'Conference Server', 'System Extension'],
    [parseInt(settings.sharedVoicemail || 1003, 10), 'Shared Voicemail', '', '', '', 'Voicemail Server', 'System Extension'],
    [parseInt(settings.ayeteaSupport || 6666, 10), "Shai's Dumb Ideas Inc Support Line", '', '', '', 'External Routing', 'System Extension'],
    ['', '', '', '', '', '', ''],
    ['User Extensions:', '', '', '', '', '', ''],
    extHeaders
  ];
  
  proj.employees.forEach((emp, index) => {
    const userExt = baseExtension + (index * increment);
    let ringDestination = 'Mobile App & Desk Phone';
    if (emp.deskPhone && !emp.mobileApp) ringDestination = 'Desk Phone Only';
    if (!emp.deskPhone && emp.mobileApp) ringDestination = 'Mobile App Only';
    if (!emp.deskPhone && !emp.mobileApp) ringDestination = 'Virtual Extension (Voicemail)';
    const did = emp.directDial ? (proj.mainNumber || 'N/A') : 'Auto-Receptionist';
    
    // Push main user ext
    extData.push([
      userExt,
      emp.name || 'Unnamed Extension',
      emp.email || 'N/A',
      emp.mobile || 'N/A',
      did,
      ringDestination,
      emp.notes || 'User Extension'
    ]);
    
    // Push receptionist sub-ext (e.g. 1101)
    if (offset > 0) {
      extData.push([
        userExt + offset,
        `${emp.name || 'User'} Receptionist`,
        emp.email || 'N/A',
        emp.mobile || 'N/A',
        'Auto-Receptionist',
        'Desk Phone Only',
        'Virtual Receptionist / Call Routing'
      ]);
    }
  });

  // Sheet 4: Device Requirements
  const deviceData = [
    ['Ooma Hardware Order Specifications', ''],
    ['Desk Phones Count Needed', proj.devices.deskPhonesCount],
    ['Reuse Existing Hardware?', proj.devices.reusePhones],
    ['Need Conference Phone?', proj.devices.needConferencePhone],
    ['Need E-Fax Support?', proj.devices.needFaxSupport],
    ['Need Voicemail-to-Email Delivery?', proj.devices.needVoicemailToEmail],
    ['Need Mobile App Configuration support?', proj.devices.needMobileAppSetup],
    ['Special Device Instructions', proj.devices.specialRoutingUsers || 'None']
  ];
  
  // Sheet 5: Call Flow Configuration
  const ivrOptions = [];
  if (proj.callFlow.press1) ivrOptions.push(['Key 1 Destination', proj.callFlow.press1]);
  if (proj.callFlow.press2) ivrOptions.push(['Key 2 Destination', proj.callFlow.press2]);
  if (proj.callFlow.press3) ivrOptions.push(['Key 3 Destination', proj.callFlow.press3]);
  if (proj.callFlow.press4) ivrOptions.push(['Key 4 Destination', proj.callFlow.press4]);
  if (proj.callFlow.press5) ivrOptions.push(['Key 5 Destination', proj.callFlow.press5]);
  if (proj.callFlow.press9 === 'yes') ivrOptions.push(['Key 9 Destination', "Shai's Dumb Ideas Inc Priority Support Line"]);
  
  const callFlowData = [
    ['Ooma Auto-Receptionist Call Flow Mapping', ''],
    ['Operating Hours Greeting Text', proj.callFlow.greeting || 'Ooma default'],
    ['Direct Extension Dialing', proj.callFlow.dialExtensionsDirectly],
    ['Company Directory Dialing', proj.callFlow.useDirectory],
    ['', ''],
    ['IVR Button Mappings:', ''],
    ...ivrOptions,
    ['', ''],
    ['Call Flow Notes', proj.callFlow.additionalNotes || 'None']
  ];

  // Sheet 6: Deployment Checklists (Porting & Setup)
  const checklist = proj.portingChecklist || {
    carrierIdentified: false, billReceived: false, csrReceived: false,
    requestSubmitted: false, focReceived: false, portComplete: false
  };
  
  const checklistData = [
    ["Shai's Dumb Ideas Inc VoIP Deployment Milestone Checklist", ''],
    ['Carrier Identified', checklist.carrierIdentified ? 'COMPLETED' : 'PENDING'],
    ['Phone Bill Statement Received', checklist.billReceived ? 'COMPLETED' : 'PENDING'],
    ['CSR Document Received', checklist.csrReceived ? 'COMPLETED' : 'PENDING'],
    ['Porting Request Submitted to Ooma', checklist.requestSubmitted ? 'COMPLETED' : 'PENDING'],
    ['FOC (Firm Order Commitment) Date Received', checklist.focReceived ? 'COMPLETED' : 'PENDING'],
    ['Porting Completed Successfully', checklist.portComplete ? 'COMPLETED' : 'PENDING']
  ];

  // Construct Sheets via SheetJS XLSX global
  const wb = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.aoa_to_sheet(companyData);
  const ws2 = XLSX.utils.aoa_to_sheet(portingData);
  const ws3 = XLSX.utils.aoa_to_sheet(extData);
  const ws4 = XLSX.utils.aoa_to_sheet(deviceData);
  const ws5 = XLSX.utils.aoa_to_sheet(callFlowData);
  const ws6 = XLSX.utils.aoa_to_sheet(checklistData);
  
  // Add sheets to workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'Company Profile');
  XLSX.utils.book_append_sheet(wb, ws2, 'Porting Info');
  XLSX.utils.book_append_sheet(wb, ws3, 'Extensions Plan');
  XLSX.utils.book_append_sheet(wb, ws4, 'Devices Required');
  XLSX.utils.book_append_sheet(wb, ws5, 'Call Flow Config');
  XLSX.utils.book_append_sheet(wb, ws6, 'Milestones Checklist');
  
  // Write and Save
  const filename = `${proj.companyName.replace(/\s+/g, '_')}_OomaDeployment.xlsx`;
  XLSX.writeFile(wb, filename);
}
