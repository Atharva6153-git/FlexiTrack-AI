const mongoose = require('mongoose');
const uri = 'mongodb://atharvaj7822_db_user:flexipass123@ac-4f1ln0o-shard-00-00.yfjpzqy.mongodb.net:27017,ac-4f1ln0o-shard-00-01.yfjpzqy.mongodb.net:27017,ac-4f1ln0o-shard-00-02.yfjpzqy.mongodb.net:27017/?ssl=true&replicaSet=atlas-etwdpr-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const patients = db.collection('patients');
  const docs = await patients.find({}).toArray();
  console.log(`Found ${docs.length} patients:`);
  docs.forEach(doc => console.log(`- ${doc.name} (${doc.email || 'no email'}) [role: ${doc.role}] [id: ${doc._id}]`));
  await mongoose.disconnect();
}
run().catch(console.dir);
