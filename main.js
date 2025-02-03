const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const superagent = require("superagent");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 1000,
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(`${__dirname}/html/index.html`);
  win.setMenuBarVisibility(false);
};

const pageObject = fs.readFileSync(`${__dirname}/html/index.html`, "utf-8");

function replaceImage(page, value) {
  let output = pageObject.replace(/{%LINK%}/g, value);
  //output = output.replace(`value="${value}"`, `${value} selected`);
  //let newRegEx = new RegExp(`value="` + value + `"`, "g");
  //output = output.replace(newRegEx, newRegEx + `${value}`);
  return output;
}

ipcMain.on("selected-value", (event, selectedValue) => {
  console.log(`Recieved ${selectedValue} in main thread`);

  const activeWin = BrowserWindow.getFocusedWindow();
  if (activeWin) {
    //const newPage = replaceImage(pageObject, selectedValue);
    superagent
      .get(`https://dog.ceo/api/breed/${selectedValue}/images/random`)
      .then((res) => {
        let newPageObject = replaceImage(pageObject, res.body.message);
        newPageObject = newPageObject.replace(
          `value="${selectedValue}"`,
          `value="${selectedValue}" selected`
        );
        fs.writeFileSync(`${__dirname}/html/new-page.html`, newPageObject);

        activeWin.loadFile(`${__dirname}/html/new-page.html`);
      })
      .catch((err) => {
        console.log(err.message);
      });

    //activeWin.reload;
    //app.quit;
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// const fs = require("fs");
// const superagent = require("superagent");

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       console.log(res.body.message);

//       fs.writeFile("dog-img.txt", res.body.message, (err) => {
//         if (err) return console.log(err.message);
//         console.log("Random Dog Image Saved to File!");
//       });
//     }).catch(err => {
//         console.log(err.message);
//     })
// });
