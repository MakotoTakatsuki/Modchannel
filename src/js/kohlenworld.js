/* kohlenworld.js -- Fancy world map for imageboards
 *
 * Copyright (C) 2022 Modchan
 *
 * This work is free. You can redistribute it and/or modify it under the
 * terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar.
 *
 * See https://modschan.org/int/map/COPYING.txt or http://www.wtfpl.net/ for more details.
 */

var link = '/addon.js/kc?feature=map'
var api_selection = ["H", "D"]
var current_api = 0;
var interval = 1;

function load(link) {
  var date = new Date();
  var suffix = '&' + Math.floor((date.getTime()) / 60000 * interval)
  console.log("----------------");
  console.log("Loading new coordinates: " + link + suffix);
  xmlhttp.open("GET", link + suffix, true);
  xmlhttp.send(null);
}

// Start after everything is loaded
document.addEventListener('DOMContentLoaded', function (){
  load(link);
  setInterval(
    function() {
      load(link);
    },
    60000 * interval
  );
}, false);

var data;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4) {
    if (this.status == 200) {
      data = JSON.parse(this.responseText);
      main(this.responseURL);
    } else {
      document.getElementsByTagName('body')[0].innerHTML = xhr.statusText;
    }
  }
}

var cluster_sources = new Array(api_selection.length);
var sortedTop = new Array(api_selection.length);
var topstr = new Array(api_selection.length);
var featuresArray = new Array(api_selection.length);
var clustergroup = new Array(api_selection.length);
var styleCache = new Array(api_selection.length);

var visibility = {'numbering': true, 'toplist': false}

// Helper function for simple buttons
function create_button(id, innerHTML, title) {
  var button = document.createElement('button');
  button.id = id;
  button.innerHTML = innerHTML;
  button.title= title;
  return button;
}

function zoom_onclick() {
  // Click $ball and center view around every occurance
  for (var i = 0; i < sortedTop[current_api].length; i++) {
    document.getElementById("b" + i).onclick = function(){
      var id = this.id.slice(1);
      var tmp = cluster_sources[current_api][id].getDistance();
      cluster_sources[current_api][id].setDistance(0);
      var extent = clustergroup[current_api][id].getSource().getExtent();
      map.getView().fit(extent, map.getSize());
      map.getView().setZoom(map.getView().getZoom()*0.925);
      cluster_sources[current_api][id].setDistance(tmp);
      console.log("User input: Jumped to ball type.");
    }
  }
}

// Custom on-screen controls
var my_controls = [
  function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    element.id = 'toplist';
    element.style = 'visibility: visible;';
    element.className = 'ol-control';
    element.innerHTML = '...';
    ol.control.Control.call(this, {
      element: element,
    });
  },
  function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    element.id = 'sliderControl';
    element.className = 'mycontrols ol-control';
    element.innerHTML = '<input title="Adjust clustering level" id="distance" type="range" min="0" max="99" step="11" value="22" class="slider"/>';
    element.ondblclick = function() {
      this.value = this.defaultValue;
    }
    // Update clustering by using the slider
    element.addEventListener('input', function() {
      if (distance.value == 0) {
        visibility['numbering'] = false;
      } else {
        visibility['numbering'] = true;
      }
      for (var i = 0; i < cluster_sources.length; i++) {
        for (x in cluster_sources[i]) {
          cluster_sources[i][x].setDistance(parseInt(distance.value, 10));
        }
      }
      console.log("User input: Clustering distance changed.");
    });
    ol.control.Control.call(this, {
      element: element,
    });
  },
  function(opt_options) {
    var options = opt_options || {};
    var buttons = new Array(3);
    buttons[0] = create_button('toplist_button', 'T', 'Toggle toplist');
    buttons[1] = create_button('export-png', 'S', 'Save as PNG');
    buttons[2] = create_button('api_button', '-', '-');

    buttons[0].addEventListener('click', function() {
      if (!visibility['toplist']) {
        document.getElementById('toplist').style = 'visibility: hidden;';
      }
      else {
        document.getElementById('toplist').style = 'visibility: visible;';
      }
      visibility['toplist'] = !visibility['toplist'];
      console.log("User input: Toplist visibility changed.");
    }, false);

    buttons[1].addEventListener('click', function() {
      map.once('postcompose', function(event) {
        const canvas = event.context.canvas;
        var name = 'map-' + api_selection[current_api] + '-' + (new Date).getTime().toString(16) + '.png';
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(canvas.msToBlob(), name);
        } else {
          canvas.toBlob(function(blob) {
            saveAs(blob, name);
          });
        }
      });
      map.renderSync();
    });

    buttons[2].addEventListener('click', function() {
      map.getLayers().clear();
      if (current_api == 0) {
        current_api = 1;
        this.innerHTML = 'D';
      } else {
        current_api = 0;
        this.innerHTML = 'H';
      }
      this.title = 'Last ' + api_selection[current_api];

      // Clear layers and add OSM + clustergroup
      map.getLayers().clear();
      map.addLayer(raster);
      for (var i = clustergroup[current_api].length - 1; i >= 0; i--)
        map.addLayer(clustergroup[current_api][i]);

      document.getElementById('toplist').innerHTML = topstr[current_api];
      zoom_onclick();
      console.log("User input: Map selection changed.");
    }, false);

    buttons[2].innerHTML = 'H';
    buttons[2].title = 'Last ' + api_selection[current_api];
    var element = document.createElement('div');
    for (var i = 0; i < buttons.length; i++)
      element.appendChild(buttons[i]);
    element.className = 'mycontrols ol-control';
    element.id = 'myButtons';

    ol.control.Control.call(this, {
      element: element,
    });
  },
];

// Inherit from OL-Control
for (c in my_controls)
  ol.inherits(my_controls[c], ol.control.Control);

// OpenStreetMaps
var raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

var map = new ol.Map({
  target: 'map',
  controls: ol.control.defaults({rotate: false}).extend([
    new my_controls[0],
    new my_controls[1],
    new my_controls[2],
    new ol.control.FullScreen(),
  ]),
  interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}),
  view: new ol.View({
    center: ol.proj.fromLonLat([13.0415646,47.6128115]),
    zoom: 2.75,
    maxZoom: 20,
    minZoom: 2
  })
});

// Main function
function main(url) {
  console.count("Initiating map generation sequence");
  console.groupCollapsed("Map");
  console.time("Overall completion time");
  for (let p = 0; p < api_selection.length; p++) {
    console.group(api_selection[p]);
    console.time("Completion time for item " + p);
    sortedTop[p] = (function f(hmap) {
      var result = [];
      for (var key in hmap)
        result.push([key, hmap[key]]);
      for (var i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      result.sort(function(a, b) {
        return b[1]-a[1];
      });
      return result;
    }(data[api_selection[p]].reduce(function (acc, curr) {
      acc[curr['c']] ? acc[curr['c']]++ : acc[curr['c']] = 1;
      return acc;
    }, {})));
    console.log("Reduced " + data[api_selection[p]].length + " balls to " + sortedTop[p].length + " types and sorted.");

    zuordnung = [];
    for (var i = 0; i < sortedTop[p].length; i++)
      zuordnung[sortedTop[p][i][0]] = i;
    featuresArray[p] = sortedTop[p].slice(0).map(function(a) {return new Array(0);});
    for (var i = 0; i < data[api_selection[p]].length; i++) {
      var faid = zuordnung[data[api_selection[p]][i]['c']];
      var feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([data[api_selection[p]][i]['lon'], data[api_selection[p]][i]['lat']])));
      var position = feature.getGeometry().getCoordinates();
      featuresArray[p][faid].push(feature);
    }
    console.log("Transformed all balls into OpenLayer features.");

    cluster_sources[p] = new Array(sortedTop[p].length);
    for (var i = 0; i < sortedTop[p].length; i++) {
      cluster_sources[p][i] = new ol.source.Cluster({
        source: new ol.source.Vector({
          features: featuresArray[p][i]
        }),
      });
    }

    clustergroup[p] = [];
    styleCache[p] = new Array(sortedTop[p].length);
    for (let i = 0; i < sortedTop[p].length; i++) {
      styleCache[p][i] = {};
      clustergroup[p].push(new ol.layer.Vector({
        source: cluster_sources[p][i],
        style: function(feature) {
          var size = feature.get('features').length;
          var style = styleCache[p][i][size];
          if (!style) {
            var mscale = 1.2;
            if (size == 1 || visibility['numbering'] == false)
              mscale = 0;
            style = new ol.style.Style({
              text: new ol.style.Text({
                text: size.toString(),
                scale: mscale,
                fill: new ol.style.Fill({
                  color: '#000',
                }),
                offsetY: -12,
                stroke: new ol.style.Stroke({
                  color: '#fff',
                  width: 2.5,
                }),
              }),
              image: new ol.style.Icon({
                src: '/.static/flags/' + sortedTop[p][i][0].toLowerCase() + '.png',
              }),
            });
            styleCache[p][i][size] = style;
          }
          return style;
        }
      }));
    }

    for (var i = 0; i < sortedTop[p].length; i++) {
      cluster_sources[p][i].setDistance(parseInt(document.getElementById('distance').value, 10));
    }

    console.log("Clustering ready.");

    topstr[p] = sortedTop[p].reduce(function (acc, curr, i) {
      return acc + '<span class="nowrap" id="' + 'b' + i + '">'
        + '<img class="zoom" src=\/\.static\/flags\/' + curr[0].toLowerCase() + '.png alt="(' + curr[0] + ')">'
        + (curr[1] != 1 ? '&#10005;' + curr[1] : '')
        + ((i != sortedTop[p].length - 1) ? '&nbsp;' : '')
        + '</span>';
    }, '');
    console.log("Toplist written.");

    console.timeEnd("Completion time for item " + p);
    console.groupEnd(api_selection[p]);
  }

  document.getElementById('toplist').innerHTML = topstr[current_api];
  zoom_onclick();

  // Clear layers and add OSM + clustergroup
  map.getLayers().clear();
  map.addLayer(raster);
  console.log("OSM layer added.")
  for (var i = clustergroup[current_api].length - 1; i >= 0; i--)
    map.addLayer(clustergroup[current_api][i]);
  console.log("Custom layers added.")
  console.timeEnd("Overall completion time");
  console.groupEnd("Map generation");
}
