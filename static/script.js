let logInterval = null;
// Fetch data from backend
async function fetchData(endpoint) {
    const response = await fetch(endpoint);
    return response.json();
}

// Populate dropdowns dynamically
function populateDropdown(id, items) {
    const select = document.getElementById(id);
    select.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join("");

    if (items.length > 0) {
        select.value = items[0]; // Select first item by default
        select.dispatchEvent(new Event("change")); // Trigger change event
    }
}

// Fetch namespaces on page load
window.onload = async () => {
    const namespaces = await fetchData("/api/namespaces");
    populateDropdown("namespaceDropdown", namespaces);
};

// Fetch pods when namespace is selected
document.getElementById("namespaceDropdown").addEventListener("change", async () => {
    const namespace = document.getElementById("namespaceDropdown").value;
    const pods = await fetchData(`/api/pods/${namespace}`);
    populateDropdown("podDropdown", pods);
    document.getElementById("containerDropdown").innerHTML = ""; // Clear containers dropdown
});

// Fetch containers when pod is selected
document.getElementById("podDropdown").addEventListener("change", async () => {
    const namespace = document.getElementById("namespaceDropdown").value;
    const pod = document.getElementById("podDropdown").value;
    const containers = await fetchData(`/api/pods/containers/${namespace}/${pod}`);
    populateDropdown("containerDropdown", containers);
});

async function startLogStreaming() {
    if (logInterval) clearInterval(logInterval);

    logInterval = setInterval(fetchLogs, 4500);
    fetchLogs();
}

async function fetchLogs() {
    const namespace = document.getElementById("namespaceDropdown").value;
    const pod = document.getElementById("podDropdown").value;
    const container = document.getElementById("containerDropdown").value;

    if (!namespace || !pod || !container) {
        alert("Please select a namespace, pod, and container.");
        return;
    }

    const logsContainer = document.getElementById("logsContainer");
    const shouldScroll = logsContainer.scrollHeight - logsContainer.clientHeight <= logsContainer.scrollTop + 1;

    try{
        const logs = await fetchData(`/api/logs/${namespace}/${pod}/${container}`);
        logsContainer.innerHTML = logs.map(log => {
            const formattedTime = log.timestamp ? new Date(log.timestamp).toLocaleString() : "No Timestamp";
            return `<div><strong>[${formattedTime}]</strong> ${log.message}</div>`;
        }
        ).join("");
        if (shouldScroll) {
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
    } catch (error) {
        logsContainer.innerHTML = `<p style="color: red;">Error fetching logs: ${error.message}</p>`;
    }
}