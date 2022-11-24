const { Builder, By } = require("selenium-webdriver");
require("chromedriver");

const barberId = "7"; // Id 7 je Sale
const email = ""; // popuni email
const name = ""; // popuni ime
const phone = ""; // popuni telefon

const timeslots = ["15:00", "14:00"];

const MAX_MINUTES_TO_WAIT = 60;

(async function execute() {
  const driver = await new Builder().forBrowser("chrome").build();
  let timeslot;
  try {
    await driver.get("https://berberaj.rs");
    const el = await driver.findElement(
      By.css(`div[data-employee-id-no="${barberId}"]`)
    );

    // Time out after an hour
    setTimeout(async () => {
      console.log("Nije se pojavio nijedan termin");
      await driver.quit();
      process.exit();
    }, MAX_MINUTES_TO_WAIT * 60000);

    while (true) {
      // Wait until 'Nema slobodnih termina.' is gone
      try {
        await el.findElement(
          By.xpath(`.//*[text()[contains(.,'Nema slobodnih termina.')]]`)
        );
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        //NoSuchElement error is thrown => 'Nema slobodnih termina.' is gone => timeslots have appeared
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
          await driver.findElement(By.id("email")).sendKeys(email);
          await driver.findElement(By.id("name")).sendKeys(name);
          await driver.findElement(By.id("phone")).sendKeys(phone);
          await driver.findElement(By.id("submit-btn")).click();
          console.log(`Termin zakazan u ${timeslot}`);
        } else {
          console.log("Svi izabrani termini su zauzeti");
        }
      }
    }
  } finally {
    await driver.quit();
  }
})();
