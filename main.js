let chart;
let currentTicker = null;

const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

// Send a request to the backend and trigger all render functions
function searchTicker(tickerFromUrl = null) {
    const ticker = (tickerFromUrl || searchInput.value).trim();
    const errorMessage = document.getElementById("error-message");
    const downloadContainer = document.getElementById("download-container");

    errorMessage.style.display = "none";
    downloadContainer.style.display = "none";

    if (!ticker) return;

    fetch(`/search?ticker=${ticker}`)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.info || !data.prices || data.prices.length === 0) {
                document.title = "Terminal";
                errorMessage.textContent = "Please type a valid ticker";
                errorMessage.style.display = "block";
                return;
            }

            renderInfo(data.info);
            renderPrice(data.price);
            renderChart(data.prices);
            if (Array.isArray(data.metrics)) {
                renderMetrics(data.metrics);
            }
            if (Array.isArray(data.news)) {
                renderNews(data.news);
            }

            const welcome = document.getElementById("welcome-state");
            if (welcome) welcome.style.display = "none";

            document.title = `Terminal | ${ticker.toUpperCase()}`;
            downloadContainer.style.display = "block";

            currentTicker = ticker.toUpperCase();
            searchInput.value = "";
        })
        .catch(err => {
            console.error(err);
            document.title = "Terminal";
            errorMessage.textContent = "An error ocurred. Please try again.";
            errorMessage.style.display = "block";
        });
}

searchButton.addEventListener("click", searchTicker);
searchInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        searchTicker();
    }
});

function renderInfo(info) {
    document.getElementById("info").innerHTML = `
        <h2 class="company-name">${info.name}</h2>
        <p class="company-meta">${info.sector} - ${info.industry}</p>
        <p class="company-description">${info.description}</p>
    `;
}

function renderPrice(price) {
    if (!price || price.price === null) return;

    const bar = document.getElementById("price-bar");
    const priceEl = document.getElementById("current-price");
    const changeEl = document.getElementById("price-change");

    priceEl.textContent = `$${price.price.toFixed(2)}`;

    const sign = price.change >= 0 ? "+" : "";
    changeEl.textContent = `${sign}${price.change.toFixed(2)} (${sign}${price.change_pct.toFixed(2)}%)`;

    changeEl.className = price.change >= 0
        ? "price-up"
        : "price-down";

    bar.style.display = "flex";
}

function renderChart(prices) {
    const labels = prices.map(p => p.Date);
    const values = prices.map(p => p.Close);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Closing Price (USD)",
                data: values,
                borderWidth: 1,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#f5a623",
                        font: {
                            family: "IBM Plex Mono",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const price = context.parsed.y.toFixed(2);
                            return `Price: $${price}`;
                        },
                        title: function(context) {
                            return `Date: ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#f5a623",
                        maxTicksLimit: 8,
                        callback: function(value, index) {
                            const date = new Date(this.chart.data.labels[index]);

                            return date.toLocaleDateString("en-US", {
                                year: "2-digit",
                                month: "short"
                            });
                        }
                    }
                },
                y: {
                    ticks: {
                        color: "#f5a623",
                        callback: value => `$${value}`
                    }
                }
            }
        }
    });
}

function renderMetrics(metrics) {
    const panel = document.getElementById("metrics-panel");
    const container = document.getElementById("metrics-container");

    if (!panel || !container) {
        console.warn("Metrics panel not found in DOM");
        return;
    }

    panel.style.display = "block";
    container.innerHTML = "";

    metrics.forEach(([key, value]) => {
        const row = document.createElement("div");
        row.className = "metric-row";

        row.innerHTML = `
            <span class="metric-label">${key}</span>
            <span class="metric-value">${value}</span>
        `;

        container.appendChild(row);
    });
}

function renderNews(news) {
    const container = document.getElementById("news-container");
    const list = document.getElementById("news-list");

    if (!container || !list) return;

    list.innerHTML = "";

    if (!Array.isArray(news) || news.length === 0) {
        container.style.display = "none";
        return;
    }

    news.forEach(item => {
        const li = document.createElement("li");

        const date = item.time
            ? new Date(item.time).toLocaleDateString()
            : "";

        li.innerHTML = `
            <a href="${item.link}" target="_blank">
                ${item.title || "Untitled article"}
            </a>
            <span class="news-meta">
                ${(item.publisher || "").trim()}${date ? " • " + date : ""}
            </span>
`       ;

        list.appendChild(li);
    });

    container.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    const freqInput = document.getElementById("freq");
    const yearsInput = document.getElementById("years");
    const downloadButton = document.getElementById("download-button");

    function validateDownloadInputs() {
        const freqValid = freqInput.value !== "";
        const yearsValid = yearsInput.value !== "" && Number(yearsInput.value) > 0;

        downloadButton.disabled = !(freqValid && yearsValid);
    }

    freqInput.addEventListener("change", validateDownloadInputs);
    yearsInput.addEventListener("input", validateDownloadInputs);
});

function download() {
    const ticker = currentTicker;
    const freq = document.getElementById("freq").value;
    const years = document.getElementById("years").value;

    if (!ticker) {
        alert("No ticker selected");
        return;
    }

    window.location = `/download?ticker=${ticker}&freq=${freq}&years=${years}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker");

    if (ticker) {
        searchInput.value = ticker;
        searchTicker(ticker);
    }
});

function resetToHome() {
    document.title = "Terminal";

    // Clear content areas
    document.getElementById("info").innerHTML = "";
    const metricsPanel = document.getElementById("metrics-panel");
    if (metricsPanel) {
        metricsPanel.style.display = "none";
    }
    document.getElementById("download-container").style.display = "none";
    const newsContainer = document.getElementById("news-container");
    if (newsContainer) newsContainer.style.display = "none";

    const priceBar = document.getElementById("price-bar");
    if (priceBar) priceBar.style.display = "none";

    if (chart) {
        chart.destroy();
        chart = null;
    }

    const welcome = document.getElementById("welcome-state");
    if (welcome) welcome.style.display = "block";

    searchInput.value = "";
    searchInput.focus();

    // Clear URL query params
    window.history.pushState({}, "", "/");
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        resetToHome();
    }
});
