// Configuration Params to make this app easy to be updated to different FFOS versions
var versionNames = ["stable", "develop", "plan"];
var versionNumbers = ["2_2", "2_5", "3_0"];
var versionCodes = ["2.2", "2.5", "3.0"];
var colors = ["green", "blue", "red"];
// Detail Table columns
var columns = ["2.2?", "2.2+", "2.5?", "2.5+", "3.0?", "3.0+"]

var colormodifiers = ["", "Dark", "Fxos"]
//var bugtypes = ["+", "?", "US"];
var bugtypes = ["+", "?"];

var bugcategories = ["Bugs", "Gaia", "Platform"]
var uspriorities = ["P1", "P2"]

// Page Areas, index plus one per version handled
var regions = ["index"];
regions = regions.concat(versionNames);

// Firebase base URL and nodes that contain Bug info
var baseURL = "https://owd.firebaseio.com/";

var fbnodes = [];
var activeVersion = "";

$(window).ready(function() {
  document.getElementById("homebutton").onclick = makeShowElementCallback("index");
  createMainMenu(); // DOM Navigation structure
  createVersionTiles();
  createTable();
  showElement('index'); // Show only navigation structure
  readFromLS(); // Read From Local Storage the info just in case there is no connection
  readFromFirebase();
});

function createMainMenu() {
   var wrapper= document.createElement('div');
   wrapper.setAttribute("id", "index");

   var content = "";
   for (var x in versionNumbers)
   {
      content += "<a id='link" + versionNames[x] + "' >";
      content += "<div class='versionbox bg-color-orange'> "
      content += "<h3 class='font-color-white'>" + versionNumbers[x] + "</h3>";
      content += "<img class='boximage' src='images/Firefox-" + versionNames[x]
      content += ".png'></img></div></a>";
   }

   content += "<a id='linkall'>";
   content += "<div class='versionbox bg-color-orangeDark'><h3 ";
   content += "class='font-color-white'>All Versions</h3>";
   content += "<img class='boximage' src='images/Firefox-all.png'></img>";
   content += "</div> </a>";
   wrapper.innerHTML = content;
   document.getElementById("page-index").appendChild(wrapper);

   for (var x in versionNames)
   {
     var hr = document.getElementById("link"+versionNames[x]);
     hr.onclick = makeShowElementCallback(versionNames[x]);
   }

   var hr = document.getElementById("linkall");
   hr.onclick = makeShowElementCallback("all");
}

function createVersionTiles() {
  for (var vidx in versionNumbers) {
    var wrapper= document.createElement('div');
    wrapper.setAttribute("id", versionNames[vidx]);
    var content = "";
    for (var bt in bugtypes){
      content += "<h2 class='font-color-white'>" + versionCodes[vidx] + 
                  bugtypes[bt] + "</h2><br>";

      if (bugtypes[bt] != "US")
      {
        for (var bc in bugcategories){
          content += "<a " + getLink(versionCodes[vidx]+bugtypes[bt], null, 
                                     bugcategories[bc]) + "><div class='bugbox " +
                                     "bg-color-" + colors[vidx] + 
                                     colormodifiers[bt] + 
                                     "'><div class='bugbox-title'>" + 
                                     bugcategories[bc] +"</div>";
          content+= "<div class='bug-count' id='summary-" +
            versionNumbers[vidx] + bugtypes[bt] + "-All" + bugcategories[bc] + 
            "Bugs" + "'>XX</div>";
          content+= "<div class='badge' id='badgesummary-" + 
            versionNumbers[vidx] + bugtypes[bt] + "-All" + bugcategories[bc] + 
            "Bugs" +"'>From LocalStorage</div></div></a>";
        }
        fbnodes.push("summary-" + versionNumbers[vidx] + bugtypes[bt]);
      }
      else
      {
        for (var usp in uspriorities){
          content += "<a " + getLinkUS(versionCodes[vidx], "OPEN", 
                                       uspriorities[usp]) + 
                                       "><div class='bugbox " +
                                       "bg-color-" + colors[vidx] + 
                                       colormodifiers[bt] + "'><p>" + 
                                       uspriorities[usp] + "</p>";
          content+= "<div class='bug-count' id='summary-" + 
            versionNumbers[vidx] + bugtypes[bt] + uspriorities[usp] + 
            "-OPEN'></div>";
          content+= "<div class='badge' id='badgesummary-" + 
            versionNumbers[vidx] + bugtypes[bt] + uspriorities[usp] +
            "-OPEN'>From LocalStorage</div></div></a>"
          fbnodes.push("summary-" + versionNumbers[vidx] + bugtypes[bt] + 
                       uspriorities[usp]);
        }
      }
      content+="<br>";
    }
    wrapper.innerHTML = content;
    document.getElementById("page-index").appendChild(wrapper);
  }
}

function createTable() {
  var wrapper= document.createElement('div');
  wrapper.setAttribute("align", "center");
  wrapper.setAttribute("id", "release-details");
  content = '<table class="responsive-table" id="details-table"><thead>' +
            '<tr><th>Component</th>';

  for (c in columns)
  {
    content += '<th scope="col" class="' + columns[c] + ' viewcol">' + 
               columns[c] + '</th>'
  }

  content += '</tr> </thead> <tbody id="details"> </tbody> </table>';
  wrapper.innerHTML = content;
  document.getElementById("page-index").appendChild(wrapper);
  table = document.getElementById("details");
}

// Menu handler
function showElement(elementToShow) {
  console.log("INVOKED showElement " + elementToShow);
  activeVersion = elementToShow;
  hideReleaseDetails();

  if (elementToShow == "all")
  {
    for (var element in versionNames)
    {
      document.getElementById(versionNames[element]).style.visibility =
        "visible";
      document.getElementById(versionNames[element]).style.display =
        "inline-block";
    }

    document.getElementById("index").style.visibility = "hidden";
    document.getElementById("index").style.display = "none";
  }
  else
  {
    for (var element in regions)
    {
      if(regions[element] == elementToShow)
      {
        document.getElementById(elementToShow).style.visibility = "visible";
        document.getElementById(elementToShow).style.display = "inline-block";
      }
      else
      {
        document.getElementById(regions[element]).style.visibility = "hidden";
        document.getElementById(regions[element]).style.display = "none";
      }
    }
  }

  if (elementToShow == "index")
  {
     $(titleText).html("FirefoxOS Dashboard");
     document.getElementById("homebutton").style.visibility="hidden";
     document.getElementById("homebutton").style.display="none";
     var lista    = document.getElementById("navbarlist");
     var elemento = document.getElementById("show-release-details");
     if (elemento != null) {
       lista.removeChild(elemento);
     }
  }
  else
  {
    if (elementToShow == "all") {
      $(titleText).html("All Versions");
    }
    else {
      $(titleText).html("Version " + 
                        versionNumbers[versionNames.indexOf(elementToShow)]);
    }

    var node = document.createElement("li");
    node.setAttribute("id", "show-release-details");
    node.innerHTML = "<a id='show-release-details-anchor'" +
      " class='font-color-blue' href='javascript:showReleaseDetails()'>(Details)</a>";
    document.getElementById("navbarlist").appendChild(node);
    document.getElementById("homebutton").style.visibility="visible";
    document.getElementById("homebutton").style.display="inline-block";
  }
}

function showReleaseDetails() {
  document.getElementById("show-release-details-anchor").innerHTML = "(Summary)";
  document.getElementById("show-release-details-anchor").setAttribute("href", 
                                                                      "javascript:showReleaseSummary()");
  if (activeVersion != "all") { // hide active release summary
    document.getElementById(activeVersion).style.visibility="hidden";
    document.getElementById(activeVersion).style.display="none";
    var noms = versionCodes[versionNames.indexOf(activeVersion)] + "?";
    var blockers = versionCodes[versionNames.indexOf(activeVersion)] + "+";

    for (var cl in columns) {
      cols = document.getElementsByClassName(columns[cl]);
      for (var i = 0; i < cols.length; i++) {
        if ((columns[cl] == noms) || (columns[cl] == blockers))
          cols[i].setAttribute("class", columns[cl] + " viewcol");
        else
          cols[i].setAttribute("class", columns[cl] + " hidecol");
      }
    }
  }
  else {
    for (var i in versionNames) // hide all summaries
    {
      document.getElementById(versionNames[i]).style.visibility="hidden";
      document.getElementById(versionNames[i]).style.display="none";
    }
    for (var cl in columns) {
      cols = document.getElementsByClassName(columns[cl]);
      for (var i = 0; i < cols.length; i++) {
        cols[i].setAttribute("class", columns[cl] + " viewcol");
      }
    }
  }

  // Show release details
  document.getElementById("release-details").style.visibility="visible";
  document.getElementById("release-details").style.display="block";
}

function showReleaseSummary() {
  document.getElementById("show-release-details-anchor").innerHTML = "(Details)";
  document.getElementById("show-release-details-anchor").setAttribute("href", "javascript:showReleaseDetails()");
  hideReleaseDetails();

  if (activeVersion != "all") { // show active release summary
    document.getElementById(activeVersion).style.visibility="visible";
    document.getElementById(activeVersion).style.display="block";
  }
  else {
    for (var i in versionNames) // show all summaries
    {
      document.getElementById(versionNames[i]).style.visibility="visible";
      document.getElementById(versionNames[i]).style.display="block";
    }
  }
}

function hideReleaseDetails() {
  document.getElementById("release-details").style.visibility="hidden";
  document.getElementById("release-details").style.display="none";
}

function makeShowElementCallback(name) {
  return function() {
    showElement(name);
  }
}

// Retrieves information from Local Storage
function readFromLS() {
  if (window.indexedDB) {
    asyncStorage.length(function(numItems) {
      for (var i=0; i<numItems; i++) {
        asyncStorage.key(i, function(key) {
          asyncStorage.getItem(key, function(value) {
            console.log(" *** RETRIEVED " + value + " FOR " + key)
            if (key.substring(0, 7) == "details") {
              var parts = key.split("-");
              addRow(parts[2], parts[1], value)
            }
            else {
              c = document.getElementById(key);
              if (c != null) {
                if (value != null) {
                  document.getElementById(key).innerHTML = value;
                }
                else {
                  document.getElementById(key).innerHTML = "?";
                }
                document.getElementById("badge"+key).innerHTML = "From LocalStorage";
              }
            }
          });
        })
      }
    })
  }
  else // Thanks Apple for not supporting indexedDB
  {
    numItems = localStorage.length;
    for (var i=0; i<numItems; i++) {
      var key = localStorage.key(i);

      if (key.substring(0, 7) == "details") {
        var parts = key.split("-");
        addRow(parts[2], parts[1], localStorage[key])
      }
      else {
        value = localStorage[key];
        c = document.getElementById("key");
        if (c != null) {
          if (value != null) {
            document.getElementById(key).innerHTML = value;
          }
          else {
            document.getElementById(key).innerHTML = "?";
          }
          document.getElementById("badge"+key).innerHTML = "From LocalStorage";
        }
      }
    }
  }
}

// Retrieves information from Firebase
function readFromFirebase() {
  console.log("*** METHOD readFromFirebase");
  for (var x in fbnodes) {
    console.log(" ***** " + baseURL + "/dashboard/" + fbnodes[x] + " ******")
    fb = new Firebase(baseURL + "/dashboard/" + encodeURIComponent(fbnodes[x]));
    fb.on('value', createFirebaseCBSummary(fbnodes[x]));
  }

  for (var x in versionNumbers) {
    fb = new Firebase(baseURL + "/dashboard/" + versionNumbers[x] + 
                      encodeURIComponent("+"));
    fb.on('value', createFirebaseCBDetails(versionNumbers[x] + "+"));
    fb = new Firebase(baseURL + "/dashboard/" + versionNumbers[x] + 
                      encodeURIComponent("?"));
    fb.on('value', createFirebaseCBDetails(versionNumbers[x] + "?"));
  }
}

// Closure for adding listeners to every node
function createFirebaseCBSummary(node) {
  console.log("CreatingFirebaseCB with " + node)
  return function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      console.log("*** METHOD FirebaseCB: Item " + node + "-" + childSnapshot.name() + " value " + childSnapshot.val());

      if (window.indexedDB) {
        asyncStorage.setItem(node + "-" + childSnapshot.name(),childSnapshot.val());
      }
      else {
        localStorage.setItem(node + "-" + childSnapshot.name(),childSnapshot.val());
      }

      var d = document.getElementById(node + "-" + childSnapshot.name());

      if (d != null) {
        d.innerHTML = childSnapshot.val();
        document.getElementById("badge"+ node + "-" + childSnapshot.name()).innerHTML = "From Firebase";
      }
    });
  }
}

// Closure for adding listeners to every node
function createFirebaseCBDetails(node) {
  //console.log("CreatingFirebaseCB with " + node)
  return function(snapshot){
    snapshot.forEach(function(childSnapshot) {
      component = decodeURIComponent(childSnapshot.name());
      //console.log("*** METHOD FirebaseCB: Item " + node + "-" + component + 
      //" value " + childSnapshot.val());

      if (window.indexedDB) {
        asyncStorage.setItem("details-" + component + "-" + 
                             node.replace("_","."),childSnapshot.val());
      }
      else {
        localStorage.setItem("details-" + node + "-" + 
                             component,childSnapshot.val());
      }
      addRow(node, component, childSnapshot.val());
    });
  }
}


function addRow(node, component, value) {
  console.log("addRow with " + node + " " + component + " " + value)
  // rows will be named details-<component>
  rownode = document.getElementById("details-" + component);

  if (rownode == null) { // Create row if it does not exist
    var inserted = false;
    var row;

    for(var i=0; i<table.rows.length; i++) { // order rows alphabetically
      var currentRow = table.rows[i];
      if ((inserted == false) && (component < currentRow.cells[0].innerHTML)) {
        row = table.insertRow(i);
        inserted = true;
      }
    }

    if (inserted == false) {
      row = table.insertRow(-1);
    }

    row.setAttribute("class", "info");
    row.setAttribute("id", "details-" + component);

    // every row firts cell is the component name
    var cell = row.insertCell(-1);
    cell.innerHTML = component;
    cell.setAttribute("class", "components viewcol");

    // the rest of rows are blockers and nominations for every release
    for(var key in columns) {
      var cell = row.insertCell(-1);
      cell.setAttribute("id", "details-" + component + "-" + columns[key]);
      cell.setAttribute("class", columns[key] + " viewcol");
      cell.setAttribute("data-title", columns[key]);
      cell.innerHTML = "<a " + getLink(columns[key], component) + 
        " target='_blank'>0</a>";
    }
  }
  // Fill-in the right cell
  cellnode = document.getElementById("details-" + component + "-" + 
                                     node.replace("_","."));
  if (cellnode != null) {
    cellnode.innerHTML = "<a " + getLink(node.replace("_","."), component) + 
      " target='_blank'>" + value + "</a>";
  }
  else {
     console.log("NOT FOUND --- " + "details-" + component + "-" + node)
  }
}

// Create a search query link for bugzilla we can redirect to.
function getLink(release, component, gaiaonly) {
  var url = "https://bugzilla.mozilla.org/buglist.cgi?";
  var args = [["bug_status", "UNCONFIRMED"],
             ["bug_status", "NEW"],
             ["bug_status", "ASSIGNED"],
             ["bug_status", "REOPENED"]];
  if (release) {
    args.push(["cf_blocking_b2g", release]);
  }
  if (component) {
    args.push(["component", component]);
  }
  if (gaiaonly == "Gaia") {
    args.push(["f2", "component"]);
    args.push(["o2", "anywords"]);
    args.push(["v2", "Gaia"]);
  } else if (gaiaonly == "Platform") {
    args.push(["f2", "component"]);
    args.push(["o2", "nowords"]);
    args.push(["v2", "Gaia"]);
  }

  $.each(args, function (n, arg) {
     args[n] = encodeURIComponent(arg[0]) + "=" + encodeURIComponent(arg[1]);
  });
  return "href='" + url + args.join("&") + "' target='_blank'";
}

function getLinkUS(release, open, priority) {
  var url = "https://bugzilla.mozilla.org/buglist.cgi?";
  if (open == "OPEN") {
    var args = [["bug_status", "UNCONFIRMED"],
                ["bug_status", "NEW"],
                ["bug_status", "ASSIGNED"],
                ["bug_status", "REOPENED"]];
  }
  else {
    var args = [["bug_status", "RESOLVED"],
                ["bug_status", "VERIFIED"],
                ["bug_status", "CLOSED"],
                ["resolution", "FIXED"]];
  }

  args.push(["status_whiteboard_type", "allwordssubstr"]);
  args.push(["status_whiteboard", "ucid: " + release + ":" + priority]);
  $.each(args, function (n, arg) {
    args[n] = encodeURIComponent(arg[0]) + "=" + encodeURIComponent(arg[1]);
  });
  return "href='" + url + args.join("&") + "' target='_blank'";
}
