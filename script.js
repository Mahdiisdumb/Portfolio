
const GITHUB_USERNAME = "Mahdiisdumb";

const LINKS = [
    {
        name: "GitHub",
        description: "Repositories, code, and experiments.",
        url: "https://github.com/Mahdiisdumb",
        icon: "github"
    },
    {
        name: "YouTube",
        description: "Videos and uploads.",
        url: "https://m.youtube.com/@Mahdiisdumb",
        icon: "youtube"
    },
    {
        name: "Discord",
        description: "Discord profile.",
        url: "https://discord.com/users/1143328415022321744",
        icon: "discord"
    },
    {
        name: "Steam",
        description: "Steam profile and games.",
        url: "https://steamcommunity.com/id/Mahdiisdumb/",
        icon: "steam"
    },
    {
        name: "Website",
        description: "Mahdi Studios website.",
        url: "./MS/run.html",
        icon: "website"
    }
];

const ABOUT_IMAGES = [
    "assets/images/about-1.svg",
    "assets/images/about-2.svg",
    "assets/images/about-3.svg"
];

const SCHOOL_MANIFEST = "./school/index.json";

const views = [...document.querySelectorAll(".view")];
const historyStack = ["home"];

function showView(id, addHistory = true) {
    const target = document.getElementById(id);
    if (!target) return;

    const current = document.querySelector(".view.active");

    if (current && current.id === id) return;

    if (addHistory && current) {
        historyStack.push(id);
    }

    views.forEach(view => {
        const active = view.id === id;
        view.hidden = !active;
        view.classList.toggle("active", active);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (id === "github") {
        loadRepositories();
    }
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
    }

    showView(historyStack[historyStack.length - 1], false);
}

document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });
});

document.querySelectorAll("[data-back]").forEach(button => {
    button.addEventListener("click", goBack);
});

document.querySelectorAll("[data-home]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        historyStack.length = 0;
        historyStack.push("home");

        showView("home", false);
    });
});

function createItem(item, extra = "") {
    const link = document.createElement("a");

    link.className = "item-card";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const leading = document.createElement("span");
    leading.className = "item-leading";

    if (item.icon) {
        const icon = document.createElement("img");

        icon.className = "platform-icon";
        icon.alt = "";

        icon.src = item.icon.includes("/")
            ? item.icon
            : `assets/icons/${item.icon}.svg`;

        icon.onerror = () => icon.remove();

        leading.appendChild(icon);
    }

    const main = document.createElement("span");
    main.className = "item-main";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.name;

    main.appendChild(title);

    if (item.description) {
        const description = document.createElement("span");

        description.className = "item-description";
        description.textContent = item.description;

        main.appendChild(description);
    }

    if (extra) {
        const meta = document.createElement("span");

        meta.className = "repo-meta";
        meta.textContent = extra;

        main.appendChild(meta);
    }

    const arrow = document.createElement("span");
    arrow.className = "item-arrow";
    arrow.textContent = "↗";

    leading.appendChild(main);
    link.append(leading, arrow);

    return link;
}

function renderConfiguredList(containerId, items, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.replaceChildren();

    if (!items.length) {
        const empty = document.createElement("div");

        empty.className = "empty-state";
        empty.textContent = emptyMessage;

        container.appendChild(empty);
        return;
    }

    items.forEach(item => {
        container.appendChild(createItem(item));
    });
}

async function pathExists(path) {
    try {
        let response = await fetch(path, {
            method: "HEAD",
            cache: "no-store"
        });

        if (response.status === 405 || response.status === 501) {
            response = await fetch(path, {
                method: "GET",
                cache: "no-store"
            });
        }

        return response.ok;
    } catch {
        return false;
    }
}

/* SCHOOL DIRECTORY */

let schoolDirectoryStack = [
    {
        name: "School",
        manifest: new URL(SCHOOL_MANIFEST, document.baseURI).href
    }
];

let schoolRenderToken = 0;

async function loadSchoolManifest(path) {
    const response = await fetch(path, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Manifest returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.items)) {
        throw new Error("Invalid school manifest: items must be an array.");
    }

    return data;
}

function createDirectoryCard(directory, parentManifest) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "item-card directory-item";

    const leading = document.createElement("span");
    leading.className = "item-leading";

    const icon = document.createElement("img");

    icon.className = "platform-icon";
    icon.alt = "";

    icon.src = directory.icon
        ? directory.icon.includes("/")
            ? directory.icon
            : `assets/icons/${directory.icon}.svg`
        : "assets/icons/folder.svg";

    icon.onerror = () => icon.remove();

    leading.appendChild(icon);

    const main = document.createElement("span");
    main.className = "item-main";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = directory.name || "Untitled directory";

    const description = document.createElement("span");
    description.className = "item-description";
    description.textContent = directory.description || "Open directory";

    main.append(title, description);
    leading.appendChild(main);

    const arrow = document.createElement("span");
    arrow.className = "item-arrow";
    arrow.textContent = "→";

    button.append(leading, arrow);

    button.addEventListener("click", () => {
        if (!directory.manifest) return;

        schoolDirectoryStack.push({
            name: directory.name,
            manifest: new URL(directory.manifest, parentManifest).href
        });

        renderSchoolDirectory();
    });

    return button;
}

function createUnavailableCard(item) {
    const card = document.createElement("div");
    card.className = "item-card unavailable-item";

    const leading = document.createElement("span");
    leading.className = "item-leading";

    const main = document.createElement("span");
    main.className = "item-main";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.name || "Unknown item";

    const description = document.createElement("span");
    description.className = "item-description";
    description.textContent = "Unavailable: this file could not be found.";

    main.append(title, description);
    leading.appendChild(main);

    const status = document.createElement("span");
    status.className = "unavailable-label";
    status.textContent = "NOT FOUND";

    card.append(leading, status);

    return card;
}

function createSchoolFile(item, parentManifest) {
    const url = new URL(item.url, parentManifest).href;

    const link = createItem({
        name: item.name,
        description: item.description,
        url,
        icon: item.icon
    });

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    return link;
}

async function renderSchoolDirectory() {
    const token = ++schoolRenderToken;

    const container = document.getElementById("school-list");
    const pathLabel = document.getElementById("school-path");
    const backButton = document.getElementById("school-folder-back");

    if (!container || !pathLabel || !backButton) return;

    const current = schoolDirectoryStack[
        schoolDirectoryStack.length - 1
    ];

    pathLabel.textContent = schoolDirectoryStack
        .map(folder => folder.name)
        .join(" / ");

    backButton.hidden = schoolDirectoryStack.length === 1;

    container.replaceChildren();

    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "LOADING SCHOOL DIRECTORY...";

    container.appendChild(loading);

    try {
        const manifest = await loadSchoolManifest(current.manifest);

        if (token !== schoolRenderToken) return;

        const results = await Promise.all(
            manifest.items.map(async item => {
                if (item.type === "directory") {
                    return {
                        item,
                        exists: Boolean(item.manifest)
                    };
                }

                if (!item.url) {
                    return {
                        item,
                        exists: false
                    };
                }

                let target;

                try {
                    target = new URL(item.url, current.manifest);
                } catch {
                    return {
                        item,
                        exists: false
                    };
                }

                if (
                    item.type === "external" ||
                    target.origin !== window.location.origin
                ) {
                    return {
                        item,
                        exists: true
                    };
                }

                return {
                    item,
                    exists: await pathExists(target.href)
                };
            })
        );

        if (token !== schoolRenderToken) return;

        container.replaceChildren();

        if (results.length === 0) {
            const empty = document.createElement("div");

            empty.className = "empty-state";
            empty.textContent = manifest.emptyMessage ||
                "This directory is currently empty.";

            container.appendChild(empty);
            return;
        }

        results.forEach(({ item, exists }) => {
            if (!exists) {
                container.appendChild(createUnavailableCard(item));
            } else if (item.type === "directory") {
                container.appendChild(
                    createDirectoryCard(item, current.manifest)
                );
            } else {
                container.appendChild(
                    createSchoolFile(item, current.manifest)
                );
            }
        });

    } catch (error) {
        if (token !== schoolRenderToken) return;

        container.replaceChildren();

        const failure = document.createElement("div");

        failure.className = "empty-state";
        failure.textContent =
            `COULD NOT LOAD DIRECTORY: ${error.message}`;

        container.appendChild(failure);

        console.error("School directory error:", error);
    }
}

function goBackSchoolFolder() {
    if (schoolDirectoryStack.length > 1) {
        schoolDirectoryStack.pop();
        renderSchoolDirectory();
    }
}

document.getElementById("school-folder-back")
    ?.addEventListener("click", goBackSchoolFolder);

/* INITIALIZATION */

renderConfiguredList(
    "links-list",
    LINKS,
    "No links configured yet. Add your destinations to the LINKS array in script.js."
);

renderSchoolDirectory();

const aboutGallery = document.getElementById("about-gallery");

if (aboutGallery) {
    ABOUT_IMAGES.forEach((src, index) => {
        const image = document.createElement("img");

        image.src = src;
        image.alt = `About Mahdi image ${index + 1}`;
        image.loading = "lazy";

        aboutGallery.appendChild(image);
    });
}

/* GITHUB REPOSITORIES */

let repositoriesLoaded = false;
let loadingRepositories = false;

async function loadRepositories() {
    if (repositoriesLoaded || loadingRepositories) return;

    const list = document.getElementById("repo-list");
    const status = document.getElementById("repo-status");

    if (!list || !status) return;

    loadingRepositories = true;

    status.textContent = "FETCHING PUBLIC REPOSITORIES...";
    list.replaceChildren();

    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        );

        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "GitHub user not found."
                    : `GitHub returned HTTP ${response.status}.`
            );
        }

        const repositories = await response.json();

        repositories.sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );

        if (!repositories.length) {
            status.textContent = "0 PUBLIC REPOSITORIES";

            const empty = document.createElement("div");

            empty.className = "empty-state";
            empty.textContent = "No public repositories found.";

            list.appendChild(empty);
        } else {
            status.textContent = `${repositories.length} PUBLIC REPOSITORIES`;

            repositories.forEach(repo => {
                const details = [
                    repo.language || "Unspecified",
                    `★ ${repo.stargazers_count}`,
                    repo.fork ? "FORK" : ""
                ].filter(Boolean).join("  ·  ");

                list.appendChild(
                    createItem(
                        {
                            name: repo.name,
                            description:
                                repo.description || "No description provided.",
                            url: repo.html_url
                        },
                        details
                    )
                );
            });
        }

        repositoriesLoaded = true;
    } catch (error) {
        status.textContent = "COULD NOT LOAD REPOSITORIES";

        const message = document.createElement("div");

        message.className = "empty-state";
        message.textContent =
            "Check your connection or open the GitHub profile directly.";

        list.appendChild(message);

        console.error("GitHub repository error:", error);
    } finally {
        loadingRepositories = false;
    }
}

const githubProfile = document.getElementById("github-profile");

if (githubProfile) {
    githubProfile.href = `https://github.com/${GITHUB_USERNAME}`;
}

/* FOOTER */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/* CLOCK */

function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    clock.textContent = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

updateClock();
setInterval(updateClock, 1000);
