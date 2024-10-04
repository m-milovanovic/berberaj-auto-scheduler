# Berberaj Appointment Scheduler

This is a Selenium script used to automatically schedule a haircut at [berberaj.rs](https://www.berberaj.rs/).

## Requirements

- Latest Chrome browser
- Node.js

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/m-milovanovic/berberaj-auto-scheduler/
    cd berberaj-auto-scheduler
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Configuration

1. Open `config.json` and fill out the following fields:
    ```json
    {
      "user": {
        "email": "your-email@example.com",
        "name": "Your Name",
        "phone": "Your Phone Number"
      },
      "barberName": "Your Preffered Barber's Name",
      "timeSlots": ["09:00", "10:00", "11:00"], // Add your preferred timeslots
      "maxMinutesToWait": 60, // Customize the timeout period
      "berberajLocation": "your-location" // Set barbershop location, it can be either "center" or "spens"
    }
    ```

## Usage

You should perform these steps before the barbershop opens (currently at 9 AM):

1. Ensure you have the latest version of the Chrome driver:
    ```sh
    npm install
    ```

2. Ensure you have configured everything properly in `config.json`

3. Run the script:
    ```sh
    npm start
    ```

## Note

You can also run this script in the middle of the day if some of your preferred timeslots suddenly become available. The script will timeout after the specified `maxMinutesToWait` if no preferred timeslots become available within that period. You can customize this timeout by changing the `maxMinutesToWait` value in `config.json`.
