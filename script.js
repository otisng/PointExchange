// Authentication functions
function checkAuthentication() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        // No user logged in, redirect to login page
        window.location.href = 'login.html';
        return null;
    }
    
    try {
        const user = JSON.parse(currentUser);
        return user;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return null;
    }
}

function displayUserInfo() {
    const user = checkAuthentication();
    if (user) {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `${user.name} (${user.role})`;
        }
        
        // Show/hide report button based on role
        const reportButton = document.querySelector('button[onclick="showDailyReport()"]');
        if (reportButton) {
            if (user.role === 'admin') {
                reportButton.style.display = 'flex';
            } else {
                reportButton.style.display = 'none';
            }
        }
        
        // Show welcome message
        showWelcomeMessage(user);
    }
}

function showWelcomeMessage(user) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const welcomeText = document.getElementById('welcomeText');
    
    if (welcomeMessage && welcomeText) {
        welcomeText.textContent = `Chào mừng ${user.name}! Bạn đã đăng nhập với quyền ${user.role === 'admin' ? 'quản trị viên' : 'người dùng'}.`;
        welcomeMessage.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideWelcomeMessage();
        }, 5000);
    }
}

function hideWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.add('hidden');
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

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

// Global transaction storage
let allTransactions = [];
let currentReportDate = getCurrentDate();

// Initialize transaction storage from localStorage
function initializeTransactionStorage() {
    const savedTransactions = localStorage.getItem('allTransactions');
    if (savedTransactions) {
        try {
            allTransactions = JSON.parse(savedTransactions);
        } catch (error) {
            console.error('Error parsing saved transactions:', error);
            allTransactions = [];
        }
    }
}

// Save all transactions to localStorage
function saveAllTransactions() {
    localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Get transactions for a specific date
function getTransactionsByDate(date) {
    return allTransactions.filter(transaction => {
        const transactionDate = transaction.timestamp.split('T')[0];
        return transactionDate === date;
    });
}

// Calculate totals for a specific date
function calculateTotalsForDate(date) {
    const transactions = getTransactionsByDate(date);
    const totals = {
        totalExchanges: transactions.length,
        totalPoints: 0,
        totalItems: 0,
        products: {}
    };
    
    transactions.forEach(transaction => {
        totals.totalPoints += transaction.totalPoints;
        
        for (const [productId, quantity] of Object.entries(transaction.items)) {
            if (quantity > 0) {
                const product = products[productId];
                if (!totals.products[productId]) {
                    totals.products[productId] = {
                        name: product.name,
                        quantity: 0,
                        points: 0
                    };
                }
                totals.products[productId].quantity += quantity;
                totals.products[productId].points += quantity * product.points;
                totals.totalItems += quantity;
            }
        }
    });
    
    return totals;
}

// Add transaction to storage
function addTransaction(transactionData) {
    const user = checkAuthentication();
    if (user) {
        transactionData.user = user.name;
        transactionData.userRole = user.role;
    }
    
    allTransactions.push(transactionData);
    saveAllTransactions();
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
        
        // Add to transaction storage
        addTransaction(exchangeData);
        
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
                     
                     <div class="receipt-items" id="printReceiptItems" style="font-size:10px">
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
    // Check authentication first
    const user = checkAuthentication();
    if (!user) {
        return; // Will redirect to login page
    }
    
    // Display user information
    displayUserInfo();
    
    // Initialize transaction storage
    initializeTransactionStorage();
    
    // Set current date in date input
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.value = getCurrentDate();
    }
    
    for (const productId of Object.keys(products)) {
        document.getElementById(`${productId}-qty`).addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
            updateSummary();
        });
    }
    
    // Show notification about data storage
    if (allTransactions.length > 0) {
        showNotification(`Đã tải ${allTransactions.length} dữ liệu thành công!`, 'success');
    }
});

        
// Daily Report Functions
function showDailyReport() {
    const user = checkAuthentication();
    if (!user) {
        return;
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
        showNotification('Chỉ admin mới có quyền truy cập báo cáo!', 'error');
        return;
    }
    
    // Hide other sections
    document.getElementById('receiptSection').classList.add('hidden');
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');
    
    // Show daily report section
    document.getElementById('dailyReportSection').classList.remove('hidden');
    
    // Update report data for current date
    updateDailyReportDisplay(currentReportDate);
}

function hideDailyReport() {
    // Hide daily report section
    document.getElementById('dailyReportSection').classList.add('hidden');
    
    // Show summary section
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

function updateDailyReportDisplay(date = currentReportDate) {
    currentReportDate = date;
    const totals = calculateTotalsForDate(date);
    
    // Update summary cards
    document.getElementById('totalExchanges').textContent = totals.totalExchanges;
    document.getElementById('totalPoints').textContent = totals.totalPoints.toLocaleString();
    document.getElementById('totalItems').textContent = totals.totalItems;

    
    // Update date
    const reportDate = new Date(date);
    document.getElementById('reportDate').textContent = reportDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update date input
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.value = date;
    }
    
    // Update product table
    const tableBody = document.getElementById('reportTableBody');
    tableBody.innerHTML = '';
    
    if (Object.keys(totals.products).length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">Không có dữ liệu</td></tr>';
    } else {
        for (const [productId, productData] of Object.entries(totals.products)) {
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
    
    // Update transaction history
    updateTransactionHistory(date);
}

function updateTransactionHistory(date) {
    const transactions = getTransactionsByDate(date);
    const historyBody = document.getElementById('transactionHistoryBody');
    historyBody.innerHTML = '';
    
    if (transactions.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Không có giao dịch nào</td></tr>';
        return;
    }
    
    // Sort transactions by timestamp (newest first)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Show only the last 10 transactions
    const recentTransactions = sortedTransactions.slice(0, 10);
    
    recentTransactions.forEach(transaction => {
        const transactionTime = new Date(transaction.timestamp).toLocaleString('vi-VN');
        const user = transaction.user || 'N/A';
        
        // Create product list
        const productList = Object.entries(transaction.items)
            .map(([productId, quantity]) => {
                const product = products[productId];
                return `${product.name} (${quantity})`;
            })
            .join(', ');
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-700 text-sm">${transactionTime}</td>
            <td class="px-4 py-3 text-gray-700 font-medium">${user}</td>
            <td class="px-4 py-3 text-center text-gray-700 font-medium">${transaction.totalPoints.toLocaleString()}</td>
            <td class="px-4 py-3 text-gray-700 text-sm">${productList}</td>
        `;
        historyBody.appendChild(row);
    });
}

// Date filter functions
function changeReportDate(direction) {
    const currentDate = new Date(currentReportDate);
    
    if (direction === 'prev') {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const newDate = currentDate.toISOString().split('T')[0];
    updateDailyReportDisplay(newDate);
}

function selectReportDate() {
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput && dateInput.value) {
        updateDailyReportDisplay(dateInput.value);
    }
}

// Get available dates with transactions
function getAvailableDates() {
    const dates = new Set();
    allTransactions.forEach(transaction => {
        const date = transaction.timestamp.split('T')[0];
        dates.add(date);
    });
    return Array.from(dates).sort().reverse();
}

// Show date picker with available dates
function showDatePicker() {
    const availableDates = getAvailableDates();
    if (availableDates.length === 0) {
        showNotification('Không có dữ liệu giao dịch nào!', 'info');
        return;
    }
    
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.focus();
    }
}

function exportReport() {
    const transactions = getTransactionsByDate(currentReportDate);
    const totals = calculateTotalsForDate(currentReportDate);
    
    const reportData = {
        date: currentReportDate,
        totals: totals,
        transactions: transactions
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `daily-report-${currentReportDate}.json`;
    link.click();
}

function exportReportExcel() {
    const exportBtn = event.target;
    const originalContent = exportBtn.innerHTML;
    
    // Show loading state
    exportBtn.innerHTML = '<span class="export-loading mr-2"></span>Đang xuất...';
    exportBtn.disabled = true;
    
    try {
        const transactions = getTransactionsByDate(currentReportDate);
        const totals = calculateTotalsForDate(currentReportDate);
        
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['BÁO CÁO HÀNG NGÀY - JAZZY PARADISE'],
            [''],
            ['Ngày:', currentReportDate],
            ['Tổng giao dịch:', totals.totalExchanges],
            ['Tổng phiếu:', totals.totalPoints],
            ['Tổng sản phẩm:', totals.totalItems],
            [''],
            ['CHI TIẾT SẢN PHẨM'],
            ['Sản phẩm', 'Số lượng', 'Phiếu']
        ];
        
        // Add product details
        for (const [productId, productData] of Object.entries(totals.products)) {
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
        if (transactions.length > 0) {
            const detailData = [
                ['CHI TIẾT GIAO DỊCH'],
                [''],
                ['Thời gian', 'Người dùng', 'Tổng phiếu', 'Sản phẩm', 'Số lượng', 'Phiếu']
            ];
            
            transactions.forEach((transaction, index) => {
                const exchangeTime = new Date(transaction.timestamp).toLocaleString('vi-VN');
                
                Object.entries(transaction.items).forEach(([productId, quantity], itemIndex) => {
                    const product = products[productId];
                    const itemPoints = quantity * product.points;
                    
                    detailData.push([
                        itemIndex === 0 ? exchangeTime : '', // Only show time for first item
                        itemIndex === 0 ? (transaction.user || 'N/A') : '', // Only show user for first item
                        itemIndex === 0 ? transaction.totalPoints : '', // Only show total for first item
                        product.name,
                        quantity,
                        itemPoints
                    ]);
                });
                
                // Add empty row between transactions
                if (index < transactions.length - 1) {
                    detailData.push(['', '', '', '', '', '']);
                }
            });
            
            const detailWs = XLSX.utils.aoa_to_sheet(detailData);
            
            // Set column widths for detail sheet
            detailWs['!cols'] = [
                { width: 20 },
                { width: 15 },
                { width: 12 },
                { width: 20 },
                { width: 12 },
                { width: 12 }
            ];
            
            // Add detail sheet to workbook
            XLSX.utils.book_append_sheet(wb, detailWs, 'Chi tiết giao dịch');
        }
        
        // Generate filename with current date
        const fileName = `bao-cao-ngay-${currentReportDate}.xlsx`;
        
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
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu giao dịch?')) {
        allTransactions = [];
        saveAllTransactions();
        updateDailyReportDisplay(currentReportDate);
        showNotification('Đã xóa tất cả dữ liệu giao dịch!', 'success');
    }
}

// Get statistics for all time
function getAllTimeStats() {
    const stats = {
        totalTransactions: allTransactions.length,
        totalPoints: 0,
        totalItems: 0,
        uniqueUsers: new Set(),
        products: {}
    };
    
    allTransactions.forEach(transaction => {
        stats.totalPoints += transaction.totalPoints;
        if (transaction.user) {
            stats.uniqueUsers.add(transaction.user);
        }
        
        for (const [productId, quantity] of Object.entries(transaction.items)) {
            if (quantity > 0) {
                const product = products[productId];
                if (!stats.products[productId]) {
                    stats.products[productId] = {
                        name: product.name,
                        quantity: 0,
                        points: 0
                    };
                }
                stats.products[productId].quantity += quantity;
                stats.products[productId].points += quantity * product.points;
                stats.totalItems += quantity;
            }
        }
    });
    
    stats.uniqueUsers = stats.uniqueUsers.size;
    return stats;
}

// Show all time statistics
function showAllTimeStats() {
    const stats = getAllTimeStats();
    const message = `
        📊 Thống kê tổng quan:
        • Tổng giao dịch: ${stats.totalTransactions}
        • Tổng phiếu: ${stats.totalPoints.toLocaleString()}
        • Tổng sản phẩm: ${stats.totalItems}
        • Người dùng: ${stats.uniqueUsers}
    `;
    
    alert(message);
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
