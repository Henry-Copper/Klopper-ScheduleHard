function makeGlobalMap(info) {
  const moduleMap = new Map();
  info.forEach((entry) => {
    const startTime = parseInt(entry.time.split(":")[0]);
    const endTime = parseInt(entry.time.split(" - ")[1].split(":")[0]);
    let map = moduleMap;
    ["mod", "group"].forEach((title) => {
      let tempMap;
      if (!(tempMap = map.get(entry[title]))) {
        tempMap = new Map();
        map.set(entry[title], tempMap);
      }
      map = tempMap;
    });

    const { mod, group, act, time, ...rest } = entry;
    if (!(storedEntry = map.get(entry.act)))
      map.set(entry.act, {
        ...rest,
        venue: [rest.venue],
        chosenTimes: [],
        sTime: startTime,
        eTime: endTime,
      });
    else storedEntry.venue.push(entry.venue);
  });

  return moduleMap;
}

function getInfoText(info) {
  const { campus, lang, sem } = info;
  return (
    Object.values({ campus, lang, sem }).join(", ") +
    "\n" +
    info.venue.join(", ")
  );
}

function createInfoTable(moduleMap) {
  const infoTbl = document.querySelector("#info");
  const head = document.createElement("tr");
  ["mod", "group", "act", "info"].forEach((title) => {
    const label = document.createElement("th");
    label.textContent = title;
    head.appendChild(label);
  });
  infoTbl.appendChild(head);

  moduleMap.forEach((groupMap, mod) => {
    const modCell = document.createElement("td");
    modCell.textContent = mod;
    const modRow = document.createElement("tr");
    modRow.dataset.mod = mod;
    modRow.dataset.group = "";
    modRow.appendChild(modCell);
    infoTbl.appendChild(modRow);
    groupMap.forEach((activityMap, group) => {
      const groupCell = document.createElement("td");
      groupCell.textContent = group;
      const groupRow = document.createElement("tr");
      groupRow.appendChild(document.createElement("td"));
      groupRow.dataset.mod = mod;
      groupRow.dataset.group = group;
      groupRow.dataset.act = "";
      groupRow.appendChild(groupCell);
      infoTbl.appendChild(groupRow);
      activityMap.forEach((info, act) => {
        const actCell = document.createElement("td");
        actCell.textContent = act;
        const actInfo = document.createElement("td");
        actInfo.innerText = getInfoText(info);
        const actRow = document.createElement("tr");
        actRow.dataset.mod = mod;
        actRow.dataset.group = group;
        actRow.dataset.act = act;
        actRow.dataset.time = "";
        actRow.appendChild(document.createElement("td")); // padding
        actRow.appendChild(document.createElement("td"));
        actRow.appendChild(actCell);
        actRow.appendChild(actInfo);
        infoTbl.appendChild(actRow);
      });
    });
  });
}

function createScheduleTable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const headings = ["Time", ...days];
  const times = [];
  for (let i = 7; i < 17; i++) {
    times.push(i);
  }
  const tbl = document.querySelector("#schedule");
  const head = document.createElement("tr");
  headings.forEach((day) => {
    const label = document.createElement("th");
    label.textContent = day;
    head.appendChild(label);
  });
  tbl.appendChild(head);
  times.forEach((time) => {
    const row = document.createElement("tr");
    row.dataset.name = time;
    const label = document.createElement("th");
    label.textContent = time + ":30";
    row.appendChild(label);
    days.forEach((day) => {
      const dayLabel = document.createElement("td");
      dayLabel.dataset.name = day;
      row.appendChild(dayLabel);
    });
    tbl.appendChild(row);
  });

  return tbl;
}

function createButtons(moduleMap, table) {
  const colorMap = new Map();
  let i = 0;
  const colors = [
    "#5F4690",
    "#1D6996",
    "#38A6A5",
    "#0F8554",
    "#73AF48",
    "#EDAD08",
    "#E17C05",
    "#CC503E",
    "#94346E",
    "#6F4070",
    "#994E95",
    "#666666",
  ];
  const colorKey = "_color_";
  const hoverColor = "red";
  const selectedColor = "gold";

  moduleMap.forEach((groupMap, mod) => {
    let color = groupMap.get(colorKey);
    if (!color) {
      color = colors[i++ % colors.length];
      groupMap.set(colorKey, color);
    }
    let moduleRow = document.querySelector(`[data-mod=${mod}][data-group=""]`);
    moduleRow.dataset.numSelected = "0";
    groupMap.forEach((activityMap, group) => {
      if (group === colorKey) return;
      let groupRow = document.querySelector(
        `[data-mod="${mod}"][data-group="${group}"][data-act=""]`,
      );
      groupRow.dataset.numSelected = "0";
      activityMap.forEach((info, act) => {
        for (let time = info.sTime; time < info.eTime; time++) {
          const cell = table
            .querySelector(`[data-name="${time}"`)
            .querySelector(`[data-name="${info.day}"]`);
          const butt = document.createElement("button");
          butt.innerHTML = mod + "&nbsp" + group + "&nbsp" + act;
          butt.title = getInfoText(info);
          butt.dataset.mod = mod;
          butt.dataset.group = group;
          butt.dataset.act = act;
          butt.dataset.time = time;

          let groupElements = undefined;
          butt.addEventListener("mouseover", () => {
            if (!groupElements)
              groupElements = document.querySelectorAll(
                `:is([data-mod=${mod}][data-group="${group}"], [data-mod=${mod}][data-group=""])`,
              );
            Array.from(groupElements)
              .filter((el) => el.style.backgroundColor != selectedColor)
              .forEach((el) => (el.style.backgroundColor = hoverColor));
          });

          butt.addEventListener("mouseout", () => {
            Array.from(groupElements)
              .filter((el) => el.style.backgroundColor != selectedColor)
              .forEach((el) => (el.style.backgroundColor = color));
          });

          let activityRow = document.querySelector(
            `[data-mod=${mod}][data-group="${group}"][data-act="${act}"][data-time=""]`,
          );
          activityRow.dataset.numSelected = "0";

          let affectedRows = [activityRow, groupRow, moduleRow];

          butt.addEventListener("click", () => {
            if (info.chosenTimes.includes(time)) {
              info.chosenTimes = info.chosenTimes.filter(
                (chosenTime) => chosenTime != time,
              );
              butt.style.backgroundColor = hoverColor;
              affectedRows.forEach(
                (row) =>
                  (row.dataset.numSelected =
                    parseInt(row.dataset.numSelected) - 1),
              );
            } else {
              info.chosenTimes.push(time);
              butt.style.backgroundColor = selectedColor;
              affectedRows.forEach(
                (row) =>
                  (row.dataset.numSelected =
                    parseInt(row.dataset.numSelected) + 1),
              );
            }

            affectedRows.forEach((row) => {
              if (row.dataset.numSelected === "0")
                row.style.backgroundColor = hoverColor;
              else row.style.backgroundColor = selectedColor;
            });
          });
          cell.appendChild(butt);
        }
      });
      document
        .querySelectorAll(`[data-mod="${mod}"]`)
        .forEach((el) => (el.style.backgroundColor = color));
    });
  });
}

(async function () {
  const res = await chrome.runtime.sendMessage(null);
  const map = makeGlobalMap(res);
  createInfoTable(map);
  const tbl = createScheduleTable();
  createButtons(map, tbl);
  document
    .querySelector("#print")
    .addEventListener("click", () => window.print());
})();
