import express from 'express';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
import { addMentor, addStudent, getNextSequenceValue, initializeCounters, getAllMentors, getStudentWithOutMentor, assignMentor, getStudentByIds, getMentorById, getPrevisousMentorByStudentId, changementor, getallStudentsByMentorId } from './helper.js';
dotenv.config()

const Mongo_url = process.env.MONGO_URL // this for access mongo atlas


async function createConnection() {
    const client = new MongoClient(Mongo_url);
    await client.connect()
    console.log("Mongodb is connected")
    return client
}

export const client = await createConnection()
initializeCounters().catch(console.error);

const app = express();
const Port = process.env.Port;

// Inbuilt Middleware
app.use(express.json()); // say data is json or converting body to json data

app.get('/', function (req, res) {
    res.send("Home Page");
})

//1. to create Mentor
app.post('/CreateMentor', async function (req, res) {
    const mentorId = await getNextSequenceValue('mentorid');
    const newMentor = { _id: mentorId, MentorName: req.body.MentorName };
    // console.log(newMentor)
    const result = await addMentor(newMentor);
    res.send(result);

})

//2. to create Student
app.post('/CreateStudent', async function (req, res) {
    const studentId = await getNextSequenceValue('studentid');
    const newStudent = { _id: studentId, StudentName: req.body.StudentName, Mentor: null, PreviousMentor: null };
    // console.log(newStudent)
    const result = await addStudent(newStudent);
    res.send(result);

})

//get All mentor
app.get('/Mentorlist', async function (req, res) {
    const mentorslist = await getAllMentors();
    if (mentorslist.length > 0) {
        res.send(mentorslist);
    }
    else {
        res.send("Mentor Not Found...");
    }
})

//get student without a mentor
app.get('/Studentlist', async function (req, res) {
    const Studentlist = await getStudentWithOutMentor();
    if (Studentlist.length > 0) {
        res.send(Studentlist);
    }
    else {
        res.send("Student Not Found...");
    }
})

//assign Mentor to Students
app.post('/assignMentor/:mentorId', async function (req, res) {
    try {
        const mentorId = +req.params.mentorId;
        const studentIds = req.body.Student_ids;
        const mentor = await getMentorById(mentorId);
        if (!mentor) return res.status(404).send('Mentor not found');
        const MentorName = mentor.MentorName
        const studentList = await getStudentByIds(studentIds);
        if (studentList.length !== studentIds.length) {
            return res.status(400).send('One or more students already have a mentor');
        }

       const result= await assignMentor(studentIds, mentorId, MentorName);
        res.json(
            {
                success: true,
                message: result,
            });

    } catch (error) {
        res.json(
            {
                success: false,
                error:error.message,
                message: "Mentor assigning Failed...",
            })
    }
})

app.put('/changementor/:StudentId', async function (req, res) {
    try {
        const mentorId = +req.body.mentorId;
        const StudentId = +req.params.StudentId;
        const mentor = await getMentorById(mentorId);
        if (!mentor) return res.status(404).send('Mentor not found');
        const Mentor_Name = mentor.MentorName
        const StudentDetail = await getPrevisousMentorByStudentId(StudentId);
        const PreviousMentor = StudentDetail.PreviousMentor;
        const result = await changementor(PreviousMentor, mentorId, Mentor_Name, StudentId);
        res.json(
            {
                success: true,
                message: result,
            });

    } catch (error) {
        res.json(
            {
                success: false,
                error:error.message,
                message: "Mentor assigning Failed...",
            })
    }
})

//get All mentor
app.get('/AllStudentByMentor/:mentorId', async function (req, res) {
    const mentorId=+req.params.mentorId;
    const mentorstudentlist = await getallStudentsByMentorId(mentorId);
   // console.log(mentorstudentlist)
    if (mentorstudentlist.length > 0) {
        res.send(mentorstudentlist);
    }
    else {
        res.send("Mentor with Student List Not Found...");
    }
})

//Previously assigned mentor
app.get('/PrevisousMentor/:studentId', async function (req, res) {
    const studentId=+req.params.studentId;
    const mentordetails = await getPrevisousMentorByStudentId(studentId);
    console.log(mentordetails)
    //if (!mentordetails) {
        res.send(mentordetails);
    /*}
    else {
        res.send("Mentor Details Not Found...");
    }*/
})

app.listen(Port, () => console.log(`Server Started`))

