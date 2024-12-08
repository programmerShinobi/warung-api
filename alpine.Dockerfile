# Gunakan Node.js versi 20 sebagai gambar dasar
FROM node:20.15.1-alpine

# Atur direktori kerja ke /app
WORKDIR /app

# Salin berkas package.json dan yarn.lock untuk memanfaatkan cache instalasi
COPY package.json yarn.lock ./

# Instal dependensi menggunakan Yarn
RUN yarn install --frozen-lockfile && yarn cache clean

# Salin sisa kode aplikasi ke dalam kontainer
COPY . .

# Membuat direktori unggahan && Membangun aplikasi
RUN mkdir -p /app/uploads && yarn build

# Ekspos port 3000 agar aplikasi dapat mendengarkan
EXPOSE 3000

# Menjalankan migrasi dan memulai aplikasi
ENTRYPOINT ["sh", "-c", "yarn migration:run && yarn start:prod"]
