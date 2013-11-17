# Using Calendar View

## Dependencies

1. d3

## Preliminary

To use calendar view in in html file, you must include the following lines
somewhere in the body of the page.

    <script type="text/javascript" src="./js/calendar_view.js"></script>
    <div id="calendar-container"></div>

and the following line in the head section.

    <link rel="stylesheet" type="text/css" href="./css/calendar_view.css">

## API

### displayCalendar

Displays a calendar view of the data in the "#calendar-container" div.

#### arguments

##### data

A list of objects with the following fields:

* _route_ (string): route name
* _date_ (Date): javascript Date object to get the day, month, and year of the data point.
* _trip_ (string): trip id (should be unique for each route and day)
* _stop_ (string): stop name
* _scheduled_ (int): ideal minute of arrival relative to the ideal start time of the trip
* _scheduled_ (int): actual minute of arrival relative to the ideal start time of the trip
* _passengers_ (int): number of passengers who boarded

##### subviewUpdate

A callback that expects a data in the same format as __displayCalendar__'s data argument, and updates the route, trip, etc... view when the user clicks on a day in the calendar view.