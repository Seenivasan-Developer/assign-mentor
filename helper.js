import { client } from './index.js';

export const initializeCounters = async () => {
  try {
    const db = client.db('assign-mentor');
    const counters = db.collection('counters');

    // Insert initial counter documents if they don't already exist
    await counters.updateOne(
      { _id: 'studentid' },
      { $setOnInsert: { sequence_value: 1 } },
      { upsert: true }
    );

    await counters.updateOne(
      { _id: 'mentorid' },
      { $setOnInsert: { sequence_value: 1 } },
      { upsert: true }
    );

    console.log('Counters initialized');
  } finally {
    //await client.close();
  }
};


export const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await client.db('assign-mentor').collection('counters').findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
};


export async function addStudent(newStudent) {
  return await client.db("assign-mentor").collection("student").insertOne(newStudent);
}
export async function addMentor(newMentor) {
  return await client.db("assign-mentor").collection("mentor").insertOne(newMentor);
}
export async function getAllMentors() {
  return await client.db("assign-mentor").collection("mentor").find().toArray();
}
export async function getStudentWithOutMentor() {
  return await client.db("assign-mentor").collection("student").find({ Mentor: null }, { projection: { StudentName : 1, Mentor: 1 }}).toArray();
}

export async function assignMentor(studentIds, mentorId, MentorName) {
 return await client.db("assign-mentor").collection("student").updateMany(
      { _id: { $in: studentIds } },
      { $set: { Mentor: mentorId, MentorName: MentorName } }
  );
}

export async function getStudentByIds(studentIds) {
  return await client.db("assign-mentor").collection("student").find({ _id: { $in: studentIds }, mentor: null }).toArray();
}

export async function getPrevisousMentorByStudentId(studentId) {
  return await client.db("assign-mentor").collection("student").findOne({ _id: studentId });
}
export async function getMentorById(mentorId) {
  return await client.db("assign-mentor").collection("mentor").findOne({ _id: mentorId });
}
export async function changementor(PreviousMentor, mentorId, Mentor_Name, StudentId) {
  return await client.db("b53we-node").collection("products").updateOne(
      { _id: StudentId },
      { $set: { PreviousMentor: PreviousMentor, Mentor: mentorId, MentorName: Mentor_Name } });
}
export async function getallStudentsByMentorId(MentorId) {
  return await client.db("assign-mentor").collection("student").find({ Mentor: MentorId },{projection : {StudentName: 1, MentorName: 1, Mentor: 1}}).toArray();
}

