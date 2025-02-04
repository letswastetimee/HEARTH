const repo = "letswastetimee/HEARTH"; // Update this with your repo name
const branch = "gh-pages";
const apiBaseUrl = `https://api.github.com/repos/${repo}/contents`;

async function fetchRepoContents(path = "") {
    const response = await fetch(`${apiBaseUrl}/${path}?ref=${branch}`);
    if (!response.ok) {
        console.error("Error fetching repository contents:", response.status, response.statusText);
        return [];
    }
    return await response.json();
}

async function fetchFileContent(downloadUrl) {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        console.error("Error fetching file content:", response.status, response.statusText);
        return "Unable to load file content.";
    }
    return await response.text();
}

async function renderFileTree(path = "") {
    const fileTree = document.getElementById("file-tree");
    fileTree.innerHTML = "<li>Loading...</li>";

    const items = await fetchRepoContents(path);
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
                const content = await fetchFileContent(item.download_url);
                filePreview.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${content}</pre>`;
            });
        }
        fileTree.appendChild(li);
    });
}

renderFileTree();
