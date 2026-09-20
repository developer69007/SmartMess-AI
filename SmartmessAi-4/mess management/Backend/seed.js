// seed.js — Seeds Supabase PostgreSQL with initial records
// Run with: node seed.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabaseClient');

const Student = require('./models/Student');
const Admin = require('./models/Admin');
const Staff = require('./models/Staff');
const MessMenu = require('./models/MessMenu');
const Attendance = require('./models/Attendance');
const Feedback = require('./models/Feedback');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');
const KitchenStatus = require('./models/KitchenStatus');
const FoodWaste = require('./models/FoodWaste');

const seed = async () => {
  console.log('🌱 Starting Supabase Seeding...');

  // 1. Admin
  const adminEmail = 'admin@smartmess.ai';
  let adminPassword = await bcrypt.hash('Admin@123', 10);
  let { data: admin } = await supabase
    .from(Admin.TABLE_NAME)
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle();

  if (!admin) {
    const { data, error } = await supabase
      .from(Admin.TABLE_NAME)
      .insert({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        phone: '9876543210',
        role: 'admin',
        is_active: true,
      })
      .select('*')
      .single();
    if (error) console.error('Error creating admin:', error.message);
    else {
      admin = data;
      console.log('✅ Admin created: admin@smartmess.ai / Admin@123');
    }
  } else {
    console.log('ℹ️  Admin already exists: admin@smartmess.ai');
  }

  // 2. Staff
  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const staffData = [
    {
      name: 'Ravi Kumar',
      email: 'staff@smartmess.ai',
      password: staffPassword,
      employee_id: 'EMP001',
      department: 'kitchen',
      shift: 'morning',
      phone: '9876543211',
      role: 'staff',
    },
    {
      name: 'Priya Singh',
      email: 'priya@smartmess.ai',
      password: staffPassword,
      employee_id: 'EMP002',
      department: 'reception',
      shift: 'afternoon',
      phone: '9876543212',
      role: 'staff',
    },
  ];

  let staff1 = null;
  let staff2 = null;

  for (const s of staffData) {
    const { data: existing } = await supabase
      .from(Staff.TABLE_NAME)
      .select('*')
      .eq('email', s.email)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from(Staff.TABLE_NAME)
        .insert(s)
        .select('*')
        .single();
      if (error) console.error('Error creating staff:', error.message);
      else {
        if (!staff1) staff1 = data;
        else staff2 = data;
        console.log(`✅ Staff created: ${s.email} / Staff@123`);
      }
    } else {
      if (!staff1) staff1 = existing;
      else staff2 = existing;
      console.log(`ℹ️  Staff already exists: ${s.email}`);
    }
  }

  // 3. Students
  const studentPassword = await bcrypt.hash('password123', 10);
  const sampleStudents = [
    { name: 'Yashashvi Saxena', email: 'yashashvi@smartmess.ai', password: studentPassword, role: 'student' },
    { name: 'Ananya Sharma', email: 'ananya@smartmess.ai', password: studentPassword, role: 'student' },
    { name: 'Rohit Verma', email: 'rohit@smartmess.ai', password: studentPassword, role: 'student' },
    { name: 'Meera Iyer', email: 'meera@smartmess.ai', password: studentPassword, role: 'student' },
  ];

  const createdStudents = [];
  for (const st of sampleStudents) {
    const { data: existing } = await supabase
      .from(Student.TABLE_NAME)
      .select('*')
      .eq('email', st.email)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from(Student.TABLE_NAME)
        .insert(st)
        .select('*')
        .single();
      if (error) console.error('Error creating student:', error.message);
      else {
        createdStudents.push(data);
        console.log(`✅ Student created: ${st.email} / password123`);
      }
    } else {
      createdStudents.push(existing);
      console.log(`ℹ️  Student already exists: ${st.email}`);
    }
  }

  // 4. Menu
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: existingMenu } = await supabase
    .from(MessMenu.TABLE_NAME)
    .select('id')
    .gte('date', today.toISOString())
    .lte('date', todayEnd.toISOString())
    .maybeSingle();

  if (!existingMenu) {
    const { error } = await supabase.from(MessMenu.TABLE_NAME).insert({
      date: today.toISOString(),
      day: days[today.getDay()],
      meals: {
        breakfast: {
          items: ['Idli', 'Sambar', 'Coconut Chutney', 'Tea/Coffee'],
          time: '7:30 AM – 9:00 AM',
          isAvailable: true,
        },
        lunch: {
          items: ['Rice', 'Dal Tadka', 'Aloo Sabzi', 'Roti', 'Salad', 'Buttermilk'],
          time: '12:30 PM – 2:00 PM',
          isAvailable: true,
        },
        dinner: {
          items: ['Chapati', 'Paneer Butter Masala', 'Jeera Rice', 'Papad', 'Sweet'],
          time: '7:30 PM – 9:00 PM',
          isAvailable: true,
        },
      },
      special_note: 'Special dessert — Gulab Jamun tonight!',
      created_by: admin ? admin.id : null,
    });
    if (error) console.error('Error creating menu:', error.message);
    else console.log("✅ Today's menu created");
  } else {
    console.log("ℹ️  Today's menu already exists");
  }

  // 5. Kitchen Status
  const { data: existingStatus } = await supabase
    .from(KitchenStatus.TABLE_NAME)
    .select('id')
    .gte('date', today.toISOString())
    .lte('date', todayEnd.toISOString())
    .maybeSingle();

  if (!existingStatus) {
    const { error } = await supabase.from(KitchenStatus.TABLE_NAME).insert({
      date: today.toISOString(),
      temperature: '24°C',
      cooking_status: 'In Progress',
      preparing_meal: 'Lunch',
      cleaning_status: 'Completed',
      gas_status: 'Normal',
      water_status: 'Available',
      notes: 'All systems operational',
      updated_by: staff1 ? staff1.id : null,
    });
    if (error) console.error('Error creating kitchen status:', error.message);
    else console.log('✅ Kitchen status created');
  } else {
    console.log('ℹ️  Kitchen status already exists');
  }

  // 6. Sample Notifications
  const { data: existingNotif } = await supabase
    .from(Notification.TABLE_NAME)
    .select('id')
    .limit(1);

  if (!existingNotif || existingNotif.length === 0) {
    await supabase.from(Notification.TABLE_NAME).insert([
      {
        title: 'Mess Timings Updated',
        message: 'Sunday lunch timing will be 1:00 PM - 2:30 PM. Breakfast and dinner timings remain unchanged.',
        type: 'info',
        target_role: 'all',
        created_by: admin ? admin.id : null,
      },
      {
        title: 'AI Optimization Activated',
        message: 'SmartMess AI has activated waste reduction algorithms. Please scan your QR code on entry.',
        type: 'success',
        target_role: 'student',
        created_by: admin ? admin.id : null,
      },
    ]);
    console.log('✅ Sample notifications created');
  }

  // 7. Sample Food Waste
  const { data: existingWaste } = await supabase
    .from(FoodWaste.TABLE_NAME)
    .select('id')
    .gte('date', today.toISOString())
    .lte('date', todayEnd.toISOString())
    .maybeSingle();

  if (!existingWaste) {
    await supabase.from(FoodWaste.TABLE_NAME).insert({
      date: today.toISOString(),
      meal_type: 'breakfast',
      total_prepared_kg: 120,
      waste_kg: 6,
      waste_percentage: 5,
      cost_saved_inr: 450,
      recorded_by: staff1 ? staff1.id : null,
    });
    console.log('✅ Sample food waste record created');
  }

  console.log('\n🎉 Supabase Seeding Complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin Login:    admin@smartmess.ai   / Admin@123');
  console.log('Staff Login:    staff@smartmess.ai   / Staff@123');
  console.log('Student Login:  yashashvi@smartmess.ai / password123');
  console.log('─────────────────────────────────────');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
