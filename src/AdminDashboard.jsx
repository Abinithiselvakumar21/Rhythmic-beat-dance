import { useEffect, useState, useMemo } from 'react';
import './AdminDashboard.css';

const SERVER = 'https://rhythmic-beat-dance.onrender.com';
const API = `${SERVER}/api/events`;
const BOOKINGS_API = `${SERVER}/api/bookings`;
const BRANCHES_API = `${SERVER}/api/branches`;
const UPLOAD_API = `${SERVER}/api/upload`;
const STUDIO_PHONE = '919994716471';

// Workshop Form
const emptyWorkshopForm = {
  title: '',
  description: '',
  agenda: '',
  instructor: 'Master Choreographer Rahul & RB Crew',
  level: 'Beginner & Intermediate Friendly',
  song: '',
  location: 'Valasaravakkam Studio, Chennai',
  participants: '',
  guestName: '',
  specialActivities: '',
  highlights: '',
  status: 'Upcoming',
  slots: 20,
  prize: '₹1,000',
  date: '',
  time: '',
  image: '',
};

const DEFAULT_BRANCHES = [
  {
    _id: 'branch-1',
    name: 'Valasaravakkam Studio',
    tag: 'HEADQUARTERS & MAIN STAGE',
    address: '42, Arcot Road, Near Mega Mart, Valasaravakkam, Chennai - 600087',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      '1,800 sq.ft Wooden Spring Floor',
      '4K Stage Lighting & Video Setup',
      'Fully Air Conditioned',
      'Separate Changing Rooms & Lockers',
    ],
    status: 'Active',
  },
  {
    _id: 'branch-2',
    name: 'Kolapakkam Studio',
    tag: 'PRACTICE & CREW FLOOR',
    address: '15, VGN Boulevard, Near Max Hospital, Kolapakkam, Chennai - 600128',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      '1,200 sq.ft Rehearsal Hall',
      'Surround Acoustic Sound System',
      'Free Dancer Parking Facility',
      'Mirror Walls & Ambient Lighting',
    ],
    status: 'Active',
  },
  {
    _id: 'branch-3',
    name: 'Ambattur Masterclass Branch',
    tag: 'UPCOMING EXPANSION',
    address: 'MTH Road, Near Industrial Estate, Ambattur, Chennai - 600053',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      'Masterclass Arena & Cypher Zone',
      'Battle Stage & Audience Seating',
      'Capacity: 60+ Dancers',
    ],
    status: 'Launching Soon',
  },
];


const emptyBranchForm = {
  name: '',
  tag: 'Studio Branch & Practice Floor',
  address: '',
  city: 'Chennai',
  phone: '+91 99947 16471',
  specs: '1,500 sq.ft Wooden Spring Floor, 4K Stage Lighting, Air Conditioned, Free Parking',
  status: 'Active',
};

// Pure inline SVG Icons for maximum crispness, speed, and modern SaaS look
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  workshop: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
      <path d="M13 5v2"></path>
      <path d="M13 17v2"></path>
      <path d="M13 11v2"></path>
    </svg>
  ),
  branch: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"></path>
      <path d="M5 21V7l8-4v18"></path>
      <path d="M19 21V11l-6-3"></path>
      <path d="M9 9h1"></path>
      <path d="M9 13h1"></path>
      <path d="M9 17h1"></path>
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  music: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  clipboard: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
  sparkles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
  ),
};

// Return a clean vector icon badge for workshop styles instead of heavy image
function getWorkshopStyleIcon(title = '', song = '') {
  const text = `${title} ${song}`.toLowerCase();
  if (text.includes('kuthu') || text.includes('folk') || text.includes('dappa')) {
    return { icon: '🔥', label: 'FOLK', bg: 'badge-flame' };
  }
  if (text.includes('hip') || text.includes('urban') || text.includes('street')) {
    return { icon: '⚡', label: 'URBAN', bg: 'badge-lightning' };
  }
  if (text.includes('contemporary') || text.includes('lyrical') || text.includes('ballet')) {
    return { icon: '🩰', label: 'LYRICAL', bg: 'badge-grace' };
  }
  if (text.includes('battle') || text.includes('cypher') || text.includes('clash')) {
    return { icon: '🏆', label: 'BATTLE', bg: 'badge-gold' };
  }
  if (text.includes('bollywood') || text.includes('commercial')) {
    return { icon: '🌟', label: 'BOLLY', bg: 'badge-purple' };
  }
  return { icon: '💃', label: 'CHOREO', bg: 'badge-teal' };
}

function AdminDashboard() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('workshops'); // 'workshops' | 'bookings' | 'overview' | 'branches'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Workshop Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(emptyWorkshopForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Branch Modal / Form State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [branchFormLoading, setBranchFormLoading] = useState(false);
  const [branchForm, setBranchForm] = useState(emptyBranchForm);

  // Agenda Quick View Modal
  const [viewingAgendaEvent, setViewingAgendaEvent] = useState(null);

  const token = () => sessionStorage.getItem('adminToken');

  function assetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  function formatSongName(songPath) {
    if (!songPath || songPath.trim() === '') {
      return 'Special Choreography Track';
    }
    const clean = songPath.split('/').pop().replace(/\.[^/.]+$/, '');
    const formatted = clean.replace(/^\d+[-_]?/, '').replace(/[-_]+/g, ' ').trim();
    return formatted
      ? formatted.replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Special Choreography Track';
  }

  async function readResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }

  function showNotice(text, type = 'info') {
    setStatusMessage(text);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
    }, 5000);
  }

  // 1. Load Events
  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const response = await fetch(API, { cache: 'no-store' });
      const data = await readResponse(response);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Load events error:', error);
      showNotice(`Unable to load workshops: ${error.message}`, 'error');
    } finally {
      setLoadingEvents(false);
    }
  }

  // 2. Load Bookings
  async function loadBookings() {
    setLoadingBookings(true);
    try {
      const response = await fetch(BOOKINGS_API, { cache: 'no-store' });
      const data = await readResponse(response);
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoadingBookings(false);
    }
  }

  // 3. Load Branches
  async function loadBranches() {
    setLoadingBranches(true);
    try {
      const response = await fetch(BRANCHES_API, { cache: 'no-store' });
      const data = await readResponse(response);
      if (Array.isArray(data) && data.length > 0) {
        setBranches(data);
      }
    } catch (error) {
      console.warn('Fallback to local default branches:', error.message);
    } finally {
      setLoadingBranches(false);
    }
  }

  useEffect(() => {
    loadEvents();
    loadBookings();
    loadBranches();
  }, []);

  // Workshop Form Handlers
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Handle Topic Curriculum Template Change
  function handleTopicChange(topicKey) {
    const template = TOPIC_CURRICULUM_TEMPLATES[topicKey];
    if (template) {
      setForm((prev) => ({
        ...prev,
        topic: topicKey,
        agenda: template.agenda,
      }));
      showNotice(`Applied "${template.name}" curriculum template!`, 'success');
    }
  }

  async function uploadFile(file, kind, authToken) {
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);

    const response = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await readResponse(response);
    return data.url;
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyWorkshopForm);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  }

  function openEditModal(event) {
    setEditingId(event._id);
    setForm({
     title: event.title || '',
  description: event.description || '',
  instructor: event.instructor || 'Master Choreographer Rahul & RB Crew',
  level: event.level || 'Beginner & Intermediate Friendly',
  song: event.song || '',
  location: event.location || 'Valasaravakkam Studio, Chennai',

  agenda: event.agenda || '',
  participants: event.participants || '',
  guestName: event.guestName || '',
  specialActivities: event.specialActivities || '',
  highlights: event.highlights || '',

  status: event.status || 'Upcoming',
  slots: event.slots ?? 20,
  prize: event.prize || '₹1,000',
  date: event.date || '',
  time: event.time || '',
  image: event.image || '',
    });
    setImageFile(null);
    setImagePreview(event.image ? assetUrl(event.image) : '');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyWorkshopForm);
    setImageFile(null);
    setImagePreview('');
  }

  async function handleWorkshopSubmit(e) {
    e.preventDefault();
    if (formLoading) return;

    setFormLoading(true);
    const authToken = token();

    if (!authToken) {
      alert('Session expired. Please login again.');
      window.location.href = '/admin';
      return;
    }

    try {
      let image = form.image || '';

      if (imageFile) {
        showNotice('Uploading poster image...', 'info');
        image = await uploadFile(imageFile, 'image', authToken);
      }

      showNotice('Saving workshop to database...', 'info');

      const url = editingId ? `${API}/${editingId}` : API;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...form,
          image,
          slots: Number(form.slots) || 0,
        }),
      });

      await readResponse(response);

      showNotice(
        editingId ? 'Workshop updated successfully!' : 'New workshop created successfully!',
        'success'
      );
      closeModal();
      await loadEvents();
    } catch (error) {
      console.error('Submit error:', error);
      showNotice(error.message || 'Failed to save workshop.', 'error');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteEvent(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    const authToken = token();
    if (!authToken) {
      window.location.href = '/admin';
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      await readResponse(response);
      showNotice('Workshop deleted successfully!', 'success');
      await loadEvents();
    } catch (error) {
      console.error('Delete error:', error);
      showNotice(error.message || 'Delete failed.', 'error');
    }
  }

  // Bookings Handlers
  async function handleToggleBookingStatus(booking) {
    const nextStatus = booking.status === 'Confirmed' ? 'Pending' : 'Confirmed';
    try {
      const response = await fetch(`${BOOKINGS_API}/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await readResponse(response);
      showNotice(`Booking status updated to ${nextStatus}!`, 'success');
      await loadBookings();
    } catch (error) {
      console.error('Update booking error:', error);
      showNotice('Unable to update booking status.', 'error');
    }
  }

  async function handleDeleteBooking(id, dancerName) {
    if (!window.confirm(`Delete booking for dancer "${dancerName}"?`)) {
      return;
    }
    try {
      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: 'DELETE',
      });
      await readResponse(response);
      showNotice('Booking deleted successfully!', 'success');
      await loadBookings();
    } catch (error) {
      console.error('Delete booking error:', error);
      showNotice('Unable to delete booking.', 'error');
    }
  }

  // Branch CRUD Handlers
  function openCreateBranchModal() {
    setEditingBranchId(null);
    setBranchForm(emptyBranchForm);
    setIsBranchModalOpen(true);
  }

  function openEditBranchModal(b) {
    setEditingBranchId(b._id);
    setBranchForm({
      name: b.name || '',
      tag: b.tag || 'Studio Branch & Practice Floor',
      address: b.address || '',
      city: b.city || 'Chennai',
      phone: b.phone || '+91 99947 16471',
      specs: Array.isArray(b.specs) ? b.specs.join(', ') : b.specs || '',
      status: b.status || 'Active',
    });
    setIsBranchModalOpen(true);
  }

  function closeBranchModal() {
    setIsBranchModalOpen(false);
    setEditingBranchId(null);
    setBranchForm(emptyBranchForm);
  }

  async function handleBranchSubmit(e) {
    e.preventDefault();
    if (branchFormLoading) return;

    setBranchFormLoading(true);
    showNotice('Saving studio branch...', 'info');

    const specsArray = branchForm.specs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...branchForm,
      specs: specsArray,
    };

    try {
      const url = editingBranchId ? `${BRANCHES_API}/${editingBranchId}` : BRANCHES_API;
      const response = await fetch(url, {
        method: editingBranchId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await readResponse(response);

      showNotice(
        editingBranchId ? 'Studio branch updated successfully!' : 'New studio branch added successfully!',
        'success'
      );
      closeBranchModal();
      await loadBranches();
    } catch (error) {
      console.warn('Branch backend fallback:', error);
      // Local state fallback in case backend is offline
      if (editingBranchId) {
        setBranches((prev) =>
          prev.map((item) =>
            item._id === editingBranchId
              ? { ...item, ...payload, specs: specsArray }
              : item
          )
        );
      } else {
        const newBranch = {
          _id: `branch-${Date.now()}`,
          ...payload,
          specs: specsArray,
        };
        setBranches((prev) => [...prev, newBranch]);
      }
      showNotice(
        editingBranchId ? 'Studio branch updated!' : 'New studio branch added!',
        'success'
      );
      closeBranchModal();
    } finally {
      setBranchFormLoading(false);
    }
  }

  async function handleDeleteBranch(id, name) {
    if (!window.confirm(`Are you sure you want to remove "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${BRANCHES_API}/${id}`, {
        method: 'DELETE',
      });
      await readResponse(response);
      showNotice(`Branch "${name}" deleted successfully!`, 'success');
      await loadBranches();
    } catch (error) {
      console.warn('Branch delete fallback:', error);
      setBranches((prev) => prev.filter((b) => b._id !== id));
      showNotice(`Branch "${name}" removed!`, 'success');
    }
  }

  async function handleToggleBranchStatus(branch) {
    const nextStatus = branch.status === 'Active' ? 'Launching Soon' : 'Active';
    try {
      const response = await fetch(`${BRANCHES_API}/${branch._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await readResponse(response);
      showNotice(`Branch status changed to ${nextStatus}!`, 'success');
      await loadBranches();
    } catch (error) {
      setBranches((prev) =>
        prev.map((b) => (b._id === branch._id ? { ...b, status: nextStatus } : b))
      );
      showNotice(`Branch status changed to ${nextStatus}!`, 'success');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin';
  }

  // Filtered Workshops
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.song?.toLowerCase().includes(q) ||
        ev.instructor?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (ev.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.ticketId?.toLowerCase().includes(q) ||
        b.eventTitle?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (b.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Overview Metrics
  const metrics = useMemo(() => {
    const totalWorkshops = events.length;
    const upcomingWorkshops = events.filter(
      (e) => (e.status || '').toLowerCase() === 'upcoming'
    ).length;
    const totalBookings = bookings.length;
    const totalBranches = branches.length;
    const totalSlots = events.reduce((sum, e) => sum + (Number(e.slots) || 0), 0);

    return {
      totalWorkshops,
      upcomingWorkshops,
      totalBookings,
      totalBranches,
      totalSlots,
    };
  }, [events, bookings, branches]);

  return (
    <div className="saas-admin-wrapper">
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="saas-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR WITH VECTOR ICONS */}
      <aside className={`saas-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            {Icons.sparkles}
          </div>
          <div className="brand-text-box">
            <h2>RHYTHMIC BEAT</h2>
            <p>DANCE COURT ADMIN</p>
          </div>
        </div>

        {/* Navigation Items with Clean Vector Icons */}
        <nav className="sidebar-menu">
          <button
            type="button"
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">{Icons.dashboard}</span>
            <span className="menu-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'workshops' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('workshops');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">{Icons.workshop}</span>
            <span className="menu-label">All Workshops</span>
            {events.length > 0 && (
              <span className="menu-badge">{events.length}</span>
            )}
          </button>

          <button
            type="button"
            className="menu-item action-item"
            onClick={() => {
              openCreateModal();
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">{Icons.plus}</span>
            <span className="menu-label">Add New Workshop</span>
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bookings');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">{Icons.ticket}</span>
            <span className="menu-label">Registrations / Bookings</span>
            {bookings.length > 0 && (
              <span className="menu-badge highlight">{bookings.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('branches');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">{Icons.branch}</span>
            <span className="menu-label">Branches</span>
            <span className="menu-badge">{branches.length}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="menu-item link-item"
          >
            <span className="menu-icon">{Icons.globe}</span>
            <span className="menu-label">View Live Website</span>
            <span className="external-arrow">↗</span>
          </a>
        </nav>

        {/* Bottom Sidebar: Super Admin Profile & Logout */}
        <div className="sidebar-footer">
          <div className="admin-profile-pill">
            <div className="avatar-circle">S</div>
            <div className="profile-details">
              <strong>Super Admin</strong>
              <small>superadmin</small>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon">{Icons.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="saas-main-area">
        {/* TOP ACTION BAR */}
        <header className="saas-top-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              ☰
            </button>

            <div>
              <h1 className="header-title">
                {activeTab === 'workshops' && 'ALL WORKSHOPS & MASTERCLASSES'}
                {activeTab === 'bookings' && 'WORKSHOP REGISTRATIONS & PASSES'}
                {activeTab === 'overview' && 'ACADEMY DASHBOARD OVERVIEW'}
                {activeTab === 'branches' && 'STUDIO BRANCHES & VENUES'}
              </h1>
              <p className="header-subtitle">
                {activeTab === 'workshops' &&
                  'Monitor schedules, song tracks, instructor assignments, and session curricula'}
                {activeTab === 'bookings' &&
                  'Review dancer registrations, digital tickets, and direct WhatsApp links'}
                {activeTab === 'overview' &&
                  'Real-time metrics, workshop occupancy, and studio performance'}
                {activeTab === 'branches' &&
                  'Manage academy venues, practice floors, amenities, and contact helplines'}
              </p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="header-actions">
            {activeTab !== 'branches' ? (
              <>
                <div className="search-box">
                  <span className="search-icon">{Icons.search}</span>
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'bookings'
                        ? 'Search dancer, phone, ticket...'
                        : 'Search workshop, song, instructor...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="filter-dropdown-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">Filter by Status</option>
                    {activeTab === 'bookings' ? (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                      </>
                    ) : (
                      <>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  className="primary-cta-btn"
                  onClick={openCreateModal}
                >
                  <span className="btn-icon">{Icons.plus}</span> NEW WORKSHOP
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-cta-btn"
                onClick={openCreateBranchModal}
              >
                <span className="btn-icon">{Icons.plus}</span> ADD NEW BRANCH
              </button>
            )}
          </div>
        </header>

        {/* NOTIFICATION BANNER */}
        {statusMessage && (
          <div className={`status-banner ${statusType}`}>
            <span>{statusType === 'success' ? Icons.check : statusType === 'error' ? '⚠️' : 'ℹ️'}</span>
            <p>{statusMessage}</p>
          </div>
        )}

        {/* METRICS ROW */}
        {(activeTab === 'overview' || activeTab === 'workshops') && (
          <div className="metrics-summary-grid">
            <div className="metric-box">
              <div className="metric-icon-wrap mint">{Icons.workshop}</div>
              <div>
                <small>TOTAL WORKSHOPS</small>
                <h3>{metrics.totalWorkshops}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap orange">{Icons.sparkles}</div>
              <div>
                <small>UPCOMING SESSIONS</small>
                <h3>{metrics.upcomingWorkshops}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap blue">{Icons.ticket}</div>
              <div>
                <small>DANCER REGISTRATIONS</small>
                <h3>{metrics.totalBookings}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap teal">{Icons.branch}</div>
              <div>
                <small>ACTIVE BRANCHES</small>
                <h3>{metrics.totalBranches}</h3>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <main className="saas-content-card">
          {/* TAB 1: ALL WORKSHOPS TABLE (REPLACED IMAGES WITH SLEEK VECTOR ICONS) */}
          {activeTab === 'workshops' && (
            <div className="table-responsive">
              <table className="saas-data-table">
                <thead>
                  <tr>
                    <th>WORKSHOP & SONG</th>
                    <th>CHOREOGRAPHER & LEVEL</th>
                    <th>DATE & TIME</th>
                    <th>PRICE / PASS</th>
                    <th>AVAILABLE SLOTS</th>
                    <th>SESSION CURRICULUM</th>
                    <th>STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents ? (
                    <tr>
                      <td colSpan="8" className="table-loading-cell">
                        <div className="table-spinner" />
                        <p>Loading workshops from database...</p>
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="table-empty-cell">
                        <p>No workshops found matching your search.</p>
                        <button
                          type="button"
                          className="table-action-btn primary"
                          onClick={openCreateModal}
                        >
                          + Create First Workshop
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => {
                      const styleBadge = getWorkshopStyleIcon(event.title, event.song);
                      return (
                        <tr key={event._id} className="table-row">
                          {/* Workshop Title with Styled Vector Icon Badge instead of Image */}
                          <td>
                            <div className="workshop-info-cell">
                              <div className={`style-icon-badge ${styleBadge.bg}`}>
                                <span className="style-emoji">{styleBadge.icon}</span>
                                <span className="style-tag">{styleBadge.label}</span>
                              </div>
                              <div>
                                <strong className="workshop-title-text">
                                  {event.title}
                                </strong>
                                <span className="song-subtitle-text">
                                  {Icons.music} {formatSongName(event.song)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Choreographer & Level */}
                          <td>
                            <div className="instructor-cell">
                              <strong>{event.instructor || 'Master Choreographer'}</strong>
                              <small>{event.level || 'Beginner Friendly'}</small>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td>
                            <div className="datetime-cell">
                              <strong>{event.date || 'TBA'}</strong>
                              <small>{event.time || 'Schedule TBA'}</small>
                            </div>
                          </td>

                          {/* Price */}
                          <td>
                            <span className="fee-badge">{event.prize || '₹1,000'}</span>
                          </td>

                          {/* Slots */}
                          <td>
                            <div className="slots-cell">
                              <span className="slot-num">{event.slots ?? 0}</span>
                              <small>Left</small>
                            </div>
                          </td>

                          {/* Session Curriculum Preview Button */}
                          <td>
                            <button
                              type="button"
                              className="agenda-view-btn"
                              onClick={() => setViewingAgendaEvent(event)}
                              title="Click to view full workshop session flow"
                            >
                              <span className="btn-icon">{Icons.clipboard}</span> View Flow
                            </button>
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className={`status-chip ${
                                (event.status || 'upcoming').toLowerCase()
                              }`}
                            >
                              {event.status || 'Upcoming'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <div className="row-action-buttons">
                              <button
                                type="button"
                                className="action-icon-btn edit"
                                title="Edit Workshop"
                                onClick={() => openEditModal(event)}
                              >
                                {Icons.edit} Edit
                              </button>

                              <button
                                type="button"
                                className="action-icon-btn delete"
                                title="Delete Workshop"
                                onClick={() => handleDeleteEvent(event._id, event.title)}
                              >
                                {Icons.trash}
                              </button>

                              <a
                                href={`/#ws-${event._id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="action-icon-btn view"
                                title="View on Website"
                              >
                                {Icons.eye}
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: BOOKINGS / REGISTRATIONS TABLE */}
          {activeTab === 'bookings' && (
            <div className="table-responsive">
              <table className="saas-data-table">
                <thead>
                  <tr>
                    <th>DANCER</th>
                    <th>WHATSAPP / CONTACT</th>
                    <th>WORKSHOP & PASS CODE</th>
                    <th>PASSES</th>
                    <th>REGISTERED DATE</th>
                    <th>STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">
                        <div className="table-spinner" />
                        <p>Loading registrations from database...</p>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">
                        <p>No dancer registrations recorded yet.</p>
                        <small>
                          When dancers submit the booking modal on the website, their details appear here instantly.
                        </small>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="table-row">
                        {/* Dancer Info */}
                        <td>
                          <div className="dancer-info-cell">
                            <div className="dancer-initial-avatar">
                              {b.name ? b.name.charAt(0).toUpperCase() : 'D'}
                            </div>
                            <div>
                              <strong className="dancer-name-text">{b.name}</strong>
                              <small className="dancer-email-text">
                                {b.email || 'No email provided'}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp / Phone with One-Click Link */}
                        <td>
                          <div className="phone-cell">
                            <span className="phone-number">{b.phone}</span>
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hi ${b.name}! Thank you for reserving pass #${b.ticketId} for "${b.eventTitle}" at Rhythmic Beat Dance Court. We look forward to having you!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="wa-chat-pill"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        </td>

                        {/* Workshop & Pass */}
                        <td>
                          <div className="booking-workshop-cell">
                            <strong>{b.eventTitle || 'Dance Workshop'}</strong>
                            <span className="pass-code-pill">#{b.ticketId}</span>
                          </div>
                        </td>

                        {/* Slots */}
                        <td>
                          <span className="slot-count-badge">
                            {b.slots} {b.slots === 1 ? 'Pass' : 'Passes'}
                          </span>
                        </td>

                        {/* Date */}
                        <td>
                          <small className="date-text">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString('en-GB')
                              : b.date || 'Recent'}
                          </small>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`booking-status-chip ${
                              (b.status || 'pending').toLowerCase()
                            }`}
                          >
                            {b.status || 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-right">
                          <div className="row-action-buttons">
                            <button
                              type="button"
                              className={`action-toggle-status-btn ${
                                b.status === 'Confirmed' ? 'confirmed' : 'pending'
                              }`}
                              title="Toggle Confirmed / Pending"
                              onClick={() => handleToggleBookingStatus(b)}
                            >
                              {b.status === 'Confirmed' ? '✓ Confirmed' : 'Mark Confirm'}
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn delete"
                              title="Delete Registration"
                              onClick={() => handleDeleteBooking(b._id, b.name)}
                            >
                              {Icons.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: OVERVIEW METRICS DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content">
              <div className="overview-cards-row">
                <div className="overview-panel">
                  <div className="panel-title-row">
                    <h3>Recent Workshops</h3>
                    <button
                      type="button"
                      className="link-subtle-btn"
                      onClick={() => setActiveTab('workshops')}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="mini-event-list">
                    {events.slice(0, 4).map((ev) => (
                      <div key={ev._id} className="mini-event-row">
                        <div className="mini-title-box">
                          <strong>{ev.title}</strong>
                          <small>
                            {ev.date || 'TBA'} • 🎵 {formatSongName(ev.song)}
                          </small>
                        </div>
                        <span className={`status-chip ${(ev.status || 'upcoming').toLowerCase()}`}>
                          {ev.status || 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overview-panel">
                  <div className="panel-title-row">
                    <h3>Recent Dancer Bookings</h3>
                    <button
                      type="button"
                      className="link-subtle-btn"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="mini-event-list">
                    {bookings.length === 0 ? (
                      <p className="empty-subtext">No registrations recorded yet.</p>
                    ) : (
                      bookings.slice(0, 4).map((b) => (
                        <div key={b._id} className="mini-event-row">
                          <div className="mini-title-box">
                            <strong>{b.name}</strong>
                            <small>
                              Pass #{b.ticketId} • {b.eventTitle}
                            </small>
                          </div>
                          <span className={`booking-status-chip ${(b.status || 'pending').toLowerCase()}`}>
                            {b.status || 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO BRANCHES WITH FULL CRUD ACTIONS */}
          {activeTab === 'branches' && (
            <div className="branches-admin-wrapper">
              <div className="branches-section-bar">
                <div>
                  <h3 className="branches-section-title">Studio Venues & Practice Courts</h3>
                  <p className="branches-section-subtitle">
                    Manage academy locations, wooden dance floors, amenities, and branch phone numbers.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-cta-btn"
                  onClick={openCreateBranchModal}
                >
                  <span className="btn-icon">{Icons.plus}</span> + ADD NEW BRANCH
                </button>
              </div>

              <div className="branches-admin-grid">
                {branches.map((b) => (
                  <div key={b._id} className="branch-admin-card">
                    {/* Header: Tag + Status Chip */}
                    <div className="branch-card-header">
                      <span className="branch-header-badge">{b.tag || 'STUDIO VENUE'}</span>
                      <button
                        type="button"
                        className={`branch-status-toggle ${b.status === 'Active' ? 'active' : 'upcoming'}`}
                        title="Click to toggle status"
                        onClick={() => handleToggleBranchStatus(b)}
                      >
                        {b.status === 'Active' ? '● Active Studio' : '○ Launching Soon'}
                      </button>
                    </div>

                    <h3 className="branch-name">{b.name}</h3>

                    <p className="branch-address">
                      <span className="icon-wrap">{Icons.mapPin}</span> {b.address}
                    </p>

                    {/* Features / Amenities list */}
                    <div className="branch-specs">
                      {(Array.isArray(b.specs) ? b.specs : (b.specs || '').split(','))
                        .map((spec, i) => (
                          <span key={i} className="spec-tag">
                            <span className="spec-check">{Icons.check}</span> {spec.trim()}
                          </span>
                        ))}
                    </div>

                    {/* Contact Helpline with WhatsApp */}
                    <div className="branch-contact-bar">
                      <div className="phone-info">
                        <span className="icon-wrap">{Icons.phone}</span>
                        <strong>{b.phone || '+91 99947 16471'}</strong>
                      </div>
                      <a
                        href={`https://wa.me/${(b.phone || STUDIO_PHONE).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi Rhythmic Beat Dance Court! I am inquiring about the ${b.name} branch.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="branch-wa-link"
                      >
                        💬 WhatsApp
                      </a>
                    </div>

                    {/* Branch Actions Toolbar */}
                    <div className="branch-actions-row">
                      <button
                        type="button"
                        className="branch-action-btn edit"
                        onClick={() => openEditBranchModal(b)}
                      >
                        {Icons.edit} Edit Branch
                      </button>

                      <button
                        type="button"
                        className="branch-action-btn delete"
                        onClick={() => handleDeleteBranch(b._id, b.name)}
                      >
                        {Icons.trash} Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT WORKSHOP MODAL */}
      {isModalOpen && (
        <div className="saas-modal-backdrop" onClick={closeModal}>
          <div
            className="saas-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h2>{editingId ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                <p>Configure workshop schedule, choreography song, and session curriculum.</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="saas-modal-form">
              <div className="modal-form-grid">
                {/* Title */}
                <div className="form-field full-width">
                  <label htmlFor="form-title">Workshop Title *</label>
                  <input
                    id="form-title"
                    name="title"
                    required
                    placeholder="e.g. Masterclass Choreography Battle"
                    value={form.title}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Song / Track */}
                <div className="form-field full-width">
                  <label htmlFor="form-song">Name of the Song / Track *</label>
                  <input
                    id="form-song"
                    name="song"
                    placeholder="e.g. Arabic Kuthu - Anirudh Choreography"
                    value={form.song}
                    onChange={handleFormChange}
                  />
                  <small className="field-hint">
                    Song name will be displayed cleanly on the workshop page and card badges.
                  </small>
                </div>

                {/* Lead Instructor */}
                <div className="form-field">
                  <label htmlFor="form-instructor">Lead Choreographer / Faculty</label>
                  <input
                    id="form-instructor"
                    name="instructor"
                    placeholder="e.g. Master Choreographer Rahul & RB Crew"
                    value={form.instructor}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Dancer Level */}
                <div className="form-field">
                  <label htmlFor="form-level">Dancer Level / Difficulty</label>
                  <select
                    id="form-level"
                    name="level"
                    value={form.level}
                    onChange={handleFormChange}
                  >
                    <option value="Beginner Friendly">Beginner Friendly</option>
                    <option value="Open Level (Beginner & Intermediate)">Open Level (Beginner & Intermediate)</option>
                    <option value="Intermediate / Advanced">Intermediate / Advanced</option>
                    <option value="Masterclass Intensive (Pro)">Masterclass Intensive (Pro)</option>
                  </select>
                </div>

                {/* Branch Venue */}
                <div className="form-field">
                  <label htmlFor="form-location">Studio Venue / Branch</label>
                  <select
                    id="form-location"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                  >
                    <option value="Valasaravakkam Studio, Chennai">Valasaravakkam Studio, Chennai</option>
                    <option value="Kolapakkam Studio, Chennai">Kolapakkam Studio, Chennai</option>
                    <option value="Ambattur Masterclass Branch, Chennai">Ambattur Masterclass Branch, Chennai</option>
                  </select>
                </div>

                {/* Status */}
                <div className="form-field">
                  <label htmlFor="form-status">Status</label>
                  <select
                    id="form-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Slots */}
                <div className="form-field">
                  <label htmlFor="form-slots">Available Slots</label>
                  <input
                    id="form-slots"
                    name="slots"
                    type="number"
                    min="0"
                    placeholder="20"
                    value={form.slots}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Price / Fee */}
                <div className="form-field">
                  <label htmlFor="form-prize">Registration Fee / Pass</label>
                  <input
                    id="form-prize"
                    name="prize"
                    placeholder="e.g. ₹1,000"
                    value={form.prize}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Date */}
                <div className="form-field">
                  <label htmlFor="form-date">Event Date</label>
                  <input
                    id="form-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Time */}
                <div className="form-field">
                  <label htmlFor="form-time">Event Time</label>
                  <input
                    id="form-time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Workshop Description */}
           

                {/* TOPIC-RELEVANT CURRICULUM SELECTOR */}
              {/* WORKSHOP SESSION FLOW */}


              {/* WORKSHOP SESSION FLOW / AGENDA */}
<div className="form-field full-width">
  <label htmlFor="form-agenda" className="highlight-label">
    What Happens in This Workshop (Session Flow / Agenda)
  </label>

  <textarea
    id="form-agenda"
    name="agenda"
    rows="5"
    placeholder="Enter workshop session flow, one activity per line..."
    value={form.agenda || ''}
    onChange={handleFormChange}
  />
</div>



{/* WORKSHOP SESSION FLOW / AGENDA */}
{/* WHO CAN PARTICIPATE */}
<div className="form-field full-width">
    <label htmlFor="form-agenda" className="highlight-label">
    ✨ What Happens in This Workshop (Session Flow / Agenda) *
  </label>
  <label htmlFor="form-participants">👥 Who Can Participate?</label>
  <textarea
    id="form-participants"
    name="participants"
    rows="2"
    placeholder="e.g. Kids, Adults, Beginners, All Age Groups..."
    value={form.participants}
    onChange={handleFormChange}
  />
</div>

{/* GUEST NAME */}
<div className="form-field full-width">
  <label htmlFor="form-guestName">🎤 Guest Name</label>
  <input
    id="form-guestName"
    name="guestName"
    placeholder="Enter special guest name"
    value={form.guestName}
    onChange={handleFormChange}
  />
</div>

{/* SPECIAL ACTIVITIES */}
<div className="form-field full-width">
  <label htmlFor="form-specialActivities">🎬 Special Activities</label>
  <textarea
    id="form-specialActivities"
    name="specialActivities"
    rows="3"
    placeholder="e.g. Live choreography, Dance battle, Group performance..."
    value={form.specialActivities}
    onChange={handleFormChange}
  />
</div>

{/* WORKSHOP HIGHLIGHTS */}
<div className="form-field full-width">
  <label htmlFor="form-highlights">🌟 Workshop Highlights</label>
  <textarea
    id="form-highlights"
    name="highlights"
    rows="3"
    placeholder="Enter the special highlights of this workshop..."
    value={form.highlights}
    onChange={handleFormChange}
  />
</div>

                {/* Poster Image File */}
                <div className="form-field full-width">
                  <label htmlFor="form-image-file">
                    Workshop Poster Image (JPG, PNG, WEBP)
                  </label>
                  <input
                    id="form-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageFile(file || null);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="image-preview-thumb">
                      <img src={imagePreview} alt="Workshop preview" />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={formLoading}
                >
                  {formLoading
                    ? 'Saving to Database...'
                    : editingId
                    ? 'Update Workshop'
                    : 'Create Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BRANCH MODAL */}
      {isBranchModalOpen && (
        <div className="saas-modal-backdrop" onClick={closeBranchModal}>
          <div
            className="saas-modal-window branch-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h2>{editingBranchId ? 'Edit Studio Branch' : 'Create New Studio Branch'}</h2>
                <p>Configure dance studio venue location, amenities, and contact helpline.</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={closeBranchModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="saas-modal-form">
              <div className="modal-form-grid">
                {/* Branch Name */}
                <div className="form-field full-width">
                  <label htmlFor="branch-name">Branch / Studio Name *</label>
                  <input
                    id="branch-name"
                    required
                    placeholder="e.g. Anna Nagar Studio"
                    value={branchForm.name}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, name: e.target.value })
                    }
                  />
                </div>

                {/* Tag / Category */}
                <div className="form-field">
                  <label htmlFor="branch-tag">Tagline / Category</label>
                  <input
                    id="branch-tag"
                    placeholder="e.g. MAIN STAGE & STUDIO HQ"
                    value={branchForm.tag}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, tag: e.target.value })
                    }
                  />
                </div>

                {/* Status */}
                <div className="form-field">
                  <label htmlFor="branch-status">Status</label>
                  <select
                    id="branch-status"
                    value={branchForm.status}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, status: e.target.value })
                    }
                  >
                    <option value="Active">Active Studio</option>
                    <option value="Launching Soon">Launching Soon</option>
                    <option value="Renovating">Renovating</option>
                  </select>
                </div>

                {/* Address */}
                <div className="form-field full-width">
                  <label htmlFor="branch-address">Full Studio Address *</label>
                  <input
                    id="branch-address"
                    required
                    placeholder="e.g. 2nd Avenue, Near Roundtana, Anna Nagar, Chennai - 600040"
                    value={branchForm.address}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, address: e.target.value })
                    }
                  />
                </div>

                {/* Phone */}
                <div className="form-field">
                  <label htmlFor="branch-phone">Helpline / WhatsApp Phone</label>
                  <input
                    id="branch-phone"
                    placeholder="e.g. +91 99947 16471"
                    value={branchForm.phone}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, phone: e.target.value })
                    }
                  />
                </div>

                {/* City */}
                <div className="form-field">
                  <label htmlFor="branch-city">City</label>
                  <input
                    id="branch-city"
                    placeholder="Chennai"
                    value={branchForm.city}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, city: e.target.value })
                    }
                  />
                </div>

                {/* Amenities / Specs */}
                <div className="form-field full-width">
                  <label htmlFor="branch-specs">
                    Studio Features & Amenities (Comma Separated)
                  </label>
                  <textarea
                    id="branch-specs"
                    rows="3"
                    placeholder="e.g. 1,800 sq.ft Wooden Spring Floor, 4K Stage Lighting, Fully Air Conditioned, Free Parking"
                    value={branchForm.specs}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, specs: e.target.value })
                    }
                  />
                  <small className="field-hint">
                    Separate amenities with commas (e.g. Wooden Floor, Full AC, Changing Rooms).
                  </small>
                </div>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeBranchModal}
                  disabled={branchFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={branchFormLoading}
                >
                  {branchFormLoading
                    ? 'Saving...'
                    : editingBranchId
                    ? 'Update Branch'
                    : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK AGENDA VIEW MODAL */}
      {viewingAgendaEvent && (
        <div
          className="saas-modal-backdrop"
          onClick={() => setViewingAgendaEvent(null)}
        >
          <div
            className="saas-modal-window agenda-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h2>{viewingAgendaEvent.title}</h2>
                <p>📋 What Happens In This Workshop (Session Timeline)</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setViewingAgendaEvent(null)}
              >
                ✕
              </button>
            </div>

            <div className="agenda-preview-content">
              <div className="agenda-meta-row">
                <span>🎵 <strong>Song:</strong> {formatSongName(viewingAgendaEvent.song)}</span>
                <span>👤 <strong>Choreographer:</strong> {viewingAgendaEvent.instructor || 'Master Faculty'}</span>
                <span>⚡ <strong>Level:</strong> {viewingAgendaEvent.level || 'Beginner & Intermediate'}</span>
              </div>

              <div className="agenda-steps-list">
                {(viewingAgendaEvent.agenda || 'Session flow has not been added yet.')
                  .split('\n')
                  .filter((line) => line.trim())
                  .map((step, idx) => (
                    <div key={idx} className="agenda-step-card">
                      <span className="step-num">{idx + 1}</span>
                      <p>{step.replace(/^\d+[\.\)]\s*/, '')}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setViewingAgendaEvent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="modal-submit-btn"
                onClick={() => {
                  const ev = viewingAgendaEvent;
                  setViewingAgendaEvent(null);
                  openEditModal(ev);
                }}
              >
                ✏️ Edit This Workshop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
