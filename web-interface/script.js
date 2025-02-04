const repo = "letswastetimee/HEARTH"; // Your GitHub repo
const branch = "gh-pages"; // Correct branch for GitHub Pages
const apiBaseUrl = `https://api.github.com/repos/${repo}/contents`;

async function fetchRepoContents(path = "") {
    const response = await fetch(`${apiBaseUrl}/${path}?ref=${branch}`);
    return await response.json();
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
            li.innerHTML = `<a class="file" href="${item.download_url}" target="_blank">📄 ${item.name}</a>`;
        }
        fileTree.appendChild(li);
    });
}

renderFileTree();
