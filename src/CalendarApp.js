import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

const CalendarApp = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventColor, setNewEventColor] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [colors] = useState(["#ff7f7f", "#ffd27f", "#7fff7f", "#7fdfff", "#d27fff", "#ff7fd2"]);

  // Load events from AsyncStorage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem("calendarEvents");
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents).map((event) => ({
            ...event,
            date: new Date(event.date),
          }));
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error("Failed to load events", error);
        Alert.alert("Error", "Could not load events");
      }
    };
    loadEvents();
  }, []);

  // Remove past events on app load
  useEffect(() => {
    removePastEvents();
  }, [events]);

  // Save events to AsyncStorage
  const saveEvents = async (updatedEvents) => {
    try {
      await AsyncStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
    } catch (error) {
      console.error("Failed to save events", error);
      Alert.alert("Error", "Could not save events");
    }
  };
  const addEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert("Error", "Event title is required");
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: newEventTitle,
      description: newEventDescription,
      date: selectedDate,
      color: newEventColor || "#7fdfff", // Default color
    };

    const updatedEvents = [...events, newEvent].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    // Reset modal state
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventColor("");
    setModalVisible(false);
  };

  const editEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert("Error", "Event title is required");
      return;
    }
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? { ...editingEvent, title: newEventTitle, description: newEventDescription, color: newEventColor || event.color }
        : event
    );
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setEditingEvent(null);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventColor("");
    setEditModalVisible(false);
  };

  const removePastEvents = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const filteredEvents = events.filter((event) => new Date(event.date).setHours(0, 0, 0, 0) >= today);
    if (filteredEvents.length !== events.length) {
      setEvents(filteredEvents);
      saveEvents(filteredEvents);
    }
  };

  const startEditing = (event) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description);
    setNewEventColor(event.color);
    setEditModalVisible(true);
  };
  const renderCalendar = () => {
    return (
      <View style={styles.calendar}>
        <Text style={styles.monthYear}>
          {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </Text>
        {/* Add your date rendering logic here */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar App</Text>
      {renderCalendar()}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Event Title"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description (Optional)"
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              style={styles.input}
              multiline
            />
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => setNewEventColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addEvent} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Event Title"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description (Optional)"
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              style={styles.input}
              multiline
            />
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => setNewEventColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={editEvent} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView>
        {events.map((event) => (
          <View key={event.id} style={[styles.eventItem, { borderLeftColor: event.color }]}>
            <View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {event.date.toLocaleDateString()} | {Math.ceil((event.date - new Date()) / (1000 * 60 * 60 * 24))} days left
              </Text>
            </View>
            <View style={styles.eventActions}>
              <TouchableOpacity onPress={() => startEditing(event)}>
                <Icon name="edit" size={20} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEvents(events.filter((e) => e.id !== event.id))}>
                <Icon name="trash-2" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Add relevant styles here
});
export default CalendarApp;