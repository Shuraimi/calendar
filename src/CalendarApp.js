import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
    return savedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure sorted order
  });
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventColor, setEventColor] = useState('#007acc'); // Default color
  const [editingEvent, setEditingEvent] = useState(null); // Event currently being edited

  const colorOptions = ['#007acc', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];

  // Save events to localStorage whenever the events array changes
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!eventTitle.trim()) {
      alert('Event title cannot be empty!');
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      title: eventTitle,
      description: eventDescription,
      date: selectedDate.toISOString(),
      color: eventColor,
    };

    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === editingEvent.id ? newEvent : event))
      );
      setEditingEvent(null);
    } else {
      setEvents([...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
    }

    setEventTitle('');
    setEventDescription('');
    setEventColor('#007acc'); // Reset to default color
  };

  const startEditingEvent = (event) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventColor(event.color);
    setSelectedDate(new Date(event.date));
  };

  const deleteEvent = (id) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
  };

  const calculateDaysLeft = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const differenceInTime = eventDate - today;

    return Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="app-container">
      <h1 className="app-heading">Calendar App</h1>
      <div className="calendar-container">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => {
            const event = events.find(
              (e) => new Date(e.date).toDateString() === date.toDateString()
            );

            if (event) {
              return `highlight-${event.color.replace('#', '')}`;
            }

            if (date.toDateString() === new Date().toDateString()) {
              return 'current-date';
            }

            return null;
          }}
        />
      </div>
      <div className="event-form">
        <input
          type="text"
          placeholder="Event Title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
        />
        <textarea
          placeholder="Event Description"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
        />
        <div className="color-picker">
          {colorOptions.map((color) => (
            <div
              key={color}
              className={`color-box ${eventColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setEventColor(color)}
            />
          ))}
        </div>
        <button onClick={addEvent}>{editingEvent ? 'Save Changes' : 'Add Event'}</button>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className={`event-item ${event.date === new Date().toLocaleDateString() ? 'today' : ''}`} style={{ borderColor: event.color }}>
            <div>
              <h3 style={{ color: event.color }}>{event.title}</h3>
              <p>{event.description}</p>
              <p className="event-date">
                Date: {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="event-date">
                Days Left: {calculateDaysLeft(event.date)} days
              </p>
            </div>
            <div className="event-actions">
              <button className="edit-button" onClick={() => startEditingEvent(event)}>Edit</button>
              <button className="delete-button" onClick={() => deleteEvent(event.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
