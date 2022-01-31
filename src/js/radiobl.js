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


  var anchors = document.getElementsByClassName("navLinkSpan");

  if (anchors.length != 2)
    return;

  var topAnchor = anchors[0];
  var bottomAnchor = anchors[1];

  //Prepare BS
  var fulllinkContainer2 = document.createElement('a');
  var newtext2 = "";
  var newurl2 = "";
  fulllinkContainer2.id = 'radioboardlist2';
  newtext2 = "";
  newurl2 = "https://berndstroemt.modschan.org/";
  var fulllink2 = document.createTextNode(newtext2);
  fulllinkContainer2.setAttribute('href', newurl2);
  fulllinkContainer2.setAttribute('target', "_blank");
  fulllinkContainer2.appendChild(fulllink2);
  var link_bs_top = fulllinkContainer2;
  var link_bs_bottom = fulllinkContainer2.cloneNode(true);
  topAnchor.parentNode.insertBefore(link_bs_top, topAnchor.nextSibling);
  bottomAnchor.parentNode.insertBefore(link_bs_bottom, bottomAnchor.nextSibling);
  var url2 = "/berndstroemt-api";
  var filename2;
  var username2;
  var artist2;
  var title2;
  var alttext2;
  var linkhtml2 = link_bs_top.innerHTML;

  var interval;

  //Setup BS
  var image_dom_bs_top = document.createElement("img");
  //image_dom_bs_top.setAttribute('id', 'radioimg_bs');
  image_dom_bs_top.setAttribute('style', 'vertical-align: sub;');
  var image_dom_bs_bottom = image_dom_bs_top.cloneNode(true);

  var span_dom_bs_top = document.createElement("span");
  span_dom_bs_top.innerHTML = "LIVE";
  //span_dom_bs_top.setAttribute('id', 'radiospan_bs');
  span_dom_bs_top.setAttribute('class', 'radiospan');
  span_dom_bs_top.setAttribute('style', 'color:white;text-decoration: none;display: inline-block;background-color:#d10000;padding-left: 4px;padding-right: 4px;margin-left: 5px;border-radius: 10px')
  var span_dom_bs_bottom = span_dom_bs_top.cloneNode(true);
  span_dom_bs_top.appendChild(image_dom_bs_top);
  span_dom_bs_bottom.appendChild(image_dom_bs_bottom);

  setupRadioBs();
  updateRadioBs();
  interval = setInterval(updateRadioBs, 60000);

  function setupRadioBs() {
    link_bs_top.appendChild(span_dom_bs_top);
    link_bs_top.setAttribute('style', "display:none");
    link_bs_bottom.appendChild(span_dom_bs_bottom);
    link_bs_bottom.setAttribute('style', "display:none");
  }


  function updateRadioBs(){
    getJSON(url2, function(err, data) {
      if (err !== null) {
        console.log("Error: "+ err);
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

          image_dom_bs_top.setAttribute('title', username2);
          image_dom_bs_top.setAttribute('src', '/.static/flags/' + filename2);
          image_dom_bs_bottom.setAttribute('title', username2);
          image_dom_bs_bottom.setAttribute('src', '/.static/flags/' + filename2);

          link_bs_top.setAttribute('title', alttext2);
          link_bs_top.setAttribute('style', '');
          link_bs_bottom.setAttribute('title', alttext2);
          link_bs_bottom.setAttribute('style', '');
        } else {
          link_bs_top.setAttribute('style', 'display:none');
          link_bs_top.setAttribute('title', 'not on air');
          link_bs_bottom.setAttribute('style', 'display:none');
          link_bs_bottom.setAttribute('title', 'not on air');
        }

      }
    });
  }

});
