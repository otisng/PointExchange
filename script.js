// Product point values
const products = {
    card: { name: "Card", points: 100 },
    phinhxanh: { name: "Phỉnh Xanh", points: 50 },
    phinhdo: { name: "Phỉnh Đỏ", points: 50 },
    coin: { name: "80 Xu", points: 1 }
};

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
        // Update user points
        // userPoints = remaining;
        
        // Build receipt
        const receiptItemsContainer = document.getElementById('receiptItems');
        receiptItemsContainer.innerHTML = '';
        
        for (const [productId, product] of Object.entries(products)) {
            const quantity = parseInt(document.getElementById(`${productId}-qty`).value);
            if (quantity > 0) {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between';
                itemElement.innerHTML = `
                    <span>${product.name} × ${quantity}</span>
                    <span> = ${(quantity * product.points).toLocaleString()} Phiếu</span>
                `;
                receiptItemsContainer.appendChild(itemElement);
            }
        }
        
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
    
    // Show summary and hide receipt
    document.getElementById('receiptSection').classList.add('hidden');
    document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

// Initialize event listeners for direct input changes
document.addEventListener('DOMContentLoaded', function() {
    for (const productId of Object.keys(products)) {
        document.getElementById(`${productId}-qty`).addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
            updateSummary();
        });
    }
});

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
