function createCell(content) {
  var column = document.createElement('td');
  column.appendChild(document.createTextNode(content));  
  return column;
}

function cleanContentTable() {
  document.querySelector(".table .body").innerText = "";
}

function parseJson(response) {
  if(response.status == 200) {
    return response.json()
  }
}

function fetchStatus() {
    return fetch('/api/status', {
      method: 'GET'
    }).then(parseJson);
}

function updateContentTable() {
  fetchStatus().then(function(data) {
    cleanContentTable();
    var body = document.querySelector(".table .body");
    Object.keys(data.processes)
      .forEach(function(item, index) {
        var row = document.createElement('tr');
        row.appendChild(createCell(index + 1));
        row.appendChild(createCell(item));
        row.appendChild(createCell(data.cpu));
        row.appendChild(createCell(data.ip));
        row.appendChild(createCell(data.instance));
        body.appendChild(row);        
    });
    document.querySelector("#overlay").className = "overlay d-none";
  });
}

document.querySelector("#process").onclick = function(evt) {
  evt.preventDefault();
  
  fetch('/api/hit', {
    method: 'GET'
  }).then(function(response) {
    if(response.status == 200) {
      updateContentTable();
    }
  });
}

cleanContentTable();

setInterval(function(){ 
  updateContentTable();
}, 60 * 1000);



