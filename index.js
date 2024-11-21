let cachedData = null;
AOS.init();
async function fetchData() {
    // Menampilkan layar loading saat data mulai dimuat
    document.getElementById('loadingScreen').style.display = 'flex';

    // Menggunakan cache untuk menghindari permintaan berulang
    if (cachedData) {
        document.getElementById('loadingScreen').style.display = 'none';  // Menyembunyikan layar loading setelah data tersedia
        return cachedData;
    }

    try {
        const response = await fetch('./datasuperstore.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        cachedData = await response.json();  // Cache data setelah berhasil
        document.getElementById('loadingScreen').style.display = 'none';  // Menyembunyikan layar loading setelah data berhasil dimuat
        return cachedData;
    } catch (error) {
        console.error("Failed to fetch data:", error);
        document.getElementById('loadingScreen').style.display = 'none';  // Menyembunyikan layar loading meskipun terjadi error
        throw error;  // Propagate error jika perlu ditangani lebih lanjut di tempat lain
    }
}



function initFilters(data) {
    const yearSet = new Set();
    const citySet = new Set();
    const stateSet = new Set();
    const categorySet = new Set();

    data.forEach(row => {
        yearSet.add(new Date(row['Order Date']).getFullYear());
        citySet.add(row.City);
        stateSet.add(row.State);
        categorySet.add(row.Category);
    });

    populateFilterOptions('yearFilter', Array.from(yearSet).sort());
    populateFilterOptions('cityFilter', Array.from(citySet).sort());
    populateFilterOptions('stateFilter', Array.from(stateSet).sort());
    populateFilterOptions('categoryFilter', Array.from(categorySet).sort());
}

function populateFilterOptions(elementId, options) {
    const filterContainer = document.getElementById(elementId);
    options.forEach(value => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.className = 'filter-checkbox';

        const label = document.createElement('label');
        label.textContent = value;
        label.appendChild(checkbox);

        const container = document.createElement('div');
        container.className = 'checkbox-container';
        container.appendChild(checkbox);
        container.appendChild(label);

        filterContainer.appendChild(container);
    });
}

function toggleDropdown(elementId) {
    const dropdown = document.getElementById(elementId).parentElement;
    dropdown.classList.toggle('open');
}

function getSelectedValues(elementId) {
    const checkboxes = document.querySelectorAll(`#${elementId} .filter-checkbox`);
    return Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

function filterData(data) {
    const selectedYears = getSelectedValues('yearFilter');
    const selectedCity = getSelectedValues('cityFilter');
    const selectedStates = getSelectedValues('stateFilter');
    const selectedCategories = getSelectedValues('categoryFilter');

    return data.filter(row => {
        const rowYear = new Date(row['Order Date']).getFullYear().toString();
        return (selectedYears.length === 0 || selectedYears.includes(rowYear)) &&
               (selectedCity.length === 0 || selectedCity.includes(row.City)) &&
               (selectedStates.length === 0 || selectedStates.includes(row.State)) &&
               (selectedCategories.length === 0 || selectedCategories.includes(row.Category));
    });
}

// Toggle User Dropdown Menu
function toggleUserMenu() {
    const userMenu = document.getElementById("userMenu");
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
}


// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const openDropdowns = document.querySelectorAll('.dropdown.open');
    openDropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });
});

// Toggle sidebar visibility
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector("#sidebarToggle");

    // Cek lebar layar saat halaman dimuat pertama kali
    if (window.innerWidth <= 768) {
        sidebar.classList.add("hidden");
    }

    toggleButton.addEventListener("click", function () {
        sidebar.classList.toggle("hidden");
        toggleButton.classList.toggle("active");
    });

    // Responsif: Mengatur ulang tampilan sidebar saat ukuran layar berubah
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("hidden");
            toggleButton.classList.remove("active");
        } else {
            sidebar.classList.add("hidden");
        }
    });
});


  
  


// Calculate and display summary metrics
function updateSummary(data) {
    // Calculate total sales
    const totalSales = data.reduce((sum, row) => sum + row.Sales, 0);
    document.getElementById('totalSales').textContent = `$${totalSales.toFixed(2)}`;

    // Calculate average discount
    const avgDiscount = data.reduce((sum, row) => sum + row.Discount, 0) / data.length;
    document.getElementById('averageDiscount').textContent = ` ${(avgDiscount * 100).toFixed(2)}%`;

    // Calculate average sales
    const avgSales = totalSales / data.length;
    document.getElementById('averageSales').textContent = `$${avgSales.toFixed(2)}`;

    // Find the most frequent customer
    const customerCounts = {};
    data.forEach(row => {
        const customer = row['Customer Name'];
        if (!customerCounts[customer]) {
            customerCounts[customer] = 0;
        }
        customerCounts[customer]++;
    });
    const mostFrequentCustomer = Object.keys(customerCounts).reduce((a, b) => customerCounts[a] > customerCounts[b] ? a : b);
    document.getElementById('mostFrequentCustomer').textContent = ` ${mostFrequentCustomer}`;

    // Calculate order date range
    const orderDates = data.map(row => new Date(row['Order Date']));
    const minOrderDate = new Date(Math.min(...orderDates)).toLocaleDateString();
    const maxOrderDate = new Date(Math.max(...orderDates)).toLocaleDateString();
    document.getElementById('orderDateRange').textContent = ` ${minOrderDate} - ${maxOrderDate}`;
}

// Create charts
let 
discountSalesChartInstance, 
salesProfitQuantityChartInstance, 
avgDiscountPerYearChartInstance, 
profitMarginChartInstance,

salesByCategoryChartInstance, 
salesTrendChartInstance, 
topCitiesChartInstance, 
shipModeChartInstance, 
segmentChartInstance;



function createCharts(data) {
    if (discountSalesChartInstance) discountSalesChartInstance.destroy();
    if (salesProfitQuantityChartInstance) salesProfitQuantityChartInstance.destroy();
    if (avgDiscountPerYearChartInstance) avgDiscountPerYearChartInstance.destroy();
    if (profitMarginChartInstance) profitMarginChartInstance.destroy();

    if (salesByCategoryChartInstance) salesByCategoryChartInstance.destroy();
    if (salesTrendChartInstance) salesTrendChartInstance.destroy();
    if (topCitiesChartInstance) topCitiesChartInstance.destroy();
    if (shipModeChartInstance) shipModeChartInstance.destroy();
    if (segmentChartInstance) segmentChartInstance.destroy();


    discountSalesChartInstance = createDiscountSalesChart(data);
    salesProfitQuantityChartInstance = createSalesProfitQuantityChart(data);
    avgDiscountPerYearChartInstance = createAvgDiscountPerYearChart(data);
    profitMarginChartInstance = createProfitMarginChart(data);

    salesByCategoryChartInstance = createSalesByCategoryChart(data);
    salesTrendChartInstance = createSalesTrendChart(data);
    topCitiesChartInstance = createTopCitiesChart(data);
    shipModeChartInstance = createShipModeChart(data);
    segmentChartInstance = createSegmentChart(data);


}

// Create Discount Sales Chart
function createDiscountSalesChart(data) {
    const ctx = document.getElementById('discountSalesChart').getContext('2d');
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredData = selectedCategory ? data.filter(item => item.Category === selectedCategory) : data;

    const maxDataPoints = 10; 
    const limitedData = filteredData.slice(0, maxDataPoints);
   
    const cities = limitedData.map(item => item.City);
    const discounts = limitedData.map(item => item.Discount);
    const sales = limitedData.map(item => item.Sales);

    if (window.discountSalesChartInstance) {
        window.discountSalesChartInstance.destroy();
    }

    window.discountSalesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cities,
            datasets: [{
                label: 'Discount',
                data: discounts,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'Sales',
                data: sales,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 1,
                  to: 0,
                  loop: true
                }
              },
            plugins: {
                tooltip: {
                    backgroundColor: '#00ADB5', // Teal tooltip background
                    bodyColor: '#FFFFFF', // White text color
                    titleColor: '#FFFFFF', // White title
                },
            },
            dragData: {
				round: 1, // rounds the values to n decimal places
				// in this case 1, e.g 0.1234 => 0.1)
				showTooltip: true, // show the tooltip while dragging [default = true]
				// dragX: true // also enable dragging along the x-axis.
				// this solely works for continous, numerical x-axis scales (no categories or dates)!
				onDragStart: function (event, datasetIndex, index, value) {
					// you may use this callback to prohibit dragging certain datapoints
					// by returning false in this callback
					if (element.datasetIndex === 0 && element.index === 0) {
						// this would prohibit dragging the first datapoint in the first
						//dataset entirely
						return false;
					}
				},
				onDrag: function (event, datasetIndex, index, value) {
					// you may control the range in which datapoints are allowed to be
					// dragged by returning `false` in this callback
					if (value < 0) return false; // this only allows positive values
					if (datasetIndex === 0 && index === 0 && value > 20) return false;
				},
				onDragEnd: function (event, datasetIndex, index, value) {
					// you may use this callback to store the final datapoint value
					// (after dragging) in a database, or update other UI elements that
					// dependent on it
				},
			},
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'City'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}

function createSalesProfitQuantityChart(data) {
    const ctx = document.getElementById('salesProfitQuantityChart').getContext('2d');
    
    // Ambil data untuk kategori yang sesuai dengan filter
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredData = selectedCategory ? data.filter(item => item.Category === selectedCategory) : data;

    // Membatasi jumlah data yang ditampilkan agar tidak terlalu banyak
    const maxDataPoints = 10; // Jumlah data yang ingin ditampilkan secara default
    const limitedData = filteredData.slice(0, maxDataPoints);

    const sales = limitedData.map(item => item.Sales);
    const profitQuantity = limitedData.map(item => item["Profit/Quantity"]);

    // Jika chart sudah ada, hancurkan dulu
    if (window.salesProfitQuantityChartInstance) {
        window.salesProfitQuantityChartInstance.destroy();
    }

    window.salesProfitQuantityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: limitedData.map(item => item.City), // Gunakan Kota sebagai label
            datasets: [
                {
                    label: 'Sales', // Label untuk Diskon
                    data: sales,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Profit/Quantity', // Label untuk Profit/Quantity
                    data: profitQuantity,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 1,
                  to: 0,
                  loop: true
                }
              },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'City' // Label untuk sumbu X
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount' // Label untuk sumbu Y
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}




function createAvgDiscountPerYearChart(data) {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const selectedYear = document.getElementById('yearFilter').value;

    // Filter data sesuai dengan kategori dan tahun
    const filteredData = data.filter(item => {
        const itemYear = new Date(item['Order Date']).getFullYear().toString();
        return (!selectedCategory || item.Category === selectedCategory) && 
               (!selectedYear || itemYear === selectedYear);
    });

    const avgDiscountPerYear = {};
    filteredData.forEach(row => {
        const year = new Date(row['Order Date']).getFullYear();
        if (!avgDiscountPerYear[year]) {
            avgDiscountPerYear[year] = { totalDiscount: 0, count: 0 };
        }
        avgDiscountPerYear[year].totalDiscount += row.Discount;
        avgDiscountPerYear[year].count++;
    });

    const years = Object.keys(avgDiscountPerYear);
    const avgDiscounts = years.map(year => avgDiscountPerYear[year].totalDiscount / avgDiscountPerYear[year].count);

    const ctx = document.getElementById('avgDiscountPerYearChart').getContext('2d');

    if (window.avgDiscountPerYearChartInstance) {
        window.avgDiscountPerYearChartInstance.destroy();
    }

    window.avgDiscountPerYearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Average Discount',
                data: avgDiscounts,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}


function createProfitMarginChart(data) {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredData = selectedCategory ? data.filter(item => item.Category === selectedCategory) : data;

    const profitMargins = filteredData.map(row => row.Profit / row.Sales);
    const categories = filteredData.map(row => row.Category);

    const categoryProfitMargins = {};
    categories.forEach((category, index) => {
        if (!categoryProfitMargins[category]) {
            categoryProfitMargins[category] = [];
        }
        categoryProfitMargins[category].push(profitMargins[index]);
    });

    const chartLabels = Object.keys(categoryProfitMargins);
    const chartData = chartLabels.map(label => {
        const totalMargin = categoryProfitMargins[label].reduce((sum, margin) => sum + margin, 0);
        return totalMargin / categoryProfitMargins[label].length;  // Average profit margin per category
    });

    const ctx = document.getElementById('profitMarginChart').getContext('2d');

    if (window.profitMarginChartInstance) {
        window.profitMarginChartInstance.destroy();
    }

    window.profitMarginChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Profit Margin by Category',
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
        }
    });
}



// Create Sales by Category Chart
function createSalesByCategoryChart(data) {
    // Dapatkan elemen canvas untuk chart
    const ctx = document.getElementById('salesByCategoryChart').getContext('2d');

    // Hitung total sales berdasarkan kategori
    const categorySales = {};
    data.forEach(row => {
        const category = row.Category;
        if (!categorySales[category]) {
            categorySales[category] = 0;
        }
        categorySales[category] += row.Sales;
    });

    // Hanya tampilkan kategori yang sesuai dengan filter
    const selectedCategory = document.getElementById('categoryFilter').value;
    const labels = selectedCategory ? [selectedCategory] : Object.keys(categorySales);
    const salesData = selectedCategory ? [categorySales[selectedCategory] || 0] : Object.values(categorySales);

    // Hapus instance chart sebelumnya jika ada
    if (window.salesByCategoryChartInstance) {
        window.salesByCategoryChartInstance.destroy();
    }

    // Buat chart baru dengan data yang difilter
    window.salesByCategoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: salesData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: { beginAtZero: true }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}


// Sales Trend Chart
function createSalesTrendChart(data) {
    const salesTrendData = {};
    data.forEach(row => {
        const monthYear = new Date(row['Order Date']).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!salesTrendData[monthYear]) {
            salesTrendData[monthYear] = 0;
        }
        salesTrendData[monthYear] += row.Sales;
    });

    const labels = Object.keys(salesTrendData);
    const salesData = Object.values(salesTrendData);

    if (window.salesTrendChartInstance) {
        window.salesTrendChartInstance.destroy();
    }

    const ctx = document.getElementById('salesTrendChart').getContext('2d');
    window.salesTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales',
                data: salesData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 1,
                  to: 0,
                  loop: true
                }
              },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}


// Top Cities Chart
function createTopCitiesChart(data) {
    const citySalesData = {};
    data.forEach(row => {
        const city = row.City;
        if (!citySalesData[city]) {
            citySalesData[city] = 0;
        }
        citySalesData[city] += row.Sales;
    });

    const sortedCities = Object.entries(citySalesData).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sortedCities.map(entry => entry[0]);
    const salesData = sortedCities.map(entry => entry[1]);

    if (window.topCitiesChartInstance) {
        window.topCitiesChartInstance.destroy();
    }

    const ctx = document.getElementById('topCitiesChart').getContext('2d');
    window.topCitiesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales',
                data: salesData,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}


// Ship Mode Chart
function createShipModeChart(data) {
    const shipModeData = {};
    data.forEach(row => {
        const shipMode = row['Ship Mode'];
        if (!shipModeData[shipMode]) {
            shipModeData[shipMode] = 0;
        }
        shipModeData[shipMode] += row.Sales;
    });

    const labels = Object.keys(shipModeData);
    const salesData = Object.values(shipModeData);

    if (window.shipModeChartInstance) {
        window.shipModeChartInstance.destroy();
    }

    const ctx = document.getElementById('shipModeChart').getContext('2d');
    window.shipModeChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales by Ship Mode',
                data: salesData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
        }
    });
}


// Segment Chart
function createSegmentChart(data) {
    const segmentData = {};
    data.forEach(row => {
        const segment = row.Segment;
        if (!segmentData[segment]) {
            segmentData[segment] = 0;
        }
        segmentData[segment] += row.Sales;
    });

    const labels = Object.keys(segmentData);
    const salesData = Object.values(segmentData);

    if (window.segmentChartInstance) {
        window.segmentChartInstance.destroy();
    }

    const ctx = document.getElementById('segmentChart').getContext('2d');
    window.segmentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales by Segment',
                data: salesData,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false, // Makes the hover effect more forgiving
            },
        }
    });
}


// Calculate sales for a specific category
function calculateSales(data, category) {
    return data
        .filter(row => row.Category === category)
        .reduce((sum, row) => sum + row.Sales, 0);
}

function initMap(data) {
    if (window.mapInstance) {
        window.mapInstance.remove();
    }

    const map = L.map('map').setView([37.8, -96], 4);
    window.mapInstance = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Apply the filter logic to data
    const filteredData = filterData(data); // Assuming filterData is already defined for other filters

    // Kelompokkan data penjualan berdasarkan negara bagian setelah difilter
    const salesByState = {};
    filteredData.forEach(row => {
        const state = row.State;
        if (!salesByState[state]) {
            salesByState[state] = 0;
        }
        salesByState[state] += row.Sales;
    });

    // Fungsi untuk mendapatkan warna berdasarkan penjualan
    function getColor(sales) {
        return sales > 100000 ? '#800026' :
               sales > 50000  ? '#BD0026' :
               sales > 20000  ? '#E31A1C' :
               sales > 10000  ? '#FC4E2A' :
               sales > 5000   ? '#FD8D3C' :
               sales > 2000   ? '#FEB24C' :
               sales > 1000   ? '#FED976' :
                               '#FFEDA0';
    }

    // Define the style for GeoJSON features (states)
    function style(feature) {
        const stateSales = salesByState[feature.properties.name] || 0;
        return {
            fillColor: getColor(stateSales),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    // Function for hover interaction and popup
    function highlightFeature(e) {
        var layer = e.target;
        const stateName = layer.feature.properties.name;
        const sales = salesByState[stateName] || 0;
        info.update({ name: stateName, sales: sales });

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        layer.bringToFront();
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    // Info Control (Display information on hover)
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Sales Info</h4>' + (props ? 
            '<b>' + props.name + '</b><br />' + 
            'Sales: $' + props.sales.toFixed(2) : 'Hover over a state');
    };

    info.addTo(map);

    // Load GeoJSON data for U.S. states
    fetch('./us.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            // Add GeoJSON data to the map
            const geojson = L.geoJson(geojsonData, {
                style: style,
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: zoomToFeature
                    });
                }
            }).addTo(map);

            // Make geojson accessible for resetHighlight function
            window.geojson = geojson;
        })
        .catch(error => console.error('Error loading GeoJSON data:', error));
}




// Main function to load data and initialize dashboard
async function initDashboard() {
    const data = await fetchData();
    initFilters(data);
    updateSummary(data);
    initMap(data);
    createCharts(data);
}

// Add event listener to the filter button
document.getElementById('filterButton').addEventListener('click', async () => {
    const data = await fetchData();
    const filteredData = filterData(data);
    updateSummary(filteredData);
    initMap(filteredData);
    createCharts(filteredData);
});

// Call the initDashboard function
initDashboard();
