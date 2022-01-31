document.addEventListener("DOMContentLoaded", function(event) {

  var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function() {
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
          aCallback(anHttpRequest.responseText);
      }

      anHttpRequest.open( "GET", aUrl, true );
      anHttpRequest.send( null );
    }
  }

  var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  };

  var link1 = document.getElementById("radiolink1");
  var url1 = "/krautradio-api";
  var interval1;
  var filename1;
  var username1;
  var artist1;
  var title1;
  var alttext1;
  var linkhtml1 = link1.innerHTML;

  //setupRadioRfk();
  //updateRadioRfk();
  //interval = setInterval(updateRadioRfk, 60000);

  var link2 = document.getElementById("radiolink2");
  var url2 = "/berndstroemt-api";
  var interval2;
  var filename2;
  var username2;
  var artist2;
  var title2;
  var alttext2;
  var linkhtml2 = link2.innerHTML;

  setupRadioBerndstroemt();
  updateRadioBerndstroemt();
  interval = setInterval(updateRadioBerndstroemt, 60000);


  function setupRadioRfk() {
    var image_dom_rfk = document.createElement("img")
    image_dom_rfk.setAttribute('id', 'radioimg_sb_rfk')
    //image_dom_rfk.setAttribute('title', username1)
    //image_dom_rfk.setAttribute('src', '/.static/flags/' + filename1)
    image_dom_rfk.setAttribute('style', 'vertical-align: sub;')

    var span_dom_rfk = document.createElement("span")
    span_dom_rfk.setAttribute('id', 'radiospan_sb_rfk')
    span_dom_rfk.innerHTML = "&ensp;ON AIR&ensp;"
    span_dom_rfk.setAttribute('style', 'color:red;text-decoration: none;display: none;')
    span_dom_rfk.appendChild(image_dom_rfk)

    link1.appendChild(span_dom_rfk)

  }


  function updateRadioRfk(){
    getJSON(url1, function(err, data) {
      if (err !== null) {
        console.log("Error: "+ err);
      } else {
        if(typeof data.data.show != "undefined") {
          filename1 = data.data.show.user.countryball;
          username1 = data.data.show.user.names;
          if(typeof data.data.track != "undefined") {
            artist1 = data.data.track.artist;
            title1 = data.data.track.title;
          }else{
            artist1 = "";
            title1 = "";
          }
          alttext1 = username1 + ": "+artist1+" - "+title1;

          var image_dom = document.getElementById("radioimg_sb_rfk")
          var span_dom = document.getElementById("radiospan_sb_rfk")
          image_dom.setAttribute('title', username1)
          image_dom.setAttribute('src', '/.static/flags/' + filename1)

          link1.setAttribute('title', alttext1);
          span_dom.setAttribute('style', 'color:red;text-decoration: none;display: inline-block;');

        } else {
          var span_dom = document.getElementById("radiospan_sb_rfk")
          span_dom.setAttribute('style', 'display:none');
          link1.setAttribute('title', 'not on air');
        }

      }
    });
  }


  function setupRadioBerndstroemt() {
    var image_dom_bs = document.createElement("img")
    image_dom_bs.setAttribute('id', 'radioimg_sb_bs')
    //image_dom_bs.setAttribute('title', username2)
    //image_dom_bs.setAttribute('src', '/.static/flags/' + filename2)
    image_dom_bs.setAttribute('style', 'vertical-align: sub;')

    var span_dom_bs = document.createElement("span")
    span_dom_bs.setAttribute('id', 'radiospan_sb_bs')
    span_dom_bs.innerHTML = "&ensp;ON AIR&ensp;"
    span_dom_bs.setAttribute('style', 'color:red;text-decoration: none;display: none;')
    span_dom_bs.appendChild(image_dom_bs)

    link2.appendChild(span_dom_bs)
  }


  function updateRadioBerndstroemt(){
    getJSON(url2, function(err, data) {
      if (err !== null) {
        console.log("Error: " + err);
      } else {
        if(data.on_air == true) {
          filename2 = data.caster_country_code + ".png";
          username2 = data.caster_name;
          if(typeof data.current_artist != "undefined") {
            artist2 = data.current_artist;
            title2 = data.current_title;
          }else{
            artist2 = "";
            title2 = "";
          }
          alttext2 = username2 + ": "+artist2+" - "+title2;

          var image_dom = document.getElementById("radioimg_sb_bs")
          var span_dom = document.getElementById("radiospan_sb_bs")

          image_dom.setAttribute('title', username2)
          image_dom.setAttribute('src', '/.static/flags/' + filename2)

          link2.setAttribute('title', alttext2);
          span_dom.setAttribute('style', 'color:red;text-decoration: none;display: inline-block;');
        } else {
          var span_dom = document.getElementById("radiospan_sb_bs")
          span_dom.setAttribute('style', 'display:none');
          link2.setAttribute('title', 'not on air');
        }

      }
    });
  }

});
