//////////////////////////////////////////////////////////////////
// Control look and function of photos, slider, table, and charts
//////////////////////////////////////////////////////////////////
'use strict';
// Contain all your functionality in a self calling anonymous function, so that you don't clutter the global namespase.
//(function() {
$(document).ready(function() {

///////// CAROUSEL (for small screens) //////////
function showthings(which, direction){
  if (which=='dryfood'){var next='wetfood';var last='photos';}
  if (which=='wetfood'){var next='photos';var last='dryfood';}
  if (which=='photos'){var next='dryfood';var last='wetfood';}
  var offset='200%';
// make sure objects and lists are in appropriate left positions
  $('li.'+next+', .object.'+next).css('left',offset);
  $('li.'+last+', .object.'+last).css('left','-'+offset);
  $('li.'+which+', .object.'+which).css('left',0);
// set vars for which class of element to show next and which direction to move it
  if (direction=='right'){var amt='-'+offset;var replacer=next;var uninvolved=last;}
  if (direction=='left'){var amt=offset;var replacer=last;var uninvolved=next;}
// set uninvolved display properties to none so they don't take up vertical space
  $('li.'+uninvolved+', .object.'+uninvolved).css('display','none');
// move the current ones in the specified direction off the screen
  $('li.'+which+', .object.'+which).animate({left: amt}), 500;
// move the upcoming ones in from the correct direction onto the screen
  setTimeout(function(){$('li.'+replacer+', .object.'+replacer).css('display','inline-block').animate({left:0}), 600},200);
// squish things when other things should be visible
  if (replacer=='photos'){$('.charts').css('height',0);}else{$('.charts').css('height','100%')};
  if (replacer=='wetfood'){$('#dryfood').css('display','none')}else{$('#dryfood').css('display','inline-block')};
}

function smallscreen(windowwidth, windowheight){
// make room above the main div for the carousel
  $('.maindiv').css('height',windowheight-100).css('margin-top','100px').css('width','100%');
  $('#photoslider').css('height',windowheight-100);
// set max image height
  $('img').css('max-height',0.95*(windowheight-100));
// show correct object based on which list item is currently visible
  if ($('li.dryfood').css('display')!='none' & $('li.dryfood').css('left')=='0px') {
    $('.wetfood, .photos').css('display','none');
  }
  if ($('li.wetfood').css('display')!='none' & $('li.wetfood').css('left')=='0px') {
    $('.dryfood, .photos').css('display','none');
  }
  if ($('li.photos').css('display')!='none' & $('li.photos').css('left')=='0px') {
    $('.charts').css('height',0);$('.dryfood, .wetfood').css('display','none');
  }
}

// if right/left carousel arrows/words are clicked or swiped, do function to scroll appropriately through list items and objects
  $('li>i.fa-arrow-right, .next').click(function(){
    var which = $(this).parent().attr('class');
    showthings(which,'right');
  });
  $('li>i.fa-arrow-left, .last').click(function(){
    var which = $(this).parent().attr('class');
    showthings(which,'left');
  });
  $('li>i.fa-arrow-right, .next').touchwipe({
    wipeLeft: function() { 
      var which = $('li').filter(function() {return $(this).css('left') == '0px';}).attr('class');
      showthings(which,'right');
    },
    min_move_x: 20,min_move_y: 20,preventDefaultEvents: true
  });
  $('li>i.fa-arrow-left, .last').touchwipe({
    wipeRight: function() { 
      var which = $('li').filter(function() {return $(this).css('left') == '0px';}).attr('class');
      showthings(which,'left');
    },
    min_move_x: 20,min_move_y: 20,preventDefaultEvents: true
  });

///////// DIMENSIONS //////////
// change height of main div to accomodate carousel slider when screen is small and trigger carousel fxn
  function maindiv(){
    var windowwidth=window.innerWidth || 
    document.documentElement.clientWidth || 
    document.body.clientWidth;
    var windowheight=$(window).height();
    var keyheight = document.getElementById('key').offsetHeight;
    var photosliderwidth = document.getElementById('photoslider').offsetWidth;
    var photosliderheight = document.getElementById('photoslider').offsetHeight;
    if (windowwidth<600) {
      smallscreen(windowwidth, windowheight);
    } else {
      if (windowheight<500){
        $('img').css('max-height',500);
        $('body').css('overflow-y','auto');
      } else {
        $('.maindiv').css('height','100%').css('margin-top',0).css('width','100%');
        $('.charts').css('height','100%')
        $('#dryfood, #wetfood, #photoslider').css('display','inline-block').css('left',0);
        $('#photoslider').css('height',windowheight-keyheight);
        $('body').css('overflow-y','hidden');
      }
    }
    return [windowwidth, windowheight, photosliderwidth, photosliderheight]; 
  }
  $(window).on('resize', maindiv);
  maindiv(); 


///////// SET UP FOR CHARTS ///////////
// format date
  var dtgFormat = d3.time.format("%m/%d/%y");

// Create the dc.js chart objects & link to div
  var dryfood = dc.lineChart("#dryfood");
  var wetfood = dc.lineChart("#wetfood");
  //var key = d3.select("#key");
  //var charts = $('#charts');

// Define dimensions and margins for charts
  function getdims() {
    var windowwidth=window.innerWidth || 
    document.documentElement.clientWidth || 
    document.body.clientWidth;
    if (windowwidth<600){var divisor=1;var overallwidth = $('.maindiv').width();}
    else{var divisor=2;var overallwidth = $('.maindiv').width()*0.5;}
    var margin = {top: 10, right: -30, bottom: 20, left: 0},
    width =  overallwidth - margin.left - margin.right,
    height = ($('.maindiv').height() - divisor*margin.top - divisor*margin.bottom)/divisor;
    return [width,height];
  }


//////////////// DATA AND CHARTS ////////////////
// load data from csv file
  d3.csv("../d3pogodata.csv", function(data) {

  // determine number of pixels on date scrollbar that correspond to a day based on number of dates in data (only changes when data are updated)  
    var counts = 0;
    var startdate;
    var enddate;
    data.forEach(function(d) { 
      counts +=1
      d.date   = dtgFormat.parse(d.date);
      d.dry   = +d.dry;
      d.wet  = +d.wet;
      if (counts == 1){startdate=d.date;}
      enddate=d.date;
      return {counts:counts, startdate:startdate, enddate:enddate};
    })
    function dailypixels() {
      return ($('#datescrollbar').width()-3)/counts; // -3 so it will refer to middle of handle
    }

  // SET START CONDITIONS
    datecascade(getdate(0));

//------- PHOTO SLIDER -----------//
  // set vars
    var lastImage = 96;         // How many images do you have?

  // Images in path named 1.jpg, 2.jpg etc.
    function showpix(index,auto) {
      // Check what the play button says
      var status=document.getElementsByClassName('playslides')[0].innerHTML;
      // If it says play, but we are on auto (auto==1); don't do anything. This means 'stop' was clicked
      if (status=='Play' & auto==1){return;}
      // Otherwise, continue
      else {
        var url = '../images/slides/'+ index + '.jpg';
      // Add new image behind current image, set opacity appropriately, then remove all but new image
        $('#photoslider').prepend($('<img/>').attr('src',url));
        $('#photoslider img:first-child').css('opacity',1);
        $('#photoslider img:last').css('opacity',0);
        $('img:first-child ~ img').remove(); //remove extra photos (if handle was dragged)
      // If we are on auto: move handle, change selected info, highlight dots to match photo, wait for photo to load
      // Then initiate showing next picture
        if (status=='Stop' & auto==1) {
          getvals(getdate((index-1 % lastImage)*dailypixels()));
          highlightdots(dtgFormat.parse(getdate((index-1 % lastImage)*dailypixels())));
          $('#handle').css('margin-left',(index-1 % lastImage)*dailypixels());
          setTimeout(function() {showpix((index % lastImage) + 1,1);}, 1500);
        } 
      }
    };  

  // If play slideshow button is clicked, run through slides starting wherever we are
    $('.playslides').click(function(){
      var whichpic = ~~$('img').attr('src').substring(17).replace('.jpg','')+1;
      var status=document.getElementsByClassName('playslides')[0];
      if (status.innerHTML=='Play'){
        status.innerHTML='Stop';
        status.style.backgroundColor='#ff5c33';
        showpix(whichpic,1);
      }
      else {status.innerHTML='Play';status.style.backgroundColor='#00cc44'}
    });  

  // Swiping/clicking through photos
    function photo_scroll(step){
      var index = ~~$('img').attr('src').substring(17).replace('.jpg','');
      if ((index>1 & step==-2) | (index<lastImage & step==0)) { // no modular image scrolling 
        showpix(index+step+1);
        getvals(getdate((index+step)*dailypixels()));
        highlightdots(dtgFormat.parse(getdate((index+step)*dailypixels())));
        $('#handle').css('margin-left',(index+step)*dailypixels());
      }
    }
    $('.photosright').touchwipe({
      wipeLeft: function() { photo_scroll(0);},
      min_move_x: 20,min_move_y: 20,preventDefaultEvents: true
    });
    $('.photosleft').touchwipe({
      wipeRight: function() { photo_scroll(-2);},
      min_move_x: 20,min_move_y: 20,preventDefaultEvents: true
    });
    $('.photosright').click(function(){photo_scroll(0);})
    $('.photosleft').click(function(){photo_scroll(-2);})
      


//------------ SLIDER/HANDLE/CHART HIGHLIGHTING -------------//
  // f(date): get both wet and dry values for a given date and announce it in the "selected" area
    function getvals(selected) { // takes a value of date formatted like "11/30/16"
      var date = selected;
      data.forEach(function(x) {
        x.date = x.date;
        if (dtgFormat(x.date) == date) {
          var thisdry = x.dry;
          var thiswet = x.wet;
          $('.selected').text(" " + date + " - " + thisdry + "T, " + thiswet + "Oz");
        }
      });
    };

  // f(mouse position): move handle to a daily-unit along scrollbar approximating mouse position when scrollbar is clicked  
    function getleft(n) {return Math.round(n / dailypixels()) * dailypixels();}
    
  // f(mouse position): determine num days since start date that correspond with mouse position, return that date
    function getdate(x) {
      var startdate=dtgFormat.parse("11/24/16");
      var numdays = x/dailypixels();
      Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
      }
      return dtgFormat(startdate.addDays(numdays));
    }

  // move handle based on click position on date scrollbar/arrows
    var maxright = $("#datescrollbar").width()-5; // -5 to go to middle of handle - border
    function whereami() {
      var location = event.pageX - $("#datescrollbar").offset().left-3; // so it goes to middle of handle
      if (location<0) {var location=0};
      if (location>maxright) {var location=maxright};
      return location;
    } 
    function gethandle() {return $('#handle').offset().left - $("#datescrollbar").offset().left;}
  // special whereami touch function for mobile version of handle click-and-drag 
    var whereami2 = function(e){
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      var location = touch.pageX - $("#datescrollbar").offset().left-3; // so it goes to middle of handle
      if (location<0) {var location=0};
      if (location>maxright) {var location=maxright};
      return location;
    };

  //if the scroll bar is clicked, move handle to closest daily-pixels unit by mouse position
    $("#datescrollbar").click(function() {
        $('#handle').css('margin-left',getleft(whereami()));
    });
  //if the left scroller is clicked and there is room to go down, move handle from its current position down one day
    $("#leftscroller").click(function() {
      if (gethandle() >=dailypixels()) {$('#handle').css('margin-left',getleft(gethandle() - 2*dailypixels()));}
      //if (gethandle() >=dailypixels()) {$('#handle').css('margin-left',getleft(gethandle() - dailypixels()));}
    });    
  //if the right scroller is clicked and there is room to go up, move handle from its current position up one day
    $("#rightscroller").click(function() {
      //if (gethandle() <= maxright) {$('#handle').css('margin-left',getleft(gethandle() + dailypixels()));}
      if (gethandle() <= maxright) {$('#handle').css('margin-left',getleft(gethandle()));} 
    });
  // report date and show divs etc based on where handle now is    
    $('#scrollability').click(function(){datecascade(getdate(gethandle()));});

  // handle click-and-drag functionality
    var clicking = false;
    $('#datescrollbar').mousedown(function(){clicking = true;});
    $(document).mouseup(function(){clicking = false;})
    $('#datescrollbar').mousemove(function(){
    // hoverover - show date in hover field
      if (clicking==false) {
        $('.hovered').text(" "+getdate(getleft(whereami())));
        $('#datescrollbar').mouseout(function() {
          $('.hovered').text("");
        });
    // clicked - move handle with mouse, show date in hover field, date and data in selected filed, appropriate photo for date
      } else {
        $('#handle').css('margin-left',getleft(whereami())); 
        $('.hovered').text(" "+getdate(getleft(whereami())));
        datecascade(getdate(getleft(whereami())));
      }
    });

   // mobile version of handle click-and-drag functionality
    $('#datescrollbar').on('touchmove', function(e){
      $('#handle').css('margin-left',getleft(whereami2(e))); 
      datecascade(getdate(getleft(whereami2(e))));
    }); 

  // f(dates): set where handle should be positioned based on date selection in charts
    function treatAsUTC(date) {
      var result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }
    function daysBetween(startDate, endDate) {
      var millisecondsPerDay = 24 * 60 * 60 * 1000;
      return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
    }
    function sethandle(date) {$('#handle').css('margin-left',daysBetween("11/24/16",date) * dailypixels());}

  // f(date): highlight appropriate dots when handle moves or dots are clicked
    function highlightdots(date) {
      var thisdate=date;
      wetfood.selectAll('circle.dot').attr('r',smar).style('fill-opacity', 0.4).style('stroke-opacity', 0.4).attr('fill',nohl).attr('clicked','no');
      dryfood.selectAll('circle.dot').attr('r',smar).style('fill-opacity', 0.4).style('stroke-opacity', 0.4).attr('fill',nohl).attr('clicked','no');
      wetfood.selectAll('circle.dot').filter(function(d) { return d.data.key.getTime() === thisdate.getTime(); }).attr('r',bigr).attr('fill',hl).style('fill-opacity', 1).style('stroke-opacity', 1).attr('clicked','yes');
      dryfood.selectAll('circle.dot').filter(function(d) { return d.data.key.getTime() === thisdate.getTime(); }).attr('r',bigr).attr('fill',hl).style('fill-opacity', 1).style('stroke-opacity', 1).attr('clicked','yes'); 
    }

  // f(date): show picture, getvals and highlight dots when a given date is selected on date scrollbar
    function datecascade(selected) {
      var whichpic=daysBetween("11/24/16",selected)+1;
      showpix(whichpic);
      getvals(selected);
      highlightdots(dtgFormat.parse(selected)); 
    }

  // functions for highlighting charts on touch
    //var touchScale = d3.scale.linear().domain([0,getdims()[2]]).range([0,data.length-1]).clamp(true);
    function getxpositions(type){
      var start = type.selectAll('circle.dot').filter(function(d) { return d.data.key.getTime() === dtgFormat.parse('11/24/16').getTime();}).attr('cx');
      var end = type.selectAll('circle.dot').filter(function(d) { return d.data.key.getTime() === dtgFormat.parse('02/27/17').getTime();}).attr('cx');
      return [start,end];
    }
    function datecascade2(date){
      highlightdots(date);
      sethandle(dtgFormat(date));
      getvals(dtgFormat(date));
      showpix(daysBetween("11/24/16",date)+1);
    }


//------------ MAKE CHARTS -------------//
  // set vars about dots and margins  
    var off=30; //offset to account for margins? 
  // vars to specify circle.dot radius and color when hovered/selected vs not 
    var smar=3.5;
    var bigr=7;
    var nohl='steelblue';
    var hl='red'; // this is not working - superceded by dc.css

// Run the data through crossfilter and load 'facts'
  var facts = crossfilter(data);

// Line charts by day
  var byday = facts.dimension(function(d) {return d.date;});
  var drygroup = byday.group().reduceSum(function(d) { return d.dry; });
  var wetgroup = byday.group().reduceSum(function(d) { return d.wet; });

// function to specify charts' interactivity
  function interactivity(chart) {
    chart.svg().select('.chart-body').attr('clip-path',null);
    chart.svg().selectAll('circle.dot')
      .attr('r',smar).style('fill-opacity',0.4).style('stroke-opacity',0.4)
      .on('mousemove',function(d){
        d3.select(this).style('fill-opacity', 1).style('stroke-opacity', 1).attr('r',bigr).attr('fill',hl);
        d3.select("#key").select('.hovered').text(" " + dtgFormat(d.data.key) + ' - ' + d.data.value + 'T');
      })
      .on('click', function(d) {datecascade2(d.data.key);})
      .on('mouseout', function(){
        var dot=d3.select(this);
        if (dot.attr('clicked') != 'yes') {dot.style('fill-opacity', 0.4).style('stroke-opacity', 0.4).attr('r',smar).attr('fill',nohl);}
        d3.select("#key").select('.hovered').text("");
      })
    chart.svg()
      .on('touchstart', function(){var xPos = d3.touches(this)[0][0];datecascade2(data[~~touchScale(xPos-off)].date);})
      .on('touchmove', function(){var xPos = d3.touches(this)[0][0];datecascade2(data[~~touchScale(xPos-off)].date);})
    highlightdots(dtgFormat.parse(getdate(gethandle())));
  }

/*
var foodtypes = ['dry','wet'];
for (var ft in foodtypes) {
  var thischart = dc.lineChart('#'+foodtypes[ft]+'food');
  var thisgroup = byday.group().reduceSum(function(d) { return d.foodtypes[ft]; });
  thischart
    .dimension(byday)
    .group(thisgroup)
    .transitionDuration(500)
    .elasticY(true)
    .brushOn(false)
    .title(function(){return;})
    .on('renderlet', function(chart) {
      var touchScale = d3.scale.linear().domain([getxpositions(thischart)[0],getxpositions(thischart)[1]]).range([0,data.length-1]).clamp(true);
      interactivity(chart); 
    })
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.date; })))
    .xAxis().ticks(4);
}
*/


// dry graph
  dryfood
    .dimension(byday)
    .group(drygroup)
    .transitionDuration(500)
    .elasticY(true)
    .brushOn(false)
    .title(function(){return;})
    .on('renderlet', function(chart) {
      var touchScale = d3.scale.linear().domain([getxpositions(dryfood)[0],getxpositions(dryfood)[1]]).range([0,data.length-1]).clamp(true);
      interactivity(chart); 
    })
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.date; })))
    .xAxis().ticks(4);

// wet graph
  wetfood
    .dimension(byday)
    .group(wetgroup)
    .transitionDuration(500)
    .elasticY(true)
    .brushOn(false)
    .title(function(){return;})
    .on('renderlet', function(chart) {
      var touchScale = d3.scale.linear().domain([getxpositions(wetfood)[0],getxpositions(wetfood)[1]]).range([0,data.length-1]).clamp(true);
      interactivity(chart); 
    })
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.date; })))
    .xAxis().ticks(4); 


// Render charts on load or resize, w adjusted dimensions on resize
  function resize(e) {
    var width=getdims()[0];
    var height=getdims()[1];
    dryfood.width(width).height(height);
    wetfood.width(width).height(height);
    dc.renderAll();
  };
  $(window).on('resize load', resize);
  resize(); 
  
});

});  

  