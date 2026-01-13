function makeGlobalMap(info)
{
	const moduleMap = new Map();
	info.forEach((entry) => 
		{
			const startTime = parseInt(entry.time.split(":")[0]);
			const endTime = parseInt(entry.time.split(" - ")[1].split(":")[0]);
			let map = moduleMap;
			['mod', 'group'].forEach((title) =>
				{
					let tempMap;
					if (!(tempMap = map.get(entry[title])))
					{
						tempMap = new Map();
						map.set(entry[title], tempMap);
					}
					map = tempMap;
				}
			);

			const { mod, group, act, time, ...rest } = entry;
			if (!(storedEntry = map.get(entry.act)))
				map.set(entry.act, {...rest, venue: [rest.venue], chosenTimes: [], sTime: startTime, eTime: endTime});
			else
				storedEntry.venue.push(entry.venue);


			/*
			for (let i = startTime; i < endTime; i++)
			{
				if (!(storedEntry = map.get(i))) // map === timeMap
				{
					const { mod, group, act, day, time, ...rest } = entry;
					map.set(i, {...rest, venue: [rest.venue], chosen: false});
				}
				else
				{
					storedEntry.venue.push(entry.venue);
				}
			}
			*/
		}
	);

	return moduleMap;
}

function getInfoText(info)
{
	const {campus, lang, sem} = info;
	return Object.values({campus, lang, sem }).join(", ") + "\n" + info.venue.join(", ");
}

function createInfoTable(moduleMap)
{
	const infoTbl = document.querySelector('#info');
	const head = document.createElement('tr');
	['mod', 'group', 'act', 'info'].forEach((title) =>
		{
			const label = document.createElement('th');
			label.textContent = title;
			head.appendChild(label);
		}
	);
	infoTbl.appendChild(head);

	moduleMap.forEach((groupMap, mod) =>
		{
			const modCell = document.createElement('td');
			modCell.textContent = mod;
			const modRow = document.createElement('tr');
			modRow.dataset.mod = mod;
			modRow.dataset.group = "";
			modRow.dataset.act = "";
			modRow.appendChild(modCell);
			infoTbl.appendChild(modRow);
			groupMap.forEach((activityMap, group) =>
				{
					const groupCell = document.createElement('td');
					groupCell.textContent = group;
					const groupRow = document.createElement('tr');
					groupRow.appendChild(document.createElement('td'));
					groupRow.dataset.mod = mod;
					groupRow.dataset.group = group;
					groupRow.dataset.act = "";
					groupRow.appendChild(groupCell);
					infoTbl.appendChild(groupRow);
					activityMap.forEach((info, act) =>
						{
							const actCell = document.createElement('td');
							actCell.textContent = act;
							const actInfo = document.createElement('td');
							actInfo.innerText = getInfoText(info);
							const actRow = document.createElement('tr');
							actRow.dataset.mod = mod;
							actRow.dataset.group = group;
							actRow.dataset.act = act;
							actRow.appendChild(document.createElement('td')); // padding
							actRow.appendChild(document.createElement('td'));
							actRow.appendChild(actCell);
							actRow.appendChild(actInfo);
							infoTbl.appendChild(actRow);


						}
					);
				}
			);
		}
	);
}

function createScheduleTable()
{
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
		const headings = ['Time', ...days];
		const times = [];
		for (let i = 7; i < 17; i++)
		{
			times.push(i);
		}
		const tbl = document.querySelector('#schedule');
		const head = document.createElement('tr');
		headings.forEach((day) =>
			{
				const label = document.createElement('th');
				label.textContent = day;
				head.appendChild(label);
			}
		)
		tbl.appendChild(head);
		times.forEach((time) =>
			{
				const row = document.createElement('tr');
				row.dataset.name = time;
				const label = document.createElement('th');
				label.textContent = time + ":30";
				row.appendChild(label);
				days.forEach((day) =>
					{
						const dayLabel = document.createElement('td');
						dayLabel.dataset.name = day;
						row.appendChild(dayLabel);
					}
				)
				tbl.appendChild(row);
			}
		)


	return tbl;
}

function createButtons(moduleMap, table)
{
	const colorMap = new Map();
	let i = 0;
	const colors = ["#5F4690","#1D6996","#38A6A5","#0F8554","#73AF48","#EDAD08","#E17C05","#CC503E","#94346E","#6F4070","#994E95","#666666"];
	const colorKey = "_color_";

	moduleMap.forEach((groupMap, mod) =>
		{
			// set color
			let color = groupMap.get(colorKey);
			if (!color)
			{
				color = colors[i++%colors.length];
				groupMap.set(colorKey, color);
			}
			document.querySelectorAll(`[data-mod="${mod}"]`).forEach((el) => el.style.backgroundColor = color);
			groupMap.forEach((activityMap, group) =>
				{
					if (group === colorKey) return;
					const groupButtons = [];
					activityMap.forEach((info, act) =>
						{
							for (let time = info.sTime; time < info.eTime; time++)
							{

							const cell = table.querySelector(`[data-name="${time}"`).querySelector(`[data-name="${info.day}"]`);
							const butt = document.createElement("button");
							butt.innerHTML = mod + "&nbsp" + group + "&nbsp" + act;
							const { campus, lang, sem } = info;
							const infoText = getInfoText(info);
							butt.title = infoText;
							butt.style.backgroundColor = color;
							butt.info = info;
							butt.time = time;

							groupButtons.push(butt);

							const activityInfos = document.querySelector(`[data-mod="${mod}"][data-group="${group}"][data-act="${act}"]`);
							const groupInfos = document.querySelector(`[data-mod="${mod}"][data-group="${group}"][data-act=""]`);
							const modInfos = document.querySelector(`[data-mod="${mod}"][data-group=""][data-act=""]`);

							const elements = [activityInfos, groupInfos, modInfos];

							butt.addEventListener("mouseover", () =>
								{
									elements.forEach((el) => el.style.backgroundColor = 'red');
									groupButtons.forEach((button) => 
										{
											if (!button.info.chosenTimes.includes(button.time))
												button.style.backgroundColor = 'red';
										});
								}
							);
							butt.addEventListener("mouseout", () =>
								{

									let anyTimesChosen = false;

									groupButtons.forEach((button) => 
										{
											if (!button.info.chosenTimes.includes(button.time))
											{
												button.style.backgroundColor = color;
											}
											else
											{
												anyTimesChosen = true;
												button.style.backgroundColor = 'gold';
											}
											if (butt.info.chosenTimes.length === 0)
												activityInfos.style.backgroundColor = color;
											else
												activityInfos.style.backgroundColor = 'gold';

										});
									if (!anyTimesChosen)
										elements.filter((el) => el !== activityInfos).forEach((el) => el.style.backgroundColor = color);
									else
										elements.filter((el) => el !== activityInfos).forEach((el) => el.style.backgroundColor = 'gold');
								}
							);
							butt.addEventListener("click", () =>
								{
									if (info.chosenTimes.includes(time))
									{
										butt.style.backgroundColor = 'red';
										//elements.forEach((el) => el.style.backgroundColor = 'red');
										butt.info.chosenTimes = info.chosenTimes.filter((chosenTime) => chosenTime != time);
									}
									else
									{
										butt.style.backgroundColor = 'gold';
										elements.forEach((el) => el.style.backgroundColor = 'gold');
										butt.info.chosenTimes.push(time);
									}
								}
							);
							cell.appendChild(butt);
							}
			}
					);
				}
			);
		}
	);

	/*
	map.forEach((value, key) =>
		{
			const { mod, group } = value;
			const id = JSON.stringify({mod, group });
			const val = colorMap.get(id);
			if (!val)
			{
				colorMap.set(id, colors[i++%colors.length]);
			}
			const { campus, lang, venue } = value;
			butt.title = Object.values({ campus, lang, venue }).join(", ");
			butt.style.backgroundColor = colorMap.get(id);
			butt.style.color = 'white';

			butt.addEventListener('mouseover', () => butt.style.border = '2px solid red');
			
			butt.addEventListener('click', () =>
				{
					if (value.chosen)
					{
						butt.style.backgroundColor = colorMap.get(id);
						butt.style.color = 'white';
					}
					else
					{
						butt.style.backgroundColor = 'transparent';
						butt.style.color = 'black';
					}
					value.chosen = !value.chosen;
				}
			);
			cell.appendChild(butt);
		}
	);
	*/
}

(async function() 
	{
		chrome.tabs.getCurrent(async (tab) => 
			{
				if (!tab)
				{
					await chrome.tabs.create({url: chrome.runtime.getURL("index.html")});
				}
				else
				{
					const res = await chrome.runtime.sendMessage(null);
					const map = makeGlobalMap(res);
					createInfoTable(map);
					const tbl = createScheduleTable();
					createButtons(map, tbl);
				}
		});


		/*
		map.forEach((value, key) =>
			{
				const val = JSON.parse(key);

				const butt = document.createElement("button");
				butt.innerText = val.name + "" + val.activity + "" + val.group;
				const { campus, language, venues } = value;
				butt.title = Object.values({ campus, language, venues }).join(", ");
				butt.addEventListener('click', () =>
					{
						if (value.chosen)
						{
							butt.style.backgroundColor="transparent";
						}
						else
						{
							butt.style.backgroundColor="red";
						}
						value.chosen = !value.chosen;
					}
				);
				el.appendChild(butt);
				console.log(value);
				console.log(key);
				console.log(el);
			}
		);
		console.log(document.documentElement.outerHTML);
		*/
	}
)();
