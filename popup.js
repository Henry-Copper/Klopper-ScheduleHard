const moduleMap = new Map();

const hoverColor = "red";
const selectedColor = "gold";
const moduleColors = [
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

function makeGlobalMap(info) {
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

  let i = 0;

  moduleMap.forEach((groupMap, mod) => {
    if (mod.startsWith("_")) return;
    groupMap.set("_moduleEvent_", []);
    groupMap.set("_numSelected_", 0);
    groupMap.set("_color_", moduleColors[i++ % moduleColors.length]);
    groupMap.forEach((activityMap, group) => {
      if (group.startsWith("_")) return;
      activityMap.set("_groupEvent_", []);
      activityMap.set("_numSelected_", 0);
      activityMap.forEach((info, act) => {
        info["_activityEvent_"] = [];
      });
    });
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
    if (mod.startsWith("_")) return;

    const moduleColor = groupMap.get("_color_");

    const modCell = document.createElement("td");
    modCell.textContent = mod;
    const modRow = document.createElement("tr");
    modRow.style.backgroundColor = moduleColor;
    modRow.appendChild(modCell);
    infoTbl.appendChild(modRow);

    groupMap.get("_moduleEvent_").push((ev) => {
      const numChosenModule = groupMap.get("_numSelected_");
      switch (ev.type) {
        case "mouseover":
          if (numChosenModule === 0) modRow.style.backgroundColor = hoverColor;
          break;
        case "mouseout":
          if (numChosenModule === 0) modRow.style.backgroundColor = moduleColor;
          break;
        case "click":
          if (numChosenModule !== 0)
            modRow.style.backgroundColor = selectedColor;
          else modRow.style.backgroundColor = hoverColor;
      }
    });

    groupMap.forEach((activityMap, group) => {
      if (group.startsWith("_")) return;

      const groupCell = document.createElement("td");
      groupCell.textContent = group;
      const groupRow = document.createElement("tr");
      groupRow.appendChild(document.createElement("td"));
      groupRow.style.backgroundColor = moduleColor;
      groupRow.appendChild(groupCell);
      infoTbl.appendChild(groupRow);

      activityMap.get("_groupEvent_").push((ev) => {
        const numChosenGroup = activityMap.get("_numSelected_");
        switch (ev.type) {
          case "mouseover":
            if (numChosenGroup === 0)
              groupRow.style.backgroundColor = hoverColor;
            break;
          case "mouseout":
            if (numChosenGroup === 0)
              groupRow.style.backgroundColor = moduleColor;
            break;
          case "click":
            if (numChosenGroup !== 0)
              groupRow.style.backgroundColor = selectedColor;
            else groupRow.style.backgroundColor = hoverColor;
        }
      });

      activityMap.forEach((info, act) => {
        if (act.startsWith("_")) return;

        const actCell = document.createElement("td");
        actCell.textContent = act;
        const actInfo = document.createElement("td");
        actInfo.innerText = getInfoText(info);
        const actRow = document.createElement("tr");
        actRow.style.backgroundColor = moduleColor;

        activityMap.get("_groupEvent_").push((ev) => {
          const numChosenTimes = info.chosenTimes.length;
          switch (ev.type) {
            case "mouseover":
              if (numChosenTimes === 0)
                actRow.style.backgroundColor = hoverColor;
              break;
            case "mouseout":
              if (numChosenTimes === 0)
                actRow.style.backgroundColor = moduleColor;
              break;
          }
        });

        info["_activityEvent_"].push((ev) => {
          switch (ev.type) {
            case "click":
              if (info["chosenTimes"].length === 0)
                actRow.style.backgroundColor = hoverColor;
              else actRow.style.backgroundColor = selectedColor;
              break;
          }
        });
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
  moduleMap.forEach((groupMap, mod) => {
    if (mod.startsWith("_")) return;

    const moduleColor = groupMap.get("_color_");

    groupMap.forEach((activityMap, group) => {
      if (group.startsWith("_")) return;

      activityMap.forEach((info, act) => {
        if (act.startsWith("_")) return;

        for (let time = info.sTime; time < info.eTime; time++) {
          const cell = table
            .querySelector(`[data-name="${time}"`)
            .querySelector(`[data-name="${info.day}"]`);

          const butt = document.createElement("button");

          activityMap.get("_groupEvent_").push((ev) => {
            if (info.chosenTimes.includes(time)) return;
            switch (ev.type) {
              case "mouseover":
                butt.style.backgroundColor = hoverColor;
                break;
              case "mouseout":
                butt.style.backgroundColor = moduleColor;
                break;
            }
          });

          butt.innerHTML = mod + "&nbsp" + group + "&nbsp" + act;
          butt.title = getInfoText(info);
          butt.style.backgroundColor = moduleColor;

          butt.addEventListener("mouseover", (ev) => {
            groupMap.get("_moduleEvent_").forEach((f) => f(ev));
            activityMap.get("_groupEvent_").forEach((f) => f(ev));
            info["_activityEvent_"].forEach((f) => f(ev));
          });
          butt.addEventListener("mouseout", (ev) => {
            groupMap.get("_moduleEvent_").forEach((f) => f(ev));
            activityMap.get("_groupEvent_").forEach((f) => f(ev));
            info["_activityEvent_"].forEach((f) => f(ev));
          });
          butt.addEventListener("click", (ev) => {
            const chosenTimes = info["chosenTimes"];
            if (chosenTimes.includes(time)) {
              butt.style.backgroundColor = hoverColor; // it is necessarily being hovered if clicked
              info["chosenTimes"] = chosenTimes.filter((t) => t !== time);
              activityMap.set(
                "_numSelected_",
                activityMap.get("_numSelected_") - 1,
              );
              groupMap.set("_numSelected_", groupMap.get("_numSelected_") - 1);
            } else {
              butt.style.backgroundColor = selectedColor;
              chosenTimes.push(time);
              activityMap.set(
                "_numSelected_",
                activityMap.get("_numSelected_") + 1,
              );
              groupMap.set("_numSelected_", groupMap.get("_numSelected_") + 1);
            }
            groupMap.get("_moduleEvent_").forEach((f) => f(ev));
            activityMap.get("_groupEvent_").forEach((f) => f(ev));
            info["_activityEvent_"].forEach((f) => f(ev));
          });

          cell.appendChild(butt);
        }
      });
    });
  });
}

(async function () {
  const res = await chrome.runtime.sendMessage(null);
  const map = makeGlobalMap(res);
  const tbl = createScheduleTable();
  createInfoTable(map);
  createButtons(map, tbl);
  document
    .querySelector("#print")
    .addEventListener("click", () => window.print());
})();
