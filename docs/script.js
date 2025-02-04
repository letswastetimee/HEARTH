const repo = "letswastetimee/HEARTH";
const branch = "gh-pages";
const apiBaseUrl = `https://api.github.com/repos/${repo}/contents`;

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

async function renderFileTree(path = "") {
    const fileTree = document.getElementById("file-tree");
    fileTree.innerHTML = "<li>Loading...</li>";

    const items = await fetchRepoContents(path);
    if (items.length === 0) {
        fileTree.innerHTML = "<li>No files or directories found</li>";
        return;
    }

    fileTree.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        if (item.type === "dir") {
            li.innerHTML = `<span class="folder">📁 ${item.name}</span>`;
            li.addEventListener("click", () => renderFileTree(item.path));
        } else {
            li.innerHTML = `<a class="file" href="${item.download_url}" target="_blank">📄 ${item.name}</a>`;
        }
        fileTree.appendChild(li);
    });
}

renderFileTree();
