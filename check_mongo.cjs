const mongoose = require('mongoose');
const uri = 'mongodb://atharvaj7822_db_user:flexipass123@ac-4f1ln0o-shard-00-00.yfjpzqy.mongodb.net:27017,ac-4f1ln0o-shard-00-01.yfjpzqy.mongodb.net:27017,ac-4f1ln0o-shard-00-02.yfjpzqy.mongodb.net:27017/?ssl=true&replicaSet=atlas-etwdpr-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const patients = db.collection('patients');
  
  // Delete users that don't look like the main user
  const result = await patients.deleteMany({ name: { $in: ['test123', 'Test Therapist'] } });
  console.log(`Deleted ${result.deletedCount} old test users.`);
  
  const docs = await patients.find({}).toArray();
  console.log(`Remaining ${docs.length} patients:`);
  docs.forEach(doc => console.log(`- ${doc.name} [role: ${doc.role}]`));
  await mongoose.disconnect();
}
run().catch(console.dir);
