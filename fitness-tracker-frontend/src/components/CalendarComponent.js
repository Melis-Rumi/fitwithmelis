// CalendarComponent.js
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styles
import './CustomCalendar.css'; // Your custom styles

const CalendarComponent = () => {
  const [date, setDate] = React.useState(new Date());

  return (
    <div>
      <h2 className="text-center">Select a Date</h2>
      <Calendar
        value={date}
        onChange={setDate}
      />
    </div>
  );
};

export default CalendarComponent;