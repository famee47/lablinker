require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Lab = require('../models/Lab')
const Test = require('../models/Test')
const Booking = require('../models/Booking')

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Keep admin, delete everything else
  const admins = await User.find({ role: 'admin' })
  const adminIds = admins.map(a => a._id.toString())
  console.log(`🛡️  Keeping ${admins.length} admin account(s)`)

  await User.deleteMany({ role: { $ne: 'admin' } })
  await Lab.deleteMany({})
  await Test.deleteMany({})
  await Booking.deleteMany({})
  console.log('🗑️  Cleared all users (except admin), labs, tests, bookings')

  // If no admin exists at all, create one
  if (admins.length === 0) {
    await User.create({ name: 'Admin', email: 'admin@lablinker.com', password: 'Admin1234', role: 'admin', phone: '03001234567' })
    console.log('🛡️  Created default admin: admin@lablinker.com / Admin1234')
  }

  // ── LAB OWNERS ──
  const owners = await User.insertMany([
    { name: 'Dr. Ahmed Khan',   email: 'citylab@demo.com',    password: 'Demo1234', role: 'lab', phone: '03011111111' },
    { name: 'Dr. Farah Naz',    email: 'medpoint@demo.com',   password: 'Demo1234', role: 'lab', phone: '03022222222' },
    { name: 'Dr. Bilal Yusuf',  email: 'healthplus@demo.com', password: 'Demo1234', role: 'lab', phone: '03033333333' },
    { name: 'Dr. Sara Malik',   email: 'labone@demo.com',     password: 'Demo1234', role: 'lab', phone: '03044444444' },
    { name: 'Dr. Usman Tariq',  email: 'diagnofast@demo.com', password: 'Demo1234', role: 'lab', phone: '03055555555' },
  ])

  // ── LABS ──
  const labsData = [
    {
      labName: 'CityLab Diagnostics',
      ownerName: 'Dr. Ahmed Khan',   ownerId: owners[0]._id,
      location: 'Gulberg III, Lahore', phone: '042-35761234',
      email: 'citylab@demo.com',
      address: 'Main Boulevard, Gulberg III, Lahore',
      approved: true, rating: 4.9, totalRatings: 120,
      homeCollectionFee: 150,
      description: 'ISO certified diagnostics center with 15+ years experience. Fastest turnaround times in Lahore.',
      operatingHours: '7:00 AM – 10:00 PM',
      servingAreas: ['Gulberg','DHA','Model Town','Johar Town','Garden Town'],
    },
    {
      labName: 'MedPoint Laboratory',
      ownerName: 'Dr. Farah Naz',    ownerId: owners[1]._id,
      location: 'DHA Phase 6, Karachi', phone: '021-35612345',
      email: 'medpoint@demo.com',
      address: 'Bukhari Commercial, DHA Phase 6, Karachi',
      approved: true, rating: 4.7, totalRatings: 89,
      homeCollectionFee: 200,
      description: 'State-of-the-art equipment. Digital reports delivered within hours.',
      operatingHours: '8:00 AM – 9:00 PM',
      servingAreas: ['DHA','Clifton','Bahadurabad','Gulshan'],
    },
    {
      labName: 'HealthPlus Labs',
      ownerName: 'Dr. Bilal Yusuf',  ownerId: owners[2]._id,
      location: 'F-10, Islamabad', phone: '051-2345678',
      email: 'healthplus@demo.com',
      address: 'F-10 Markaz, Islamabad',
      approved: true, rating: 4.8, totalRatings: 67,
      homeCollectionFee: 100,
      description: 'Serving Islamabad and Rawalpindi with top quality diagnostic services.',
      operatingHours: '7:30 AM – 9:00 PM',
      servingAreas: ['F-10','F-8','G-9','G-11','Bahria Town'],
    },
    {
      labName: 'LabOne Diagnostics',
      ownerName: 'Dr. Sara Malik',   ownerId: owners[3]._id,
      location: 'Saddar, Karachi', phone: '021-32451234',
      email: 'labone@demo.com',
      address: 'Saddar Main Road, Karachi',
      approved: true, rating: 4.6, totalRatings: 54,
      homeCollectionFee: 180,
      description: 'Affordable and accurate lab tests in the heart of Karachi.',
      operatingHours: '8:00 AM – 8:00 PM',
      servingAreas: ['Saddar','Lyari','PECHS','Gulshan-e-Iqbal'],
    },
    {
      labName: 'DiagnoFast',
      ownerName: 'Dr. Usman Tariq',  ownerId: owners[4]._id,
      location: 'Johar Town, Lahore', phone: '042-35891234',
      email: 'diagnofast@demo.com',
      address: 'Main Ferozepur Road, Johar Town, Lahore',
      approved: true, rating: 4.5, totalRatings: 43,
      homeCollectionFee: 120,
      description: 'Quick results, professional staff, affordable prices.',
      operatingHours: '8:00 AM – 11:00 PM',
      servingAreas: ['Johar Town','Township','Faisal Town','Iqbal Town'],
    },
  ]

  const labs = await Lab.insertMany(labsData)

  // Link lab owners
  for (let i = 0; i < owners.length; i++) {
    await User.findByIdAndUpdate(owners[i]._id, { labId: labs[i]._id })
  }

  // ── TECHNICIANS ──
  await User.insertMany([
    { name: 'Kamran Ali',    email: 'tech1@demo.com', password: 'Demo1234', role: 'technician', phone: '03101111111', labId: labs[0]._id },
    { name: 'Zara Hussain',  email: 'tech2@demo.com', password: 'Demo1234', role: 'technician', phone: '03102222222', labId: labs[1]._id },
    { name: 'Hamid Raza',    email: 'tech3@demo.com', password: 'Demo1234', role: 'technician', phone: '03103333333', labId: labs[2]._id },
  ])

  // ── TESTS — Lab 1: CityLab ──
  await Test.insertMany([
    { labId: labs[0]._id, testName: 'Complete Blood Count (CBC)',        description: 'Full blood analysis — RBC, WBC, platelets, haemoglobin.',        price: 450,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Haematology' },
    { labId: labs[0]._id, testName: 'Lipid Profile',                     description: 'Cholesterol, triglycerides, HDL, LDL levels.',                    price: 800,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Biochemistry' },
    { labId: labs[0]._id, testName: 'Thyroid Function Test (TFT)',        description: 'T3, T4 and TSH hormone levels.',                                  price: 1200, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '48 hours', reportTimeHours: 48,  category: 'Endocrinology' },
    { labId: labs[0]._id, testName: 'HbA1c (Glycated Haemoglobin)',      description: '3-month average blood sugar for diabetes monitoring.',            price: 600,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Diabetes' },
    { labId: labs[0]._id, testName: 'Liver Function Test (LFT)',          description: 'SGPT, SGOT, bilirubin and albumin evaluation.',                   price: 900,  homeCollectionAvailable: false, sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Biochemistry' },
    { labId: labs[0]._id, testName: 'Urine Complete Examination',         description: 'Physical, chemical and microscopic urine analysis.',              price: 250,  homeCollectionAvailable: true,  sampleType: 'Urine',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Pathology' },
    { labId: labs[0]._id, testName: 'Blood Sugar Fasting (BSF)',          description: 'Fasting glucose level for diabetes screening.',                   price: 200,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Diabetes' },
    { labId: labs[0]._id, testName: 'Kidney Function Test (KFT)',         description: 'Urea, creatinine and electrolytes.',                             price: 700,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Biochemistry' },
  ])

  // ── TESTS — Lab 2: MedPoint ──
  await Test.insertMany([
    { labId: labs[1]._id, testName: 'COVID-19 PCR Test',                 description: 'Accurate PCR detection for COVID-19.',                            price: 3500, homeCollectionAvailable: true,  sampleType: 'Nasal Swab', reportTime: '24 hours', reportTimeHours: 24,  category: 'Microbiology' },
    { labId: labs[1]._id, testName: 'Vitamin D3 (25-OH)',                description: 'Vitamin D deficiency assessment.',                                price: 1500, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Vitamins' },
    { labId: labs[1]._id, testName: 'Hepatitis B Surface Antigen',       description: 'Detects active Hepatitis B infection.',                           price: 500,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Serology' },
    { labId: labs[1]._id, testName: 'Iron Studies (Serum Ferritin)',     description: 'Evaluates iron stores and deficiency.',                           price: 850,  homeCollectionAvailable: false, sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Haematology' },
    { labId: labs[1]._id, testName: 'Vitamin B12',                       description: 'B12 deficiency screening.',                                       price: 1200, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Vitamins' },
    { labId: labs[1]._id, testName: 'C-Reactive Protein (CRP)',          description: 'Inflammation marker test.',                                       price: 600,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Immunology' },
  ])

  // ── TESTS — Lab 3: HealthPlus ──
  await Test.insertMany([
    { labId: labs[2]._id, testName: 'Dengue NS1 Antigen',               description: 'Early dengue fever detection.',                                   price: 1800, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Serology' },
    { labId: labs[2]._id, testName: 'Typhoid IgM/IgG (Widal)',          description: 'Detects typhoid fever antibodies.',                               price: 400,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Microbiology' },
    { labId: labs[2]._id, testName: 'Stool Routine Examination',         description: 'Detects parasites, infections in digestive system.',             price: 300,  homeCollectionAvailable: true,  sampleType: 'Stool',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Pathology' },
    { labId: labs[2]._id, testName: 'Blood Group & Rh Factor',          description: 'ABO blood group and Rh factor typing.',                          price: 150,  homeCollectionAvailable: false, sampleType: 'Blood',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Haematology' },
    { labId: labs[2]._id, testName: 'ESR (Erythrocyte Sedimentation)',  description: 'Inflammation screening test.',                                    price: 200,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Haematology' },
    { labId: labs[2]._id, testName: 'Uric Acid',                        description: 'Detects gout and kidney stone risk.',                             price: 350,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Biochemistry' },
  ])

  // ── TESTS — Lab 4: LabOne ──
  await Test.insertMany([
    { labId: labs[3]._id, testName: 'Hepatitis C Antibody (Anti-HCV)', description: 'Detects Hepatitis C virus antibodies.',                           price: 700,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Serology' },
    { labId: labs[3]._id, testName: 'Malaria Parasite (MP) Test',      description: 'Detects malaria parasite in blood.',                              price: 350,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Microbiology' },
    { labId: labs[3]._id, testName: 'Pregnancy Test (Beta HCG)',       description: 'Quantitative pregnancy hormone test.',                            price: 800,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Endocrinology' },
    { labId: labs[3]._id, testName: 'Blood Pressure Monitoring',       description: '24-hour ambulatory blood pressure monitoring.',                  price: 1500, homeCollectionAvailable: false, sampleType: 'Other',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Cardiology' },
    { labId: labs[3]._id, testName: 'Calcium (Serum)',                 description: 'Evaluates calcium levels in blood.',                             price: 400,  homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '12 hours', reportTimeHours: 12,  category: 'Biochemistry' },
  ])

  // ── TESTS — Lab 5: DiagnoFast ──
  await Test.insertMany([
    { labId: labs[4]._id, testName: 'Testosterone (Total)',             description: 'Male hormone level assessment.',                                  price: 1400, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '48 hours', reportTimeHours: 48,  category: 'Endocrinology' },
    { labId: labs[4]._id, testName: 'FSH & LH',                        description: 'Fertility hormones for male and female.',                         price: 1600, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '48 hours', reportTimeHours: 48,  category: 'Endocrinology' },
    { labId: labs[4]._id, testName: 'Semen Analysis',                  description: 'Complete semen analysis for fertility assessment.',               price: 1200, homeCollectionAvailable: false, sampleType: 'Other',      reportTime: '24 hours', reportTimeHours: 24,  category: 'Pathology' },
    { labId: labs[4]._id, testName: 'Throat Swab Culture',             description: 'Detects bacterial infections in throat.',                         price: 900,  homeCollectionAvailable: true,  sampleType: 'Throat Swab',reportTime: '3 days',   reportTimeHours: 72,  category: 'Microbiology' },
    { labId: labs[4]._id, testName: 'Allergy Panel (20 allergens)',    description: 'Comprehensive allergy screening for common allergens.',           price: 3500, homeCollectionAvailable: true,  sampleType: 'Blood',      reportTime: '5 days',   reportTimeHours: 120, category: 'Immunology' },
    { labId: labs[4]._id, testName: 'ECG (Electrocardiogram)',         description: 'Heart rhythm and electrical activity recording.',                 price: 500,  homeCollectionAvailable: false, sampleType: 'Other',      reportTime: '6 hours',  reportTimeHours: 6,   category: 'Cardiology' },
  ])

  console.log('\n✅ SEED COMPLETE!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  DEMO ACCOUNTS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Lab 1 - CityLab:    citylab@demo.com   / Demo1234')
  console.log('  Lab 2 - MedPoint:   medpoint@demo.com  / Demo1234')
  console.log('  Lab 3 - HealthPlus: healthplus@demo.com/ Demo1234')
  console.log('  Lab 4 - LabOne:     labone@demo.com    / Demo1234')
  console.log('  Lab 5 - DiagnoFast: diagnofast@demo.com/ Demo1234')
  console.log('  Tech 1:             tech1@demo.com     / Demo1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  5 Labs | 31 Tests | 3 Technicians')
  console.log('  Your admin account is untouched.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1) })
