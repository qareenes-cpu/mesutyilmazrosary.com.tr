# Yayınlama Rehberi (Railway)

Bu rehber, MySQL veritabanı kullanan Node.js uygulamanızı **Railway** (popüler bir bulut platformu) üzerinde nasıl yayınlayacağınızı anlatır.

## Ön Hazırlıklar
- Bir GitHub hesabı (kodunuzu barındırmak için).
- Bir [Railway](https://railway.app/) hesabı (GitHub ile giriş yapabilirsiniz).

## 1. Adım: Kodu GitHub'a Yükleyin
1. GitHub üzerinde yeni bir "repository" (depo) oluşturun.
2. Kodlarınızı bu depoya yüklemek için terminalde şu komutları çalıştırın:
   ```bash
   git init
   git add .
   git commit -m "Yayına hazırlık"
   git branch -M main
   # Aşağıdaki satırı kendi repo adresinizle değiştirin
   git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git 
   git push -u origin main
   ```

## 2. Adım: Railway Üzerinde Proje Oluşturun
1. Railway Paneline (Dashboard) gidin.
2. **"New Project"** butonuna tıklayın ve **"Deploy from GitHub repo"** seçeneğini seçin.
3. Listeden az önce oluşturduğunuz repoyu seçin.
4. **"Deploy Now"** butonuna tıklayın.

## 3. Adım: Veritabanı Ekleyin (MySQL)
1. Railway proje ekranında boş bir yere sağ tıklayın veya **"New"** butonuna basın.
2. **"Database"** > **"MySQL"** seçeneğini seçin.
3. Veritabanının oluşturulmasını bekleyin.

## 4. Adım: Ayarları Yapılandırın
1. **Node.js servisine** (GitHub'dan gelen kutucuk) tıklayın.
2. **"Variables"** sekmesine gidin.
3. Uygulamanın veritabanına bağlanabilmesi için şu değişkenleri eklemeniz gerekir (MySQL servisine tıklayıp "Connect" sekmesinden veya "Variable Reference" kısmından bu bilgileri bulabilirsiniz):
   - `DB_HOST`: (MySQL servisinden alınacak)
   - `DB_USER`: (MySQL servisinden alınacak)
   - `DB_PASSWORD`: (MySQL servisinden alınacak)
   - `DB_NAME`: (Genellikle `railway` olur, MySQL servisinden kontrol edin)
   - `PORT`: `3000` (Opsiyonel, Railway genelde otomatik atar)

## 5. Adım: Yayını Doğrulayın
1. Node.js servisinin **"Settings"** sekmesine gidin.
2. "Networking" başlığı altında **"Generate Domain"** butonuna tıklayın.
3. Oluşturulan linke tıklayarak sitenize gidin.
   - Veritabanı tablolarınız, eklediğimiz kod sayesinde otomatik olarak oluşturulacaktır.
   - Varsayılan Yönetici Girişi: `admin` / `admin123`

> [!WARNING]
> **Dosya Yüklemeleri Hakkında Önemli Not**:
> Bu proje resimleri `uploads/` klasörüne kaydeder. Railway gibi sistemlerde, her yeni kod attığınızda veya proje yeniden başladığında bu klasör sıfırlanır ve **yüklenen resimler silinir**.
> Gerçek bir prodüksiyon ortamında resimlerin kaybolmaması için AWS S3 veya Cloudinary gibi bir depolama hizmeti kullanılması gerekir.
