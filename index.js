const { Builder, By } = require('selenium-webdriver');
require('chromedriver');

const schedule = require('node-schedule');

const barber = {
    name: 'Dragoljub',
    id: '13', // fallback if name is not found
};

const user = {
    email: 'your-email@gmail.com',
    name: 'Your Name',
    phone: 'Your Number',
};

const timeslots = ['16:00', '16:30', '15:30'];

const MAX_MINUTES_TO_WAIT = 60;

const LOCATION = 'centar';

let employees = {};

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
        console.log('Unable to find employee names');
    }
};

const getBarber = async (driver, id) => {
    return await driver.findElement(By.css(`div[data-employee-id-no="${id}"]`));
};

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
                await el
                    .findElement(
                        By.xpath(`.//*[text()[contains(.,'${timeslots[i]}')]]`)
                    )
                    .click();
                timeslot = timeslots[i];
                break;
            } catch (_) {}
        }
        if (timeslot) {
            await driver.findElement(By.id('email')).sendKeys(user.email);
            await driver.findElement(By.id('name')).sendKeys(user.name);
            await driver.findElement(By.id('phone')).sendKeys(user.phone);
            await driver.findElement(By.id('submit-btn')).click();
            console.log(`Termin zakazan u ${timeslot}`);
            break;
        } else await new Promise((r) => setTimeout(r, 1000));
    }
};

(async () => {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(`https://berberaj.rs/${LOCATION}`);
    employees = await getEmployees(driver);

    barber.name = barber.name.toUpperCase();
    console.log(barber.name);

    let currentHour = new Date().getHours();

    if (currentHour < 9 || currentHour > 20) {
        schedule.scheduleJob('9 * * *', async () => {
            console.log('hello njorld');
            await bookAppointment(driver);
        });
        console.log('Scheduled job for 9am');
    } else await bookAppointment(driver);
})();
