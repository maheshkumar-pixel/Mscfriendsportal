const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const friends = require('./models/friendmodel');
const teachers= require('./models/teachermodel');
const acheivers= require('./models/acheivermodel');

const app = express();
app.use(cors());
app.use(express.json()); // 👈 Add this to parse JSON bodies (including DELETE)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, "../frontend")));

const uploadDir = path.join(__dirname, "/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// DB connection
mongoose.connect("mongodb+srv://maheshmurali2024:DDyAsPMle6KhGUKh@cluster0.nvfqsro.mongodb.net/friendportal?retryWrites=true&w=majority&appName=Mscfriendsportal", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected successfully!");
}).catch(err => {
    console.log("Failed to connect to MongoDB:", err);
});

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get('/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/teachers.html"));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/profile.html"));
});

app.get('/bio', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Bio.html"));
});

// ✅ Correct POST route with proper file handling
app.post("/api/friends", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'videofile', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, firstfriend, inspiration, opinion,batch } = req.body;

        const friendData = {
            name,
            Firstfriend: firstfriend,
            inspiration,
            opinion,
            batch
        };

        if (req.files['image']) {
            friendData.image_url = req.files['image'][0].filename;

            friendData.imageOriginalname = req.files['image'][0].originalname;
        }

        if (req.files['videofile']) {
            friendData.videofile = req.files['videofile'][0].filename;
        }

        const newFriend = new friends(friendData);
        await newFriend.save();

        res.status(200).json({ message: "Data saved successfully!" });
    } catch (err) {
        console.error("Error in storing data:", err);
        res.status(500).json({ error: "Failed to save data" });
    }
});
app.delete('/api/friends/:id', async (req, res) => {
  try {
    const friendId = req.params.id;
    const { image_url, videofile } = req.body;

    // Delete friend from DB
    const deleted = await friends.findByIdAndDelete(friendId);
    if (!deleted) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    // Delete image if exists
    if (image_url) {
      const imagePath = path.join(__dirname, 'uploads', image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete video if exists
    if (videofile) {
      const videoPath = path.join(__dirname, 'uploads', videofile);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    res.status(200).json({ message: 'Friend deleted successfully' });
  } catch (err) {
    console.error("Error deleting friend:", err);
    res.status(500).json({ error: 'Failed to delete friend' });
  }
});

app.post("/api/teachers", upload.single('image'), async (req, res) => {
    try {
        const { name,designation,educationalinfo,joindate } = req.body;

        const teacherData = {
            name,
            designation,
            educationalinfo,
            joindate
        };

        if (req.file) {
            teacherData.image_url = req.file.filename;

            teacherData.imageOriginalname = req.file.originalname;
        }

        

        const newTeacher = new teachers(teacherData);
        await newTeacher.save();

        res.status(200).json({ message: "Data saved successfully!" });
    } catch (err) {
        console.error("Error in storing data:", err);
        res.status(500).json({ error: "Failed to save data" });
    }
});
app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { image_url } = req.body;

    // Delete from MongoDB
    const deleted = await teachers.findByIdAndDelete(teacherId);

    if (!deleted) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Remove image file if exists
    if (image_url) {
      const imagePath = path.join(__dirname, 'uploads', image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error("Error deleting teacher:", err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

app.post("/api/acheivement", upload.single('image'), async (req, res) => {
    try {
        const { name,achievement,year,batch } = req.body;

        const acheiverData = {
            name,
            achievement,
            year,
            batch
        };

        if (req.file) {
            acheiverData.image_url = req.file.filename;

            acheiverData.imageOriginalname = req.file.originalname;
        }

        

        const newAcheiver = new acheivers(acheiverData);
        await newAcheiver.save();

        res.status(200).json({ message: "Data saved successfully!" });
    } catch (err) {
        console.error("Error in storing data:", err);
        res.status(500).json({ error: "Failed to save data" });
    }
});
app.get('/api/acheivement', async (req, res) => {
  try {
    const allAcheivers = await acheivers.find();

    // Map image URLs to serve them correctly
    const response = allAcheivers.map(item => ({
      ...item._doc,
      imageUrl: item.image_url ? `/uploads/${item.image_url}` : null
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching achievers:", err);
    res.status(500).json({ error: "Failed to fetch achievers data" });
  }
});


// GET API to fetch all friends data
app.get('/api/friends', async (req, res) => {
    try {
        const allFriends = await friends.find();
        res.status(200).json(allFriends);
    } catch (err) {
        console.error("Error fetching friends:", err);
        res.status(500).json({ error: "Failed to fetch friends data" });
    }
});
app.get('/api/teachers', async (req, res) => {
    try {
        const allTeachers = await teachers.find();
        res.status(200).json(allTeachers);
    } catch (err) {
        console.error("Error fetching teachers:", err);
        res.status(500).json({ error: "Failed to fetch friends data" });
    }
});
app.get('/photos', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/photos.html"));
});
app.get('/teachersupdate', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/teachersupdate.html"));
});
app.get('/acheivers', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/acheivers.html"));
});
app.get('/greatones', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/greatones.html"));
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

