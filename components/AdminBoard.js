// AdminBoard.js - Kanban Board and Statistics Component for AYETEA Workspace

import { Database } from '../data.js';

export function renderAdminStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const submissions = Database.getSubmissions();

  // Calculate stats
  const total = submissions.length;
  
  const pendingPorts = submissions.filter(s => 
    (s.portingRequired === 'Yes' || s.portingRequired === 'Unsure') && 
    s.status !== 'Go-Live Ready'
  ).length;
  
  const activeSetups = submissions.filter(s => 
    ['Configuration Started', 'Testing'].includes(s.status)
  ).length;
  
  const completed = submissions.filter(s => s.status === 'Go-Live Ready').length;

  container.innerHTML = `
    <!-- Stat 1: Total -->
    <div class="stat-card glass">
      <div>
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Discovery Intake</div>
      </div>
      <div class="stat-icon"><i class="ri-inbox-archive-line"></i></div>
    </div>
    
    <!-- Stat 2: Ports -->
    <div class="stat-card glass">
      <div>
        <div class="stat-number">${pendingPorts}</div>
        <div class="stat-label">Pending Phone Ports</div>
      </div>
      <div class="stat-icon"><i class="ri-phone-share-line"></i></div>
    </div>
    
    <!-- Stat 3: Active configs -->
    <div class="stat-card glass">
      <div>
        <div class="stat-number">${activeSetups}</div>
        <div class="stat-label">Active Deployments</div>
      </div>
      <div class="stat-icon"><i class="ri-settings-5-line"></i></div>
    </div>
    
    <!-- Stat 4: Completed -->
    <div class="stat-card glass">
      <div>
        <div class="stat-number">${completed}</div>
        <div class="stat-label">Ready & Go-Live</div>
      </div>
      <div class="stat-icon"><i class="ri-checkbox-circle-line"></i></div>
    </div>
  `;
}

export function initAdminBoard(containerId, onCardClick, onStatusChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const columns = [
    { id: 'Discovery Received', title: 'Discovery Received', icon: 'ri-download-2-line' },
    { id: 'Porting Submitted', title: 'Porting Submitted', icon: 'ri-phone-share-line' },
    { id: 'Configuration Started', title: 'Config Started', icon: 'ri-settings-4-line' },
    { id: 'Testing', title: 'Testing / Verification', icon: 'ri-test-tube-line' },
    { id: 'Go-Live Ready', title: 'Go-Live Ready', icon: 'ri-rocket-2-line' }
  ];

  render();

  function render() {
    const submissions = Database.getSubmissions();

    container.innerHTML = `
      <div class="board-container">
        ${columns.map(col => {
          const colSubmissions = submissions.filter(s => s.status === col.id);
          
          return `
            <div class="board-column" data-status="${col.id}">
              <div class="column-header">
                <span class="column-title">
                  <i class="${col.icon}"></i> ${col.title}
                </span>
                <span class="column-count">${colSubmissions.length}</span>
              </div>
              <div class="cards-container" id="col-${col.id.replace(/\s+/g, '-')}">
                ${colSubmissions.map(proj => {
                  const date = new Date(proj.submissionDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                  const priorityClass = proj.priority.toLowerCase();
                  
                  // Flags
                  const isCarrierUnsure = proj.currentProvider.toLowerCase().includes('unsure') || proj.portingRequired === 'Unsure';
                  const hasBill = proj.uploadedBillName ? true : false;
                  const extCount = proj.employees.length;

                  return `
                    <div class="project-card" draggable="true" data-id="${proj.id}">
                      <div class="card-top">
                        <h4 class="card-title">${proj.companyName}</h4>
                        <span class="priority-badge ${priorityClass}">${proj.priority}</span>
                      </div>
                      
                      <p class="card-desc">Contact: ${proj.contactName} (${proj.contactPhone})</p>
                      
                      <div class="card-meta">
                        <span><i class="ri-user-voice-line"></i> ${extCount} Exts</span>
                        
                        ${isCarrierUnsure ? `
                          <span class="indicator-warning"><i class="ri-alert-line"></i> Carrier?</span>
                        ` : ''}
                        
                        ${hasBill ? `
                          <span style="color:var(--secondary); font-weight:600;"><i class="ri-attachment-line"></i> Bill</span>
                        ` : ''}
                        
                        <span><i class="ri-calendar-line"></i> ${date}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    attachDragAndDrop();
    attachClickEvents();
  }

  function attachClickEvents() {
    const cards = container.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent trigger on drag events
        if (e.target.closest('.project-card').classList.contains('dragging')) return;
        const id = card.dataset.id;
        onCardClick(id);
      });
    });
  }

  function attachDragAndDrop() {
    const cards = container.querySelectorAll('.project-card');
    const cols = container.querySelectorAll('.board-column');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    cols.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault(); // Required to allow drop
        col.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      });

      col.addEventListener('dragleave', () => {
        col.style.backgroundColor = '';
      });

      col.addEventListener('drop', (e) => {
        col.style.backgroundColor = '';
        const id = e.dataTransfer.getData('text/plain');
        const newStatus = col.dataset.status;
        
        if (id && newStatus) {
          const updated = Database.updateSubmissionStatus(id, newStatus);
          if (updated) {
            onStatusChange(updated);
            render(); // Rerender board
          }
        }
      });
    });
  }

  return {
    refresh: render
  };
}
