// State management and LocalStorage API for Shai's Dumb Ideas Inc Phone Discovery App

const LOCAL_STORAGE_KEY = 'ayetea_phone_discovery_submissions';

// Initial Seed Data to represent Phase 6 Test Cases
const seedSubmissions = [
  {
    id: 'sub-apex-law',
    submissionDate: '2026-06-05T10:14:00-07:00',
    companyName: 'Apex Law Partners',
    contactName: 'John Apex',
    contactEmail: 'john@apexlaw.com',
    contactPhone: '(555) 123-4567',
    website: 'www.apexlaw.com',
    employeesCount: 2,
    locationsCount: 1,
    currentProvider: 'Comcast Business',
    portingRequired: 'Yes',
    mainNumber: '(555) 123-4567',
    additionalNumbers: [],
    uploadedBillName: 'comcast_bill_may2026.pdf',
    uploadedBillSize: '1.2 MB',
    portingChecklist: {
      carrierIdentified: true,
      billReceived: true,
      csrReceived: false,
      requestSubmitted: false,
      focReceived: false,
      portComplete: false
    },
    employees: [
      { id: 'emp-1', name: 'John Apex', email: 'john@apexlaw.com', mobile: '(555) 123-4567', directDial: true, deskPhone: true, mobileApp: false, notes: 'Managing Partner' },
      { id: 'emp-2', name: 'Jane Law', email: 'jane@apexlaw.com', mobile: '(555) 123-4568', directDial: true, deskPhone: true, mobileApp: false, notes: 'Partner' }
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
      greeting: 'Thank you for calling Apex Law Partners. If you know your extension, you may dial it at any time. For John Apex, press 1. For Jane Law, press 2.',
      press1: 'John Apex (Ext 101)',
      press2: 'Jane Law (Ext 102)',
      press3: '',
      press4: '',
      press5: '',
      press9: 'yes',
      dialExtensionsDirectly: 'Yes',
      useDirectory: 'No',
      additionalNotes: 'Very straightforward setup. Basic voicemail message needed.'
    },
    devices: {
      deskPhonesCount: 2,
      reusePhones: 'No',
      needConferencePhone: 'No',
      needFaxSupport: 'No',
      needVoicemailToEmail: 'Yes',
      needMobileAppSetup: 'No',
      specialRoutingUsers: 'None'
    },
    status: 'Discovery Received', // Stages: Discovery Received, Porting Submitted, Configuration Started, Testing, Go-Live Ready
    priority: 'Low',
    comments: [
      { id: 'c-1', author: "Shai's Dumb Ideas Inc System", text: 'Discovery form submitted successfully by customer John Apex.', timestamp: '2026-06-05T10:14:00-07:00' }
    ],
    activities: [
      { text: 'Form submitted by client', timestamp: '2026-06-05T10:14:00-07:00' },
      { text: 'System assigned priority: Low', timestamp: '2026-06-05T10:14:05-07:00' }
    ]
  },
  {
    id: 'sub-summit-mktg',
    submissionDate: '2026-06-04T14:30:00-07:00',
    companyName: 'Summit Marketing Group',
    contactName: 'Alice Summit',
    contactEmail: 'alice@summitmktg.com',
    contactPhone: '(555) 234-5678',
    website: 'www.summitmktg.com',
    employeesCount: 6,
    locationsCount: 1,
    currentProvider: 'Verizon Enterprise',
    portingRequired: 'Yes',
    mainNumber: '(555) 234-5678',
    additionalNumbers: ['(555) 234-5679 (Fax)', '(555) 234-5680 (Sales Direct)'],
    uploadedBillName: 'verizon_bill_june2026.pdf',
    uploadedBillSize: '2.4 MB',
    portingChecklist: {
      carrierIdentified: true,
      billReceived: true,
      csrReceived: true,
      requestSubmitted: true,
      focReceived: false,
      portComplete: false
    },
    employees: [
      { id: 'emp-1', name: 'Alice Summit', email: 'alice@summitmktg.com', mobile: '(555) 234-5678', directDial: true, deskPhone: true, mobileApp: true, notes: 'CEO' },
      { id: 'emp-2', name: 'Bob Mark', email: 'bob@summitmktg.com', mobile: '(555) 234-5601', directDial: false, deskPhone: false, mobileApp: true, notes: 'Field Account Manager' },
      { id: 'emp-3', name: 'Carol Group', email: 'carol@summitmktg.com', mobile: '(555) 234-5602', directDial: true, deskPhone: true, mobileApp: false, notes: 'Billing Admin' },
      { id: 'emp-4', name: 'David Lead', email: 'david@summitmktg.com', mobile: '(555) 234-5603', directDial: false, deskPhone: true, mobileApp: false, notes: 'Office Support' },
      { id: 'emp-5', name: 'Emma Creative', email: 'emma@summitmktg.com', mobile: '(555) 234-5604', directDial: false, deskPhone: false, mobileApp: true, notes: 'Designer' },
      { id: 'emp-6', name: 'Frank Sales', email: 'frank@summitmktg.com', mobile: '(555) 234-5605', directDial: false, deskPhone: true, mobileApp: true, notes: 'Sales Lead' }
    ],
    hours: {
      mondayOpen: '09:00', mondayClose: '18:00',
      tuesdayOpen: '09:00', tuesdayClose: '18:00',
      wednesdayOpen: '09:00', wednesdayClose: '18:00',
      thursdayOpen: '09:00', thursdayClose: '18:00',
      fridayOpen: '09:00', fridayClose: '18:00',
      saturdayOpen: 'Closed', saturdayClose: 'Closed',
      sundayOpen: 'Closed', sundayClose: 'Closed',
      afterHoursRouting: 'voicemail',
      afterHoursCustomValue: ''
    },
    callFlow: {
      greeting: 'Welcome to Summit Marketing Group. Press 1 for Sales. Press 2 for Creative. Press 3 for Billing. Or dial 9 to speak with support.',
      press1: 'Sales Queue (Rings Frank and Alice)',
      press2: 'Creative Dept (Rings Emma and Bob)',
      press3: 'Billing (Rings Carol)',
      press4: '',
      press5: '',
      press9: 'yes',
      dialExtensionsDirectly: 'Yes',
      useDirectory: 'Yes',
      additionalNotes: 'Need a call queue setup for Sales. If nobody answers after 15 seconds, forward to shared voicemail.'
    },
    devices: {
      deskPhonesCount: 4,
      reusePhones: 'Yes',
      needConferencePhone: 'Yes',
      needFaxSupport: 'Yes',
      needVoicemailToEmail: 'Yes',
      needMobileAppSetup: 'Yes',
      specialRoutingUsers: 'Bob and Emma are 100% remote and will only use Ooma mobile apps.'
    },
    status: 'Configuration Started',
    priority: 'Medium',
    comments: [
      { id: 'c-1', author: "Shai's Dumb Ideas Inc System", text: 'Form submitted.', timestamp: '2026-06-04T14:30:00-07:00' },
      { id: 'c-2', author: 'Shais (Admin)', text: 'Porting paperwork looks correct. Transferred Verizon bill to porting subfolder.', timestamp: '2026-06-05T09:00:00-07:00' },
      { id: 'c-3', author: 'Shais (Admin)', text: 'Configuring Ooma office queues. Alice requested a custom greeting music; waiting for upload.', timestamp: '2026-06-05T11:45:00-07:00' }
    ],
    activities: [
      { text: 'Form submitted by client', timestamp: '2026-06-04T14:30:00-07:00' },
      { text: 'Status updated to Porting Submitted', timestamp: '2026-06-05T08:30:00-07:00' },
      { text: 'Status updated to Configuration Started', timestamp: '2026-06-05T11:00:00-07:00' }
    ]
  },
  {
    id: 'sub-bella-dental',
    submissionDate: '2026-06-02T11:20:00-07:00',
    companyName: 'Bella Vista Dental Cafe',
    contactName: 'Sarah Bella',
    contactEmail: 'sarah@bellavistadental.com',
    contactPhone: '(555) 987-6543',
    website: 'www.bellavistadental.com',
    employeesCount: 4,
    locationsCount: 1,
    currentProvider: 'Unsure - AT&T or Spectrum?',
    portingRequired: 'Unsure',
    mainNumber: '(555) 987-6543',
    additionalNumbers: ['(555) 987-6544 (Backline)', '(555) 987-6545 (Backline)'],
    uploadedBillName: 'scan_doc_page1.jpg',
    uploadedBillSize: '950 KB',
    portingChecklist: {
      carrierIdentified: false,
      billReceived: true,
      csrReceived: false,
      requestSubmitted: false,
      focReceived: false,
      portComplete: false
    },
    employees: [
      { id: 'emp-1', name: 'Dr. Sarah Bella', email: 'sarah@bellavistadental.com', mobile: '(555) 444-1234', directDial: true, deskPhone: true, mobileApp: true, notes: 'Dentist/Owner' },
      { id: 'emp-2', name: 'Front Desk Reception', email: 'reception@bellavistadental.com', mobile: '', directDial: false, deskPhone: true, mobileApp: false, notes: 'Main ring destination' },
      { id: 'emp-3', name: 'Hygienist Area', email: '', mobile: '', directDial: false, deskPhone: true, mobileApp: false, notes: 'Room phone' },
      { id: 'emp-4', name: 'Billing Remote', email: 'billing@bellavistadental.com', mobile: '(555) 777-6543', directDial: false, deskPhone: false, mobileApp: true, notes: 'Works remote Mondays' }
    ],
    hours: {
      mondayOpen: '07:30', mondayClose: '16:30',
      tuesdayOpen: '07:30', tuesdayClose: '16:30',
      wednesdayOpen: '07:30', wednesdayClose: '16:30',
      thursdayOpen: '07:30', thursdayClose: '16:30',
      fridayOpen: 'Closed', fridayClose: 'Closed',
      saturdayOpen: 'Closed', saturdayClose: 'Closed',
      sundayOpen: 'Closed', sundayClose: 'Closed',
      afterHoursRouting: 'forward',
      afterHoursCustomValue: '(555) 444-1234'
    },
    callFlow: {
      greeting: 'Thank you for calling Bella Vista Dental Cafe. Press 1 for scheduling, press 2 for billing, or press 3 to leave a message. If this is an emergency, press 4 to reach Dr. Bella.',
      press1: 'Front Desk (Ext 101)',
      press2: 'Billing Remote (Ext 103)',
      press3: 'General Voicemail Box',
      press4: 'Forward to (555) 444-1234 (Dr. Bella Mobile)',
      press5: '',
      press9: 'no',
      dialExtensionsDirectly: 'No',
      useDirectory: 'No',
      additionalNotes: 'Need urgent setup! Patients call during closed hours and need to reach emergency mobile easily.'
    },
    devices: {
      deskPhonesCount: 3,
      reusePhones: 'No',
      needConferencePhone: 'No',
      needFaxSupport: 'Yes',
      needVoicemailToEmail: 'Yes',
      needMobileAppSetup: 'Yes',
      specialRoutingUsers: 'Need fax box configured to email incoming PDFs to reception@bellavistadental.com.'
    },
    status: 'Testing',
    priority: 'High',
    comments: [
      { id: 'c-1', author: "Shai's Dumb Ideas Inc System", text: 'Form submitted.', timestamp: '2026-06-02T11:20:00-07:00' },
      { id: 'c-2', author: 'Shais (Admin)', text: 'Called Sarah to clarify AT&T bill. She confirmed it is AT&T. Number porting submitted manually.', timestamp: '2026-06-03T10:00:00-07:00' },
      { id: 'c-3', author: 'Shais (Admin)', text: 'Ooma hardware shipped. Tracking number: 1Z9999999999999999. Setting up user portal.', timestamp: '2026-06-04T15:00:00-07:00' }
    ],
    activities: [
      { text: 'Form submitted by client', timestamp: '2026-06-02T11:20:00-07:00' },
      { text: 'Manual Porting Submitted', timestamp: '2026-06-03T10:05:00-07:00' },
      { text: 'Status updated to Testing', timestamp: '2026-06-05T16:00:00-07:00' }
    ]
  }
];

const SETTINGS_KEY = 'ayetea_phone_discovery_settings';
const defaultSettings = {
  configEmail: 'support@dumbideas.com',
  mainReceptionist: '1000',
  mainQueue: '1001',
  conferenceServer: '1002',
  sharedVoicemail: '1003',
  ayeteaSupport: '6666',
  userExtStart: '1100',
  userBlockIncrement: '100',
  receptionistOffset: '1'
};

// Database operations
export const Database = {
  getSubmissions: () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedSubmissions));
      return seedSubmissions;
    }
    return JSON.parse(data);
  },

  saveSubmissions: (submissions) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submissions));
  },

  getSettings: () => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(data);
  },

  saveSettings: (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  addSubmission: (submission) => {
    const list = Database.getSubmissions();
    const newSub = {
      id: 'sub-' + Date.now(),
      submissionDate: new Date().toISOString(),
      status: 'Discovery Received',
      portingChecklist: {
        carrierIdentified: submission.currentProvider && !submission.currentProvider.toLowerCase().includes('unsure') ? true : false,
        billReceived: submission.uploadedBillName ? true : false,
        csrReceived: false,
        requestSubmitted: false,
        focReceived: false,
        portComplete: false
      },
      comments: [
        { id: 'c-' + Date.now(), author: "Shai's Dumb Ideas Inc System", text: 'Discovery form submitted successfully.', timestamp: new Date().toISOString() }
      ],
      activities: [
        { text: 'Form submitted by client', timestamp: new Date().toISOString() }
      ],
      ...submission
    };
    list.push(newSub);
    Database.saveSubmissions(list);
    return newSub;
  },

  updateSubmissionStatus: (id, newStatus, notifyClient = false) => {
    const list = Database.getSubmissions();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const oldStatus = list[index].status;
      list[index].status = newStatus;
      
      let logText = `Status updated from "${oldStatus}" to "${newStatus}"`;
      if (notifyClient) {
        const clientEmail = list[index].contactEmail;
        logText += ` (Client notified at ${clientEmail})`;
      }
      
      list[index].activities.push({
        text: logText,
        timestamp: new Date().toISOString()
      });
      Database.saveSubmissions(list);
      return list[index];
    }
    return null;
  },

  updatePortingChecklist: (id, checklist) => {
    const list = Database.getSubmissions();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const oldChecklist = list[index].portingChecklist || {
        carrierIdentified: false, billReceived: false, csrReceived: false,
        requestSubmitted: false, focReceived: false, portComplete: false
      };
      
      list[index].portingChecklist = { ...oldChecklist, ...checklist };
      
      // Log differences to activity log
      const changes = [];
      const keys = {
        carrierIdentified: 'Carrier Identified',
        billReceived: 'Phone Bill Received',
        csrReceived: 'CSR Received',
        requestSubmitted: 'Port Request Submitted',
        focReceived: 'FOC Received',
        portComplete: 'Port Complete'
      };
      
      for (const key in checklist) {
        if (oldChecklist[key] !== checklist[key]) {
          changes.push(`${keys[key]}: ${checklist[key] ? 'Checked' : 'Unchecked'}`);
        }
      }
      
      if (changes.length > 0) {
        list[index].activities.push({
          text: `Porting checklist updated: ${changes.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }
      
      Database.saveSubmissions(list);
      return list[index];
    }
    return null;
  },

  addComment: (id, author, text) => {
    const list = Database.getSubmissions();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const newComment = {
        id: 'c-' + Date.now(),
        author,
        text,
        timestamp: new Date().toISOString()
      };
      list[index].comments.push(newComment);
      list[index].activities.push({
        text: `${author} added comment: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        timestamp: new Date().toISOString()
      });
      Database.saveSubmissions(list);
      return list[index];
    }
    return null;
  },

  deleteSubmission: (id) => {
    let list = Database.getSubmissions();
    list = list.filter(item => item.id !== id);
    Database.saveSubmissions(list);
  },

  resetDatabase: () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedSubmissions));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return seedSubmissions;
  }
};
