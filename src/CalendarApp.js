import React, { useState, useEffect } from "react";

const CalendarApp = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventColor, setNewEventColor] = useState("#7fdfff");
  const [editingEvent, setEditingEvent] = useState(null);
  const colors = ["#ff7f7f", "#ffd27f", "#7fff7f", "#7fdfff", "#d27fff", "#ff7fd2"];

  // Load events from localStorage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
    setEvents(storedEvents);
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEventTitle.trim()) return alert("Event title is required!");

    const newEvent = {
      id: Date.now(),
      title: newEventTitle,
      description: newEventDescription,
      date: selectedDate,
      color: newEventColor,
    };

    const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(updatedEvents);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventColor("#7fdfff");
  };

  const editEvent = () => {
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? { ...editingEvent, title: newEventTitle, description: newEventDescription, color: newEventColor }
        : event
    );

    setEvents(updatedEvents);
    setEditingEvent(null);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventColor("#7fdfff");
  };

  const removePastEvents = () => {
    const today = new Date().toISOString().split("T")[0];
    const filteredEvents = events.filter((event) => event.date >= today);
    setEvents(filteredEvents);
  };

  const startEditing = (event) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description);
    setNewEventColor(event.color);
  };

  const calculateDaysLeft = (eventDate) => {
    const diff = new Date(eventDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="calendar-app">
      <h1>Calendar App</h1>
      <div className="calendar">
        <label>Select Date: </label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="event-form">
        <input
          type="text"
          placeholder="Event Title"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (Optional)"
          value={newEventDescription}
          onChange={(e) => setNewEventDescription(e.target.value)}
        ></textarea>
        <div className="color-picker">
          {colors.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color, border: color === newEventColor ? "3px solid black" : "none" }}
              onClick={() => setNewEventColor(color)}
            ></button>
          ))}
        </div>
        <button onClick={editingEvent ? editEvent : addEvent}>
          {editingEvent ? "Save Changes" : "Add Event"}
        </button>
      </div>

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item" style={{ borderLeft: `5px solid ${event.color}` }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{event.date} - {calculateDaysLeft(event.date)} days left</p>
            <button onClick={() => startEditing(event)}>Edit</button>
            <button onClick={() => setEvents(events.filter((e) => e.id !== event.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarApp;
