# Interactive Weather Tool

This is a web application to show the statistics and visualizations of user uploaded weather file.
The source file is in .109 format which is usually used for climate analysis and energy simulation.
After loading the weather file from local drive, click buttons underneath to show information of the weather data, including:
  a) Climate summary
  A table showing monthly radiation value on different orientation, heating and cooling degree days and hours of the geo location where the data was collected.
  b) Hisogram
  Histogram chart showing the statistics of 37 different metrics (temperature, humidity, radiation, wind, etc.) plus the accumulative sum line.
  c) Field
  A pair of carpet and donut chart showing the same 37 metrics, user can choose which metric to probe with dropdown menus. 
  d) Natural Ventilation Potential
  A pair of carpet and donut chart showing natural ventilation related metrics (dry-bulb temperature and humidity ratio) to evaluate the natural ventilation potential of a certain climate, users can cutomize the thresholds.
  e) Wind Field Diagram
  A diagram consists of arrow matrix describing the wind characteristics through out all hours of a year for a certain climate.
  f) Psychrometric Chart
  Psychromatric chart plottintg key statistics of the air metrics for climate analysis and HVAC sizing.
  
  All charts above are interactive, users can filter data by different value threholds, metrics, time period and cutomize chart style and scales. 
  
  Potential future development:
    1) Add more types of charts
    2) Add more customization features
    3) Add tool tips for probing data points
    4) Add report templates to show multiple charts in one click
    5) Adding exporting functions to exort filtered data or graphics into other file formats (eg, csv, png etc.)
    
This application was developed using React Framework and D3.js library. 
