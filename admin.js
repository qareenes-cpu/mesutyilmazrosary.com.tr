// Login Control
if (localStorage.getItem('isAdmin') !== 'true') {
    window.location.href = 'login.html';
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        renderAdminList(products);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        renderCategoriesList(categories);
        updateProductCategoryDropdown(categories);
    } catch (err) {
        console.error('Fetch categories error:', err);
    }
}

function renderCategoriesList(categories) {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    categories.forEach(cat => {
        const span = document.createElement('div');
        span.className = 'collection-tag';
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.gap = '10px';
        span.style.padding = '8px 15px';
        span.innerHTML = `
            ${cat.name}
            <span onclick="deleteCategory(${cat.id})" style="cursor:pointer; color:#ff453a; font-weight:bold;">&times;</span>
        `;
        list.appendChild(span);
    });
}

function updateProductCategoryDropdown(categories) {
    const select = document.getElementById('product-category-select');
    if (!select) return;
    select.innerHTML = '<option value="">Kategori Seçin</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
}

async function addCategory() {
    const input = document.getElementById('new-category-name');
    const name = input.value.trim();
    if (!name) return;

    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (response.ok) {
            input.value = '';
            fetchCategories();
        }
    } catch (err) {
        console.error('Add category error:', err);
    }
}

async function deleteCategory(id) {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCategories();
        }
    } catch (err) {
        console.error('Delete category error:', err);
    }
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Önizleme">`;
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = `<span class="placeholder">Görsel Seçilmedi</span>`;
    }
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const result = await response.json();
        return result.imageUrl;
    } else {
        throw new Error('Dosya yükleme hatası!');
    }
}

function renderAdminList(products) {
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight:600; color:#fff;">${p.product_code}</div>
                <div style="font-size:0.7rem; color: #888;">${p.series_number || '-'}</div>
            </td>
            <td>${p.name}</td>
            <td>${p.master || '-'}</td>
            <td><span class="collection-tag" style="margin:0;">${p.category || 'Genel'}</span></td>
            <td>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showModal() {
    document.getElementById('productModal').style.display = 'block';
}

function hideModal() {
    document.getElementById('productModal').style.display = 'none';
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        // Handle image upload if a file is selected
        const fileInput = document.getElementById('product-image-file');
        if (fileInput.files && fileInput.files[0]) {
            const imageUrl = await uploadFile(fileInput.files[0]);
            data.image_url = imageUrl;
        }

        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            hideModal();
            fetchProducts();
            e.target.reset();
            document.getElementById('product-preview').innerHTML = `<span class="placeholder">Görsel Seçilmedi</span>`;
        } else {
            // Original alert was 'Bir hata oluştu.'
            // The instruction implies removing the success alert and adding a generic error alert in the catch block.
            // If response is not ok, it's still an error.
            alert('Bir hata oluştu.');
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('Hata: ' + err.message);
    }
});

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchProducts();
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        document.getElementById('set-master-name').value = settings.master_name || '';
        document.getElementById('set-master-title').value = settings.master_title || '';
        document.getElementById('set-master-bio').value = settings.master_bio || '';
        document.getElementById('set-master-image').value = settings.master_image || '';
        document.getElementById('set-admin-email').value = settings.admin_email || '';
        document.getElementById('set-admin-phone').value = settings.admin_phone || '';
        document.getElementById('set-admin-user').value = settings.admin_user || '';

        if (settings.master_image) {
            document.getElementById('profile-preview').innerHTML = `<img src="${settings.master_image}" alt="Önizleme">`;
        }
    } catch (err) {
        console.error('Settings load error:', err);
    }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        // Handle image upload if a file is selected
        const fileInput = document.getElementById('set-master-image-file');
        if (fileInput.files && fileInput.files[0]) {
            const imageUrl = await uploadFile(fileInput.files[0]);
            data.master_image = imageUrl;
        }

        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Ayarlar başarıyla güncellendi!');
        } else {
            alert('Bir hata oluştu.');
        }
    } catch (err) {
        console.error('Settings save error:', err);
        alert('Hata: ' + err.message);
    }
});

document.getElementById('accountSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Only update password if it's not empty
    if (!data.admin_pass) {
        delete data.admin_pass;
    }

    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Güvenlik ayarları başarıyla güncellendi!');
            loadSettings();
        } else {
            alert('Bir hata oluştu.');
        }
    } catch (err) {
        console.error('Account settings save error:', err);
        alert('Hata: ' + err.message);
    }
});

// --- APPOINTMENTS MANAGEMENT ---
async function fetchAppointments() {
    try {
        const response = await fetch('/api/appointments');
        const appointments = await response.json();
        renderAppointmentsList(appointments);
    } catch (err) {
        console.error('Fetch appointments error:', err);
    }
}

function renderAppointmentsList(appointments) {
    const tbody = document.getElementById('appointments-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    appointments.forEach(apt => {
        const tr = document.createElement('tr');
        const date = new Date(apt.appointment_date).toLocaleDateString('tr-TR');
        tr.innerHTML = `
            <td>${apt.user_name}</td>
            <td>${apt.phone}</td>
            <td>${date}</td>
            <td><div style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${apt.message || ''}">${apt.message || '-'}</div></td>
            <td>
                <button class="btn-delete" onclick="deleteAppointment(${apt.id})">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteAppointment(id) {
    if (!confirm('Bu randevu talebini silmek istediğinize emin misiniz?')) return;
    try {
        const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchAppointments();
        }
    } catch (err) {
        console.error('Delete appointment error:', err);
    }
}

function logout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadSettings();
    fetchCategories();
    fetchAppointments();
});
window.onclick = function (event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) hideModal();
}
