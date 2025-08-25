// Back to top button
var btn = $('#backtotop');

$(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
        btn.addClass('show');
    } else {
       btn.removeClass('show');
    }
});

btn.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, '300');
});

window.onload = function() {
    document.querySelector('.preloader').style.display = 'none';
}

// Product point values
const products = {
    card: { name: "Card", points: 100 },
    phinhxanh: { name: "Phỉnh Xanh", points: 50 },
    phinhdo: { name: "Phỉnh Đỏ", points: 50 },
    coin: { name: "80 Phiếu", points: 1 },
    gift2: { name: "Quà hạng 2", points: 800 },
    gift3: { name: "Quà hạng 3", points: 400 }
};

// Daily report data structure
let dailyReport = {
    date: getCurrentDate(),
    exchanges: [],
    totals: {
        totalExchanges: 0,
        totalPoints: 0,
        totalItems: 0,
        products: {}
    }
};

// Initialize daily report from localStorage
function initializeDailyReport() {
    const savedReport = localStorage.getItem('dailyReport');
    if (savedReport) {
        const parsed = JSON.parse(savedReport);
        // Check if it's from today
        if (parsed.date === getCurrentDate()) {
            dailyReport = parsed;
        } else {
            // Reset for new day
            dailyReport = {
                date: getCurrentDate(),
                exchanges: [],
                totals: {
                    totalExchanges: 0,
                    totalPoints: 0,
                    totalItems: 0,
                    products: {}
                }
            };
            saveDailyReport();
        }
    } else {
        saveDailyReport();
    }
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Save daily report to localStorage
function saveDailyReport() {
    localStorage.setItem('dailyReport', JSON.stringify(dailyReport));
}

// Add exchange to daily report
function addExchangeToReport(exchangeData) {
    dailyReport.exchanges.push(exchangeData);
    dailyReport.totals.totalExchanges++;
    dailyReport.totals.totalPoints += exchangeData.totalPoints;
    
    // Update product totals
    for (const [productId, quantity] of Object.entries(exchangeData.items)) {
        if (quantity > 0) {
            const product = products[productId];
            if (!dailyReport.totals.products[productId]) {
                dailyReport.totals.products[productId] = {
                    name: product.name,
                    quantity: 0,
                    points: 0
                };
            }
            dailyReport.totals.products[productId].quantity += quantity;
            dailyReport.totals.products[productId].points += quantity * product.points;
            dailyReport.totals.totalItems += quantity;
        }
    }
    
    saveDailyReport();
}

// User's current points balance
// let userPoints = 10000;

// Adjust quantity for a product
function adjustQuantity(productId, change) {
    const input = document.getElementById(`${productId}-qty`);
    let newValue = parseInt(input.value) + change;
    if (newValue < 0) newValue = 0;
    input.value = newValue;
    updateSummary();
}

// Update the summary section
function updateSummary() {
    let subtotal = 0;
    let hasItems = false;
    const selectedItemsContainer = document.getElementById('selectedItems');
    
    // Clear previous items
    selectedItemsContainer.innerHTML = '';
    
    // Calculate subtotal and build selected items list
    for (const [productId, product] of Object.entries(products)) {
        const quantity = parseInt(document.getElementById(`${productId}-qty`).value);
        if (quantity > 0) {
            hasItems = true;
            const itemPoints = quantity * product.points;
            subtotal += itemPoints;
            
            // Add item to the selected items list
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg';
            itemElement.innerHTML = `
                <div>
                    <span class="font-medium">${product.name}</span>
                    <span class="text-sm text-gray-500 block">${product.points} Phiếu × ${quantity}</span>
                </div>
                <span class="font-medium"> = ${itemPoints} Phiếu</span>
            `;
            selectedItemsContainer.appendChild(itemElement);
        }
    }
    
    // If no items selected, show placeholder
    if (!hasItems) {
        selectedItemsContainer.innerHTML = '<p class="text-gray-500 italic">Không có sản phẩm được chọn</p>';
    }
    
    // Update summary values
    document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} Phiếu`;
    
}

// Process the points exchange
function processExchange() {
    const subtotal = parseInt(document.getElementById('subtotal').textContent.replace(/,| pts/g, ''));
    // const remaining = userPoints - subtotal;
    
    if (subtotal > 0) {
        // Collect exchange data
        const exchangeData = {
            timestamp: new Date().toISOString(),
            totalPoints: subtotal,
            items: {}
        };
        
        // Build receipt and collect items
        const receiptItemsContainer = document.getElementById('receiptItems');
        receiptItemsContainer.innerHTML = '';
        
        for (const [productId, product] of Object.entries(products)) {
            const quantity = parseInt(document.getElementById(`${productId}-qty`).value);
            if (quantity > 0) {
                exchangeData.items[productId] = quantity;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between';
                itemElement.innerHTML = `
                    <span>${product.name} × ${quantity}</span>
                    <span> = ${(quantity * product.points).toLocaleString()} Phiếu</span>
                `;
                receiptItemsContainer.appendChild(itemElement);
            }
        }
        
        // Add to daily report
        addExchangeToReport(exchangeData);
        
        // Update receipt totals
        document.getElementById('receiptTotal').textContent = `${subtotal.toLocaleString()} Phiếu`;
        // document.getElementById('receiptBalance').textContent = `${remaining.toLocaleString()} pts`;
        
        // Show receipt and hide summary
        document.getElementById('receiptSection').classList.remove('hidden');
        document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');
        
        // Update points display in header
        // document.getElementById('totalPoints').textContent = remaining.toLocaleString();
    }
}

         // Print the exchange receipt
 function printReceipt() {
     const receiptContent = document.getElementById('receiptSection').cloneNode(true);
     
     // Remove buttons from print version
     const buttons = receiptContent.querySelector('.text-center.mt-6');
     buttons.remove();
     
     // Create print window
     const printWindow = window.open('', '', 'width=800,height=600');
     printWindow.document.write(`
         <!DOCTYPE html>
         <html>
         <head>
             <title>Phiếu đổi quà - JAZZY PARADISE CENTER</title>
             <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
             <link rel="stylesheet" href="./style.css">
         </head>
         <body>
             <div class="receipt-container">
                 <div class="receipt-header">
                     <div class="receipt-logo">
                         <img src="img/Logo JP Bowling & Game (2).JPG" alt="JP Bowling & Game">
                     </div>
                     <div class="receipt-title">JAZZY PARADISE CENTER</div>
                     <div class="receipt-subtitle">Trung tâm giải trí hàng đầu</div>
                     <div class="receipt-subtitle">JP Bowling & Game - Lầu 6 TTTM GIGAMALL</div>
                 </div>
                 
                 <div class="receipt-body">
                     <div class="receipt-time">
                         <i class="fas fa-clock"></i> Thời gian: ${document.getElementById('current-time').textContent}
                     </div>
                     
                     <div class="receipt-main-title">
                         <i class="fas fa-receipt"></i> PHIẾU ĐỔI QUÀ
                     </div>
                     
                     <div class="receipt-items" id="printReceiptItems">
                         ${receiptContent.querySelector('#receiptItems').innerHTML}
                     </div>
                     
                     <div class="receipt-total-section">
                         <div class="total-label">TỔNG PHIẾU</div>
                         <div class="total-value">${receiptContent.querySelector('#receiptTotal').textContent}</div>
                     </div>
                 </div>
                 
                 <div class="receipt-footer">
                     <div class="footer-text">Cảm ơn quý khách đã sử dụng dịch vụ!</div>
                     <div class="footer-thanks">Hẹn gặp lại!</div>
                 </div>
             </div>
         </body>
         </html>
     `);
     printWindow.document.close();
     printWindow.focus();
     setTimeout(() => {
         printWindow.print();
         printWindow.close();
     }, 500);
 }

// Reset the exchange form
function resetExchange() {
    // Reset all quantities to 0
    for (const productId of Object.keys(products)) {
        document.getElementById(`${productId}-qty`).value = 0;
    }
    
    // Update summary
    updateSummary();
    
    // Show summary and hide other sections
    document.getElementById('receiptSection').classList.add('hidden');
    document.getElementById('dailyReportSection').classList.add('hidden');
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

// Initialize event listeners for direct input changes
document.addEventListener('DOMContentLoaded', function() {
    // Initialize daily report
    initializeDailyReport();
    
    for (const productId of Object.keys(products)) {
        document.getElementById(`${productId}-qty`).addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
            updateSummary();
        });
    }
});

// Daily Report Functions
function showDailyReport() {
    // Hide other sections
    document.getElementById('receiptSection').classList.add('hidden');
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');
    
    // Show daily report section
    document.getElementById('dailyReportSection').classList.remove('hidden');
    
    // Update report data
    updateDailyReportDisplay();
}

function hideDailyReport() {
    // Hide daily report section
    document.getElementById('dailyReportSection').classList.add('hidden');
    
    // Show summary section
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

function updateDailyReportDisplay() {
    const totals = dailyReport.totals;
    
    // Update summary cards
    document.getElementById('totalExchanges').textContent = totals.totalExchanges;
    document.getElementById('totalPoints').textContent = totals.totalPoints.toLocaleString();
    document.getElementById('totalItems').textContent = totals.totalItems;

    
    // Update date
    const reportDate = new Date(dailyReport.date);
    document.getElementById('reportDate').textContent = reportDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update product table
    const tableBody = document.getElementById('reportTableBody');
    tableBody.innerHTML = '';
    
    if (Object.keys(totals.products).length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Không có dữ liệu</td></tr>';
        return;
    }
    
    for (const [productId, productData] of Object.entries(totals.products)) {
        const percentage = totals.totalPoints > 0 ? 
            Math.round((productData.points / totals.totalPoints) * 100) : 0;
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-800 font-medium">${productData.name}</td>
            <td class="px-4 py-3 text-center text-gray-700">${productData.quantity}</td>
            <td class="px-4 py-3 text-center text-gray-700">${productData.points.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    }
}

function exportReport() {
    const reportData = {
        date: dailyReport.date,
        totals: dailyReport.totals,
        exchanges: dailyReport.exchanges
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `daily-report-${dailyReport.date}.json`;
    link.click();
}

function exportReportExcel() {
    const exportBtn = event.target;
    const originalContent = exportBtn.innerHTML;
    
    // Show loading state
    exportBtn.innerHTML = '<span class="export-loading mr-2"></span>Đang xuất...';
    exportBtn.disabled = true;
    
    try {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['BÁO CÁO HÀNG NGÀY - JAZZY PARADISE'],
            [''],
            ['Ngày:', dailyReport.date],
            ['Tổng giao dịch:', dailyReport.totals.totalExchanges],
            ['Tổng phiếu:', dailyReport.totals.totalPoints],
            ['Tổng sản phẩm:', dailyReport.totals.totalItems],
            [''],
            ['CHI TIẾT SẢN PHẨM'],
            ['Sản phẩm', 'Số lượng', 'Phiếu']
        ];
        
        // Add product details
        for (const [productId, productData] of Object.entries(dailyReport.totals.products)) {
            const percentage = dailyReport.totals.totalPoints > 0 ? 
                Math.round((productData.points / dailyReport.totals.totalPoints) * 100) : 0;
            summaryData.push([
                productData.name,
                productData.quantity,
                productData.points
            ]);
        }
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Set column widths
        summaryWs['!cols'] = [
            { width: 20 },
            { width: 12 },
            { width: 12 },
            { width: 15 }
        ];
        
        // Add summary sheet to workbook
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng hợp');
        
        // Detailed transactions sheet
        if (dailyReport.exchanges.length > 0) {
            const detailData = [
                ['CHI TIẾT GIAO DỊCH'],
                [''],
                ['Thời gian', 'Tổng phiếu', 'Sản phẩm', 'Số lượng', 'Phiếu']
            ];
            
            dailyReport.exchanges.forEach((exchange, index) => {
                const exchangeTime = new Date(exchange.timestamp).toLocaleString('vi-VN');
                
                Object.entries(exchange.items).forEach(([productId, quantity], itemIndex) => {
                    const product = products[productId];
                    const itemPoints = quantity * product.points;
                    
                    detailData.push([
                        itemIndex === 0 ? exchangeTime : '', // Only show time for first item
                        itemIndex === 0 ? exchange.totalPoints : '', // Only show total for first item
                        product.name,
                        quantity,
                        itemPoints
                    ]);
                });
                
                // Add empty row between transactions
                if (index < dailyReport.exchanges.length - 1) {
                    detailData.push(['', '', '', '', '']);
                }
            });
            
            const detailWs = XLSX.utils.aoa_to_sheet(detailData);
            
            // Set column widths for detail sheet
            detailWs['!cols'] = [
                { width: 20 },
                { width: 12 },
                { width: 20 },
                { width: 12 },
                { width: 12 }
            ];
            
            // Add detail sheet to workbook
            XLSX.utils.book_append_sheet(wb, detailWs, 'Chi tiết giao dịch');
        }
        
        // Generate filename with current date
        const fileName = `bao-cao-ngay-${dailyReport.date}.xlsx`;
        
        // Save the file
        XLSX.writeFile(wb, fileName);
        
        // Show success message
        showNotification('Xuất Excel thành công!', 'success');
        
    } catch (error) {
        console.error('Error exporting Excel:', error);
        showNotification('Có lỗi khi xuất Excel!', 'error');
    } finally {
        // Restore button state
        exportBtn.innerHTML = originalContent;
        exportBtn.disabled = false;
    }
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="flex items-center ${bgColor} text-white p-3 rounded-lg">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function clearDailyReport() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu báo cáo hôm nay?')) {
        dailyReport = {
            date: getCurrentDate(),
            exchanges: [],
            totals: {
                totalExchanges: 0,
                totalPoints: 0,
                totalItems: 0,
                products: {}
            }
        };
        saveDailyReport();
        updateDailyReportDisplay();
    }
}

// JavaScript to dynamically display the current date and time
const currentTimeElement = document.getElementById('current-time');
const now = new Date();

// Format date as dd/mm/yyyy
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();

// Format time as hh:mm:ss
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

currentTimeElement.textContent = formattedDateTime;
