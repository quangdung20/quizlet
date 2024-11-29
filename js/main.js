// Function to include an HTML file into a specified element
function includeHTML(elementId, filePath) {
  // Fetch the element where the HTML will be injected
  var element = document.getElementById(elementId);

  if (element) {
    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load file: " + filePath);
        }
        return response.text();
      })
      .then((html) => {
        element.innerHTML = html;
      })
      .catch((error) => {
        console.error(error);
        element.innerHTML = "Failed to load content.";
      });
  }
}

// Include the header and footer
includeHTML("header", "header.html");
