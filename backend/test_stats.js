require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./models/Session');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const stats = await Session.aggregate([
    { $match: { patientId: 'patient_123' } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$createdAt', unit: 'day' } },
        avgFormAccuracyScore: { $avg: '$formAccuracyScore' },
        avgMaxFlexionAngle: { $avg: '$maxFlexionAngle' },
        totalReps: { $sum: '$totalReps' },
        sessionCount: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}).catch(console.error);
