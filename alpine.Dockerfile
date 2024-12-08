# Gunakan Node.js versi 20 sebagai gambar dasar
FROM node:20.15.1-alpine

# Atur direktori kerja ke /app
WORKDIR /app

# Salin berkas package.json ke dalam kontainer
COPY package.json ./

# Instal dependensi menggunakan Yarn
RUN yarn install

# Salin sisa kode aplikasi ke dalam kontainer
COPY . .

# Membuat unggahan direktori
RUN mkdir uploads

# Ekspos port 3000 agar aplikasi dapat mendengarkan
EXPOSE 3000

# Mengatur perintah untuk memulai aplikasi
RUN yarn typeorm-ts-node-commonjs -d src/config/typeorm.config.ts migration:run
RUN yarn build
ENTRYPOINT ["yarn", "start"]
