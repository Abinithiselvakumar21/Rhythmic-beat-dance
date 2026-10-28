
import { useEffect, useState } from 'react';
import './AdminDashboard.css';

const API = 'http://localhost:5000/api/events';
const UPLOAD_API = 'http://localhost:5000/api/upload';
const SERVER = 'http://localhost:5000';

const emptyForm = {
  title: '',
  description: '',
  status: 'Upcoming',
  slots: 20,
  prize: '',
  date: '',
  time: '',
  image: '',
  song: ''
};

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [songFile, setSongFile] = useState(null);

  const [form, setForm] = useState(emptyForm);

  async function loadEvents() {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Unable to load events');
      }

      setEvents(data);
    } catch {
      setMessage('Not Events load .Check a backend running process.');
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function uploadFile(file, kind, token) {
    const formData = new FormData();

    // kind-ai file-ku munnaadi append pannanum
    formData.append('kind', kind);
    formData.append('file', file);

    const response = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `${kind} upload failed`);
    }

    return data.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = sessionStorage.getItem('adminToken');

    if (!token) {
      setMessage('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    try {
      let image = form.image || '';
      let song = form.song || '';

      if (imageFile) {
        setMessage('Uploading event image...');
        image = await uploadFile(imageFile, 'image', token);
      }

      if (songFile) {
        setMessage('Uploading event song...');
        song = await uploadFile(songFile, 'song', token);
      }

      setMessage('Saving event details...');

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...form,
            image,
            song,
            slots: Number(form.slots)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save event');
      }

      setMessage(editingId ? 'Event updated successfully!' : 'Event created successfully!');
      setForm({ ...emptyForm });
      setEditingId(null);
      setImageFile(null);
      setSongFile(null);

      const imageInput = document.getElementById('event-image');
      const songInput = document.getElementById('event-song');

      if (imageInput) imageInput.value = '';
      if (songInput) songInput.value = '';

      await loadEvents();
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(event) {
    setForm({
      title: event.title || '',
      description: event.description || '',
      status: event.status || 'Upcoming',
      slots: event.slots ?? 20,
      prize: event.prize || '',
      date: event.date || '',
      time: event.time || '',
      image: event.image || '',
      song: event.song || ''
    });

    setImageFile(null);
    setSongFile(null);

    const imageInput = document.getElementById('event-image');
    const songInput = document.getElementById('event-song');

    if (imageInput) imageInput.value = '';
    if (songInput) songInput.value = '';

    setEditingId(event._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setSongFile(null);
    setMessage('');

    const imageInput = document.getElementById('event-image');
    const songInput = document.getElementById('event-song');

    if (imageInput) imageInput.value = '';
    if (songInput) songInput.value = '';
  }

  async function deleteEvent(id) {
if (
  !window.confirm(
    'Are you sure you want to delete this event? '
  )
) return;
    const token = sessionStorage.getItem('adminToken');

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setMessage('Event deleted successfully!');
      await loadEvents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin';
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">RHYTHMIC DANCE COURT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage your dance events in one place.</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Log Out
        </button>
      </header>

      <section className="dashboard-panel">
        <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>

        <form className="event-form" onSubmit={handleSubmit}>
          <label>
            Event Title *
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Solo Dance Battle"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows="3"
            />
          </label>

          <div className="dashboard-form-grid">
            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Completed</option>
              </select>
            </label>

            <label>
              Available Slots
              <input
                name="slots"
                type="number"
                min="0"
                value={form.slots}
                onChange={handleChange}
              />
            </label>

            <label>
              Prize
              <input
                name="prize"
                value={form.prize}
                onChange={handleChange}
                placeholder="e.g. ₹5,000"
              />
            </label>

            <label>
              Event Date
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>

            <label>
              Event Time
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
              />
            </label>
         

          <label>
            Event Image (JPG, PNG, WEBP — max 15 MB)
            <input
              id="event-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>

          {form.image && (
            <div className="upload-preview">
              <p>Current event image:</p>
              <img
                src={`${SERVER}${form.image}`}
                alt="Current event"
                style={{
                 display: 'block',
  width: '100%',
  maxWidth: '400px',
  height: 'auto',
  maxHeight: '400px',
  objectFit: 'contain',
  objectPosition: 'center top',
  borderRadius: '10px'
                }}
              />
            </div>
          )}

          {imageFile && <p>Selected image: {imageFile.name}</p>}

          <label>
            Event Song (MP3, WAV, OGG or supported audio — max 15 MB)
            <input
              id="event-song"
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
              onChange={(e) => setSongFile(e.target.files?.[0] || null)}
            />
          </label>
           </div>

          {form.song && (
            <div className="upload-preview">
              <p>Current event song:</p>
              <audio controls src={`${SERVER}${form.song}`}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {songFile && (
            <p>Selected song: {songFile.name}</p>
          )}

          <p className="dashboard-message">
            Select a new file only if you want to replace the existing image or song.
          </p>

          <div className="dashboard-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : editingId
                  ? 'Update Event'
                  : 'Create Event'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="dashboard-message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="events-heading">
          <h2>Your Events</h2>
          <button className="refresh-button" onClick={loadEvents}>
            Refresh
          </button>
        </div>

        {events.length === 0 ? (
          <p>No events yet. Create your first event above!</p>
        ) : (
          <div className="admin-event-list">
            {events.map((event) => (
              <article className="admin-event-card" key={event._id}>
                <div>
                  <span className="event-status">{event.status}</span>
                  <h3>{event.title}</h3>

                  {event.image && (
                    <img
                      src={`${SERVER}${event.image}`}
                      alt={event.title}
                      style={{
                        width: '100%',
                        maxWidth: '260px',
                        maxHeight: '180px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        margin: '10px 0'
                      }}
                    />
                  )}

                  <p>{event.description}</p>
                  <p>
                    {event.date || 'Date not set'}
                    {event.time ? ` · ${event.time}` : ''}
                  </p>
                  <p>
                    Slots: {event.slots} · Prize: {event.prize || 'Not set'}
                  </p>

                  {event.song && (
                    <div>
                      <p>Event song</p>
                      <audio controls src={`${SERVER}${event.song}`}>
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </div>

                <div className="event-card-actions">
                  <button onClick={() => startEdit(event)}>Edit</button>
                  <button
                    className="delete-button"
                    onClick={() => deleteEvent(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
