function createCell(content) {
  var column = document.createElement('td');
  column.appendChild(document.createTextNode(content));  
  return column;
}

function cleanContentTable() {
  document.querySelector(".table .body").innerText = "";
}

function updateContentTable() {
  fetch('/api/list', {
    method: 'GET'
  }).then(function(response) {
    return response.json()
  }).then(function(items) {
    cleanContentTable();
    var body = document.querySelector(".table .body");
    items.forEach(function(item, index) {
      var row = document.createElement('tr');
      row.appendChild(createCell(index + 1));
      row.appendChild(createCell(item.file));
      row.appendChild(createCell(item.stats.size/10000000));
      body.appendChild(row);
    });
    document.querySelector(".overlay").className = "overlay d-none";
  });
}

document.querySelector("#process").onclick = function(evt) {
  evt.preventDefault();
    
  document.querySelector(".overlay").className = "overlay";
  fetch('/api/process', {
    method: 'GET'
  }).then(function(response) {
    if(response.status == 200) {
      updateContentTable();
    }
  });
}

updateContentTable();