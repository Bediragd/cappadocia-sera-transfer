-- Popüler oteller tablosu
CREATE TABLE IF NOT EXISTS popular_hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    image_url TEXT,
    amenities TEXT[], -- Klima, Wi-Fi, Havuz vs.
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    price_range VARCHAR(50), -- '€€€', '€€€€' gibi
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX idx_hotels_region ON popular_hotels(region);
CREATE INDEX idx_hotels_category ON popular_hotels(category);
CREATE INDEX idx_hotels_rating ON popular_hotels(rating DESC);
CREATE INDEX idx_hotels_active ON popular_hotels(is_active);

-- Kapadokya popüler otelleri ekle
INSERT INTO popular_hotels (name, category, region, address, latitude, longitude, rating, image_url, amenities, phone, price_range, description) VALUES
('Museum Hotel', '5 Star', 'Uçhisar', 'Tekeli Mah. No:1, 50240 Uçhisar/Nevşehir', 38.62740000, 34.80330000, 4.8, '/hotels/museum-hotel.jpg', 
 ARRAY['Spa', 'Restoran', 'Bar', 'Wi-Fi', 'Havuz', 'Otopark'], '+90 384 219 2220', '€€€€',
 'Kapadokya''nın en lüks otellerinden biri. Muhteşem manzara ve tarihi mağara odalar.'),

('Argos in Cappadocia', '5 Star', 'Uçhisar', 'Aşağı Mahalle, Kayabaşı Sk. No:25, 50240 Uçhisar/Nevşehir', 38.62890000, 34.80450000, 4.9, '/hotels/argos.jpg',
 ARRAY['Spa', 'Restoran', 'Bar', 'Wi-Fi', 'Kapalı Havuz', 'Otopark', 'Konser Salonu'], '+90 384 219 3130', '€€€€',
 'Tarihi taş evlerden oluşan butik otel. Mükemmel konumu ve hizmeti ile dikkat çekiyor.'),

('Sultan Cave Suites', 'Boutique', 'Göreme', 'Aydınlı Mah. Belediye Cad. No:39, 50180 Göreme/Nevşehir', 38.64360000, 34.82810000, 4.7, '/hotels/sultan-cave.jpg',
 ARRAY['Restoran', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark'], '+90 384 271 2866', '€€€',
 'Göreme''nin merkezinde, balon manzaralı teraslı mağara otel.'),

('Cappadocia Cave Suites', 'Boutique', 'Göreme', 'Ünlü Sok. No:19, 50180 Göreme/Nevşehir', 38.64450000, 34.82950000, 4.6, '/hotels/cave-suites.jpg',
 ARRAY['Restoran', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark', 'Balon İzleme Terası'], '+90 384 271 2800', '€€€',
 'Göreme''de balon manzarası için en iyi konumlardan biri.'),

('Kayakapi Premium Caves', '5 Star', 'Ürgüp', 'Kayakapı Mahallesi, 50400 Ürgüp/Nevşehir', 38.62850000, 34.91450000, 4.8, '/hotels/kayakapi.jpg',
 ARRAY['Spa', 'Restoran', 'Bar', 'Wi-Fi', 'Kapalı Havuz', 'Otopark', 'Hamam'], '+90 384 341 6900', '€€€€',
 'Ürgüp''ün en lüks oteli. Tarihi doku ve modern konfor bir arada.'),

('Mithra Cave Hotel', '4 Star', 'Göreme', 'Hakki Pasa Meydani No:1, 50180 Göreme/Nevşehir', 38.64230000, 34.82670000, 4.5, '/hotels/mithra.jpg',
 ARRAY['Restoran', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark'], '+90 384 271 2474', '€€',
 'Göreme merkezde uygun fiyatlı, kaliteli konaklama.'),

('Seki Cave Suites', 'Boutique', 'Uçhisar', 'Göreme Cad. No:58, 50240 Uçhisar/Nevşehir', 38.62980000, 34.80620000, 4.7, '/hotels/seki.jpg',
 ARRAY['Restoran', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark', 'Havuz'], '+90 384 219 3030', '€€€',
 'Uçhisar kalesi manzaralı, şık tasarımlı butik otel.'),

('Gamirasu Hotel', '4 Star', 'Ayvali', 'Ayvali Köyü, 50500 Ürgüp/Nevşehir', 38.59870000, 34.87450000, 4.6, '/hotels/gamirasu.jpg',
 ARRAY['Restoran', 'Bar', 'Wi-Fi', 'Kahvaltı', 'Otopark', 'Bahçe'], '+90 384 354 5060', '€€',
 '1000 yıllık manastırdan dönüştürülmüş eşsiz bir otel.'),

('Hezen Cave Hotel', 'Boutique', 'Göreme', 'Müze Cad. No:13, 50180 Göreme/Nevşehir', 38.64180000, 34.82450000, 4.5, '/hotels/hezen.jpg',
 ARRAY['Restoran', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark'], '+90 384 271 2616', '€€',
 'Açık Hava Müzesi''ne 5 dakika yürüme mesafesinde.'),

('Kelebek Special Cave Hotel', '4 Star', 'Göreme', 'Gaferli Mah. Aydınlı Sok. No:31, 50180 Göreme/Nevşehir', 38.64420000, 34.82890000, 4.7, '/hotels/kelebek.jpg',
 ARRAY['Restoran', 'Bar', 'Teras', 'Wi-Fi', 'Kahvaltı', 'Otopark', 'Havuz'], '+90 384 271 2531', '€€',
 'Göreme''nin en popüler otellerinden. Havuz ve teras manzarası muhteşem.');

-- Otel istatistikleri için view
CREATE OR REPLACE VIEW hotel_stats AS
SELECT 
    region,
    COUNT(*) as hotel_count,
    AVG(rating) as avg_rating,
    COUNT(*) FILTER (WHERE category = '5 Star') as five_star_count,
    COUNT(*) FILTER (WHERE category = 'Boutique') as boutique_count
FROM popular_hotels
WHERE is_active = true
GROUP BY region
ORDER BY hotel_count DESC;
