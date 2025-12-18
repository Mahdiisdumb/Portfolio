  const mahdi = document.getElementById('Mahdi');
  const punchSound = document.getElementById('punchSound');

  mahdi.addEventListener('click', () => {
    // Play punch sound
    punchSound.currentTime = 0;
    punchSound.play();

    // Animate punch
    mahdi.classList.remove('punched');
    void mahdi.offsetWidth; // trigger reflow
    mahdi.classList.add('punched');
  });
  // GitHub username
const username = "Mahdiisdumb";

// Fetch GitHub repositories
async function fetchRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await response.json();

        const projectsContainer = document.getElementById("projects");
        projectsContainer.innerHTML = ""; // Clear existing content

        // Sort repos by most recently updated
        repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        repos.forEach(repo => {
            const link = document.createElement("a");
            link.href = repo.html_url;
            link.target = "_blank";
            link.textContent = repo.name;
            projectsContainer.appendChild(link);
        });
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
    }
}

// Call the function
fetchRepos();
// --- FOOTPRINT LINKS CONFIG ---
const footprintLinks = [
    {
        name: "Mahdi Studios",
        url: "https://sites.google.com/nj.spboe.org/mahdi-studios/home",
        img: "./img/Mahdi Studios Logo.png"
    },
    {
        name: "YouTube",
        url: "https://www.youtube.com/@Mahdiisdumb",
        img: "./img/mahdiisdumb.jpg"
    },
    {
        name: "Project SDSG",
        url: "https://project-sdsg.vercel.app",
        img: "./img/SDSG Logo.jpeg"
    },
    {
        name: "GitHub",
        url: "https://github.com/Mahdiisdumb",
        img: "./img/github.png"
    }
];
function renderFootprint() {
    const container = document.getElementById("footprint-links");
    container.innerHTML = ""; // Clear existing content

    footprintLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";

        const img = document.createElement("img");
        img.src = link.img;
        img.alt = link.name;
        img.classList.add("footprint");

        a.appendChild(img);
        container.appendChild(a);
    });
}

// Call it
renderFootprint();