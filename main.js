const SERVICE_ID = "service_2kca2tm";
        const TEMPLATE_ID = "template_bk6mitp";
        const PUBLIC_KEY = "4SOcrHZJ1yHxQiXjQ";
        const CLOUD_DB_URL = "https://script.google.com/macros/s/AKfycbw1K6bkpSjBnS8dGvc9aE5v69V-pU0KJaLujN-bsS1LIf39oCzOLrnAwi0tQ8KmMxUOgg/exec";

        if (window.emailjs) emailjs.init(PUBLIC_KEY);

        // ─── 1. AUTHENTICATION & PROFILE CLASS ──────────────────────────────────────
        class AuthManager {
            constructor() {
                this.currentUser = null;
                this.pendingSetupPic = null;
            }
            parseJwt(token) { try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return {}; } }
            getStoredProfile() { return JSON.parse(localStorage.getItem('p3_user_profile') || 'null'); }

            saveProfile(profileObj) {
                this.currentUser = profileObj;
                localStorage.setItem('p3_user_profile', JSON.stringify(profileObj));
                document.getElementById('user-display-name').innerText = profileObj.name || 'Cashier';
                this.applyAvatarEverywhere(profileObj.picture || null);
            }
            loadUserData() {
                const saved = this.getStoredProfile();
                if (saved && saved.name && saved.email) this.saveProfile(saved);
                else { this.currentUser = null; document.getElementById('user-display-name').innerText = "Guest Cashier"; this.applyAvatarEverywhere(null); }
            }
            applyAvatarEverywhere(src) {
                this.setAvatar('nav-avatar-img', 'nav-avatar-icon', src);
                this.setAvatar('modal-avatar-img', 'modal-avatar-icon', src);
                this.setAvatar('setup-avatar-img', 'setup-avatar-icon', src);
            }
            setAvatar(imgId, iconId, src) {
                const img = document.getElementById(imgId), icon = document.getElementById(iconId);
                if (!img || !icon) return;
                if (src) { img.src = src; img.classList.add('loaded'); icon.style.display = 'none'; }
                else { img.src = ''; img.classList.remove('loaded'); icon.style.display = ''; }
            }
            handleSetupPicUpload(e) {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => { this.pendingSetupPic = ev.target.result; this.setAvatar('setup-avatar-img', 'setup-avatar-icon', this.pendingSetupPic); };
                reader.readAsDataURL(file);
            }
            handlePicUpload(e) {
                const file = e.target.files[0]; if (!file || !this.currentUser) return;
                const reader = new FileReader();
                reader.onload = ev => { this.currentUser.picture = ev.target.result; localStorage.setItem('p3_user_profile', JSON.stringify(this.currentUser)); this.applyAvatarEverywhere(this.currentUser.picture); };
                reader.readAsDataURL(file);
            }
            saveUpdatedName() {
                const newName = document.getElementById('edit-name-input').value.trim();
                if (!newName || !this.currentUser) return;
                this.currentUser.name = newName;
                localStorage.setItem('p3_user_profile', JSON.stringify(this.currentUser));
                document.getElementById('user-display-name').innerText = newName;
                document.getElementById('prof-name').innerText = newName;
                alert("Name updated!");
            }
            logoutUser() {
                if (!confirm("Are you sure you want to sign out?")) return;
                localStorage.removeItem('p3_user_profile');
                this.currentUser = null;
                document.getElementById('user-display-name').innerText = "Guest Cashier";
                this.applyAvatarEverywhere(null);
                document.getElementById('viewsModal').style.display = 'none';
                document.getElementById('profile-setup-view').style.display = 'block';
                document.getElementById('profile-active-view').classList.add('hidden');
                cartManager.updateUI();
            }
            saveManualProfile(e) {
                e.preventDefault();
                const name = document.getElementById('regName').value.trim(), email = document.getElementById('regEmail').value.trim();
                if (!name || !email) return alert('Please fill in both name and email.');
                this.saveProfile({ name, email, picture: this.pendingSetupPic || null, provider: 'manual' });
                this.pendingSetupPic = null;
                document.getElementById('profileForm').reset();
                openView('profile');
                cartManager.updateUI();
            }
            switchTab(tab) {
                document.querySelectorAll('.auth-tab').forEach((el, i) => el.classList.toggle('active', (i === 0 && tab === 'google') || (i === 1 && tab === 'manual')));
                document.getElementById('tab-google').classList.toggle('active', tab === 'google');
                document.getElementById('tab-manual').classList.toggle('active', tab === 'manual');
            }
            closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }
        }

        // ─── 2. STORE MANAGER CLASS ──────────────────────────────────────────────────
        class StoreManager {
            constructor() {
                this.savedStores = [];
            }
            initStoreManager() {
                const defaults = ["Tanala Mini Shop", "Easy Receipt", "My Supermarket"];
                this.savedStores = JSON.parse(localStorage.getItem('p3_saved_stores') || JSON.stringify(defaults));
                this.renderStoreSelect();
            }
            renderStoreSelect() {
                const select = document.getElementById('storeSelect');
                select.innerHTML = this.savedStores.map(s => `<option value="${s}">${s}</option>`).join('') + `<option value="ADD_NEW">➕ Add New Store...</option>`;
                cartManager.updateUI();
            }
            handleStoreChange() {
                const select = document.getElementById('storeSelect');
                if (select.value === "ADD_NEW") {
                    const name = prompt("Enter the name of your new store:");
                    if (name && name.trim()) {
                        const clean = name.trim();
                        if (!this.savedStores.includes(clean)) { this.savedStores.push(clean); localStorage.setItem('p3_saved_stores', JSON.stringify(this.savedStores)); }
                        this.renderStoreSelect(); select.value = clean;
                    } else { this.renderStoreSelect(); }
                }
                cartManager.updateUI();
            }
        }

        // ─── 3. CUSTOMER MANAGEMENT CLASS ────────────────────────────────────────────
        class CustomerManager {
            getSavedCustomers() { return JSON.parse(localStorage.getItem('p3_saved_customers') || '[]'); }
            setSavedCustomers(customers) { localStorage.setItem('p3_saved_customers', JSON.stringify(customers)); }

            renderCustomerSuggestions() {
                const datalist = document.getElementById('customerSuggestions');
                if (!datalist) return;
                datalist.innerHTML = this.getSavedCustomers().map(c => `<option value="${c.name}"></option>`).join('');
            }
            addCustomerFromInput() {
                const input = document.getElementById('client');
                const name = input.value.trim();
                if (!name) return alert("Please enter a customer name first.");
                let customers = this.getSavedCustomers();
                if (customers.some(c => c.name.toLowerCase() === name.toLowerCase())) return alert("This customer is already saved.");
                customers.push({ id: Date.now(), name });
                this.setSavedCustomers(customers);
                this.renderCustomerSuggestions();
                this.renderCustomersList();
                alert("Customer added to your list!");
            }
            addCustomerManual() {
                const input = document.getElementById('newCustomerName');
                const name = input.value.trim();
                if (!name) return alert("Please enter a customer name.");
                let customers = this.getSavedCustomers();
                if (customers.some(c => c.name.toLowerCase() === name.toLowerCase())) return alert("This customer already exists.");
                customers.push({ id: Date.now(), name });
                this.setSavedCustomers(customers);
                input.value = '';
                this.renderCustomersList();
                this.renderCustomerSuggestions();
            }
            renderCustomersList() {
                const view = document.getElementById('customersListView'); if (!view) return;
                const customers = this.getSavedCustomers();
                view.innerHTML = customers.length
                    ? customers.map(c => `<div class="draft-item"><span class="customer-name"><b>${c.name}</b></span><div class="draft-actions"><i class="fas fa-check-circle action-icon-success" onclick="customerManager.useCustomer('${c.name.replace(/'/g, "\\'")}')" title="Use this customer"></i><i class="fas fa-trash action-icon-danger" onclick="customerManager.deleteCustomer(${c.id})" title="Delete "></i></div></div>`).join('')
                    : '<p class="paragraph-small">No customers saved yet. Add one above.</p>';
            }
            useCustomer(name) { document.getElementById('client').value = name; cartManager.updateUI(); closeViewsModal(); }
            deleteCustomer(id) {
                let customers = this.getSavedCustomers();
                customers = customers.filter(c => c.id !== id);
                this.setSavedCustomers(customers);
                this.renderCustomersList();
                this.renderCustomerSuggestions();
            }
        }

        // ─── 4. AUTOMATIC PRICE & INVENTORY STORAGE MANAGEMENT CLASS ──────────────────
        class InventoryPriceManager {
            constructor() {
                this.pendingApprovals = [];
            }
            getAutoPrices() { return JSON.parse(localStorage.getItem('p3_auto_prices') || '{}'); }
            saveAutoPrices(pricesObj) { localStorage.setItem('p3_auto_prices', JSON.stringify(pricesObj)); this.renderPriceManagementTable(); }

            lookupPrice(itemName) {
                const lookup = itemName.trim().toLowerCase();
                return this.getAutoPrices()[lookup] || null;
            }
            registerPossibleNewItem(itemName, price) {
                if (!itemName.trim()) return;
                const normalized = itemName.trim().toLowerCase();
                const historicalPrice = this.getAutoPrices()[normalized];
                if (historicalPrice === undefined) {
                    if (!this.pendingApprovals.some(x => x.name.toLowerCase() === normalized)) {
                        this.pendingApprovals.push({ name: itemName.trim(), price: parseFloat(price) || 0 });
                        this.renderApprovalInterface();
                    }
                }
            }
            renderApprovalInterface() {
                const box = document.getElementById('priceApprovalSection');
                const container = document.getElementById('approvalItemsList');
                if (this.pendingApprovals.length === 0) { box.classList.add('hidden'); return; }
                box.classList.remove('hidden');
                container.innerHTML = this.pendingApprovals.map((item, index) => `
                    <div class="approval-item">
                        <span>${item.name} (R ${item.price.toFixed(2)})</span>
                        <div>
                            <button class="btn-primary" style="padding:2px 6px; font-size:11px;" onclick="inventoryPriceManager.approveSingle(${index})">Approve</button>
                            <button class="btn-danger" style="padding:2px 6px; font-size:11px;" onclick="inventoryPriceManager.rejectSingle(${index})">Ignore</button>
                        </div>
                    </div>`).join('');
            }
            approveSingle(index) {
                const target = this.pendingApprovals[index];
                let current = this.getAutoPrices();
                current[target.name.toLowerCase()] = { originalName: target.name, price: target.price };
                this.saveAutoPrices(current);
                this.pendingApprovals.splice(index, 1);
                this.renderApprovalInterface();
            }
            rejectSingle(index) {
                this.pendingApprovals.splice(index, 1);
                this.renderApprovalInterface();
            }
            approveAllPending() {
                let current = this.getAutoPrices();
                this.pendingApprovals.forEach(target => {
                    current[target.name.toLowerCase()] = { originalName: target.name, price: target.price };
                });
                this.saveAutoPrices(current);
                this.pendingApprovals = [];
                this.renderApprovalInterface();
            }
            renderPriceManagementTable() {
                const tbody = document.getElementById('price-management-rows');
                if (!tbody) return;
                const prices = this.getAutoPrices();
                const keys = Object.keys(prices);
                if (!keys.length) { tbody.innerHTML = `<tr><td colspan="3" class="text-muted text-center">No stored auto-fill prices found.</td></tr>`; return; }
                tbody.innerHTML = keys.map(k => `
                    <tr>
                        <td><input type="text" value="${prices[k].originalName}" onchange="inventoryPriceManager.updateManagementKey('${k}', 'name', this.value)"></td>
                        <td><input type="number" step="0.01" value="${prices[k].price}" onchange="inventoryPriceManager.updateManagementKey('${k}', 'price', this.value)"></td>
                        <td><button class="btn-danger" style="padding: 2px 8px;" onclick="inventoryPriceManager.deleteManagementKey('${k}')"><i class="fas fa-trash"></i></button></td>
                    </tr>`).join('');
            }
            updateManagementKey(key, property, value) {
                let prices = this.getAutoPrices();
                if (!prices[key]) return;
                if (property === 'name') prices[key].originalName = value;
                if (property === 'price') prices[key].price = parseFloat(value) || 0;
                this.saveAutoPrices(prices);
            }
            deleteManagementKey(key) {
                let prices = this.getAutoPrices();
                delete prices[key];
                this.saveAutoPrices(prices);
            }
        }

        // ─── 5. TRANSACTION & CART SYSTEM CORE MANAGER CLASS ─────────────────────────
        class CartManager {
            constructor() {
                this.cart = [];
                this.successTimer = null;
            }
            importItems() {
                const lines = document.getElementById('bulkData').value.split('\n');
                lines.forEach(line => {
                    if (!line.trim()) return;
                    const clean = line.trim(); let parts = clean.split(/\s+/), qty = 1;
                    if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) qty = parseInt(parts.pop());
                    const nameConstruct = parts.join(' ');
                    const match = inventoryPriceManager.lookupPrice(nameConstruct);
                    const historicalPrice = match ? match.price : 0;
                    this.cart.push({ id: Math.floor(Date.now() + Math.random() * 1000), name: nameConstruct, price: historicalPrice, qty });
                });
                document.getElementById('bulkData').value = ''; this.render();
            }
            escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

            render() {
                const list = document.getElementById('itemList');
                list.innerHTML = this.cart.map(i => `
            <div class="item-row">
                <input type="text" value="${this.escapeHtml(i.name)}" placeholder="Item name" aria-label="Item name" onchange="cartManager.upd(${i.id},'name',this.value)">
                
                <input type="number" placeholder="Price" value="${this.escapeHtml(i.price)}" aria-label="Item price" onchange="cartManager.upd(${i.id},'price',this.value)">
                
                <input type="number" class="qty-box" value="${this.escapeHtml(i.qty)}" placeholder="Qty" aria-label="Quantity" oninput="cartManager.upd(${i.id},'qty',this.value)">
                <button class="inline-action-btn" title="Delete item" aria-label="Delete item" onclick="cartManager.del(${i.id})"><i class="fas fa-trash-alt" aria-hidden="true"></i></button>
            </div>`).join('');
                this.updateUI();
            }
            upd(id, f, v) {
                let item = this.cart.find(x => x.id === id); if (!item) return;
                if (f === 'price') {
                    item[f] = v === '' ? 0 : parseFloat(v);
                    inventoryPriceManager.registerPossibleNewItem(item.name, item[f]);
                } else if (f === 'qty') {
                    item[f] = v === '' ? 1 : parseInt(v);
                } else {
                    item[f] = v;
                    const lookup = inventoryPriceManager.lookupPrice(v);
                    if (lookup) { item.price = lookup.price; this.render(); return; }
                }
                this.updateUI();
            }
            del(id) { this.cart = this.cart.filter(x => x.id !== id); this.render(); }
            addEmpty() { this.cart.push({ id: Math.floor(Date.now() + Math.random() * 1000), name: "Item", price: 0, qty: 1 }); this.render(); }
            handleClearCart() { if (confirm("Clear all items?")) { this.cart = []; this.render(); } }

            updateUI() {
                const receiptBox = document.getElementById('receipt-box'); if (!receiptBox) return;
                let sub = this.cart.reduce((s, i) => s + (parseFloat(i.price || 0) * parseInt(i.qty || 1)), 0),
                    discountPct = parseFloat(document.getElementById('discount').value || 0) / 100,
                    discountAmt = sub * discountPct, subAfterDiscount = sub - discountAmt,
                    txVal = subAfterDiscount * (parseFloat(document.getElementById('tax').value || 0) / 100),
                    total = subAfterDiscount + txVal,
                    pd = parseFloat(document.getElementById('paid').value) || 0,
                    onlinePaid = parseFloat(document.getElementById('online').value) || 0,
                    totalPaid = pd + onlinePaid, change = totalPaid - total,
                    storeName = document.getElementById('storeSelect').value || "My Store";

                document.getElementById('receipt-ui').innerHTML = `
                    <div class="receipt-ui-container">
                        <h1 class="receipt-store-name">${storeName}</h1>
                        <p class="receipt-date">${new Date().toLocaleString()}</p>
                        <div class="receipt-divider"></div>
                        <p class="receipt-client-line"><b>CLIENT:</b> ${document.getElementById('client').value || '-'}</p>
                        <table class="receipt-table">
                            <thead>
                                <tr><th class="left">ORDER ITEMS</th><th class="center">QTY</th><th class="right">EACH</th><th class="right">TOTAL</th></tr>
                            </thead>
                            <tbody>
                                ${this.cart.map(i => {
                    const each = parseFloat(i.price || 0);
                    return `<tr><td class="receipt-item-name left">${i.name}</td><td class="center">${i.qty}</td><td class="right">R ${each.toFixed(2)}</td><td class="right">R ${(each * i.qty).toFixed(2)}</td></tr>`;
                }).join('')}
                            </tbody>
                        </table>
                        <div class="receipt-divider"></div>
                        <div class="receipt-summary-row"><span>Subtotal</span><span>R ${sub.toFixed(2)}</span></div>
                        ${discountAmt > 0 ? `<div class="receipt-summary-row discount"><span>Discount (${document.getElementById('discount').value}%)</span><span>-R ${discountAmt.toFixed(2)}</span></div>` : ''}
                        ${txVal > 0 ? `<div class="receipt-summary-row"><span>Tax (${document.getElementById('tax').value}%)</span><span>R ${txVal.toFixed(2)}</span></div>` : ''}
                        <div class="receipt-total-row"><span>TOTAL</span><span>R ${total.toFixed(2)}</span></div>
                        ${totalPaid > 0 ? `
                            <div class="receipt-payments">
                                ${pd > 0 ? `<div class="receipt-payment-line"><span>Cash Paid</span><span>R ${pd.toFixed(2)}</span></div>` : ''}
                                ${onlinePaid > 0 ? `<div class="receipt-payment-line"><span>Card/S2S Paid</span><span>R ${onlinePaid.toFixed(2)}</span></div>` : ''}
                                <div class="receipt-change ${change >= 0 ? 'receipt-change-positive' : 'receipt-change-negative'}"><span>CHANGE</span><span>R ${change.toFixed(2)}</span></div>
                                ${change < 0 ? `<div class="receipt-due">AMOUNT DUE: R ${Math.abs(change).toFixed(2)}</div>` : ''}
                            </div>` : ''}
                        <div class="receipt-qr-section"><div id="qr-place"></div></div>
                        <p class="receipt-qr-note">SCAN TO VISIT OUR WEBSITE</p>
                        <p class="receipt-footer">This receipt is prepared by <strong>${authManager.currentUser ? authManager.currentUser.name : "Easy Receipt"}</strong></p>
                    </div>`;

                const qr = new QRious({ element: document.createElement('canvas'), value: 'https://www.receipts.lat', size: 90 });
                const qrContainer = document.getElementById('qr-place');
                if (qrContainer) { qrContainer.innerHTML = ''; qrContainer.appendChild(qr.image); }
            }

            //share receipt as image and print 
            

            
            saveReceipt() {
                if (this.cart.length === 0) return alert("Cart is empty!");
                this.generateBlob().then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        let snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
                        snaps.push({ id: Date.now(), timestamp: new Date().toLocaleString(), store: document.getElementById('storeSelect').value, client: document.getElementById('client').value, paid: document.getElementById('paid').value, image: reader.result });
                        localStorage.setItem('p3_pos_snapshots', JSON.stringify(snaps));
                        buildStatementRows(); renderDownloadedReceipts(); renderSavedReceipts(); alert("Receipt Snap Saved!");
                    };
                    reader.readAsDataURL(blob);
                });
            }


            saveCurrentDraft() {
                if (this.cart.length === 0) return alert("Cart is empty!");
                let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
                drafts.push({ id: Date.now(), timestamp: new Date().toLocaleString(), store: document.getElementById('storeSelect').value, client: document.getElementById('client').value, tax: document.getElementById('tax').value, discount: document.getElementById('discount').value, paid: document.getElementById('paid').value, online: document.getElementById('online').value, cart: this.cart });
                localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts));
                loadDrafts(); this.pushToCloud(); alert("Draft successfully preserved and synced!");
            }
            async pushToCloud() {
                if (!authManager.currentUser || !authManager.currentUser.email) return;
                const drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
                try { await fetch(CLOUD_DB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authManager.currentUser.email, drafts }) }); }
                catch (err) { console.error("Cloud push failed:", err); }
            }
            viewSavedReceiptImage(base64Data) { document.getElementById('receiptImageView').src = base64Data; document.getElementById('receiptImageModal').style.display = 'flex'; }
            downloadBase64Image(src, filename) { const a = document.createElement('a'); a.href = src; a.download = filename; a.click(); }
            downloadSavedImage() { this.downloadBase64Image(document.getElementById('receiptImageView').src, 'Saved_Receipt_Snapshot.png'); }
        }

        // ─── 6. SUPPORT & OUTBOUND COMMUNICATOR CLASS ────────────────────────────────
        class SupportManager {
            async handleEmailSubmit(e) {
                e.preventDefault();
                const btn = document.getElementById('sendButton'), status = document.getElementById('statusArea');
                btn.innerHTML = "Sending..."; btn.disabled = true; status.innerHTML = "";
                try {
                    const screenshotInput = document.getElementById('support-screenshot');
                    let screenshotBase64 = "";
                    if (screenshotInput.files && screenshotInput.files[0]) screenshotBase64 = await this.fileToBase64(screenshotInput.files[0]);
                    await emailjs.send(SERVICE_ID, TEMPLATE_ID, { from_name: authManager.currentUser?.name || 'Guest Cashier', from_email: document.getElementById('toEmail').value, subject: document.getElementById('subject').value, message: document.getElementById('message').value, user_email: document.getElementById('toEmail').value, screenshot: screenshotBase64, store_name: document.getElementById('storeSelect')?.value || '' });
                    status.innerHTML = "<span class='status-success'>✅ Email sent successfully!</span>";
                    setTimeout(() => status.innerHTML = "", 3000);
                    document.getElementById('emailForm').reset();
                } catch (err) { console.error(err); status.innerHTML = "<span class='status-error'>❌ Failed to send email please try again.</span>"; }
                finally { btn.innerHTML = "🚀 Send Email"; btn.disabled = false; }
            }
            fileToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
        }

        // ─── INITIALIZATION & ROUTING ────────────────────────────────────────────────
        const authManager = new AuthManager();
        const storeManager = new StoreManager();
        const customerManager = new CustomerManager();
        const inventoryPriceManager = new InventoryPriceManager();
        const cartManager = new CartManager();
        const supportManager = new SupportManager();

        window.onload = function () {
            authManager.loadUserData();
            storeManager.initStoreManager();
            loadDrafts();
            customerManager.renderCustomerSuggestions();
            cartManager.cart = [{ id: 1, name: 'Sample Product', price: 0, qty: 1 }];
            cartManager.render();

            document.querySelectorAll('input[type=text], input[type=number]').forEach(el => el.oninput = () => cartManager.updateUI());
            document.getElementById('emailForm').addEventListener('submit', (e) => supportManager.handleEmailSubmit(e));
            document.getElementById('viewsModal').addEventListener('click', closeViewsModal);
        };

        function closeViewsModal() { document.getElementById('viewsModal').style.display = 'none'; }
        function openProfileModal() { openView('profile'); }

        function openView(type) {
            const modal = document.getElementById('viewsModal');
            document.querySelectorAll('#viewsModal .view-panel').forEach(v => v.classList.remove('active'));
            document.getElementById('view-' + type).classList.add('active');

            if (type === 'profile') {
                const saved = authManager.getStoredProfile();
                const profileView = document.getElementById('profileView');
                if (saved && saved.name && saved.email) {
                    profileView.innerHTML = `<div class="profile-profile-line"><p><b>Name:</b> ${saved.name}</p><p><b>Email:</b> ${saved.email}</p><p><b>Provider:</b> ${saved.provider || 'manual'}</p></div>`;
                } else {
                    profileView.innerHTML = `<p class="paragraph-small">No profile saved yet.</p>`;
                }
            }
            if (type === 'statements') buildStatementRows();
            if (type === 'drafts') loadDrafts();
            if (type === 'downloads') renderDownloadedReceipts();
            if (type === 'savedReceipts') renderSavedReceipts();
            if (type === 'customers') customerManager.renderCustomersList();
            if (type === 'priceMgmt') inventoryPriceManager.renderPriceManagementTable();
            modal.style.display = 'flex';
        }

        function handleMenuClick(actionType) { document.getElementById('dropdown').classList.remove('show'); openView(actionType); }
        function toggleDropdown(e) { e.stopPropagation(); document.getElementById('dropdown').classList.toggle('show'); }

        document.addEventListener('click', function (e) {
            const menuBtn = document.getElementById('menu-btn');
            const dropdown = document.getElementById('dropdown');
            if (menuBtn && dropdown && !menuBtn.contains(e.target)) dropdown.classList.remove('show');
        });

        function handleCredentialResponse(response) {
            const payload = authManager.parseJwt(response.credential);
            if (!payload.email) return alert('Google sign-in failed.');
            authManager.saveProfile({ name: payload.name || "Google User", email: payload.email, picture: payload.picture || null, provider: 'google' });
            openView('profile');
            cartManager.updateUI();
        }

        function loadDrafts() {
            const container = document.getElementById('draftsList'), view = document.getElementById('draftView');
            const drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            const html = drafts.length ? drafts.map(d => `<div class="draft-item"><span><b>${d.client || 'Guest'}</b> (${d.timestamp})</span><div class="draft-actions"><i class="fas fa-folder-open action-icon-primary" onclick="restoreDraft(${d.id})" title="Load"></i><i class="fas fa-trash action-icon-danger" onclick="deleteDraft(${d.id})" title="Delete"></i></div></div>`).join('') : '<p class="paragraph-small">No drafts available.</p>';
            if (container) container.innerHTML = html;
            if (view) view.innerHTML = html;
        }

        function restoreDraft(id) {
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            let target = drafts.find(x => x.id === id); if (!target) return;
            document.getElementById('storeSelect').value = target.store || storeManager.savedStores[0];
            document.getElementById('client').value = target.client || '';
            document.getElementById('tax').value = target.tax || '0.00';
            document.getElementById('discount').value = target.discount || '0.00';
            document.getElementById('paid').value = target.paid || '';
            document.getElementById('online').value = target.online || '';
            if (target.cart) cartManager.cart = target.cart; cartManager.render();
        }

        function deleteDraft(id) {
            let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            drafts = drafts.filter(x => x.id !== id);
            localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts)); loadDrafts();
        }

        function buildStatementRows() {
            const tbody = document.getElementById('statement-rows'); if (!tbody) return;
            const drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            const snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
            const rows = [...drafts.map(x => ({ ...x, type: 'draft' })), ...snaps.map(x => ({ ...x, type: 'snap' }))].sort((a, b) => (b.id || 0) - (a.id || 0));
            if (!rows.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-muted">No statement entries found.</td></tr>`; return; }
            tbody.innerHTML = rows.map(d => {
                let itemsReport = '', totalVal = 0;
                if (d.cart && Array.isArray(d.cart)) {
                    itemsReport = d.cart.map(i => `• ${i.name} (x${i.qty}) @ R${parseFloat(i.price || 0).toFixed(2)}`).join('<br>');
                    const sub = d.cart.reduce((s, i) => s + (parseFloat(i.price || 0) * parseInt(i.qty || 1)), 0);
                    const discAmt = sub * (parseFloat(d.discount || 0) / 100);
                    totalVal = (sub - discAmt) + (sub - discAmt) * (parseFloat(d.tax || 0) / 100);
                } else if (d.image) {
                    itemsReport = `<button class="view-image-btn" onclick="cartManager.viewSavedReceiptImage('${d.image.replace(/'/g, "\\'")}')"><i class="fas fa-image"></i> View Saved Snapshot</button>`;
                    totalVal = parseFloat(d.paid || 0);
                }
                return `<tr><td class="nowrap">${d.timestamp || ''}</td><td><b>${d.client || 'N/A'}</b><br><small class="text-muted">Store: ${d.store || 'N/A'}</small></td><td class="paragraph-small" style="font-family:monospace;">${itemsReport}</td><td class="right" style="font-weight:bold;color:var(--dark);">R ${totalVal.toFixed(2)}</td></tr>`;
            }).join('');
        }

        window.downloadReceipt = async function () {
            try {
                const blob = await cartManager.generateBlob();
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'receipt.png'; a.click();
            } catch (e) { alert("Download failed."); }
        };

        function renderDownloadedReceipts() {
            const view = document.getElementById('downloadView'), snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
            view.innerHTML = snaps.length ? snaps.map(s => `<div class="draft-item"><span><b>${s.client || 'Guest'}</b> (${s.timestamp || ''})</span><div class="draft-actions"><button class="view-image-btn" onclick="cartManager.viewSavedReceiptImage('${s.image.replace(/'/g, "\\'")}')" title="View"><i class="fas fa-image"></i></button><button class="view-image-btn" onclick="cartManager.downloadBase64Image('${s.image.replace(/'/g, "\\'")}', 'receipt.png')" title="Download"><i class="fas fa-download"></i></button></div></div>`).join('') : '<p class="paragraph-small">No downloaded receipts found.</p>';
        }

        function renderSavedReceipts() {
            const view = document.getElementById('savedReceiptView'), snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
            view.innerHTML = snaps.length ? snaps.map(s => `<div class="draft-item"><span><b>${s.client || 'Guest'}</b> (${s.store || 'Store'})</span><div class="draft-actions"><button class="view-image-btn" onclick="cartManager.viewSavedReceiptImage('${s.image.replace(/'/g, "\\'")}')" title="View"><i class="fas fa-image"></i></button></div></div>`).join('') : '<p class="paragraph-small">No saved receipts found.</p>';
        }

        //Receive registration data
        function receiveRegistrationData(data) {
            if (!data || !data.username || !data.email) return;
            authManager.saveProfile({ name: data.username, email: data.email, provider: 'manual' });
            openView('profile');
            cartManager.updateUI();
        }

        //try again
        // ── RECEIPT ACTIONS ──
async function generateBlob() {
    if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas not available');
    }
    var canvas = await html2canvas(document.getElementById('receipt-box'), { scale: 3, backgroundColor: "#ffffff", useCORS: true });
    return new Promise(function(r){ canvas.toBlob(r, 'image/png'); });
}

async function viewImage() {
    try {
        var blob = await generateBlob();
        window.open(URL.createObjectURL(blob), '_blank');
    } catch(e) { alert("Could not generate image: " + e.message); }
}

async function shareToWhatsApp() {
    try {
        var blob = await generateBlob();
        var file = new File([blob], 'receipt.png', { type: 'image/png' });
        if (navigator.share) await navigator.share({ files: [file], title: 'My Receipt' });
        else alert("Sharing not supported. Please download instead.");
    } catch(e) { alert("Receipt sharing failed: " + e.message); }
}

window.downloadReceipt = async function () {
    try {
        var blob = await generateBlob();
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'receipt.png';
        a.click();
    } catch(e) { alert("Failed to download: " + e.message); }
};

function saveReceipt() {
    if (cart.length === 0) return alert("Cart is empty. Nothing to save!");
    generateBlob().then(function(blob) {
        var reader = new FileReader();
        reader.onloadend = function () {
            var drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
            drafts.push({
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                store: document.getElementById('store').value,
                client: document.getElementById('client').value,
                tax: document.getElementById('tax').value,
                paid: document.getElementById('paid').value,
                image: reader.result
            });
            localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts));
            alert("Receipt image saved! View it in Menu → Downloaded Receipts.");
        };
        reader.readAsDataURL(blob);
    }).catch(function(e){ alert("Could not save receipt image: " + e.message); });
    }
        
