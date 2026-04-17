const API_URL = ""; // Assuming relative path since it's hosted on the same domain

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    loadDashboardStats();
    
    // Attach event listeners
    document.getElementById("explore-search-btn").addEventListener("click", () => {
        const q = document.getElementById("explore-search-input").value;
        loadExploreData(q);
    });

    document.getElementById("explore-search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const q = document.getElementById("explore-search-input").value;
            loadExploreData(q);
        }
    });

    document.getElementById("harvest-btn").addEventListener("click", triggerHarvest);

    // Initial load for explore tab
    loadExploreData();

    // Initialize Swagger UI
    initSwaggerUI();
});

// --- Swagger UI Logic ---
function initSwaggerUI() {
    if (window.SwaggerUIBundle) {
        window.ui = SwaggerUIBundle({
            url: "/swagger.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout"
        });
    }
}

// --- Tab Navigation ---
function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const views = document.querySelectorAll(".view-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            views.forEach(v => v.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.dataset.target).classList.add("active");
        });
    });
}

// --- Dashboard Logic ---
async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/publications/stats/summary`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();

        document.getElementById("stat-total-publications").textContent = data.total;

        // Render Top Years
        const yearsList = document.getElementById("top-years-list");
        yearsList.innerHTML = "";
        data.topYears.forEach(item => {
            yearsList.innerHTML += `
                <div class="list-item">
                    <span>${item.year}</span>
                    <span class="item-count">${item._count.id}</span>
                </div>
            `;
        });
        if(data.topYears.length === 0) yearsList.innerHTML = "<p>No data</p>";

        // Render Top Venues
        const venuesList = document.getElementById("top-venues-list");
        venuesList.innerHTML = "";
        data.topVenues.forEach(item => {
            const venueName = item.venue || "Unknown Venue";
            venuesList.innerHTML += `
                <div class="list-item">
                    <span title="${venueName}">${venueName.length > 30 ? venueName.substring(0, 30) + "..." : venueName}</span>
                    <span class="item-count">${item._count.id}</span>
                </div>
            `;
        });
        if(data.topVenues.length === 0) venuesList.innerHTML = "<p>No data</p>";

    } catch (err) {
        console.error(err);
        document.getElementById("top-years-list").innerHTML = "<p class='status-error'>Failed to load data</p>";
        document.getElementById("top-venues-list").innerHTML = "<p class='status-error'>Failed to load data</p>";
    }
}

// --- Explore Logic ---
async function loadExploreData(query = "") {
    const tbody = document.getElementById("explore-table-body");
    tbody.innerHTML = `<tr><td colspan="4"><div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></td></tr>`;

    try {
        let endpoint = `${API_URL}/publications`;
        if (query.trim() !== "") {
            endpoint = `${API_URL}/publications/search/all?q=${encodeURIComponent(query)}`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();
        
        const items = query ? data.items : data.items; // Depends on api response structure

        tbody.innerHTML = "";
        if (!items || items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No publications found</td></tr>`;
            return;
        }

        items.forEach(item => {
            const titleLink = item.url ? `<a href="${item.url}" target="_blank">${item.title}</a>` : item.title || "Untitled";
            tbody.innerHTML += `
                <tr>
                    <td>${titleLink}</td>
                    <td>${item.venue || "Unknown"}</td>
                    <td>${item.year || "-"}</td>
                    <td><span class="item-count">${item.citations}</span></td>
                </tr>
            `;
        });

    } catch(err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4" class="status-error" style="text-align:center;">Failed to fetch publications</td></tr>`;
    }
}

// --- Harvester Logic ---
async function triggerHarvest() {
    const query = document.getElementById("harvest-query").value;
    const limit = document.getElementById("harvest-limit").value;
    const btn = document.getElementById("harvest-btn");
    const statusMsg = document.getElementById("harvest-status");

    if (!query.trim()) {
        statusMsg.innerHTML = '<span class="status-error">Please enter a valid query</span>';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Harvesting...';
    statusMsg.innerHTML = "";

    try {
        const res = await fetch(`${API_URL}/collect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, limit: parseInt(limit, 10) })
        });
        
        const data = await res.json();

        if (res.ok) {
            statusMsg.innerHTML = `<span class="status-success"><i class="fa-solid fa-check"></i> ${data.message}. Saved: ${data.result?.saved || 0} items!</span>`;
            // Refresh dashboard in background after successful harvest
            loadDashboardStats(); 
            // Return to Explore logic to see new entries
            loadExploreData();
        } else {
            throw new Error(data.error || "Unknown error");
        }
    } catch (err) {
        statusMsg.innerHTML = `<span class="status-error"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${err.message}</span>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Start Harvesting';
    }
}
