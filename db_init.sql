-- Create Database
CREATE DATABASE IF NOT EXISTS tesbih_vitrini CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tesbih_vitrini;

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    master VARCHAR(255),
    collection VARCHAR(255),
    description TEXT,
    material VARCHAR(100),
    series_number VARCHAR(100),
    bead_count INT,
    bead_size VARCHAR(50),
    imame_motif VARCHAR(100),
    imame_size VARCHAR(50),
    stock_code VARCHAR(100),
    category VARCHAR(100),
    image_url VARCHAR(255),
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data (Optional)
INSERT IGNORE INTO products (product_code, name, master, collection, description, material, series_number, bead_count, bead_size, imame_motif, imame_size, stock_code, category, image_url)
VALUES 
('MS-001', 'Osmanlı Sıkma Kehribar', 'Mesut Efendi', 'Saray İşçiliği', 'Özel damarlı, antika değerinde sıkma kehribar.', 'Sıkma Kehribar', '8160271899', 33, '10 x 14 mm', 'Estetica', '84 mm', 'ESTKHR01', 'Kehribar Tesbihler', 'assets/tesbih-1.png'),
('MS-002', 'Gümüş İşlemeli Oltu', 'Usta Elleri', 'Klasik Seri', 'Erzurum Oltusu üzerine ince gümüş kakma işçiliği.', 'Oltu Taşı', '9273645182', 33, '8 x 12 mm', 'Klasik', '75 mm', 'OLTGMS02', 'Oltu Tesbihler', 'assets/tesbih-2.png'),
('MS-003', 'Usta İşlemeli Kuka', 'Mesut Yılmaz', 'Doğal Doku', 'Eski kuka malzemeden, çekimi yumuşak bir eser.', 'Kuka', '7362514890', 33, '11 x 11 mm', 'Lale', '80 mm', 'KUKAST03', 'Kuka Tesbihler', 'assets/tesbih-3.png'),
('MS-004', 'Damla Kehribar (Dominik)', 'Doğa Sanatı', 'Nadir Eserler', 'Fosil kalıntıları içeren, gün ışığında renk değiştiren özel kehribar.', 'Damla Kehribar', '5521098432', 33, '9 x 13 mm', 'Yaprak', '70 mm', 'DMLDOM04', 'Kehribar Tesbihler', 'assets/tesbih-1.png'),
('MS-005', 'Ateş Kehribar (Kırmızı)', 'Mesut Yılmaz', 'Ateş Serisi', 'Canlı kırmızı tonuyla dikkat çeken, yüksek kondisyonlu eser.', 'Ateş Kehribar', '4432109876', 33, '10 x 10 mm', 'Alev', '82 mm', 'ATSKHR05', 'Kehribar Tesbihler', 'assets/tesbih-2.png'),
('MS-006', 'Hareli Bağ Kehribar', 'Usta Kalemi', 'Özel Tasarım', 'Koyu hareleri ve kadifemsi çekimi ile koleksiyonluk bir parça.', 'Bağ Kehribar', '1122334455', 33, '12 x 15 mm', 'Geleneksel', '90 mm', 'HREBAG06', 'Kehribar Tesbihler', 'assets/tesbih-3.png'),
('MS-007', 'Eski Katalin (Yeşil)', 'Eskici Ustası', 'Antika Seri', '1940\'lı yıllardan kalma, renk almış antika katalin malzeme.', 'Katalin', '9988776655', 33, '8 x 8 mm', 'Nokta', '65 mm', 'ANTKAT07', 'Antika Tesbihler', 'assets/tesbih-1.png');

-- Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES 
('master_name', 'Mesut Yılmaz'),
('master_title', 'Usta Sanatkar & Koleksiyoner'),
('master_bio', 'Yılların deneyimi ile her tanede sanatı ilmek ilmek işliyor.'),
('master_image', 'assets/master-1.png'),
('admin_email', 'info@ahmetyilmazrosary.com'),
('admin_phone', '905350580363'),
('admin_user', 'admin'),
('admin_pass', 'admin123');

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT IGNORE INTO categories (name) VALUES 
('Damla Kehribar'),
('Sıkma Kehribar'),
('Ateş Kehribar'),
('Oltu Taşı'),
('Kuka Tesbihler'),
('Ağaç Grubu'),
('Değerli Taşlar'),
('Fosil Grubu'),
('Antika Serisi');

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    appointment_date DATE,
    message TEXT,
    status ENUM('Bekliyor', 'Onaylandı', 'Tamamlandı', 'İptal Edildi') DEFAULT 'Bekliyor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
