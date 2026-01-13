(function () {
  let tbl = document.getElementById("win0divUP_ML_TABLES_HTMLAREA");
  if (!tbl) {
    alert("Please select Semester 1 or Semester 2 schedule.");
    return null;
  }
  const contentRows = Array.from(tbl.querySelectorAll("tr")).slice(1);
  const res = [];
  contentRows.forEach((row) => {
    const entries = row.querySelectorAll("td");
    const singleEntryTitles = ["mod", "sem", "group", "lang", "campus"];
    const multiEntryTitles = ["act", "day", "time", "venue"];
    const titlePositions = [
      "mod",
      "sem",
      "group",
      "lang",
      "act",
      "day",
      "time",
      "venue",
      "campus",
    ]; // has the right index for each title
    const singleEntries = {};
    const multipleEntries = {};
    singleEntryTitles.forEach((title) => {
      singleEntries[title] =
        entries[titlePositions.indexOf(title)].textContent.trim();
    });
    singleEntries["mod"] = singleEntries["mod"].replace(" ", "");
    multiEntryTitles.forEach((title) => {
      multipleEntries[title] = entries[titlePositions.indexOf(title)].innerHTML
        .split("<br>")
        .map((content) => content.trim());
    });
    multipleEntries["act"].forEach((value, i) => {
      const tempObj = {};
      multiEntryTitles.forEach(
        (title) => (tempObj[title] = multipleEntries[title][i]),
      );
      res.push({ ...tempObj, ...singleEntries });
    });
  });
  return res;
})();
