// Configuration Params to make this app easy to be updated to different FFOS versions
var versionNames = ["stable", "develop", "plan"];
var versionNumbers = ["1_3", "1_4", "1_5"];
var versionCodes = ["1.3", "1.4", "1.5"];
var keys = ["StableVersion", "DevVersion", "PlanVersion"];
var colors = ["blue", "red", "green"];

// Detail Table columns
var columns = ["1.3?", "1.3+", "1.4?", "1.4+", "1.5?", "1.5+"]

// Page Areas, index plus one per version handled
var regions = ["index"];
regions = regions.concat(versionNames);

var table = document.getElementById("details");

// Firebase base URL and nodes that contain Bug info
var baseURL = "https://owd.firebaseio.com/";
var nodes = ["UserStories/StableVersion/P1/", "UserStories/StableVersion/P2/", "UserStories/DevVersion/P1/", "UserStories/DevVersion/P2/", 
             "UserStories/PlanVersion/P1/", "UserStories/PlanVersion/P2/", "blockers/StableVersion/", "blockers/DevVersion/", "blockers/PlanVersion/", "noms/StableVersion/", "noms/DevVersion/", "noms/PlanVersion/"];
  
// Boxes Titles
names = ["P1 Open US", "P2 Open US", "P1 Closed US", "P2 Closed US", "Total Blockers", "Gaia Blockers", "Platform Blockers", "Total Noms", "Gaia Noms", "Platform Noms"];

// List with DOM Nodes that show Bug Information. These are used also for local storage keys to work offline 
ids = [["UserStories/StableVersion/P1/OPEN", "UserStories/StableVersion/P2/OPEN", "UserStories/StableVersion/P1/CLOSED",
             "UserStories/StableVersion/P2/CLOSED", "blockers/StableVersion/AllBugs", "blockers/StableVersion/AllGaiaBugs", "blockers/StableVersion/AllPlatformBugs",
             "noms/StableVersion/AllBugs", "noms/StableVersion/AllGaiaBugs", "noms/StableVersion/AllPlatformBugs"],
       ["UserStories/DevVersion/P1/OPEN", "UserStories/DevVersion/P2/OPEN", "UserStories/DevVersion/P1/CLOSED", 
             "UserStories/DevVersion/P2/CLOSED", "blockers/DevVersion/AllBugs", "blockers/DevVersion/AllGaiaBugs", "blockers/DevVersion/AllPlatformBugs",
              "noms/DevVersion/AllBugs", "noms/DevVersion/AllGaiaBugs", "noms/DevVersion/AllPlatformBugs"],
       ["UserStories/PlanVersion/P1/OPEN", "UserStories/PlanVersion/P2/OPEN", "UserStories/PlanVersion/P1/CLOSED", 
             "UserStories/PlanVersion/P2/CLOSED", "blockers/PlanVersion/AllBugs", "blockers/PlanVersion/AllGaiaBugs", "blockers/PlanVersion/AllPlatformBugs",
             "noms/PlanVersion/AllBugs", "noms/PlanVersion/AllGaiaBugs", "noms/PlanVersion/AllPlatformBugs"]];

$(window).ready(function() {
  document.getElementById("homebutton").onclick = makeShowElementCallback("index");
  configure(); // Create basic config parameters for versions
  createMainMenu(); // DOM Navigation structure
  for (i in versionNumbers) // DOM For every version
    createVersionTiles(versionCodes[i], versionNames[i], ids[i], names, colors[i]);
  createTable();
  showElement('index'); // Show only navigation structure
  table = document.getElementById("details");
  readFromLS(); // Read From Local Storage the info just in case there is no connection
  readFromFB(); // Read Data from FireBase
});  

function configure()
{
  for (var i in ids)
    for (var j in ids[i])
      ids[i][j] = ids[i][j].split(keys[i]).join(versionNumbers[i]);

  for (var i in nodes)
  {
    nodes[i] = nodes[i].split('StableVersion').join(versionNumbers[0]);
    nodes[i] = nodes[i].split('DevVersion').join(versionNumbers[1]);
    nodes[i] = nodes[i].split('PlanVersion').join(versionNumbers[2]);
  }
}

function createMainMenu()
{
   var wrapper= document.createElement('div');
   wrapper.setAttribute("class", "page-region");
   wrapper.setAttribute("align", "center");
   wrapper.setAttribute("id", "index");

   content = "<div class='page-region-content'>";
   for (var x in versionNumbers)
   {
      content += "<a id='link" + versionNames[x] + "' >";
      content += "<div class='tile bg-color-orange icon'><b class='check'><h3>" + versionNumbers[x] + "</h3></b><div class='tile-content'>";
      content += "<img src='images/Firefox-" + versionNames[x] + ".png'></img></div><div class='brand'>";
      content += "<span class='badge'> </span> </div> </div> </a>";
   }  

   content += "<a id='linkall'>";
   content += "<div class='tile bg-color-orange icon'><b class='check'><h3>All Versions</h3></b><div class='tile-content'>";
   content += "<img src='images/Firefox-all.png'></img></div><div class='brand'>";
   content += "<span class='badge'> </span> </div> </div> </a>";
   content += "</div>"
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

// Creates DOM Structure for the 3 versions
function createVersionTiles(version, tag, identities, names, color)
{
  var wrapper= document.createElement('div');
  wrapper.setAttribute("class", "page-region");
  wrapper.setAttribute("align", "center");
  wrapper.setAttribute("id", tag);

  brokenBlockers = false;
  brokenNoms = false;

  content = "<div class='page-region-content'>";
  for (var x in identities)
  {
    if ((identities[x].substring(0, 8) == "blockers") && (!brokenBlockers))
    {
      content+="<br>";
      brokenBlockers = true;
    }  

    if ((identities[x].substring(0, 4) == "noms") && (!brokenNoms))
    {
      content+="<br>";
      brokenNoms = true;
    }  

    if (identities[x].substring(0, 8) == "blockers") {
     content += "<a " + getLink(version+"+", null, names[x].split(" ")[0]) + "><div class='tile " +
                "bg-color-" + color + "Dark icon'><p class='check'>" + names[x] +"</p>";
    }
    else if (identities[x].substring(0, 4) == "noms") {
     content += "<a " + getLink(version+"?", null, names[x].split(" ")[0]) + "><div class='tile " +
                "bg-color-" + color + "Fxos icon'><p class='check'>" + names[x] +"</p>";
    }
    else
    {
      var parts = identities[x].split("/");
      openorclosed = parts[3];
      priority = parts[2];

      content += "<a " + getLinkUS(version, openorclosed, priority) + "><div class='tile " + 
                "bg-color-" + color + " icon'><p class='check'>" + names[x] + "</p>";
    }

    content+= "<div class='tile-content' id='" + identities[x] + "'></div>";
    content+= "<div class='brand'><span class='name'>";
    content+= "</span><div class='badge' id='badge" + identities[x] +"'></div></div></div></a>"
  }

  content += "</div>"
  wrapper.innerHTML = content;
  document.getElementById("page-index").appendChild(wrapper);
}

function createTable()
{
  var wrapper= document.createElement('div');
  wrapper.setAttribute("class", "page-region");
  wrapper.setAttribute("align", "center");
    content = "<div class='page-region-content'>";
  content += '<table class="hovered bg-color-white" align="center" style="table-layout: fixed;" id="details-table"><thead> <tr class="warning"> <th width="100em" class="components hidecol">Component</th> <th width="25em" class="1.3? hidecol">1.3?</th> <th width="25em" class="1.3+ hidecol">1.3+</th> <th width="25em" class="1.4? hidecol">1.4?</th> <th width="25em" class="1.4+ hidecol">1.4+</th> <th width="25em" class="1.5? hidecol">1.5?</th> <th width="25em" class="1.5+ hidecol">1.5+</th> </tr> </thead> <tbody id="details"> </tbody> </table>';
  content += "</div>"
  wrapper.innerHTML = content;
  document.getElementById("page-index").appendChild(wrapper);
}

// Menu handler
function showElement(elementToShow)
{
  console.log("INVOKED showElement " + elementToShow);

  if(elementToShow == "all")
  {
    for (var element in versionNames)
    {  
      document.getElementById(versionNames[element]).style.visibility="visible";
      document.getElementById(versionNames[element]).style.display="inline-block";    
    }

    for (var element in columns)
    {
      cols = document.getElementsByClassName(columns[element]); 
      for (var i = 0; i < cols.length; i++) {
        cols[i].setAttribute("class", columns[element] + " viewcol");
      }
    }

    cols = document.getElementsByClassName("components"); 
    for (var i = 0; i < cols.length; i++) {
      cols[i].setAttribute("class", "components viewcol");
    }

    document.getElementById("index").style.visibility="hidden";
    document.getElementById("index").style.display="none";
  }
  else
  {
    for (var element in regions)
    { 
      if(regions[element] == elementToShow)
      {
        document.getElementById(elementToShow).style.visibility="visible";
        document.getElementById(elementToShow).style.display="inline-block";
      }
      else
      {
        document.getElementById(regions[element]).style.visibility="hidden";
        document.getElementById(regions[element]).style.display="none";
      }   
    }

    var noms = versionCodes[versionNames.indexOf(elementToShow)] + "?";
    var blockers = versionCodes[versionNames.indexOf(elementToShow)] + "+";

    for (var cl in columns) {
      cols = document.getElementsByClassName(columns[cl]); 
      for (var i = 0; i < cols.length; i++) {
        if ((columns[cl] == noms) || (columns[cl] == blockers))
          cols[i].setAttribute("class", columns[cl] + " viewcol");
        else
          cols[i].setAttribute("class", columns[cl] + " hidecol");
      }
    }
    cols = document.getElementsByClassName("components"); 
    for (var i = 0; i < cols.length; i++) {
      cols[i].setAttribute("class", "components viewcol");
    }



   /*if (elementToShow == "stable")
      {
        console.log("STABLE")
        for (var cl in columns) {
          cols = document.getElementsByClassName(columns[cl]); 
          console.log("columns element " + columns[cl])
          for (var i = 0; i < cols.length; i++) {
            if ((columns[cl] == "1.3?") || (columns[cl] == "1.3+"))
              cols[i].setAttribute("class", columns[cl] + " viewcol");
            else
              cols[i].setAttribute("class", columns[cl] + " hidecol");
          }
        }
        cols = document.getElementsByClassName("components"); 
        for (var i = 0; i < cols.length; i++) {
          cols[i].setAttribute("class", "components viewcol");
        }
      } else if (elementToShow == "develop")
      {
        console.log("DEVELOP" + regions[element])
        for (var cl in columns) {
          cols = document.getElementsByClassName(columns[cl]); 
          console.log("columns element " + columns[cl])
          for (var i = 0; i < cols.length; i++) {
            if ((columns[cl] == "1.4?") || (columns[cl] == "1.4+"))
              cols[i].setAttribute("class", columns[cl] + " viewcol");
            else
              cols[i].setAttribute("class", columns[cl] + " hidecol");
          }
        }
        cols = document.getElementsByClassName("components"); 
        for (var i = 0; i < cols.length; i++) {
          cols[i].setAttribute("class", "components viewcol");
        }
      } else if (elementToShow == "plan")
      {
        console.log("PLAN" + regions[element])
        for (var cl in columns) {
          cols = document.getElementsByClassName(columns[cl]); 
          console.log("columns element " + columns[cl])
          for (var i = 0; i < cols.length; i++) {
            if ((columns[cl] == "1.5?") || (columns[cl] == "1.5+"))
              cols[i].setAttribute("class", columns[cl] + " viewcol");
            else
              cols[i].setAttribute("class", columns[cl] + " hidecol");
          }
        }
        cols = document.getElementsByClassName("components"); 
        for (var i = 0; i < cols.length; i++) {
          cols[i].setAttribute("class", "components viewcol");
        }
      }*/
  }

  if (elementToShow == "index")
  {
     $(titleText).html("FirefoxOS Dashboard");
     document.getElementById("homebutton").style.visibility="hidden";
     document.getElementById("homebutton").style.display="none";

      for (var element in columns)
    {
      cols = document.getElementsByClassName(columns[element]); 
      for (var i = 0; i < cols.length; i++) {
        cols[i].setAttribute("class", columns[element] + " hidecol");
      }
    }

    cols = document.getElementsByClassName("components"); 
    for (var i = 0; i < cols.length; i++) {
      cols[i].setAttribute("class", "components hidecol");
    }
  }
  else
  {
     if (elementToShow == "all")
       $(titleText).html("All Versions");
     else
       $(titleText).html("Version " + versionNumbers[versionNames.indexOf(elementToShow)]);
     document.getElementById("homebutton").style.visibility="visible";
     document.getElementById("homebutton").style.display="inline-block";
  }
}

function makeShowElementCallback(name)
{
  return function(){
    showElement(name);
  }
}

// Retrieves information from Local Storage
function readFromLS()
{
  console.log("*** METHOD readFromLS");

  if (window.indexedDB)
  { 
    asyncStorage.length(function(numItems){
      for (var i=0; i<numItems; i++)
      {
        asyncStorage.key(i, function(key)
        {
          var parts = key.split("/");
          type = parts[0];

          if ((type == "blockers") || (type == "noms"))
          {  
            release = parts[1];
            component = parts[2];
            node = type+ "/" + release;
            asyncStorage.getItem(key, function(value)
            {
              addRow(node, component, value);
            }); 
          }
          else
          {
            asyncStorage.getItem(key, function(value) {
             if (value != null)
               document.getElementById(key).innerHTML = "<h1>"+value+"</h1>"; 
             else
               document.getElementById(key).innerHTML = "<h1>?</h1>"; 
             document.getElementById("badge"+key).innerHTML = "<i class='icon-link-2'></i>";            
            });
          }
        })

      }
    })
  }
  else // Thanks Apple for not supporting indexedDB
  {
    numItems = localStorage.length();
    for (var i=0; i<numitems; i++)
    {
      var key = localStorage.key(i);

      var parts = key.split("/");
      type = parts[0];

      if ((type == "blockers") || (type == "noms"))
      {  
        release = parts[1];
        component = parts[2];
        node = type+ "/" + release;
        value = localStorage[key];
        addRow(node, component, value);
      }
      else
      {
        value = localStorage[key];
        if (value != null)
          document.getElementById(key).innerHTML = "<h1>"+value+"</h1>"; 
        else
          document.getElementById(key).innerHTML = "<h1>?</h1>"; 
        document.getElementById("badge"+key).innerHTML = "<i class='icon-link-2'></i>";            
      }
    }
  }
}

// Retrieves information from Firebase
function readFromFB()
{
  console.log("*** METHOD readFromFirebase");
  for (var x in nodes)
  {
    fb = new Firebase(baseURL + nodes[x]);
    fb.on('value', createFirebaseCB(nodes[x]));
  }
}

// Closure for adding listeners to every node
function createFirebaseCB(node)
{
  return function(snapshot){
    snapshot.forEach(function(childSnapshot) {
      console.log("*** METHOD FirebaseCB: Item " + node + childSnapshot.name() + " value " + childSnapshot.val());

      // For the per-component analysis
      if ((childSnapshot.name() != "OPEN") && (childSnapshot.name() != "CLOSED"))
        addRow(node, childSnapshot.name(), childSnapshot.val())

      if (window.indexedDB)
        asyncStorage.setItem(node + childSnapshot.name(),childSnapshot.val()); 
      else
        localStorage.setItem(node + childSnapshot.name(),childSnapshot.val()); 

      var d = document.getElementById(node + childSnapshot.name());
      if (d != null)
      {
        d.innerHTML = "<h1>"+childSnapshot.val()+"</h1>";
        document.getElementById("badge"+node + childSnapshot.name()).innerHTML = "<i class='icon-link'></i>";
      }
    });
  }
}

function addRow(node, component, value)
{
  // rows will be named details-<component>
  rownode = document.getElementById("details-" + component);
  var parts = node.split("/");
  type = parts[0];
  release = parts[1];

  
  releasetype = release.replace("_",".") + "+";

  if (type == "noms")
    releasetype = release.replace("_",".") + "?";


  if (rownode == null) // Create row if it does not exist
  {
    var inserted = false;
    var row;

    for(var i=0; i<table.rows.length; i++) { // order rows alphabetically
      var currentRow = table.rows[i];
      if ((inserted == false) && (component < currentRow.cells[0].innerHTML))
      {
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
    cell.setAttribute("class", "components hidecol"); 

    // the rest of rows are blockers and nominations for every release
    for(var key in columns){
      var cell = row.insertCell(-1);
      cell.setAttribute("id", "details-" + component + "-" + columns[key]);
      cell.setAttribute("class", columns[key] + " hidecol"); 
      cell.innerHTML = "<a " + getLink(columns[key], component) + " target='_blank'>0</a>";
    }
  }

  // Fill-in the right cell
  cellnode = document.getElementById("details-" + component + "-" + releasetype);  
  console.log("details-" + component + "-" + type + "-" + releasetype)  
  if (cellnode != null)
    cellnode.innerHTML = "<a " + getLink(releasetype, component) + " target='_blank'>" + value + "</a>";    
}

 // Create a search query link for bugzilla we can redirect to.
  function getLink(release, component, gaiaonly) {
    var url = "https://bugzilla.mozilla.org/buglist.cgi?";
    var args = [["bug_status", "UNCONFIRMED"],
                ["bug_status", "NEW"],
                ["bug_status", "ASSIGNED"],
                ["bug_status", "REOPENED"]];
    if (release)
      args.push(["cf_blocking_b2g", release]);
    if (component)
      args.push(["component", component]);
    if (gaiaonly == "Gaia")
    {
      args.push(["f2", "component"]);
      args.push(["o2", "anywords"]);
      args.push(["v2", "Gaia"]);
    } else if (gaiaonly == "Platform")
    {
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
    if (open == "OPEN")
      var args = [["bug_status", "UNCONFIRMED"],
                 ["bug_status", "NEW"],
                 ["bug_status", "ASSIGNED"],
                 ["bug_status", "REOPENED"]];
    else
      var args = [["bug_status", "RESOLVED"],
                  ["bug_status", "VERIFIED"],
                  ["bug_status", "CLOSED"],
                  ["resolution", "FIXED"]];

    args.push(["status_whiteboard_type", "allwordssubstr"]);
    args.push(["status_whiteboard", "ucid: " + release + ":" + priority]);
    $.each(args, function (n, arg) {
        args[n] = encodeURIComponent(arg[0]) + "=" + encodeURIComponent(arg[1]);
      });
    return "href='" + url + args.join("&") + "' target='_blank'";
  }

