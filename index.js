import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function convertTo12HourFormat(time) {
    const [hour, minute] = time.split(':');
    const period = +hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = +hour % 12 || 12;
    return `${adjustedHour}:${minute} ${period}`;
}

app.get('/', (req, res) => {
    res.render('index', { prayerTimes: null, error: null });
});

app.post('/getPrayerTimes', async (req, res) => {
    const address = req.body.address;
    const url = `http://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url);
        let prayerTimes = response.data.data.timings;
        
        // Convert prayer times to 12-hour format
        prayerTimes = Object.fromEntries(
            Object.entries(prayerTimes).map(([time, value]) => [time, convertTo12HourFormat(value)])
        );

        res.render('index', { prayerTimes, error: null });
    } catch (error) {
        res.render('index', { prayerTimes: null, error: 'Could not fetch prayer times. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
