const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload a report file (PDF or image) — forces download via fl_attachment
const uploadPDF = (buffer, filename, mimetype) => {
  const isPDF = !mimetype || mimetype === 'application/pdf'
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: isPDF ? 'raw' : 'image',
        folder: 'lablinker/reports',
        public_id: filename,
        use_filename: false,
        ...(isPDF ? { flags: 'attachment' } : {}),
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

// Upload a certification file (PDF or image) — forces download via fl_attachment
const uploadCertification = (buffer, filename, mimetype) => {
  const isPDF = !mimetype || mimetype === 'application/pdf'
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: isPDF ? 'raw' : 'image',
        folder: 'lablinker/certifications',
        public_id: filename,
        use_filename: false,
        ...(isPDF ? { flags: 'attachment' } : {}),
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

module.exports = { uploadPDF, uploadCertification }
