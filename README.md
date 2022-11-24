This is a selenium script used to automatically schedule a haircut at [berberaj.rs](https://www.berberaj.rs/).

### Requirements
- Latest Chrome browser

### Installation:

```console
npm install
```

### Usage:
You should do these steps before the barbershop opens (currently at 9AM):
- Run `npm install` to get the newest version of the Chrome driver
- Fill out `barberId`, `email`, `name` and `phone` values inside `index.js`
- Fill out the timeslots in the order of preference inside `index.js`
- Run `npm start`

### Note
You can also run this in the middle of the day, in case some of your preferred timeslots suddenly become available. The script timeouts after 60 minutes if no preferred timeslots become available in that time period. You can customize this timeout by changing the `MAX_MINUTES_TO_WAIT` value.