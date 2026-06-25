<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>P3 POS | Smart QR</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
        :root {
            --primary: #f97316;
            --dark: #0f172a;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f1f5f9;
            font-family: system-ui, sans-serif;
            padding: 10px;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 15px;
        }

        .panel {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .profile-container {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .fa-user-circle {
            color: var(--primary);
            font-size: 30px;
            cursor: pointer;
        }

        #user-display-name {
            font-size: 12px;
            font-weight: bold;
            color: var(--dark);
        }

        input,
        textarea {
            width: 100%;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            color: #000 !important;
            background: white;
        }

        .qty-box {
            width: 65px;
            font-weight: bold;
            text-align: center;
            border: 1px solid var(--primary);
        }

        .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 65px auto;
            gap: 5px;
            margin-bottom: 5px;
            align-items: center;
        }

        .preview-side {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: sticky;
            top: 10px;
        }

        #receipt-box {
            background: white;
            padding: 35px 20px;
            width: 100%;
            max-width: 400px;
            position: relative;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        button {
            padding: 14px;
            border-radius: 10px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 8px;
            color: white;
        }

        .btn-view {
            background: var(--dark);
        }

        .btn-share {
            background: #25d366;
        }

        .btn-import {
            background: var(--primary);
        }

        .btn-save {
            background: #06b6d4;
        }

        .receipt-item-name {
            text-align: left;
            padding: 5px 0;
            white-space: pre-wrap;
            font-size: 11px;
        }

        /* Modal Styles for Registration/Auth & Statements */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
        }

        .close-modal {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 20px;
            cursor: pointer;
        }

        /* Drafts & History Section */
        .drafts-section {
            margin-top: 15px;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
        }

        .draft-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px;
            background: white;
            margin-bottom: 5px;
            border-radius: 5px;
            font-size: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .draft-actions i {
            cursor: pointer;
            margin-left: 8px;
        }

        /* Statements Table View */
        .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
        }

        .statement-table th,
        .statement-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .statement-table th {
            background: #f1f5f9;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
            }

            .preview-side {
                position: static;
                margin-top: 20px;
            }
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="panel">
            <div class="profile-container">
                <span id="user-display-name">Guest Cashier</span>
                <i class="fas fa-user-circle" onclick="openProfileModal()"></i>
            </div>
            <h2 style="color: var(--primary); margin-top: 10px; text-transform: uppercase;">Tanala Mini Shop</h2>
            <h4 style="color: var(--primary); margin-bottom: 10px; text-transform: uppercase;">Stock Order Import List
            </h4>
            <textarea id="bulkData" placeholder="Huletts 1kg&#10;   500g&#10;Polony 2.5kg 1"></textarea>
            <button class="btn-import" onclick="importItems()">Process & Add</button>

            <div id="itemList" style="margin-top:20px;"></div>
            <button style="background:#cbd5e1; color:#1e293b; font-size:11px;" onclick="addEmpty()">+ Add Row
                Manually</button>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:20px;">
                <input type="text" id="store" value="Tanala Mini Shop">
                <input type="text" id="client" value="Valued Customer">
                <input type="number" id="tax" value="0.00" placeholder="Tax %">
                <input type="number" id="paid" placeholder="Cash Paid">
            </div>

            <button class="btn-save" onclick="saveCurrentDraft()"><i class="fas fa-save"></i> Save Current as
                Draft</button>
            <div class="drafts-section">
                <h5 style="margin-bottom: 5px; color:#475569;">Saved Drafts / Active Worksheets</h5>
                <div id="draftsList"></div>
            </div>

            <button class="btn-view" onclick="viewImage()"><i class="fas fa-image"></i> View/Download Receipt</button>
            <button class="btn-share" onclick="shareToWhatsApp()"><i class="fab fa-whatsapp"></i> Share to
                WhatsApp</button>
            <button style="background:#3b82f6;" onclick="printReceiptOnly();"><i class="fas fa-print"></i> Print
                Receipt</button>
            <button style="background:#ef4444;" class="clear-all-carts" onclick="handleClearCart()">Clear All
                Carts</button>
        </div>

        <div class="preview-side">
            <div id="receipt-box">
                <div id="receipt-ui"></div>
            </div>
            <button style="background:#3b82f6; margin-top:15px;" onclick="window.downloadReceipt()">Download
                Receipt</button>
        </div>
    </div>

    <div style="text-align:center; margin-top:20px; font-size:10px; color:#94a3b8;">
        &copy; 2026 Tanala Mini Shop. All rights reserved.
    </div>

    <div id="authModal" class="modal">
        <div class="modal-content">
            <span class="close-modal" onclick="toggleModal(false)">&times;</span>

            <div id="profile-active-view" style="display: none;">
                <h3 style="color: var(--dark); margin-bottom: 5px;"><i class="fas fa-id-card"
                        style="color:var(--primary);"></i> Cashier Profile</h3>
                <p style="font-size: 14px; margin-bottom: 2px;"><strong>Name:</strong> <span id="prof-name"></span></p>
                <p style="font-size: 14px; margin-bottom: 15px;"><strong>Email:</strong> <span id="prof-email"></span>
                </p>
                <button onclick="logoutUser()"
                    style="background:#ef4444; padding:6px 12px; font-size:11px; width:auto; margin-top:0; margin-bottom:20px;">Sign
                    Out / Clear User</button>

                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 15px;">

                <h4 style="color: var(--dark); margin-bottom: 10px;"><i class="fas fa-file-invoice-dollar"
                        style="color:var(--primary);"></i> Account Statement & Order History</h4>
                <div style="overflow-x: auto;">
                    <table class="statement-table">
                        <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>Client Name</th>
                                <th>Item Details</th>
                                <th>Total (ZAR)</th>
                            </tr>
                        </thead>
                        <tbody id="statement-rows">
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="profile-setup-view">
                <h3 style="margin-bottom: 15px; color: var(--dark);">User Account Setup</h3>

                <div id="g_id_onload"
                    data-client_id="140939199464-qebi1pvbll1q8e4e861pckst38t8e7n3.apps.googleusercontent.com"
                    data-callback="handleCredentialResponse" data-auto_prompt="false">
                </div>
                <div class="g_id_signin" data-type="standard" style="margin-bottom: 15px;"></div>

                <div style="border-top: 1px solid #e2e8f0; margin: 15px 0; position: relative; text-align: center;">
                    <span
                        style="position: absolute; top: -10px; background: white; padding: 0 10px; font-size: 12px; color: #94a3b8; left: 43%;">OR</span>
                </div>

                <form id="profileForm" onsubmit="saveManualProfile(event)">
                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Cashier /
                        Owner Name</label>
                    <input type="text" id="regName" placeholder="e.g. Yitbarek Zewde" required>

                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Shop Contact
                        Email</label>
                    <input type="email" id="regEmail" placeholder="name@example.com" required>

                    <button type="submit" style="background: var(--primary);">Save Profile Details</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        let cart = [];
        let currentUser = null;

        // Run when core file structures instantiate inside page DOM
        window.onload = function () {
            loadUserData();
            loadDrafts();
            cart = [{ id: 1, name: 'Sample Product', price: 1, qty: 1 }];
            render();
            document.querySelectorAll('input').forEach(el => el.oninput = updateUI);
        };

        function loadUserData() {
            const savedUser = localStorage.getItem('p3_user_profile');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                document.getElementById('user-display-name').innerText = currentUser.name;
            } else {
                currentUser = { name: "Yitbarek Zewde", email: "yitbarek537zewde@gmail.com" };
                document.getElementById('user-display-name').innerText = currentUser.name;
            }
            updateUI();
        }

        function toggleModal(show) {
            document.getElementById('authModal').style.display = show ? 'flex' : 'none';
        }

        function openProfileModal() {
            const setupView = document.getElementById('profile-setup-view');
            const activeView = document.getElementById('profile-active-view');

            const registrationCheck = localStorage.getItem('p3_user_profile');

            if (registrationCheck) {
                const parsedUser = JSON.parse(registrationCheck);
                document.getElementById('prof-name').innerText = parsedUser.name;
                document.getElementById('prof-email').innerText = parsedUser.email;

                buildStatementRows();

                setupView.style.display = "none";
                activeView.style.display = "block";
            } else {
                setupView.style.display = "block";
                activeView.style.display = "none";
            }
            toggleModal(true);
        }

        function buildStatementRows() {
            const tbody = document.getElementById('statement-rows');
            const drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');

            if (drafts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No statement entries found. Create and save drafts to populate history.</td></tr>`;
                return;
            }

            let htmlStr = "";
            drafts.forEach(d => {
                let itemsReport = d.cart.map(item => `• ${item.name} (x${item.qty}) @ R${parseFloat(item.price || 0).toFixed(2)}`).join('<br>');

                let sub = d.cart.reduce((s, i) => s + (parseFloat(i.price || 0) * parseInt(i.qty || 1)), 0);
                let txVal = sub * (parseFloat(d.tax || 0) / 100);
                let totalVal = sub + txVal;

                htmlStr += `
                <tr>
                    <td style="white-space: nowrap;">${d.timestamp}</td>
                    <td><b>${d.client}</b><br><small style="color:#64748b;">Store: ${d.store}</small></td>
                    <td style="color:#334155; font-family: monospace; font-size:11px;">${itemsReport}</td>
                    <td style="text-align: right; font-weight: bold; color: var(--dark);">R ${totalVal.toFixed(2)}</td>
                </tr>
            `;
            });
            tbody.innerHTML = htmlStr;
        }

        function saveManualProfile(e) {
            e.preventDefault();
            const profileObj = {
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value
            };
            localStorage.setItem('p3_user_profile', JSON.stringify(profileObj));
            currentUser = profileObj;
            document.getElementById('user-display-name').innerText = currentUser.name;
            openProfileModal();
            updateUI();
        }

        function logoutUser() {
            localStorage.removeItem('p3_user_profile');
            currentUser = { name: "Yitbarek Zewde", email: "yitbarek537zewde@gmail.com" };
            document.getElementById('user-display-name').innerText = currentUser.name;
            openProfileModal();
            updateUI();
        }

        function parseJwt(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }

        function handleCredentialResponse(response) {
            const responsePayload = parseJwt(response.credential);
            const profileObj = {
                name: responsePayload.name,
                email: responsePayload.email
            };
            localStorage.setItem('p3_user_profile', JSON.stringify(profileObj));
            currentUser = profileObj;
            document.getElementById('user-display-name').innerText = currentUser.name;
            openProfileModal();
            updateUI();
        }

        // Draft Management Features
        function saveCurrentDraft() {
            if (cart.length === 0) return alert("Cart is empty. Nothing to save!");
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            const draftMetaData = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                store: document.getElementById('store').value,
                client: document.getElementById('client').value,
                tax: document.getElementById('tax').value,
                paid: document.getElementById('paid').value,
                cart: cart
            };
            drafts.push(draftMetaData);
            localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts));
            loadDrafts();
            alert("Draft successfully preserved!");
        }

        function loadDrafts() {
            const container = document.getElementById('draftsList');
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            if (drafts.length === 0) {
                container.innerHTML = '<p style="font-size:11px; color:#94a3b8;">No drafts available.</p>';
                return;
            }
            container.innerHTML = drafts.map(d => `
            <div class="draft-item">
                <span><b>${d.client}</b> (${d.timestamp})</span>
                <div class="draft-actions">
                    <i class="fas fa-folder-open" style="color:var(--primary);" onclick="restoreDraft(${d.id})" title="Load draft"></i>
                    <i class="fas fa-trash-alt" style="color:#ef4444;" onclick="deleteDraft(${d.id})" title="Delete draft"></i>
                </div>
            </div>
        `).join('');
        }

        function restoreDraft(id) {
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            let target = drafts.find(x => x.id === id);
            if (target) {
                document.getElementById('store').value = target.store;
                document.getElementById('client').value = target.client;
                document.getElementById('tax').value = target.tax;
                document.getElementById('paid').value = target.paid;
                cart = target.cart;
                render();
            }
        }

        function deleteDraft(id) {
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            drafts = drafts.filter(x => x.id !== id);
            localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts));
            loadDrafts();
        }

        function importItems() {
            const lines = document.getElementById('bulkData').value.split('\n');
            lines.forEach(line => {
                if (!line.trim()) return;
                const leadingSpaces = line.match(/^\s*/)[0];
                const cleanLine = line.trim();
                let parts = cleanLine.split(/\s+/);
                let qty = 1;
                if (parts.length > 1) {
                    const lastPart = parts[parts.length - 1];
                    if (/^\d+$/.test(lastPart)) qty = parseInt(parts.pop());
                }
                cart.push({ id: Date.now() + Math.random(), name: leadingSpaces + parts.join(' '), price: '', qty: qty });
            });
            document.getElementById('bulkData').value = '';
            render();
        }

        function render() {
            const list = document.getElementById('itemList');
            list.innerHTML = cart.map(i => `
            <div class="item-row">
                <input type="text" value="${i.name}" onchange="upd(${i.id},'name',this.value)">
                <input type="number" placeholder="Price" value="${i.price}" oninput="upd(${i.id},'price',this.value)">
                <input type="number" class="qty-box" value="${i.qty}" oninput="upd(${i.id},'qty',this.value)">
                <i class="fas fa-trash-alt" style="color:#ef4444; cursor:pointer;" onclick="del(${i.id})"></i>
            </div>
        `).join('');
            updateUI();
        }

        // Direct object key state updates
        function upd(id, f, v) { let item = cart.find(x => x.id === id); if (item) item[f] = v; updateUI(); }
        function del(id) { cart = cart.filter(x => x.id !== id); render(); }
        function addEmpty() { cart.push({ id: Date.now(), name: "Item", price: '', qty: 1 }); render(); }

        function updateUI() {
            let sub = cart.reduce((s, i) => s + (parseFloat(i.price || 0) * parseInt(i.qty || 1)), 0);
            let txVal = sub * (parseFloat(document.getElementById('tax').value || 0) / 100);
            let total = sub + txVal;
            let pd = parseFloat(document.getElementById('paid').value) || 0;

            document.getElementById('receipt-ui').innerHTML = `
            <div style="text-align:center; color:#000; font-family:'Courier New', monospace;">
                <h1 style="color:var(--primary); text-transform:uppercase; margin-bottom:5px; font-size:22px;">${document.getElementById('store').value}</h1>
                <p style="font-size:10px;">${new Date().toLocaleString()}</p>
                <div style="border-top:1px dashed #000; margin:10px 0;"></div>
                <p style="text-align:left; font-size:11px;"><b>CLIENT:</b> ${document.getElementById('client').value}</p>
                
                <table style="width:100%; margin:15px 0; font-size:10px; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid #000; font-weight: bold;">
                            <th style="text-align:left; padding-bottom: 5px;">ORDER ITEMS</th>
                            <th style="text-align:center; padding-bottom: 5px;">QTY</th>
                            <th style="text-align:right; padding-bottom: 5px;">EACH</th>
                            <th style="text-align:right; padding-bottom: 5px;">TOTAL</th>
                         </tr>
                    </thead>
                    <tbody>
                        ${cart.map(i => {
                let eachPrice = parseFloat(i.price || 0);
                let itemTotal = eachPrice * parseInt(i.qty || 1);
                return `
                            <tr>
                                <td class="receipt-item-name">${i.name}</td>
                                <td style="text-align:center;">${i.qty}</td>
                                <td style="text-align:right;">${eachPrice.toFixed(2)}</td>
                                <td style="text-align:right;">${itemTotal.toFixed(2)}</td>
                            </tr>`;
            }).join('')}
                    </tbody>
                </table>

                <div style="border-top:1px solid #000; padding-top:8px;"></div>
                <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:18px;">
                    <span>TOTAL</span>
                    <span>R ${total.toFixed(2)}</span>
                </div>
                
                ${pd > 0 ? `
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:8px;">
                    <span>PAID: R ${pd.toFixed(2)}</span><span>CHANGE: R ${(pd - total).toFixed(2)}</span>
                </div>` : ''}

                <div style="margin-top:25px; display:flex; flex-direction:column; align-items:center;">
                    <div id="qr-place"></div>
                    <p style="font-size:8px; margin-top:10px; color:#666;">SCAN TO VISIT OUR WEBSITE</p>
                    <h2 style="font-size: 8px;margin-top:10px; color: #008000;">This receipt is prepared by <strong>${currentUser ? currentUser.name : "Yitbarek Zewde"}</strong><h2>
                </div>
            </div>
        `;

            const qr = new QRious({
                element: document.createElement('canvas'),
                value: 'https://yitbarek-zewde.vercel.app/',
                size: 90
            });
            const qrContainer = document.getElementById('qr-place');
            if (qrContainer) {
                while (qrContainer.firstChild) qrContainer.removeChild(qrContainer.firstChild);
                qrContainer.appendChild(qr.image);
            }
        }

        function handleClearCart() {
            if (confirm("Are you sure you want to clear all items?")) {
                cart = [];
                render();
            }
        }

        async function generateBlob() {
            const canvas = await html2canvas(document.getElementById('receipt-box'), { scale: 3, backgroundColor: "#ffffff" });
            return new Promise(r => canvas.toBlob(r, 'image/png'));
        }

        async function viewImage() {
            const blob = await generateBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }

        async function shareToWhatsApp() {
            try {
                const blob = await generateBlob();
                const file = new File([blob], 'receipt.png', { type: 'image/png' });
                if (navigator.share) {
                    await navigator.share({ files: [file], title: 'My Receipt' });
                } else {
                    alert("Sharing not supported. Click 'View' and save the image.");
                }
            } catch (e) {
                alert("Receipt sharing has failed.");
            }
        }

        window.downloadReceipt = async function () {
            try {
                const blob = await generateBlob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'receipt.png';
                a.click();
            } catch (e) {
                alert("Failed to download receipt.");
            }
        }

        window.printReceiptOnly = function () {
            const originalReceipt = document.getElementById('receipt-box');
            if (!originalReceipt) return;

            const receiptClone = originalReceipt.cloneNode(true);
            const originalQrCanvas = document.querySelector('#qr-place canvas');
            let qrImageUrl = '';
            }

           
    </script>
</body>

</html>
