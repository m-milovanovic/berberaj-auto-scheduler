const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

const schedule = require('node-schedule');
const config = require('./config.json');

const barber = {
    name: config.barberName,
    id: '13', // fallback if name is not found
};

const user = {
    email: config.user.email,
    name: config.user.name,
    phone: config.user.phone,
};

const timeslots = config.timeSlots;

const MAX_MINUTES_TO_WAIT = config.maxMinutesToWait;

const LOCATION = config.berberajLocation;

const BARBERSHOP_URL = `https://berberaj.rs/${LOCATION}`;

let employees = {};

const errorMessages = {
    NoSuchElementError: 'Timeslot is not found or not available!',
    StaleElementReferenceError: 'Element is not attached to the page document',
    ElementClickInterceptedError: 'Element is not clickable at point',
    ElementNotInteractableError: 'Element is not interactable',
    TimeoutError: 'Element is not found',
};

const getEmployees = async (driver) => {
    let employees = {};

    try {
        const employeeBoxes = await driver.findElements(
            By.className('employee-box')
        );
        for (const box of employeeBoxes) {
            const employeeNameElement = await box.findElement(
                By.css('.employee_description_name')
            );
            const employeeName = await employeeNameElement.getText();
            const employeeId = await box.getAttribute('data-employee-id-no');
            employees[employeeName] = employeeId;
            return employees;
        }
    } catch (error) {
        console.error('Unable to find employee names');
    }
};

const getBarber = async (driver, id) => {
    return await driver.findElement(By.css(`div[data-employee-id-no="${id}"]`));
};

/**
 * Automates the process of booking appointments on the Berberaj website.
 * @param {import('selenium-webdriver').WebDriver} driver - The Selenium WebDriver instance.
 */
const bookAppointment = async (driver) => {
    await driver.navigate().refresh();
    // Time out after an hour
    setTimeout(async () => {
        console.log('Nije se pojavio nijedan termin');
        await driver.quit();
        process.exit();
    }, MAX_MINUTES_TO_WAIT * 60000);

    let timeslot = null;
    let el;

    while (true) {
        el = await getBarber(
            driver,
            employees.hasOwnProperty(barber.name)
                ? employees[barber.name]
                : barber.id
        );

        for (let i = 0; i < timeslots.length; i++) {
            try {
                console.log(`Checking ${timeslots[i]}`);
                await el
                    .findElement(
                        By.xpath(`.//*[text()[contains(.,'${timeslots[i]}')]]`)
                    )
                    .click();
                timeslot = timeslots[i];
                console.log('It is available, booking...');
                await clearAndEnter(
                    await driver.findElement(By.id('email')),
                    user.email
                );
                await clearAndEnter(
                    await driver.findElement(By.id('name')),
                    user.name
                );
                await clearAndEnter(
                    await driver.findElement(By.id('phone')),
                    user.phone
                );
                await driver.findElement(By.id('submit-btn')).click();

                const alertElement = await driver.wait(
                    until.elementLocated(By.className('alert')),
                    5000
                );

                const alertText = await alertElement.getAttribute('innerHTML');
                console.log('Booking response: ' + alertText);

                const alertAttribute = (
                    await alertElement.getAttribute('class')
                ).split(' ');
                if (
                    alertAttribute.includes('alert-success') ||
                    alertAttribute.includes('alert-warning')
                ) {
                    console.log('Appointment booked successfully');
                    await driver.quit();
                    break;
                }
                console.log('Appointment booking failed');
                timeslot = null;
            } catch (err) {
                timeslot = null;
                console.error(errorMessages[err.name] ?? err);
            } finally {
                try {
                    await driver.findElement(By.className('close-btn')).click();
                    await sleep(250);
                } catch (_) {}
            }
        }
        if (timeslot) {
            break;
        }
    }
};

const sleep = async (ms) => new Promise((r) => setTimeout(r, 1000));
const clearAndEnter = async (element, text) => {
    await element.clear();
    await element.sendKeys(text);
};
/**
 * Accepts the cookies on the Berberaj website.
 * @param {import('selenium-webdriver').WebDriver} driver - The Selenium WebDriver instance.
 */
const acceptCookies = async (driver) => {
    try {
        console.log('Waiting for cookies info box to appear...');
        const cookieInfoElement = await driver.findElement(
            By.id('cookie-info')
        );
        await driver.wait(until.elementIsVisible(cookieInfoElement), 20000);
        console.log('Trying to accept cookies...');
        await driver.findElement(By.id('closes-cookie-info')).click();
        console.log('Accepted cookies');
    } catch (error) {
        console.log('Unable to find accept cookies button');
        console.error(error);
    }
};

(async () => {
    const driver = await new Builder().forBrowser(config.browser).build();
    await driver.get(BARBERSHOP_URL);
    employees = await getEmployees(driver);

    barber.name = barber.name.toUpperCase();
    let currentHour = new Date().getHours();

    await acceptCookies(driver);

    if (currentHour < 9 || currentHour > 20) {
        schedule.scheduleJob('9 * * *', async () => {
            await bookAppointment(driver);
        });
        console.log('Scheduled job for 9am');
    } else await bookAppointment(driver);
})();
