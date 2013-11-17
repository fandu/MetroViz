# Using Trip View

## Dependencies

1. d3
2. underscore

## Preliminary

To use calendar view in in html file, you must include the following lines
somewhere in the body of the page.

    <script type="text/javascript" src="./js/trip_view.js"></script>
    <div id="trip-container"></div>

and the following line in the head section.

    <link rel="stylesheet" type="text/css" href="./css/trip_view.css">

## API

### updateTripView

Displays a trip view of the data in the "#trip-container" div.

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