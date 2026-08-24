// ─── 1. AUTHENTICATION & LOCAL PROFILE MANAGER ───────────────────────────────
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.pendingSetupPic = null;
    }
    getStoredProfile() { return JSON.parse(localStorage.getItem('p3_user_profile') || 'null'); }

    saveProfile(profileObj) {
        this.currentUser = profileObj;
        localStorage.setItem('p3_user_profile', JSON.stringify(profileObj));
        this.updateAuthControls();
        document.getElementById('user-display-name').innerText = profileObj.name || 'Cashier';
        
        const profName = document.getElementById('prof-name');
        const profEmail = document.getElementById('prof-email');
        if (profName) profName.innerText = profileObj.name || '';
        if (profEmail) profEmail.innerText = profileObj.email || '';
        
        this.applyAvatarEverywhere(profileObj.picture || null);
    }
    loadUserData() {
        const saved = this.getStoredProfile();
        if (saved && saved.name && saved.email) {
            this.saveProfile(saved);
            document.getElementById('profile-setup-view').style.display = 'none';
            document.getElementById('profile-active-view').classList.remove('hidden');
        } else { 
            this.currentUser = null; 
            document.getElementById('user-display-name').innerText = "Guest Cashier"; 
            this.applyAvatarEverywhere(null); 
            document.getElementById('profile-setup-view').style.display = 'block';
            document.getElementById('profile-active-view').classList.add('hidden');
        }
        this.updateAuthControls();
    }
    updateAuthControls() {
        const isAuthenticated = Boolean(this.currentUser || localStorage.getItem('isLoggedIn') === 'true');
        ['register-account-menu', 'login-register-button'].forEach(id => {
            const control = document.getElementById(id);
            if (control) control.classList.toggle('hidden', isAuthenticated);
        });
    }
    switchTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.auth-panel').forEach(panel => panel.classList.remove('active'));
        const tab = document.querySelector(`.auth-tab[onclick*="'${tabName}'"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        if (tab) tab.classList.add('active');
        if (panel) panel.classList.add('active');
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
        localStorage.removeItem('isLoggedIn');
        this.currentUser = null;
        document.getElementById('user-display-name').innerText = "Guest Cashier";
        this.applyAvatarEverywhere(null);
        document.getElementById('viewsModal').style.display = 'none';
        document.getElementById('profile-setup-view').style.display = 'block';
        document.getElementById('profile-active-view').classList.add('hidden');
        this.updateAuthControls();
        cartManager.updateUI();
    }
    saveManualProfile(e) {
        e.preventDefault();
        const nameInput = document.getElementById('regName');
        const emailInput = document.getElementById('regEmail');
        if (!nameInput || !emailInput) return alert('Manual setup form is unavailable. Please reload the page.');
        const name = nameInput.value.trim(), email = emailInput.value.trim();
        if (!name || !email) return alert('Please fill in both name and email.');
        this.saveProfile({ name, email, picture: this.pendingSetupPic || null, provider: 'manual' });
        this.pendingSetupPic = null;
        document.getElementById('profileForm').reset();
        document.getElementById('profile-setup-view').style.display = 'none';
        document.getElementById('profile-active-view').classList.remove('hidden');
        openView('profile');
        cartManager.updateUI();
    }
    closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }
    openAuthModal() { document.getElementById('authModal').style.display = 'flex'; }
}


// ─── 2. STORE REGISTRY MANAGER ───────────────────────────────────────────────
class StoreManager {
    constructor() { this.savedStores = []; }
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

// ─── CUSTOMER DATA & STRUCTURED HISTORY MATRIX (MATCHES IMAGE LAYOUT) ───────
class CustomerManager {
    getSavedCustomers() 

    { return JSON.parse(localStorage.getItem('p3_saved_customers') || '[]'); }
    setSavedCustomers(customers) { localStorage.setItem('p3_saved_customers', JSON.stringify(customers)); }

    renderCustomerSuggestions() {
        const select = document.getElementById('customerSelect');
        if (select) select.innerHTML = this.getSavedCustomers().map(c => `<option value="${c.id}">${c.name}</option>`).join('') + '<option value="ADD_NEW">+ Add New Customer...</option>';
    }
    constructor() { this.renderCustomerSuggestions(); this.renderCustomersList(); 
       
    }

    handleCustomerChange() {
        const select = document.getElementById('customerSelect');
        const nameInput = document.getElementById('client');
        const emailInput = document.getElementById('customerEmail');
        if (!select) return;
        if (select.value === 'ADD_NEW') {
            const name = prompt('Enter the name of your new customer:');
            if (!name || !name.trim()) {
                this.renderCustomerSuggestions();
                return;
            }
            const cleanName = name.trim();
            const customers = this.getSavedCustomers();
            const existing = customers.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
            if (existing) {
                select.value = String(existing.id);
                if (nameInput) nameInput.value = existing.name;
                if (emailInput) emailInput.value = existing.email || '';
                cartManager.updateUI();
                return;
            }
            const email = prompt('Enter the customer email (optional):') || '';
            const customer = { id: Date.now(), name: cleanName, email: email.trim(), due: 0, deposit: 0, history: [] };
            customers.push(customer);
            this.setSavedCustomers(customers);
            this.renderCustomersList();
            this.renderCustomerSuggestions();
            select.value = String(customer.id);
            if (nameInput) nameInput.value = customer.name;
            if (emailInput) emailInput.value = customer.email;
            cartManager.updateUI();
            return;
        }
        const customer = this.getSavedCustomers().find(c => String(c.id) === select.value);
        if (customer) {
            nameInput.value = customer.name;
            emailInput.value = customer.email || '';
            cartManager.updateUI();
        }
    }

    addCustomerManual() {
        const input = document.getElementById('newCustomerName');
        const name = input.value.trim();
        if (!name) return alert("Please enter a customer name.");
        let customers = this.getSavedCustomers();
        if (customers.some(c => c.name.toLowerCase() === name.toLowerCase())) return alert("This profile identity already exists.");
        
        customers.push({ id: Date.now(), name, email: '', due: 0, deposit: 0, history: [] });
        this.setSavedCustomers(customers);
        input.value = '';
        this.renderCustomersList();
        this.renderCustomerSuggestions();
    }

    addCustomerFromInput() {
        const nameInput = document.getElementById('client');
        const emailInput = document.getElementById('customerEmail');
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        if (!name) return alert('Please enter a customer name first.');
        if (!email || !emailInput.checkValidity()) return alert('Please enter a valid customer email.');
        const customers = this.getSavedCustomers();
        const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existing) existing.email = email;
        else customers.push({ id: Date.now(), name, email, due: 0, deposit: 0, history: [] });
        this.setSavedCustomers(customers);
        this.renderCustomerSuggestions();
        const select = document.getElementById('customerSelect');
        if (select) select.value = String((existing || customers[customers.length - 1]).id);
        alert('Customer name and email saved.');
    }
    
    logCustomerReceipt(customerName, receiptData) {
        if (!customerName || !customerName.trim()) return;
        let customers = this.getSavedCustomers();
        let target = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase());
        
        if (!target) {
            target = { id: Date.now(), name: customerName.trim(), email: document.getElementById('customerEmail')?.value.trim() || '', due: 0, deposit: 0, history: [] };
            customers.push(target);
        }
        
        const billTotal = parseFloat(receiptData.total || 0);
        const totalPaid = parseFloat(receiptData.paid || 0);
        const margin = totalPaid - billTotal;
        
        let dynamicDue = 0;
        let dynamicDeposit = 0;
        
        if (margin < 0) { dynamicDue = Math.abs(margin); }
        else if (margin > 0) { dynamicDeposit = margin; }
        
        target.due = (target.due || 0) + dynamicDue;
        target.deposit = (target.deposit || 0) + dynamicDeposit;
        
        // Automatic Netting Equation balance check
        if (target.deposit > 0 && target.due > 0) {
            if (target.deposit >= target.due) {
                target.deposit -= target.due;
                target.due = 0;
            } else {
                target.due -= target.deposit;
                target.deposit = 0;
            }
        }
        
        target.history.push({
            id: receiptData.id || Date.now(),
            timestamp: receiptData.timestamp || new Date().toLocaleString(),
            store: receiptData.store || "Shop",
            total: billTotal,
            paid: totalPaid,
            items: receiptData.items || []
        });
        
        this.setSavedCustomers(customers);
        this.renderCustomerSuggestions();
        this.renderCustomersList();
    }

    renderCustomersList() {
        const view = document.getElementById('customersListView'); if (!view) return;
        const customers = this.getSavedCustomers();
        
        view.innerHTML = customers.length
            ? customers.map(c => {
                let historyHtml = '';
                if (c.history && c.history.length) {
                    historyHtml = `
                    <div style="overflow-x: auto; margin-top: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px; font-family:sans-serif;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#475569;">
                                    <th style="padding:12px 10px;">Store Name</th>
                                    <th style="padding:12px 10px;">Date Logged</th>
                                    <th style="padding:12px 10px;">Total Received</th>
                                    <th style="padding:12px 10px;">Paid Amount</th>
                                    <th style="padding:12px 10px;">Due Balance</th>
                                    <th style="padding:12px 10px; text-align:center;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${c.history.map(h => {
                                    const diff = h.paid - h.total;
                                    let statusCell = '<span style="color:#64748b; font-weight:500;">Balanced</span>';
                                    if (diff < 0) statusCell = `<span style="color:#dc2626; font-weight:bold;">Due: R${Math.abs(diff).toFixed(2)}</span>`;
                                    if (diff > 0) statusCell = `<span style="color:#16a34a; font-weight:bold;">Saved Dep: R${diff.toFixed(2)}</span>`;

                                    const itemsJsonStr = encodeURIComponent(JSON.stringify(h.items));

                                    return `
                                    <tr style="border-bottom:1px solid #f1f5f9; color:#1e293b;">
                                        <td style="padding:10px; font-weight:600; color:var(--dark);">${h.store}</td>
                                        <td style="padding:10px; white-space:nowrap; color:#64748b;">${h.timestamp}</td>
                                        <td style="padding:10px; font-weight:500;">R ${parseFloat(h.total).toFixed(2)}</td>
                                        <td style="padding:10px; color:#0f766e;">R ${parseFloat(h.paid).toFixed(2)}</td>
                                        <td style="padding:10px;">${statusCell}</td>
                                        <td style="padding:10px; text-align:center;">
                                            <button class="customer-add-btn" style="padding:4px 10px; font-size:12px; margin:0;" onclick="customerManager.viewTextReceipt('${h.store.replace(/'/g, "\\'")}', '${h.timestamp}', '${c.name.replace(/'/g, "\\'")}', ${h.total}, ${h.paid}, '${itemsJsonStr}')">
                                                <i class="fas fa-file-invoice"></i> Receipt
                                            </button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>`;
                } else {
                    historyHtml = '<p style="font-size:12.5px; color:#94a3b8; margin-top:10px; padding-left:4px;">No linked transaction logs found yet.</p>';
                }

                return `
                <div class="draft-item" style="flex-direction: column; align-items: stretch; padding: 16px; margin-bottom: 14px; border: 1px solid #e2e8f0; background: #fff; border-radius: 12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size:16px; color:var(--dark);"><b><i class="fas fa-user-circle" style="color:var(--primary); margin-right:4px;"></i> Customer Profile: ${c.name}</b></span>
                        <div class="draft-actions" style="display:flex; gap:12px;">
                            <i class="fas fa-check-circle action-icon-success" style="font-size:18px; cursor:pointer; color:#16a34a;" onclick="customerManager.useCustomer('${c.name.replace(/'/g, "\\'")}')" title="Load to active workspace"></i>
                            <i class="fas fa-trash action-icon-danger" style="font-size:18px; cursor:pointer; color:#dc2626;" onclick="customerManager.deleteCustomer(${c.id})" title="Wipe account data completely"></i>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border:1px solid #f1f5f9;">
                        <span style="color:#dc2626; font-size:13px;"><b>Cumulative Balance Due:</b> R${parseFloat(c.due || 0).toFixed(2)}</span>
                        <span style="color:#16a34a; font-size:13px;"><b>Cumulative Total Saved Deposit:</b> R${parseFloat(c.deposit || 0).toFixed(2)}</span>
                    </div>
                    ${historyHtml}
                </div>`;
            }).join('')
            : '<p class="paragraph-small">No customer metrics compiled inside your app directory ledger database yet.</p>';
    }
    useCustomer(name) { 
        const clientInput = document.getElementById('client');
        if(clientInput) {
            clientInput.value = name; 
            if(window.cartManager) window.cartManager.updateUI(); 
        }
        closeViewsModal(); 
    }
    
    deleteCustomer(id) {
        if (!confirm("Are you sure you want to drop this account summary records from local indexing logs?")) return;
        let customers = this.getSavedCustomers();
        customers = customers.filter(c => c.id !== id);
        this.setSavedCustomers(customers);
        this.renderCustomersList();
        this.renderCustomerSuggestions();
    }

    viewTextReceipt(store, date, client, total, paid, itemsUrlEncoded) {
        const items = JSON.parse(decodeURIComponent(itemsUrlEncoded));
        let rowsHtml = items.map(i => `
            <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:13px; margin-bottom:4px; color:#334155;">
                <span>${i.name} (x${i.qty})</span>
                <span>R ${(parseFloat(i.price) * parseInt(i.qty)).toFixed(2)}</span>
            </div>
        `).join('');

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0'; container.style.left = '0'; container.style.width = '100vw'; container.style.height = '100vh';
        container.style.background = 'rgba(15, 23, 42, 0.6)'; container.style.display = 'flex'; container.style.justifyContent = 'center';
        container.style.alignItems = 'center'; container.style.zIndex = '999999'; container.id = 'tempTextReceiptModal';

        container.innerHTML = `
            <div style="background:white; padding:24px; border-radius:16px; width:92%; max-width:380px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);">
                <h3 style="text-align:center; margin:0 0 4px 0; font-family:sans-serif; color:var(--dark); font-size:20px;">${store}</h3>
                <p style="text-align:center; font-size:12px; color:#64748b; margin:0 0 16px 0;">${date}</p>
                <div style="border-bottom:1px dashed #cbd5e1; margin-bottom:12px;"></div>
                <p style="font-size:13.5px; margin:0 0 12px 0; color:#1e293b;"><b>CUSTOMER:</b> ${client}</p>
                <div style="margin-bottom:12px;">${rowsHtml}</div>
                <div style="border-bottom:1px dashed #cbd5e1; margin-bottom:12px;"></div>
                <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px; margin-bottom:6px; color:var(--dark);"><span>TOTAL BILL</span><span>R ${parseFloat(total).toFixed(2)}</span></div>
                <div style="display:flex; justify-content:space-between; font-size:14px; color:#475569; margin-bottom:18px;"><span>AMOUNT PAID</span><span>R ${parseFloat(paid).toFixed(2)}</span></div>
                <button class="btn-danger" style="width:100%; padding:10px; border-radius:8px; font-weight:600; cursor:pointer; margin:0;" onclick="document.getElementById('tempTextReceiptModal').remove()">Close Statement Snapshot</button>
            </div>
        `;
        document.body.appendChild(container);
    }
}



// ─── 4. AUTOMATIC STOCK PRICE AUTOFILL DICTIONARY INDEX ──────────────────────
class InventoryPriceManager {
    constructor() { this.pendingApprovals = []; }
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
                <td><input type="number" min="0" step="1" value="${prices[k].price}" onchange="inventoryPriceManager.updateManagementKey('${k}', 'price', this.value)"></td>
                <td><button class="btn-danger" style="padding: 2px 8px;" onclick="inventoryPriceManager.deleteManagementKey('${k}')"><i class="fas fa-trash"></i></button></td>
            </tr>`).join('');
    }
    updateManagementKey(key, property, value) {
        let prices = this.getAutoPrices();
        if (!prices[key]) return;
        if (property === 'name') prices[key].originalName = value;
        if (property === 'price') prices[key].price = Math.max(0, Math.floor(Number(value) || 0));
        this.saveAutoPrices(prices);
    }
    deleteManagementKey(key) {
        let prices = this.getAutoPrices();
        delete prices[key];
        this.saveAutoPrices(prices);
    }
}

// ─── 5. CART & TRANSACTION SYSTEM SYSTEM CORE ────────────────────────────────
class CartManager {
    constructor() { this.cart = []; }
    importItems() {
        const bulkInput = document.getElementById('bulkData');
        const status = document.getElementById('importStatus');
        const lines = bulkInput.value.split('\n').filter(line => line.trim());
        const pastedItems = [];
        lines.forEach(line => {
            if (!line.trim()) return;
            const clean = line.trim(); let parts = clean.split(/\s+/), qty = 1;
            if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) qty = parseInt(parts.pop());
            const nameConstruct = parts.join(' ');
            if (!nameConstruct) return;
            const match = inventoryPriceManager.lookupPrice(nameConstruct);
            const historicalPrice = match ? match.price : 0;
            pastedItems.push({ id: Math.floor(Date.now() + Math.random() * 1000), name: nameConstruct, price: historicalPrice, qty });
        });
        if (!pastedItems.length) {
            if (status) status.innerHTML = '<span class="status-error">Please paste at least one item.</span>';
            return;
        }
        this.cart = this.cart.filter(item => item.name !== 'Sample Product');
        this.cart.push(...pastedItems);
        bulkInput.value = '';
        this.render();
        const firstPriceInput = document.querySelector('.item-row input[type="number"]:not(.qty-box)');
        if (status) status.innerHTML = `<span class="status-success">${pastedItems.length} item${pastedItems.length === 1 ? '' : 's'} pasted. Add price${pastedItems.length === 1 ? '' : 's'} now.</span>`;
        if (firstPriceInput) {
            firstPriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstPriceInput.focus();
        }
    }
    escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

    render() {
        const list = document.getElementById('itemList');
        list.innerHTML = this.cart.map(i => `
        <div class="item-row">
            <input type="text" value="${this.escapeHtml(i.name)}" placeholder="Item name" aria-label="Item name" onchange="cartManager.upd(${i.id},'name',this.value)">
            <input type="number" min="0" step="1" placeholder="Price" value="${this.escapeHtml(i.price)}" aria-label="Item price" onchange="cartManager.upd(${i.id},'price',this.value)">
            <input type="number" min="1" step="1" class="qty-box" value="${this.escapeHtml(i.qty)}" placeholder="Qty" aria-label="Quantity" oninput="cartManager.upd(${i.id},'qty',this.value)" onblur="cartManager.normalizeQty(${i.id},this.value)">
            <button class="inline-action-btn" title="Delete item" aria-label="Delete item" onclick="cartManager.del(${i.id})"><i class="fas fa-trash-alt" aria-hidden="true"></i></button>
        </div>`).join('');
        this.updateUI();
    }
    upd(id, f, v) {
        let item = this.cart.find(x => x.id === id); if (!item) return;
        if (f === 'price') {
            item[f] = v === '' ? 0 : Math.max(0, Math.floor(Number(v) || 0));
            inventoryPriceManager.registerPossibleNewItem(item.name, item[f]);
        } else if (f === 'qty') {
            if (v === '') return this.updateUI();
            item[f] = Math.max(1, parseInt(v, 10) || 1);
        } else {
            item[f] = v;
            const lookup = inventoryPriceManager.lookupPrice(v);
            if (lookup) { item.price = lookup.price; this.render(); return; }
        }
        if (f === 'price' || f === 'qty') {
            const activeInput = document.activeElement;
            if (activeInput && activeInput.closest('.item-row')) activeInput.value = String(item[f]);
        }
        this.updateUI();
    }
    normalizeQty(id, value) {
        const item = this.cart.find(x => x.id === id); if (!item) return;
        item.qty = Math.max(1, parseInt(value, 10) || 1);
        const activeInput = document.activeElement;
        if (activeInput && activeInput.closest('.item-row')) activeInput.value = String(item.qty);
        this.updateUI();
    }
    del(id) { this.cart = this.cart.filter(x => x.id !== id); this.render(); }
    addEmpty() { this.cart.push({ id: Math.floor(Date.now() + Math.random() * 1000), name: "Item", price: 0, qty: 1 }); this.render(); }
    handleClearCart() { if (confirm("Clear all items?")) { this.cart = []; this.render(); } }

    calculateTotals() {
        let sub = this.cart.reduce((s, i) => s + (parseFloat(i.price || 0) * parseInt(i.qty || 1)), 0),
            discountPct = parseFloat(document.getElementById('discount').value || 0) / 100,
            discountAmt = sub * discountPct, subAfterDiscount = sub - discountAmt,
            txVal = subAfterDiscount * (parseFloat(document.getElementById('tax').value || 0) / 100),
            total = subAfterDiscount + txVal,
            pd = parseFloat(document.getElementById('paid').value) || 0,
            onlinePaid = parseFloat(document.getElementById('online').value) || 0,
            totalPaid = pd + onlinePaid, change = totalPaid - total;
        return { sub, discountAmt, txVal, total, pd, onlinePaid, totalPaid, change };
    }

    updateUI() {
        const receiptBox = document.getElementById('receipt-box'); if (!receiptBox) return;
        const data = this.calculateTotals();
        let storeName = document.getElementById('storeSelect').value || "My Store";

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
                <div class="receipt-summary-row"><span>Subtotal</span><span>R ${data.sub.toFixed(2)}</span></div>
                ${data.discountAmt > 0 ? `<div class="receipt-summary-row discount"><span>Discount (${document.getElementById('discount').value}%)</span><span>-R ${data.discountAmt.toFixed(2)}</span></div>` : ''}
                ${data.txVal > 0 ? `<div class="receipt-summary-row"><span>Tax (${document.getElementById('tax').value}%)</span><span>R ${data.txVal.toFixed(2)}</span></div>` : ''}
                <div class="receipt-total-row"><span>TOTAL</span><span>R ${data.total.toFixed(2)}</span></div>
                ${data.totalPaid > 0 ? `
                    <div class="receipt-payments">
                        ${data.pd > 0 ? `<div class="receipt-payment-line"><span>Cash Paid</span><span>R ${data.pd.toFixed(2)}</span></div>` : ''}
                        ${data.onlinePaid > 0 ? `<div class="receipt-payment-line"><span>Card/S2S Paid</span><span>R ${data.onlinePaid.toFixed(2)}</span></div>` : ''}
                        <div class="receipt-change ${data.change >= 0 ? 'receipt-change-positive' : 'receipt-change-negative'}"><span>CHANGE</span><span>R ${data.change.toFixed(2)}</span></div>
                        ${data.change < 0 ? `<div class="receipt-due">AMOUNT DUE: R ${Math.abs(data.change).toFixed(2)}</div>` : ''}
                    </div>` : ''}
                <div class="receipt-qr-section"><div id="qr-place"></div></div>
                <p class="receipt-qr-note">SCAN TO VISIT OUR WEBSITE</p>
                <p class="receipt-footer">This receipt is prepared by <strong>${authManager.currentUser ? authManager.currentUser.name : "Easy Receipt"}</strong></p>
            </div>`;

        const qr = new QRious({ element: document.createElement('canvas'), value: 'https://www.receipts.lat', size: 90 });
        const qrContainer = document.getElementById('qr-place');
        if (qrContainer) {
            while(qrContainer.firstChild) qrContainer.removeChild(qrContainer.firstChild);
            qrContainer.appendChild(qr.image);
        }
    }
    //==========Print and Save Receipt Logic===============

    


    async saveReceipt() {
    if (this.cart.length === 0) return alert("Cart is empty!");
    const clientName = document.getElementById('client').value.trim();
    if (!clientName) return alert("Please type or choose a customer name to authorize log saving.");
    //if there is no payment made, confirm if the user wants to proceed 

    const totals = this.calculateTotals();
    const receiptId = Date.now();
    const timestampStr = new Date().toLocaleString();
    const activeStore = document.getElementById('storeSelect').value;

    let snapshotImage = '';
    if (window.html2canvas) {
        const receiptCanvas = await html2canvas(document.getElementById('receipt-box'), { scale: 2, backgroundColor: '#ffffff' });
        snapshotImage = receiptCanvas.toDataURL('image/png');
    }
    let snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
    snaps.push({ 
        id: receiptId, 
        timestamp: timestampStr, 
        store: activeStore, 
        client: clientName, 
        paid: totals.totalPaid, 
        total: totals.total,
        cartSnapshot: [...this.cart],
        image: snapshotImage
    });
    localStorage.setItem('p3_pos_snapshots', JSON.stringify(snaps));
    
    // Automatically triggers ledger calculation data distribution inside Customer Directory
    customerManager.logCustomerReceipt(clientName, {
        id: receiptId,
        timestamp: timestampStr,
        store: activeStore,
        total: totals.total,
        paid: (parseFloat(document.getElementById('paid').value) || 0) + (parseFloat(document.getElementById('online').value) || 0),
        items: [...this.cart]
    });

    if (typeof buildStatementRows === 'function') buildStatementRows(); 
    if (typeof renderSavedReceipts === 'function') renderSavedReceipts(); 
    
    alert("Receipt values recorded to customer data sheet successfully!");
}
    saveCurrentDraft() {
        if (this.cart.length === 0) return alert("Cart is empty!");
        const clientName = document.getElementById('client').value.trim();
        if (!clientName) return alert("Please specify a customer name before saving the draft.");
        
        const totals = this.calculateTotals();
        const receiptId = Date.now();
        const timestampStr = new Date().toLocaleString();
        const activeStore = document.getElementById('storeSelect').value;

        let drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');
        drafts.push({ 
            id: receiptId, 
            timestamp: timestampStr, 
            store: activeStore, 
            client: clientName, 
            tax: document.getElementById('tax').value, 
            discount: document.getElementById('discount').value, 
            paid: document.getElementById('paid').value, 
            online: document.getElementById('online').value, 
            cart: [...this.cart] 
        });
        localStorage.setItem('p3_pos_drafts', JSON.stringify(drafts));
        
        // Match sync log mapping
        customerManager.logCustomerReceipt(clientName, {
            id: receiptId,
            timestamp: timestampStr,
            store: activeStore,
            total: totals.total,
            paid: totals.pd,
            online: totals.onlinePaid,
            items: [...this.cart]
        });

        loadDrafts(); 
        alert("Draft saved and customer accounts updated!");
    }
}
//share receipt


// ─── 6. OUTBOUND COMMUNICATIONS MANAGER ──────────────────────────────────────
class SupportManager {
    async handleEmailSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('sendButton');
        const status = document.getElementById('statusArea');
        const fileInput = document.getElementById('fileInput');
        const file = fileInput ? fileInput.files[0] : null;

        if (status) status.innerHTML = "";
        btn.innerHTML = "Sending...";
        btn.disabled = true;

        const payloadBase = {
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            toEmail: document.getElementById('toEmail').value,
            storeName: document.getElementById('storeSelect')?.value || 'My Store'
        };

        const loadFileAsBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const sendPayload = async (base64 = "", name = "", type = "") => {
            const payload = { ...payloadBase, fileData: base64, fileName: name, fileType: type };
            await fetch('https://script.google.com/macros/s/AKfycbxJSub81_2nkKO4Svcmn5rrlQ-xuUi8rMjwit7M2PAsVGVCWAFMDTJBKn0nTb1HsDCDuA/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (status) {
                status.innerHTML = "<span class='status-success'>✅ Request sent to server!</span>";
                setTimeout(() => { if (status) status.innerHTML = ""; }, 4000);
            }
            const emailForm = document.getElementById('emailForm');
            if (emailForm) emailForm.reset();
        };

        try {
            if (file) {
                const base64 = await loadFileAsBase64(file);
                await sendPayload(base64, file.name, file.type);
            } else {
                await sendPayload();
            }
        } catch (err) {
            console.error('Email send failed:', err);
            if (status) status.innerHTML = `<span class='status-error'>❌ Failed to send: ${err.message}</span>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = "🚀 Send Email";
        }
    }
}

// ─── INITIALIZATION & SYSTEM CONTROLS ────────────────────────────────────────
const authManager = new AuthManager();
const storeManager = new StoreManager();
const customerManager = new CustomerManager();
const inventoryPriceManager = new InventoryPriceManager();
const cartManager = new CartManager();
const supportManager = new SupportManager();
Object.assign(window, { authManager, storeManager, customerManager, inventoryPriceManager, cartManager, supportManager });

function setupNavigationControls() {
    const shiftButton = document.getElementById('btn-shift');
    const downButton = document.getElementById('btn-down');
    const returnButton = document.getElementById('btn-return');
    if (!shiftButton || !downButton || !returnButton) return;
    const navigationButtons = [shiftButton, downButton, returnButton];

    const getFields = () => Array.from(document.querySelectorAll('.item-row input'))
        .filter(field => !field.disabled && field.offsetWidth > 0 && field.offsetHeight > 0);
    let currentField = null;
    document.addEventListener('focusin', event => {
        if (getFields().includes(event.target)) currentField = event.target;
    });
    const toggleButton = button => {
        const active = !button.classList.contains('active');
        navigationButtons.forEach(control => {
            control.classList.toggle('active', control === button && active);
            control.setAttribute('aria-pressed', String(control === button && active));
        });
        return active;
    };
    const focusField = field => {
        if (field) field.focus();
    };

    shiftButton.addEventListener('click', () => {
        if (!toggleButton(shiftButton)) return;
        const fields = getFields();
        if (!fields.length) return;
        const currentIndex = fields.indexOf(currentField);
        focusField(fields[(currentIndex + 1) % fields.length]);
    });

    downButton.addEventListener('click', () => {
        if (!toggleButton(downButton)) return;
        const fields = getFields();
        if (!fields.length) return;
        const currentRow = currentField?.closest('.item-row');
        if (currentRow) {
            const currentColumn = Array.from(currentRow.children).findIndex(child => child.contains(currentField));
            const nextRow = currentRow.nextElementSibling;
            const target = nextRow?.children[currentColumn]?.querySelector('input, textarea, select');
            if (target && getFields().includes(target)) return focusField(target);
        }
        const currentIndex = fields.indexOf(currentField);
        focusField(fields[(currentIndex + 1) % fields.length]);
    });

    returnButton.addEventListener('click', () => {
        if (!toggleButton(returnButton)) return;
        const currentRow = currentField?.closest('.item-row');
        const priceField = currentRow?.querySelector('input[type="number"]:not(.qty-box)');
        const quantityField = currentRow?.querySelector('input.qty-box');
        if (currentField === priceField) return focusField(quantityField);
        if (currentField === quantityField) return focusField(priceField);
        focusField(getFields()[0]);
    });
}

window.onload = function () {
    authManager.loadUserData();
    storeManager.initStoreManager();
    loadDrafts();
    customerManager.renderCustomerSuggestions();
    cartManager.cart = [{ id: 1, name: 'Sample Product', price: 0, qty: 1 }];
    cartManager.render();
    setupNavigationControls();

    document.querySelectorAll('input[type=text], input[type=number]').forEach(el => el.oninput = () => cartManager.updateUI());
    document.getElementById('emailForm').addEventListener('submit', (e) => supportManager.handleEmailSubmit(e));
};

function closeViewsModal() {
    // Automatically capture a draft backup if the cart has active rows before hiding the workspace view panel
    if (window.cartManager && window.cartManager.cart && window.cartManager.cart.length > 0) {
        const clientName = document.getElementById('client')?.value?.trim();
        // Only trigger auto-draft preserve if a client name has been designated
        if (clientName) {
            cartManager.saveCurrentDraft();
        }
    }
    document.getElementById('viewsModal').style.display = 'none';
}
function openProfileModal() { authManager.openAuthModal(); }

function handleMenuClick(actionType) { document.getElementById('dropdown').classList.remove('show'); openView(actionType); }
function toggleDropdown(e) { e.stopPropagation(); document.getElementById('dropdown').classList.toggle('show'); }

document.addEventListener('click', function (e) {
    const menuBtn = document.getElementById('menu-btn');
    const dropdown = document.getElementById('dropdown');
    if (menuBtn && dropdown && !menuBtn.contains(e.target)) dropdown.classList.remove('show');
});

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
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-muted">No entries discovered.</td></tr>`; return; }
    tbody.innerHTML = rows.map(d => {
        let itemsReport = '', totalVal = parseFloat(d.total || d.paid || 0);
        let currentCart = d.cart || d.cartSnapshot || [];
        
        if (currentCart.length) {
            itemsReport = currentCart.map(i => `• ${i.name} (x${i.qty}) @ R${parseFloat(i.price || 0).toFixed(2)}`).join('<br>');
        } else {
            itemsReport = 'No product listings';
        }
        return `<tr><td class="nowrap">${d.timestamp || ''}</td><td><b>${d.client || 'N/A'}</b><br><small class="text-muted">Store: ${d.store || 'N/A'}</small></td><td class="paragraph-small" style="font-family:monospace;">${itemsReport}</td><td class="right" style="font-weight:bold;color:var(--dark);">R ${totalVal.toFixed(2)}</td></tr>`;
    }).join('');
}

function renderSavedReceipts() {
    const view = document.getElementById('savedReceiptView'), snaps = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
    if (!view) return;
    view.innerHTML = snaps.length ? snaps.slice().reverse().map(s => {
        const items = s.cartSnapshot || [];
        const itemsEncoded = encodeURIComponent(JSON.stringify(items));
        const safeStore = String(s.store || 'Store').replace(/'/g, "\\'");
        const safeClient = String(s.client || 'Guest').replace(/'/g, "\\'");
        const itemCount = items.reduce((count, item) => count + (parseInt(item.qty, 10) || 0), 0);
        const preview = s.image
            ? `<img class="saved-receipt-thumb" src="${s.image}" alt="Receipt preview for ${safeClient}">`
            : `<div class="saved-receipt-thumb saved-receipt-thumb-empty"><i class="fas fa-receipt"></i><span>Preview unavailable</span></div>`;
        return `<article class="saved-receipt-card">
            <div class="saved-receipt-info">
                <div class="saved-receipt-heading"><span class="saved-receipt-badge"><i class="fas fa-check"></i> Saved</span><time>${s.timestamp || ''}</time></div>
                <h4>${safeClient}</h4>
                <p class="saved-receipt-store"><i class="fas fa-store"></i> ${safeStore}</p>
                <div class="saved-receipt-meta"><span>${itemCount} item${itemCount === 1 ? '' : 's'}</span><strong>R ${parseFloat(s.total || 0).toFixed(2)}</strong></div>
                <div class="saved-receipt-actions">
                    <button class="btn-primary" onclick="customerManager.viewTextReceipt('${safeStore}', '${String(s.timestamp || '').replace(/'/g, "\\'")}', '${safeClient}', ${parseFloat(s.total || 0)}, ${parseFloat(s.paid || 0)}, '${itemsEncoded}')"><i class="fas fa-eye"></i> View</button>
                    <button class="btn-share" onclick="downloadSavedReceipt(${s.id})"><i class="fas fa-download"></i> Download</button>
                </div>
            </div>
            <button class="saved-receipt-preview" type="button" onclick="showSavedReceipt(${s.id})" title="Open receipt preview">${preview}</button>
        </article>`;
    }).join('') : '<div class="saved-receipt-empty"><i class="fas fa-receipt"></i><p>No saved receipts found.</p><span>Saved receipt snapshots will appear here.</span></div>';
}

function renderDownloadedReceipts() {
    const container = document.getElementById('downloadView');
    if (!container) return;
    const snapshots = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]');
    const imageReceipts = snapshots.filter(snapshot => snapshot.image);
    if (!imageReceipts.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No saved receipt images yet.<br>Use the <b>Save Snap</b> button to save a receipt image here.</p></div>';
        return;
    }
    container.innerHTML = imageReceipts.slice().reverse().map(snapshot => `
        <article class="downloaded-item">
            <img src="${snapshot.image}" alt="Receipt for ${snapshot.client || 'Guest'}" onclick="viewReceiptImage(${snapshot.id})" title="Click to view full size">
            <div class="downloaded-item-info">
                <b>${snapshot.client || 'Guest'}</b>
                <p>${snapshot.store || 'Store'}</p>
                <p>${snapshot.timestamp || ''}</p>
                <strong>R ${parseFloat(snapshot.total || 0).toFixed(2)}</strong>
            </div>
            <div class="downloaded-item-actions">
                <button type="button" class="btn-primary" onclick="viewReceiptImage(${snapshot.id})"><i class="fas fa-eye"></i> View</button>
                <button type="button" class="btn-share" onclick="downloadSavedReceipt(${snapshot.id})"><i class="fas fa-download"></i> Download</button>
                <button type="button" class="btn-danger" onclick="deleteDownloadedReceipt(${snapshot.id})"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        </article>`).join('');
}

window.viewReceiptImage = function(id) {
    const snapshot = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]').find(item => String(item.id) === String(id));
    if (!snapshot || !snapshot.image) return alert('This receipt has no saved image.');
    const modal = document.getElementById('receiptImageModal');
    const image = document.getElementById('receiptImageView');
    if (!modal || !image) return;
    image.src = snapshot.image;
    modal.dataset.snapshotId = id;
    modal.style.display = 'flex';
};

window.deleteDownloadedReceipt = function(id) {
    if (!confirm('Delete this saved receipt image?')) return;
    const snapshots = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]')
        .filter(snapshot => String(snapshot.id) !== String(id));
    localStorage.setItem('p3_pos_snapshots', JSON.stringify(snapshots));
    renderDownloadedReceipts();
    renderSavedReceipts();
};

window.showSavedReceipt = function(id) {
    const snapshot = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]').find(item => item.id === id);
    if (!snapshot || !snapshot.image) return alert('This older receipt has no saved preview.');
    const modal = document.getElementById('receiptImageModal');
    const image = document.getElementById('receiptImageView');
    if (!modal || !image) return;
    image.src = snapshot.image;
    modal.dataset.snapshotId = id;
    modal.style.display = 'flex';
};

window.downloadSavedReceipt = function(id) {
    const snapshot = JSON.parse(localStorage.getItem('p3_pos_snapshots') || '[]').find(item => item.id === id);
    if (!snapshot || !snapshot.image) return alert('This older receipt has no saved image to download.');
    const link = document.createElement('a');
    link.href = snapshot.image;
    link.download = `receipt-${id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

window.downloadReceipt = async function() {
    const receipt = document.getElementById('receipt-box');
    if (!receipt) return alert('No receipt is available to download.');
    if (!window.html2canvas) return alert('Receipt download is unavailable because the image service did not load.');
    try {
        const canvas = await html2canvas(receipt, { scale: 3, backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `receipt-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Receipt download failed:', error);
        alert('Could not download the receipt. Please try again.');
    }
};

window.printReceiptOnly = function() {
    const originalReceipt = document.getElementById('receipt-box');
    if (!originalReceipt) return alert("Receipt details are empty.");

    const receiptClone = originalReceipt.cloneNode(true);
    const originalQrCanvas = document.querySelector('#qr-place canvas');
    let qrImageUrl = '';
    if (originalQrCanvas) {
        try { qrImageUrl = originalQrCanvas.toDataURL('image/png'); } catch(e) { console.warn(e); }
    }
    if (qrImageUrl) {
        const cloneQrContainer = receiptClone.querySelector('#qr-place');
        if (cloneQrContainer) {
            while (cloneQrContainer.firstChild) cloneQrContainer.removeChild(cloneQrContainer.firstChild);
            const qrImg = document.createElement('img');
            qrImg.src = qrImageUrl;
            qrImg.style.width = '90px'; qrImg.style.height = '90px';
            qrImg.style.display = 'block'; qrImg.style.margin = '0 auto';
            cloneQrContainer.appendChild(qrImg);
        }
    }
    
    let styleContent = '';
    document.querySelectorAll('style').forEach(s => { if (s.innerHTML) styleContent += s.innerHTML; });
    const printSpecificCSS = `@media print { body { background: white; margin: 0; display: flex; justify-content: center; } #print-receipt-wrapper { width: 100%; max-width: 400px; } button, .no-print { display: none !important; } } #receipt-box { padding: 20px; background: white; font-family: monospace; }`;
    const printHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title><style>${styleContent} ${printSpecificCSS}</style><style>body > *:not(#print-receipt-wrapper) { display: none; } #print-receipt-wrapper { display: block; }</style></head><body><div id="print-receipt-wrapper">${receiptClone.outerHTML}</div><script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 250); };<\/script></body></html>`;
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) return alert("Please enable pop-up permissions to print.");
    printWindow.document.write(printHtml);
    printWindow.document.close();
};

// WhatsApp Sharing using text formatting to keep operations efficient
window.shareToWhatsApp = function() {
    const totals = cartManager.calculateTotals();
    const client = document.getElementById('client').value || 'Customer';
    const store = document.getElementById('storeSelect').value;
    
    let text = `*${store} - Receipt Transaction*\n`;
    text += `Date: ${new Date().toLocaleString()}\n`;
    text += `Client: ${client}\n`;
    text += `---------------------------\n`;
    cartManager.cart.forEach(i => {
        text += `• ${i.name} (x${i.qty}) - R ${(parseFloat(i.price) * i.qty).toFixed(2)}\n`;
    });
    text += `---------------------------\n`;
    text += `*TOTAL BILL:* R ${totals.total.toFixed(2)}\n`;
    text += `*AMOUNT PAID:* R ${totals.totalPaid.toFixed(2)}\n`;
    if (totals.change >= 0) text += `*CHANGE/DEPOSIT:* R ${totals.change.toFixed(2)}\n`;
    else text += `*AMOUNT DUE:* R ${Math.abs(totals.change).toFixed(2)}\n`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};


function openView(type) {
    const modal = document.getElementById('viewsModal');
    document.querySelectorAll('#viewsModal .view-panel').forEach(v => v.classList.remove('active'));
    
    const panel = document.getElementById('view-' + type);
    if(panel) panel.classList.add('active');

    if (type === 'profile') {
        const saved = authManager.getStoredProfile();
        const profileView = document.getElementById('profileView');
        if (profileView) {
            profileView.innerHTML = saved && saved.name && saved.email
                ? `<div class="profile-profile-line"><p><b>Name:</b> ${saved.name}</p><p><b>Email:</b> ${saved.email}</p><p><b>Provider:</b> ${saved.provider || 'manual'}</p></div>`
                : '<p class="paragraph-small">No profile saved yet.</p>';
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
// ─── AUTO-RESUME DETECTOR FOR RETURNING CUSTOMERS ───────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const clientInput = document.getElementById('client');
    if (!clientInput) return;

    // Listen for when a customer name is filled, selected from datalist, or loses focus
    ['input', 'change', 'blur'].forEach(eventType => {
        clientInput.addEventListener(eventType, () => {
            const currentName = clientInput.value.trim();
            if (!currentName) return;

            // Fetch active drafts from storage directory
            const drafts = JSON.parse(localStorage.getItem('p3_pos_drafts') || '[]');

            // Find the most recent draft matching this customer (case-insensitive)
            const matchingDraft = drafts.slice().reverse().find(d => d.client && d.client.toLowerCase() === currentName.toLowerCase());

            // If a draft is found, and it's not already loaded in the active cart workspace
            if (matchingDraft && (!window.cartManager.cart.length || window.cartManager.cart[0].name === 'Sample Product')) {
                // Prevent duplicate popups if one is already visible on screen
                if (document.getElementById('autoResumeModal')) return;

                showResumePopup(matchingDraft);
            }
        });
    });
});

// Structural popup generator (uses standard window overlay styles to keep design pristine)
function showResumePopup(draft) {
    const overlay = document.createElement('div');
    overlay.id = 'autoResumeModal';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center;
        align-items: center; z-index: 999999; backdrop-filter: blur(2px);
    `;

    // Map out item summary context strings for glance checking
    const itemsSummary = d => d.cart ? d.cart.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Empty Cart';

    overlay.innerHTML = `
        <div style="background: white; padding: 24px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); font-family: sans-serif;">
            <div style="text-align: center; margin-bottom: 16px;">
                <i class="fas fa-clock-rotate-left" style="font-size: 32px; color: #f97316;"></i>
            </div>
            <h3 style="text-align: center; margin: 0 0 8px 0; color: #1e293b; font-size: 18px;">Pending Draft Detected</h3>
            <p style="text-align: center; font-size: 13.5px; color: #64748b; margin: 0 0 16px 0;">
                We found a saved transaction record for <b>${draft.client}</b> from ${draft.timestamp}.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12.5px; color: #334155; max-height: 80px; overflow-y: auto; margin-bottom: 20px; font-family: monospace;">
                <strong>Items:</strong> ${itemsSummary(draft)}
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="resumeDeclineBtn" style="flex: 1; padding: 10px; border-radius: 8px; background: #e2e8f0; color: #475569; font-weight: 600; border: none; cursor: pointer; font-size: 13.5px;">
                    Start New
                </button>
                <button id="resumeConfirmBtn" style="flex: 1; padding: 10px; border-radius: 8px; background: #16a34a; color: white; font-weight: 600; border: none; cursor: pointer; font-size: 13.5px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fas fa-play"></i> Continue
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Event Action Trigger: Continue Session Button
    document.getElementById('resumeConfirmBtn').addEventListener('click', () => {
        if (window.restoreDraft) {
            window.restoreDraft(draft.id);
        }
        overlay.remove();
    });

    // Event Action Trigger: Decline / Start New Button
    document.getElementById('resumeDeclineBtn').addEventListener('click', () => {
        overlay.remove();
    });
}
// ─── STANDALONE RECEIPT, PRINT & SHARE LOGIC ──────────────────

/**
 * Executes direct receipt printing with print-specific styling
 */
window.printReceiptOnly = function() {
    const originalReceipt = document.getElementById('receipt-box');
    if (!originalReceipt) return alert("No active receipt found to print.");

    const receiptClone = originalReceipt.cloneNode(true);
    const originalQrCanvas = document.querySelector('#qr-place canvas');
    
    let qrImageUrl = '';
    if (originalQrCanvas) {
        try { qrImageUrl = originalQrCanvas.toDataURL('image/png'); } catch(e) { console.warn(e); }
    }
    
    if (qrImageUrl) {
        const cloneQrContainer = receiptClone.querySelector('#qr-place');
        if (cloneQrContainer) {
            cloneQrContainer.innerHTML = `<img src="${qrImageUrl}" style="width:90px; height:90px; display:block; margin:0 auto;" />`;
        }
    }

    const printSpecificCSS = `
        @media print { 
            body { background: white; margin: 0; display: flex; justify-content: center; } 
            #print-receipt-wrapper { width: 100%; max-width: 400px; } 
            button, .no-print, .sticky-bottom-nav { display: none !important; } 
        } 
        #receipt-box { padding: 20px; background: white; font-family: monospace; }
    `;

    const printHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Print Receipt</title>
                <base href="${location.href}">
                <link rel="stylesheet" href="styles.css">
                <style>${printSpecificCSS}</style>
            </head>
            <body>
                <div id="print-receipt-wrapper">${receiptClone.outerHTML}</div>
                <script>
                    window.onload = function() { 
                        setTimeout(function() { window.print(); window.close(); }, 250); 
                    };
                <\/script>
            </body>
        </html>`;

    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) return alert("Please allow pop-ups to print the receipt.");
    printWindow.document.write(printHtml);
    printWindow.document.close();
};

/**
 * Triggers WhatsApp share with formatted receipt text
 */
window.shareReceiptAction = function() {
    if (!window.cartManager || window.cartManager.cart.length === 0) {
        return alert("Cart is empty! Add items before sharing.");
    }
    
    const totals = cartManager.calculateTotals();
    const client = document.getElementById('client')?.value || 'Customer';
    const store = document.getElementById('storeSelect')?.value || 'Easy Receipt';

    let text = `*${store} - Official Receipt*\n`;
    text += `Date: ${new Date().toLocaleString()}\n`;
    text += `Client: ${client}\n`;
    text += `---------------------------\n`;
    
    cartManager.cart.forEach(i => {
        text += `• ${i.name} (x${i.qty}) - R ${(parseFloat(i.price) * i.qty).toFixed(2)}\n`;
    });
    
    text += `---------------------------\n`;
    text += `*TOTAL BILL:* R ${totals.total.toFixed(2)}\n`;
    text += `*PAID:* R ${totals.totalPaid.toFixed(2)}\n`;
    
    if (totals.change >= 0) {
        text += `*CHANGE:* R ${totals.change.toFixed(2)}\n`;
    } else {
        text += `*AMOUNT DUE:* R ${Math.abs(totals.change).toFixed(2)}\n`;
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};

window.openShareOptions = function() {
    if (!window.cartManager || window.cartManager.cart.length === 0) return alert('Cart is empty! Add items before sharing.');
    const existing = document.getElementById('shareOptionsModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'shareOptionsModal';
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content" onclick="event.stopPropagation()">
        <span class="close-modal" onclick="document.getElementById('shareOptionsModal').remove()">&times;</span>
        <h3 class="modal-heading"><i class="fas fa-share-alt"></i> Share Receipt</h3>
        <div class="flex-gap-10">
            <button class="btn-share" onclick="shareReceiptAction(); document.getElementById('shareOptionsModal').remove()"><i class="fab fa-whatsapp"></i> WhatsApp</button>
            <button class="btn-primary" onclick="openReceiptEmail(); document.getElementById('shareOptionsModal').remove()"><i class="fas fa-envelope"></i> Email</button>
            <button class="btn-primary" onclick="window.downloadReceipt(); document.getElementById('shareOptionsModal').remove()"><i class="fas fa-download"></i> Download</button>
        </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.openReceiptEmail = function() {
    const modal = document.getElementById('receiptEmailModal');
    const email = document.getElementById('customerEmail')?.value.trim() || '';
    if (!email) return alert('Select or save a customer email before sending.');
    document.getElementById('receiptEmailTo').value = email;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
};

window.closeReceiptEmail = function() {
    const modal = document.getElementById('receiptEmailModal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
};

window.sendReceiptByEmail = async function() {
    const emailInput = document.getElementById('receiptEmailTo');
    const button = document.getElementById('sendReceiptEmailButton');
    const status = document.getElementById('receiptEmailStatus');
    if (!emailInput.checkValidity()) return emailInput.reportValidity();
    if (!window.cartManager || !window.cartManager.cart.length) return alert('Cart is empty! Add items before sending.');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    status.textContent = '';
    try {
        const canvas = await html2canvas(document.getElementById('receipt-box'), { scale: 2, backgroundColor: '#ffffff' });
        const payload = {
            toEmail: emailInput.value.trim(),
            subject: document.getElementById('receiptEmailSubject').value.trim() || 'Your receipt from Easy Receipt',
            message: `Receipt from ${document.getElementById('storeSelect').value || 'Easy Receipt'}. Please see the attached receipt.`,
            storeName: document.getElementById('storeSelect').value || 'Easy Receipt',
            fileData: canvas.toDataURL('image/png').split(',')[1],
            fileName: 'receipt.png',
            fileType: 'image/png'
        };
        await fetch('https://script.google.com/macros/s/AKfycbxJSub81_2nkKO4Svcmn5rrlQ-xuUi8rMjwit7M2PAsVGVCWAFMDTJBKn0nTb1HsDCDuA/exec', {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        status.innerHTML = '<span class="status-success">Receipt sent successfully.</span>';
    } catch (error) {
        status.innerHTML = `<span class="status-error">Could not send receipt: ${error.message}</span>`;
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Receipt';
    }
};