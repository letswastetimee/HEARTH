const repo = "letswastetimee/HEARTH"; // Update this with your repo name
const branch = "gh-pages"; // Branch for GitHub Pages
const apiBaseUrl = `https://api.github.com/repos/${repo}/contents`;

/**
 * Fetch repository contents from GitHub API.
 * @param {string} path - Path to the directory or file.
 */
async function fetchRepoContents(path = "") {
    console.log(`Fetching contents for path: ${path}`); // Debug log
    const response = await fetch(`${apiBaseUrl}/${path}?ref=${branch}`);
    if (!response.ok) {
        console.error("Error fetching repository contents:", response.status, response.statusText);
        return [];
    }
    const data = await response.json();
    console.log("Fetched data:", data); // Debug log
    return data;
}

/**
 * Fetch content of a file.
 * @param {string} downloadUrl - Direct URL to download the file.
 */
async function fetchFileContent(downloadUrl) {
    console.log("Fetching file content from:", downloadUrl); // Debug log
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        console.error("Error fetching file content:", response.status, response.statusText);
        return "Unable to load file content.";
    }
    const content = await response.text();
    console.log("File content loaded:", content); // Debug log
    return content;
}

/**
 * Render the file tree in the left column.
 * @param {string} path - Path to the directory to render.
 */
async function renderFileTree(path = "") {
    const fileTree = document.getElementById("file-tree");
    fileTree.innerHTML = "<li>Loading...</li>";

    const items = await fetchRepoContents(path);
    console.log("File tree loaded:", items); // Debug log

    fileTree.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        if (item.type === "dir") {
            li.innerHTML = `<span class="folder">📁 ${item.name}</span>`;
            li.addEventListener("click", () => renderFileTree(item.path));
        } else {
            li.innerHTML = `<span class="file">📄 ${item.name}</span>`;
            li.addEventListener("click", async () => {
                const filePreview = document.getElementById("file-preview");
                filePreview.innerHTML = "<p>Loading file content...</p>";
                console.log("File selected:", item.name, item.download_url); // Debug log

                const content = await fetchFileContent(item.download_url);
                filePreview.innerHTML = `<pre>${content}</pre>`;
            });
        }
        fileTree.appendChild(li);
    });
}

// Initial render of the file tree
renderFileTree();
