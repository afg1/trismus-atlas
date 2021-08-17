function loadHTMLToString(name, url)
{
    var httpConn = new XMLHttpRequest();
    httpConn.addEventListener("load", function(){structureInfoHTMLs[name] = httpConn.response;})
    httpConn.open("GET", url, true);
    httpConn.send();
}

function writeToDocument(url, id)
{
    // This function will fill an existing HTML node with the contents of a file.
    // It is assumed that the contents of the file are sensible to be put in the element, and
    // that the element exists!
    var httpConn = new XMLHttpRequest();
    httpConn.addEventListener("load", function(){
        var containingDiv = document.getElementById(id);
        containingDiv.innerHTML = httpConn.responseText;
    });
    httpConn.open("GET", url, false); // The false makes this synchronous, so that the load blocks until we have the shaders loaded.
    httpConn.send();
}