const express = require('express');
const multer = require("multer");
const fs = require("fs");
const pdfParse = require('pdf-parse');

const pdfjs = require('pdfjs-dist');
const AirportCode = require('../models/AirportCode');
const Schedule = require('../models/Schedule');

const router = express.Router();
const {
  createUser,
  userSignIn,
  uploadProfile,
  saveSwitch,
  savePhoto,
  delPhoto,
  setProfilePicture,
  saveSchedule,
  delSchedule,
  getTraveler,
  addFriend,
  delFriend,
  signOut,
} = require('../controllers/UserController');
const { isAuth } = require('../middlewares/auth');
const {
  validateUserSignUp,
  userVlidation,
  validateUserSignIn,
} = require('../middlewares/validation/user');

const strToDate = strdate => {
  let dateTimeString = strdate;

  const [dateString, timeString] = dateTimeString.split(' ');
  const [day, month, year] = dateString.split('/');
  const [hour, minute, second] = timeString.split(':');

  const dateObj = new Date(+year, +month - 1, +day, +hour, +minute, +second);
  return dateObj;
};

async function parsePDF(pdfPath, user_id) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjs.getDocument(data).promise;

  let textContent = '';
  let pageTextArr = [];
  let pdf_status = true;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    if (pageNumber == 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTextArr = content.items.map(item => item.str);
    }
  };
  if (pageTextArr.length < 10) {
    pdf_status = false;
    return;
  }
  //get date (year and month)
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let yearAndMonth_item = pageTextArr[pageTextArr.length - 1];
  const yearAndMonth_item_array = yearAndMonth_item.split(" ");
  let year = yearAndMonth_item_array[yearAndMonth_item_array.length - 1];
  const month_str = yearAndMonth_item_array[yearAndMonth_item_array.length - 2];
  let month = months.indexOf(month_str) + 1;
  //get schedule list
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const schedule_list_arr = [];
  for (var i = 0; i < pageTextArr.length - 5; i++) {
    let item = pageTextArr[i];
    if (item.length > 10) {
      if (item[item.length - 1] == "]" && item[item.length - 9] == "[" && item[item.length - 5] == "-") {
        if (pageTextArr[i + 1].length == 11) {
          if (pageTextArr[i + 1][2] == ":") {
            if (pageTextArr[i + 4].length == 6) {
              if (pageTextArr[i + 4][2] == "-") {
                const days_arr = pageTextArr[i + 4].split("-");
                if (days.indexOf(days_arr[1]) > -1) {
                  const pos_arr = pageTextArr[i].split(" ");
                  const time_arr = pageTextArr[i + 1].split("-");
                  const schedule_item_arr = [];
                  schedule_item_arr[0] = pos_arr[1].substr(1, 3);
                  schedule_item_arr[1] = pos_arr[1].substr(5, 3);
                  schedule_item_arr[2] = time_arr[0];
                  schedule_item_arr[3] = time_arr[1];
                  schedule_item_arr[4] = days_arr[0];
                  schedule_list_arr.push(schedule_item_arr);
                }
              }
            }
          }
        }
      }
    }
  };

  if (schedule_list_arr.length < 1) {
    return;
  }
  //make schedule data
  const airportCode = await AirportCode.find({});
  const airportCodeObj = {};
  airportCode.map(item => { airportCodeObj[item.code] = item.location });

  let _month = String(month).padStart(2, '0');
  for (var i = 0; i < schedule_list_arr.length - 1; i++) {
    if (i % 2 == 0) {
      let location_code = schedule_list_arr[i][1];
      let location = airportCodeObj[location_code];
      let day = schedule_list_arr[i][4];
      let strTime = schedule_list_arr[i][3] + ':00';
      let from_str = `${day}/${_month}/${year}` + ' ' + strTime;
      let from = strToDate(from_str);

      let day_to = schedule_list_arr[i + 1][4];
      let strTime_to = schedule_list_arr[i + 1][2] + ':00';
      let to_str = `${day_to}/${_month}/${year}` + ' ' + strTime_to;
      if (day_to - day < 0) {
        to_str = `${day_to}/${String(month + 1).padStart(2, '0')}/${year}` + ' ' + strTime_to;
      }
      let to = strToDate(to_str);

      const schedule_row = await Schedule({
        user: user_id,
        location: location,
        from: from,
        to: to,
      });
      await schedule_row.save();

      // console.log(location_code, location, from, to);
    }
  }
}

const getPDF = async (file) => {
  let readFileSync = fs.readFileSync(file)
  try {
    let pdfExtract = await pdfParse(readFileSync)
    console.log('File content: ', pdfExtract.text)
    // console.log('Total pages: ', pdfExtract.numpages)
    // console.log('All content: ', pdfExtract.info)
  } catch (error) {
    throw new Error(error)
  }
}
var upload = multer({ dest: 'uploads/' });
router.post("/upload-pdf", isAuth, upload.single('file'), async (req, res, next) => {
  // const file = req.body[0]['_parts'][0][1];
  // console.log(req.file);
  if (!req.file) {
    // const error = new Error("Please upload a file");
    // error.httpStatusCode = 400;
    // return next(error);
    res.json({ success: false, message: 'Upload Pdf failed!' });
  }
  const pdfRead = req.file.path;
  // getPDF(pdfRead);

  parsePDF(pdfRead, req.user._id)
    .then(async () => {
      const schedule = await Schedule.find({ user: req.user._id }).sort({ from: 1 });
      // const schedule = await Schedule.find({ user:req.user._id, to: { $gte: new Date() }}).sort({from: 1 });
      res.json({ success: true, schedule: schedule, message: 'Upload Schedule successfully!' });
    })
    .catch(error => {
      console.error(error);
    });
});

router.post('/create-user', validateUserSignUp, userVlidation, createUser);
router.post('/sign-in', validateUserSignIn, userVlidation, userSignIn);
router.post('/sign-out', isAuth, signOut);
router.post('/save-profile', isAuth, uploadProfile);
router.post('/save-switch', isAuth, saveSwitch);
router.post('/save-photo', isAuth, savePhoto);
router.post('/del-photo', isAuth, delPhoto);
router.post('/set-profile-picture', isAuth, setProfilePicture);
router.post('/save-schedule', isAuth, saveSchedule);
router.post('/del-schedule', isAuth, delSchedule);
router.post('/get-Traveler', isAuth, getTraveler);
router.post('/add-friend', isAuth, addFriend);
router.post('/del-friend', isAuth, delFriend);

module.exports = router;
